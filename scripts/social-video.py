# Vídeo vertical (1080x1920, 30 fps) del primer aniversario para TikTok y Reels.
# Uso: python scripts/social-video.py   (requiere Pillow, segno, imageio-ffmpeg y Node). Salida en redes/.
# Reutiliza el diseño de scripts/social-images.py y anima cada elemento por separado.
import importlib.util, math, random, subprocess
from pathlib import Path
from PIL import Image, ImageDraw
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('social', ROOT / 'scripts/social-images.py')
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)

W, H, FPS, DUR = 1080, 1920, 30, 13.0
CX = W // 2
OUT = S.OUT / 'lumis-aniversario-tiktok.mp4'


# ---------- Curvas de animación ----------
def clamp(v): return max(0.0, min(1.0, v))
def prog(t, start, dur): return clamp((t - start) / dur)
def ease_out(p): return 1 - (1 - p) ** 3
def ease_back(p, s=1.7): p -= 1; return 1 + (s + 1) * p ** 3 + s * p ** 2


# ---------- Piezas ----------
def blank(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))

def crop(img):
    """Recorta una capa a su contenido y devuelve (imagen, x, y)."""
    box = img.getbbox()
    return img.crop(box), box[0], box[1]

def fade(img, a):
    if a >= 1: return img
    im = img.copy()
    im.putalpha(im.getchannel('A').point([round(v * a) for v in range(256)]))
    return im

def place(frame, el, alpha=1.0, dx=0, dy=0, scale=1.0):
    img, x, y = el
    if alpha <= 0: return
    if scale != 1.0:
        nw, nh = max(1, round(img.width * scale)), max(1, round(img.height * scale))
        x += (img.width - nw) / 2; y += (img.height - nh) / 2
        img = img.resize((nw, nh), Image.BICUBIC)
    frame.alpha_composite(fade(img, alpha), (round(x + dx), round(y + dy)))

def glint(el, p):
    """Reflejo diagonal que cruza la pieza (p de 0 a 1)."""
    img, x, y = el
    if not 0 < p < 1: return el
    band = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    bx = -img.height + (img.width + img.height * 2) * p
    for i in range(40):
        a = round(120 * math.sin(math.pi * i / 40))
        d.line([(bx + i, 0), (bx + i - img.height * .6, img.height)], fill=(255, 255, 255, a), width=2)
    out = img.copy()
    mask = img.getchannel('A')
    band.putalpha(Image.composite(band.getchannel('A'), Image.new('L', img.size, 0), mask))
    out.alpha_composite(band)
    return out, x, y


# ---------- Construcción de la escena (mismas medidas que la historia del aniversario) ----------
bg = S.vgradient(W, H, [(0, S.DEEP), (.55, S.PETROL), (1, S.TEAL)])
S.glow(bg, W * .85, H * .18, W * .45, S.BRAND, 90)
S.glow(bg, W * .1, H * .8, W * .4, S.BRAND, 60)
S.streaks(bg, 11)

layer = blank()
y_after_logo = S.logo_card(layer, 'logo-horizontal-hd.png', 360, CX, 120)
LOGO = crop(layer)

R = 210
BY = y_after_logo + 90 + R
layer = blank(); g = ImageDraw.Draw(layer)
g.ellipse((CX - R, BY - R, CX + R, BY + R), fill=(255, 255, 255, 26), outline=(255, 255, 255, 80), width=3)
g.ellipse((CX - R + 46, BY - R + 46, CX + R - 46, BY + R - 46), outline=S.LIGHT + (110,), width=2)
DISC = crop(layer)

