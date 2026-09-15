"""Verified LDS Conference multi-format publisher; no blind repost retries."""
import json,logging,os,tempfile,uuid
from datetime import datetime,timedelta,timezone
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
from google.api_core.exceptions import AlreadyExists
from google.cloud import firestore
from buffer_handler import BufferHandler
from content import kind_for,generate,caption
from source import select,fetch
from nature import choose,download
from media import render
from host import MediaHost

PROJECT='social-media-automation-5c9db'

def notify(message):
    try:
        response=requests.post(os.environ['SLACK_WEBHOOK_URL'],json={'text':'LDS Conferences\n'+message},timeout=20)
        if response.status_code!=200:raise RuntimeError('Slack rejected notification')
    except requests.RequestException:raise RuntimeError('Slack transport failed') from None

def reconcile(db,buffer):
    for snap in db.collection('conferencePublishingRuns').where(filter=firestore.FieldFilter('status','==','submitted')).limit(12).stream():
        data=snap.to_dict();result=buffer._graphql('query { post(input: {id: '+json.dumps(data['postId'])+'}) { id status } }')
        state=result['post']['status'];changes={'deliveryState':state,'checkedAt':firestore.SERVER_TIMESTAMP}
        if state=='sent':changes['status']='sent';notify('Delivery confirmed: '+snap.id+' ('+data['format']+').')
        elif state in ('failed','error','notSent'):changes['status']='delivery_failed';notify('ERROR: Buffer delivery failed for '+snap.id+'. No automatic repost.')
        elif datetime.now(timezone.utc)-data['createdAt']>timedelta(hours=24):notify('ATTENTION: delivery unconfirmed after 24 hours: '+snap.id)
        snap.reference.update(changes)

def claim_recovery(db,ref):
    transaction=db.transaction()
    @firestore.transactional
    def claim(tx):
        snap=ref.get(transaction=tx);current=snap.to_dict() or {}
        if not snap.exists or current.get('status')!='needs_attention' or current.get('dryRun') is True:
            raise RuntimeError('Recovery requires an existing needs_attention run')
        if current.get('postId') or current.get('bufferStatus') or current.get('sending'):
            raise RuntimeError('Recovery refused: Buffer submission may already exist')
        attempt=ref.collection('attempts').document(uuid.uuid4().hex)
        tx.create(attempt,{'previousStatus':current.get('status'),'errorType':current.get('errorType'),
          'errorMessage':current.get('errorMessage'),'startedAt':firestore.SERVER_TIMESTAMP})
        tx.update(ref,{'status':'preparing','errorType':firestore.DELETE_FIELD,
          'errorMessage':firestore.DELETE_FIELD,'recoveryAttempt':attempt.id,
          'recoveryStartedAt':firestore.SERVER_TIMESTAMP})
        return True
    return claim(transaction)

