// Genera todas las páginas de la web a partir de scripts/content.mjs.
// Uso: node scripts/build.mjs [carpeta-destino]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  business as B, groups, services, pillars, generalFaq, reviews, reviewsUrl,
  method, quoteChecklist, commitments, tools, serviceModes, offerFaq, loveThemes,
} from './content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || root);
const V = '6';

const bySlug = Object.fromEntries(services.map(s => [s.slug, s]));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M7 17 17 7M8 7h9v9"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  spark: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  wa: '<path d="M3 21l1.6-4.7A9 9 0 1 1 8 19.6Z"/><path d="M9 8.5c.3 2.7 3 5.6 6.5 6.5l1.3-1.6-2.3-1.2-1 1c-1.2-.5-2.3-1.5-2.8-2.8l1-1-1.1-2.4Z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8Z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  plan: '<path d="M8 4h8M9 2h6v4H9z"/><rect x="5" y="4" width="14" height="17" rx="2"/><path d="m9 13 2 2 4-4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/>',
  home: '<path d="m3 11 9-7 9 7M5 10v10h14V10"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  star: '<path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8Z"/>',
  quote: '<path d="M9 7H5v6h4v4l-2 2M19 7h-4v6h4v4l-2 2"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3Z"/><path d="M5 5l4 4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[n] || paths.spark}</svg>`;
const groupIcon = { hogar: 'home', exterior: 'sun', profesional: 'building', superficies: 'layers' };

const wa = (msg = 'Hola Lumis, he visto vuestra web y me gustaría pedir un presupuesto sin compromiso.') => `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(msg)}`;
const tel = `tel:${B.phoneIntl}`;
const img = (name, alt, { cls = '', eager = false, sizes = '(max-width: 760px) 92vw, 45vw' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="assets/images/${name}.jpg" srcset="assets/images/${name}-sm.jpg 640w, assets/images/${name}.jpg 1536w" sizes="${sizes}" alt="${esc(alt)}" width="1536" height="1024" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;

const stars = n => `<span class="stars" role="img" aria-label="${n} de 5 estrellas">${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" class="${i <= n ? 'on' : ''}" aria-hidden="true"><path d="${paths.star.match(/d="([^"]+)"/)[1]}"/></svg>`).join('')}</span>`;
const reviewCard = (r, cls = 'rv', style = '') => `<figure class="${cls}"${style ? ` style="${style}"` : ''} data-kind="${r.business ? 'empresa' : 'particular'}"><div class="rv-top">${stars(r.rating)}<span class="rv-src">Google</span></div><blockquote>${esc(r.text)}</blockquote><figcaption><span class="rv-av" aria-hidden="true">${esc(r.name.trim()[0].toUpperCase())}</span><span><b>${esc(r.name)}</b><small>${r.business ? 'Empresa cliente' : 'Cliente'} · ${B.city}</small></span></figcaption></figure>`;
const reviewsFor = slug => {
  const own = reviews.filter(r => r.tags.includes(slug));
  const extra = reviews.filter(r => !own.includes(r) && r.rating === 5);
  return [...own, ...extra].slice(0, 3);
};

const btnBook = (label = 'Agendar cita', slug = '', cls = 'btn btn-primary') =>
  `<button type="button" class="${cls}" data-book${slug ? ` data-service="${slug}"` : ''}>${icon('calendar')}<span>${label}</span></button>`;

// Ola animada para separar secciones.
const wave = (cls, fill = 'var(--bg)') => `<div class="wave ${cls}" aria-hidden="true"><svg viewBox="0 0 2880 120" preserveAspectRatio="none"><path fill="${fill}" opacity=".45" d="M0 60c240 40 480 40 720 0s480-40 720 0 480 40 720 0 480-40 720 0v60H0Z"/><path fill="${fill}" d="M0 80c240-30 480-30 720 0s480 30 720 0 480-30 720 0 480 30 720 0v40H0Z"/></svg></div>`;
// Escenario oscuro con burbujas para la cabecera de cada página.
const stage = (inner, cls = '') => `<div class="stage ${cls}">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="stage-light" aria-hidden="true"><i></i><i></i><i></i></div>
${inner}
${wave('wave-bottom')}
</div>`;

const PAGES = [['index', 'Inicio'], ['oferta', 'Oferta'], ['opiniones', 'Opiniones'], ['como-trabajamos', 'Cómo trabajamos'], ['contacto', 'Contacto']];
const cur = (current, key) => current === key ? ' aria-current="page"' : '';

// ---------- Piezas comunes ----------
const tickerItems = [
  ['tag', '<b>50% DTO</b> en tu 5ª limpieza'],
  ['calendar', 'Agenda hoy mismo'],
  ['star', '<b>★★★★★</b> Opiniones reales en Google'],
  ['spark', 'Cristales · Toldos · Garajes'],
  ['check', 'Presupuesto sin compromiso'],
  ['pin', 'Zaragoza y alrededores'],
  ['phone', B.phone],
];
const tickerRow = () => tickerItems.map(([i, t]) => `<span class="tk-item">${icon(i)}${t}</span>`).join('');
const announce = () => `<div class="announce" aria-label="Novedades de Lumis"><div class="tk"><div class="tk-track">${tickerRow()}</div><div class="tk-track" aria-hidden="true">${tickerRow()}</div></div></div>`;

function header(current) {
  const mega = groups.map(g => `<div class="mega-col"><p class="mega-title">${icon(groupIcon[g.id])}${g.label}</p><ul>${services.filter(s => s.category === g.id).map(s => `<li><a href="${s.slug}.html"${cur(current, s.slug)}><span>${s.label}</span><small>${esc(s.line)}</small></a></li>`).join('')}</ul></div>`).join('');
  const isSvc = !!bySlug[current];
  return `<header class="hdr" data-header>
<div class="hdr-in">
<a class="logo" href="index.html" aria-label="${B.name}, inicio"><img src="assets/images/logo-horizontal.png" width="508" height="160" alt="${B.name}"></a>
<nav class="nav" aria-label="Principal">
<a href="index.html"${cur(current, 'index')}>Inicio</a>
<div class="has-mega"><button type="button" class="nav-drop${isSvc ? ' is-cur' : ''}" aria-expanded="false" aria-controls="mega">Servicios ${icon('chevron')}</button>
<div class="mega" id="mega"><div class="mega-grid">${mega}</div><div class="mega-foot"><span>${icon('tag')} <b>50% de descuento</b> en tu 5ª limpieza</span><a href="index.html#servicios">Ver los 16 servicios ${icon('arrow')}</a></div></div></div>
${PAGES.slice(1).map(([k, l]) => `<a href="${k}.html"${cur(current, k)}>${l}</a>`).join('\n')}
</nav>
<div class="hdr-actions">
<a class="hdr-tel" href="${tel}">${icon('phone')}<span>${B.phone}</span></a>
${btnBook('Agendar', isSvc ? current : '', 'btn btn-primary btn-sm hdr-book')}
<button type="button" class="burger" aria-expanded="false" aria-controls="mnav" aria-label="Abrir menú"><span></span><span></span><span></span></button>
</div>
</div>
<div class="progress" aria-hidden="true"></div>
</header>`;
}

function mobileNav(current, msg) {
  const extras = { oferta: '<b class="mn-badge">−50%</b>', opiniones: '<b class="mn-stars">★ 5</b>' };
  return `<div class="mnav" id="mnav" aria-label="Menú" aria-hidden="true" inert>
