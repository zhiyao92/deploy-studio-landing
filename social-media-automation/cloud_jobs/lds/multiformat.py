"""Cloud LDS Quotes publisher: one bounded run/day, with no blind repost retries."""
import hashlib
import json
import logging
import os
import re
import tempfile
import time
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
import anthropic
import requests
from google.cloud import firestore
from google.api_core.exceptions import AlreadyExists
from media_formats import card, reel
from nature_source import choose, download
from release_media import ReleaseMedia
from slack_handler import SlackHandler

PROJECT='social-media-automation-5c9db'
# Reels are intentionally retired after low observed reach. Keep a carousel-
# first mix that is useful on Instagram and degrades cleanly to static cards.
FORMATS=('carousel','single','carousel','single','carousel','single','carousel')
LOG=logging.getLogger('lds-multiformat')

def format_for(day, override=None, dry=False):
    if override and not dry:raise ValueError('Format overrides are dry-run only')
    result=override or FORMATS[day.weekday()]
    if result not in ('single','carousel','reel'):raise ValueError('Invalid format')
    return result

def validate_content(data,kind):
    expected={'single':1,'carousel':5,'reel':4}[kind]
    if not isinstance(data,dict) or not isinstance(data.get('slides'),list) or len(data['slides'])!=expected:raise ValueError('Wrong slide count')
    for text in data['slides']:
        if not isinstance(text,str) or not text.strip() or len(text)>150 or len(text.split())>26:raise ValueError('Invalid or oversized slide text')
    paragraphs=data.get('paragraphs')
    if not isinstance(paragraphs,list) or len(paragraphs)!=3:raise ValueError('Caption needs opening, reflection and one action')
    if any(not isinstance(p,str) or not p.strip() or len(p)>240 or re.search(r'[#*`]|https?://',p) for p in paragraphs):raise ValueError('Caption must be short plain paragraphs')
    tags=data.get('hashtags')
    if not isinstance(tags,list) or len(tags)!=5 or any(not isinstance(t,str) or not re.fullmatch(r'#[A-Za-z0-9]+',t) for t in tags):raise ValueError('Five valid hashtags required')
    if len({t.lower() for t in tags})!=5 or '#ldsquotes' not in [t.lower() for t in tags]:raise ValueError('Duplicate/missing brand hashtag')
    if 'attribution' in data:raise ValueError('Model must not invent attribution')
    return data

def normalize_content(data,kind):
    """Accept extra model ideas but never invent a missing slide."""
    expected={'single':1,'carousel':5,'reel':4}[kind]
    slides=data.get('slides') if isinstance(data,dict) else None
    if not isinstance(slides,list) or len(slides)<expected:raise ValueError('Not enough slides')
    data['slides']=slides[:expected]
    return data

def generate(kind,day):
    count={'single':1,'carousel':5,'reel':4}[kind]
    prompt=f'''Create original Christ-centered LDS Quotes devotional content for {day.isoformat()}, format {kind}.
Tone: warm, comforting, useful, sincere. No engagement bait, promises of cures, or app promotion.
These are ORIGINAL reflections: never pretend to quote scripture or any real person. No fabricated sources or statistics.
Topics rotate among prayer, hope, service, repentance, family, peace and daily discipleship. Do not default to mornings, waking up, or starting the day. Choose a fresh angle from: waiting for an answer, a private mistake, feeling overlooked, forgiving someone, quiet service, uncertainty, loneliness, gratitude, or a small courageous choice. Vary the hook form (direct empathy, surprising reframe, short question, contrast, or specific scene) and avoid repeating the previous day's wording or structure.
Return JSON only: {{"slides":[...],"paragraphs":["opening","short reflection","one gentle action"],"hashtags":[...]}}.
Exactly {count} slides. Each 8-22 words, under 150 characters. One clear thought per slide.
For carousel/reel: relatable opening, useful progression, gentle closing. A reel has four five-second scenes.
For single: one memorable reminder. No brand name or source labels in slide text; the renderer adds them.
Caption adds meaning without repeating all media text. Exactly three short paragraphs; each under 180 characters.
Plain text only, no Markdown, headings, URLs, source credits or hashtags in paragraphs. Exactly ONE action in the final paragraph.
Exactly five relevant unique hashtags, including #LDSQuotes. Never claim verified scripture or Church-leader authorship.'''
    client=anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'],max_retries=0,timeout=60)
    response=client.messages.create(model=os.environ.get('LLM_MODEL','claude-opus-4-8'),max_tokens=1400,messages=[{'role':'user','content':prompt}])
    raw=''.join(b.text for b in response.content if b.type=='text').strip()
    if raw.startswith('```'):raw=raw.split('\n',1)[1].rsplit('```',1)[0]
    data=validate_content(normalize_content(json.loads(raw),kind),kind)
    usage={'inputTokens':response.usage.input_tokens,'outputTokens':response.usage.output_tokens}
    return data,usage

