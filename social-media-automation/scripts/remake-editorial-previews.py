"""Generate local editorial concept decks, without publishing or API calls."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'previews' / 'editorial-2026-09-08'
REG = '/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
W, H, PAD = 1080, 1350, 88

DECKS = {
 'bondify': {
  'brand': 'bondify', 'bg': '#F4F0E9', 'ink': '#242321', 'accent': '#95604E',
  'slides': [
   ('When she says\n“I’m exhausted.”', '5 replies to try when your partner\nhas had a hard day.'),
   ('“Do you want me\nto listen, or help\nyou think it through?”', 'Ask what kind of support she wants\nbefore offering a solution.'),
   ('“What can I take\noff your plate\ntonight?”', 'Offer something specific: dinner,\nthe dishes, or the next errand.'),
   ('“You don’t have to\nexplain it perfectly.”', 'Leave room for a pause.\nLet her find her words.'),
   ('“I noticed how\nmuch you handled\ntoday.”', 'Name the effort you actually saw.\nKeep the appreciation honest.'),
   ('“Want company,\nor a little quiet?”', 'Let her choose.\nRespect the answer.'),
  ],
  'caption': 'When your partner has had a long day, try asking what would help.\n\nThese are conversation ideas, not a formula. Use the words that sound like you, and listen to the answer.\n\nSave this for the evening when you want to help but cannot find the words.\n\n#CouplesCommunication #HealthyRelationships #Marriage #RelationshipAdvice #EmotionalConnection',
 },
 'lds-conference': {
  'brand': 'LDS Conferences', 'bg': '#F3F1EA', 'ink': '#243A3A', 'accent': '#8A7443',
  'slides': [
   ('A full calendar.\nBut room for\nwhat matters?', 'A study reflection on\nGood, Better, Best.'),
   ('Good things can\ncompete for the\nsame hour.', 'Elder Oaks invites us to consider which\nchoices deepen faith and family connection.'),
   ('What deserves\nyour best attention\nthis week?', 'Our reflection prompt:\nName one relationship or spiritual practice.'),
   ('Choose one thing.\nMake room for it.', 'Our application idea:\nSet aside a specific time for that priority.'),
   ('Read. Reflect.\nThen make\none choice.', 'Good, Better, Best\nDallin H. Oaks · October 2007\n\nStudy notes and application, not direct quotations.'),
  ],
  'caption': 'A full schedule can still leave little time for your priorities.\n\nIn Good, Better, Best, Elder Dallin H. Oaks asks us to consider how our choices strengthen faith in Jesus Christ and our families.\n\nOur study prompt: what will you make room for this week?\n\nSource: Good, Better, Best — October 2007 General Conference.\nhttps://www.churchofjesuschrist.org/study/general-conference/2007/10/good-better-best?lang=eng\n\nThese slides include paraphrase and our own application prompts, not direct quotations. Independent study page.\n\n#GeneralConference #ConferenceStudy #LatterDaySaints #FaithInChrist #ComeUntoChrist',
 },
 'kelvintanzy': {
  'brand': '@KelvinTanZY', 'bg': '#F5F5F1', 'ink': '#202324', 'accent': '#507065',
  'slides': [
   ('Does your app\nneed that\nextra feature?', 'A small checklist for\nyour next build decision.'),
   ('Name the job\nbefore the feature.', 'Write one sentence:\n“This helps someone do ___.”'),
   ('Picture the\nmoment of use.', 'Where are they?\nWhat are they trying to finish?'),
   ('Find the\nsmallest useful\nversion.', 'What can you remove while still\nletting someone finish that job?'),
   ('Put it in front\nof someone.', 'Ask them to try the task.\nNotice where they hesitate.'),
   ('Keep the feature\nthat earns\nits place.', 'Save this checklist for\nyour next scope decision.'),
  ],
  'caption': 'Before adding another feature, give it one clear job.\n\nWho is it for? When will they use it? What should they be able to finish?\n\nThen put the smallest useful version in front of someone and watch where they get stuck.\n\nWhich feature are you deciding whether to build?\n\n#BuildInPublic #IndieDev #ProductDesign #AppDevelopment #UXDesign',
 },
}

def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REG, size)

def lines_for(draw, text, face, width):
    lines = []
    for paragraph in text.split('\n'):
        current = ''
        for word in paragraph.split():
            candidate = (current + ' ' + word).strip()
            if draw.textlength(candidate, font=face) > width and current:
                lines.append(current)
                current = word
            else:
                current = candidate
        lines.append(current)
    return lines

def block(draw, text, y, size, fill, bold=False):
    face = font(size, bold)
    lines = lines_for(draw, text, face, W - 2 * PAD)
    for line in lines:
        assert draw.textlength(line, font=face) <= W - 2 * PAD
        draw.text((PAD, y), line, font=face, fill=fill, anchor='lt')
        y += int(size * 1.22)
    return y

def render(key, deck, number, title, body):
    dark = key == 'kelvintanzy' and number in (1, len(deck['slides']))
    bg, ink = ('#222826', '#F5F5F1') if dark else (deck['bg'], deck['ink'])
    accent = '#B8C8BD' if dark else deck['accent']
    im = Image.new('RGB', (W,H), bg)
    d = ImageDraw.Draw(im)
    d.text((PAD,88), deck['brand'], font=font(30), fill=ink, anchor='lt')
    count = f'{number:02d} / {len(deck["slides"]):02d}'
    d.text((W-PAD,88), count, font=font(24), fill=accent, anchor='rt')
    d.line((PAD,179,W-PAD,179), fill=accent, width=2)
    size = 86 if key == 'lds-conference' else 94
    if key == 'bondify' and number > 1:
        size = 82
    y = block(d,title,288,size,ink,bold=key!='lds-conference' and number==1)
    y = block(d,body,y+76,36,accent)
    assert y < H-110, (key,number,y)
    # Intentionally no category, deck name, promo or footer labels.
    return im

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for key, deck in DECKS.items():
        folder = OUT/key
        folder.mkdir(exist_ok=True)
        images=[]
        for n,(title,body) in enumerate(deck['slides'],1):
            im=render(key,deck,n,title,body)
            im.save(folder/f'slide-{n:02d}.png')
            images.append(im)
        sheet=Image.new('RGB',(3*360+4*16,2*450+3*16),'#DDDCD7')
        for n,im in enumerate(images):
            sheet.paste(im.resize((360,450),Image.Resampling.LANCZOS),(16+(n%3)*376,16+(n//3)*466))
        sheet.save(OUT/f'{key}-overview.jpg',quality=95)
        (folder/'caption.txt').write_text(deck['caption']+'\n')
    (OUT/'content.json').write_text(json.dumps(DECKS,indent=2,ensure_ascii=False)+'\n')
    print(OUT)

if __name__=='__main__':
    main()
