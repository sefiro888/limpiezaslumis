# Vídeos verticales (1080x1920, 30 fps) para Reels de Instagram y TikTok.
# Uso: python scripts/social-video.py   (requiere Pillow, segno, imageio-ffmpeg y Node). Salida en redes/.
#
# Zona segura: todo lo importante queda entre y=230 y y=1480 y lejos del borde derecho, para que no lo tapen
# el nombre, el texto y los botones de Instagram o TikTok, y para que la miniatura 4:5 del perfil lo muestre entero.
#
# El vídeo del estreno usa una captura de la portada en móvil (redes/_captura-web-movil.png, 1040 px de ancho).
# Para rehacerla: copia de index.html sin scripts y con imágenes «eager», servida en local y capturada con
#   chrome --headless=new --hide-scrollbars --force-device-scale-factor=2 --window-size=520,4000 --virtual-time-budget=15000 --screenshot=...
import importlib.util, math, random, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('social', ROOT / 'scripts/social-images.py')
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)

W, H, FPS = 1080, 1920, 30
CX = W // 2
TOP, BOTTOM = 230, 1480


# ---------- Curvas y utilidades de animación ----------
def clamp(v): return max(0.0, min(1.0, v))
def prog(t, start, dur): return clamp((t - start) / dur)
def ease_out(p): return 1 - (1 - p) ** 3
def ease_io(p): return 4 * p ** 3 if p < .5 else 1 - (-2 * p + 2) ** 3 / 2
def ease_back(p, s=1.7): p -= 1; return 1 + (s + 1) * p ** 3 + s * p ** 2

def blank(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))

def crop(img):
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
    frame.alpha_composite(fade(img, min(1, alpha)), (round(x + dx), round(y + dy)))

def glint(el, p):
    img, x, y = el
    if not 0 < p < 1: return el
    band = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    bx = -img.height + (img.width + img.height * 2) * p
    for i in range(40):
        d.line([(bx + i, 0), (bx + i - img.height * .6, img.height)], fill=(255, 255, 255, round(120 * math.sin(math.pi * i / 40))), width=2)
    band.putalpha(Image.composite(band.getchannel('A'), Image.new('L', img.size, 0), img.getchannel('A')))
    out = img.copy(); out.alpha_composite(band)
    return out, x, y

def background(seed):
    bg = S.vgradient(W, H, [(0, S.DEEP), (.55, S.PETROL), (1, S.TEAL)])
    S.glow(bg, W * .85, H * .18, W * .45, S.BRAND, 90)
    S.glow(bg, W * .1, H * .8, W * .4, S.BRAND, 60)
    S.streaks(bg, seed)
    return bg

class Ambient:
    """Burbujas que suben y destellos que parpadean, detrás de todo el contenido."""
    def __init__(self, seed):
        rnd = random.Random(seed)
        self.bubbles = [dict(x=rnd.uniform(0, W), y=rnd.uniform(0, H + 200), r=rnd.uniform(8, 40), v=rnd.uniform(40, 110),
                             w=rnd.uniform(.4, 1.2), ph=rnd.uniform(0, 6.3), a=rnd.randint(40, 80)) for _ in range(26)]
        self.sparks = [(rnd.choice([rnd.uniform(40, 120), rnd.uniform(W - 120, W - 40)]), rnd.uniform(80, H - 80),
                        rnd.uniform(9, 20), rnd.uniform(0, 6.3), rnd.uniform(.6, 1.3)) for _ in range(12)]
    def draw(self, fr, t):
        lay = blank(); d = ImageDraw.Draw(lay)
        for b in self.bubbles:
            yy = (b['y'] - b['v'] * t) % (H + 200) - 100
            xx = b['x'] + 18 * math.sin(t * b['w'] + b['ph']); r = b['r']
            d.ellipse((xx - r, yy - r, xx + r, yy + r), outline=(255, 255, 255, b['a']), width=2)
            d.ellipse((xx - r * .55, yy - r * .6, xx - r * .15, yy - r * .35), fill=(255, 255, 255, min(255, b['a'] + 60)))
        for sx, sy, ss, ph, sp in self.sparks:
            k = .35 + .65 * (.5 + .5 * math.sin(t * 2.4 * sp + ph))
            S.sparkle(d, sx, sy, ss * k, (255, 255, 255, round(220 * k)))
        fr.alpha_composite(lay)

def text_el(cx, y, text, f, fill):
    lay = blank(); S.text_c(ImageDraw.Draw(lay), cx, y, text, f, fill); return crop(lay)

