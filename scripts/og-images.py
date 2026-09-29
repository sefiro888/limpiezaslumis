# Genera las imágenes de vista previa (1200x630) que aparecen al compartir la web por WhatsApp y redes.
# Uso: python scripts/og-images.py   (requiere Pillow y Node para leer scripts/content.mjs)
import json, subprocess, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/images/og'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1200, 630

# Colores del logo
DEEP, PETROL, TEAL, BRAND, LIGHT = (5, 42, 51), (11, 85, 102), (10, 127, 155), (18, 178, 210), (149, 223, 240)
GOLD = (255, 209, 102)

data = json.loads(subprocess.check_output(
    ['node', '-e', "import('./scripts/content.mjs').then(m=>console.log(JSON.stringify({b:m.business,s:m.services})))"],
    cwd=ROOT, text=True, encoding='utf-8'))
B, SERVICES = data['b'], data['s']

def font(size, weight=700, italic=False):
    if italic:
        return ImageFont.truetype(str(ROOT / 'assets/fonts/instrument-serif-italic.ttf'), size)
    f = ImageFont.truetype(str(ROOT / 'assets/fonts/manrope-variable.ttf'), size)
    f.set_variation_by_axes([weight])
    return f

def cover(img, w, h):
    r = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
    x, y = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((x, y, x + w, y + h))

def gradient(w, h, stops, horizontal=True):
    """stops: lista de (posición 0-1, (r,g,b,a))"""
    n = w if horizontal else h
    line = []
    for i in range(n):
        t = i / (n - 1)
        for k in range(len(stops) - 1):
            (p0, c0), (p1, c1) = stops[k], stops[k + 1]
            if p0 <= t <= p1:
                u = (t - p0) / (p1 - p0) if p1 > p0 else 0
                line.append(tuple(round(c0[j] + (c1[j] - c0[j]) * u) for j in range(4)))
                break
        else:
            line.append(stops[-1][1])
    # Se dibuja una sola línea y se estira: mucho más rápido que rellenar píxel a píxel.
    strip = Image.new('RGBA', (n, 1) if horizontal else (1, n))
    strip.putdata(line)
    return strip.resize((w, h), Image.BILINEAR)

def bubbles(canvas, n, seed, area=None, rmin=6, rmax=34, alpha=90):
    rnd = random.Random(seed)
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = area or (0, 0, canvas.width, canvas.height)
    for _ in range(n):
        r = rnd.uniform(rmin, rmax); x = rnd.uniform(x0, x1); y = rnd.uniform(y0, y1)
        d.ellipse((x - r, y - r, x + r, y + r), outline=(255, 255, 255, alpha), width=2)
        d.ellipse((x - r * .55, y - r * .6, x - r * .15, y - r * .35), fill=(255, 255, 255, min(255, alpha + 60)))
    canvas.alpha_composite(layer)

def sparkle(d, cx, cy, s, fill):
    pts = [(cx, cy - s), (cx + s * .22, cy - s * .22), (cx + s, cy), (cx + s * .22, cy + s * .22),
           (cx, cy + s), (cx - s * .22, cy + s * .22), (cx - s, cy), (cx - s * .22, cy - s * .22)]
    d.polygon(pts, fill=fill)

def star(d, cx, cy, r, fill):
    import math
    pts = [(cx + (r if i % 2 == 0 else r * .45) * math.cos(math.pi / 2 + i * math.pi / 5) * -1,
            cy - (r if i % 2 == 0 else r * .45) * math.sin(math.pi / 2 + i * math.pi / 5)) for i in range(10)]
    d.polygon(pts, fill=fill)

