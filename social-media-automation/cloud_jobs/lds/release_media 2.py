"""Short-lived public media assets, isolated from repository Git history."""
import mimetypes
import os
from datetime import datetime, timezone, timedelta
import requests

TAG='lds-automation-media-v1'

class ReleaseMedia:
    def __init__(self):
        self.repo=os.environ.get('GITHUB_USERNAME','zhiyao92')+'/'+os.environ.get('GITHUB_REPO','lds-quotes-images')
        self.base='https://api.github.com/repos/'+self.repo
        self.headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json'}
        r=requests.get(self.base+'/releases/tags/'+TAG,headers=self.headers,timeout=30)
        if r.status_code==404:
            r=requests.post(self.base+'/releases',headers=self.headers,json={'tag_name':TAG,'name':'LDS automation media','body':'Temporary rendered media for the LDS Quotes publishing workflow.','make_latest':'false'},timeout=30)
            if r.status_code==422:
                # Concurrent dry runs may create the same release simultaneously.
                r=requests.get(self.base+'/releases/tags/'+TAG,headers=self.headers,timeout=30)
        if r.status_code not in (200,201):raise RuntimeError(f'GitHub media release HTTP {r.status_code}')
        self.release=r.json()

    def upload(self,path,name):
        if not name.startswith('ldsauto-'):raise ValueError('Invalid owned media prefix')
        if path.stat().st_size>25*1024*1024:raise ValueError('Media upload exceeds budget')
        inventory=requests.get(self.base+f'/releases/{self.release["id"]}/assets',params={'per_page':100},headers=self.headers,timeout=30)
        if inventory.status_code!=200:raise RuntimeError('Media budget inventory failed')
        existing=inventory.json()
        if len(existing)>=80 or sum(a['size'] for a in existing)+path.stat().st_size>350*1024*1024:
            raise RuntimeError('Media retention budget reached; resolve pending deliveries before uploading more')
        url=self.release['upload_url'].split('{')[0]
        headers={**self.headers,'Content-Type':mimetypes.guess_type(path.name)[0] or 'application/octet-stream'}
        with path.open('rb') as f:r=requests.post(url,params={'name':name},headers=headers,data=f,timeout=120)
        if r.status_code!=201:raise RuntimeError(f'Media upload HTTP {r.status_code}')
        a=r.json();public=a['browser_download_url']
        # Verify anonymously, including GitHub's download redirect.
        with requests.get(public,stream=True,timeout=30) as check:
            if check.status_code!=200:raise RuntimeError(f'Public media URL HTTP {check.status_code}')
            next(check.iter_content(1024))
        return {'id':a['id'],'url':public,'name':name}

    def cleanup(self,db):
        cutoff=datetime.now(timezone.utc)-timedelta(days=7)
        # Only this release and prefix. Never touch legacy files or unknown assets.
        r=requests.get(self.base+f'/releases/{self.release["id"]}/assets',params={'per_page':100},headers=self.headers,timeout=30)
        if r.status_code!=200:raise RuntimeError('Media inventory failed')
        deleted=0
        for a in r.json():
            if not a['name'].startswith('ldsauto-') or datetime.fromisoformat(a['created_at'].replace('Z','+00:00'))>cutoff:continue
            # Names encode the owning run, whose post statuses gate deletion.
            run_id=a['name'].split('--')[1]
            run=db.collection('ldsPublishingRuns').document(run_id).get().to_dict() or {}
            safe_failure=run.get('status')=='needs_attention' and not run.get('attempts')
            if run.get('status') not in ('dry_run_complete','sent') and not safe_failure:continue
            resp=requests.delete(self.base+f'/releases/assets/{a["id"]}',headers=self.headers,timeout=30)
            if resp.status_code not in (204,404):raise RuntimeError('Media cleanup failed')
            deleted+=1
            if deleted>=30:break
        return deleted