def chip_el(x, y, text, icon_fill=S.BRAND):
    """Etiqueta blanca con un check, para destacar funciones de la web."""
    lay = blank(); d = ImageDraw.Draw(lay)
    f = S.font(30, 800)
    w = d.textlength(text, font=f) + 100
    S.shadowed_card(lay, (x, y, x + w, y + 76), 38, shadow=90, blur=16)
    d = ImageDraw.Draw(lay)
    d.ellipse((x + 16, y + 16, x + 60, y + 60), fill=icon_fill)
    d.line([(x + 28, y + 39), (x + 35, y + 46), (x + 49, y + 31)], fill=S.WHITE, width=5)
    d.text((x + 74, y + 38), text, font=f, fill=S.PETROL, anchor='lm')
    return crop(lay)


def render(name, dur, frame_at, controls=(), cover=True):
    out = S.OUT / name
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, '-y', '-loglevel', 'error',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
           '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = round(dur * FPS)
    for i in range(n):
        fr = frame_at(i / FPS)
        proc.stdin.write(fr.convert('RGB').tobytes())
        if i in controls:
            fr.convert('RGB').resize((360, 640), Image.LANCZOS).save(S.OUT / f'_control-{name[:-4]}-{i:03d}.jpg', quality=85)
        if cover and i == n - 1:
            fr.convert('RGB').save(S.OUT / name.replace('.mp4', '-portada.jpg'), quality=92)
    proc.stdin.close(); proc.wait()
    print(f'{name}: {out.stat().st_size // 1024} KB, {n} fotogramas')


