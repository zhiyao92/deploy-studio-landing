"""Credential-safe local integration dry run; no secrets written to disk."""
import concurrent.futures
import os
from pathlib import Path
import subprocess
import sys

mapping={'ANTHROPIC_API_KEY':'lds-anthropic-api-key','BUFFER_API_TOKEN':'lds-buffer-api-token','GITHUB_TOKEN':'lds-github-token','SLACK_BOT_TOKEN':'lds-slack-bot-token','SLACK_APPROVAL_CHANNEL':'lds-slack-approval-channel','SLACK_WEBHOOK_URL':'umbrella-slack-webhook-url','BUFFER_INSTAGRAM_CHANNEL_ID':'lds-buffer-instagram-channel','BUFFER_THREADS_CHANNEL_ID':'lds-buffer-threads-channel','BUFFER_FACEBOOK_CHANNEL_ID':'lds-buffer-facebook-channel','PEXELS_API_KEY':'lds-pexels-api-key'}
def read(item):
    key,name=item
    value=subprocess.check_output(['gcloud','secrets','versions','access','latest','--secret='+name,'--project=social-media-automation-5c9db'],text=True).strip()
    return key,value
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    os.environ.update(dict(pool.map(read,mapping.items())))
os.environ.update(DRY_RUN='true',LDS_FORMAT=sys.argv[1],GITHUB_USERNAME='zhiyao92',GITHUB_REPO='lds-quotes-images',LLM_MODEL='claude-opus-4-8')
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'cloud_jobs/lds'))
from multiformat import run
raise SystemExit(run())