def rounded_logo(path, width, pad=22, radius=26):
    logo = Image.open(path).convert('RGBA')
    logo = logo.resize((width, round(logo.height * width / logo.width)), Image.LANCZOS)
    card = Image.new('RGBA', (logo.width + pad * 2, logo.height + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle((0, 0, card.width - 1, card.height - 1), radius, fill=(255, 255, 255, 255))
    card.alpha_composite(logo, (pad, pad))
    shadow = Image.new('RGBA', (card.width + 60, card.height + 60), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((30, 40, card.width + 30, card.height + 40), radius, fill=(0, 20, 30, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    shadow.alpha_composite(card, (30, 30))
    return shadow

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur)
    return lines

def pill(canvas, x, y, text, f, bg, fg, padx=22, h=52):
    # Fondo en una capa aparte para que la transparencia se mezcle en vez de sustituir píxeles.
    d = ImageDraw.Draw(canvas)
    w = d.textlength(text, font=f) + padx * 2
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle((x, y, x + w, y + h), h // 2, fill=bg, outline=(255, 255, 255, 90), width=2)
    canvas.alpha_composite(layer)
    ImageDraw.Draw(canvas).text((x + padx, y + h / 2), text, font=f, fill=fg, anchor='lm')
    return x + w

def google_badge(canvas, x, y):
    """Sello de opiniones reales en Google (5 estrellas dibujadas)."""
    d = ImageDraw.Draw(canvas)
    t1, t2 = 'Opiniones reales', 'Clientes encantados en Google'
    w = 26 + 5 * 30 + 16 + max(d.textlength(t1, font=font(20, 800)), d.textlength(t2, font=font(16, 500))) + 22
    d.rounded_rectangle((x, y, x + w, y + 70), 22, fill=(255, 255, 255, 245))
    for i in range(5): star(d, x + 26 + i * 30, y + 35, 12, GOLD)
    tx = x + 26 + 5 * 30 + 4
    d.text((tx, y + 22), t1, font=font(20, 800), fill=PETROL, anchor='lm')
    d.text((tx, y + 48), t2, font=font(16, 500), fill=(82, 112, 122), anchor='lm')

def save(canvas, name):
    canvas.convert('RGB').save(OUT / name, 'JPEG', quality=84, optimize=True, progressive=True)
    kb = (OUT / name).stat().st_size // 1024
    print(f'{name}: {kb} KB')

# ---------- Portada: logo grande + mensaje principal ----------
def home():
    c = gradient(W, H, [(0, (5, 42, 51, 255)), (.55, (11, 85, 102, 255)), (1, (10, 127, 155, 255))])
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((700, -260, 1400, 440), fill=(18, 178, 210, 120))
    c.alpha_composite(glow.filter(ImageFilter.GaussianBlur(90)))
    bubbles(c, 8, 7, (0, 0, W, 90), alpha=70)
    bubbles(c, 6, 8, (0, 580, W, H), alpha=60)
    bubbles(c, 6, 9, (1040, 200, W, 560), alpha=70)
    logo = rounded_logo(ROOT / 'assets/brand/logo-vertical-hd.png', 330, pad=26, radius=32)
    c.alpha_composite(logo, (40, (H - logo.height) // 2))
    d = ImageDraw.Draw(c)
    x = 480
    d.text((x, 118), f"LIMPIEZAS EN {B['city'].upper()} · SERVICIO INTEGRAL", font=font(19, 800), fill=LIGHT)
    d.text((x - 3, 150), 'Deja tus espacios', font=font(62, 800), fill='white')
    d.text((x, 214), 'relucientes.', font=font(84, italic=True), fill=LIGHT)
    px = x
    for t in ['Cristales', 'Toldos', 'Garajes']:
        px = pill(c, px, 330, t, font(22, 700), (255, 255, 255, 38), 'white', padx=20, h=48) + 10
    google_badge(c, x, 406)
    d.text((x, 526), f"Agenda hoy mismo · {B['phone']}", font=font(28, 800), fill='white')
    sparkle(d, 1130, 90, 16, (255, 255, 255, 230)); sparkle(d, 1090, 140, 8, LIGHT); sparkle(d, 440, 560, 10, LIGHT)
    save(c, 'og-home.jpg')

# ---------- Servicios y páginas: foto de fondo + logo + título ----------
def photo_card(name, photo, eyebrow, title, tagline, extra=None, stars=False):
    c = cover(Image.open(ROOT / f'assets/images/{photo}.jpg').convert('RGB'), W, H).convert('RGBA')
    c.alpha_composite(gradient(W, H, [(0, (5, 42, 51, 245)), (.42, (5, 42, 51, 215)), (.72, (5, 42, 51, 70)), (1, (5, 42, 51, 20))]))
    c.alpha_composite(gradient(W, H, [(0, (5, 42, 51, 0)), (.6, (5, 42, 51, 0)), (1, (5, 42, 51, 200))], horizontal=False))
    bubbles(c, 12, hash(name) % 1000, (0, 0, 620, H), rmin=5, rmax=24, alpha=65)
    logo = rounded_logo(ROOT / 'assets/brand/logo-horizontal-hd.png', 250, pad=14, radius=18)
    c.alpha_composite(logo, (26, 18))
    d = ImageDraw.Draw(c)
    x, y = 60, 190
    d.text((x, y), eyebrow.upper(), font=font(19, 800), fill=LIGHT)
    tf = font(66 if len(title) < 26 else 58, 800)
    lines = wrap(d, title, tf, 640)
    y += 34
    for ln in lines:
        d.text((x - 2, y), ln, font=tf, fill='white'); y += tf.size + 6
    d.text((x, y + 4), tagline, font=font(44, italic=True), fill=LIGHT)
    y += 76
    if stars:  # la tipografía no tiene el carácter ★: se dibujan
        for i in range(5): star(d, x + 13 + i * 30, y + 14, 13, GOLD)
        x += 5 * 30 + 12
    if extra:
        d.text((x, y), extra, font=font(22, 600), fill=(214, 236, 242))
    x = 60
    d.text((x, H - 70), f"Presupuesto sin compromiso · {B['phone']}", font=font(24, 800), fill='white')
    google_badge(c, W - 440, H - 100)
    save(c, f'og-{name}.jpg')

home()
for s in SERVICES:
    photo_card(s['slug'], s['img'], f"{B['city']} · Limpiezas Lumis", s['title'], s['line'], ' · '.join(s['facts']))
photo_card('opiniones', 'cristales', 'Opiniones reales en Google', 'Lo que dicen nuestros clientes', 'Puntuales, cuidadosos y detallistas.', 'Viviendas, clínicas, restaurantes y gimnasios', stars=True)
photo_card('como-trabajamos', 'general', 'Nuestro método', 'Así trabajamos en Lumis', 'Claro, puntual y sin sorpresas.', 'Presupuesto sin compromiso · Revisión final contigo')
photo_card('contacto', 'terrazas', f"Contacto · {B['city']}", 'Hablemos de tu espacio', 'Llámanos o escríbenos por WhatsApp.', f"{B['phone']} · {B['landline']} · {B['email']}")
