"""Bounded Pexels search with transactional permanent clip reservations."""
import random
import time
from urllib.parse import urlparse
import requests
from google.cloud import firestore

CATEGORIES=['ocean waves','forest sunlight','waterfall','river','mountain lake','rain nature','snow forest','clouds sky','sunrise nature','sunset lake','meadow','desert dunes','night sky','bamboo forest','autumn leaves','stream water','coastal cliffs','misty mountains','flowers breeze','lake reflections']
MAX_VIDEO_BYTES=90*1024*1024
DOWNLOAD_BUDGET_SECONDS=300

def choose(db, key, run_id, dry):
    queries=CATEGORIES.copy();random.SystemRandom().shuffle(queries)
    collection=db.collection('ldsFootagePreview' if dry else 'ldsFootage')
    # Up to 6 API requests and 30 reads per run, regardless of library size.
    for query in queries[:6]:
        r=requests.get('https://api.pexels.com/videos/search',params={'query':query,'orientation':'portrait','per_page':10,'page':random.randint(1,5)},headers={'Authorization':key},timeout=25)
        if r.status_code!=200:raise RuntimeError(f'Pexels search HTTP {r.status_code}')
        candidates=r.json().get('videos',[]);random.shuffle(candidates)
        checked=0
        for video in candidates:
            if video.get('duration',0)<20:continue
            files=[f for f in video.get('video_files',[]) if f.get('file_type')=='video/mp4' and f.get('width',0)>=720 and f.get('height',0)>=1280 and f.get('width',0)<=2160]
            if not files:continue
            if checked>=5:break
            checked+=1
            ref=collection.document('pexels-'+str(video['id']))
            @firestore.transactional
            def reserve(tx):
                old=ref.get(transaction=tx)
                if old.exists:return False
                tx.create(ref,{'runId':run_id,'status':'reserved','createdAt':firestore.SERVER_TIMESTAMP,'sourceUrl':video['url'],'creator':video.get('user',{}).get('name','Pexels contributor'),'category':query})
                return True
            if reserve(db.transaction()):
                return {'id':str(video['id']),'ref':ref.path,'sourceUrl':video['url'],'creator':video.get('user',{}).get('name','Pexels contributor'),'category':query,'downloadUrl':min(files,key=lambda f:f['width']*f['height'])['link'],'licenseUrl':'https://www.pexels.com/license/'}
    raise RuntimeError('No suitable unused nature footage in bounded search; no clip was reused')

def download(url,path):
    parsed=urlparse(url)
    if parsed.scheme!='https' or parsed.hostname!='videos.pexels.com':raise ValueError('Unexpected footage download host')
    started=time.monotonic();size=0
    with requests.get(url,stream=True,timeout=(10,60),allow_redirects=False) as r:
        if r.status_code!=200:raise RuntimeError(f'Footage download HTTP {r.status_code}')
        expected=r.headers.get('Content-Length')
        if expected and int(expected)>MAX_VIDEO_BYTES:
            raise RuntimeError('Pexels video exceeds the 90 MiB size cap')
        with path.open('wb') as f:
            for chunk in r.iter_content(256*1024):
                size+=len(chunk)
                if size>MAX_VIDEO_BYTES:raise RuntimeError('Pexels video exceeds the 90 MiB size cap')
                if time.monotonic()-started>DOWNLOAD_BUDGET_SECONDS:
                    raise RuntimeError('Pexels video download exceeded the 300 second time budget')
                f.write(chunk)