def run():
    logging.basicConfig(level=logging.INFO)
    db=firestore.Client(project=PROJECT);day=datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).date()
    dry=os.environ.get('DRY_RUN','false').lower()=='true';kind=kind_for(day,os.environ.get('CONFERENCE_FORMAT'),dry)
    run_id=f'dry-{day}-{kind}-{uuid.uuid4().hex[:8]}' if dry else day.isoformat()
    ref=db.collection('conferencePublishingRuns').document(run_id);acquired=False
    try:
        reconcile_only=os.environ.get('CONFERENCE_RECONCILE_ONLY')=='true'
        recover=os.environ.get('CONFERENCE_RECOVER_NEEDS_ATTENTION')=='true'
        if recover and (dry or run_id.startswith('dry-')):raise RuntimeError('Recovery is live-only')
        required=['BUFFER_ACCESS_TOKEN','BUFFER_CHANNEL_ID','SLACK_WEBHOOK_URL']
        if not reconcile_only:
            required.extend(['GITHUB_TOKEN','GITHUB_MEDIA_REPO','MEDIA_BUCKET','ANTHROPIC_API_KEY'])
            if kind=='reel':required.append('PEXELS_API_KEY')
        missing=[key for key in required if not os.environ.get(key,'').strip()]
        if missing:raise RuntimeError('Missing required runtime configuration: '+', '.join(missing))
        buffer=BufferHandler()
        if not buffer.channel_id:raise RuntimeError('Explicit Conference Buffer channel required')
        policy=db.collection('contentStrategies').document('lds-conference').get().to_dict() or {}
        if reconcile_only:
            reconcile(db,buffer);current=db.collection('conferencePublishingRuns').document(day.isoformat()).get().to_dict() or {}
            now=datetime.now(ZoneInfo('Asia/Kuala_Lumpur'))
            expected=tuple(int(value) for value in os.environ.get('CONFERENCE_EXPECTED_BY','04:50').split(':',1))
            if (now.hour,now.minute)>=expected and policy.get('multiformatEnabled'):
                if not current:notify('ERROR: daily run is missing: '+str(day)+'. No automatic repost.')
                elif current.get('status') in ('preparing','ready','sending','needs_attention'):
                    notify('ERROR: daily run is incomplete: '+str(day)+' ('+current['status']+'). No automatic repost.')
            return 0
        if not dry:
            stream=db.collection('streams').document('lds-conference').get().to_dict() or {}
            if not stream.get('enabled') or not stream.get('autoPublish'):print('Conference stream is paused');return 0
            if not policy.get('multiformatEnabled'):raise RuntimeError('Conference multiformat strategy is not enabled')
        if recover:acquired=claim_recovery(db,ref)
        else:
            try:
                ref.create({'status':'preparing','dryRun':dry,'format':kind,'image':os.environ.get('PUBLISHER_IMAGE','local'),'createdAt':firestore.SERVER_TIMESTAMP})
                acquired=True
            except AlreadyExists:
                print('Conference daily run already claimed; no duplicate');return 0
        source=fetch(os.environ['CONFERENCE_SOURCE_URL']) if dry and os.environ.get('CONFERENCE_SOURCE_URL') else select(db,day,policy.get('sourceUrls',[]))
        ref.update({'sourceUrl':source['url'],'sourceTitle':source['title'],'speaker':source['speaker']})
        data=generate(kind,source,ref);footage=None
        channels=buffer.get_channels()
        if not any(c['id']==buffer.channel_id and c['service'].lower()=='instagram' for c in channels):raise RuntimeError('Configured Conference Instagram channel is inaccessible')
        host=MediaHost();removed=host.cleanup(db)
        with tempfile.TemporaryDirectory(prefix='conference-') as temp:
            folder=Path(temp);footage_path=None
            if kind=='reel':
                footage=choose(db,os.environ['PEXELS_API_KEY'],run_id,dry);footage_path=folder/'source.mp4';download(footage['downloadUrl'],footage_path)
                ref.update({'footage':{k:v for k,v in footage.items() if k!='downloadUrl'}})
            paths=render(kind,data,folder,footage_path,footage)
            urls=[host.upload(path,run_id,i) for i,path in enumerate(paths)]
        post_caption=caption(data,source,footage)
        if len(post_caption)>2200:raise ValueError('Instagram caption exceeds 2200 characters')
        ref.update({'content':data,'caption':post_caption,'mediaUrls':urls,'status':'ready','cleanedAssets':removed})
        if dry:
            notify('DRY RUN passed: '+kind+'\n'+source['title']+'\n'+'\n'.join(urls)+'\n\n'+post_caption+'\n\nNo post created.')
            ref.update({'status':'dry_run_complete','slackVerified':True})
            if footage:db.document(footage['ref']).update({'status':'previewed'})
            return 0
        ref.update({'status':'sending','sending':True})
        kwargs={'video_url':urls[0]} if kind=='reel' else {'image_urls':urls} if kind=='carousel' else {'image_url':urls[0]}
        result=buffer.publish(caption=post_caption,**kwargs)
        ref.update({'status':'submitted','postId':result['id'],'bufferStatus':result.get('status')})
        if footage:db.document(footage['ref']).update({'status':'used','usedAt':firestore.SERVER_TIMESTAMP})
        notify('Accepted by Buffer: '+run_id+' ('+kind+'). Delivery confirmation is separate. Post ID: '+result['id'])
        reconcile(db,buffer);return 0
    except Exception as exc:
        error=type(exc).__name__
        if acquired:
            current=ref.get().to_dict() or {}
            if current.get('status') not in ('submitted','sent'):ref.update({'status':'needs_attention','errorType':error,'errorMessage':str(exc)[:200]})
        try:notify('ERROR: '+run_id+' failed ('+error+'). No blind retry or repost.')
        except Exception:print('Slack notification also failed')
        print('Conference failed:',error,str(exc)[:200]);return 1

if __name__=='__main__':raise SystemExit(run())
