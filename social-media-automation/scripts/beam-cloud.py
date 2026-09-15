"""Deploy isolated validation first; production requires both image formats verified."""
import json
import subprocess
import sys
import urllib.request
from pathlib import Path
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
        for snap in db.collection('beamPublishingRuns').order_by('createdAt',direction=firestore.Query.DESCENDING).limit(20).stream():
            d=snap.to_dict()
            if d.get('dryRun') and d.get('status')=='dry_run_complete' and d.get('slackVerified') and d.get('image')==image:
                verified.setdefault(d['format'],snap.id)
        assert set(verified)=={'single','carousel'},'Both image formats must pass before deployment'
    spec=describe('beam-learn-thai-publisher')['spec']['template']['spec']['template']['spec']
    secrets={}
    for e in spec['containers'][0]['env']:
        if 'secretKeyRef' in e.get('valueFrom',{}):
            s=e['valueFrom']['secretKeyRef'];secrets[e['name']]=s['name']+':'+s['key']
    secrets['GITHUB_TOKEN']='beam-github-token:latest'
    # Existing Beam-scoped repository credential; isolated release.
    env={'ANTHROPIC_MODEL':'claude-haiku-4-5-20251001','GITHUB_MEDIA_REPO':'zhiyao92/beam-learn-thai-images','MEDIA_BUCKET':'social-media-automation-5c9db-social-media','BUFFER_CHANNEL_ID':'6a9d6548cd8b9c702c18399d','PUBLISHER_IMAGE':image,
         'ANTHROPIC_REVIEW_MODEL':'claude-sonnet-4-6','DRY_RUN':'true' if mode=='validation' else 'false'}
    if mode=='monitor':env['BEAM_RECONCILE_ONLY']='true'
    name={'validation':'beam-validation','production':'beam-learn-thai-publisher','monitor':'beam-delivery-check'}[mode]
    check=subprocess.run(['gcloud','beta','run','jobs','describe',name,'--project='+PROJECT,'--region='+REGION],capture_output=True)
    cmd=['gcloud','beta','run','jobs','update' if check.returncode==0 else 'create',name,'--project='+PROJECT,'--region='+REGION,
         '--image='+image,'--service-account='+spec['serviceAccountName'],'--cpu='+('1' if mode=='monitor' else '2'),
         '--memory='+('512Mi' if mode=='monitor' else '2Gi'),'--task-timeout='+('120s' if mode=='monitor' else '1200s'),
         '--tasks=1','--parallelism=1','--max-retries=0','--set-env-vars='+','.join(k+'='+v for k,v in env.items()),
         '--set-secrets='+','.join(k+'='+v for k,v in secrets.items())]
    subprocess.run(cmd,check=True)
    if mode=='production':
        strategy_text=(Path(__file__).resolve().parents[1]/'config/beam-strategy.md').read_text()
        db.collection('contentStrategies').document('beam').set({'animatedPublisherEnabled':True,
          'strategyText':strategy_text,'reelStyles':[],
          'implementationStatus':'deployed-dry-run-verified','pendingRequirements':[],
          'deployedImage':image,'validationRuns':verified,'deployedAt':firestore.SERVER_TIMESTAMP,
          'weeklyFormats':['carousel','single','carousel','single','carousel','single','carousel'],
          'postingTime':'04:10','deliveryCheckTime':'04:40','timezone':'Asia/Kuala_Lumpur','maxWeeklySearches':0,
          'captionFormatVersion':2,
          'maxWeeklyModelCalls':14,'maxWeeklyOutputTokens':21000,'audioEnabled':False,'mediaText':'ASCII romanization and English only','maxHostedMB':350,'retentionDays':7},merge=True)
        db.collection('streams').document('beam-learn-thai').set({
          'strategyDocument':'contentStrategies/beam','publisherJob':'beam-learn-thai-publisher',
          'contentPolicy':{'mission':'Practical, respectful everyday Thai lessons; useful content before app promotion.',
            'mustInclude':['Simplified ASCII romanization','English meaning','Situational context','Romanization limitation note'],
            'audioEnabled':False,'thaiScriptOnMedia':False,'writtenLanguageReview':'Independent AI review, not native certification'},
          'mediaStorage':'gcs-public-lifecycle','mediaBucket':'social-media-automation-5c9db-social-media','mediaRetentionDays':8,
          'hashtagStrategy':{'maxHashtags':5,'mix':['brand','Thai learning','specific situation','discovery'],
            'rule':'Five relevant, varied hashtags; no stuffing or unrelated trending tags.'},
          'captionFormatVersion':2,'configVersion':2,'status':'active','deployedImage':image,
          'syncedAt':firestore.SERVER_TIMESTAMP},merge=True)
        print('Production activated; no live execution triggered')

def validate(kind,source=None):
    assert kind in ('single','carousel')
    token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
    url=f'https://run.googleapis.com/v2/projects/{PROJECT}/locations/{REGION}/jobs/beam-validation:run'
    payload={'overrides':{'containerOverrides':[{'env':[{'name':'DRY_RUN','value':'true'},{'name':'BEAM_FORMAT','value':kind}]}]}}
    if source:payload['overrides']['containerOverrides'][0]['env'].append({'name':'BEAM_VALIDATION_SOURCE','value':source})
    req=urllib.request.Request(url,data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(req,timeout=30) as r:result=json.load(r)
    print(kind,result['name'])

if __name__=='__main__':
    if sys.argv[1]=='run':validate(sys.argv[2],sys.argv[3] if len(sys.argv)>3 else None)
    else:deploy(sys.argv[2],sys.argv[1])
