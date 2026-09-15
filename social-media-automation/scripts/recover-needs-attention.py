"""Explicitly run today's pre-publish recovery after verifying no Buffer ID exists."""
import json
import subprocess
import sys
from datetime import datetime
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from google.cloud import firestore

PROJECT='social-media-automation-5c9db'
REGION='us-central1'
STREAMS={
    'conference':('lds-conference-publisher','conferencePublishingRuns','CONFERENCE_RECOVER_NEEDS_ATTENTION'),
    'bondify':('bondify-publisher','bondifyPublishingRuns','BONDIFY_RECOVER_NEEDS_ATTENTION'),
}

def main():
    if len(sys.argv)!=3 or sys.argv[1] not in STREAMS:
        raise SystemExit('Usage: recover-needs-attention.py conference|bondify YYYY-MM-DD')
    stream,day=sys.argv[1:]
    today=datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).date().isoformat()
    if day!=today:raise RuntimeError('Recovery is allowed only for today\'s local-date run')
    job,collection,flag=STREAMS[stream]
    db=firestore.Client(project=PROJECT)
    data=db.collection(collection).document(day).get().to_dict() or {}
    if data.get('status')!='needs_attention' or data.get('dryRun') is True:
        raise RuntimeError('Run is not a live needs_attention record')
    if data.get('postId') or data.get('bufferStatus') or data.get('sending'):
        raise RuntimeError('A Buffer submission may exist; refusing recovery')
    if stream=='bondify':
        week=db.collection('bondifyEditorialWeeks').document(day).get().to_dict() or {}
        if week.get('status')!='approved':raise RuntimeError('Bondify weekly research has not passed review')
    token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
    url=f'https://run.googleapis.com/v2/projects/{PROJECT}/locations/{REGION}/jobs/{job}:run'
    body={'overrides':{'containerOverrides':[{'env':[{'name':flag,'value':'true'}]}]}}
    request=Request(url,data=json.dumps(body).encode(),headers={
        'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    with urlopen(request,timeout=30) as response:result=json.load(response)
    print(json.dumps({'stream':stream,'day':day,'operation':result.get('name')}))

if __name__=='__main__':main()
