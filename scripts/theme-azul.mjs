// Genera la paleta alternativa «Azul» (los azules originales de la web + el azul del marco del logo)
// a partir de las hojas de estilo turquesa. Salida: assets/css/azul/*.css
// Se ejecuta automáticamente desde build.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = ['lumis.css', 'pages.css', 'fx.css'];
const HUE = 214;
const TOKENS = '--navy:#0a2a66;--navy-2:#071d49;--blue:#0b5fd0;--blue-2:#2a86ee;--sky:#5cc8ef;--brand:#0195f6;--ice:#eef6fc;--ice-2:#dfeefa;';

const toHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
const toRgb = (h, s, l) => { const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0), f(8), f(4)].map(v => Math.round(v * 255)); };
const shift = (r, g, b) => { const [h, s, l] = toHsl(r, g, b); return (h >= 175 && h <= 205 && s > .12) ? toRgb(HUE, s, l) : [r, g, b]; };
const hex = v => v.toString(16).padStart(2, '0');

export function buildBlueTheme() {
  const out = path.join(root, 'assets/css/azul');
  fs.mkdirSync(out, { recursive: true });
  for (const f of SRC) {
    let css = fs.readFileSync(path.join(root, 'assets/css', f), 'utf8');
    css = css.replace(/#([0-9a-f]{6})\b/gi, (m, h) => '#' + shift(...[0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))).map(hex).join(''));
    css = css.replace(/rgba\((\d+),(\d+),(\d+),/g, (m, r, g, b) => `rgba(${shift(+r, +g, +b).join(',')},`);
    css = css.replace(/url\('\.\.\/fonts\//g, "url('../../fonts/");
    css = css.replace(/--navy:[^;]+;--navy-2:[^;]+;--blue:[^;]+;--blue-2:[^;]+;--sky:[^;]+;--brand:[^;]+;--ice:[^;]+;--ice-2:[^;]+;/, TOKENS);
    if (f === 'fx.css') css += '\n:root{--hue-shift:24}\n'; // tono de las burbujas CSS
    fs.writeFileSync(path.join(out, f), `/* Generado por scripts/theme-azul.mjs a partir de ../${f}. No editar a mano. */\n` + css);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) { buildBlueTheme(); console.log('Paleta azul generada'); }
