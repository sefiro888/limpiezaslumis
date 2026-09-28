/* Limpiezas Lumis · efectos: burbujas, destellos, inclinación 3D y transiciones */
(() => {
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const small = innerWidth < 760;
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const starSvg = '<svg viewBox="0 0 24 24"><path d="M12 0c.8 6.6 3.4 9.2 12 12-8.6 2.8-11.2 5.4-12 12-.8-6.6-3.4-9.2-12-12 8.6-2.8 11.2-5.4 12-12Z"/></svg>';

  /* ---------- Contadores de las cifras ---------- */
  // Solo se anima el primer nodo de texto, así se conservan sufijos como <small>%</small>.
  $$('[data-count]').forEach(b => {
    const node = [...b.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    const end = node && parseInt(node.textContent, 10);
    if (!end || reduce) return;
    node.textContent = '0';
    new IntersectionObserver((en, o) => {
      if (!en[0].isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const tick = t => { const k = Math.min((t - t0) / 1400, 1); node.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .5 }).observe(b);
  });

  /* ---------- Transiciones entre páginas ---------- */
  const root = document.documentElement;
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('fx-leaving'); });
  // Red de seguridad: el velo de entrada nunca debe quedarse tapando la página.
  if (root.classList.contains('fx-enter')) setTimeout(() => {
    const v = document.querySelector('.fx-veil');
    if (v) v.style.transition = 'none';
    root.classList.remove('fx-enter');
  }, 1300);
  if (!reduce) document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host || !/(\.html|\/)$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return; // anclas de la misma página
    e.preventDefault();
    root.style.setProperty('--vx', e.clientX + 'px');
    root.style.setProperty('--vy', e.clientY + 'px');
    root.classList.add('fx-leaving');
    try { sessionStorage.setItem('fx-nav', '1'); } catch (_) {}
    setTimeout(() => { location.href = url.href; }, 560);
  });

  if (reduce) return;

  /* ---------- Titulares: palabras que suben ---------- */
  $$('.reveal h2, h2.reveal').forEach(h => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
          w.append(inner); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('glint')) walk(n);
    });
    walk(h);
  });

  /* ---------- Destellos en las palabras en cursiva ---------- */
  $$('.sec h2 em, .hero-title em, .svc-tagline em, .cta-in h2 em, .offer-strip h2 em').forEach((em, k) => {
    for (let n = 0; n < 2; n++) {
      const g = document.createElement('span');
      g.className = 'glint'; g.setAttribute('aria-hidden', 'true'); g.innerHTML = starSvg;
      g.style.left = rand(n ? 55 : 5, n ? 95 : 45) + '%';
      g.style.top = rand(-15, 25) + '%';
      g.style.animationDelay = (rand(0, 3.6) + k * .3).toFixed(2) + 's';
      g.style.fontSize = rand(.7, 1.1).toFixed(2) + 'em';
      em.append(g);
    }
  });

  /* ---------- Inclinación 3D con reflejo ---------- */
  if (fine) {
    $$('.feat, .cards .card, .rv-grid .rv, .pillar, .ideal-card, .step, .stamp-card, .plan, .how-card, .love-card, .tool, .c-card, .kpi, .tl-card').forEach(el => {
      el.classList.add('tilt');
      const glare = document.createElement('span'); glare.className = 'glare'; glare.setAttribute('aria-hidden', 'true');
      el.append(glare);
      const max = el.matches('.stamp-card') ? 12 : 6;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add('tilting');
        el.style.setProperty('--rx', ((.5 - py) * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((px - .5) * max * 1.2).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });

    /* Botones magnéticos */
    $$('.btn-primary, .btn-light, .seal').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .25).toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  /* ---------- Motor de burbujas ---------- */
  function drawBubble(ctx, b, dark) {
    const { x, y, r } = b, a = b.a;
    if (a <= 0.01 || r < .5) return;
    const g = ctx.createRadialGradient(x - r * .25, y - r * .3, r * .1, x, y, r);
    if (dark) {
      g.addColorStop(0, `rgba(255,255,255,${.04 * a})`);
      g.addColorStop(.7, `hsla(${b.h},90%,80%,${.07 * a})`);
      g.addColorStop(.9, `hsla(${b.h + 50},100%,85%,${.32 * a})`);
      g.addColorStop(1, `rgba(255,255,255,${.7 * a})`);
    } else {
      g.addColorStop(0, `rgba(255,255,255,${.1 * a})`);
      g.addColorStop(.72, `hsla(${b.h},85%,70%,${.08 * a})`);
      g.addColorStop(.9, `hsla(${b.h + 40},90%,62%,${.3 * a})`);
      g.addColorStop(1, `hsla(${b.h - 10},85%,55%,${.55 * a})`);
    }
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${.85 * a})`;
    ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .42, r * .24, r * .12, -.7, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${.5 * a})`;
    ctx.beginPath(); ctx.arc(x + r * .42, y + r * .38, r * .07, 0, TAU); ctx.fill();
  }
  function drawSpark(ctx, p) {
    const s = p.s * (0.4 + .6 * p.a), a = p.a;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = `hsla(${p.h},95%,${p.l}%,${a})`;
    ctx.beginPath();
    ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * .15, -s * .15, s, 0); ctx.quadraticCurveTo(s * .15, s * .15, 0, s);
    ctx.quadraticCurveTo(-s * .15, s * .15, -s, 0); ctx.quadraticCurveTo(-s * .15, -s * .15, 0, -s); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(0, 0, s * .18, 0, TAU); ctx.fill();
    ctx.restore();
  }

  class Field {
    constructor(canvas, o) {
      this.c = canvas; this.ctx = canvas.getContext('2d'); this.o = o;
      this.items = []; this.sparks = []; this.visible = !o.observe; this.pointer = null;
      this.resize();
      for (let i = 0; i < o.count; i++) this.items.push(this.make(true));
      if (o.observe) new IntersectionObserver(en => { this.visible = en[0].isIntersecting; }).observe(canvas);
      if (o.repel) {
        const host = canvas.parentElement;
        host.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; });
        host.addEventListener('pointerleave', () => { this.pointer = null; });
      }
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const r = this.o.fixed ? { width: innerWidth, height: innerHeight } : this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    make(initial) {
      const [r0, r1] = this.o.r;
      const r = rand(r0, r1);
      return { x: rand(0, this.w), y: initial ? rand(0, this.h) : this.h + r + rand(0, 60), r, vy: rand(...this.o.speed) * (1.2 - r / (r1 * 1.6)), ph: rand(0, TAU), wob: rand(.4, 1.2), h: rand(180, 200), a: 0, ta: rand(.55, 1) };
    }
    burst(x, y, n = 9) {
      for (let i = 0; i < n; i++) {
        const ang = rand(0, TAU), sp = rand(40, 140);
        this.items.push({ x, y, r: rand(2.5, 7), vx: Math.cos(ang) * sp, vy: 0, vyUp: Math.sin(ang) * sp - 40, ph: rand(0, TAU), wob: 0, h: rand(178, 205), a: 1, ta: 1, life: rand(.8, 1.4), burst: true });
      }
      for (let i = 0; i < 5; i++) this.spark(x + rand(-10, 10), y + rand(-10, 10), rand(5, 9));
    }
    spark(x, y, s = rand(3, 7)) {
      if (this.sparks.length > 70) return;
      this.sparks.push({ x, y, s, rot: rand(0, TAU), vr: rand(-2, 2), vy: rand(-18, -4), vx: rand(-10, 10), a: 1, life: rand(.6, 1.1), t: 0, h: rand(182, 198), l: rand(55, 72) });
    }
    step(dt, scrollDelta) {
      const { ctx, w, h } = this;
      ctx.clearRect(0, 0, w, h);
      for (let i = this.items.length - 1; i >= 0; i--) {
        const b = this.items[i];
        if (b.burst) {
          b.life -= dt; b.x += b.vx * dt; b.y += b.vyUp * dt; b.vx *= .96; b.vyUp = b.vyUp * .96 - 20 * dt;
          b.a = Math.max(0, Math.min(1, b.life)); b.r *= 1 + dt * .2;
          if (b.life <= 0) { this.items.splice(i, 1); continue; }
        } else {
          b.ph += dt * b.wob;
          b.y -= b.vy * dt + scrollDelta * (this.o.parallax || 0) * (b.r / this.o.r[1]);
          b.x += Math.sin(b.ph) * .35;
          if (this.pointer) {
            const dx = b.x - this.pointer.x, dy = b.y - this.pointer.y, d = Math.hypot(dx, dy);
            if (d < 110 && d > .1) { const f = (110 - d) / 110 * 90 * dt; b.x += dx / d * f; b.y += dy / d * f; }
          }
          const edge = Math.min(1, b.y / (h * .25));
          b.a += ((b.ta * Math.max(0, edge)) - b.a) * Math.min(1, dt * 2);
          if (b.y < -b.r * 2 || b.y > h + 200) {
            if (b.extra) { this.items.splice(i, 1); continue; }
            Object.assign(b, this.make(false));
          }
        }
        drawBubble(ctx, b, this.o.dark);
      }
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const p = this.sparks[i];
        p.t += dt; p.a = 1 - p.t / p.life; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.a <= 0) { this.sparks.splice(i, 1); continue; }
        drawSpark(ctx, p);
      }
    }
  }


  /* Burbujas solo en los escenarios oscuros, y solo mientras están en pantalla */
  const fields = $$('.stage-canvas').map(c => new Field(c, { observe: true, repel: fine, count: small ? 12 : 26, r: [3, small ? 14 : 24], speed: [16, 40], dark: true }));
  let last = performance.now(), running = false;
  const loop = t => {
    const dt = Math.min((t - last) / 1000, .05); last = t;
    let any = false;
    fields.forEach(f => { if (f.visible) { any = true; f.step(dt, 0); } });
    if (any && !document.hidden) requestAnimationFrame(loop); else running = false;
  };
  const wake = () => { if (!running && fields.some(f => f.visible) && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(loop); } };
  fields.forEach(f => new IntersectionObserver(() => setTimeout(wake, 0)).observe(f.c));
  document.addEventListener('visibilitychange', wake);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => fields.forEach(f => f.resize()), 150); });

  /* Burbujas de navegación: elementos con animación CSS (se mueven en la GPU, no afectan al scroll) */
  const air = document.createElement('div');
  air.className = 'fx-air'; air.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < (small ? 5 : 8); i++) {
    const b = document.createElement('i');
    const size = rand(10, small ? 22 : 30);
    b.style.cssText = `--s:${size.toFixed(0)}px;--x:${rand(2, 96).toFixed(1)}vw;--dur:${rand(16, 30).toFixed(1)}s;--delay:${(-rand(0, 30)).toFixed(1)}s;--sway:${rand(-40, 40).toFixed(0)}px;--h:${rand(180, 205).toFixed(0)}`;
    air.append(b);
  }
  document.body.append(air);

  /* Destellos al mover el ratón y burbujas al pulsar */
  const layer = document.createElement('div');
  layer.className = 'fx-layer'; layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  let live = 0;
  const particle = (cls, x, y, html, anim, dur) => {
    if (live > 40) return;
    const el = document.createElement('span');
    el.className = cls; el.innerHTML = html || '';
    el.style.left = x + 'px'; el.style.top = y + 'px';
    layer.append(el); live++;
    const a = el.animate(anim, { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
    a.onfinish = () => { el.remove(); live--; };
  };
  if (fine) {
    let lx = 0, ly = 0, acc = 0;
    addEventListener('pointermove', e => {
      acc += Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
      if (acc < 42) return; acc = 0;
      const s = rand(.5, 1), r = rand(0, 180);
      particle('fx-spark', e.clientX, e.clientY, starSvg, [
        { transform: `translate(-50%,-50%) scale(${s}) rotate(${r}deg)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${rand(-14, 14)}px),calc(-50% + ${rand(-26, -8)}px)) scale(0) rotate(${r + 120}deg)`, opacity: 0 },
      ], rand(700, 1100));
    }, { passive: true });
  }
  addEventListener('pointerdown', e => {
    if (!e.target.closest('a, button, .cmp, label, .chip')) return;
    for (let i = 0; i < (small ? 6 : 9); i++) {
      const ang = rand(0, Math.PI * 2), d = rand(30, 80);
      particle('fx-pop', e.clientX, e.clientY, '', [
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        { transform: `translate(calc(-50% + ${(Math.cos(ang) * d).toFixed(0)}px),calc(-50% + ${(Math.sin(ang) * d - 30).toFixed(0)}px)) scale(${rand(.8, 1.4).toFixed(2)})`, opacity: 0 },
      ], rand(600, 1000));
    }
  }, { passive: true });
})();
