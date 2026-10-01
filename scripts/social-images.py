# Genera publicaciones para Instagram y TikTok con el logo, la paleta de la web y un QR a limpiezaslumis.es.
# Uso: python scripts/social-images.py   (requiere Pillow, segno y Node; zxing-cpp para comprobar los QR)
# Formatos: feed de Instagram 1080x1350 (4:5) e historias / TikTok 1080x1920 (9:16). Salida en redes/.
import json, math, random, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import segno

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'redes'
OUT.mkdir(exist_ok=True)

DEEP, PETROL, TEAL, BRAND, LIGHT = (5, 42, 51), (11, 85, 102), (10, 127, 155), (18, 178, 210), (149, 223, 240)
ICE, MUTED, GOLD, WHITE = (234, 248, 251), (82, 112, 122), (255, 209, 102), (255, 255, 255)

data = json.loads(subprocess.check_output(
    ['node', '-e', "import('./scripts/content.mjs').then(m=>console.log(JSON.stringify({b:m.business,s:m.services,d:m.destacados})))"],
    cwd=ROOT, text=True, encoding='utf-8'))
B, SERVICES, DEST = data['b'], data['s'], data['d']
URL = f"https://{B['domain']}/"
LABEL = {s['slug']: s['label'] for s in SERVICES}


# ---------- Utilidades de dibujo ----------
def font(size, weight=700, italic=False):
    if italic:
        return ImageFont.truetype(str(ROOT / 'assets/fonts/instrument-serif-italic.ttf'), size)
    f = ImageFont.truetype(str(ROOT / 'assets/fonts/manrope-variable.ttf'), size)
    f.set_variation_by_axes([weight])
    return f

def cover(img, w, h, focus=.5):
    r = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
    x, y = (img.width - w) // 2, round((img.height - h) * focus)
    return img.crop((x, y, x + w, y + h))

def vgradient(w, h, stops):
    line = []
    for i in range(h):
        t = i / (h - 1)
        for k in range(len(stops) - 1):
            (p0, c0), (p1, c1) = stops[k], stops[k + 1]
            if p0 <= t <= p1:
                u = (t - p0) / (p1 - p0) if p1 > p0 else 0
                line.append(tuple(round(c0[j] + (c1[j] - c0[j]) * u) for j in range(len(c0))))
                break
        else:
            line.append(stops[-1][1])
    strip = Image.new('RGBA', (1, h))
    strip.putdata([c if len(c) == 4 else c + (255,) for c in line])
    return strip.resize((w, h), Image.BILINEAR)

def layer(canvas):
    return Image.new('RGBA', canvas.size, (0, 0, 0, 0))

def glow(canvas, cx, cy, r, color, alpha):
    g = layer(canvas)
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=color + (alpha,))
    canvas.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * .45)))

def streaks(canvas, seed):
    # Reflejos diagonales, como el fondo de la cabecera de la web.
    rnd = random.Random(seed)
    g = layer(canvas); d = ImageDraw.Draw(g); w, h = canvas.size
    for _ in range(4):
        x = rnd.uniform(-.2, 1) * w; s = rnd.uniform(.06, .16) * w
        d.polygon([(x, 0), (x + s, 0), (x + s - h * .55, h), (x - h * .55, h)], fill=(255, 255, 255, rnd.randint(8, 16)))
    canvas.alpha_composite(g)

def bubbles(canvas, n, seed, area=None, rmin=8, rmax=46, alpha=80):
    rnd = random.Random(seed)
    g = layer(canvas); d = ImageDraw.Draw(g)
    x0, y0, x1, y1 = area or (0, 0, canvas.width, canvas.height)
    for _ in range(n):
        r = rnd.uniform(rmin, rmax); y = rnd.uniform(y0, y1)
        x = rnd.choice([rnd.uniform(x0 - r, x0 + 110), rnd.uniform(x1 - 110, x1 + r)])
        d.ellipse((x - r, y - r, x + r, y + r), outline=(255, 255, 255, alpha), width=2)
        d.ellipse((x - r * .55, y - r * .6, x - r * .15, y - r * .35), fill=(255, 255, 255, min(255, alpha + 60)))
    canvas.alpha_composite(g)

