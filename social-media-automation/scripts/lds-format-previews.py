"""Local LDS Quotes format concepts. No publishing or paid API calls."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random
import subprocess
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'previews/lds-formats-2026-09-08-branded'
SERIF = '/System/Library/Fonts/Supplemental/Georgia Italic.ttf'
SANS = '/System/Library/Fonts/Supplemental/Arial.ttf'
W,H=1080,1350

def card(text, sub='', number=None):
    im=Image.new('RGB',(W,H),'#F4EFE3')
    d=ImageDraw.Draw(im)
    rng=random.Random(83)
    for _ in range(70000):
        x,y=rng.randrange(W),rng.randrange(H)
        d.point((x,y),fill=rng.choice(['#F0EBDF','#F6F1E5','#EEE9DD']))
    face=ImageFont.truetype(SERIF,72)
    lines=text.split('\n')
    top=H//2-len(lines)*96//2-45
    for line in lines:
        assert d.textlength(line,font=face)<W-180
        d.text((W//2,top),line,font=face,fill='#28453B',anchor='mt')
        top+=96
    if sub:
        small=ImageFont.truetype(SANS,29)
        for line in sub.split('\n'):
            d.text((W//2,top+50),line,font=small,fill='#65716A',anchor='mt')
            top+=42
    d.text((W//2,1100),'Original devotional reflection',font=ImageFont.truetype(SANS,23),fill='#65716A',anchor='mt')
    # Required branding on every single and carousel slide, never at the top.
    logo=Image.open(ROOT/'cloud_jobs/lds/assets/logo.png').convert('RGBA').resize((64,64),Image.Resampling.LANCZOS)
    mask=Image.new('L',(64,64),0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,63,63),radius=14,fill=255)
    face=ImageFont.truetype(SANS,36)
    width=64+18+int(d.textlength('LDS Quotes',font=face))
    left=(W-width)//2
    d.rounded_rectangle((left-20,1170,left+width+20,1270),radius=45,fill='#E7E7DA')
    im.paste(logo,(left,1188),mask)
    d.text((left+82,1220),'LDS Quotes',font=face,fill='#28453B',anchor='lm')
    if number:
        d.text((970,1250),number,font=ImageFont.truetype(SANS,23),fill='#65716A',anchor='rt')
    return im

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    card('You can begin again\nwith Christ.\nEven today.').save(OUT/'single.png')
    slides=[
      ('For the day\nyour faith\nfeels tired.', 'A quiet moment, one slide at a time.'),
      ('Start with\nan honest prayer.', 'You do not need polished words.'),
      ('Read one verse.\nStay with it.', 'Give yourself a moment to reflect.'),
      ('Let someone\nwalk beside you.', 'Tell someone you trust how you are doing.'),
      ('Take one small\nstep toward\nChrist today.', 'Save this for a day you need it.'),
    ]
    sheet=Image.new('RGB',(1144,948),'#DCD9D1')
    for n,(text,sub) in enumerate(slides,1):
        im=card(text,sub,f'{n} / 5')
        im.save(OUT/f'carousel-{n:02d}.png')
        sheet.paste(im.resize((360,450),Image.Resampling.LANCZOS),(16+((n-1)%3)*376,16+((n-1)//3)*466))
    sheet.save(OUT/'carousel-overview.jpg',quality=95)
    source=Path('/Users/kelvintan/.codex/generated_images/01a06bda-e9a2-7a72-84c6-db3bc70a5e7d/exec-2b20b934-aa9f-4aea-9d6e-78500043b1e0.png')
    shutil.copy2(source,OUT/'reel-cover.png')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-i',str(OUT/'reel-cover.png'),'-vf',"scale=1080:1920,zoompan=z='1+0.00012*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=360:s=1080x1920:fps=30",'-t','12','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(OUT/'reel.mp4')],check=True)
    print(OUT)

if __name__=='__main__':
    main()
