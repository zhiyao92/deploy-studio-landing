"""Bounded Claude lesson generation and separate written-language review."""
import hashlib
import json
import os
import re
from datetime import date
import anthropic

KINDS=('single','carousel')
RULES='''Beam teaches practical Thai to English-speaking beginners. Be respectful,
specific and useful without app promotion. No stereotypes or claims about all Thai
people. No pronunciation audio. Romanization is simplified ASCII with tones omitted;
never present it as a precise pronunciation guide. Thai spelling remains internal for
checking, not on media or captions. Use one consistent spelling for repeated words.
Use short, natural phrases and specify the context. Prefer common everyday usage.
Never invent cultural facts or sources. Do not pretend examples are native-certified.
Distinguish common male/female polite endings without treating them as universal rules.
No medical, financial, legal or sensitive advice. No slang, insults, or adult content.'''

def kind_for(day,override=None,dry=False):
    if override:
        if not dry or override not in KINDS:raise ValueError('Overrides are dry-run only')
        return override
    # Four swipe-to-reveal lessons and three focused phrase cards per week.
    return ('carousel','single','carousel','single','carousel','single','carousel')[day.weekday()]

def text(value,limit):
    if not isinstance(value,str) or not value.strip() or len(value)>limit:raise ValueError('Invalid/oversized text')
    if not value.isascii() or re.search(r'[#*`]|https?://|[\x00-\x1f]',value):raise ValueError('Non-ASCII or non-plain media text')

def validate(p):
    for key,limit in [('title',40),('context',100),('note',200)]:text(p.get(key),limit)
    for key in ('a','b'):
        f=p.get(key,{})
        for name,limit in [('roman',62),('meaning',75)]:text(f.get(name),limit)
        if not isinstance(f.get('thai'),str) or len(f['thai'])>100 or not re.fullmatch(r'[\u0e00-\u0e7f\s]+',f['thai']):
            raise ValueError('Invalid internal Thai spelling')
        if any(bad in f['thai'] for bad in ('น้อยน้ำตาล','นะค่ะ')) or f['thai'] in ('เช็คหน่อย','ขอเช็คหน่อยได้ไหม'):
            raise ValueError('Known incorrect or ambiguous Thai construction')
    for key,count,limit in [('distractors',2,65),('paragraphs',3,220)]:
        if len(p.get(key,[]))!=count:raise ValueError('Wrong caption/options count')
        for item in p[key]:text(item,limit)
    if len({s.casefold().strip(' .!?') for s in [p['a']['meaning']]+p['distractors']})!=3:
        raise ValueError('Quiz options overlap')
    tags=p.get('hashtags',[])
    if len(tags)!=5 or len(set(t.casefold() for t in tags))!=5 or not {'#BeamLearnThai','#LearnThai'}.issubset(tags):
        raise ValueError('Need five unique hashtags including brand')
    if any(not re.fullmatch(r'#[A-Za-z0-9]+',t) for t in tags):raise ValueError('Invalid hashtag')
    return p

def obj(fields):return {'type':'object','properties':fields,'required':list(fields),'additionalProperties':False}
def schema():
    def short(n,description):
        return {'type':'string','pattern':'^[ -~]+$','description':description+' Maximum '+str(n)+' characters. ASCII English/romanization only. No Thai script.'}
    phrase=obj({'thai':{'type':'string','pattern':'^[ก-๛ ]+$','description':'Internal Thai spelling for review only. Maximum 100 characters.'},
                'roman':short(55,'Simplified romanization of exactly the Thai phrase.'),
                'meaning':short(65,'Exact concise English translation.')})
    return obj({'title':short(35,'Short hook.'),
        'context':short(85,'One short sentence specifying the situation.'),
        'a':phrase,'b':phrase,'note':short(130,'One concise usage tip, no universal cultural claims.'),
        'distractors':{'type':'array','items':short(65,'Incorrect English answer, no Thai or romanization.'),'description':'Exactly two wrong answers.'},
        'paragraphs':{'type':'array','items':short(180,'Short caption paragraph, no Thai script.'),'description':'Exactly three concise paragraphs: hook, explanation, save/try action.'},
        'hashtags':{'type':'array','items':{'type':'string','pattern':'^#[A-Za-z0-9]+$'},'description':'Exactly five relevant unique hashtags including #BeamLearnThai and #LearnThai.'}})

def decode(response):
    raw='\n'.join(b.text for b in response.content if b.type=='text').strip()
    # Some reviewers surround their JSON with a short explanation or code fence.
    # Parse one complete object; truncation still fails closed.
    start=raw.find('{')
    if start<0:raise ValueError('Model did not return a JSON object')
    result,_=json.JSONDecoder().raw_decode(raw[start:])
    if not isinstance(result,dict):raise ValueError('Expected a JSON object')
    return result

def normalize(p):
    """Normalize typography only; never transliterate or discard Thai characters."""
    mapping=str.maketrans({'\u2018':"'",'\u2019':"'",'\u201c':'"','\u201d':'"','\u2013':'-','\u2014':' - ','\u00a0':' ','\u2026':'...'})
    if isinstance(p,str):return p.translate(mapping)
    if isinstance(p,list):return [normalize(v) for v in p]
    if isinstance(p,dict):return {k:normalize(v) for k,v in p.items()}
    return p

