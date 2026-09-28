(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const servicesMenu = document.querySelector('.nav-services');
  const backdrop = document.querySelector('.menu-backdrop');
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncBackdrop = () => {
    const opened = servicesMenu.open || (mobile.matches && nav.classList.contains('open'));
    backdrop.hidden = !opened;
    document.body.classList.toggle('menu-is-open', mobile.matches && nav.classList.contains('open'));
  };
  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
    servicesMenu.open = false;
    syncBackdrop();
  };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    if (!open) servicesMenu.open = false;
    syncBackdrop();
  });
  servicesMenu.addEventListener('toggle', syncBackdrop);
  backdrop.addEventListener('click', closeMenu);
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (servicesMenu.open || nav.classList.contains('open'))) {
      const focusTarget = mobile.matches ? toggle : servicesMenu.querySelector('summary');
      closeMenu(); focusTarget.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header') && servicesMenu.open) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.site-header') && servicesMenu.open) closeMenu();
  });
  mobile.addEventListener('change', closeMenu);

  const cards = [...document.querySelectorAll('.service-card[data-category]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const filterStatus = document.getElementById('filter-status');
  const filterServices = category => {
    if (!filters.some(button => button.dataset.filter === category)) category = 'todos';
    filters.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    cards.forEach(card => {
      card.hidden = category !== 'todos' && card.dataset.category !== category;
      if (!card.hidden) { count++; card.classList.add('visible'); }
    });
    if (filterStatus) filterStatus.textContent = `${count} servicios disponibles en esta selección.`;
  };
  filters.forEach(button => button.addEventListener('click', () => filterServices(button.dataset.filter)));
  document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => {
    try { sessionStorage.setItem('lumis-category', link.dataset.filterLink); } catch (_) { /* Local file storage can be unavailable. */ }
  }));
  if (cards.length) {
    try { const category = sessionStorage.getItem('lumis-category'); if (category) { filterServices(category); sessionStorage.removeItem('lumis-category'); } } catch (_) {}
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.05 });
    reveals.forEach(element => observer.observe(element));
    document.documentElement.classList.add('motion-ready');
    reduced.addEventListener('change', event => {
      if (event.matches) { document.documentElement.classList.remove('motion-ready'); observer.disconnect(); }
    });
  }

  document.querySelectorAll('[data-compare]').forEach(box => {
    const input = box.querySelector('input[type="range"]');
    let activePointer = null;
    const update = value => {
      const percentage = Math.round(Math.max(0, Math.min(100, Number(value))));
      input.value = String(percentage);
      box.style.setProperty('--split', percentage + '%');
      input.setAttribute('aria-valuetext', `${percentage}% antes, ${100 - percentage}% después`);
    };
    const atPointer = event => {
      const rect = input.getBoundingClientRect();
      if (rect.width) update((event.clientX - rect.left) / rect.width * 100);
    };
    input.addEventListener('input', () => update(input.value));
    input.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      activePointer = event.pointerId;
      input.focus({ preventScroll: true });
      input.setPointerCapture(activePointer);
      atPointer(event);
    });
    input.addEventListener('pointermove', event => { if (event.pointerId === activePointer) atPointer(event); });
    const finish = event => {
      if (event.pointerId !== activePointer) return;
      if (input.hasPointerCapture(event.pointerId)) input.releasePointerCapture(event.pointerId);
      activePointer = null;
    };
    input.addEventListener('pointerup', finish);
    input.addEventListener('pointercancel', finish);
    update(input.value);
  });
})();
