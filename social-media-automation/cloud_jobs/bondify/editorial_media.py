"""Editorial cards and four-scene animated message reels, with bounded text fit."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

INK = '#302A32'
PLUM = '#65445E'
IVORY = '#F6F1E9'
ROOT = Path(__file__).parent

def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf'):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    raise RuntimeError('Required font unavailable; refuse fallback boxes')

def text_block(im, text, box, max_size=70, color=INK):
    if not text.isascii():
        raise ValueError('Non-ASCII text must be normalized before rendering')
    x, y, right, bottom = box
    draw = ImageDraw.Draw(im)
    for size in range(max_size, 31, -2):
        face = font(size)
        lines = []
        for paragraph in text.split('\n'):
            line = ''
            for word in paragraph.split():
                if draw.textlength(word, font=face) > right-x:
                    raise ValueError('Word exceeds safe width')
                candidate = (line + ' ' + word).strip()
                if line and draw.textlength(candidate, font=face) > right-x:
                    lines.append(line)
                    line = word
                else:
                    line = candidate
            lines.append(line)
        step = int(size*1.35)
        if len(lines)*step <= bottom-y:
            break
    else:
        raise ValueError('Text overflow; refuse to publish')
    top = y + (bottom-y-len(lines)*step)//2
    for line in lines:
        draw.text((x, top), line, font=face, fill=color, anchor='lt')
        top += step

def brand(im, y):
    d = ImageDraw.Draw(im)
    # Existing white heart mark, on plum, no generic category/deck footer.
    d.rounded_rectangle((80, y, 136, y+56), 16, fill=PLUM)
    logo = Image.open(ROOT/'assets/bondify-heart-light.png').convert('RGBA')
    logo.thumbnail((40, 40), Image.Resampling.LANCZOS)
    im.paste(logo, (88, y+8), logo)
    d.text((155, y+28), 'Bondify', font=font(30), fill=PLUM, anchor='lm')

def card(text, path, index=1, total=1):
    im = Image.new('RGB', (1080, 1350), IVORY)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((80, 160, 180, 170), 5, fill=PLUM)
    text_block(im, text, (85, 290, 970, 1040), 76 if index==1 else 65)
    brand(im, 1190)
    if total > 1:
        d.text((970, 1220), f'{index}/{total}', font=font(25), fill=PLUM, anchor='rm')
    im.save(path, format='JPEG', quality=92, optimize=True, progressive=True)
    return path

def scene(slides, n):
    im = Image.new('RGB', (1080, 1920), IVORY)
    d = ImageDraw.Draw(im)
    if n in (0, 3):
        text_block(im, slides[n], (95, 450, 960, 1150), 78)
    else:
        text_block(im, slides[0], (95, 240, 960, 480), 48)
        d.text((90, 555), 'Instead of...', font=font(30), fill=PLUM)
        d.rounded_rectangle((80, 610, 900, 960), 45, fill='#E7DCE3')
        text_block(im, slides[1], (125, 660, 850, 910), 52)
        if n == 2:
            d.text((190, 975), 'Try...', font=font(30), fill=PLUM)
            d.rounded_rectangle((180, 1020, 1000, 1400), 45, fill=PLUM)
            text_block(im, slides[2], (225, 1080, 950, 1340), 52, '#FFFFFF')
        else:
            for x in (825, 855, 885):
                d.ellipse((x, 1070, x+12, 1082), fill=PLUM)
    brand(im, 1540)
    for i in range(4):
        d.rounded_rectangle((80+i*230, 1670, 285+i*230, 1676), 3, fill=PLUM if i<=n else '#DED3D8')
    return im

def reel(slides, folder):
    if len(slides) != 4:
        raise ValueError('Reel requires four scenes')
    segments = []
    for n in range(4):
        still = folder/f'scene-{n}.png'
        scene(slides, n).save(still)
        out = folder/f'segment-{n}.mp4'
        # Gentle camera movement and fades, with distinct message states over time.
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(still),
            '-vf',"zoompan=z='min(zoom+0.00012,1.015)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=120:s=1080x1920:fps=24,fade=t=in:st=0:d=0.2,fade=t=out:st=4.8:d=0.2",
            '-t','5','-c:v','libx264','-preset','veryfast','-crf','25','-pix_fmt','yuv420p','-threads','2',str(out)],
            check=True, capture_output=True, timeout=120)
        segments.append(out)
    dest = folder/'reel.mp4'
    cmd = ['ffmpeg','-hide_banner','-loglevel','error','-y']
    for p in segments:
        cmd += ['-i',str(p)]
    cmd += ['-f','lavfi','-i','sine=frequency=220:duration=20:sample_rate=22050',
            '-filter_complex_threads','1','-filter_complex',
            '[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v];[4:a]volume=0.035,afade=t=in:d=2,afade=t=out:st=18:d=2[a]',
            '-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','25','-threads','2',
            '-c:a','aac','-b:a','64k','-pix_fmt','yuv420p','-movflags','+faststart','-t','20',str(dest)]
    subprocess.run(cmd, check=True, capture_output=True, timeout=180)
    result = subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(dest)],check=True,capture_output=True,text=True,timeout=20)
    info = json.loads(result.stdout)
    v = next(s for s in info['streams'] if s['codec_type']=='video')
    if (v['width'],v['height']) != (1080,1920) or not 19.9<=float(info['format']['duration'])<=20.1 or dest.stat().st_size>25*1024*1024:
        raise ValueError('Video failed technical checks')
    return dest
