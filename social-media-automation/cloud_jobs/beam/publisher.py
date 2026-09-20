"""Silent animated publisher; date-keyed claims and no uncertain retries."""
import json
import logging
import os
import re
import tempfile
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
from google.api_core.exceptions import AlreadyExists
from google.cloud import firestore
from buffer_handler import BufferHandler
from content import KINDS, kind_for, generate, caption, validate, validate_review_correction, normalize, final_review, decode
from media import render
from host import MediaHost

PROJECT = 'social-media-automation-5c9db'

def recover_failed_run(db, buffer, policy, source_id):
    """Publish one explicitly selected, previously rejected draft after fresh review."""
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',source_id):
        raise ValueError('Recovery requires an exact ISO date run ID')
    if not policy.get('animatedPublisherEnabled'):
        raise RuntimeError('Animated publisher has not been activated')
    stream=db.collection('streams').document('beam-learn-thai').get().to_dict() or {}
    if not stream.get('enabled') or not stream.get('autoPublish'):
        raise RuntimeError('Beam stream is paused; recovery was not published')

    source_ref=db.collection('beamPublishingRuns').document(source_id)
    source=source_ref.get().to_dict() or {}
    issues=(source.get('languageReview') or {}).get('issues')
    candidate=source.get('reviewedDraft')
    if (source.get('status')!='needs_attention' or source.get('dryRun') is not False
            or source.get('format') not in KINDS or source.get('postId')
            or source.get('content') or (source.get('languageReview') or {}).get('approved') is not False
            or not isinstance(issues,list) or not issues or not isinstance(candidate,dict)):
        raise RuntimeError('Source run is not an eligible unposted language-review failure')

    recovery_id=source_id+'-recovery'
    recovery_ref=db.collection('beamPublishingRuns').document(recovery_id)
    try:
        recovery_ref.create({'status':'reviewing','dryRun':False,'format':source['format'],
            'sourceRunId':source_id,'image':os.environ.get('PUBLISHER_IMAGE','local'),
            'createdAt':firestore.SERVER_TIMESTAMP})
    except AlreadyExists:
        print('Recovery already claimed; no duplicate review or post')
        return 0

    try:
        candidate=validate_review_correction(normalize(candidate))
        client=__import__('anthropic').Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'],
            max_retries=0,timeout=100)
        model=os.environ.get('ANTHROPIC_REVIEW_MODEL','claude-sonnet-4-6')
        response=final_review(client,model,source['format'],candidate,issues)
        verdict=decode(response)
        approved=(set(verdict)=={'approved','issues'} and verdict.get('approved') is True
                  and verdict.get('issues')==[])
        recovery_ref.update({'languageReview':{'approved':approved,'issues':verdict.get('issues')},
            'reviewedAt':firestore.SERVER_TIMESTAMP,
            'reviewUsage':response.usage.model_dump(exclude_none=True)})
        if not approved:
            recovery_ref.update({'status':'needs_attention'})
            notify('ERROR: Beam recovery '+recovery_id+' was stopped by the final language review. No post created.')
            return 1

        recent=[]
        for snap in db.collection('beamPublishingRuns').order_by(
                'createdAt',direction=firestore.Query.DESCENDING).limit(30).stream():
            data=snap.to_dict()
            if not data.get('dryRun') and data.get('content'):
                recent.append(data['content'].get('a',{}).get('thai'))
        if candidate['a']['thai'] in recent:
            raise ValueError('Corrected phrase appeared in recent Beam lessons')
        text=caption(candidate)
        if len(text)>2200:
            raise ValueError('Caption exceeds Instagram limit')

        channels=buffer.get_channels()
        channel=next((c for c in channels if c.get('id')==buffer.channel_id),None)
        if (not channel or channel.get('service','').lower()!='instagram'
                or channel.get('isDisconnected') or channel.get('isLocked')):
            raise RuntimeError('Configured Instagram channel is unavailable')

        host=MediaHost()
        removed=host.cleanup(db)
        with tempfile.TemporaryDirectory(prefix='beam-editorial-recovery-') as temp:
            paths=render(source['format'],candidate,Path(temp))
            urls=[host.upload(p,recovery_id,i) for i,p in enumerate(paths)]
        recovery_ref.update({'content':candidate,'caption':text,'mediaUrls':urls,
            'status':'ready','cleanedAssets':removed})
        # Persist before Buffer mutation: an uncertain response remains non-retryable.
        recovery_ref.update({'status':'sending','sending':True})
        kwargs={'image_urls':urls} if source['format']=='carousel' else {'image_url':urls[0]}
        result=buffer.publish(caption=text,**kwargs)
        recovery_ref.update({'status':'submitted','postId':result['id'],
            'bufferStatus':result.get('status')})
        source_ref.update({'recoveryRunId':recovery_id,'recoveryStatus':'submitted'})
        notify('Accepted by Buffer: Beam recovery '+recovery_id+' (Instagram '+source['format']+'). Delivery confirmation is separate. Post ID: '+result['id'])
        reconcile(db,buffer)
        return 0
    except Exception as exc:
        error=type(exc).__name__
        current=recovery_ref.get().to_dict() or {}
        if current.get('status') not in ('submitted','sent'):
            recovery_ref.update({'status':'needs_attention','errorType':error})
        try:
            notify('ERROR: Beam recovery '+recovery_id+' failed ('+error+'). No blind retry or repost.')
        except Exception:
            print('Slack notification also failed; inspect recovery execution')
        print('Beam recovery failed:',error)
        return 1

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
        recovery_source=os.environ.get('BEAM_RECOVER_RUN_ID')
        if recovery_source:
            return recover_failed_run(db,buffer,policy,recovery_source)
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