<div class="mnav-bg" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<div class="mnav-top"><a class="mnav-logo" href="index.html"><img src="assets/images/logo-horizontal.png" width="508" height="160" alt="${B.name}"></a><button type="button" class="mnav-close" aria-label="Cerrar menú">${icon('close')}</button></div>
<nav class="mnav-links" aria-label="Menú móvil">
<a href="index.html" style="--i:0"${cur(current, 'index')}><span>Inicio</span>${icon('arrow')}</a>
<details class="mnav-svc" style="--i:1"${bySlug[current] ? ' open' : ''}><summary><span>Servicios <small>16</small></span>${icon('chevron')}</summary>
<div class="mnav-groups">${groups.map(g => `<div><p>${icon(groupIcon[g.id])}${g.label}</p><ul>${services.filter(s => s.category === g.id).map(s => `<li><a href="${s.slug}.html"${cur(current, s.slug)}>${s.label}</a></li>`).join('')}</ul></div>`).join('')}</div>
</details>
${PAGES.slice(1).map(([k, l], i) => `<a href="${k}.html" style="--i:${i + 2}"${cur(current, k)}><span>${l}</span>${extras[k] || ''}${icon('arrow')}</a>`).join('\n')}
</nav>
<div class="mnav-foot" style="--i:7">
${btnBook('Agendar cita', bySlug[current] ? current : '', 'btn btn-light btn-block')}
<div class="mnav-contact"><a href="${tel}">${icon('phone')} Llamar</a><a href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a></div>
<p>${icon('pin')} ${B.city} y alrededores · ${B.phone}</p>
</div>
</div>`;
}

function footer(msg) {
  return `<section class="cta-final"><div class="cta-in reveal">
<div class="cta-bubbles" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<span class="eyebrow on-dark">${icon('spark')} Agenda hoy mismo</span>
<h2>¿Lo dejamos <em>reluciente?</em></h2>
<p>Cuéntanos qué necesitas y te respondemos con un presupuesto sin compromiso. Reservar tu cita lleva menos de un minuto.</p>
<div class="cta-actions">${btnBook('Agendar mi cita', '', 'btn btn-light')}<a class="btn btn-outline-light" href="${tel}">${icon('phone')}<span>Llamar al ${B.phone}</span></a></div>
</div></section>
<footer class="ftr">
<div class="ftr-grid">
<div class="ftr-brand"><img src="assets/images/logo-lumis.png" width="480" height="561" alt="${B.name}" loading="lazy"><p>Servicio integral de limpieza en ${B.city}. Cristales, toldos, garajes, viviendas, comunidades y empresas con productos y técnicas de alta calidad.</p><a class="ftr-social" href="${B.instagram}" target="_blank" rel="noopener">${icon('insta')} ${B.instagramHandle}</a></div>
<div class="ftr-col ftr-svc"><h3>Servicios</h3><ul>${services.map(s => `<li><a href="${s.slug}.html">${s.label}</a></li>`).join('')}</ul></div>
<div class="ftr-col"><h3>Lumis</h3><ul>${PAGES.map(([k, l]) => `<li><a href="${k}.html">${l}</a></li>`).join('')}</ul></div>
<div class="ftr-col ftr-contact"><h3>Contacto</h3>
<a class="ftr-phone" href="${tel}">${B.phone}</a>
<a href="tel:${B.landlineIntl}">${icon('phone')} ${B.landline}</a>
<a href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a>
<a href="mailto:${B.email}">${icon('mail')} ${B.email}</a>
<p>${icon('pin')} ${B.city} y alrededores</p></div>
</div>
<div class="ftr-bottom"><span>© <span data-year>2026</span> ${B.name}. Todos los derechos reservados.</span><span>Las fotografías de la web son ejemplos visuales ilustrativos.</span><a href="#top">Volver arriba ↑</a></div>
</footer>
<nav class="dock" aria-label="Acciones rápidas"><a href="${tel}">${icon('phone')}<span>Llamar</span></a>${btnBook('Agendar', '', 'dock-main')}<a href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')}<span>WhatsApp</span></a></nav>
<a class="wa-fab" href="${wa(msg)}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${icon('wa')}</a>`;
}

function bookingDialog() {
  const opts = groups.map(g => `<optgroup label="${g.label}">${services.filter(s => s.category === g.id).map(s => `<option value="${s.slug}">${s.title}</option>`).join('')}</optgroup>`).join('');
  return `<dialog class="book" id="book" aria-labelledby="book-title">
<form class="book-form" method="dialog" novalidate>
<div class="book-head"><div><span class="eyebrow">${icon('calendar')} Reserva rápida</span><h2 id="book-title">Agenda tu cita <em>en 1 minuto</em></h2></div><button type="button" class="book-close" data-close aria-label="Cerrar">${icon('close')}</button></div>
<ol class="book-steps" aria-hidden="true"><li class="on"><b>1</b>Servicio</li><li><b>2</b>Cuándo</li><li><b>3</b>Tus datos</li></ol>
<fieldset class="book-step" data-step="1"><legend>¿Qué necesitas limpiar?</legend>
<div class="quick-services">${services.filter(s => s.featured).map(s => `<button type="button" class="qs" data-pick="${s.slug}">${img(s.img, '', { sizes: '120px' })}<span>${s.label}</span></button>`).join('')}</div>
<label class="field"><span>O elige entre todos los servicios</span><select name="service" required>${opts}</select></label>
<p class="book-offer">${icon('tag')} Recuerda: <b>50% de descuento en tu 5ª limpieza.</b></p>
</fieldset>
<fieldset class="book-step" data-step="2" hidden><legend>¿Cuándo te viene bien?</legend>
<div class="chips" role="group" aria-label="Fecha rápida"><button type="button" class="chip" data-when="hoy">Hoy mismo</button><button type="button" class="chip" data-when="manana">Mañana</button><button type="button" class="chip" data-when="semana">Esta semana</button><button type="button" class="chip" data-when="flexible">Sin prisa</button></div>
<label class="field"><span>Fecha preferida</span><input type="date" name="date"></label>
<div class="field"><span>Franja horaria</span><div class="seg" role="radiogroup"><label><input type="radio" name="slot" value="por la mañana" checked><span>${icon('sun')} Mañana</span></label><label><input type="radio" name="slot" value="por la tarde"><span>${icon('clock')} Tarde</span></label><label><input type="radio" name="slot" value="a cualquier hora"><span>${icon('check')} Me da igual</span></label></div></div>
</fieldset>
<fieldset class="book-step" data-step="3" hidden><legend>Cuéntanos un poco más</legend>
<div class="field-row"><label class="field"><span>Tu nombre</span><input name="name" autocomplete="given-name" maxlength="60" placeholder="Ej. Laura" required></label>
<label class="field"><span>Zona o barrio</span><input name="zone" maxlength="80" placeholder="Ej. Delicias, Zaragoza" required></label></div>
<label class="field"><span>Detalles <small>(opcional)</small></span><textarea name="notes" rows="3" maxlength="400" placeholder="Metros aproximados, número de ventanas, estado…"></textarea></label>
<label class="check"><input type="checkbox" name="photos"><span>Tengo fotos para enviar y agilizar el presupuesto</span></label>
<div class="book-summary" aria-live="polite"></div>
</fieldset>
<p class="book-error" role="alert" hidden></p>
<div class="book-nav"><button type="button" class="btn btn-ghost" data-prev hidden>Atrás</button><button type="button" class="btn btn-primary" data-next>Continuar ${icon('arrow')}</button><a class="btn btn-wa" data-send hidden target="_blank" rel="noopener" href="${wa()}">${icon('wa')} Enviar por WhatsApp</a></div>
<p class="book-note">${icon('shield')} No guardamos tus datos: el mensaje se abre en tu WhatsApp para que lo revises antes de enviarlo. ¿Prefieres hablar? <a href="${tel}">Llámanos al ${B.phone}</a>.</p>
</form></dialog>`;
}