ring = Image.new('RGBA', (2 * R + 80, 2 * R + 80), (0, 0, 0, 0))
S.ring_text(ring, ring.width // 2, ring.height // 2, R - 24, 'PRIMER ANIVERSARIO · OCT 2025 – OCT 2026 · ', S.font(22, 800), S.LIGHT)

layer = blank()
S.gradient_text(layer, (CX, BY - 20), '1', S.font(250, 800), S.WHITE, S.LIGHT, anchor='mm')
ONE = crop(layer)
layer = blank()
S.text_c(ImageDraw.Draw(layer), CX, BY + 92, 'AÑO', S.font(36, 800), S.WHITE)
ANO = crop(layer)

y = BY + R + 80
layer = blank(); d = ImageDraw.Draw(layer)
S.text_c(d, CX, y, 'Gracias por un año', S.font(84, 800), S.WHITE)
TITLE = crop(layer)
y += 100
layer = blank()
S.text_c(ImageDraw.Draw(layer), CX, y, 'dejando cada espacio impecable.', S.font(76, italic=True), S.LIGHT)
SUB = crop(layer)
y += 112
layer = blank(); d = ImageDraw.Draw(layer)
msg = 'En octubre de 2025 convertimos años de trabajo en cristales y oficinas en nuestra propia empresa. Gracias a cada cliente que confía en nosotros.'
f = S.font(32, 500)
for ln in S.wrap(d, msg, f, W - 200):
    S.text_c(d, CX, y, ln, f, (207, 240, 247)); y += 48
MSG = crop(layer)
y += 30
layer = blank()
S.text_c(ImageDraw.Draw(layer), CX, y, '¡A por muchos años más!', S.font(40, 800), S.GOLD)
CHEER = crop(layer)
y += 90
layer = blank()
S.qr_card(layer, CX - 440, y, 880, 230, 'Visita nuestra nueva web')
QR = crop(layer)

# Burbujas que suben y destellos que parpadean
rnd = random.Random(7)
BUBBLES = [dict(x=rnd.uniform(0, W), y=rnd.uniform(0, H + 200), r=rnd.uniform(8, 40), v=rnd.uniform(40, 110),
                w=rnd.uniform(.4, 1.2), ph=rnd.uniform(0, 6.3), a=rnd.randint(45, 85)) for _ in range(26)]
SPARKS = [(rnd.choice([rnd.uniform(40, 120), rnd.uniform(W - 120, W - 40)]), rnd.uniform(80, H - 80), rnd.uniform(9, 20), rnd.uniform(0, 6.3), rnd.uniform(.6, 1.3)) for _ in range(12)]
GOLDS = [(CX - R - 40, BY - R * .5, 26), (CX + R + 36, BY - R * .2, 18), (CX + R + 10, BY + R * .75, 22)]


def frame_at(t):
    fr = bg.copy()
    # Burbujas
    lay = blank(); d = ImageDraw.Draw(lay)
    for b in BUBBLES:
        yy = (b['y'] - b['v'] * t) % (H + 200) - 100
        xx = b['x'] + 18 * math.sin(t * b['w'] + b['ph'])
        r = b['r']
        d.ellipse((xx - r, yy - r, xx + r, yy + r), outline=(255, 255, 255, b['a']), width=2)
        d.ellipse((xx - r * .55, yy - r * .6, xx - r * .15, yy - r * .35), fill=(255, 255, 255, min(255, b['a'] + 60)))
    for sx, sy, ss, ph, sp in SPARKS:
        k = .35 + .65 * (.5 + .5 * math.sin(t * 2.4 * sp + ph))
        S.sparkle(d, sx, sy, ss * k, (255, 255, 255, round(220 * k)))
    fr.alpha_composite(lay)

    # 0,2 s – Logo
    p = ease_out(prog(t, .2, .8))
    place(fr, LOGO, p, dy=-60 * (1 - p))

    # 1,0 s – Sello: disco, texto en círculo girando, «1» con rebote y «AÑO»
    p = ease_out(prog(t, 1.0, .7))
    place(fr, DISC, p, scale=.6 + .4 * p)
    p = prog(t, 1.3, .8)
    if p > 0:
        rr = ring.rotate(-t * 14, resample=Image.BICUBIC)
        place(fr, (rr, CX - rr.width // 2, BY - rr.height // 2), ease_out(p))
    p = prog(t, 1.7, .7)
    if p > 0:
        place(fr, glint(ONE, prog(t, 2.6, .8)), min(1, p * 2), scale=max(.05, ease_back(p)))
    place(fr, ANO, ease_out(prog(t, 2.3, .5)), dy=20 * (1 - ease_out(prog(t, 2.3, .5))))
    gp = prog(t, 2.2, .6)
    if gp > 0:
        lay = blank(); d = ImageDraw.Draw(lay)
        for i, (gx, gy, gs) in enumerate(GOLDS):
            k = ease_back(gp) * (.8 + .2 * math.sin(t * 3 + i * 2))
            S.sparkle(d, gx, gy, gs * k, S.GOLD + (255,))
        fr.alpha_composite(lay)

    # 3,4 s – Titular
    for el, start in ((TITLE, 3.4), (SUB, 3.9)):
        p = ease_out(prog(t, start, .7))
        place(fr, el, p, dy=40 * (1 - p))
    # 5,2 s – Mensaje y ánimo
    p = ease_out(prog(t, 5.2, .8))
    place(fr, MSG, p, dy=30 * (1 - p))
    p = prog(t, 6.6, .6)
    if p > 0:
        place(fr, CHEER, min(1, p * 2), scale=max(.05, ease_back(p)))
    # 8,0 s – Tarjeta del QR (se queda quieta hasta el final para poder escanearla)
    p = ease_out(prog(t, 8.0, .9))
    if p > 0:
        place(fr, glint(QR, prog(t, 9.2, 1.0)), p, dy=160 * (1 - p))
    return fr


if __name__ == '__main__':
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, '-y', '-loglevel', 'error',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
           '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', str(OUT)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = round(DUR * FPS)
    for i in range(n):
        fr = frame_at(i / FPS)
        proc.stdin.write(fr.convert('RGB').tobytes())
        if i in (45, 90, 140, 200, 260, n - 1):  # fotogramas de control para revisar
            fr.convert('RGB').resize((360, 640), Image.LANCZOS).save(S.OUT / f'_control-{i:03d}.jpg', quality=85)
        if i == n - 1:
            fr.convert('RGB').save(S.OUT / 'lumis-aniversario-tiktok-portada.jpg', quality=92)
    proc.stdin.close(); proc.wait()
    print(f'{OUT.name}: {OUT.stat().st_size // 1024} KB, {n} fotogramas')
