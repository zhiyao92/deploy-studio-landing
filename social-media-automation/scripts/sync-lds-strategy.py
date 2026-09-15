"""Merge the approved LDS strategy into Firestore without changing schedules."""
import hashlib
import json
import subprocess
import urllib.request
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
PROJECT='social-media-automation-5c9db'
document=ROOT/'config/lds-quotes-strategy.md'
content=document.read_text()
digest=hashlib.sha256(content.encode()).hexdigest()
token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
base=f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents'
fields={
 'approvedSpecification':{'stringValue':content},
 'specificationSha256':{'stringValue':digest},
 'syncedAt':{'timestampValue':datetime.now(timezone.utc).isoformat()},
}
url=base+'/contentStrategies/lds-quotes?'+ '&'.join('updateMask.fieldPaths='+k for k in fields)
request=urllib.request.Request(url,data=json.dumps({'fields':fields}).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='PATCH')
with urllib.request.urlopen(request,timeout=30) as response:
    result=json.load(response)
assert result['fields']['specificationSha256']['stringValue']==digest
print('Synced contentStrategies/lds-quotes sha256='+digest)
