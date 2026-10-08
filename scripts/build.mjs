// Genera todas las páginas de la web a partir de scripts/content.mjs.
// Uso: node scripts/build.mjs [carpeta-destino]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  about, anniversary, zonas,
  business as B, groups, services, destacados, pillars, generalFaq, reviews, reviewsUrl, reviewWriteUrl,
  method, quoteChecklist, commitments, tools, serviceModes, loveThemes,
} from './content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || root);
const V = '13';

const bySlug = Object.fromEntries(services.map(s => [s.slug, s]));
// Servicios destacados, en el orden elegido por la clienta.
const featured = destacados.map(k => bySlug[k]);
const isFeat = s => destacados.includes(s.slug);
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
  tiktok: '<path d="M14 3v11.2a3.8 3.8 0 1 1-3.8-3.8"/><path d="M14 3c.4 2.7 2.4 4.7 5.2 5"/>',
};
// Logotipo oficial de WhatsApp (glifo relleno), para que se reconozca al instante.
const WA_GLYPH = '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/>';
const icon = (n, cls = '') => n === 'wa' ? `<svg class="i i-wa ${cls}" viewBox="0 0 24 24" aria-hidden="true">${WA_GLYPH}</svg>` : `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[n] || paths.spark}</svg>`;
const groupIcon = { hogar: 'home', exterior: 'sun', profesional: 'building', superficies: 'layers' };

const wa = (msg = 'Hola Lumis, he visto vuestra web y me gustaría pedir un presupuesto sin compromiso.') => `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(msg)}`;
const tel = `tel:${B.phoneIntl}`;
const img = (name, alt, { cls = '', eager = false, sizes = '(max-width: 760px) 92vw, 45vw' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="assets/images/${name}.webp" srcset="assets/images/${name}-sm.webp 640w, assets/images/${name}-md.webp 1024w, assets/images/${name}.webp 1536w" sizes="${sizes}" alt="${esc(alt)}" width="1536" height="1024" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;

const stars = n => `<span class="stars" role="img" aria-label="${n} de 5 estrellas">${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" class="${i <= n ? 'on' : ''}" aria-hidden="true"><path d="${paths.star.match(/d="([^"]+)"/)[1]}"/></svg>`).join('')}</span>`;
const reviewCard = (r, cls = 'rv', style = '') => `<figure class="${cls}"${style ? ` style="${style}"` : ''} data-kind="${r.business ? 'empresa' : 'particular'}"><div class="rv-top">${stars(r.rating)}<span class="rv-src">Google</span></div><blockquote>${esc(r.text)}</blockquote><figcaption><span class="rv-av" aria-hidden="true">${esc(r.name.trim()[0].toUpperCase())}</span><span><b>${esc(r.name)}</b><small>${r.business ? 'Empresa cliente' : 'Cliente'} · ${B.city}</small></span></figcaption></figure>`;
const reviewsFor = slug => {
  const own = reviews.filter(r => r.tags.includes(slug));
  const extra = reviews.filter(r => !own.includes(r) && r.rating === 5);
  return [...own, ...extra].slice(0, 3);
};

// Enlaces a Instagram y TikTok.
const socialLinks = (cls = '') => `<div class="social ${cls}"><a class="ig" href="${B.instagram}" target="_blank" rel="noopener" aria-label="Instagram de ${B.name} (${B.instagramHandle})">${icon('insta')}<span>Instagram</span></a><a class="tt" href="${B.tiktok}" target="_blank" rel="noopener" aria-label="TikTok de ${B.name} (${B.tiktokHandle})">${icon('tiktok')}<span>TikTok</span></a></div>`;

// Recuadro para pedir reseñas en Google: se muestra tras las opiniones.
const reviewAsk = () => `<div class="rv-ask reveal"><div class="rv-ask-stars" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" style="--n:${i}"><path d="${paths.star.match(/d="([^"]+)"/)[1]}"/></svg>`).join('')}</div><div class="rv-ask-copy"><h3>¿Te ha gustado nuestro trabajo?</h3><p>Tu reseña en Google ayuda a que más vecinos de ${B.city} nos conozcan. Solo te lleva un minuto.</p></div><a class="btn btn-review" href="${reviewWriteUrl}" target="_blank" rel="noopener">${icon('star')}<span>Dejar mi reseña</span></a></div>`;

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

// Dirección pública de la web (cambiar aquí si se pasa a un dominio propio).
const SITE = B.launched ? `https://${B.domain}/` : 'https://sefiro888.github.io/limpiezaslumis/';
const pageUrl = key => SITE + (key === 'index' ? '' : key + '.html');
// Páginas con tarjeta propia de WhatsApp; el resto (legales, 404) usan la de la portada.
const OG_KEYS = new Set([...services.map(s => s.slug), 'quienes-somos', 'opiniones', 'como-trabajamos', 'contacto']);
const ogImage = key => `${SITE}assets/images/og/og-${OG_KEYS.has(key) ? key : 'home'}.jpg?v=${V}`;

const PAGES = [['index', 'Inicio'], ['quienes-somos', 'Quiénes somos'], ['opiniones', 'Opiniones'], ['como-trabajamos', 'Cómo trabajamos'], ['contacto', 'Contacto']];
const cur = (current, key) => current === key ? ' aria-current="page"' : '';

// ---------- Piezas comunes ----------
const tickerItems = [
  ...(B.anniversary ? [['star', '<b>¡Cumplimos nuestro primer año!</b> Gracias por confiar en Lumis']] : []),
  ['calendar', 'Agenda hoy mismo'],
  ['star', '<b>★★★★★</b> Opiniones reales en Google'],
  ['spark', 'Comunidades · Oficinas · Gimnasios · Colegios · Clínicas'],
  ['check', 'Visita y presupuesto <b>gratis</b>'],
  ['pin', B.zone],
  ['phone', B.phone],
];
const tickerRow = () => tickerItems.map(([i, t]) => `<span class="tk-item">${icon(i)}${t}</span>`).join('');
const announce = () => `<div class="announce" aria-label="Novedades de Lumis"><div class="tk"><div class="tk-track">${tickerRow()}</div><div class="tk-track" aria-hidden="true">${tickerRow()}</div></div></div>`;

