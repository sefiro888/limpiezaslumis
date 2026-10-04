/* Limpiezas Lumis · interacciones v4 */
(() => {
  const WA = '34652630938';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* Cabecera: sombra al hacer scroll y barra de progreso */
  const hdr = $('[data-header]');
  const progress = $('.progress');
  const onScroll = () => {
    const y = scrollY;
    hdr?.classList.toggle('scrolled', y > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menú móvil a pantalla completa */
  const burger = $('.burger');
  const mnav = $('#mnav');
  const setMenu = open => {
    if (!mnav) return;
    const isOpen = mnav.classList.contains('open');
    if (open === isOpen) return;
    burger?.setAttribute('aria-expanded', open);
    mnav.classList.toggle('open', open);
    mnav.setAttribute('aria-hidden', !open);
    mnav.inert = !open;
    document.body.classList.toggle('dlg-open', open);
    if (open) setTimeout(() => $('.mnav-close', mnav)?.focus({ preventScroll: true }), 50);
    else burger?.focus({ preventScroll: true });
  };
  burger?.addEventListener('click', () => setMenu(true));
  $('.mnav-close')?.addEventListener('click', () => setMenu(false));
  mnav?.addEventListener('click', e => { if (e.target.closest('a[href]')) setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 980) setMenu(false); });

  /* Mega menú de servicios */
  const mega = $('.has-mega');
  const drop = $('.nav-drop');
  const setMega = open => { mega?.classList.toggle('open', open); drop?.setAttribute('aria-expanded', open); };
  drop?.addEventListener('click', e => { e.stopPropagation(); setMega(!mega.classList.contains('open')); });
  document.addEventListener('click', e => { if (mega && !mega.contains(e.target)) setMega(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMega(false); setMenu(false); } });
  if (matchMedia('(hover: hover) and (min-width: 981px)').matches && mega) {
    let t;
    mega.addEventListener('mouseenter', () => { clearTimeout(t); setMega(true); });
    mega.addEventListener('mouseleave', () => { t = setTimeout(() => setMega(false), 180); });
  }

  /* Aparición al hacer scroll */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px' }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* Parallax suave en el hero */
  const par = $$('[data-parallax]');
  if (par.length && !reduce && matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', e => {
      const x = e.clientX - innerWidth / 2, y = e.clientY - innerHeight / 2;
      par.forEach(el => { const k = parseFloat(el.dataset.parallax); el.style.translate = `${x * k}px ${y * k}px`; });
    }, { passive: true });
  }

  /* Filtros del catálogo */
  const filters = $$('.filter[data-filter]');
  const cards = $$('.cards .card[data-cat]');
  const status = $('[data-filter-status]');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach(b => { const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    let n = 0;
    cards.forEach(c => { const show = f === 'all' || c.dataset.cat === f; c.classList.toggle('hide', !show); if (show) { n++; c.classList.add('in'); } });
    if (status) status.textContent = `${n} servicios mostrados`;
  }));

  /* Comparadores antes / después */
  $$('[data-compare]').forEach(cmp => {
    const range = $('input', cmp);
    const set = v => { cmp.style.setProperty('--pos', v + '%'); range.value = v; };
    range.addEventListener('input', () => set(range.value));
    let intro = !reduce;
    if (intro && io) {
      new IntersectionObserver((en, o) => {
        if (!en[0].isIntersecting) return; o.disconnect();
        let t = 0; const tick = () => { if (!intro) return; t += .025; set(Math.round(50 + Math.sin(t * Math.PI) * 18)); if (t < 2) requestAnimationFrame(tick); else set(50); };
        requestAnimationFrame(tick);
      }, { threshold: .6 }).observe(cmp);
      ['pointerdown', 'keydown', 'input'].forEach(ev => range.addEventListener(ev, () => { intro = false; }));
    }
  });
  const tabs = $$('.cmp-tabs [data-pair]');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const cmp = $('.results [data-compare]');
    if (!cmp) return;
    tabs.forEach(t => t.setAttribute('aria-selected', t === tab));
    const { pair, label } = tab.dataset;
    const [after, before] = [$(':scope > img', cmp), $('.cmp-before img', cmp)];
    cmp.classList.add('loading');
    let loaded = 0;
    const done = () => { if (++loaded === 2) cmp.classList.remove('loading'); };
    after.onload = before.onload = done;
    after.src = `assets/images/${pair}-despues.webp`; after.alt = `${label}: después (ejemplo ilustrativo)`;
    before.src = `assets/images/${pair}-antes.webp`; before.alt = `${label}: antes (ejemplo ilustrativo)`;
    $('input', cmp).setAttribute('aria-label', `Comparar antes y después: ${label}`);
    setTimeout(() => cmp.classList.remove('loading'), 1500);
  }));

  /* Subnavegación de servicio: resalta la sección visible */
  const subLinks = $$('.subnav a');
  if (subLinks.length && io) {
    const map = new Map(subLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const so = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      subLinks.forEach(a => a.classList.remove('on'));
      const a = map.get(en.target.id);
      if (!a) return;
      a.classList.add('on');
      // Solo desplazamos la barra horizontalmente: scrollIntoView movía la página y provocaba rebotes.
      const bar = a.parentElement;
      bar.scrollTo({ left: a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* Líneas de progreso (pasos y línea de tiempo) según el scroll */
  const tracks = $$('[data-progress]');
  if (tracks.length) {
    let ticking = false;
    const update = () => {
      ticking = false;
      tracks.forEach(t => {
        const r = t.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const p = Math.max(0, Math.min(1, (innerHeight * .65 - r.top) / r.height));
        t.style.setProperty('--prog', p.toFixed(3));
        const items = $$('.step, .tl-step', t);
        items.forEach(li => {
          const lr = li.getBoundingClientRect();
          li.classList.toggle('lit', lr.top + lr.height / 2 < innerHeight * .65 || (p > .98));
        });
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* Filtro de opiniones */
  const rvFilters = $$('[data-rv-filter]');
  rvFilters.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.rvFilter;
    rvFilters.forEach(b => { const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $$('.rv-masonry .rv').forEach(rv => { const show = f === 'all' || rv.dataset.kind === f; rv.classList.toggle('hide', !show); if (show) rv.classList.add('in'); });
  }));

  /* FAQ: solo una abierta a la vez */
  $$('.faq').forEach(list => $$('details', list).forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('details', list).forEach(o => { if (o !== d) o.open = false; });
  })));

  /* Vídeos: se cargan y reproducen solo cuando están en pantalla, con botón de pausa */
  $$('[data-video]').forEach(box => {
    const v = $('video', box), btn = $('.phone-toggle', box);
    let userPaused = reduce; // con «reducir movimiento» no arrancan solos
    const sync = () => { const paused = v.paused; btn.setAttribute('aria-pressed', paused); btn.setAttribute('aria-label', paused ? 'Reproducir vídeo' : 'Pausar vídeo'); };
    const play = () => { if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); };
    btn.addEventListener('click', () => { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
    if (!io) return;
    new IntersectionObserver(en => { if (en[0].isIntersecting) { if (!userPaused) play(); } else v.pause(); }, { threshold: .35 }).observe(box);
  });

  /* Año del pie */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Reserva rápida ---------- */
  const dlg = $('#book');
  if (!dlg) return;
  const form = $('form', dlg);
  const steps = $$('.book-step', dlg);
  const stepLabels = $$('.book-steps li', dlg);
  const next = $('[data-next]', dlg), prev = $('[data-prev]', dlg), send = $('[data-send]', dlg);
  const err = $('.book-error', dlg);
  const select = form.elements.service;
  const dateInput = form.elements.date;
  const summary = $('.book-summary', dlg);
  let step = 0, when = '', lastFocus = null;

  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const today = new Date();
  dateInput.min = iso(today);

  const markQuick = () => $$('.qs', dlg).forEach(b => b.classList.toggle('on', b.dataset.pick === select.value));
  const showStep = n => {
    step = n;
    steps.forEach((s, i) => { s.hidden = i !== n; });
    stepLabels.forEach((li, i) => li.classList.toggle('on', i <= n));
    prev.hidden = n === 0;
    next.hidden = n === steps.length - 1;
    send.hidden = n !== steps.length - 1;
    err.hidden = true;
    if (n === steps.length - 1) updateMessage();
  };

  const labelDate = () => {
    if (when === 'hoy') return 'hoy mismo';
    if (when === 'manana') return 'mañana';
    if (when === 'semana') return 'esta semana';
    if (when === 'flexible') return 'cuando tengáis hueco, sin prisa';
    if (dateInput.value) return 'el ' + new Date(dateInput.value + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return 'cuando tengáis hueco';
  };

  const buildMessage = () => {
    const f = form.elements;
    const service = select.options[select.selectedIndex].text;
    const lines = [
      `Hola Lumis, soy ${f.name.value.trim() || '…'}. Me gustaría agendar una cita.`,
      `• Servicio: ${service}`,
      `• Cuándo: ${labelDate()}, ${f.slot.value}`,
      `• Zona: ${f.zone.value.trim() || '…'}`,
    ];
    if (f.notes.value.trim()) lines.push(`• Detalles: ${f.notes.value.trim()}`);
    if (f.photos.checked) lines.push('• Tengo fotos para enviaros.');
    lines.push('', '¡Gracias!');
    return lines.join('\n');
  };
  function updateMessage() {
    const msg = buildMessage();
    summary.innerHTML = '<strong>Tu mensaje</strong>';
    summary.append(document.createTextNode(msg));
    send.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }

  const validate = () => {
    if (step === 1 && !when && !dateInput.value) return 'Elige una fecha o una de las opciones rápidas.';
    return '';
  };

  next.addEventListener('click', () => {
    const e = validate();
    if (e) { err.textContent = e; err.hidden = false; return; }
    showStep(Math.min(step + 1, steps.length - 1));
    $('input, select, button.qs', steps[step])?.focus({ preventScroll: true });
  });
  prev.addEventListener('click', () => showStep(Math.max(step - 1, 0)));
  send.addEventListener('click', e => {
    const f = form.elements;
    const missing = [!f.name.value.trim() && 'tu nombre', !f.zone.value.trim() && 'tu zona'].filter(Boolean);
    if (missing.length) { e.preventDefault(); err.textContent = `Indícanos ${missing.join(' y ')} para preparar el mensaje.`; err.hidden = false; (f.name.value.trim() ? f.zone : f.name).focus(); return; }
    updateMessage();
  });
  form.addEventListener('input', () => { if (step === steps.length - 1) { updateMessage(); err.hidden = true; } });
  form.addEventListener('submit', e => e.preventDefault());

  $$('.qs', dlg).forEach(b => b.addEventListener('click', () => { select.value = b.dataset.pick; markQuick(); }));
  select.addEventListener('change', markQuick);
  $$('.chip', dlg).forEach(c => c.addEventListener('click', () => {
    when = c.dataset.when;
    $$('.chip', dlg).forEach(x => x.classList.toggle('on', x === c));
    const d = new Date();
    if (when === 'manana') d.setDate(d.getDate() + 1);
    dateInput.value = when === 'hoy' || when === 'manana' ? iso(d) : '';
    err.hidden = true;
  }));
  dateInput.addEventListener('change', () => { when = ''; $$('.chip', dlg).forEach(x => x.classList.remove('on')); });

  const open = slug => {
    lastFocus = document.activeElement;
    setMenu(false); setMega(false);
    if (slug && [...select.options].some(o => o.value === slug)) select.value = slug;
    markQuick();
    showStep(0);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.classList.add('dlg-open');
  };
  const close = () => { dlg.open && (dlg.close ? dlg.close() : dlg.removeAttribute('open')); };
  dlg.addEventListener('close', () => { document.body.classList.remove('dlg-open'); lastFocus?.focus?.(); });
  $('[data-close]', dlg).addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-book]');
    if (!t) return;
    e.preventDefault();
    open(t.dataset.service || document.body.dataset.service || '');
  });
  if (location.hash === '#reservar') open('');
})();
