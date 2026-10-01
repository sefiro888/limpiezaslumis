# Flyer A5 de Limpiezas Lumis con QR a la web, Instagram y TikTok.
# Uso: python scripts/flyer.py   (requiere Pillow, segno, Node; zxing-cpp para comprobar los QR). Salida en redes/.
#   lumis-flyer-a5-imprenta.pdf  → A5 con 3 mm de sangrado (154 x 216 mm), para la imprenta
#   lumis-flyer-a4-casa.pdf      → A4 horizontal con dos flyers y guía de corte, para imprimir en casa
#   lumis-flyer-a5.jpg           → vista previa / para enviar por WhatsApp
import importlib.util, math
from pathlib import Path
from PIL import Image, ImageDraw
import segno

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('social', ROOT / 'scripts/social-images.py')
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
B = S.B

DPI = 300
mm = lambda v: round(v / 25.4 * DPI)
BLEED = mm(3)
W, H = mm(154), mm(216)                                 # se recalculan en flyer() según el formato
CX = W // 2
SAFE = BLEED + mm(6)                                    # margen interior de seguridad

LINKS = {
    'web': f"https://{B['domain']}/",
    'instagram': B['instagram'],
    'tiktok': B['tiktok'],
}
IG_COLORS = [(254, 218, 117), (250, 126, 30), (214, 41, 118), (150, 47, 191), (79, 91, 213)]