def caption(data,footage=None):
    pieces=[data['paragraphs'][0].strip(),
      'Reflection:\n'+data['paragraphs'][1].strip(),
      'Try this today:\n'+data['paragraphs'][2].strip(),
      'About this post:\nOriginal devotional reflection; not a scripture or Church-leader quotation.']
    if footage:pieces.append(f'Video credit:\n{footage["creator"]} / Pexels\n{footage["sourceUrl"]}')
    pieces.append(' '.join(data['hashtags']))
    return '\n\n'.join(pieces)

def gql(query,variables=None):
    r=requests.post('https://api.buffer.com/',headers={'Authorization':'Bearer '+os.environ['BUFFER_API_TOKEN'],'Content-Type':'application/json'},json={'query':query,'variables':variables or {}},timeout=40)
    if r.status_code!=200:raise RuntimeError(f'Buffer HTTP {r.status_code}; outcome may be unknown')
    body=r.json()
    if body.get('errors'):raise RuntimeError('Buffer GraphQL rejected request: '+str(body['errors'])[:400])
    return body['data']

def post_status(post_id):
    # JSON quoting is safe in GraphQL string literals; no shell involved.
    data=gql('query { post(input: {id: '+json.dumps(post_id)+'}) { id status } }')
    return data['post']['status']

def payload(platform,kind,text,assets):
    # Buffer accepts platform-native media rather than Instagram's format labels:
    # multi-image posts for carousel days and one video for reel days.  Keep the
    # requested kind so the media selection remains explicit at each call site.
    media=[{'video':{'url':assets[0]['url'],'metadata':{'thumbnailOffset':2000}}}] if kind=='reel' else [{'image':{'url':a['url']}} for a in assets]
    # Threads/Facebook use their standard post type; the video asset makes it a
    # native video post (and avoids sending an unsupported Instagram Reel type).
    meta={'type':'reel' if platform=='instagram' and kind=='reel' else 'post'}
    if platform=='instagram':meta['shouldShareToFeed']=True
    return {'channelId':os.environ['BUFFER_'+platform.upper()+'_CHANNEL_ID'],'text':text,'mode':'shareNow','schedulingType':'automatic','assets':media,'metadata':{platform:meta}}

def notify(message,error=False):
    if os.environ.get('SLACK_WEBHOOK_URL'):
        try:
            response=requests.post(os.environ['SLACK_WEBHOOK_URL'],json={'text':('LDS Quotes — ERROR\n' if error else 'LDS Quotes\n')+message},timeout=20)
            if response.status_code!=200:raise RuntimeError(f'Slack notification HTTP {response.status_code}')
            return
        except requests.RequestException:
            raise RuntimeError('Slack webhook transport failure') from None
    SlackHandler().post_status_update(status='error' if error else 'amended',message=message,quote_id='lds-multiformat')

