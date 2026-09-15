"""Fetch only configured official General Conference transcripts."""
import re
import requests
from bs4 import BeautifulSoup

def fetch(url):
    pattern=r'https://www\.churchofjesuschrist\.org/study/general-conference/\d{4}/\d{2}/[a-z0-9-]+\?lang=eng'
    if not re.fullmatch(pattern,url):
        raise ValueError('Source is not an approved English General Conference URL')
    response=requests.get(url,headers={'User-Agent':'LDS-Conferences-study-publisher/1.0'},timeout=30)
    if response.status_code!=200:raise RuntimeError(f'Official source HTTP {response.status_code}')
    response.encoding='utf-8'
    soup=BeautifulSoup(response.text,'html.parser')
    title=soup.find('h1');author=soup.select_one('p.author-name');body=soup.select_one('div.body-block')
    if not title or not author or not body:raise RuntimeError('Official transcript structure unavailable')
    transcript='\n'.join(p.get_text(' ',strip=True) for p in body.find_all('p') if p.get_text(' ',strip=True))
    if len(transcript)<1500:raise RuntimeError('Official transcript is unexpectedly short')
    path=url.split('?')[0].split('/')
    return {'url':url,'title':title.get_text(' ',strip=True),
      'speaker':re.sub(r'^By\s+','',author.get_text(' ',strip=True)),
      'conference':path[-3]+'-'+path[-2],'transcript':transcript[:60000]}

def select(db,day,pool):
    if not pool:raise RuntimeError('No approved official source URLs configured')
    used={d.to_dict().get('sourceUrl') for d in db.collection('conferencePublishingRuns').order_by(
      'createdAt',direction='DESCENDING').limit(min(30,len(pool))).stream()}
    available=[u for u in pool if u not in used]
    choices=available or pool
    return fetch(choices[day.toordinal()%len(choices)])