function header(current) {
  const mega = groups.map(g => `<div class="mega-col"><p class="mega-title">${icon(groupIcon[g.id])}${g.label}</p><ul>${services.filter(s => s.category === g.id).map(s => `<li><a href="${s.slug}.html"${cur(current, s.slug)}><span>${s.label}</span><small>${esc(s.line)}</small></a></li>`).join('')}</ul></div>`).join('');
  const isSvc = !!bySlug[current];
  return `<header class="hdr" data-header>
<div class="hdr-in">
<a class="logo" href="index.html" aria-label="${B.name}, inicio"><img src="assets/images/logo-horizontal.webp" width="508" height="160" alt="${B.name}" fetchpriority="high"></a>
<nav class="nav" aria-label="Principal">
<a href="index.html"${cur(current, 'index')}>Inicio</a>
<div class="has-mega"><button type="button" class="nav-drop${isSvc ? ' is-cur' : ''}" aria-expanded="false" aria-controls="mega">Servicios ${icon('chevron')}</button>
<div class="mega" id="mega"><div class="mega-grid">${mega}</div><div class="mega-foot"><span>${icon('check')} Visita y presupuesto <b>gratis</b>, sin compromiso</span><a href="index.html#servicios">Ver los ${services.length} servicios ${icon('arrow')}</a></div></div></div>
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
  const extras = { opiniones: '<b class="mn-stars">★ 5</b>' };
  return `<div class="mnav" id="mnav" aria-label="Menú" aria-hidden="true" inert>
<div class="mnav-bg" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<div class="mnav-top"><a class="mnav-logo" href="index.html"><img src="assets/images/logo-horizontal.webp" width="508" height="160" alt="${B.name}" loading="lazy"></a><button type="button" class="mnav-close" aria-label="Cerrar menú">${icon('close')}</button></div>
<nav class="mnav-links" aria-label="Menú móvil">
<a href="index.html" style="--i:0"${cur(current, 'index')}><span>Inicio</span>${icon('arrow')}</a>
<details class="mnav-svc" style="--i:1"${bySlug[current] ? ' open' : ''}><summary><span>Servicios <small>${services.length}</small></span>${icon('chevron')}</summary>
<div class="mnav-groups">${groups.map(g => `<div><p>${icon(groupIcon[g.id])}${g.label}</p><ul>${services.filter(s => s.category === g.id).map(s => `<li><a href="${s.slug}.html"${cur(current, s.slug)}>${s.label}</a></li>`).join('')}</ul></div>`).join('')}</div>
</details>
${[...PAGES.slice(1), ['zonas', 'Zonas de trabajo']].map(([k, l], i) => `<a href="${k}.html" style="--i:${i + 2}"${cur(current, k)}><span>${l}</span>${extras[k] || ''}${icon('arrow')}</a>`).join('\n')}
</nav>
<div class="mnav-foot" style="--i:9">
${btnBook('Agendar cita', bySlug[current] ? current : '', 'btn btn-light btn-block')}
<div class="mnav-contact"><a href="${tel}">${icon('phone')} Llamar</a><a href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a></div>
${socialLinks('social-mnav')}
<p>${icon('pin')} ${B.city} y alrededores · Móvil ${B.phone} · Fijo ${B.landline}</p>
</div>
</div>`;
}

function footer(msg) {
  return `<section class="cta-final"><div class="cta-in reveal">
<div class="cta-bubbles" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<span class="eyebrow on-dark">${icon('spark')} Agenda hoy mismo</span>
<h2>¿Lo dejamos <em>reluciente?</em></h2>
<p>Cuéntanos qué necesitas: vamos a verlo y te damos presupuesto gratis y sin compromiso. Reservar tu cita lleva menos de un minuto.</p>
<div class="cta-actions">${btnBook('Agendar mi cita', '', 'btn btn-light')}<a class="btn btn-outline-light" href="${tel}">${icon('phone')}<span>Llamar al ${B.phone}</span></a></div>
</div></section>
<footer class="ftr">
<div class="ftr-grid">
<div class="ftr-brand"><img src="assets/images/logo-lumis.webp" width="380" height="444" alt="${B.name}" loading="lazy"><p>Servicio integral de limpieza en ${B.city}. Cristales, toldos, garajes, viviendas, comunidades y empresas con productos y técnicas de alta calidad.</p>${socialLinks('social-ftr')}</div>
<div class="ftr-col ftr-svc"><h3>Servicios</h3><ul>${services.map(s => `<li><a href="${s.slug}.html">${s.label}</a></li>`).join('')}</ul></div>
<div class="ftr-col"><h3>Lumis</h3><ul>${PAGES.map(([k, l]) => `<li><a href="${k}.html">${l}</a></li>`).join('')}<li><a href="zonas.html">Zonas de trabajo</a></li></ul></div>
<div class="ftr-col ftr-contact"><h3>Contacto</h3>
<a class="ftr-phone" href="${tel}">${B.phone}</a>
<a href="tel:${B.landlineIntl}">${icon('phone')} ${B.landline}</a>
<a href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a>
<a href="mailto:${B.email}">${icon('mail')} ${B.email}</a>
<p><a href="zonas.html">${icon('pin')} ${B.city} y hasta 40 min alrededor</a></p></div>
</div>
<div class="ftr-bottom"><span>© <span data-year>2026</span> ${B.name}. Todos los derechos reservados.</span><span class="ftr-legal"><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad</a><a href="cookies.html">Cookies</a></span><span>Las fotografías de la web son ejemplos visuales ilustrativos.</span><a href="#top">Volver arriba ↑</a></div>
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
<div class="quick-services">${featured.map(s => `<button type="button" class="qs" data-pick="${s.slug}">${img(s.img, '', { sizes: '120px' })}<span>${s.label}</span></button>`).join('')}</div>
<label class="field"><span>O elige entre todos los servicios</span><select name="service" required>${opts}</select></label>
<p class="book-offer">${icon('check')} <b>Visita y presupuesto gratis</b> en Zaragoza y hasta 40 min, sin compromiso.</p>
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

// Datos para Google: la empresa en todas las páginas y, según la página, migas de pan, servicio y preguntas frecuentes.
const BIZ_ID = SITE + '#empresa';
const CRUMB = { 'quienes-somos': 'Quiénes somos', zonas: 'Zonas de trabajo', opiniones: 'Opiniones', 'como-trabajamos': 'Cómo trabajamos', contacto: 'Contacto', 'aviso-legal': 'Aviso legal', privacidad: 'Política de privacidad', cookies: 'Política de cookies' };
const AREA = [{ '@type': 'City', name: B.city }, { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: 41.6488, longitude: -0.8891 }, geoRadius: 45000 }];
const faqNode = list => ({ '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const jsonLd = current => {
  const graph = [{
    '@type': 'HousekeepingService', '@id': BIZ_ID, name: B.name, url: SITE, telephone: B.phoneIntl, email: B.email,
    logo: `${SITE}assets/images/icon-512.png`, image: `${SITE}assets/images/og/og-home.jpg`,
    founder: { '@type': 'Person', name: B.owner }, foundingDate: '2025-10', areaServed: AREA,
    address: { '@type': 'PostalAddress', streetAddress: 'Calle Monasterio de Siresa, 34, local 19', postalCode: '50002', addressLocality: B.city, addressRegion: 'Zaragoza', addressCountry: 'ES' },
    sameAs: [B.instagram, B.tiktok],
    makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: pageUrl(s.slug) } })),
  }];
  if (current === 'index') graph.push({ '@type': 'WebSite', '@id': SITE + '#web', url: SITE, name: B.name, inLanguage: 'es-ES', publisher: { '@id': BIZ_ID } });
  const s = bySlug[current];
  const crumbs = [['Inicio', SITE]];
  if (s) crumbs.push(['Servicios', SITE + '#servicios'], [s.title, pageUrl(current)]);
  else if (CRUMB[current]) crumbs.push([CRUMB[current], pageUrl(current)]);
  if (crumbs.length > 1) graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) });
  if (s) {
    graph.push({ '@type': 'Service', '@id': pageUrl(current) + '#servicio', name: `${s.title} en ${B.city}`, serviceType: s.title, description: s.lead,
      url: pageUrl(current), image: `${SITE}assets/images/${s.img}.jpg`, provider: { '@id': BIZ_ID }, areaServed: AREA });
    if (s.faq && s.faq.length) graph.push(faqNode(s.faq));
  }
  if (current === 'contacto') graph.push(faqNode(generalFaq));
  if (current === 'zonas') graph.push(faqNode(zonas.faq));
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
};