def reconcile(db):
    """Check a small pending set; notify about errors without recreating posts."""
    for doc in db.collection('ldsPublishingRuns').where(filter=firestore.FieldFilter('status','==','submitted')).limit(12).stream():
        data=doc.to_dict();states={}
        for platform,p in data.get('posts',{}).items():
            states[platform]=post_status(p['id'])
        terminal=bool(states) and all(s=='sent' for s in states.values())
        failed=any(s in ('error','failed','notSent') for s in states.values())
        changes={'deliveryStates':states,'checkedAt':firestore.SERVER_TIMESTAMP}
        if terminal:changes['status']='sent'
        elif failed:
            changes['status']='delivery_failed'
            notify('Buffer delivery failed for '+doc.id+': '+json.dumps(states),True)
        elif data.get('createdAt') and datetime.now(timezone.utc)-data['createdAt']>timedelta(hours=24):
            notify('Buffer delivery remains unconfirmed after 24 hours: '+doc.id,True)
        doc.reference.update(changes)

def run():
    logging.basicConfig(level=logging.INFO)
    dry=os.environ.get('DRY_RUN','false').lower()=='true'
    required=('ANTHROPIC_API_KEY','BUFFER_API_TOKEN','BUFFER_INSTAGRAM_CHANNEL_ID',
              'BUFFER_THREADS_CHANNEL_ID','BUFFER_FACEBOOK_CHANNEL_ID','MEDIA_BUCKET')
    missing=[key for key in required if not os.environ.get(key,'').strip()]
    if missing:raise RuntimeError('Missing required runtime configuration: '+', '.join(missing))
    day=datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).date()
    kind=format_for(day,os.environ.get('LDS_FORMAT'),dry)
    run_id=('dry-'+day.isoformat()+'-'+kind+'-'+uuid.uuid4().hex[:8]) if dry else day.isoformat()
    db=firestore.Client(project=PROJECT)
    ref=db.collection('ldsPublishingRuns').document(run_id)
    acquired=False
    try:
        if not dry:reconcile(db)
        if os.environ.get('LDS_RECONCILE_ONLY')=='true':
            policy=db.collection('contentStrategies').document('lds-quotes').get().to_dict() or {}
            current=ref.get().to_dict() or {}
            # This independent job can alert even if the publisher never starts,
            # is OOM-killed, or reaches the Cloud Run hard timeout.
            if policy.get('multiformatEnabled'):
                if not current:notify('Daily LDS Quotes run is missing: '+run_id+'. Inspect the publisher execution; no automatic repost attempted.',True)
                elif current.get('status') in ('preparing','rendered','submitting','needs_attention'):
                    notify('Daily LDS Quotes run is incomplete: '+run_id+' ('+current['status']+'). Inspect the publisher execution; no automatic repost attempted.',True)
            return 0
        try:
            ref.create({'createdAt':firestore.SERVER_TIMESTAMP,'format':kind,'dryRun':dry,'status':'preparing',
              'image':os.environ.get('PUBLISHER_IMAGE','local'),'captionFormatVersion':2})
            acquired=True
        except AlreadyExists:
            previous=ref.get().to_dict()
            if previous.get('status') in ('submitted','sent'):
                LOG.info('Existing daily run; no duplicate submission');return 0
            raise RuntimeError('Daily run already exists; inspect before retrying to prevent duplicates')
        policy=db.collection('contentStrategies').document('lds-quotes').get().to_dict() or {}
        if policy.get('multiformatEnabled') is not True and not dry:raise RuntimeError('Multi-format strategy has not been enabled')
        data,usage=generate(kind,day)
        ref.update({'content':data,'aiUsage':usage,'strategyVersion':policy.get('specificationSha256','')})
        footage=None
        host=ReleaseMedia()
        deleted=host.cleanup(db)
        with tempfile.TemporaryDirectory(prefix='lds-render-') as tmp:
            folder=Path(tmp)
            paths=[]
            for i,text in enumerate(data['slides']):
                p=folder/f'slide-{i+1}.jpg';card(text,p,i+1,len(data['slides']) if kind=='carousel' else None);paths.append(p)
            if kind=='reel':
                footage=choose(db,os.environ['PEXELS_API_KEY'],run_id,dry)
                ref.update({'footage':footage})
                source=folder/'source.mp4';download(footage['downloadUrl'],source)
                paths=[reel(source,data['slides'],folder),paths[0]]
            assets=[]
            for n,p in enumerate(paths):
                name=f'ldsauto-media--{run_id}--{n}{p.suffix}'
                assets.append(host.upload(p,name))
            text=caption(data,footage)
            ref.update({'assets':assets,'caption':text,'status':'rendered','cleanupDeleted':deleted})
            instagram=payload('instagram',kind,text,assets[:1] if kind=='reel' else assets)
            # Short captions for Threads preserve attribution and one action.
            threads='\n\n'.join([data['paragraphs'][0],'Try this today:\n'+data['paragraphs'][2],
              'Original devotional reflection.','#LDSQuotes'])
            if len(threads)>500:raise ValueError('Threads caption exceeds 500 characters')
            # Map Instagram formats to each network's supported equivalent:
            # carousel -> multi-image post, reel -> single video post.
            companion_kind='reel' if kind=='reel' else ('carousel' if kind=='carousel' else 'single')
            companion_assets=assets[:1] if kind=='reel' else assets
            submissions={'instagram':instagram,
                         'threads':payload('threads',companion_kind,threads,companion_assets),
                         'facebook':payload('facebook',companion_kind,caption(data),companion_assets)}
            ref.update({'submissionPayloads':submissions})
            if dry:
                # Authenticate and exercise read-only GraphQL. No createPost in this branch.
                gql('query { account { id } }')
                notify(f'[DRY RUN] LDS {kind}: rendered, public URLs verified, Buffer authenticated. Nothing published.\n'+assets[0]['url']+'\n\n'+text)
                ref.update({'status':'dry_run_complete','completedAt':firestore.SERVER_TIMESTAMP,'slackVerified':True})
                if footage:db.document(footage['ref']).update({'status':'previewed'})
                LOG.info('DRY_RUN_COMPLETE %s %s',run_id,assets[0]['url'])
                return 0
            results={}
            only=os.environ.get('LDS_ONLY_PLATFORM','').strip().lower()
            for platform,p in submissions.items():
                if only and platform!=only: continue
                # Durable marker before sending. A timeout never triggers a blind retry.
                ref.update({f'attempts.{platform}':'sending','status':'submitting'})
                r=gql('mutation CreatePost($input: CreatePostInput!) { createPost(input:$input) { ... on PostActionSuccess { post { id status } } ... on MutationError { message } } }',{'input':p})['createPost']
                if not r.get('post'):raise RuntimeError('Buffer rejected '+platform+': '+str(r.get('message','no post'))[:250])
                results[platform]=r['post']
                ref.update({f'posts.{platform}':r['post'],f'attempts.{platform}':'accepted'})
            ref.update({'status':'submitted','completedAt':firestore.SERVER_TIMESTAMP})
            if footage:db.document(footage['ref']).update({'status':'used','usedAt':firestore.SERVER_TIMESTAMP})
            # Small bounded delivery check; subsequent daily checks reconcile pending posts.
            time.sleep(8)
            reconcile(db)
            final=ref.get().to_dict()['status']
            notify(f'LDS {kind}: {final}. Buffer posts: '+json.dumps(results))
            # Buffer can remain `sending` for several minutes after accepting
            # a post; the delivery-check job reconciles it later.
            return 0 if final in ('sent','submitted','sending') else 1
    except Exception as exc:
        # Do not include provider headers, environment values, or secret URLs in errors.
        message=f'{type(exc).__name__}: {str(exc)[:400]}'
        LOG.error('Run %s failed: %s',run_id,message)
        try:
            current=ref.get().to_dict() or {}
            if acquired and current.get('status') not in ('sent','submitted','dry_run_complete'):
                ref.set({'status':'needs_attention','error':message},merge=True)
            notify('LDS Quotes '+run_id+' failed: '+message,True)
        except Exception:LOG.error('Could not persist or notify failure')
        return 1

if __name__=='__main__':raise SystemExit(run())