const jsonLd = () => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'HousekeepingService', name: B.name, telephone: B.phoneIntl, email: B.email,
  areaServed: B.city, address: { '@type': 'PostalAddress', addressLocality: B.city, addressCountry: 'ES' }, sameAs: [B.instagram],
  makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title } })),
})}</script>`;

const page = ({ title, desc, bodyClass, current, main, msg }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0b5566">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<link rel="icon" type="image/png" sizes="48x48" href="assets/images/favicon-48.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/images/icon-192.png">
<link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
<meta property="og:image" content="https://sefiro888.github.io/limpiezaslumis/assets/images/logo-lumis.png">
<link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="assets/css/lumis.css?v=${V}">
<link rel="stylesheet" href="assets/css/pages.css?v=${V}">
<link rel="stylesheet" href="assets/css/fx.css?v=${V}">
<script>try{if(sessionStorage.getItem('fx-nav')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('fx-enter');sessionStorage.removeItem('fx-nav')}catch(e){}</script>
${current === 'index' || current === 'contacto' ? jsonLd() : ''}
</head>
<body class="${bodyClass}" id="top"${bySlug[current] ? ` data-service="${current}"` : ''}>
<div class="fx-veil" aria-hidden="true"><img src="assets/images/logo-lumis.png" width="480" height="561" alt=""></div>
<a class="skip" href="#contenido">Saltar al contenido</a>
${announce()}
${header(current)}
${mobileNav(current, msg)}
<main id="contenido">
${main}
</main>
${footer(msg)}
${bookingDialog()}
<script src="assets/js/lumis.js?v=${V}" defer></script>
<script src="assets/js/fx.js?v=${V}" defer></script>
</body>
</html>
`;

const faqList = items => `<div class="faq">${items.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}<span class="faq-ico" aria-hidden="true"></span></summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;

const stampCard = (compact = false) => `<div class="stamp-card${compact ? ' compact' : ''}" data-stamps>
<div class="stamp-top"><img src="assets/images/logo-horizontal.png" width="508" height="160" alt="" loading="lazy"><span>Tarjeta cliente</span></div>
<ol class="stamps">${[1, 2, 3, 4].map(n => `<li><span>${n}ª</span>${icon('check')}</li>`).join('')}<li class="stamp-gold"><span>5ª</span><b>50%</b></li></ol>
<p>Cada limpieza suma. <b>La quinta, a mitad de precio.</b></p>
</div>`;

const compareBlock = (pair, label) => `<div class="cmp" data-compare style="--pos:50%">
<img src="assets/images/${pair}-despues.jpg" alt="${esc(label)}: después (ejemplo ilustrativo)" width="1536" height="1024" loading="lazy">
<div class="cmp-before"><img src="assets/images/${pair}-antes.jpg" alt="${esc(label)}: antes (ejemplo ilustrativo)" width="1536" height="1024" loading="lazy"></div>
<span class="cmp-tag cmp-tag-l">Antes</span><span class="cmp-tag cmp-tag-r">Después</span>
<div class="cmp-handle" aria-hidden="true"><span>${icon('chevron')}${icon('chevron')}</span></div>
<input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después: ${esc(label)}">
</div>`;

const serviceCard = (s, extra = '') => `<a class="card reveal" href="${s.slug}.html" data-cat="${s.category}"${extra}>
<div class="card-media">${img(s.img, '', { sizes: '(max-width: 760px) 40vw, 24vw' })}<span class="card-cat">${groups.find(g => g.id === s.category).label}</span>${s.featured ? '<span class="card-star">Estrella</span>' : ''}</div>
<div class="card-body"><h3>${s.title}</h3><p>${esc(s.card)}</p><div class="card-foot"><span class="tags">${s.tags.map(t => `<i>${t}</i>`).join('')}</span><span class="card-go">${icon('up')}</span></div></div>
</a>`;

// Cinta de servicios en movimiento, discreta y elegante.
const strip = () => {
  const row = services.map(s => `<a href="${s.slug}.html">${s.label}</a>${icon('spark')}`).join('');
  return `<section class="strip" aria-label="Nuestros servicios"><div class="strip-row"><div class="strip-track">${row}</div><div class="strip-track" aria-hidden="true">${row}</div></div></section>`;
};

// Cabecera de páginas interiores.
const pageHero = ({ crumb, eyebrow, title, lead, ctas, visual, cls = '' }) => stage(`<nav class="crumbs wrap" aria-label="Ruta"><a href="index.html">Inicio</a>${icon('chevron')}<span aria-current="page">${crumb}</span></nav>
<section class="page-hero wrap ${cls}">
<div class="page-hero-copy"><span class="eyebrow">${eyebrow}</span><h1 class="hero-title">${title}</h1><p class="svc-lead">${lead}</p>${ctas ? `<div class="hero-cta">${ctas}</div>` : ''}</div>
<div class="page-hero-visual">${visual}</div>
</section>`, 'stage-page');

const sealPath = () => {
  // Sello festoneado como el del folleto de Lumis.
  const n = 16, R = 96, r = 84; let d = '';
  for (let i = 0; i <= n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2, rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(100 + rad * Math.cos(a)).toFixed(1)} ${(100 + rad * Math.sin(a)).toFixed(1)}`;
  }
  return d + 'Z';
};

