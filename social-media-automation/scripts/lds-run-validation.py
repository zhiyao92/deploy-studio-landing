"""Start cloud format dry runs using per-execution overrides (never publish)."""
import json
import subprocess
import sys
import urllib.request

token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
url='https://run.googleapis.com/v2/projects/social-media-automation-5c9db/locations/us-central1/jobs/lds-quotes-validation:run'
for kind in (sys.argv[1:] or ['single','carousel','reel']):
    if kind not in ('single','carousel','reel'):raise ValueError('Invalid dry-run format')
    payload={'overrides':{'containerOverrides':[{'env':[{'name':'DRY_RUN','value':'true'},{'name':'LDS_FORMAT','value':kind}]}]}}
    request=urllib.request.Request(url,data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(request,timeout=30) as response:result=json.load(response)
    print(kind,result['name'])