def sparkle(d, cx, cy, s, fill):
    d.polygon([(cx, cy - s), (cx + s * .22, cy - s * .22), (cx + s, cy), (cx + s * .22, cy + s * .22),
               (cx, cy + s), (cx - s * .22, cy + s * .22), (cx - s, cy), (cx - s * .22, cy - s * .22)], fill=fill)

def star(d, cx, cy, r, fill):
    pts = [(cx - (r if i % 2 == 0 else r * .45) * math.cos(math.pi / 2 + i * math.pi / 5),
            cy - (r if i % 2 == 0 else r * .45) * math.sin(math.pi / 2 + i * math.pi / 5)) for i in range(10)]
    d.polygon(pts, fill=fill)

def shadowed_card(canvas, box, radius, fill=WHITE + (255,), shadow=110, blur=26):
    x0, y0, x1, y1 = box
    s = layer(canvas)
    ImageDraw.Draw(s).rounded_rectangle((x0, y0 + 18, x1, y1 + 18), radius, fill=(0, 20, 30, shadow))
    canvas.alpha_composite(s.filter(ImageFilter.GaussianBlur(blur)))
    c = layer(canvas)
    ImageDraw.Draw(c).rounded_rectangle(box, radius, fill=fill)
    canvas.alpha_composite(c)

def logo(name, width):
    im = Image.open(ROOT / f'assets/brand/{name}').convert('RGBA')
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)

