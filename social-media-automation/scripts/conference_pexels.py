"""Pexels footage for Conference previews; shared secret, separate clip history."""
import os, sys, subprocess, random, uuid, json
from pathlib import Path
import requests
from google.cloud import firestore
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'cloud_jobs/lds'))
from nature_source import download

def fetch(folder):
    key=os.environ.get('PEXELS_API_KEY','').strip()
    if not key:
        key=subprocess.check_output(['gcloud','secrets','versions','access','latest',
            '--secret=lds-pexels-api-key','--project=social-media-automation-5c9db'],text=True).strip()
    db=firestore.Client(project='social-media-automation-5c9db')
    history=db.collection('conferenceFootagePreview')
    for query in ['ocean waves','forest sunlight','mountain lake','river','clouds sky','waterfall']:
        response=requests.get('https://api.pexels.com/v1/videos/search',
            params={'query':query,'orientation':'portrait','per_page':10},
            headers={'Authorization':key},timeout=25)
        if response.status_code!=200:raise RuntimeError(f'Pexels search HTTP {response.status_code}')
        candidates=response.json().get('videos',[]);random.shuffle(candidates)
        for video in candidates[:5]:
            if video.get('duration',0)<24:continue
            files=[f for f in video.get('video_files',[]) if f.get('file_type')=='video/mp4'
                and 720<=f.get('width',0)<=2160 and f.get('height',0)>=1280]
            if not files:continue
            key_id='pexels-'+str(video['id'])
            if db.collection('ldsFootage').document(key_id).get().exists:continue
            if db.collection('ldsFootagePreview').document(key_id).get().exists:continue
            ref=history.document(key_id)
            @firestore.transactional
            def reserve(tx):
                if ref.get(transaction=tx).exists:return False
                tx.create(ref,{'status':'reserved','sourceUrl':video['url'],
                    'createdAt':firestore.SERVER_TIMESTAMP,'runId':uuid.uuid4().hex})
                return True
            if not reserve(db.transaction()):continue
            file=min(files,key=lambda f:f['width']*f['height'])
            path=folder/'pexels-source.mp4'
            download(file['link'],path)
            info={'id':video['id'],'creator':video.get('user',{}).get('name','Pexels contributor'),
                'sourceUrl':video['url'],'category':query,'licenseUrl':'https://www.pexels.com/license/'}
            ref.update({**info,'status':'downloaded_for_preview'})
            # Generated media provenance, never credentials.
            (folder/'pexels-source.json').write_text(json.dumps(info,indent=2)+'\n')
            (folder/'FOOTAGE-CREDIT.md').write_text('Video provided by Pexels: '+info['creator']+'\n\n'+info['sourceUrl']+'\n\n'+info['licenseUrl']+'\n')
            print('Downloaded Pexels video',info['id'],'by',info['creator'],flush=True)
            return path
    raise RuntimeError('No suitable unused clip within six searches')
