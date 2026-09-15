"""Local editorial previews only. Does not publish or change cloud configuration."""
from pathlib import Path
import math, subprocess, json, sys
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/conference-formats-2026-09-09'
if '--pexels' in sys.argv:OUT=ROOT/'previews/conference-pexels-2026-09-09'
CREAM='#F3F1EA'; INK='#243A3A'; GOLD='#8A7443'
SERIF='/System/Library/Fonts/Supplemental/Georgia.ttf'
SANS='/System/Library/Fonts/Supplemental/Arial.ttf'
SLIDES=[
 ('A full calendar.\nBut room for\nwhat matters?','A study reflection on\nGood, Better, Best.'),
 ('Good things can\ncompete for\nyour time.','Talk takeaway: choose what strengthens\nfaith in Christ and family.'),
 ('Name one\npriority.','Our application: a relationship\nor a spiritual practice.'),
 ('Give it a place\nin your week.','Our application: choose a time,\nnot just an intention.'),
 ('Make room.\nNot more pressure.','Our reflection: one realistic adjustment\nis enough to begin.'),
 ('What helps you\nprotect time for\nwhat matters?','Our discussion prompt.\nShare an idea that works for you.')]
SCENES=[
 ('Your week\nis full.','Is there room for what matters?'),
 ('Choose what\nstrengthens faith\nand family.','Talk takeaway / paraphrase'),
 ('Make one\nsmall adjustment.','Our application: set aside time\nfor one priority.'),
 ('What helps you\nprotect that time?','Our discussion prompt')]

def text(im,value,box,size,color,serif=False):
    d=ImageDraw.Draw(im);x,y,right,bottom=box
    for n in range(size,13,-2):
        f=ImageFont.truetype(SERIF if serif else SANS,n);lines=[]
        for para in value.split('\n'):
            line=''
            for word in para.split():
                trial=(line+' '+word).strip()
                if d.textlength(trial,font=f)>right-x and line:lines.append(line);line=word
                else:line=trial
            lines.append(line)
        step=int(n*1.25)
        if len(lines)*step<=bottom-y and all(d.textlength(s,font=f)<=right-x for s in lines):break
    else:raise ValueError('Text cannot fit')
    for line in lines:d.text((x,y),line,font=f,fill=color,anchor='lt');y+=step

def card(title,body,index,total,dark=False):
    bg,fg=(INK,CREAM) if dark else (CREAM,INK)
    im=Image.new('RGB',(1080,1350),bg);d=ImageDraw.Draw(im)
    accent='#C1AD80' if dark else GOLD
    text(im,'CONFERENCE / IN EVERYDAY LIFE',(86,90,990,135),25,accent)
    d.line((86,182,994,182),fill=accent,width=1)
    text(im,title,(86,295,994,795),86,fg,True)
    text(im,body,(90,850,990,1010),34,fg)
    text(im,'Good, Better, Best / Dallin H. Oaks / Oct 2007',(86,1090,995,1138),24,accent)
    text(im,'Study reflection, not a direct quotation.',(86,1140,995,1185),23,accent)
    d.line((86,1220,994,1220),fill=accent,width=1)
    text(im,'LDS Conferences / Independent study',(86,1250,895,1290),25,fg)
    text(im,f'{index:02d}/{total:02d}' if total>1 else 'REFLECT',(905,1250,1010,1290),22,accent)
    return im

def reel():
    w,h,fps,seconds=720,1280,24,24
    source=ROOT/'previews/lds-motion-reel/nature-source.mp4'
    if '--pexels' in sys.argv:
        from conference_pexels import fetch
        source=fetch(OUT)
    dec=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-i',str(source),
        '-vf',f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps={fps}',
        '-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
    path=OUT/'conference-reel.mp4'
    enc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo',
        '-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(fps),'-i','-','-an','-vf','scale=1080:1920',
        '-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p',
        '-movflags','+faststart','-threads','2',str(path)],stdin=subprocess.PIPE)
    try:
        for i in range(fps*seconds):
            raw=dec.stdout.read(w*h*3)
            if len(raw)!=w*h*3:raise RuntimeError('Footage ended early')
            im=Image.frombytes('RGB',(w,h),raw)
            # Dark tint protects readability even over white surf and bright sky.
            im=Image.blend(im,Image.new('RGB',(w,h),INK),.57).convert('RGBA')
            t=i/fps;scene=min(int(t/6),3);local=t-scene*6
            opacity=min(1,local/.65)*min(1,(6-local)/.45)
            layer=Image.new('RGBA',(w,h));offset=int(20*(1-min(1,local/.7)))
            text(layer,SCENES[scene][0],(62,330+offset,658,620+offset),55,CREAM,True)
            text(layer,SCENES[scene][1],(65,660,655,770),25,CREAM)
            layer.putalpha(layer.getchannel('A').point(lambda a:int(a*opacity)))
            im=Image.alpha_composite(im,layer)
            text(im,'CONFERENCE / IN EVERYDAY LIFE',(62,165,660,220),19,'#E6D5AE')
            text(im,'Good, Better, Best / Dallin H. Oaks',(62,950,660,990),21,CREAM)
            text(im,'October 2007 / Study notes, not quotations',(62,992,660,1035),19,CREAM)
            d=ImageDraw.Draw(im);d.line((62,1070,658,1070),fill='#C1AD80',width=1)
            text(im,'LDS Conferences / Independent study',(62,1100,660,1150),23,CREAM)
            for n in range(4):
                d.rounded_rectangle((62+n*150,835,192+n*150,839),2,fill='#E6D5AE' if n<=scene else '#647771')
            im=im.convert('RGB')
            if i in (72,216,360,504):im.save(OUT/f'reel-scene-{scene+1}.png')
            enc.stdin.write(im.tobytes())
    finally:
        enc.stdin.close();dec.stdout.close();dec.terminate();dec.wait(timeout=10)
    if enc.wait(timeout=60):raise RuntimeError('Video encoding failed')
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True))
    assert len(meta['streams'])==1 and meta['streams'][0]['width']==1080 and meta['streams'][0]['height']==1920
    assert abs(float(meta['format']['duration'])-24)<.1
    print(path,flush=True)

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    cards=[]
    for i,(title,body) in enumerate(SLIDES,1):
        im=card(title,body,i,6,dark=i==6);im.save(OUT/f'carousel-{i}.png');cards.append(im)
    sheet=Image.new('RGB',(1112,932),'#DBD9D1')
    for i,im in enumerate(cards):sheet.paste(im.resize((360,450)),(8+(i%3)*368,8+(i//3)*466))
    sheet.save(OUT/'carousel-overview.jpg',quality=95)
    card('Something can\nbe good—and still\nneed less of\nyour time.','Our reflection on Good, Better, Best.',1,1,True).save(OUT/'single.png')
    reel()

if __name__=='__main__':main()
