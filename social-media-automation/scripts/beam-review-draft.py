"""Re-review a failed validation draft without another generation call."""
import json, os, subprocess, sys, uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from datetime import date
from google.cloud import firestore
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'cloud_jobs/beam'))
import content

os.environ['ANTHROPIC_API_KEY']=subprocess.check_output([
    'gcloud','secrets','versions','access','latest','--secret=beam-claude-api-key',
    '--project=social-media-automation-5c9db'],text=True).strip()
db=firestore.Client(project='social-media-automation-5c9db')
source_id=sys.argv[1]
source=db.collection('beamPublishingRuns').document(source_id).get().to_dict()
assert source and source.get('dryRun') and source.get('draft')
real=content.anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'],max_retries=0,timeout=100)
class Replay:
    def __init__(self):self.calls=0;self.messages=self
    def create(self,**kwargs):
        self.calls+=1
        if self.calls==1:
            return SimpleNamespace(content=[SimpleNamespace(type='text',text=json.dumps(source['draft']))],
                usage=SimpleNamespace(model_dump=lambda **k:{'replayed':True,'modelCalls':0}))
        return real.messages.create(**kwargs)
rid=f"dry-{date.today()}-{source['format']}-review-{uuid.uuid4().hex[:8]}"
ref=db.collection('beamPublishingRuns').document(rid)
ref.create({'dryRun':True,'format':source['format'],'status':'reviewing','image':'local-review-only',
    'draftSource':source_id,'createdAt':firestore.SERVER_TIMESTAMP})
try:
    with patch.object(content.anthropic,'Anthropic',return_value=Replay()):
        p=content.generate(source['format'],date.today(),[],ref)
    ref.update({'content':p,'status':'reviewed_not_rendered'})
    print(rid,'PASS',p)
except Exception as e:
    ref.update({'status':'needs_attention','errorType':type(e).__name__})
    data=ref.get().to_dict()
    print(rid,type(e).__name__,data.get('reviewStopReason'),data.get('languageReview'),data.get('unparsedReview'))
    raise SystemExit(1)
