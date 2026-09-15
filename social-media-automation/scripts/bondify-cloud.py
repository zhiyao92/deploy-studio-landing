"""Deploy isolated validation first; production requires all three verified dry runs."""
import json
import subprocess
import sys
import urllib.request
from google.cloud import firestore

PROJECT='social-media-automation-5c9db'
REGION='us-central1'

def describe(name):
    return json.loads(subprocess.check_output(['gcloud','beta','run','jobs','describe',name,'--project='+PROJECT,'--region='+REGION,'--format=json'],text=True))

def deploy(image, mode):
    if '@sha256:' not in image:
        raise ValueError('Use pinned image digest')
    db=firestore.Client(project=PROJECT)
    verified={}
    if mode=='production':
        for snap in db.collection('bondifyPublishingRuns').order_by('createdAt',direction=firestore.Query.DESCENDING).limit(20).stream():
            d=snap.to_dict()
            if d.get('dryRun') and d.get('status')=='dry_run_complete' and d.get('slackVerified') and d.get('image')==image:
                verified.setdefault(d['format'],snap.id)
        assert set(verified)=={'single','carousel','reel'},'All formats must pass before deployment'
    spec=describe('bondify-publisher')['spec']['template']['spec']['template']['spec']
    secrets={}
    for e in spec['containers'][0]['env']:
        if 'secretKeyRef' in e.get('valueFrom',{}):
            s=e['valueFrom']['secretKeyRef'];secrets[e['name']]=s['name']+':'+s['key']
    secrets['GITHUB_TOKEN']='lds-github-token:latest'
    # Existing scoped repository credential; separate Bondify release, no LDS changes.
    env={'LLM_MODEL':'claude-opus-4-8','GITHUB_MEDIA_REPO':'zhiyao92/lds-quotes-images','MEDIA_BUCKET':'social-media-automation-5c9db-social-media','PUBLISHER_IMAGE':image,
         'DRY_RUN':'true' if mode=='validation' else 'false'}
    if mode=='monitor':env['BONDIFY_RECONCILE_ONLY']='true'
    name={'validation':'bondify-validation','production':'bondify-publisher','monitor':'bondify-delivery-check'}[mode]
    check=subprocess.run(['gcloud','beta','run','jobs','describe',name,'--project='+PROJECT,'--region='+REGION],capture_output=True)
    cmd=['gcloud','beta','run','jobs','update' if check.returncode==0 else 'create',name,'--project='+PROJECT,'--region='+REGION,
         '--image='+image,'--service-account='+spec['serviceAccountName'],'--cpu='+('1' if mode=='monitor' else '2'),
         '--memory='+('512Mi' if mode=='monitor' else '2Gi'),'--task-timeout='+('120s' if mode=='monitor' else '1200s'),
         '--tasks=1','--parallelism=1','--max-retries=0','--set-env-vars='+','.join(k+'='+v for k,v in env.items()),
         '--set-secrets='+','.join(k+'='+v for k,v in secrets.items())]
    subprocess.run(cmd,check=True)
    if mode=='production':
        db.collection('contentStrategies').document('bondify').set({'researchPublisherEnabled':True,
          'implementationStatus':'deployed-dry-run-verified','pendingRequirements':[],
          'deployedImage':image,'validationRuns':verified,'deployedAt':firestore.SERVER_TIMESTAMP,
          'weeklyFormats':['carousel','reel','single','carousel','reel','carousel','reel'],
          'postingTime':'04:40','deliveryCheckTime':'05:10','timezone':'Asia/Kuala_Lumpur','maxWeeklySearches':3,
          'captionFormatVersion':2,
          'maxWeeklyModelCalls':3,'maxWeeklyOutputTokens':10500,'maxHostedMB':350,'retentionDays':7},merge=True)
        db.collection('streams').document('bondify').set({
          'enabled':True,'autoPublish':True,'status':'active','configVersion':2,
          'strategyDocument':'contentStrategies/bondify','publisherJob':'bondify-publisher',
          'captionFormatVersion':2,'deployedImage':image,'mediaStorage':'gcs-public-lifecycle',
          'mediaBucket':'social-media-automation-5c9db-social-media','mediaRetentionDays':8,
          'syncedAt':firestore.SERVER_TIMESTAMP},merge=True)
        print('Production activated; no live execution triggered')

def validate(kind,resume_week=False):
    assert kind in ('single','carousel','reel')
    token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
    url=f'https://run.googleapis.com/v2/projects/{PROJECT}/locations/{REGION}/jobs/bondify-validation:run'
    env=[{'name':'DRY_RUN','value':'true'},{'name':'BONDIFY_FORMAT','value':kind}]
    if resume_week:env.append({'name':'BONDIFY_RESUME_WEEK','value':'true'})
    payload={'overrides':{'containerOverrides':[{'env':env}]}}
    req=urllib.request.Request(url,data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(req,timeout=30) as r:result=json.load(r)
    print(kind,result['name'])

if __name__=='__main__':
    if sys.argv[1]=='run':validate(sys.argv[2],resume_week='--resume-week' in sys.argv[3:])
    else:deploy(sys.argv[2],sys.argv[1])
