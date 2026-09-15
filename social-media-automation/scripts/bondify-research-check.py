"""Run the bounded weekly plan once, keeping its secret in process memory only."""
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from google.cloud import firestore

os.environ['ANTHROPIC_API_KEY']=subprocess.check_output(['gcloud','secrets','versions','access','latest','--secret=bondify-anthropic-api-key','--project=social-media-automation-5c9db'],text=True).strip()
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'cloud_jobs/bondify'))
from editorial_research import make_week
try:
    result=make_week(firestore.Client(project='social-media-automation-5c9db'),datetime.now(ZoneInfo('Asia/Kuala_Lumpur')).date(), resume='--resume' in sys.argv)
    print('Weekly plan:',result['week'],result['status'])
    print('Topics:',[p['topic'] for p in result['posts']])
    print('Usage:',result['usage'])
except Exception as exc:
    print('Research check failed:',type(exc).__name__)
    if isinstance(exc,ValueError):print(str(exc))
    if type(exc).__name__=='BadRequestError':
        print(str(getattr(exc,'body',{})).replace(os.environ['ANTHROPIC_API_KEY'],'[REDACTED]')[:1200])
    raise SystemExit(1)
