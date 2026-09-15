"""Deploy LDS Conference validation, production and delivery monitor."""
import json,subprocess,sys,urllib.request
from pathlib import Path
from google.cloud import firestore

PROJECT='social-media-automation-5c9db';REGION='us-central1'
SOURCE='https://www.churchofjesuschrist.org/study/general-conference/2007/10/good-better-best?lang=eng'
SOURCES=[
 SOURCE,
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/44rowe?lang=eng',
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/57wakolo?lang=eng',
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/43larreal?lang=eng',
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/27causse?lang=eng',
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/58gong?lang=eng',
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/17teh?lang=eng',
 'https://www.churchofjesuschrist.org/study/general-conference/2026/04/18becerra?lang=eng']

def describe(name):
    return json.loads(subprocess.check_output(['gcloud','beta','run','jobs','describe',name,'--project='+PROJECT,'--region='+REGION,'--format=json'],text=True))

def deploy(image,mode):
    if '@sha256:' not in image:raise ValueError('Use pinned image digest')
    db=firestore.Client(project=PROJECT);verified={}
    if mode=='production':
        for snap in db.collection('conferencePublishingRuns').order_by('createdAt',direction=firestore.Query.DESCENDING).limit(20).stream():
            data=snap.to_dict()
            if data.get('dryRun') and data.get('status')=='dry_run_complete' and data.get('slackVerified') and data.get('image')==image:
                verified.setdefault(data['format'],snap.id)
        assert set(verified)=={'single','carousel','reel'},'All three exact-image dry runs must pass'
    current=describe('lds-conference-publisher')['spec']['template']['spec']['template']['spec'];secrets={}
    for e in current['containers'][0]['env']:
        if 'secretKeyRef' in e.get('valueFrom',{}):
            s=e['valueFrom']['secretKeyRef'];secrets[e['name']]=s['name']+':'+s['key']
    secrets['PEXELS_API_KEY']='lds-pexels-api-key:latest'
    env={'DRY_RUN':'true' if mode=='validation' else 'false','BUFFER_CHANNEL_ID':'6a9ec217cd8b9c702c2229eb',
      'GITHUB_MEDIA_REPO':'zhiyao92/lds-conference-images','MEDIA_BUCKET':'social-media-automation-5c9db-social-media','ANTHROPIC_MODEL':'claude-haiku-4-5-20251001',
      'ANTHROPIC_REVIEW_MODEL':'claude-sonnet-4-6','PUBLISHER_IMAGE':image}
    if mode=='validation':env['CONFERENCE_SOURCE_URL']=SOURCE
    if mode=='monitor':env['CONFERENCE_RECONCILE_ONLY']='true'
    name={'validation':'lds-conference-validation','production':'lds-conference-publisher','monitor':'lds-conference-delivery-check'}[mode]
    exists=subprocess.run(['gcloud','beta','run','jobs','describe',name,'--project='+PROJECT,'--region='+REGION],capture_output=True)
    cmd=['gcloud','beta','run','jobs','update' if exists.returncode==0 else 'create',name,'--project='+PROJECT,'--region='+REGION,
      '--image='+image,'--service-account='+current['serviceAccountName'],'--cpu='+('1' if mode=='monitor' else '2'),
      '--memory='+('512Mi' if mode=='monitor' else '2Gi'),'--task-timeout='+('120s' if mode=='monitor' else '1200s'),
      '--tasks=1','--parallelism=1','--max-retries=0','--set-env-vars=^|^'+'|'.join(k+'='+v for k,v in env.items()),
      '--set-secrets='+','.join(k+'='+v for k,v in secrets.items())]
    subprocess.run(cmd,check=True)
    if mode=='production':
        strategy=(Path(__file__).resolve().parents[1]/'config/lds-conference-strategy.md').read_text()
        db.collection('contentStrategies').document('lds-conference').set({
          'multiformatEnabled':True,'implementationStatus':'deployed-dry-run-verified','deployedImage':image,
          'validationRuns':verified,'strategyText':strategy,'sourceUrls':SOURCES,'pendingRequirements':[],
          'weeklyFormats':['carousel','reel','single','carousel','reel','single','carousel'],
          'postingTime':'04:20','deliveryCheckTime':'04:50','timezone':'Asia/Kuala_Lumpur',
          'captionFormatVersion':2,
          'audio':{'enabled':True,'type':'original gentle instrumental','licensedSongs':False,'voiceover':False},
          'maxDailyModelCalls':2,'maxPexelsQueriesPerReel':6,'maxHostedMB':350,'retentionDays':7,
          'deployedAt':firestore.SERVER_TIMESTAMP},merge=True)
        db.collection('streams').document('lds-conference').set({'enabled':True,'autoPublish':True,
          'strategyDocument':'contentStrategies/lds-conference','publisherJob':'lds-conference-publisher',
          'mediaStorage':'gcs-public-lifecycle','mediaBucket':'social-media-automation-5c9db-social-media','mediaRetentionDays':8,'status':'active','configVersion':2,
          'captionFormatVersion':2,'deployedImage':image,
          'syncedAt':firestore.SERVER_TIMESTAMP},merge=True)
        subprocess.run(['gcloud','scheduler','jobs','resume','lds-conference-daily','--project='+PROJECT,'--location='+REGION],check=True)
        print('Conference production activated. No immediate live run triggered.')

def validate(kind):
    if kind not in ('single','carousel','reel'):raise ValueError('Invalid format')
    token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
    url=f'https://run.googleapis.com/v2/projects/{PROJECT}/locations/{REGION}/jobs/lds-conference-validation:run'
    body={'overrides':{'containerOverrides':[{'env':[{'name':'DRY_RUN','value':'true'},{'name':'CONFERENCE_FORMAT','value':kind}]}]}}
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(req,timeout=30) as response:print(kind,json.load(response)['name'])

if __name__=='__main__':
    if sys.argv[1]=='run':validate(sys.argv[2])
    else:deploy(sys.argv[2],sys.argv[1])
