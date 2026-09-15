"""Silent animated publisher; date-keyed claims and no uncertain retries."""
import json
import logging
import os
import tempfile
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
from google.api_core.exceptions import AlreadyExists
from google.cloud import firestore
from buffer_handler import BufferHandler
from content import KINDS, kind_for, generate, caption, validate, normalize
from media import render
from host import MediaHost

PROJECT = 'social-media-automation-5c9db'

def notify(text):
    try:
        r = requests.post(os.environ['SLACK_WEBHOOK_URL'],json={'text':'Beam\n'+text},timeout=20)
        if r.status_code!=200:
            raise RuntimeError('Slack rejected notification')
    except requests.RequestException:
        raise RuntimeError('Slack transport failed') from None

def reconcile(db, buffer):
    for snap in db.collection('beamPublishingRuns').where(filter=firestore.FieldFilter('status','==','submitted')).limit(12).stream():
        data = snap.to_dict()
        result = buffer._graphql('query { post(input: {id: '+json.dumps(data['postId'])+'}) { id status } }')
        state = result['post']['status']
        changes = {'deliveryState':state,'checkedAt':firestore.SERVER_TIMESTAMP}
        if state=='sent':
            notify('Delivery confirmed: '+snap.id+' ('+data['format']+').')
            changes['status']='sent'
        elif state in ('failed','error','notSent'):
            notify('ERROR: Buffer delivery failed for '+snap.id+'. No automatic repost.')
            changes['status']='delivery_failed'
        elif datetime.now(timezone.utc)-data['createdAt']>timedelta(hours=24):
            notify('ATTENTION: delivery unconfirmed after 24 hours: '+snap.id)
        snap.reference.update(changes)

def run():
    logging.basicConfig(level=logging.INFO)
    db = firestore.Client(project=PROJECT)
    day = datetime.now(ZoneInfo('Asia/Bangkok')).date()
    dry = os.environ.get('DRY_RUN','false').lower()=='true'
    override = os.environ.get('BEAM_FORMAT')
    kind = kind_for(day,override,dry)
    run_id = f'dry-{day}-{kind}-{uuid.uuid4().hex[:8]}' if dry else day.isoformat()
    ref = db.collection('beamPublishingRuns').document(run_id)
    acquired = False
    try:
        buffer = BufferHandler()
        if not buffer.channel_id:
            raise RuntimeError('Explicit Buffer channel required; no auto-discovery')
        policy = db.collection('contentStrategies').document('beam').get().to_dict() or {}
        if os.environ.get('BEAM_RECONCILE_ONLY')=='true':
            reconcile(db, buffer)
            current = db.collection('beamPublishingRuns').document(day.isoformat()).get().to_dict() or {}
            now=datetime.now(ZoneInfo('Asia/Bangkok'))
            expected=tuple(int(value) for value in os.environ.get('BEAM_EXPECTED_BY','03:40').split(':',1))
            if (now.hour,now.minute)>=expected and policy.get('animatedPublisherEnabled'):
                if not current:notify('ERROR: daily run is missing: '+str(day)+'. Inspect Cloud Run; no automatic repost.')
                elif current.get('status') in ('preparing','ready','sending','needs_attention'):
                    notify('ERROR: daily run is incomplete: '+str(day)+' ('+current['status']+'). Inspect Cloud Run; no automatic repost.')
            return 0
        if not dry and not policy.get('animatedPublisherEnabled'):
            raise RuntimeError('Animated publisher has not been activated')
        if not dry:
            stream=db.collection('streams').document('beam-learn-thai').get().to_dict() or {}
            if not stream.get('enabled') or not stream.get('autoPublish'):
                print('Beam stream is paused; no generation or posting')
                return 0
            from hashlib import sha256
            instant=datetime.combine(day,datetime.min.time(),ZoneInfo('Asia/Bangkok')).astimezone(timezone.utc).isoformat(timespec='seconds')
            legacy=db.collection('locks').document(sha256(f'beam-learn-thai:{instant}:daily'.encode()).hexdigest()).get()
            if legacy.exists:
                print('Legacy daily claim exists; skip cutover duplicate')
                return 0
        try:
            ref.create({'status':'preparing','dryRun':dry,'format':kind,'image':os.environ.get('PUBLISHER_IMAGE','local'),'createdAt':firestore.SERVER_TIMESTAMP})
            acquired = True
        except AlreadyExists:
            print('Daily run already claimed; no duplicate post or generation')
            return 0
        recent=[]
        for snap in db.collection('beamPublishingRuns').order_by('createdAt',direction=firestore.Query.DESCENDING).limit(30).stream():
            d=snap.to_dict()
            if d.get('dryRun') or not d.get('content'):continue
            recent.append({'title':d['content']['title'],'thai':d['content']['a']['thai']})
        source_id=os.environ.get('BEAM_VALIDATION_SOURCE')
        if source_id:
            if not dry:raise ValueError('Lesson replay is validation-only')
            source=db.collection('beamPublishingRuns').document(source_id).get().to_dict() or {}
            if not source.get('dryRun') or source.get('format')!=kind or source.get('languageReview')!={'approved':True,'issues':[]}:
                raise ValueError('Validation replay requires a reviewed dry-run lesson')
            post=validate(normalize(source.get('content',{})))
            ref.update({'validationSource':source_id,'languageReview':source['languageReview'],'usage':{'modelCalls':0}})
        else:
            post = generate(kind,day,recent,ref)
        text = caption(post)
        if len(text)>2200:raise ValueError('Caption exceeds Instagram limit')
        ref.update({'content':post,'caption':text})
        channels = buffer.get_channels()
        if not any(c['id']==buffer.channel_id and c['service'].lower()=='instagram' for c in channels):
            raise RuntimeError('Configured Instagram channel not accessible')
        host = MediaHost()
        removed = host.cleanup(db)
        with tempfile.TemporaryDirectory(prefix='beam-editorial-') as temp:
            folder = Path(temp)
            paths = render(kind,post,folder)
            urls = [host.upload(p,run_id,i) for i,p in enumerate(paths)]
            ref.update({'mediaUrls':urls,'status':'ready','cleanedAssets':removed})
        if dry:
            notify('DRY RUN passed: '+kind+'\n'+post['title']+'\n'+ '\n'.join(urls)+'\n\n'+text+'\n\nAI written-language review, rendering, public hosting and Buffer channel checks passed. Not native-certified. No post created.')
            ref.update({'status':'dry_run_complete','slackVerified':True})
            print('DRY RUN passed:',run_id)
            return 0
        # Persist BEFORE external mutation. Unknown outcomes require inspection.
        ref.update({'status':'sending','sending':True})
        kwargs = {'image_urls':urls} if kind=='carousel' else {'image_url':urls[0]}
        result = buffer.publish(caption=text, **kwargs)
        ref.update({'status':'submitted','postId':result['id'],'bufferStatus':result.get('status')})
        notify('Accepted by Buffer: '+run_id+' ('+kind+'). Delivery confirmation is separate. Post ID: '+result['id'])
        reconcile(db, buffer)
        return 0
    except Exception as exc:
        # Never log request URLs or credential-bearing exception strings.
        error = type(exc).__name__
        if acquired:
            current = ref.get().to_dict() or {}
            if current.get('status') not in ('submitted','sent'):
                ref.update({'status':'needs_attention','errorType':error})
        try:
            notify('ERROR: '+run_id+' failed ('+error+'). Inspect run/language-review state. No blind retry or repost.')
        except Exception:
            print('Slack notification also failed; inspect cloud execution')
        print('Beam failed:',error)
        return 1

if __name__=='__main__':
    raise SystemExit(run())
