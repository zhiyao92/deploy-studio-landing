"""Bounded Pexels selection, separate permanent Conference reservations."""
import random
import time
from urllib.parse import urlparse
import requests
from google.cloud import firestore

CATEGORIES=['ocean waves','forest sunlight','mountain lake','river','clouds sky','waterfall','meadow','misty mountains','sunrise nature','rain nature']
MAX_VIDEO_BYTES=90*1024*1024
DOWNLOAD_BUDGET_SECONDS=300

def choose(db,key,run_id,dry):
    collection=db.collection('conferenceFootagePreview' if dry else 'conferenceFootage')
    queries=CATEGORIES.copy();random.SystemRandom().shuffle(queries)
    for query in queries[:6]:
        response=requests.get('https://api.pexels.com/v1/videos/search',params={'query':query,'orientation':'portrait','per_page':10,'page':random.randint(1,4)},headers={'Authorization':key.strip()},timeout=25)
        if response.status_code!=200:raise RuntimeError(f'Pexels HTTP {response.status_code}')
        videos=response.json().get('videos',[]);random.shuffle(videos)
        for video in videos[:5]:
            if video.get('duration',0)<24:continue
            files=[f for f in video.get('video_files',[]) if f.get('file_type')=='video/mp4' and 720<=f.get('width',0)<=2160 and f.get('height',0)>=1280]
            if not files:continue
            key_id='pexels-'+str(video['id'])
            if (db.collection('ldsFootage').document(key_id).get().exists or
                    db.collection('ldsFootagePreview').document(key_id).get().exists):continue
            ref=collection.document(key_id)
            @firestore.transactional
            def reserve(tx):
                if ref.get(transaction=tx).exists:return False
                tx.create(ref,{'runId':run_id,'status':'reserved','createdAt':firestore.SERVER_TIMESTAMP})
                return True
            if reserve(db.transaction()):
                chosen=min(files,key=lambda f:f['width']*f['height'])
                return {'id':str(video['id']),'ref':ref.path,'downloadUrl':chosen['link'],'sourceUrl':video['url'],
                  'creator':video.get('user',{}).get('name','Pexels contributor'),'category':query}
    raise RuntimeError('No unused Conference footage in bounded search')

def download(url,path):
    parsed=urlparse(url)
    if parsed.scheme!='https' or parsed.hostname!='videos.pexels.com':raise ValueError('Unexpected Pexels media host')
    started=time.monotonic();size=0
    with requests.get(url,stream=True,timeout=(10,60),allow_redirects=False) as response:
        if response.status_code!=200:raise RuntimeError(f'Pexels download HTTP {response.status_code}')
        expected=response.headers.get('Content-Length')
        if expected and int(expected)>MAX_VIDEO_BYTES:
            raise RuntimeError('Pexels video exceeds the 90 MiB size cap')
        with path.open('wb') as output:
            for chunk in response.iter_content(256*1024):
                size+=len(chunk)
                if size>MAX_VIDEO_BYTES:raise RuntimeError('Pexels video exceeds the 90 MiB size cap')
                if time.monotonic()-started>DOWNLOAD_BUDGET_SECONDS:
                    raise RuntimeError('Pexels video download exceeded the 300 second time budget')
                output.write(chunk)