// ---------- Portada ----------
function home() {
  const featured = services.filter(s => s.featured);
  const pairs = [['cristales', 'Cristales'], ['toldos', 'Toldos'], ['garajes', 'Garajes'], ['terrazas', 'Terrazas'], ['suelos', 'Suelos'], ['interiores', 'Interiores']];
  const hl = reviews.find(x => x.highlight);
  const rest = reviews.filter(r => !r.highlight);
  const half = Math.ceil(rest.length / 2);
  const rvRow = (list, rev) => `<div class="rv-row"${rev ? ' data-reverse' : ''}><div class="rv-track">${list.map(r => reviewCard(r)).join('')}</div><div class="rv-track" aria-hidden="true">${list.map(r => reviewCard(r)).join('')}</div></div>`;

  const main = `
${stage(`<section class="hero">
<div class="hero-copy">
<span class="pill"><span class="pulse"></span>Limpiezas en ${B.city} · Servicio integral</span>
<h1 class="hero-title"><span class="line">Deja tus</span> <span class="line">espacios</span> <span class="line"><em>relucientes.</em></span></h1>
<p class="hero-lead">Nos encargamos de la limpieza de <b>cristales, toldos y garajes</b> —y de todo lo que tu casa, tu comunidad o tu negocio necesite— con productos y técnicas de alta calidad.</p>
<div class="hero-cta">${btnBook('Agendar hoy mismo')}<a class="btn btn-ghost" href="${tel}">${icon('phone')}<span>${B.phone}</span></a></div>
<a class="hero-rating" href="opiniones.html">${stars(5)}<span><b>Clientes encantados en Google</b><small>Lee sus opiniones ${icon('arrow')}</small></span></a>
</div>
<div class="hero-visual">
<figure class="orb orb-a" data-parallax="-0.03">${img('cristales', 'Profesional limpiando un cerramiento de cristal (ejemplo ilustrativo)', { eager: true, sizes: '(max-width: 760px) 80vw, 36vw' })}</figure>
<figure class="orb orb-b" data-parallax="0.04">${img('terrazas', 'Terraza acristalada limpia y luminosa (ejemplo ilustrativo)', { eager: true, sizes: '(max-width: 760px) 60vw, 26vw' })}</figure>
<button type="button" class="seal" data-book aria-label="Agenda hoy mismo">
<svg class="seal-shape" viewBox="0 0 200 200" aria-hidden="true"><path d="${sealPath()}"/></svg>
<svg class="seal-ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100 100m-70 0a70 70 0 1 1 140 0a70 70 0 1 1-140 0"/></defs><text><textPath href="#ring">RESERVA RÁPIDA · SIN COMPROMISO · RESERVA RÁPIDA · SIN COMPROMISO ·</textPath></text></svg>
<span class="seal-text">Agenda<br>hoy<br>mismo</span>
</button>
<a class="float-card fc-offer" href="oferta.html"><span class="fc-big">50%</span><span><b>DTO en tu 5ª limpieza</b><small>Programa cliente Lumis</small></span></a>
<div class="float-card fc-list"><p>Nuestros servicios estrella</p><ul>${featured.map(s => `<li>${icon('check')}${s.title}</li>`).join('')}</ul></div>
</div>
</section>
<a class="scroll-cue" href="#destacados" aria-label="Descubre más"><span></span></a>`)}

${strip()}

<section class="sec intro">
<div class="wrap intro-grid">
<div class="reveal"><span class="eyebrow">${icon('spark')} Hola, somos Lumis</span><h2>Limpieza profesional con <em>trato cercano.</em></h2></div>
<div class="intro-text reveal"><p class="big">Somos un servicio integral de limpieza en ${B.city}. Cuidamos viviendas, comunidades, negocios y naves con el mismo objetivo: que al entrar se note la diferencia.</p><p>Empezamos siempre escuchándote. Cada espacio tiene sus materiales, sus accesos y sus prioridades, y por eso preparamos cada trabajo a medida. Tú hablas directamente con nosotros y recibes un presupuesto claro y sin compromiso.</p>
<div class="stats"><div><b data-count>16</b><span>servicios especializados</span></div><div><b>★ 5</b><span>la valoración que más nos dan en Google</span></div><div><b>5ª</b><span>limpieza con un 50 % de descuento</span></div></div>
<a class="link" href="como-trabajamos.html">Conoce cómo trabajamos ${icon('arrow')}</a></div>
</div>
</section>

<section class="sec featured" id="destacados">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('spark')} Nuestros servicios estrella</span><h2>Cristales, toldos y garajes, <em>nuestra especialidad.</em></h2></div><p>Los tres servicios por los que más nos llamáis. Técnicas específicas, herramientas profesionales y un acabado que se nota a simple vista.</p></div>
<div class="feat-grid">${featured.map((s, i) => `<article class="feat reveal" style="--d:${i * 90}ms">
<a class="feat-media" href="${s.slug}.html" tabindex="-1" aria-hidden="true">${img(s.img, '', { sizes: '(max-width: 760px) 92vw, 32vw' })}<span class="feat-num">0${i + 1}</span></a>
<div class="feat-body"><h3><a href="${s.slug}.html">${s.title}</a></h3><p>${esc(s.lead)}</p>
<ul class="ticks">${s.includes.slice(0, 4).map(t => `<li>${icon('check')}${esc(t)}</li>`).join('')}</ul>
<div class="feat-actions"><a class="link" href="${s.slug}.html">Ver servicio ${icon('arrow')}</a>${btnBook('Agendar', s.slug, 'btn btn-soft btn-sm')}</div></div>
</article>`).join('')}</div>
</div>
</section>

<section class="sec reviews" id="opiniones">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('star')} Opiniones reales</span><h2>Lo que dicen <em>nuestros clientes.</em></h2></div><div class="rv-summary">${stars(5)}<p>Reseñas publicadas en Google por clientes de viviendas, clínicas, restaurantes y gimnasios de ${B.city}.</p><a class="link" href="opiniones.html">Ver todas las opiniones ${icon('arrow')}</a></div></div>
<div class="rv-feature reveal">${icon('quote', 'rv-q')}<blockquote>${esc(hl.text)}</blockquote><div class="rv-feature-foot">${stars(hl.rating)}<span><b>${esc(hl.name)}</b> · Cliente en Valdespartera, ${B.city}</span></div></div>
</div>
<div class="rv-marquee" aria-label="Reseñas de clientes">${rvRow(rest.slice(0, half))}${rvRow(rest.slice(half), true)}</div>
</section>

<section class="sec offer" id="oferta">
${wave('wave-top', 'var(--ice)')}
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="wrap offer-grid">
<div class="offer-copy reveal"><span class="eyebrow on-dark">${icon('tag')} Oferta cliente Lumis</span>
<h2>¡Nosotros lo limpiamos <em>por ti!</em></h2>
<p class="offer-lead">Queremos premiar a quien confía en nosotros. Por eso, <b>tu 5ª limpieza tiene un 50 % de descuento.</b> Cuantas más veces cuentes con Lumis, más ahorras.</p>
<ol class="offer-steps"><li><b>1</b><span><strong>Reserva tu limpieza</strong> de cristales, toldos, garajes o cualquiera de nuestros servicios.</span></li><li><b>2</b><span><strong>Suma cada visita</strong> en tu tarjeta de cliente Lumis.</span></li><li><b>3</b><span><strong>En la quinta, pagas la mitad.</strong> Te lo recordamos al reservar.</span></li></ol>
<div class="offer-cta">${btnBook('Empezar a sumar', '', 'btn btn-light')}<a class="link link-light" href="oferta.html">Cómo funciona ${icon('arrow')}</a></div>
</div>
<div class="offer-visual reveal"><div class="offer-badge"><span>50%</span><small>DTO</small></div>${stampCard()}<div class="offer-badge offer-badge-2"><small>en la</small><span>5ª</span><small>limpieza</small></div></div>
</div>
${wave('wave-bottom', '#fff')}
</section>

<section class="sec catalog" id="servicios">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('layers')} Todos los servicios</span><h2>Un servicio para <em>cada espacio.</em></h2></div><p>Desde tu salón hasta la nave de tu empresa. Filtra por tipo de espacio y descubre qué incluye cada servicio.</p></div>
<div class="filters" role="group" aria-label="Filtrar servicios"><button type="button" class="filter on" data-filter="all" aria-pressed="true">Todos <span>${services.length}</span></button>${groups.map(g => `<button type="button" class="filter" data-filter="${g.id}" aria-pressed="false">${icon(groupIcon[g.id])}${g.label} <span>${services.filter(s => s.category === g.id).length}</span></button>`).join('')}</div>
<p class="sr" aria-live="polite" data-filter-status></p>
<div class="cards">${services.map(s => serviceCard(s)).join('')}</div>
<p class="note">Las fotografías son ejemplos visuales ilustrativos.</p>
</div>
</section>

<section class="sec why">
<div class="wrap why-grid">
<div class="why-media reveal"><figure>${img('general', 'Detalle de limpieza profesional de una superficie (ejemplo ilustrativo)')}</figure><div class="why-quote"><p>“Espacios limpios,<br><em>vidas mejores.”</em></p></div></div>
<div class="why-copy"><div class="reveal"><span class="eyebrow">${icon('heart')} Por qué Lumis</span><h2>Lo que nos hace <em>diferentes.</em></h2><p class="lead">No se trata solo de limpiar. Se trata de entender tu espacio, cuidarlo como si fuera nuestro y que te olvides de preocuparte.</p></div>
<div class="pillars">${pillars.map(([t, d], i) => `<div class="pillar reveal" style="--d:${i * 80}ms"><span class="pillar-ico">${icon(['shield', 'plan', 'wa', 'heart'][i])}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div>
</div>
</section>

<section class="sec process" id="como-trabajamos">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('clock')} Cómo trabajamos</span><h2>De la primera llamada a <em>un espacio reluciente.</em></h2></div><a class="link" href="como-trabajamos.html">Ver nuestro método completo ${icon('arrow')}</a></div>
${stepsBlock(method.slice(0, 4).map(([i, t, d]) => [t, d, i]))}
</div>
</section>

