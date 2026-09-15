"""Enable only after the pinned deployment and all three Slack-verified dry runs."""
import subprocess
import sys
from google.cloud import firestore

PROJECT='social-media-automation-5c9db'
IMAGE=sys.argv[1]
assert '@sha256:' in IMAGE,'Use an immutable image digest'
current=subprocess.check_output(['gcloud','beta','run','jobs','describe','lds-quotes-publisher','--project='+PROJECT,'--region=us-central1','--format=value(spec.template.spec.template.spec.containers[0].image)'],text=True).strip()
assert current==IMAGE,'Deployment image does not match validated version'
db=firestore.Client(project=PROJECT)
passed={}
for snap in db.collection('ldsPublishingRuns').order_by('createdAt',direction=firestore.Query.DESCENDING).limit(20).stream():
    data=snap.to_dict()
    if (data.get('dryRun') and data.get('status')=='dry_run_complete' and data.get('slackVerified')
            and data.get('image')==IMAGE):
        passed.setdefault(data['format'],snap.id)
assert set(passed)=={'single','carousel','reel'},'All formats must pass Slack-verified dry runs first'
db.collection('contentStrategies').document('lds-quotes').set({
 'multiformatEnabled':True,'runtimeStatus':'multiformat-deployed-and-dry-run-verified','deployedImage':IMAGE,
 'pendingRequirements':[],'validationRuns':passed,'deployedAt':firestore.SERVER_TIMESTAMP,
 'weeklyFormats':['carousel','reel','single','carousel','reel','single','single'],
 'postingTime':'04:30','deliveryCheckTime':'05:00','timezone':'Asia/Kuala_Lumpur',
 'mediaHosting':'gcs-public-lifecycle','mediaBucket':'social-media-automation-5c9db-social-media','retentionDays':8,'maxHostedMB':350,
 'maxOutputTokens':1400,'maxPexelsQueries':6,'neverReuseProviderVideoId':True,
 'scope':'Instagram format mix; Threads and Facebook static companion cards',
 'captionFormatVersion':2,
},merge=True)
db.collection('streams').document('lds-quotes').set({
 'enabled':True,'autoPublish':True,'status':'active','configVersion':2,
 'strategyDocument':'contentStrategies/lds-quotes','publisherJob':'lds-quotes-publisher',
 'captionFormatVersion':2,'deployedImage':IMAGE,'mediaStorage':'gcs-public-lifecycle',
 'mediaBucket':'social-media-automation-5c9db-social-media','mediaRetentionDays':8,
 'syncedAt':firestore.SERVER_TIMESTAMP,
},merge=True)
print('Enabled LDS multi-format publishing. Verified runs:',passed)