def generate(kind,day,recent,record):
    client=anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'],max_retries=0,timeout=100)
    model=os.environ.get('ANTHROPIC_MODEL','claude-haiku-4-5-20251001')
    specific={
        'single':'A is one useful phrase for a specific real-life situation. B is a related phrase for that same situation. Keep the card focused on one main takeaway.',
        'carousel':'Create an interactive swipe-to-reveal mini lesson, not a list of phrases. A is the phrase learners must decode; its meaning is the correct answer. Give two plausible but unambiguously incorrect English choices. B is a related phrase learners can use in the same scene. Title should be a short curiosity hook; context should set up a concrete question that can be answered from A. Note should explain the practical usage briefly.'}[kind]
    prompt=RULES+'\nCreate a '+kind+' lesson for '+str(day)+'. '+specific+'''
Return JSON matching schema. Title <=35 chars, context <=85, note <=130.
Each romanization <=55 chars and English meaning <=65. Prefer fewer than 8 words
per phrase. Internal Thai contains only Thai script and spaces. All other fields
ASCII only. Caption paragraphs: exactly three, opening/context, helpful explanation,
one save/try action; <=180 chars each. Exactly five hashtags including #BeamLearnThai
and #LearnThai. Do NOT cite unverifiable sources. Exactly two English distractors,
even for non-quiz formats. Avoid these recent topics and phrases:\n'''+json.dumps(recent)
    # Keep provider grammar small: local validation is authoritative. The nested
    # multilingual regex schema exceeds this model's compiled grammar budget.
    prompt+='\nReturn JSON only. Follow these field definitions exactly:\n'+json.dumps(schema(),ensure_ascii=False)
    response=client.messages.create(model=model,max_tokens=1400,system=RULES,messages=[{'role':'user','content':prompt}])
    usage={'generation':response.usage.model_dump(exclude_none=True)}
    lesson=normalize(decode(response))
    record.update({'usage':usage,'draft':lesson})
    review_model=os.environ.get('ANTHROPIC_REVIEW_MODEL','claude-sonnet-4-6')
    review=client.messages.create(model=review_model,max_tokens=1800,system=RULES,messages=[{'role':'user','content':RULES+'''
Independently check this written lesson. Check Thai spelling, natural wording,
romanization mapping (tone omission is intentional), exact English meanings,
appropriate polite endings, contextual/cultural note and non-misleading captions.
For carousel ensure A answers the contextual challenge and both distractors are wrong.
B must be useful in the same scene. For a single card keep the lesson focused. You may correct minor wording
and shorten the draft, but reject if unsure of the underlying Thai or meaning.
Remove sweeping claims. Keep ALL display/caption fields ASCII English/romanization.
Specific pitfalls to reject/correct: little sugar is nam taan noi (น้ำตาลน้อย),
not noi nam taan (น้อยน้ำตาล). The polite combination is นะคะ, not นะค่ะ.
For a restaurant bill use the full chek bin/chek bil (เช็คบิล) or khit ngoen
(คิดเงิน), not chek alone, which is ambiguous. Reflect any correction consistently
in romanization, translations, context, note and every caption paragraph.
Only a.thai and b.thai contain Thai script. Make note ONE short sentence, <=130
characters. Title <=35, context <=85, roman <=55, meaning <=65. Three caption
paragraphs <=180 characters each. Exactly two English distractors, five ASCII
hashtags including #BeamLearnThai and #LearnThai. Do not truncate words or meaning.
This is AI written-language review and refinement, not native certification.
Do not explain your reasoning. Return one compact JSON object only. Preserve the
exact lesson schema: title, context, a, b, note, distractors, paragraphs, hashtags.
Never add, remove, or rename lesson fields. Every content format uses this same
schema. For carousel specifically, a.meaning is the correct answer, distractors are
the two incorrect answer choices, and b remains a related useful phrase; do not
replace these fields with question or answer fields.
Return JSON only {"approved":true or false,"issues":[unresolved issues only],
"lesson":the complete corrected lesson object with all original fields}.
Format: '''+kind+'\nDraft: '+json.dumps(lesson,ensure_ascii=False)}])
    usage['review']=review.usage.model_dump(exclude_none=True)
    record.update({'usage':usage,'reviewStopReason':review.stop_reason})
    try:verdict=decode(review)
    except (ValueError,json.JSONDecodeError):
        record.update({'unparsedReview':'\n'.join(b.text for b in review.content if b.type=='text')})
        raise
    usage['models']={'generation':model,'review':review_model}
    record.update({'languageReview':{'approved':verdict.get('approved'),'issues':verdict.get('issues')},'reviewedDraft':verdict.get('lesson'),'usage':usage})
    if verdict.get('approved') is not True or verdict.get('issues')!=[]:raise ValueError('Written-language review rejected lesson')
    lesson=validate(normalize(verdict.get('lesson',{})))
    if lesson['a']['thai'] in [r.get('thai') for r in recent]:raise ValueError('Primary phrase was used recently')
    return lesson

def caption(p):
    return '\n\n'.join([
        p['paragraphs'][0],
        'Why it works:\n'+p['paragraphs'][1],
        'Try it:\n'+p['paragraphs'][2],
        'Romanization note:\nSimplified romanization; tones are not shown.',
        ' '.join(p['hashtags']),
    ])