# =====================================================================
# Vídeo 1: primer aniversario
# =====================================================================
def aniversario():
    bg, amb = background(11), Ambient(7)
    lay = blank(); y = S.logo_card(lay, 'logo-horizontal-hd.png', 300, CX, TOP, pad=22, radius=26); LOGO = crop(lay)
    R = 165; BY = y + 40 + R
    lay = blank(); g = ImageDraw.Draw(lay)
    g.ellipse((CX - R, BY - R, CX + R, BY + R), fill=(255, 255, 255, 26), outline=(255, 255, 255, 80), width=3)
    g.ellipse((CX - R + 40, BY - R + 40, CX + R - 40, BY + R - 40), outline=S.LIGHT + (110,), width=2)
    DISC = crop(lay)
    ring = Image.new('RGBA', (2 * R + 80, 2 * R + 80), (0, 0, 0, 0))
    S.ring_text(ring, ring.width // 2, ring.height // 2, R - 21, 'PRIMER ANIVERSARIO · OCT 2025 – OCT 2026 · ', S.font(18, 800), S.LIGHT)
    lay = blank(); S.gradient_text(lay, (CX, BY - 16), '1', S.font(196, 800), S.WHITE, S.LIGHT, anchor='mm'); ONE = crop(lay)
    ANO = text_el(CX, BY + 72, 'AÑO', S.font(30, 800), S.WHITE)
    GOLDS = [(CX - R - 36, BY - R * .5, 24), (CX + R + 32, BY - R * .2, 17), (CX + R + 8, BY + R * .75, 20)]
    y = BY + R + 46
    TITLE = text_el(CX, y, 'Gracias por un año', S.font(76, 800), S.WHITE); y += 88
    SUB = text_el(CX, y, 'dejando cada espacio impecable.', S.font(66, italic=True), S.LIGHT); y += 100
    lay = blank(); d = ImageDraw.Draw(lay); f = S.font(29, 500)
    msg = 'En octubre de 2025 convertimos años de trabajo en cristales y oficinas en nuestra propia empresa. Gracias a cada cliente que confía en nosotros.'
    for ln in S.wrap(d, msg, f, 820):
        S.text_c(d, CX, y, ln, f, (207, 240, 247)); y += 43
    MSG = crop(lay); y += 18
    CHEER = text_el(CX, y, '¡A por muchos años más!', S.font(36, 800), S.GOLD); y += 66
    lay = blank(); bottom = S.qr_card(lay, CX - 420, y, 840, 200, 'Visita nuestra nueva web'); QR = crop(lay)
    assert bottom <= BOTTOM, f'La tarjeta del QR baja hasta {bottom}'

    def frame_at(t):
        fr = bg.copy(); amb.draw(fr, t)
        p = ease_out(prog(t, .2, .8)); place(fr, LOGO, p, dy=-50 * (1 - p))
        p = ease_out(prog(t, 1.0, .7)); place(fr, DISC, p, scale=.6 + .4 * p)
        p = prog(t, 1.3, .8)
        if p > 0:
            rr = ring.rotate(-t * 14, resample=Image.BICUBIC)
            place(fr, (rr, CX - rr.width // 2, BY - rr.height // 2), ease_out(p))
        p = prog(t, 1.7, .7)
        if p > 0: place(fr, glint(ONE, prog(t, 2.6, .8)), p * 2, scale=max(.05, ease_back(p)))
        p = ease_out(prog(t, 2.3, .5)); place(fr, ANO, p, dy=20 * (1 - p))
        gp = prog(t, 2.2, .6)
        if gp > 0:
            lay = blank(); d = ImageDraw.Draw(lay)
            for i, (gx, gy, gs) in enumerate(GOLDS):
                S.sparkle(d, gx, gy, gs * ease_back(gp) * (.8 + .2 * math.sin(t * 3 + i * 2)), S.GOLD + (255,))
            fr.alpha_composite(lay)
        for el, start in ((TITLE, 3.4), (SUB, 3.9)):
            p = ease_out(prog(t, start, .7)); place(fr, el, p, dy=40 * (1 - p))
        p = ease_out(prog(t, 5.2, .8)); place(fr, MSG, p, dy=30 * (1 - p))
        p = prog(t, 6.6, .6)
        if p > 0: place(fr, CHEER, p * 2, scale=max(.05, ease_back(p)))
        p = ease_out(prog(t, 8.0, .9))
        if p > 0: place(fr, glint(QR, prog(t, 9.2, 1.0)), p, dy=160 * (1 - p))
        return fr

    render('lumis-aniversario-reels-tiktok.mp4', 13.0, frame_at, controls=(60, 120, 200, 389))


# =====================================================================
# Vídeo 2: estreno de la web (la web real desplazándose dentro de un móvil)
# =====================================================================
def estreno():
    bg, amb = background(29), Ambient(13)
    lay = blank(); y_logo = S.logo_card(lay, 'logo-horizontal-hd.png', 280, CX, TOP, pad=20, radius=24); LOGO = crop(lay)

    # Titular grande de entrada y versión compacta encima del móvil
    BIG1 = text_el(CX, 640, '¡Estrenamos', S.font(118, 800), S.WHITE)
    BIG2 = text_el(CX, 780, 'nueva web!', S.font(132, italic=True), S.LIGHT)
    lay = blank(); d = ImageDraw.Draw(lay)
    S.pill(lay, CX - (d.textlength(S.B['domain'], font=S.font(40, 800)) + 64) / 2, 990, S.B['domain'], S.font(40, 800), (255, 255, 255, 40), S.WHITE, padx=32, h=78)
    DOMAIN = crop(lay)
    lay = blank(); d = ImageDraw.Draw(lay)
    f1, f2 = S.font(62, 800), S.font(66, italic=True)
    w1, w2 = d.textlength('¡Estrenamos ', font=f1), d.textlength('nueva web!', font=f2)
    x0 = CX - (w1 + w2) / 2
    d.text((x0, y_logo + 70), '¡Estrenamos ', font=f1, fill=S.WHITE, anchor='ls')
    d.text((x0 + w1, y_logo + 70), 'nueva web!', font=f2, fill=S.LIGHT, anchor='ls')
    HEAD = crop(lay)

    # Móvil con la captura de la web
    PH_H = 900; PH_W = 438; PH_Y = y_logo + 112; PH_X = CX - PH_W // 2
    SCR_PAD = 14; SCR_W, SCR_H = PH_W - SCR_PAD * 2, PH_H - SCR_PAD * 2
    page = Image.open(S.OUT / '_captura-web-movil.png').convert('RGBA')
    page = page.resize((SCR_W, round(page.height * SCR_W / page.width)), Image.LANCZOS)
    max_scroll = page.height - SCR_H
    phone = Image.new('RGBA', (PH_W + 80, PH_H + 80), (0, 0, 0, 0))
    sh = Image.new('RGBA', phone.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((40, 60, 40 + PH_W, 60 + PH_H), 70, fill=(0, 15, 25, 150))
    phone.alpha_composite(sh.filter(ImageFilter.GaussianBlur(24)))
    ImageDraw.Draw(phone).rounded_rectangle((40, 40, 40 + PH_W, 40 + PH_H), 70, fill=(14, 22, 28, 255), outline=(70, 90, 100, 255), width=3)
    screen_mask = Image.new('L', (SCR_W, SCR_H), 0)
    ImageDraw.Draw(screen_mask).rounded_rectangle((0, 0, SCR_W - 1, SCR_H - 1), 56, fill=255)
    notch = (40 + PH_W // 2 - 60, 40 + SCR_PAD + 12, 40 + PH_W // 2 + 60, 40 + SCR_PAD + 44)
    # Paradas del desplazamiento: (segundo, posición 0-1 del recorrido)
    KEYS = [(2.9, 0), (4.0, 0), (5.1, .30), (5.9, .30), (7.0, .62), (7.8, .62), (8.9, 1.0)]

    def scroll_at(t):
        if t <= KEYS[0][0]: return 0
        for (t0, a), (t1, b) in zip(KEYS, KEYS[1:]):
            if t0 <= t <= t1: return a + (b - a) * ease_io((t - t0) / (t1 - t0)) if t1 > t0 else b
        return KEYS[-1][1]

    def phone_el(t):
        im = phone.copy()
        off = round(scroll_at(t) * max_scroll)
        scr = page.crop((0, off, SCR_W, off + SCR_H))
        im.paste(scr, (40 + SCR_PAD, 40 + SCR_PAD), screen_mask)
        ImageDraw.Draw(im).rounded_rectangle(notch, 16, fill=(14, 22, 28, 255))
        return im, PH_X - 40, PH_Y - 40

    CHIPS = [(chip_el(70, PH_Y + 150, f"{len(S.SERVICES)} servicios"), 4.2),
             (chip_el(0, PH_Y + 360, 'Reserva en 1 minuto'), 5.3),
             (chip_el(70, PH_Y + 570, 'Opiniones reales'), 6.4),
             (chip_el(0, PH_Y + 760, 'WhatsApp directo', icon_fill=(37, 211, 102)), 7.5)]
    for i in (1, 3):  # las de la derecha, alineadas a 90 px del borde (lejos de los botones de la app)
        img, x, y = CHIPS[i][0]; CHIPS[i] = ((img, W - 120 - img.width, y), CHIPS[i][1])

    # Escena final: QR grande
    lay = blank()
    qr = S.qr_image(440); pad = 34
    card_top = PH_Y + 40
    S.shadowed_card(lay, (CX - qr.width // 2 - pad, card_top, CX + qr.width // 2 + pad, card_top + qr.height + pad * 2), 44, shadow=90)
    lay.alpha_composite(qr, (CX - qr.width // 2, card_top + pad))
    QR = crop(lay)
    y = card_top + qr.height + pad * 2 + 46
    SCAN = text_el(CX, y, 'Escanea y descúbrela', S.font(56, 800), S.WHITE); y += 76
    URL_T = text_el(CX, y, S.B['domain'], S.font(48, 800), S.LIGHT); y += 72
    PHONES = text_el(CX, y, f"{S.B['phone']}  ·  Fijo {S.B['landline']}", S.font(30, 700), (207, 240, 247))
    assert PHONES[2] + PHONES[0].height <= BOTTOM, 'El texto final se sale de la zona segura'

    def frame_at(t):
        fr = bg.copy(); amb.draw(fr, t)
        p = ease_out(prog(t, .2, .7)); place(fr, LOGO, p, dy=-50 * (1 - p))
        # Entrada: titular grande que luego deja sitio al móvil
        out = ease_out(prog(t, 2.3, .5))
        p = prog(t, .5, .6)
        if p > 0 and out < 1: place(fr, BIG1, (1 - out) * min(1, p * 2), scale=max(.05, ease_back(p)) * (1 - .2 * out), dy=-60 * out)
        p = prog(t, .9, .6)
        if p > 0 and out < 1: place(fr, BIG2, (1 - out) * min(1, p * 2), scale=max(.05, ease_back(p)) * (1 - .2 * out), dy=-60 * out)
        p = ease_out(prog(t, 1.4, .5))
        if p > 0 and out < 1: place(fr, glint(DOMAIN, prog(t, 1.6, .7)), p * (1 - out), dy=30 * (1 - p))
        p = ease_out(prog(t, 2.5, .5)); place(fr, HEAD, p, dy=20 * (1 - p))
        # Móvil
        pin = ease_out(prog(t, 2.4, .8)); pout = ease_out(prog(t, 9.4, .6))
        if pin > 0 and pout < 1:
            place(fr, phone_el(t), pin * (1 - pout), dy=500 * (1 - pin), scale=1 - .15 * pout)
        for el, start in CHIPS:
            p = prog(t, start, .5)
            if p > 0 and pout < 1: place(fr, el, min(1, p * 2) * (1 - pout), scale=max(.05, ease_back(p)))
        # Final: QR
        p = ease_out(prog(t, 9.8, .8))
        if p > 0: place(fr, glint(QR, prog(t, 10.9, 1.0)), p, scale=.85 + .15 * p)
        for el, start in ((SCAN, 10.3), (URL_T, 10.6), (PHONES, 10.9)):
            p = ease_out(prog(t, start, .6)); place(fr, el, p, dy=30 * (1 - p))
        return fr

    render('lumis-estreno-web-reels-tiktok.mp4', 15.0, frame_at, controls=(40, 75, 130, 170, 230, 270, 449))


if __name__ == '__main__':
    aniversario()
    estreno()
    # Comprobación del QR en el último fotograma de cada vídeo
    import zxingcpp
    for p in sorted(S.OUT.glob('*-reels-tiktok-portada.jpg')):
        im = Image.open(p)
        res = ['OK' if S.URL in [r.text for r in zxingcpp.read_barcodes(im.resize((round(im.width * s), round(im.height * s))))] else 'FALLO'
               for s in (1, .5, .33)]
        print(f'QR {p.name}: {" / ".join(res)}')
