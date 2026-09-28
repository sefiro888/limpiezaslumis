// Lleva los tonos azules de las hojas de estilo al matiz petróleo/turquesa del logo (≈190°).
// Uso: node scripts/retint.mjs
import fs from 'node:fs';
const TARGET = 190, files = ['assets/css/lumis.css', 'assets/css/pages.css', 'assets/css/fx.css'];
const toHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
const toRgb = (h, s, l) => { const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0), f(8), f(4)].map(v => Math.round(v * 255)); };
const shift = (r, g, b) => { const [h, s, l] = toHsl(r, g, b); return (h >= 195 && h <= 245 && s > .12) ? toRgb(TARGET, s, l) : [r, g, b]; };
const hex = v => v.toString(16).padStart(2, '0');
for (const f of files) {
  let css = fs.readFileSync(f, 'utf8'), n = 0;
  css = css.replace(/#([0-9a-f]{6})\b/gi, (m, h) => { const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); const o = shift(r, g, b); if (o.join() !== [r, g, b].join()) n++; return '#' + o.map(hex).join(''); });
  css = css.replace(/rgba\((\d+),(\d+),(\d+),/g, (m, r, g, b) => { const o = shift(+r, +g, +b); if (o.join() !== [r, g, b].join()) n++; return `rgba(${o.join(',')},`; });
  fs.writeFileSync(f, css); console.log(f, n, 'colores ajustados');
}