def qr(url, size, center=None):
    q = segno.make(url, error='h', boost_error=False)
    m = [list(r) for r in q.matrix]
    n, border = len(m), 4
    mod = size // (n + border * 2)
    side = mod * (n + border * 2)
    im = Image.new('RGBA', (side, side), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    for yy, row in enumerate(m):
        for xx, v in enumerate(row):
            if v:
                x0, y0 = (xx + border) * mod, (yy + border) * mod
                d.rectangle((x0, y0, x0 + mod - 1, y0 + mod - 1), fill=(10, 30, 38))
    if center is not None:
        ic = round(n * mod * .22)
        c = side // 2
        d.rounded_rectangle((c - ic // 2 - mod, c - ic // 2 - mod, c + ic // 2 + mod, c + ic // 2 + mod), mod * 2, fill=(255, 255, 255))
        im.alpha_composite(center.resize((ic, ic), Image.LANCZOS), (c - ic // 2, c - ic // 2))
    return im


# ---------- Iconos de las redes (dibujados, sin depender de fuentes) ----------
def ig_gradient(size):
    g = Image.new('RGBA', (size, size))
    px = g.load()
    for y in range(size):
        for x in range(size):
            t = min(1, max(0, (x * .45 + (size - y) * .75) / (size * 1.2)))
            k = t * (len(IG_COLORS) - 1); i = min(int(k), len(IG_COLORS) - 2); u = k - i
            a, b = IG_COLORS[i], IG_COLORS[i + 1]
            px[x, y] = tuple(round(a[j] + (b[j] - a[j]) * u) for j in range(3)) + (255,)
    return g

def ig_icon(size):
    g = ig_gradient(size)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), round(size * .28), fill=255)
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 0)); icon.paste(g, (0, 0), mask)
    d = ImageDraw.Draw(icon); s = size; w = max(2, round(s * .075))
    d.rounded_rectangle((s * .2, s * .2, s * .8, s * .8), round(s * .17), outline='white', width=w)
    d.ellipse((s * .355, s * .355, s * .645, s * .645), outline='white', width=w)
    d.ellipse((s * .66, s * .28, s * .73, s * .35), fill='white')
    return icon

def tiktok_icon(size):
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(icon); s = size
    d.rounded_rectangle((0, 0, s - 1, s - 1), round(s * .28), fill=(0, 0, 0))
    def note(dx, dy, col):
        w = round(s * .11)
        d.rectangle((s * .5 + dx, s * .2 + dy, s * .5 + w + dx, s * .66 + dy), fill=col)
        d.ellipse((s * .27 + dx, s * .52 + dy, s * .55 + dx, s * .8 + dy), outline=col, width=w)
        d.arc((s * .5 + dx, s * .02 + dy, s * .86 + dx, s * .38 + dy), 90, 180, fill=col, width=w)
    o = s * .03
    note(-o, -o, (37, 244, 238)); note(o, o, (254, 44, 85)); note(0, 0, (255, 255, 255))
    return icon

def web_icon(size):
    return Image.open(ROOT / 'assets/brand/icono-512.png').convert('RGBA').resize((size, size), Image.LANCZOS)


# ---------- Flyer ----------
# El diseño está medido para A5; k escala todas las medidas (A4 = A5 x 1,40). Así cada tamaño se dibuja a su
# resolución real en vez de ampliar una imagen.
def flyer(fmt='A5'):
    global W, H, CX, SAFE
    trim_w, trim_h = (148, 210) if fmt == 'A5' else (210, 297)
    W, H = mm(trim_w + 6), mm(trim_h + 6)
    CX, SAFE = W // 2, BLEED + mm(6)
    k = (trim_w + 6) / 154
    u = lambda v: round(v * k)
    F = lambda size, weight=700, italic=False: S.font(u(size), weight, italic)

    c = Image.new('RGBA', (W, H), S.WHITE + (255,))
    # Parte superior oscura
    top_h = u(mm(96))
    top = S.vgradient(W, top_h, [(0, S.DEEP), (.6, S.PETROL), (1, S.TEAL)])
    S.glow(top, W * .85, top_h * .2, W * .4, S.BRAND, 90)
    S.streaks(top, 5)
    S.bubbles(top, 14, 5, rmin=u(12), rmax=u(60), alpha=70)
    c.alpha_composite(top, (0, 0))
    # Ola de transición
    wave = Image.new('RGBA', (W, u(200)), (0, 0, 0, 0))
    pts = [(x, u(110) + u(46) * math.sin(x / W * math.pi * 2 + .6)) for x in range(0, W + 1, 8)]
    ImageDraw.Draw(wave).polygon([(0, u(200))] + pts + [(W, u(200))], fill=S.WHITE + (255,))
    c.alpha_composite(wave, (0, top_h - u(150)))
    d = ImageDraw.Draw(c)
    for sx, sy, ss in [(SAFE + u(40), u(300), u(26)), (W - SAFE - u(40), u(240), u(34)), (W - SAFE - u(90), u(520), u(20)), (SAFE + u(70), u(640), u(18))]:
        S.sparkle(d, sx, sy, ss, (255, 255, 255, 220))

    y = S.logo_card(c, 'logo-horizontal-hd.png', u(520), CX, SAFE + u(30), pad=u(30), radius=u(40)) + u(50)
    d = ImageDraw.Draw(c)
    S.text_c(d, CX, y, 'LIMPIEZA PROFESIONAL EN ZARAGOZA', F(40, 800), S.LIGHT); y += u(72)
    S.text_c(d, CX, y, '¿Lo dejamos', F(132, 800), S.WHITE); y += u(140)
    S.text_c(d, CX, y, 'reluciente?', F(148, italic=True), S.LIGHT); y += u(196)
    items = [S.LABEL[kk] for kk in S.DEST] + [f"y {len(S.SERVICES) - len(S.DEST)} servicios más"]
    S.pills_centered(c, CX, y, items, F(36, 700), W - SAFE * 2, gap=u(16), h=u(72), padx=u(26), bg=(255, 255, 255, 34), fg=S.WHITE)

    # Escanea
    y = top_h + u(30)
    d = ImageDraw.Draw(c)
    S.text_c(d, CX, y, 'Escanea y conócenos', F(86, 800), S.PETROL); y += u(100)
    S.text_c(d, CX, y, 'Nuestra web, trabajos reales y novedades en redes', F(38, 600), S.MUTED); y += u(80)

    cards = [('web', 'Nuestra web', B['domain'], web_icon, S.BRAND),
             ('instagram', 'Instagram', B['instagramHandle'], ig_icon, (214, 41, 118)),
             ('tiktok', 'TikTok', B['tiktokHandle'], tiktok_icon, (0, 0, 0))]
    gap = u(44)
    cw = (W - SAFE * 2 - gap * 2) // 3
    qs = cw - u(104)
    ch = u(120) + qs + u(110)
    for i, (key, title, handle, icon_fn, col) in enumerate(cards):
        x = SAFE + i * (cw + gap)
        S.shadowed_card(c, (x, y, x + cw, y + ch), u(46), shadow=70, blur=u(30))
        d = ImageDraw.Draw(c)
        d.rounded_rectangle((x, y, x + cw, y + ch), u(46), outline=col + (255,), width=u(5))
        ic = icon_fn(u(84))
        tf = F(44, 800)
        tw = u(84) + u(18) + d.textlength(title, font=tf)
        tx = x + (cw - tw) / 2
        c.alpha_composite(ic, (round(tx), y + u(34)))
        d.text((tx + u(102), y + u(76)), title, font=tf, fill=S.PETROL, anchor='lm')
        code = qr(LINKS[key], qs, center=icon_fn(u(200)))
        c.alpha_composite(code, (x + (cw - code.width) // 2, y + u(118)))
        hf = F(36 if len(handle) < 17 else 32, 800)
        d.text((x + cw / 2, y + u(118) + code.height + u(32)), handle, font=hf, fill=col if key != 'web' else S.TEAL, anchor='mm')
    y += ch + u(50)

    # Pie: reseñas y teléfonos
    d = ImageDraw.Draw(c)
    sw = 5 * u(56)
    lf = F(40, 700)
    sx = CX - (sw + u(24) + d.textlength('Opiniones reales en Google', font=lf)) / 2
    for i in range(5): S.star(d, sx + u(26) + i * u(56), y + u(26), u(24), S.GOLD)
    d.text((sx + sw + u(24), y + u(26)), 'Opiniones reales en Google', font=lf, fill=S.PETROL, anchor='lm')
    y += u(76)
    band_top = y
    band = S.vgradient(W, H - band_top, [(0, S.PETROL), (1, S.DEEP)])
    S.bubbles(band, 8, 9, rmin=u(10), rmax=u(40), alpha=60)
    c.alpha_composite(band, (0, band_top))
    d = ImageDraw.Draw(c)
    y = band_top + u(40)
    S.text_c(d, CX, y, 'PRESUPUESTO SIN COMPROMISO', F(38, 800), S.LIGHT); y += u(64)
    S.text_c(d, CX, y, B['phone'], F(92, 800), S.WHITE); y += u(112)
    S.text_c(d, CX, y, f"Llamadas y WhatsApp  ·  Fijo {B['landline']}", F(44, 700), (207, 240, 247)); y += u(68)
    S.text_c(d, CX, y, f"{B['city']} y hasta 40 minutos alrededor", F(38, 600), S.LIGHT)
    assert y + u(50) < H - SAFE, f'El pie se sale del margen de seguridad ({y})'
    return c


def check_qr(img, label):
    import zxingcpp
    for scale in (1, .5, .3):
        small = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        found = sorted(r.text for r in zxingcpp.read_barcodes(small))
        ok = all(u in found for u in LINKS.values())
        print(f'QR {label} a escala {scale}: {"OK" if ok else "FALLO"}')


if __name__ == '__main__':
    out = S.OUT
    f = flyer('A5').convert('RGB')
    # Calidad JPEG máxima y sin submuestreo de color: textos y QR nítidos en imprenta
    f.save(out / 'lumis-flyer-a5-imprenta.pdf', 'PDF', resolution=DPI, quality=100, subsampling=0)
    trimmed = f.crop((BLEED, BLEED, W - BLEED, H - BLEED))
    trimmed.save(out / 'lumis-flyer-a5.jpg', quality=92, dpi=(DPI, DPI))
    # A4 horizontal con dos flyers, márgenes de 6 mm (las impresoras de casa no imprimen hasta el borde)
    # y marcas de corte en las esquinas de cada flyer. Imprimir a «tamaño real / 100 %».
    a4 = Image.new('RGB', (mm(297), mm(210)), 'white')
    margin, gap = mm(6), mm(6)
    fw = (a4.width - margin * 2 - gap) // 2
    small = trimmed.resize((fw, round(trimmed.height * fw / trimmed.width)), Image.LANCZOS)
    top = (a4.height - small.height) // 2
    dd = ImageDraw.Draw(a4)
    for x in (margin, margin + fw + gap):
        a4.paste(small, (x, top))
        x1, y1 = x + small.width, top + small.height
        L, o = mm(4), mm(1)
        for cx_, cy_, sx, sy in ((x, top, -1, -1), (x1, top, 1, -1), (x, y1, -1, 1), (x1, y1, 1, 1)):
            dd.line([(cx_ + sx * o, cy_), (cx_ + sx * (o + L), cy_)], fill=(120, 120, 120), width=2)
            dd.line([(cx_, cy_ + sy * o), (cx_, cy_ + sy * (o + L))], fill=(120, 120, 120), width=2)
    a4.save(out / 'lumis-flyer-a4-casa.pdf', 'PDF', resolution=DPI, quality=100, subsampling=0)
    print('Flyer generado:', f.size, 'px con sangrado')

    check_qr(trimmed, 'A5')

    # A4 entero (210 x 297 mm): mismo diseño dibujado a tamaño A4, con sangrado para imprenta
    f4 = flyer('A4').convert('RGB')
    f4.save(out / 'lumis-flyer-a4-imprenta.pdf', 'PDF', resolution=DPI, quality=100, subsampling=0)
    t4 = f4.crop((BLEED, BLEED, f4.width - BLEED, f4.height - BLEED))
    t4.save(out / 'lumis-flyer-a4.jpg', quality=92, dpi=(DPI, DPI))
    # Versión A4 para impresora de casa: sin sangrado y con 5 mm de margen blanco
    home = Image.new('RGB', (mm(210), mm(297)), 'white')
    m5 = mm(5)
    fit = t4.resize((home.width - m5 * 2, round(t4.height * (home.width - m5 * 2) / t4.width)), Image.LANCZOS)
    home.paste(fit, (m5, (home.height - fit.height) // 2))
    home.save(out / 'lumis-flyer-a4-entero-casa.pdf', 'PDF', resolution=DPI, quality=100, subsampling=0)
    print('Flyer A4 generado:', f4.size, 'px con sangrado')
    check_qr(t4, 'A4')
