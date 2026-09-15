"""Source-grounded Conference social content."""
import json
import os
import re
import anthropic

KINDS=('single','carousel','reel')
MIX=('carousel','reel','single','carousel','reel','single','carousel')

def kind_for(day,override=None,dry=False):
    if override and (not dry or override not in KINDS):raise ValueError('Format override is validation-only')
    return override or MIX[day.weekday()]

def decode(response):
    raw='\n'.join(b.text for b in response.content if b.type=='text').strip()
    start=raw.find('{')
    if start<0:raise ValueError('Claude did not return JSON')
    candidate=raw[start:]
    try:value,_=json.JSONDecoder().raw_decode(candidate)
    except json.JSONDecodeError:
        # Repair only trailing-comma punctuation. Truncated or structurally
        # malformed output still fails closed instead of being published.
        repaired=re.sub(r',\s*([}\]])',r'\1',candidate)
        value,_=json.JSONDecoder().raw_decode(repaired)
    return value

def normalize(data,kind):
    """Apply deterministic layout limits without rewriting Claude's meaning."""
    count={'single':1,'carousel':6,'reel':4}[kind]
    slides=data.get('slides',[])
    if not isinstance(slides,list) or len(slides)<count:raise ValueError('Not enough scene or slide copy')
    data['slides']=slides[:count]
    raw_question=data.get('question','')
    raw_question=raw_question.strip() if isinstance(raw_question,str) else ''
    question=raw_question
    if question and not question.endswith('?'):
        question=question.rstrip('.!')+'?'
    if not question or len(question)>120:
        # Keep a concise first clause where possible; otherwise use a safe,
        # context-neutral reflection prompt instead of failing the whole post.
        clause=re.search(r'[,;:]\s+(?:and|but|or)\b',question[:120],re.IGNORECASE)
        candidate=question[:clause.start()].rstrip(' ,;:')+'?' if clause else ''
        question=candidate if 8<=len(candidate)<=120 and len(candidate.split())>=5 else \
          'What is one way to put this teaching into practice today?'
    data['question']=question
    raw_paragraphs=data.get('paragraphs')
    cleaned=[]
    if isinstance(raw_paragraphs,list):
        for paragraph in raw_paragraphs:
            if not isinstance(paragraph,str):continue
            paragraph=paragraph.replace(question,'').replace(raw_question,'').replace('“','').replace('”','').replace('"','')
            sentences=re.split(r'(?<=[.!?])\s+',paragraph)
            text=' '.join(s for s in sentences if '?' not in s).strip(' -')
            text=re.sub(r'[#*`]|https?://\S+','',text).strip()
            if text and len(text)<=420:cleaned.append(text)
            if len(cleaned)==3:break
    fallback=['This teaching offers a useful way to look at an everyday choice.',
      'The message points us toward what matters most in daily life.',
      'Choose one small way to apply this principle today.']
    while len(cleaned)<3:cleaned.append(fallback[len(cleaned)])
    data['paragraphs']=cleaned
    return data

def validate(data,kind):
    count={'single':1,'carousel':6,'reel':4}[kind]
    slides=data.get('slides',[])
    if len(slides)!=count:raise ValueError('Wrong scene or slide count')
    for slide in slides:
        if not isinstance(slide,str) or not 3<=len(slide.split())<=14 or len(slide)>85 or any(q in slide for q in ('“','”','"')):
            raise ValueError('Invalid media copy')
    paragraphs=data.get('paragraphs',[])
    if len(paragraphs)!=3 or any(not isinstance(p,str) or not p.strip() or len(p)>420 or re.search(r'[#*`?]|https?://',p) for p in paragraphs):
        raise ValueError('Invalid caption paragraphs')
    question=data.get('question','')
    if not isinstance(question,str) or not question.endswith('?') or len(question)>120:raise ValueError('One concise question required')
    tags=data.get('hashtags',[])
    if len(tags)!=5 or '#GeneralConference' not in tags or any(not re.fullmatch(r'#[A-Za-z0-9]+',t) for t in tags):
        raise ValueError('Five relevant hashtags required')
    return data

def generate(kind,source,record):
    prompt=f'''Create one {kind} Instagram post grounded ONLY in this official General Conference transcript.
Purpose: make the teaching useful in everyday life and invite sincere conversation. No clickbait, comment bait,
doctrinal invention, statistics, private-confession prompts or app promotion. Do not use direct quotations:
media and caption are clearly editorial paraphrase/application. Distinguish talk takeaway from our application.
    One natural question only, 8-12 words and no more than 100 characters. Return EXACTLY { {'carousel':6,'reel':4,'single':1}[kind] } slide strings for this {kind}.
Each slide 3-12 words, max 75 characters. Structure: relatable tension, source-grounded insight, practical
application, thoughtful question. Caption: exactly 3 short paragraphs, each under 280 characters:
human hook; sourced explanation; one practical action. Do not put the question inside any paragraph.
Caption paragraphs must contain no question marks and no quotation marks.
Five relevant hashtags including #GeneralConference. Plain text, no Markdown.
Return JSON only: {{"slides":[],"paragraphs":[],"question":"","hashtags":[]}}.
Talk: {source['title']}
Speaker: {source['speaker']}
Conference: {source['conference']}
Official transcript:
{source['transcript']}'''
    client=anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'],max_retries=0,timeout=100)
    model=os.environ.get('ANTHROPIC_MODEL','claude-haiku-4-5-20251001')
    response=client.messages.create(model=model,max_tokens=1200,messages=[{'role':'user','content':prompt}])
    draft=decode(response);record.update({'draft':draft,'aiUsage':response.usage.model_dump(exclude_none=True)})
    data=validate(normalize(draft,kind),kind)
    review_prompt='''Review this editorial Instagram content against the supplied General Conference transcript.
Approve when its central teaching is faithful and the talk summary is a fair paraphrase. Relatable hooks,
rhetorical framing, and clearly practical applications do NOT need to appear word-for-word in the transcript;
they are intentionally editorial. Reject only for a substantive contradiction, fabricated factual claim,
false attribution, invented doctrine, manipulative/private prompt, or text presented as a direct quotation.
It must remain respectful and contain only one non-manipulative caption question. Return JSON only:
{"approved":true or false,"issues":[]}.\nSOURCE:\n'''+source['transcript']+'\nCONTENT:\n'+json.dumps(data)
    review=client.messages.create(model=os.environ.get('ANTHROPIC_REVIEW_MODEL','claude-sonnet-4-6'),max_tokens=300,
      messages=[{'role':'user','content':review_prompt}])
    verdict=decode(review);record.update({'sourceReview':verdict,'reviewUsage':review.usage.model_dump(exclude_none=True)})
    if verdict.get('approved') is not True or verdict.get('issues')!=[]:raise ValueError('Source-grounding review rejected content')
    return data

def caption(data,source,footage=None):
    pieces=[data['paragraphs'][0],
      'From the message:\n'+data['paragraphs'][1],
      'Try this:\n'+data['paragraphs'][2],
      'A question to reflect on:\n'+data['question'],
      f"Source:\n{source['title']} — {source['speaker']}, {source['conference']}\n{source['url']}",
      'About this post:\nEditorial study reflection; not a direct quotation. Independent study page.']
    if footage:pieces += [f"Video credit:\n{footage['creator']} / Pexels\n{footage['sourceUrl']}"]
    pieces += [' '.join(data['hashtags'])]
    return '\n\n'.join(pieces)
