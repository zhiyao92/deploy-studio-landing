"""Clone only the LDS job configuration for a non-publishing cloud validation."""
import json
import subprocess
import sys

PROJECT='social-media-automation-5c9db'
REGION='us-central1'
image=sys.argv[1]
monitor='--monitor' in sys.argv
name='lds-quotes-delivery-check' if monitor else 'lds-quotes-validation'
raw=subprocess.check_output(['gcloud','beta','run','jobs','describe','lds-quotes-publisher','--region='+REGION,'--project='+PROJECT,'--format=json'],text=True)
spec=json.loads(raw)['spec']['template']['spec']['template']['spec']
envs={};secrets={}
for e in spec['containers'][0].get('env',[]):
    if 'value' in e:envs[e['name']]=e['value']
    elif 'secretKeyRef' in e.get('valueFrom',{}):
        s=e['valueFrom']['secretKeyRef'];secrets[e['name']]=s['name']+':'+s['key']
envs.update(DRY_RUN='true',LDS_FORMAT='single',PUBLISHER_IMAGE=image)
if monitor:
    envs.pop('LDS_FORMAT',None)
    envs.update(DRY_RUN='false',LDS_RECONCILE_ONLY='true')
check=subprocess.run(['gcloud','beta','run','jobs','describe',name,'--region='+REGION,'--project='+PROJECT],capture_output=True)
cmd=['gcloud','beta','run','jobs','update' if check.returncode==0 else 'create',name,'--region='+REGION,'--project='+PROJECT,'--image='+image,'--service-account='+spec['serviceAccountName'],'--cpu='+('1' if monitor else '2'),'--memory='+('512Mi' if monitor else '2Gi'),'--task-timeout='+('120s' if monitor else '900s'),'--max-retries=0','--tasks=1','--parallelism=1','--set-env-vars=^|^'+'|'.join(k+'='+v for k,v in envs.items()),'--set-secrets='+','.join(k+'='+v for k,v in secrets.items())]
subprocess.run(cmd,check=True)