<section class="sec results">
<div class="wrap results-grid">
<div class="results-copy reveal"><span class="eyebrow">${icon('sun')} Mira la diferencia</span><h2>El mismo espacio, <em>otra sensación.</em></h2><p>Desliza para comparar el antes y el después en distintos tipos de limpieza. Elige un servicio para cambiar la escena.</p>
<div class="cmp-tabs" role="tablist" aria-label="Elegir comparativa">${pairs.map(([p, l], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-pair="${p}" data-label="${l}">${l}</button>`).join('')}</div>
<p class="note">Escenas ilustrativas creadas para esta web; no corresponden a trabajos concretos.</p></div>
<div class="reveal">${compareBlock('cristales', 'Cristales')}<p class="cmp-help">${icon('arrow')} Arrastra, toca o usa las flechas del teclado</p></div>
</div>
</section>

<section class="sec faq-sec">
<div class="wrap faq-grid">
<div class="reveal"><span class="eyebrow">${icon('plan')} Preguntas frecuentes</span><h2>Resolvemos <em>tus dudas.</em></h2><p class="lead">¿No encuentras lo que buscas? Escríbenos por WhatsApp o llámanos al <a href="${tel}">${B.phone}</a>.</p>
<a class="btn btn-soft" href="contacto.html">${icon('mail')}<span>Ver todas las formas de contacto</span></a></div>
<div class="reveal">${faqList(generalFaq)}</div>
</div>
</section>`;
  return page({
    title: `${B.name} · Limpieza de cristales, toldos y garajes en ${B.city}`,
    desc: `${B.name}: servicio integral de limpieza en ${B.city}. Cristales, toldos, garajes, viviendas, comunidades y empresas. 50% de descuento en tu 5ª limpieza. Agenda hoy mismo.`,
    bodyClass: 'is-home', current: 'index', main,
  });
}

// Pasos horizontales con línea de progreso que se rellena al hacer scroll.
function stepsBlock(items) {
  return `<div class="steps-wrap" data-progress><div class="steps-line" aria-hidden="true"><i></i></div>
<ol class="steps">${items.map(([t, d, ic], n) => `<li class="step reveal" style="--d:${n * 90}ms"><span class="step-n">0${n + 1}</span>${ic ? `<span class="step-ico">${icon(ic)}</span>` : ''}<h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol></div>`;
}

// ---------- Páginas de servicio ----------
function servicePage(s) {
  const g = groups.find(x => x.id === s.category);
  const msg = `Hola Lumis, me gustaría pedir presupuesto para ${s.title.toLowerCase()}. Zona: … Tamaño aproximado: … Puedo enviar fotos.`;
  const tabs = [['servicio', 'El servicio'], ['incluye', 'Qué incluye'], ['proceso', 'Proceso'], ['frecuencia', 'Frecuencia'], ...(s.compare ? [['antes-despues', 'Antes y después']] : []), ['opiniones', 'Opiniones'], ['preguntas', 'Preguntas']];
  const ownReviews = reviews.filter(r => r.tags.includes(s.slug));
  const quote = ownReviews[0];
  const idealIcons = ['home', 'building', 'sun', 'heart'];
  const main = `
<section class="stage svc-cover">
<div class="svc-cover-img">${img(s.img, `${s.title} (ejemplo ilustrativo)`, { eager: true, sizes: '100vw' })}</div>
<div class="svc-cover-shade" aria-hidden="true"></div>
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<nav class="crumbs wrap" aria-label="Ruta"><a href="index.html">Inicio</a>${icon('chevron')}<a href="index.html#servicios">Servicios</a>${icon('chevron')}<span aria-current="page">${s.title}</span></nav>
<div class="svc-cover-in wrap">
<div class="svc-cover-copy">
<span class="eyebrow">${icon(groupIcon[s.category])} ${g.label}${s.featured ? ' · Servicio estrella' : ''}</span>
<h1>${s.title}</h1>
<p class="svc-tagline"><em>${esc(s.line)}</em></p>
<p class="svc-lead">${esc(s.lead)}</p>
<ul class="facts">${s.facts.map(f => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul>
<div class="hero-cta">${btnBook('Agendar esta limpieza', s.slug)}<a class="btn btn-ghost" href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')}<span>Presupuesto por WhatsApp</span></a></div>
${s.review ? `<p class="svc-review">${icon('clock')} Servicio sujeto a disponibilidad. Escríbenos con fotos y te confirmamos.</p>` : ''}
</div>
<a class="float-card fc-offer svc-cover-offer" href="oferta.html"><span class="fc-big">50%</span><span><b>DTO en tu 5ª limpieza</b><small>Programa cliente Lumis</small></span></a>
</div>
<a class="scroll-cue" href="#servicio" aria-label="Ver el servicio"><span></span></a>
</section>

<section class="svc-band">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="kpis wrap">
<div class="kpi reveal"><b data-count>${s.includes.length}</b><span>puntos incluidos en el servicio</span></div>
<div class="kpi reveal" style="--d:80ms"><b data-count>${s.steps.length}</b><span>pasos de un método probado</span></div>
<div class="kpi reveal" style="--d:160ms"><b>0 €</b><span>presupuesto, sin compromiso</span></div>
<div class="kpi kpi-hl reveal" style="--d:240ms"><b data-count>50<small>%</small></b><span>de descuento en tu 5ª limpieza</span></div>
</div>
${wave('wave-bottom')}
</section>

<nav class="subnav" aria-label="En esta página"><div class="subnav-in">${tabs.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</div></nav>

<section class="sec svc-intro" id="servicio">
<div class="wrap svc-intro-grid">
<div class="reveal"><span class="eyebrow">${icon('spark')} El servicio</span><h2>${esc(s.line.replace(/\.$/, ''))}, <em>con Lumis.</em></h2>
<div class="prose">${s.intro.map((p, i) => `<p${i === 0 ? ' class="big"' : ''}>${esc(p)}</p>`).join('')}</div>
${quote ? `<figure class="mini-rv">${stars(quote.rating)}<blockquote>“${esc(quote.text)}”</blockquote><figcaption><b>${esc(quote.name)}</b> · Reseña de Google</figcaption></figure>` : ''}</div>
<aside class="summary reveal"><h3>En resumen</h3><dl>
<div><dt>${icon('user')} Ideal para</dt><dd>${s.ideal.map(x => x[0]).join(', ')}</dd></div>
<div><dt>${icon('clock')} Frecuencia habitual</dt><dd>${s.frequency.map(x => x[0]).join(' · ')}</dd></div>
<div><dt>${icon('plan')} Presupuesto</dt><dd>Gratuito y sin compromiso, con fotos o visita.</dd></div>
<div><dt>${icon('pin')} Zona</dt><dd>${B.city} y alrededores</dd></div>
</dl>${btnBook('Reservar cita', s.slug, 'btn btn-primary btn-block')}<a class="summary-tel" href="${tel}">o llama al <b>${B.phone}</b></a></aside>
</div>
</section>

<section class="sec includes" id="incluye">
<div class="wrap includes-grid">
<div class="includes-copy reveal"><span class="eyebrow">${icon('check')} Qué incluye</span><h2>Todo lo que <em>cuidamos.</em></h2><p class="lead">Esto es lo que incluye habitualmente nuestra ${s.title.toLowerCase()}. Adaptamos cada trabajo a tu espacio: si necesitas algo más, lo añadimos al presupuesto.</p>
<ul class="checklist">${s.includes.map((t, i) => `<li style="--d:${i * 50}ms"><span class="cl-n">${String(i + 1).padStart(2, '0')}</span><span>${esc(t)}</span>${icon('check')}</li>`).join('')}</ul></div>
<figure class="includes-media reveal">${img(s.img, `${s.title}, detalle (ejemplo ilustrativo)`, { sizes: '(max-width: 760px) 92vw, 40vw' })}<figcaption>${icon('shield')} Productos y técnicas de alta calidad</figcaption></figure>
</div>
</section>

<section class="sec ideal ideal-dark">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
${wave('wave-top', 'var(--ice)')}
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow on-dark">${icon('user')} Para quién</span><h2>¿Es para <em>ti?</em></h2></div><p>Estas son las situaciones en las que más nos piden este servicio.</p></div>
<div class="ideal-grid">${s.ideal.map(([t, d], i) => `<article class="ideal-card reveal" style="--d:${i * 70}ms"><span class="ideal-ico">${icon(idealIcons[i])}</span><span class="ideal-n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>
</div>
${wave('wave-bottom', 'var(--ice)')}
</section>

<section class="sec process" id="proceso">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('clock')} Nuestro método</span><h2>Así lo <em>hacemos.</em></h2></div><p>Un orden de trabajo pensado para que el resultado sea uniforme y duradero.</p></div>
${stepsBlock(s.steps)}
</div>
</section>

<section class="sec freq" id="frecuencia">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('calendar')} Frecuencia recomendada</span><h2>¿Cada cuánto <em>conviene?</em></h2></div><p>Elige el ritmo que mejor encaja con tu espacio. Con las limpiezas periódicas llegas antes a tu 50 % de descuento.</p></div>
<div class="plans">${s.frequency.map(([t, d], i) => `<article class="plan${i === 1 ? ' hl' : ''} reveal" style="--d:${i * 90}ms"><span class="plan-ico">${icon(['calendar', 'clock', 'spark'][i])}</span><h3>${esc(t)}</h3><p>${esc(d)}</p>${btnBook('Agendar', s.slug, i === 1 ? 'btn btn-primary btn-sm' : 'btn btn-soft btn-sm')}</article>`).join('')}</div>
<div class="tips-row">${s.tips.map(([t, d], i) => `<div class="tip reveal" style="--d:${i * 80}ms"><span class="tip-ico">${icon('bulb')}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div>
</div>
</section>

<section class="offer-strip">
<div class="wrap offer-strip-in reveal">
<div class="offer-strip-copy"><span class="eyebrow on-dark">${icon('tag')} Oferta cliente Lumis</span><h2>Tu 5ª limpieza, <em>al 50%.</em></h2><p>Programa tus limpiezas de ${s.label.toLowerCase()} o combina servicios: cada visita suma en tu tarjeta de cliente y la quinta te sale a mitad de precio.</p><div class="offer-cta">${btnBook('Agendar y empezar a sumar', s.slug, 'btn btn-light')}<a class="link link-light" href="oferta.html">Cómo funciona ${icon('arrow')}</a></div></div>
${stampCard(true)}
</div>
</section>

${s.compare ? `<section class="sec results" id="antes-despues">
<div class="wrap results-grid">
<div class="results-copy reveal"><span class="eyebrow">${icon('sun')} Antes y después</span><h2>La diferencia <em>se ve.</em></h2><p>Desliza sobre la imagen para comparar una escena antes y después de la limpieza.</p><p class="note">Escena ilustrativa creada para esta web; no corresponde a un trabajo concreto.</p></div>
<div class="reveal">${compareBlock(s.compare, s.label)}<p class="cmp-help">${icon('arrow')} Arrastra, toca o usa las flechas del teclado</p></div>
</div>
</section>` : ''}

<section class="sec reviews reviews-svc" id="opiniones">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('star')} Opiniones reales en Google</span><h2>${ownReviews.length ? `Clientes que ya confiaron <em>en nosotros.</em>` : `Lo que dicen <em>nuestros clientes.</em>`}</h2></div><a class="link" href="opiniones.html">Ver todas las opiniones ${icon('arrow')}</a></div>
<div class="rv-grid">${reviewsFor(s.slug).map((r, i) => reviewCard(r, 'rv reveal', `--d:${i * 90}ms`)).join('')}</div>
</div>
</section>

<section class="sec faq-sec" id="preguntas">
<div class="wrap faq-grid">
<div class="reveal"><span class="eyebrow">${icon('plan')} Preguntas frecuentes</span><h2>Dudas sobre <em>${s.label.toLowerCase()}.</em></h2><p class="lead">Si tu caso es diferente, cuéntanoslo y lo vemos juntos.</p>${btnBook('Consultar mi caso', s.slug, 'btn btn-soft')}</div>
<div class="reveal">${faqList(s.faq)}</div>
</div>
</section>

<section class="sec related">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('layers')} Combínalo con</span><h2>También te <em>puede interesar.</em></h2></div><a class="link" href="index.html#servicios">Ver todos los servicios ${icon('arrow')}</a></div>
<div class="cards cards-3">${s.related.map(slug => serviceCard(bySlug[slug])).join('')}</div>
</div>
</section>`;
  return page({
    title: `${s.title} en ${B.city} | ${B.name}`,
    desc: `${s.title} en ${B.city} con ${B.name}. ${s.lead} Presupuesto sin compromiso y 50% de descuento en tu 5ª limpieza.`,
    bodyClass: 'is-service', current: s.slug, main, msg,
  });
}

// ---------- Oferta ----------
function offerPage() {
  const main = `
${pageHero({
    crumb: 'Oferta', eyebrow: `${icon('tag')} Oferta cliente Lumis`,
    title: '¡Nosotros lo limpiamos <em>por ti!</em>',
    lead: 'Premiamos a quienes confían en nosotros: <b>tu 5ª limpieza tiene un 50 % de descuento.</b> Cristales, toldos, garajes, tu casa o tu negocio: cada visita suma.',
    ctas: `${btnBook('Empezar a sumar')}<a class="btn btn-ghost" href="#calcula">${icon('calendar')}<span>¿Cuándo llega mi 50 %?</span></a>`,
    visual: `<div class="offer-visual offer-visual-hero"><div class="offer-badge"><span>50%</span><small>DTO</small></div>${stampCard()}<div class="offer-badge offer-badge-2"><small>en la</small><span>5ª</span><small>limpieza</small></div></div>`,
  })}

<section class="sec how">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('spark')} Cómo funciona</span><h2>Tres pasos, <em>cero complicaciones.</em></h2></div><p>No hay cupones ni formularios: tú reservas y nosotros llevamos la cuenta contigo.</p></div>
<div class="how-grid">${[
    ['calendar', 'Reserva tu limpieza', 'Pide tu cita desde la web, por WhatsApp o por teléfono, para cualquiera de nuestros servicios.'],
    ['check', 'Cada visita suma', 'Cada limpieza que hacemos contigo es un sello más en tu tarjeta de cliente Lumis.'],
    ['tag', 'La quinta, a mitad de precio', 'Cuando llegues a tu 5ª limpieza, se aplica el 50 % de descuento. Te lo recordamos al reservar.'],
  ].map(([ic, t, d], i) => `<article class="how-card reveal" style="--d:${i * 90}ms"><span class="how-n">${i + 1}</span><span class="how-ico">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
</div>
</section>

<section class="sec calc" id="calcula">
<div class="wrap calc-grid">
<div class="reveal"><span class="eyebrow">${icon('calendar')} Calcula tu fecha</span><h2>¿Cuándo llega <em>tu 50 %?</em></h2><p class="lead">Elige cada cuánto quieres limpiar y te decimos, aproximadamente, cuándo tendrías tu quinta limpieza si empiezas hoy.</p></div>
<div class="calc-card reveal" data-calc>
<div class="chips" role="group" aria-label="Frecuencia">${[['7', 'Semanal'], ['14', 'Quincenal'], ['30', 'Mensual'], ['91', 'Trimestral']].map(([d, l], i) => `<button type="button" class="chip${i === 2 ? ' on' : ''}" data-days="${d}" aria-pressed="${i === 2}">${l}</button>`).join('')}</div>
<ol class="calc-line" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<li${n === 5 ? ' class="gold"' : ''}><span>${n}ª</span><small></small></li>`).join('')}</ol>
<p class="calc-out" aria-live="polite"></p>
${btnBook('Reservar mi primera limpieza', '', 'btn btn-primary btn-block')}
<p class="note">Cálculo orientativo. Las fechas reales dependen de tu calendario de limpiezas.</p>
</div>
</div>
</section>

<section class="sec catalog">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('layers')} Suma con cualquier servicio</span><h2>Elige por dónde <em>empezar.</em></h2></div><p>Pregúntanos cómo aplicar la oferta a tu caso concreto al reservar.</p></div>
<div class="svc-chips reveal">${services.map(s => `<button type="button" class="svc-chip" data-book data-service="${s.slug}">${img(s.img, '', { sizes: '48px' })}<span>${s.label}</span>${icon('calendar')}</button>`).join('')}</div>
</div>
</section>

<section class="sec reviews reviews-svc">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('star')} Clientes que repiten</span><h2>Por algo <em>vuelven.</em></h2></div><a class="link" href="opiniones.html">Ver todas las opiniones ${icon('arrow')}</a></div>
<div class="rv-grid">${reviews.filter(r => /volver|regular|seguramente|Muy pronto/i.test(r.text)).concat(reviews).filter((r, i, a) => a.indexOf(r) === i).slice(0, 3).map((r, i) => reviewCard(r, 'rv reveal', `--d:${i * 90}ms`)).join('')}</div>
</div>
</section>

<section class="sec faq-sec">
<div class="wrap faq-grid">
<div class="reveal"><span class="eyebrow">${icon('plan')} Preguntas sobre la oferta</span><h2>Todo <em>claro.</em></h2><p class="lead">Si tienes cualquier duda sobre cómo aplicar el descuento, pregúntanos al reservar.</p>${btnBook('Consultar por la oferta', '', 'btn btn-soft')}</div>
<div class="reveal">${faqList(offerFaq)}</div>
</div>
</section>`;
  return page({ title: `Oferta: 50% en tu 5ª limpieza | ${B.name}`, desc: `Con ${B.name}, tu 5ª limpieza tiene un 50% de descuento. Cristales, toldos, garajes, viviendas y empresas en ${B.city}.`, bodyClass: 'is-page', current: 'oferta', main });
}

// ---------- Opiniones ----------
function reviewsPage() {
  const hl = reviews.find(x => x.highlight);
  const biz = reviews.filter(r => r.business);
  const main = `
${pageHero({
    crumb: 'Opiniones', eyebrow: `${icon('star')} Opiniones reales en Google`,
    title: 'Lo que dicen <em>nuestros clientes.</em>',
    lead: 'Viviendas, clínicas, restaurantes, gimnasios y comunidades de Zaragoza. Estas son algunas de las reseñas que nos han dejado en Google, tal y como las escribieron.',
    ctas: `${btnBook('Quiero el mismo resultado')}<a class="btn btn-ghost" href="${reviewsUrl}" target="_blank" rel="noopener">${icon('star')}<span>Ver en Google</span></a>`,
    visual: `<div class="score-card"><span class="score-big" data-count>${reviews.length}</span><p>reseñas destacadas</p>${stars(5)}<ul><li>${icon('home')} Viviendas</li><li>${icon('heart')} Clínicas</li><li>${icon('building')} Restaurantes</li><li>${icon('spark')} Gimnasios</li></ul></div>`,
  })}

<section class="sec love">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('heart')} Lo que más valoran</span><h2>En sus propias <em>palabras.</em></h2></div></div>
<div class="love-grid">${loveThemes.map(([ic, t, q, who], i) => `<article class="love-card reveal" style="--d:${i * 80}ms"><span class="love-ico">${icon(ic)}</span><h3>${t}</h3><blockquote>“${esc(q)}”</blockquote><small>— ${esc(who)}</small></article>`).join('')}</div>
</div>
</section>

<section class="sec reviews reviews-all">
<div class="wrap">
<div class="rv-feature reveal">${icon('quote', 'rv-q')}<blockquote>${esc(hl.text)}</blockquote><div class="rv-feature-foot">${stars(hl.rating)}<span><b>${esc(hl.name)}</b> · Cliente en Valdespartera, ${B.city}</span></div></div>
<div class="filters" role="group" aria-label="Filtrar opiniones"><button type="button" class="filter on" data-rv-filter="all" aria-pressed="true">Todas <span>${reviews.length - 1}</span></button><button type="button" class="filter" data-rv-filter="particular" aria-pressed="false">${icon('home')}Particulares <span>${reviews.filter(r => !r.business && !r.highlight).length}</span></button><button type="button" class="filter" data-rv-filter="empresa" aria-pressed="false">${icon('building')}Empresas <span>${biz.length}</span></button></div>
<div class="rv-masonry">${reviews.filter(r => !r.highlight).map((r, i) => reviewCard(r, 'rv reveal', `--d:${(i % 3) * 80}ms`)).join('')}</div>
</div>
</section>

<section class="sec trust">
<div class="wrap trust-in reveal">
<span class="eyebrow">${icon('building')} Empresas que confían en nosotros</span>
<ul class="trust-list">${biz.map(r => `<li>${esc(r.name)}</li>`).join('')}<li>Restaurantes de ${B.city}</li><li>Comunidades de vecinos</li></ul>
</div>
</section>

<section class="sec leave">
<div class="wrap leave-in reveal">
<div><span class="eyebrow on-dark">${icon('star')} ¿Ya eres cliente?</span><h2>Tu opinión <em>nos ayuda muchísimo.</em></h2><p>Si te ha gustado nuestro trabajo, dedica un minuto a dejarnos tu reseña en Google. Así más vecinos de ${B.city} pueden conocernos.</p></div>
<a class="btn btn-light" href="${reviewsUrl}" target="_blank" rel="noopener">${icon('star')}<span>Dejar mi reseña en Google</span></a>
</div>
</section>`;
  return page({ title: `Opiniones de clientes | ${B.name}`, desc: `Opiniones reales en Google de clientes de ${B.name} en ${B.city}: limpieza de cristales, toldos, viviendas, clínicas, restaurantes y gimnasios.`, bodyClass: 'is-page', current: 'opiniones', main });
}

// ---------- Cómo trabajamos ----------
function methodPage() {
  const main = `
${pageHero({
    crumb: 'Cómo trabajamos', eyebrow: `${icon('clock')} Nuestro método`,
    title: 'Así trabajamos <em>en Lumis.</em>',
    lead: 'Un proceso claro de principio a fin: te escuchamos, te damos un presupuesto sin sorpresas y cuidamos tu espacio como si fuera nuestro.',
    ctas: `${btnBook('Empezar ahora')}<a class="btn btn-ghost" href="#metodo">${icon('arrow')}<span>Ver el proceso</span></a>`,
    visual: `<div class="method-visual"><figure class="orb orb-a">${img('general', 'Detalle de limpieza profesional (ejemplo ilustrativo)', { eager: true, sizes: '(max-width: 760px) 80vw, 34vw' })}</figure><div class="float-card fc-list"><p>En cada trabajo</p><ul><li>${icon('check')}Puntualidad</li><li>${icon('check')}Cuidado del entorno</li><li>${icon('check')}Revisión final contigo</li></ul></div></div>`,
  })}

<section class="sec" id="metodo">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('spark')} Paso a paso</span><h2>De tu mensaje a un espacio <em>reluciente.</em></h2></div><p>Cinco pasos sencillos. Tú solo tienes que contarnos qué necesitas.</p></div>
<ol class="timeline" data-progress><span class="tl-line" aria-hidden="true"><i></i></span>${method.map(([ic, t, d], i) => `<li class="tl-step reveal"><span class="tl-node">${icon(ic)}</span><div class="tl-card"><span class="tl-n">Paso ${i + 1}</span><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol>
</div>
</section>

<section class="sec includes">
<div class="wrap includes-grid">
<div class="includes-copy reveal"><span class="eyebrow">${icon('camera')} Para tu presupuesto</span><h2>Lo que nos ayuda <em>a darte precio.</em></h2><p class="lead">Con esta información podemos darte un presupuesto ajustado sin necesidad de visita en la mayoría de los casos.</p>
<ul class="checklist">${quoteChecklist.map((t, i) => `<li style="--d:${i * 50}ms"><span class="cl-n">${String(i + 1).padStart(2, '0')}</span><span>${esc(t)}</span>${icon('check')}</li>`).join('')}</ul>
<div class="hero-cta">${btnBook('Enviar mi consulta')}</div></div>
<figure class="includes-media reveal">${img('interiores', 'Interior luminoso y limpio (ejemplo ilustrativo)', { sizes: '(max-width: 760px) 92vw, 40vw' })}<figcaption>${icon('shield')} Presupuesto gratuito y sin compromiso</figcaption></figure>
</div>
</section>

<section class="sec ideal ideal-dark">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
${wave('wave-top', 'var(--ice)')}
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow on-dark">${icon('heart')} Nuestro compromiso</span><h2>Lo que puedes <em>esperar de nosotros.</em></h2></div></div>
<div class="ideal-grid ideal-grid-3">${commitments.map(([ic, t, d], i) => `<article class="ideal-card reveal" style="--d:${i * 70}ms"><span class="ideal-ico">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
</div>
${wave('wave-bottom')}
</section>

<section class="sec tools">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('tool')} Equipo profesional</span><h2>Las herramientas <em>adecuadas.</em></h2></div><p>La diferencia entre limpiar y dejarlo reluciente está en la técnica y en el material.</p></div>
<div class="tools-grid">${tools.map(([t, d], i) => `<div class="tool reveal" style="--d:${i * 60}ms"><span class="tool-ico">${icon(['tool', 'drop', 'spark', 'layers', 'building', 'shield'][i])}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div>
</section>

<section class="sec modes">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('calendar')} Formas de trabajar</span><h2>Puntual, periódico <em>o a medida.</em></h2></div></div>
<div class="plans">${serviceModes.map(([t, d, slug], i) => `<article class="plan${i === 1 ? ' hl' : ''} reveal" style="--d:${i * 90}ms"><span class="plan-ico">${icon(['spark', 'calendar', 'building'][i])}</span><h3>${t}</h3><p>${d}</p><a class="link" href="${slug}.html">Ver ejemplo: ${bySlug[slug].label.toLowerCase()} ${icon('arrow')}</a></article>`).join('')}</div>
</div>
</section>

<section class="sec faq-sec">
<div class="wrap faq-grid">
<div class="reveal"><span class="eyebrow">${icon('plan')} Preguntas frecuentes</span><h2>Resolvemos <em>tus dudas.</em></h2><p class="lead">¿Algo más? Llámanos al <a href="${tel}">${B.phone}</a>.</p></div>
<div class="reveal">${faqList(generalFaq)}</div>
</div>
</section>`;
  return page({ title: `Cómo trabajamos | ${B.name}`, desc: `Así trabaja ${B.name} en ${B.city}: presupuesto claro y sin compromiso, puntualidad, productos adecuados y revisión final contigo.`, bodyClass: 'is-page', current: 'como-trabajamos', main });
}

// ---------- Contacto ----------
function contactPage() {
  const cards = [
    ['phone', 'Llámanos', B.phone, tel, 'La forma más rápida de hablar con nosotros.', false],
    ['wa', 'WhatsApp', 'Escríbenos', wa(), 'Envíanos fotos y te respondemos con tu presupuesto.', true],
    ['phone', 'Teléfono fijo', B.landline, `tel:${B.landlineIntl}`, 'También puedes llamarnos a nuestro fijo.', false],
    ['mail', 'Email', B.email, `mailto:${B.email}`, 'Para consultas detalladas o empresas.', false],
    ['insta', 'Instagram', B.instagramHandle, B.instagram, 'Mira nuestros trabajos y novedades.', true],
  ];
  const main = `
${pageHero({
    crumb: 'Contacto', eyebrow: `${icon('wa')} Contacto`,
    title: 'Hablemos de <em>tu espacio.</em>',
    lead: 'Llámanos, escríbenos por WhatsApp o reserva tu cita en un minuto. Presupuesto sin compromiso en Zaragoza y alrededores.',
    ctas: `${btnBook('Agendar cita')}<a class="btn btn-ghost" href="${tel}">${icon('phone')}<span>${B.phone}</span></a>`,
    visual: `<div class="map-card"><div class="map-rings" aria-hidden="true"><i></i><i></i><i></i></div><span class="map-pin">${icon('pin')}</span><p><b>${B.city}</b><small>y alrededores</small></p></div>`,
  })}

<section class="sec contact-sec">
<div class="wrap">
<div class="contact-grid">${cards.map(([ic, t, v, href, d, ext], i) => `<a class="c-card reveal" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} style="--d:${i * 70}ms"><span class="c-ico">${icon(ic)}</span><span class="c-t">${t}</span><b>${esc(v)}</b><p>${d}</p><span class="card-go">${icon('up')}</span></a>`).join('')}
<div class="c-card c-card-book reveal" style="--d:350ms"><span class="c-ico">${icon('calendar')}</span><span class="c-t">Reserva rápida</span><b>En 3 pasos</b><p>Elige servicio, día y franja. Te llega un mensaje listo para enviar.</p>${btnBook('Reservar ahora', '', 'btn btn-light btn-sm')}</div>
</div>
</div>
</section>

<section class="sec catalog">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('layers')} Reserva directa</span><h2>¿Qué quieres <em>limpiar?</em></h2></div><p>Toca un servicio y abre la reserva con él ya seleccionado.</p></div>
<div class="svc-chips reveal">${services.map(s => `<button type="button" class="svc-chip" data-book data-service="${s.slug}">${img(s.img, '', { sizes: '48px' })}<span>${s.label}</span>${icon('calendar')}</button>`).join('')}</div>
</div>
</section>

<section class="sec faq-sec">
<div class="wrap faq-grid">
<div class="reveal"><span class="eyebrow">${icon('plan')} Antes de escribirnos</span><h2>Preguntas <em>frecuentes.</em></h2><p class="lead">Y si no encuentras tu respuesta, pregúntanos directamente.</p></div>
<div class="reveal">${faqList(generalFaq)}</div>
</div>
</section>`;
  return page({ title: `Contacto | ${B.name} · ${B.city}`, desc: `Contacta con ${B.name} en ${B.city}: ${B.phone}, WhatsApp, ${B.landline} o ${B.email}. Presupuesto sin compromiso.`, bodyClass: 'is-page', current: 'contacto', main });
}

fs.mkdirSync(OUT, { recursive: true });
const write = (name, html) => fs.writeFileSync(path.join(OUT, name), html);
write('index.html', home());
for (const s of services) write(`${s.slug}.html`, servicePage(s));
write('oferta.html', offerPage());
write('opiniones.html', reviewsPage());
write('como-trabajamos.html', methodPage());
write('contacto.html', contactPage());
console.log(`Generadas ${services.length + 5} páginas en ${OUT}`);