def logo_card(canvas, name, width, cx, y, pad=26, radius=30):
    lg = logo(name, width)
    box = (cx - lg.width // 2 - pad, y, cx + lg.width // 2 + pad, y + lg.height + pad * 2)
    shadowed_card(canvas, box, radius)
    canvas.alpha_composite(lg, (cx - lg.width // 2, y + pad))
    return box[3]

def text_c(d, cx, y, text, f, fill):
    d.text((cx, y), text, font=f, fill=fill, anchor='mt')

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur)
    return lines

def gradient_text(canvas, xy, text, f, top, bottom, anchor='mt'):
    mask = Image.new('L', canvas.size, 0)
    ImageDraw.Draw(mask).text(xy, text, font=f, fill=255, anchor=anchor)
    bbox = mask.getbbox()
    fillimg = vgradient(canvas.width, bbox[3] - bbox[1] + 2, [(0, top + (255,)), (1, bottom + (255,))])
    full = layer(canvas); full.paste(fillimg, (0, bbox[1]))
    canvas.paste(full, (0, 0), mask)

def ring_text(canvas, cx, cy, r, text, f, fill):
    """Texto repartido en círculo completo, empezando arriba y en sentido horario."""
    d = ImageDraw.Draw(canvas)
    widths = [d.textlength(ch, font=f) for ch in text]
    gap = (2 * math.pi * r - sum(widths)) / len(text)
    ang = -math.pi / 2
    for ch, w in zip(text, widths):
        a = ang + (w / 2) / r
        im = Image.new('RGBA', (int(w) + 30, f.size + 30), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((im.width / 2, im.height / 2), ch, font=f, fill=fill, anchor='mm')
        im = im.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC, expand=True)
        px, py = cx + r * math.cos(a), cy + r * math.sin(a)
        canvas.alpha_composite(im, (round(px - im.width / 2), round(py - im.height / 2)))
        ang += (w + gap) / r

def pill(canvas, x, y, text, f, bg, fg, padx=26, h=60, outline=(255, 255, 255, 70)):
    d = ImageDraw.Draw(canvas)
    w = d.textlength(text, font=f) + padx * 2
    g = layer(canvas)
    ImageDraw.Draw(g).rounded_rectangle((x, y, x + w, y + h), h // 2, fill=bg, outline=outline, width=2)
    canvas.alpha_composite(g)
    ImageDraw.Draw(canvas).text((x + padx, y + h / 2), text, font=f, fill=fg, anchor='lm')
    return w

def pills_centered(canvas, cx, y, items, f, maxw, gap=14, h=60, **kw):
    d = ImageDraw.Draw(canvas)
    rows, row, roww = [], [], 0
    for t in items:
        w = d.textlength(t, font=f) + kw.get('padx', 26) * 2
        if row and roww + gap + w > maxw: rows.append((row, roww)); row, roww = [], 0
        roww += (gap if row else 0) + w; row.append(t)
    rows.append((row, roww))
    for row, roww in rows:
        x = cx - roww / 2
        for t in row: x += pill(canvas, x, y, t, f, h=h, **kw) + gap
        y += h + gap
    return y


# ---------- QR ----------
def qr_image(size):
    """QR con corrección de errores alta (H) para poder llevar el icono de Lumis en el centro."""
    q = segno.make(URL, error='h', boost_error=False)
    m = [list(row) for row in q.matrix]
    n, border = len(m), 4
    mod = size // (n + border * 2)
    side = mod * (n + border * 2)
    im = Image.new('RGBA', (side, side), WHITE + (255,))
    d = ImageDraw.Draw(im)
    for yy, row in enumerate(m):
        for xx, v in enumerate(row):
            if v:
                x0, y0 = (xx + border) * mod, (yy + border) * mod
                d.rectangle((x0, y0, x0 + mod - 1, y0 + mod - 1), fill=PETROL)
    # Icono central: unos 20 % del ancho del código, sobre un fondo blanco.
    ic = round(n * mod * .2)
    pad = mod
    c = side // 2
    d.rounded_rectangle((c - ic // 2 - pad, c - ic // 2 - pad, c + ic // 2 + pad, c + ic // 2 + pad), mod * 2, fill=WHITE)
    im.alpha_composite(logo('icono-512.png', ic), (c - ic // 2, c - ic // 2))
    return im

def qr_card(canvas, x, y, w, qr_size, title, sub='Escanea con tu móvil'):
    """Tarjeta blanca con el QR a la izquierda y la llamada a la acción a la derecha."""
    pad = 30
    qr = qr_image(qr_size)
    h = qr.height + pad * 2
    shadowed_card(canvas, (x, y, x + w, y + h), 36)
    canvas.alpha_composite(qr, (x + pad, y + pad))
    d = ImageDraw.Draw(canvas)
    tx, maxw = x + pad + qr.width + 34, w - qr.width - pad * 2 - 40
    ty = y + pad + 6
    d.text((tx, ty), sub.upper(), font=font(22, 800), fill=TEAL); ty += 42
    for ln in wrap(d, title, font(38, 800), maxw):
        d.text((tx, ty), ln, font=font(38, 800), fill=PETROL); ty += 46
    ty += 10
    d.text((tx, ty), B['domain'], font=font(34, 800), fill=BRAND); ty += 50
    d.text((tx, ty), f"{B['phone']}  ·  Fijo {B['landline']}", font=font(24, 600), fill=MUTED)
    return y + h


# ---------- Fondos ----------
def dark_bg(w, h, seed):
    c = vgradient(w, h, [(0, DEEP), (.55, PETROL), (1, TEAL)])
    glow(c, w * .85, h * .18, w * .45, BRAND, 90)
    glow(c, w * .1, h * .8, w * .4, BRAND, 60)
    streaks(c, seed)
    bubbles(c, 16, seed, rmin=8, rmax=42, alpha=70)
    d = ImageDraw.Draw(c)
    rnd = random.Random(seed + 1)
    for _ in range(9):
        sparkle(d, rnd.choice([rnd.uniform(30, 120), rnd.uniform(w - 120, w - 30)]), rnd.uniform(40, h - 40), rnd.uniform(8, 20), (255, 255, 255, 200))
    return c

def light_bg(w, h, seed):
    c = vgradient(w, h, [(0, ICE), (.6, WHITE), (1, ICE)])
    glow(c, w * .9, h * .1, w * .45, BRAND, 70)
    glow(c, w * .05, h * .92, w * .45, BRAND, 60)
    rnd = random.Random(seed)
    g = layer(c); dd = ImageDraw.Draw(g)
    for _ in range(14):
        r = rnd.uniform(10, 50); y = rnd.uniform(0, h); x = rnd.choice([rnd.uniform(-20, 110), rnd.uniform(w - 110, w + 20)])
        dd.ellipse((x - r, y - r, x + r, y + r), outline=BRAND + (70,), width=3)
    c.alpha_composite(g)
    d = ImageDraw.Draw(c)
    for _ in range(8):
        sparkle(d, rnd.choice([rnd.uniform(30, 110), rnd.uniform(w - 110, w - 30)]), rnd.uniform(40, h - 40), rnd.uniform(10, 22), BRAND + (170,))
    return c


# ---------- Publicación 1: primer aniversario ----------
def aniversario(w, h, name):
    story = h > 1500
    c = dark_bg(w, h, 11)
    cx = w // 2
    y = 120 if story else 60
    y = logo_card(c, 'logo-horizontal-hd.png', 360 if story else 330, cx, y) + (90 if story else 46)
    # Sello del aniversario
    r = 210 if story else 175
    by = y + r
    g = layer(c); gd = ImageDraw.Draw(g)
    gd.ellipse((cx - r, by - r, cx + r, by + r), fill=(255, 255, 255, 26), outline=(255, 255, 255, 80), width=3)
    gd.ellipse((cx - r + 46, by - r + 46, cx + r - 46, by + r - 46), outline=LIGHT + (110,), width=2)
    c.alpha_composite(g)
    ring_text(c, cx, by, r - 24, 'PRIMER ANIVERSARIO · OCT 2025 – OCT 2026 · ', font(22 if story else 19, 800), LIGHT)
    gradient_text(c, (cx, by - (20 if story else 16)), '1', font(250 if story else 205, 800), WHITE, LIGHT, anchor='mm')
    d = ImageDraw.Draw(c)
    text_c(d, cx, by + (92 if story else 76), 'AÑO', font(36 if story else 30, 800), WHITE)
    for sx, sy, ss in [(-r - 40, -r * .5, 26), (r + 36, -r * .2, 18), (r + 10, r * .75, 22)]:
        sparkle(d, cx + sx, by + sy, ss, GOLD + (255,))
    y = by + r + (80 if story else 46)
    text_c(d, cx, y, 'Gracias por un año', font(84 if story else 72, 800), WHITE)
    y += 100 if story else 84
    text_c(d, cx, y, 'dejando cada espacio impecable.', font(76 if story else 64, italic=True), LIGHT)
    y += 112 if story else 90
    msg = 'En octubre de 2025 convertimos años de trabajo en cristales y oficinas en nuestra propia empresa. Gracias a cada cliente que confía en nosotros.'
    f = font(32 if story else 28, 500)
    for ln in wrap(d, msg, f, w - (200 if story else 180)):
        text_c(d, cx, y, ln, f, (207, 240, 247)); y += 48 if story else 41
    if story:
        y += 30
        text_c(d, cx, y, '¡A por muchos años más!', font(40, 800), GOLD); y += 90
    else:
        y += 26
    qw = 880 if story else 920
    qr_card(c, cx - qw // 2, y, qw, 230 if story else 210, 'Visita nuestra nueva web')
    save(c, name)


# ---------- Publicación 2: pide tu presupuesto ----------
def presupuesto(w, h, name):
    story = h > 1500
    c = dark_bg(w, h, 23)
    ph = 760 if story else 560
    photo = cover(Image.open(ROOT / 'assets/images/portada.jpg').convert('RGBA'), w, ph, .55)
    photo.alpha_composite(vgradient(w, ph, [(0, DEEP + (90,)), (.55, DEEP + (40,)), (1, DEEP + (255,))]))
    c.alpha_composite(photo, (0, 0))
    cx = w // 2
    logo_card(c, 'logo-horizontal-hd.png', 300, cx, 110 if story else 46, pad=22, radius=26)
    d = ImageDraw.Draw(c)
    y = ph - (150 if story else 120)
    # Reseñas
    sw = 5 * 40
    for i in range(5): star(d, cx - sw / 2 + 20 + i * 40, y, 17, GOLD)
    text_c(d, cx, y + 30, 'Opiniones reales en Google', font(26, 700), WHITE)
    y = ph + (40 if story else 26)
    text_c(d, cx, y, f"{B['city'].upper()} Y HASTA 40 MIN ALREDEDOR", font(26 if story else 24, 800), LIGHT)
    y += 56 if story else 50
    text_c(d, cx, y, '¿Lo dejamos', font(100 if story else 86, 800), WHITE)
    y += 108 if story else 92
    text_c(d, cx, y, 'reluciente?', font(110 if story else 96, italic=True), LIGHT)
    y += 150 if story else 118
    items = [LABEL[k] for k in DEST] + [f"y {len(SERVICES) - len(DEST)} servicios más"]
    y = pills_centered(c, cx, y, items, font(28 if story else 26, 700), w - 140, bg=(255, 255, 255, 30), fg=WHITE, h=62 if story else 58)
    y += 16 if story else 6
    text_c(d, cx, y, 'Presupuesto sin compromiso · Reserva en 1 minuto', font(30 if story else 27, 600), (207, 240, 247))
    y += 80 if story else 56
    qw = 880 if story else 920
    qr_card(c, cx - qw // 2, y, qw, 230 if story else 210, 'Pide tu presupuesto sin compromiso')
    save(c, name)


# ---------- Publicación 3: QR protagonista (también sirve para imprimir) ----------
def escanea(w, h, name):
    story = h > 1500
    c = light_bg(w, h, 37)
    cx = w // 2
    y = logo_card(c, 'logo-vertical-hd.png', 300 if story else 200, cx, 130 if story else 48, pad=22) + (70 if story else 34)
    d = ImageDraw.Draw(c)
    text_c(d, cx, y, 'Escanea y descubre', font(80 if story else 66, 800), PETROL)
    y += 92 if story else 76
    text_c(d, cx, y, 'nuestra nueva web.', font(86 if story else 72, italic=True), TEAL)
    y += 130 if story else 104
    qs = 560 if story else 420
    qr = qr_image(qs)
    pad = 34
    shadowed_card(c, (cx - qr.width // 2 - pad, y, cx + qr.width // 2 + pad, y + qr.height + pad * 2), 44, shadow=70)
    c.alpha_composite(qr, (cx - qr.width // 2, y + pad))
    y += qr.height + pad * 2 + (60 if story else 34)
    text_c(d, cx, y, B['domain'], font(54 if story else 48, 800), TEAL)
    y += 80 if story else 66
    items = ['Todos los servicios', 'Reserva en 1 minuto', 'Opiniones reales']
    y = pills_centered(c, cx, y, items, font(26 if story else 24, 700), w - 120, bg=WHITE + (255,), fg=PETROL, h=58, outline=BRAND + (120,))
    y += 20 if story else 8
    text_c(d, cx, y, f"{B['phone']}  ·  Fijo {B['landline']}", font(30 if story else 27, 700), PETROL)
    y += 50 if story else 44
    text_c(d, cx, y, f"Instagram {B['instagramHandle']}  ·  TikTok {B['tiktokHandle']}", font(25 if story else 23, 600), MUTED)
    save(c, name)


def save(canvas, name):
    path = OUT / name
    canvas.convert('RGB').save(path, 'JPEG', quality=93, optimize=True, subsampling=0)
    print(f'{name}: {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    aniversario(1080, 1350, 'lumis-aniversario-instagram.jpg')
    aniversario(1080, 1920, 'lumis-aniversario-historia-tiktok.jpg')
    presupuesto(1080, 1350, 'lumis-presupuesto-instagram.jpg')
    presupuesto(1080, 1920, 'lumis-presupuesto-historia-tiktok.jpg')
    escanea(1080, 1350, 'lumis-qr-web-instagram.jpg')
    escanea(1080, 1920, 'lumis-qr-web-historia-tiktok.jpg')

    # Comprobación: cada QR debe leerse y llevar exactamente a la web, también reducido como en un móvil.
    try:
        import zxingcpp
        for p in sorted(OUT.glob('lumis-*.jpg')):
            im = Image.open(p)
            res = []
            for scale in (1, .5, .33):
                small = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
                found = [r.text for r in zxingcpp.read_barcodes(small)]
                res.append('OK' if URL in found else f'FALLO {found}')
            print(f'QR {p.name}: {" / ".join(res)}')
    except ImportError:
        print('Instala zxing-cpp para comprobar los QR: python -m pip install zxing-cpp')