const page = ({ title, desc, bodyClass, current, main, msg, extraHead = '' }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">${extraHead}
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0b5566">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${pageUrl(current)}">
<meta property="og:site_name" content="${B.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:url" content="${pageUrl(current)}">
<meta property="og:image" content="${ogImage(current)}">
<meta property="og:image:secure_url" content="${ogImage(current)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${B.name}: ${esc(title.split(' | ')[0].replace(B.name + ' · ', ''))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImage(current)}">
<link rel="icon" type="image/png" sizes="48x48" href="assets/images/favicon-48.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/images/icon-192.png">
<link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="assets/images/logo-horizontal.webp" as="image" type="image/webp" fetchpriority="high">
<link rel="stylesheet" href="assets/css/site.css?v=${V}">
<script>try{if(sessionStorage.getItem('fx-nav')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('fx-enter');sessionStorage.removeItem('fx-nav')}catch(e){}</script>
${jsonLd(current)}
</head>
<body class="${bodyClass}" id="top"${bySlug[current] ? ` data-service="${current}"` : ''}>
<div class="fx-veil" aria-hidden="true"><img src="assets/images/logo-lumis.webp" width="380" height="444" alt="" decoding="async"></div>
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

const compareBlock = (pair, label) => `<div class="cmp" data-compare style="--pos:50%">
<img src="assets/images/${pair}-despues.webp" alt="${esc(label)}: después (ejemplo ilustrativo)" width="1536" height="1024" loading="lazy">
<div class="cmp-before"><img src="assets/images/${pair}-antes.webp" alt="${esc(label)}: antes (ejemplo ilustrativo)" width="1536" height="1024" loading="lazy"></div>
<span class="cmp-tag cmp-tag-l">Antes</span><span class="cmp-tag cmp-tag-r">Después</span>
<div class="cmp-handle" aria-hidden="true"><span>${icon('chevron')}${icon('chevron')}</span></div>
<input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después: ${esc(label)}">
</div>`;

const serviceCard = (s, extra = '') => `<a class="card reveal" href="${s.slug}.html" data-cat="${s.category}"${extra}>
<div class="card-media">${img(s.img, '', { sizes: '(max-width: 760px) 40vw, 24vw' })}<span class="card-cat">${groups.find(g => g.id === s.category).label}</span>${isFeat(s) ? '<span class="card-star">Destacado</span>' : ''}</div>
<div class="card-body"><h3>${s.title}</h3><p>${esc(s.card)}</p><div class="card-foot"><span class="tags">${s.tags.map(t => `<i>${t}</i>`).join('')}</span><span class="card-go">${icon('up')}</span></div></div>
</a>`;

// Vídeo vertical dentro de un marco de móvil. Solo se carga y reproduce cuando está en pantalla.
const phoneVideo = ({ name, label, alt, cls = '' }) => `<figure class="phone ${cls}" data-video>
<video muted loop playsinline preload="none" poster="assets/video/${name}.webp" aria-label="${esc(alt)}"><source src="assets/video/${name}.mp4" type="video/mp4"></video>
<button type="button" class="phone-toggle" aria-label="Pausar vídeo" aria-pressed="false"><span class="ico-pause" aria-hidden="true"></span></button>
${label ? `<figcaption class="phone-tag"><i></i>${label}</figcaption>` : ''}
</figure>`;

// Cinta de servicios en movimiento, discreta y elegante.
const strip = () => {
  const row = services.map(s => `<a href="${s.slug}.html">${s.label}</a>${icon('spark')}`).join('');
  return `<section class="strip" aria-label="Nuestros servicios"><div class="strip-row"><div class="strip-track">${row}</div><div class="strip-track" aria-hidden="true">${row}</div></div></section>`;
};

// Cabecera de páginas interiores.
const pageHero = ({ crumb, eyebrow, title, lead, ctas, visual, cls = '', free = false }) => stage(`<nav class="crumbs wrap" aria-label="Ruta"><a href="index.html">Inicio</a>${icon('chevron')}<span aria-current="page">${crumb}</span></nav>
<section class="page-hero wrap ${cls}">
<div class="page-hero-copy"><span class="eyebrow">${eyebrow}</span><h1 class="hero-title">${title}</h1><p class="svc-lead">${lead}</p>${free ? `<p class="free-visit">${icon('check')}<span><b>Visita y presupuesto gratis</b> en ${B.city} y hasta 40 min</span></p>` : ''}${ctas ? `<div class="hero-cta">${ctas}</div>` : ''}</div>
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
  const pairs = [['fachadas', 'Grafitis'], ['cristales', 'Cristales'], ['persianas', 'Persianas'], ['toldos', 'Toldos'], ['garajes', 'Garajes'], ['terrazas', 'Terrazas'], ['suelos', 'Suelos'], ['interiores', 'Interiores']];
  const hl = reviews.find(x => x.highlight);
  const rest = reviews.filter(r => !r.highlight);
  const half = Math.ceil(rest.length / 2);
  const rvRow = (list, rev) => `<div class="rv-row"${rev ? ' data-reverse' : ''}><div class="rv-track">${list.map(r => reviewCard(r)).join('')}</div><div class="rv-track" aria-hidden="true">${list.map(r => reviewCard(r)).join('')}</div></div>`;

  const main = `
${stage(`<section class="hero">
<div class="hero-copy">
<span class="pill"><span class="pulse"></span>Servicio integral · Zaragoza y alrededores</span>
<h1 class="hero-title"><small class="hero-kicker">Empresa de limpieza en ${B.city}</small><span class="line">Deja tus</span> <span class="line">espacios</span> <span class="line"><em>relucientes.</em></span></h1>
<p class="hero-lead">Limpieza profesional para <b>comunidades, oficinas, gimnasios, colegios y clínicas dentales</b> —y también para tu casa— con productos y técnicas de alta calidad.</p>
<div class="hero-cta">${btnBook('Agendar hoy mismo')}<a class="btn btn-ghost" href="${tel}">${icon('phone')}<span>${B.phone}</span></a></div>
<p class="free-visit">${icon('check')}<span><b>Visita y presupuesto gratis</b> en ${B.city} y hasta 40 min</span></p>
<div class="hero-extras"><a class="hero-rating" href="opiniones.html">${stars(5)}<span><b>Clientes encantados en Google</b><small>Lee sus opiniones ${icon('arrow')}</small></span></a>
<div class="hero-follow"><span>Síguenos</span>${socialLinks('social-round')}</div></div>
</div>
<div class="hero-visual">
<figure class="orb orb-a" data-parallax="-0.03">${img('cristales', 'Profesional limpiando un cerramiento de cristal (ejemplo ilustrativo)', { eager: true, sizes: '(max-width: 760px) 80vw, 36vw' })}</figure>
<figure class="orb orb-b" data-parallax="0.04">${img('terrazas', 'Terraza acristalada limpia y luminosa (ejemplo ilustrativo)', { eager: true, sizes: '(max-width: 760px) 60vw, 26vw' })}</figure>
<button type="button" class="seal" data-book aria-label="Agenda hoy mismo">
<svg class="seal-shape" viewBox="0 0 200 200" aria-hidden="true"><path d="${sealPath()}"/></svg>
<svg class="seal-ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100 100m-70 0a70 70 0 1 1 140 0a70 70 0 1 1-140 0"/></defs><text><textPath href="#ring">RESERVA RÁPIDA · SIN COMPROMISO · RESERVA RÁPIDA · SIN COMPROMISO ·</textPath></text></svg>
<span class="seal-text">Agenda<br>hoy<br>mismo</span>
</button>
<a class="float-card fc-offer fc-zone" href="zonas.html"><span class="fc-big">${icon('pin')}</span><span><b>${B.city} y alrededores</b><small>Comunidades, empresas y hogares</small></span></a>
<div class="float-card fc-list"><p>Servicios destacados</p><ul>${featured.map(s => `<li>${icon('check')}${s.label}</li>`).join('')}</ul></div>
</div>
</section>
<a class="scroll-cue" href="#destacados" aria-label="Descubre más"><span></span></a>`)}

${strip()}

<section class="sec intro">
<div class="wrap intro-grid">
<div class="reveal"><span class="eyebrow">${icon('spark')} Hola, somos Lumis</span><h2>Limpieza profesional con <em>trato cercano.</em></h2></div>
<div class="intro-text reveal"><p class="big">Somos un servicio integral de limpieza en ${B.city}. Cuidamos viviendas, comunidades, negocios y naves con el mismo objetivo: que al entrar se note la diferencia.</p><p>Empezamos siempre escuchándote. Cada espacio tiene sus materiales, sus accesos y sus prioridades, y por eso preparamos cada trabajo a medida. Tú hablas directamente con nosotros y recibes un presupuesto claro y sin compromiso.</p>
<div class="stats"><div><b data-count>${services.length}</b><span>servicios especializados</span></div><div><b>★ 5</b><span>la valoración que más nos dan en Google</span></div><div><b data-count>${featured.length}</b><span>servicios destacados para empresas, comunidades y centros</span></div></div>
<a class="link" href="como-trabajamos.html">Conoce cómo trabajamos ${icon('arrow')}</a></div>
</div>
</section>

<section class="sec featured" id="destacados">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('spark')} Servicios destacados</span><h2>Empresas, comunidades y centros, <em>nuestra especialidad.</em></h2></div><p>Planes de limpieza a medida, fuera de tu horario y con trato directo. Estos son los servicios en los que más nos especializamos.</p></div>
<div class="feat-grid">${featured.map((s, i) => `<article class="feat reveal" style="--d:${i * 90}ms">
<a class="feat-media" href="${s.slug}.html" tabindex="-1" aria-hidden="true">${img(s.img, '', { sizes: '(max-width: 760px) 92vw, 32vw' })}<span class="feat-num">0${i + 1}</span></a>
<div class="feat-body"><h3><a href="${s.slug}.html">${s.title}</a></h3><p>${esc(s.lead)}</p>
<ul class="ticks">${s.includes.slice(0, 4).map(t => `<li>${icon('check')}${esc(t)}</li>`).join('')}</ul>
<div class="feat-actions"><a class="link" href="${s.slug}.html">Ver servicio ${icon('arrow')}</a>${btnBook('Agendar', s.slug, 'btn btn-soft btn-sm')}</div></div>
</article>`).join('')}</div>
</div>
</section>

<section class="sec action" id="en-accion">
${wave('wave-top', 'var(--bg)')}
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="wrap action-grid">
<div class="action-copy reveal"><span class="eyebrow on-dark">${icon('camera')} Lumis en acción</span><h2>Así trabajamos, <em>de verdad.</em></h2>
<p class="lead">Sin fotos de catálogo: esto es un trabajo real de Lumis. Cristaleras, escalera, raqueta y paciencia hasta que no queda ni una marca.</p>
<ul class="action-list"><li>${icon('shield')}Trabajo seguro, hasta 3 m de altura</li><li>${icon('check')}Cristal, marcos y perfiles incluidos</li><li>${icon('spark')}Revisamos el resultado antes de irnos</li></ul>
<div class="hero-cta">${btnBook('Quiero este resultado', 'cristales')}<a class="btn btn-ghost" href="cristales.html">${icon('arrow')}<span>Limpieza de cristales</span></a></div>
<div class="action-social"><p>Más trabajos reales en nuestras redes</p>${socialLinks('social-dark')}</div></div>
<div class="action-phones reveal">${phoneVideo({ name: 'lumis-anuncio', alt: 'Anuncio de Limpiezas Lumis frente a una cristalera', label: 'Anuncio Lumis', cls: 'phone-back' })}${phoneVideo({ name: 'lumis-trabajo', alt: 'Operario de Lumis limpiando la cristalera de la fachada de un restaurante', label: 'Trabajo real', cls: 'phone-front' })}</div>
</div>
${wave('wave-bottom', '#fff')}
</section>

<section class="sec reviews" id="opiniones">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('star')} Opiniones reales</span><h2>Lo que dicen <em>nuestros clientes.</em></h2></div><div class="rv-summary">${stars(5)}<p>Reseñas publicadas en Google por clientes de viviendas, clínicas, restaurantes y gimnasios de ${B.city}.</p><a class="link" href="opiniones.html">Ver todas las opiniones ${icon('arrow')}</a></div></div>
<div class="rv-feature reveal">${icon('quote', 'rv-q')}<blockquote>${esc(hl.text)}</blockquote><div class="rv-feature-foot">${stars(hl.rating)}<span><b>${esc(hl.name)}</b> · Cliente en Valdespartera, ${B.city}</span></div></div>
</div>
<div class="rv-marquee" aria-label="Reseñas de clientes">${rvRow(rest.slice(0, half))}${rvRow(rest.slice(half), true)}</div>
<div class="wrap">${reviewAsk()}</div>
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
<div class="reveal">${compareBlock('fachadas', 'Grafitis')}<p class="cmp-help">${icon('arrow')} Arrastra, toca o usa las flechas del teclado</p></div>
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
    title: `${B.name} · Limpieza de comunidades, oficinas, colegios y clínicas en ${B.city}`,
    desc: `Empresa de limpieza en ${B.city}: vamos a verlo y te damos presupuesto gratis (Zaragoza y hasta 40 min). Comunidades, oficinas, gimnasios, colegios, clínicas, cristales y viviendas.`,
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
<span class="eyebrow">${icon(groupIcon[s.category])} ${g.label}${isFeat(s) ? ' · Servicio destacado' : ''}</span>
<h1>${s.title} <span class="h1-place">en ${B.city}</span></h1>
<p class="svc-tagline"><em>${esc(s.line)}</em></p>
<p class="svc-lead">${esc(s.lead)}</p>
<ul class="facts">${s.facts.map(f => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul>
<p class="free-visit">${icon('check')}<span><b>Visita y presupuesto gratis</b> en ${B.city} y hasta 40 min</span></p>
<div class="hero-cta">${btnBook('Agendar esta limpieza', s.slug)}<a class="btn btn-ghost" href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')}<span>Presupuesto por WhatsApp</span></a></div>
${s.review ? `<p class="svc-review">${icon('clock')} Servicio sujeto a disponibilidad. Escríbenos con fotos y te confirmamos.</p>` : ''}
</div>
<a class="float-card fc-offer svc-cover-offer" href="#opiniones"><span class="fc-big">★ 5</span><span><b>Opiniones reales</b><small>Clientes encantados en Google</small></span></a>
</div>
<a class="scroll-cue" href="#servicio" aria-label="Ver el servicio"><span></span></a>
</section>

<section class="svc-band">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="kpis wrap">
<div class="kpi reveal"><b data-count>${s.includes.length}</b><span>puntos incluidos en el servicio</span></div>
<div class="kpi reveal" style="--d:80ms"><b data-count>${s.steps.length}</b><span>pasos de un método probado</span></div>
<div class="kpi reveal" style="--d:160ms"><b>Gratis</b><span>visita y presupuesto, sin compromiso</span></div>
<div class="kpi kpi-hl reveal" style="--d:240ms"><b>★ 5</b><span>la valoración que más nos dan en Google</span></div>
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
<div><dt>${icon('plan')} Precio</dt><dd>A consultar. Vamos a verlo y te damos presupuesto gratis y sin compromiso.</dd></div>
<div><dt>${icon('pin')} Zona</dt><dd><a href="zonas.html">${B.zone}</a></dd></div>
</dl>${btnBook('Reservar cita', s.slug, 'btn btn-primary btn-block')}<a class="summary-tel" href="${tel}">o llama al <b>${B.phone}</b></a></aside>
</div>
</section>

<section class="sec includes" id="incluye">
<div class="wrap includes-grid">
<div class="includes-copy reveal"><span class="eyebrow">${icon('check')} Qué incluye</span><h2>Todo lo que <em>cuidamos.</em></h2><p class="lead">Esto es lo que incluye habitualmente nuestra ${s.title.toLowerCase()}. Adaptamos cada trabajo a tu espacio: si necesitas algo más, lo añadimos al presupuesto.</p>
<ul class="checklist">${s.includes.map((t, i) => `<li style="--d:${i * 50}ms"><span class="cl-n">${String(i + 1).padStart(2, '0')}</span><span>${esc(t)}</span>${icon('check')}</li>`).join('')}</ul></div>
${s.video ? `<div class="includes-video reveal">${phoneVideo({ name: s.video, alt: `${s.title}: trabajo real de Lumis`, label: 'Trabajo real de Lumis' })}</div>` : `<figure class="includes-media reveal">${img(s.img2 || s.img, `${s.title}, detalle (ejemplo ilustrativo)`, { sizes: '(max-width: 760px) 92vw, 40vw' })}<figcaption>${icon('shield')} Productos y técnicas de alta calidad</figcaption></figure>`}
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
<div class="sec-head reveal"><div><span class="eyebrow">${icon('calendar')} Frecuencia recomendada</span><h2>¿Cada cuánto <em>conviene?</em></h2></div><p>Elige el ritmo que mejor encaja con tu espacio.</p></div>
<div class="plans">${s.frequency.map(([t, d], i) => `<article class="plan${i === 1 ? ' hl' : ''} reveal" style="--d:${i * 90}ms"><span class="plan-ico">${icon(['calendar', 'clock', 'spark'][i])}</span><h3>${esc(t)}</h3><p>${esc(d)}</p>${btnBook('Agendar', s.slug, i === 1 ? 'btn btn-primary btn-sm' : 'btn btn-soft btn-sm')}</article>`).join('')}</div>
<div class="tips-row">${s.tips.map(([t, d], i) => `<div class="tip reveal" style="--d:${i * 80}ms"><span class="tip-ico">${icon('bulb')}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div>
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
${reviewAsk()}
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
    title: `${s.title} en ${B.city} · Presupuesto gratis | ${B.name}`,
    desc: `${s.title} en ${B.city}: vamos a verlo y te damos presupuesto gratis y sin compromiso (Zaragoza y hasta 40 min). ${s.lead}`,
    bodyClass: 'is-service', current: s.slug, main, msg,
  });
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
<div><span class="eyebrow on-dark">${icon('star')} ¿Ya eres cliente?</span><h2>Tu opinión <em>nos ayuda muchísimo.</em></h2><p>Si te ha gustado nuestro trabajo, dedica un minuto a dejarnos tu reseña en Google: el botón abre directamente la ventana para puntuarnos. Así más vecinos de ${B.city} pueden conocernos.</p></div>
<a class="btn btn-light" href="${reviewWriteUrl}" target="_blank" rel="noopener">${icon('star')}<span>Dejar mi reseña en Google</span></a>
</div>
</section>`;
  return page({ title: `Opiniones de clientes | ${B.name}`, desc: `Opiniones reales en Google de clientes de ${B.name} en ${B.city}: limpieza de cristales, toldos, viviendas, clínicas, restaurantes y gimnasios.`, bodyClass: 'is-page', current: 'opiniones', main });
}

// ---------- Quiénes somos ----------
function aboutPage() {
  const aboutReviews = ['T-CURA fisioterapia', 'Cristina G.', 'Ricardo Hernandez', 'PEDRO CAMPOS'].map(n => reviews.find(r => r.name === n)).filter(Boolean);
  const main = `
${pageHero({
    crumb: 'Quiénes somos', eyebrow: `${icon('user')} Quiénes somos`,
    title: 'Detrás de cada brillo, <em>está Luis.</em>',
    lead: `Limpiezas Lumis es la empresa de ${B.owner}. Desde 2021 se dedica a la limpieza: primero para otras empresas, limpiando cristales y oficinas, y desde octubre de 2025 con la suya propia, junto a su mujer, María Lucrecia.`,
    ctas: `${btnBook('Hablar con Luis')}<a class="btn btn-ghost" href="#historia">${icon('arrow')}<span>Conoce su historia</span></a>`,
    visual: `<div class="about-visual"><figure class="about-portrait"><img src="assets/images/luis.webp" srcset="assets/images/luis-sm.webp 640w, assets/images/luis-md.webp 1024w, assets/images/luis.webp 1120w" sizes="(max-width: 760px) 84vw, 34vw" alt="Luis Hernando Arellano, fundador de Limpiezas Lumis, en su oficina de Zaragoza" width="1120" height="1400" loading="eager" fetchpriority="high"><figcaption><b>Luis Hernando Arellano</b><small>Fundador de Limpiezas Lumis</small></figcaption></figure><div class="float-card fc-mini about-since">${icon('calendar')}<span><b>Desde 2021</b><small>en el oficio</small></span></div><div class="float-card fc-mini about-born">${icon('spark')}<span><b>Octubre 2025</b><small>nace Lumis</small></span></div></div>`,
  })}

<section class="svc-band">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="kpis wrap">
<div class="kpi reveal"><b>2021</b><span>año en que Luis empieza en la limpieza</span></div>
<div class="kpi reveal" style="--d:80ms"><b>2025</b><span>año en que nace Limpiezas Lumis</span></div>
<div class="kpi reveal" style="--d:160ms"><b data-count>${B.zoneMinutes}</b><span>minutos de radio desde Zaragoza</span></div>
<div class="kpi kpi-hl reveal" style="--d:240ms"><b>★ 5</b><span>la valoración que más nos dan en Google</span></div>
</div>
${wave('wave-bottom')}
</section>

<section class="sec" id="historia">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('clock')} Su camino</span><h2>De aprender el oficio <em>a tener su empresa.</em></h2></div><p>Cinco años dedicados a la limpieza, contados en cuatro momentos. Y este octubre, <a class="link" href="#aniversario">lo celebramos</a>.</p></div>
<ol class="timeline" data-progress><span class="tl-line" aria-hidden="true"><i></i></span>${about.timeline.map(([ic, when, t, d]) => `<li class="tl-step reveal"><span class="tl-node">${icon(ic)}</span><div class="tl-card"><span class="tl-n">${when}</span><h3>${t}</h3><p>${esc(d)}</p></div></li>`).join('')}</ol>
</div>
</section>

<section class="sec anniv" id="aniversario">
<div class="wrap">
<div class="anniv-card reveal">
<div class="cta-bubbles" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<div class="anniv-badge" aria-hidden="true"><svg class="seal-ring" viewBox="0 0 200 200"><defs><path id="anniv-ring" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs><text><textPath href="#anniv-ring">PRIMER ANIVERSARIO · OCT 2025 – OCT 2026 · </textPath></text></svg><span class="anniv-num">1</span><span class="anniv-unit">año</span></div>
<div class="anniv-copy"><span class="eyebrow on-dark">${icon('star')} Primer aniversario</span><h2>${anniversary.title}</h2>${anniversary.text.map(p => `<p>${esc(p)}</p>`).join('')}<p class="anniv-cheer">${icon('spark')} ${esc(anniversary.cheer)}</p></div>
</div>
</div>
</section>

<section class="sec about-story">
<div class="wrap about-story-grid">
<div class="about-story-copy reveal"><span class="eyebrow">${icon('heart')} Por qué Lumis</span><h2>Lo que se aprende <em>trabajando.</em></h2>${about.story.map(p => `<p class="lead">${esc(p)}</p>`).join('')}
<figure class="about-motto">${icon('quote', 'about-q')}<blockquote>Cuidar cada espacio <em>como si fuera el nuestro.</em></blockquote><figcaption>Nuestra forma de trabajar</figcaption></figure></div>
<div class="about-story-video reveal">${phoneVideo({ name: 'lumis-trabajo', alt: 'Luis limpiando cristales en un trabajo real de Limpiezas Lumis', label: 'Luis, trabajando' })}</div>
</div>
</section>

<section class="sec ideal ideal-dark">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
${wave('wave-top', 'var(--bg)')}
<div class="wrap">
<div class="about-family">
<div class="reveal"><span class="eyebrow on-dark">${icon('home')} Un equipo en familia</span><h2>Gente de confianza <em>en tu casa.</em></h2>${about.family.map(p => `<p>${esc(p)}</p>`).join('')}</div>
<div class="family-skills reveal"><p class="family-skills-t">${icon('heart')} Lo que aporta María Lucrecia</p><ul>${about.familySkills.map(([ic, t, d]) => `<li><span class="ideal-ico">${icon(ic)}</span><span><b>${t}</b>${esc(d)}</span></li>`).join('')}</ul></div>
</div>
<div class="ideal-grid about-values">${about.values.map(([ic, t, d], i) => `<article class="ideal-card reveal" style="--d:${i * 70}ms"><span class="ideal-ico">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
</div>
${wave('wave-bottom')}
</section>

<section class="sec about-zone">
<div class="wrap about-zone-grid">
<div class="about-zone-map reveal" aria-hidden="true"><div class="map-card"><div class="map-rings"><i></i><i></i><i></i></div><span class="map-pin">${icon('pin')}</span><p><b>${B.city}</b><small>hasta 40 min alrededor</small></p></div></div>
<div class="reveal"><span class="eyebrow">${icon('pin')} Dónde trabajamos</span><h2>Zaragoza y hasta <em>40 minutos alrededor.</em></h2>
<p class="lead">Nos movemos por Zaragoza y por los municipios, polígonos y centros comerciales de los alrededores, hasta unos 40 minutos en coche. Más lejos no vamos: el viaje encarecería el servicio y preferimos darte un precio justo.</p>
<ul class="about-chips">${about.zone.map(z => `<li>${icon('check')}${z}</li>`).join('')}</ul>
<div class="hero-cta"><a class="btn btn-primary" href="${wa('Hola Lumis, ¿trabajáis en mi zona? Estoy en ')}" target="_blank" rel="noopener">${icon('wa')}<span>¿Llegáis a mi zona?</span></a><a class="btn btn-soft" href="zonas.html">${icon('pin')}<span>Ver todas las zonas</span></a></div></div>
</div>
</section>

<section class="sec reviews reviews-all about-reviews">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('star')} Opiniones en Google</span><h2>Lo que dicen <em>de Luis.</em></h2></div><p>Reseñas reales de clientes, tal y como las escribieron.</p></div>
<div class="rv-masonry">${aboutReviews.map((r, i) => reviewCard(r, 'rv reveal', `--d:${(i % 3) * 80}ms`)).join('')}</div>
<p class="about-more reveal"><a class="link" href="opiniones.html">Ver todas las opiniones ${icon('arrow')}</a></p>
</div>
</section>`;
  return page({ title: `Quiénes somos | ${B.name} · La historia de Luis`, desc: `Conoce a ${B.owner}, fundador de ${B.name}: desde 2021 en la limpieza de cristales y oficinas en ${B.city} y con empresa propia desde octubre de 2025. Trabajamos hasta 40 minutos de ${B.city}.`, bodyClass: 'is-page', current: 'quienes-somos', main, msg: 'Hola Luis, he leído vuestra historia en la web y me gustaría pedir un presupuesto.' });
}

// ---------- Zonas de trabajo ----------
function zonasPage() {
  const chips = list => `<ul class="about-chips zone-chips">${list.map(z => `<li>${icon('pin')}${esc(z)}</li>`).join('')}</ul>`;
  const main = `
${pageHero({
    free: true, crumb: 'Zonas de trabajo', eyebrow: `${icon('pin')} Dónde trabajamos`,
    title: 'Limpieza en Zaragoza <em>y alrededores.</em>',
    lead: `Trabajamos en todos los barrios de ${B.city} y en los municipios, polígonos y centros comerciales que están a unos 40 minutos en coche. La visita y el presupuesto son gratis.`,
    ctas: `${btnBook('Pedir presupuesto')}<a class="btn btn-ghost" href="${wa('Hola Lumis, ¿trabajáis en mi zona? Estoy en ')}" target="_blank" rel="noopener">${icon('wa')}<span>¿Llegáis a mi zona?</span></a>`,
    visual: `<div class="map-card" aria-hidden="true"><div class="map-rings"><i></i><i></i><i></i></div><span class="map-pin">${icon('pin')}</span><p><b>${B.city}</b><small>y hasta 40 min alrededor</small></p></div>`,
  })}

<section class="sec">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('building')} Zaragoza ciudad</span><h2>Todos los barrios <em>de Zaragoza.</em></h2></div><p>Del Actur a Valdespartera y de Delicias a Las Fuentes: limpiamos viviendas, comunidades, oficinas y negocios en toda la ciudad.</p></div>
<div class="reveal">${chips(zonas.barrios)}</div>
</div>
</section>

<section class="sec ideal ideal-dark">
<canvas class="stage-canvas" aria-hidden="true"></canvas>
${wave('wave-top', 'var(--bg)')}
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow on-dark">${icon('pin')} Alrededores</span><h2>Municipios a menos <em>de 40 minutos.</em></h2></div><p>Una lista orientativa. Si tu pueblo no aparece pero está cerca, escríbenos y te lo confirmamos.</p></div>
<div class="zone-groups">${zonas.municipios.map(([dir, via, towns], i) => `<article class="ideal-card reveal" style="--d:${i * 70}ms"><span class="ideal-ico">${icon('pin')}</span><h3>${dir}</h3><p class="zone-via">${via}</p><ul class="zone-towns">${towns.map(x => `<li>${esc(x)}</li>`).join('')}</ul></article>`).join('')}</div>
</div>
${wave('wave-bottom')}
</section>

<section class="sec">
<div class="wrap zone-biz">
<div class="reveal"><span class="eyebrow">${icon('layers')} Empresas</span><h2>Polígonos <em>industriales.</em></h2><p class="lead">Oficinas, naves y zonas comunes en los polígonos de la zona, con horarios que no interrumpen tu actividad.</p>${chips(zonas.poligonos)}</div>
<div class="reveal"><span class="eyebrow">${icon('spark')} Comercios</span><h2>Centros <em>comerciales.</em></h2><p class="lead">Nos desplazamos también a locales, tiendas y oficinas en los centros comerciales de Zaragoza y alrededores.</p>${chips(zonas.centros)}</div>
</div>
</section>

<section class="sec zone-services">
<div class="wrap">
<div class="sec-head reveal"><div><span class="eyebrow">${icon('check')} En toda la zona</span><h2>Todos nuestros <em>servicios.</em></h2></div><p>Los ${services.length} servicios están disponibles en Zaragoza y en todos sus alrededores.</p></div>
<ul class="zone-svc reveal">${services.map(s => `<li><a href="${s.slug}.html">${icon('arrow')}<span>${s.title} en ${B.city}</span></a></li>`).join('')}</ul>
</div>
</section>

<section class="sec faq-sec">
<div class="wrap faq-grid">
<div class="reveal"><span class="eyebrow">${icon('plan')} Preguntas frecuentes</span><h2>Sobre nuestra <em>zona de trabajo.</em></h2><p class="lead">¿Dudas con tu dirección? Llámanos al <a href="${tel}">${B.phone}</a> o escríbenos por WhatsApp.</p></div>
<div class="reveal">${faqList(zonas.faq)}</div>
</div>
</section>`;
  return page({ title: `Limpieza en Zaragoza y alrededores · Zonas de trabajo | ${B.name}`, desc: `${B.name} trabaja en todos los barrios de ${B.city} y hasta 40 minutos alrededor: Utebo, Cuarte de Huerva, Cadrete, La Muela, Villanueva de Gállego, Zuera, La Puebla de Alfindén y más.`, bodyClass: 'is-page', current: 'zonas', main, msg: 'Hola Lumis, ¿trabajáis en mi zona? Estoy en ' });
}

// ---------- Cómo trabajamos ----------
function methodPage() {
  const main = `
${pageHero({
    free: true, crumb: 'Cómo trabajamos', eyebrow: `${icon('clock')} Nuestro método`,
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
<figure class="includes-media reveal">${img('interiores', 'Interior luminoso y limpio (ejemplo ilustrativo)', { sizes: '(max-width: 760px) 92vw, 40vw' })}<figcaption>${icon('shield')} Visita y presupuesto gratis</figcaption></figure>
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
  return page({ title: `Cómo trabajamos | ${B.name}`, desc: `Así trabaja ${B.name} en ${B.city}: visita y presupuesto gratis y sin compromiso, puntualidad, productos adecuados y revisión final contigo.`, bodyClass: 'is-page', current: 'como-trabajamos', main });
}

// ---------- Contacto ----------
function contactPage() {
  const cards = [
    ['phone', 'Llámanos', B.phone, tel, 'La forma más rápida de hablar con nosotros.', false],
    ['wa', 'WhatsApp', 'Escríbenos', wa(), 'Envíanos fotos y te respondemos con tu presupuesto.', true],
    ['phone', 'Teléfono fijo', B.landline, `tel:${B.landlineIntl}`, 'También puedes llamarnos a nuestro fijo.', false],
    ['mail', 'Email', B.email, `mailto:${B.email}`, 'Para consultas detalladas o empresas.', false],
  ];
  const main = `
${pageHero({
    free: true, crumb: 'Contacto', eyebrow: `${icon('wa')} Contacto`,
    title: 'Hablemos de <em>tu espacio.</em>',
    lead: 'Llámanos, escríbenos por WhatsApp o reserva tu cita en un minuto. Vamos a verlo y te damos presupuesto gratis en Zaragoza y hasta 40 minutos alrededor.',
    ctas: `${btnBook('Agendar cita')}<a class="btn btn-ghost" href="${tel}">${icon('phone')}<span>${B.phone}</span></a><a class="btn btn-ghost" href="tel:${B.landlineIntl}">${icon('phone')}<span>Fijo ${B.landline}</span></a>`,
    visual: `<div class="contact-phone">${phoneVideo({ name: 'lumis-anuncio', alt: 'Anuncio de Limpiezas Lumis: pide tu presupuesto sin compromiso', label: 'Pide tu presupuesto' })}<div class="float-card fc-mini contact-zone">${icon('pin')}<span><b>${B.city}</b><small>y hasta 40 min alrededor</small></span></div></div>`,
  })}

<section class="sec contact-sec">
<div class="wrap">
<div class="contact-grid">${cards.map(([ic, t, v, href, d, ext], i) => `<a class="c-card reveal" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} style="--d:${i * 70}ms"><span class="c-ico">${icon(ic)}</span><span class="c-t">${t}</span><b>${esc(v).replace('@', '<wbr>@')}</b><p>${d}</p><span class="card-go">${icon('up')}</span></a>`).join('')}
<div class="c-card c-card-social reveal" style="--d:280ms"><span class="c-ico">${icon('insta')}</span><span class="c-t">Redes sociales</span><b>Síguenos</b><p>Trabajos reales, antes y después y novedades en ${B.instagramHandle} y ${B.tiktokHandle}.</p>${socialLinks('social-card')}</div>
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
  return page({ title: `Contacto | ${B.name} · ${B.city}`, desc: `Contacta con ${B.name} en ${B.city}: ${B.phone}, WhatsApp, ${B.landline} o ${B.email}. Visita y presupuesto gratis en Zaragoza y hasta 40 min.`, bodyClass: 'is-page', current: 'contacto', main });
}

// ---------- Páginas legales (LSSI, RGPD y cookies) ----------
// Textos basados en modelos habituales; conviene que los revise la gestoría o asesoría de Lumis.
const LEGAL = [['aviso-legal', 'Aviso legal'], ['privacidad', 'Política de privacidad'], ['cookies', 'Política de cookies']];
const titularBlock = () => `<ul class="legal-data">
<li><b>Titular:</b> ${B.owner}</li>
<li><b>Nombre comercial:</b> ${B.name}</li>
<li><b>NIE:</b> ${B.nif}</li>
<li><b>Domicilio:</b> ${B.address}</li>
<li><b>Teléfono:</b> ${B.phone} · ${B.landline}</li>
<li><b>Email:</b> <a href="mailto:${B.email}">${B.email}</a></li>
<li><b>Sitio web:</b> <a href="${SITE}">${SITE.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></li>
</ul>`;

function legalPage(key, title, lead, body) {
  const nav = LEGAL.map(([k, l]) => `<a href="${k}.html"${cur(key, k)}>${l}</a>`).join('');
  const main = `
${stage(`<nav class="crumbs wrap" aria-label="Ruta"><a href="index.html">Inicio</a>${icon('chevron')}<span aria-current="page">${title}</span></nav>
<section class="legal-hero wrap"><span class="eyebrow">${icon('shield')} Información legal</span><h1>${title}</h1><p class="svc-lead">${lead}</p><p class="legal-date">Última actualización: ${B.legalUpdated}</p></section>`, 'stage-legal')}

<section class="sec legal">
<div class="wrap legal-grid">
<aside class="legal-nav" aria-label="Páginas legales"><p>Información legal</p>${nav}<a class="btn btn-soft btn-sm" href="contacto.html">${icon('mail')}<span>Contacto</span></a></aside>
<article class="legal-doc">
${body}
</article>
</div>
</section>`;
  return page({ title: `${title} | ${B.name}`, desc: `${title} de ${B.name}, servicio de limpieza en ${B.city}.`, bodyClass: 'is-page is-legal', current: key, main });
}

const avisoLegal = () => legalPage('aviso-legal', 'Aviso legal', 'Información sobre el titular de esta web y las condiciones para usarla.', `
<h2>1. Datos identificativos</h2>
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:</p>
${titularBlock()}

<h2>2. Objeto</h2>
<p>Esta web informa sobre los servicios de limpieza que presta ${B.name} en ${B.city} y alrededores, y ofrece medios para contactar y pedir presupuesto. A través de la web no se realizan contrataciones ni pagos: el servicio, su alcance y su precio se acuerdan directamente con el cliente.</p>

<h2>3. Condiciones de uso</h2>
<p>El acceso a la web es gratuito y no requiere registro. Quien la visita se compromete a hacer un uso adecuado de sus contenidos, conforme a la ley, la buena fe y el orden público, y a no emplearlos para actividades ilícitas o que puedan dañar a ${B.name} o a terceros.</p>

<h2>4. Propiedad intelectual e industrial</h2>
<p>El diseño de la web, sus textos, el logotipo y la marca ${B.name} pertenecen a su titular o se usan con autorización. Queda prohibida su reproducción, distribución o transformación sin permiso expreso, salvo para uso personal y privado.</p>
<p>Algunas fotografías son ejemplos visuales ilustrativos y no corresponden a trabajos concretos. Las opiniones de clientes proceden de reseñas públicas de Google y pertenecen a sus autores.</p>

<h2>5. Responsabilidad</h2>
<p>La información de la web es orientativa. Las características de cada servicio y su precio se concretan en el presupuesto correspondiente. ${B.name} procura que la información sea correcta y esté actualizada, pero no se hace responsable de errores puntuales ni de interrupciones del servicio por causas técnicas ajenas.</p>

<h2>6. Enlaces a otros sitios</h2>
<p>La web contiene enlaces a servicios de terceros, como WhatsApp, Instagram, TikTok o Google. ${B.name} no controla esos sitios ni se responsabiliza de sus contenidos o de sus políticas de privacidad, que conviene consultar.</p>

<h2>7. Legislación aplicable</h2>
<p>Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan según la normativa aplicable; cuando quien reclame sea un consumidor, serán los de su domicilio.</p>`);

const privacidad = () => legalPage('privacidad', 'Política de privacidad', 'Cómo tratamos tus datos cuando nos contactas y qué derechos tienes.', `
<h2>1. Responsable del tratamiento</h2>
${titularBlock()}

<h2>2. Qué datos tratamos</h2>
<p>Esta web <b>no tiene formularios que envíen o guarden datos</b> en nuestros sistemas. La reserva rápida solo prepara un mensaje en tu propio dispositivo y lo abre en WhatsApp: los datos nos llegan únicamente si tú decides enviarlo.</p>
<p>Cuando nos contactas por WhatsApp, teléfono o email tratamos los datos que nos facilitas: nombre, teléfono, email, zona o dirección del servicio, detalles del espacio y, si nos las envías, fotografías.</p>

<h2>3. Para qué los usamos</h2>
<ul>
<li>Responder a tus consultas y preparar tu presupuesto.</li>
<li>Organizar y prestar el servicio que contrates.</li>
<li>Emitir facturas y cumplir nuestras obligaciones legales.</li>
</ul>
<p>No usamos tus datos para enviarte publicidad ni para elaborar perfiles.</p>

<h2>4. Base legal</h2>
<ul>
<li><b>Tu consentimiento</b>, al contactarnos voluntariamente (art. 6.1.a RGPD).</li>
<li><b>La aplicación de medidas precontractuales y la ejecución del contrato</b>: presupuesto y prestación del servicio (art. 6.1.b RGPD).</li>
<li><b>El cumplimiento de obligaciones legales</b>, como las fiscales y contables (art. 6.1.c RGPD).</li>
</ul>

<h2>5. Cuánto tiempo los conservamos</h2>
<p>Los datos de consultas que no terminan en contratación se conservan el tiempo necesario para atenderlas. Los de clientes, mientras dure la relación y, después, durante los plazos que exige la ley (por ejemplo, la normativa fiscal y mercantil).</p>

<h2>6. A quién se comunican</h2>
<p>No cedemos tus datos a terceros salvo obligación legal. Para comunicarnos y para que la web funcione utilizamos proveedores que pueden tratar datos por cuenta propia o en nuestro nombre:</p>
<ul>
<li><b>WhatsApp (Meta)</b>, si eliges contactarnos por esa vía.</li>
<li><b>Google</b>, como proveedor de nuestro correo electrónico.</li>
<li><b>${B.hosting.name}</b>, proveedor de alojamiento de la web, cuyos servidores registran datos técnicos de las visitas, como la dirección IP, por motivos de seguridad y funcionamiento.</li>
</ul>
<p>Algunos de estos proveedores están en ${B.hosting.country}. Las transferencias internacionales se realizan con las garantías previstas en el RGPD, como el Marco de Privacidad de Datos UE-EE. UU. o las cláusulas contractuales tipo de la Comisión Europea.</p>

<h2>7. Tus derechos</h2>
<p>Puedes ejercer tus derechos de <b>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</b> escribiendo a <a href="mailto:${B.email}">${B.email}</a> e indicando qué derecho quieres ejercer. Podemos pedirte que acredites tu identidad.</p>
<p>Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener">Agencia Española de Protección de Datos</a>.</p>

<h2>8. Redes sociales</h2>
<p>Si nos sigues o nos escribes en Instagram o TikTok, esos datos se tratan también según las políticas de privacidad de cada red social.</p>`);

const cookiesPage = () => legalPage('cookies', 'Política de cookies', 'Qué guarda esta web en tu navegador y por qué no necesitas aceptar cookies.', `
<h2>1. ¿Qué son las cookies?</h2>
<p>Las cookies son pequeños archivos que algunas webs guardan en tu navegador para recordar información sobre tu visita, por ejemplo para analizar el tráfico o mostrar publicidad.</p>

<h2>2. Cookies que utiliza esta web</h2>
<p><b>Esta web no utiliza cookies</b>, ni propias ni de terceros, de análisis, publicidad o personalización. Por eso no te mostramos ningún aviso para aceptarlas.</p>

<h2>3. Almacenamiento técnico</h2>
<p>Para mostrar la animación de transición al pasar de una página a otra, la web guarda de forma temporal un indicador técnico en el almacenamiento de sesión de tu navegador:</p>
<div class="legal-table"><table>
<thead><tr><th>Nombre</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr></thead>
<tbody><tr><td><code>fx-nav</code></td><td>Almacenamiento de sesión (propio)</td><td>Mostrar la animación al cambiar de página</td><td>Se borra al cargar la página siguiente o al cerrar la pestaña</td></tr></tbody>
</table></div>
<p>No identifica a nadie ni se comparte con terceros. Al ser estrictamente necesario para una función de la propia web, está exento de consentimiento según el artículo 22.2 de la LSSI.</p>

<h2>4. Servicios de terceros</h2>
<p>Cuando pulsas un enlace a WhatsApp, Instagram, TikTok o Google sales de esta web. Esos servicios pueden usar sus propias cookies según sus políticas, que puedes consultar en cada uno de ellos.</p>
<p>El proveedor de alojamiento registra datos técnicos de las visitas; puedes ver los detalles en nuestra <a href="privacidad.html">política de privacidad</a>.</p>

<h2>5. Cómo gestionarlas</h2>
<p>Puedes consultar y borrar las cookies y los datos de sitios web desde la configuración de tu navegador (Chrome, Safari, Firefox o Edge).</p>

<h2>6. Cambios</h2>
<p>Si en el futuro incorporamos herramientas de estadísticas u otras que usen cookies, actualizaremos esta política y te pediremos el consentimiento antes de activarlas.</p>`);

// ---------- Página 404 ----------
// Lleva <base> absoluta para que estilos e imágenes carguen desde cualquier ruta inexistente.
const notFound = () => page({
  title: `Página no encontrada | ${B.name}`, desc: 'La página que buscas no existe.', bodyClass: 'is-page', current: '404',
  extraHead: `\n<base href="${SITE}">\n<meta name="robots" content="noindex">`,
  main: stage(`<section class="legal-hero wrap"><span class="eyebrow">${icon('spark')} Error 404</span><h1>Esta página <em>no existe.</em></h1><p class="svc-lead">Puede que el enlace esté mal escrito o que la página haya cambiado. Te dejamos por dónde seguir:</p><div class="hero-cta"><a class="btn btn-primary" href="index.html">${icon('home')}<span>Ir al inicio</span></a><a class="btn btn-ghost" href="index.html#servicios">${icon('layers')}<span>Ver servicios</span></a></div></section>`, 'stage-legal'),
});

fs.mkdirSync(OUT, { recursive: true });
// Las tres hojas de estilo se publican unidas y comprimidas en site.css: una sola descarga que bloquea el renderizado.
// Se editan siempre lumis.css, pages.css y fx.css; site.css se regenera en cada build.
{
  const css = ['lumis', 'pages', 'fx'].map(n => fs.readFileSync(path.join(OUT, `assets/css/${n}.css`), 'utf8')).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
  fs.writeFileSync(path.join(OUT, 'assets/css/site.css'), css + '\n');
}
const write = (name, html) => fs.writeFileSync(path.join(OUT, name), html);
write('index.html', home());
for (const s of services) write(`${s.slug}.html`, servicePage(s));
write('quienes-somos.html', aboutPage());
write('zonas.html', zonasPage());
write('opiniones.html', reviewsPage());
write('como-trabajamos.html', methodPage());
write('contacto.html', contactPage());
write('aviso-legal.html', avisoLegal());
write('privacidad.html', privacidad());
write('cookies.html', cookiesPage());
write('404.html', notFound());
// Mapa del sitio y robots para Google
const pagesForMap = ['index', ...destacados, ...services.map(s => s.slug).filter(s => !destacados.includes(s)), 'quienes-somos', 'zonas', 'opiniones', 'como-trabajamos', 'contacto', 'aviso-legal', 'privacidad', 'cookies'];
const today = new Date().toISOString().slice(0, 10);
const priority = k => k === 'index' ? '1.0' : destacados.includes(k) ? '0.9' : ['aviso-legal', 'privacidad', 'cookies'].includes(k) ? '0.2' : '0.7';
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pagesForMap.map(k => `  <url><loc>${pageUrl(k)}</loc><lastmod>${today}</lastmod><priority>${priority(k)}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
// Dominio propio en GitHub Pages: el archivo CNAME solo existe tras el lanzamiento
if (B.launched) write('CNAME', B.domain + '\n'); else if (fs.existsSync(path.join(OUT, 'CNAME'))) fs.rmSync(path.join(OUT, 'CNAME'));
console.log(`Generadas ${services.length + 10} páginas en ${OUT}`);
