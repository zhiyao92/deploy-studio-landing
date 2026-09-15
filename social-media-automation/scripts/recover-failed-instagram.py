"""Explicitly recover one confirmed failed Instagram post without duplicating it."""
import io
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests
from PIL import Image
from google.cloud import firestore,storage

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'cloud_jobs'/'bondify'))
from buffer_handler import BufferHandler

PROJECT='social-media-automation-5c9db'
BUCKET='social-media-automation-5c9db-social-media'
STREAMS={
 'beam':('beamPublishingRuns','mediaUrls'),
 'conference':('conferencePublishingRuns','mediaUrls'),
 'lds-quotes':('ldsPublishingRuns','assets'),
}

def status(buffer,post_id):
    query='query { post(input: {id: '+json.dumps(post_id)+'}) { id status externalLink error { message } } }'
    return buffer._graphql(query)['post']

def main():
    stream,day=sys.argv[1:3]
    if stream not in STREAMS:raise ValueError('Unsupported recovery stream')
    db=firestore.Client(project=PROJECT);collection,field=STREAMS[stream]
    ref=db.collection(collection).document(day);data=ref.get().to_dict() or {}
    if data.get('status')!='delivery_failed':raise RuntimeError('Run is not a confirmed delivery failure')
    prior=data.get('postId') if stream!='lds-quotes' else data.get('posts',{}).get('instagram',{}).get('id')
    if not prior:raise RuntimeError('Original Instagram post ID is missing')
    if data.get('recovery',{}).get('postId'):raise RuntimeError('Recovery was already submitted; refusing duplicate')
    buffer=BufferHandler(access_token=os.environ['BUFFER_ACCESS_TOKEN'],channel_id=os.environ['BUFFER_CHANNEL_ID'])
    before=status(buffer,prior)
    if before['status']!='error':raise RuntimeError('Original Buffer post is not currently failed')
    sources=data.get(field) or []
    if field=='assets':sources=[item['url'] for item in sources]
    if not sources:raise RuntimeError('No original media URLs')
    bucket=storage.Client(project=PROJECT).bucket(BUCKET);urls=[]
    for index,source in enumerate(sources):
        response=requests.get(source,timeout=60);response.raise_for_status()
        Image.open(io.BytesIO(response.content)).verify()
        name=f'recovery/{stream}/{day}/{index}.png';blob=bucket.blob(name)
        blob.cache_control='public,max-age=604800';blob.upload_from_string(response.content,content_type='image/png')
        public=f'https://storage.googleapis.com/{BUCKET}/{quote(name,safe="/")}'
        check=requests.get(public,stream=True,timeout=30)
        if check.status_code!=200 or check.headers.get('Content-Type','').split(';')[0].lower()!='image/png':
            raise RuntimeError('Recovery media URL is not Meta-compatible')
        urls.append(public)
    ref.update({'recovery':{'attempt':'sending','originalPostId':prior,'mediaUrls':urls,'startedAt':firestore.SERVER_TIMESTAMP}})
    result=buffer.publish(caption=data['caption'],image_urls=urls)
    post_id=result['id']
    changes={'recovery.postId':post_id,'recovery.bufferStatus':result.get('status'),'recovery.attempt':'accepted',
      'recovery.acceptedAt':firestore.SERVER_TIMESTAMP,'status':'submitted'}
    if stream=='lds-quotes':
        changes['posts.instagram']={'id':post_id,'status':result.get('status')}
    else:
        changes['originalPostId']=prior;changes['postId']=post_id;changes['bufferStatus']=result.get('status')
    ref.update(changes)
    time.sleep(12);after=status(buffer,post_id)
    final={'recovery.lastCheckedAt':firestore.SERVER_TIMESTAMP,'recovery.deliveryState':after['status']}
    if after['status']=='sent':final.update({'status':'sent','recovery.attempt':'sent','recovery.externalLink':after.get('externalLink')})
    elif after['status'] in ('error','failed','notSent'):final.update({'status':'delivery_failed','recovery.attempt':'failed','recovery.error':(after.get('error') or {}).get('message','unknown')})
    ref.update(final)
    print(json.dumps({'stream':stream,'postId':post_id,'status':after['status'],'externalLink':after.get('externalLink')}))

if __name__=='__main__':main()
