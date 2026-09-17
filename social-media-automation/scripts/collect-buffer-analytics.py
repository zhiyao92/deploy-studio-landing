"""Read-only Buffer analytics snapshot collector for the Marketing Strategy section.

Requires BUFFER_ACCESS_TOKEN and optionally BUFFER_CHANNEL_IDS (comma-separated).
It never creates, edits, schedules, or deletes posts.
"""
import os
from datetime import datetime, timezone
import requests
from google.cloud import firestore

PROJECT='social-media-automation-5c9db'
QUERY='''query($after:String){posts(first:100,after:$after){edges{node{id status text sentAt channel{id service} metrics{impressions reach likes comments shares saves engagementRate}}} pageInfo{hasNextPage endCursor}}}'''

def main():
    token=os.environ['BUFFER_ACCESS_TOKEN'].strip()
    channels={x.strip() for x in os.getenv('BUFFER_CHANNEL_IDS','').split(',') if x.strip()}
    db=firestore.Client(project=PROJECT); now=datetime.now(timezone.utc)
    cursor=None; count=0
    while True:
        r=requests.post('https://api.buffer.com/',headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},json={'query':QUERY,'variables':{'after':cursor}},timeout=40)
        r.raise_for_status(); body=r.json()
        if body.get('errors'): raise RuntimeError('Buffer analytics query rejected: '+str(body['errors'])[:400])
        page=body['data']['posts']
        for edge in page['edges']:
            post=edge['node']; channel=post.get('channel') or {}
            if channels and channel.get('id') not in channels: continue
            db.collection('marketingAnalytics').document(post['id']).set({'source':'buffer','postId':post['id'],'status':post.get('status'),'sentAt':post.get('sentAt'),'channel':channel,'metrics':post.get('metrics') or {},'capturedAt':now},merge=True); count+=1
        if not page['pageInfo']['hasNextPage']: break
        cursor=page['pageInfo']['endCursor']
    db.collection('marketingAnalyticsRuns').document(now.strftime('%Y-%m-%d')).set({'capturedAt':now,'source':'buffer','postsCaptured':count,'readOnly':True},merge=True)
    print('Captured',count,'Buffer post metric snapshots')

if __name__=='__main__': main()
