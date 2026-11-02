/* Navigation, appointments and contact behavior shared by every Automa page. */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu = $('#site-menu');
  const toggle = $('.menu-toggle');
  let scrollController;
  function closeMenu() {
    menu?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) closeMenu(); });
  matchMedia('(min-width: 1081px)').addEventListener('change', closeMenu);

  const booking = $('#bk');
  let returnFocus;
  let previousOverflow;
  let inertElements = [];
  function closeBooking() {
    if (!booking || booking.hidden) return;
    booking.hidden = true;
    document.documentElement.style.overflow = previousOverflow || '';
    inertElements.forEach((el) => { el.inert = false; });
    inertElements = [];
    scrollController?.start();
    returnFocus?.focus({ preventScroll: true });
  }
  function openBooking() {
    const url = window.ANTIPODE_CONFIG?.bookingUrl;
    if (!url || !booking) { location.href = '/contatti/'; return; }
    if (!booking.hidden) return;
    closeMenu();
    returnFocus = document.activeElement;
    previousOverflow = document.documentElement.style.overflow;
    const body = $('#bk-body');
    if (!body.querySelector('iframe')) {
      const frame = document.createElement('iframe');
      const address = new URL(url);
      if (address.hostname === 'calendar.google.com') address.searchParams.set('gv', 'true');
      frame.src = address.href;
      frame.title = 'Scegli un orario e prenota una call con Gruppo Automa';
      body.append(frame);
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener';
      fallback.className = 'booking-fallback';
      fallback.textContent = 'Il calendario non si apre? Aprilo in una nuova scheda ↗';
      body.before(fallback);
    }
    booking.hidden = false;
    inertElements = [...document.body.children].filter((el) => el !== booking && !el.inert && !['SCRIPT', 'STYLE'].includes(el.tagName));
    inertElements.forEach((el) => { el.inert = true; });
    document.documentElement.style.overflow = 'hidden';
    scrollController?.stop();
    $('button[data-close]', booking)?.focus();
  }
  $$('[data-book]').forEach((button) => button.addEventListener('click', (e) => {
    e.preventDefault();
    openBooking();
  }));
  booking?.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeBooking(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (booking && !booking.hidden) { closeBooking(); return; }
      if (toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
    }
    if (e.key === 'Tab' && booking && !booking.hidden) {
      const first = $('button[data-close]', booking);
      const last = $('iframe', booking);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  });
  // Escape inside a cross-origin calendar is handled by Google; the close button
  // and external-calendar fallback remain available outside that frame.
  window.AutomaSite = { openBooking, closeBooking, setScrollController: (controller) => { scrollController = controller; } };

  const form = $('#cform');
  const message = $('#cform-msg');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('nome') || '').trim();
    const email = String(data.get('email') || '').trim();
    const text = String(data.get('messaggio') || '').trim();
    const required = [form.elements.nome, form.elements.email, form.elements.messaggio];
    required.forEach((input) => input.removeAttribute('aria-invalid'));
    const invalid = required.find((input) => !input.value.trim() || !input.validity.valid);
    if (invalid || !name || !email || !text) {
      if (invalid) { invalid.setAttribute('aria-invalid', 'true'); invalid.focus(); }
      message.textContent = 'Compila nome, un indirizzo email valido e il messaggio.';
      return;
    }
    const company = String(data.get('azienda') || '').trim();
    const need = data.getAll('tipo').join(', ') || 'da definire';
    const budget = data.get('budget') || 'da definire';
    const body = `Ciao Gruppo Automa,\n\n${text}\n\nMi interessa: ${need}\nBudget: ${budget}\n\n${name}${company ? ' · ' + company : ''}\n${email}`;
    const draft = `mailto:info@gruppoautoma.it?subject=${encodeURIComponent('Nuovo progetto — ' + (company || name))}&body=${encodeURIComponent(body)}`;
    location.href = draft;
    message.textContent = 'Apro il programma di posta con la bozza. Per inviarla, conferma dal tuo programma di posta.';
  });

  if (document.body.dataset.page !== 'home') {
    const budget = $('#budget');
    ['< 1.000 €', '1.000 € – 3.000 €', '3.000 € – 10.000 €', '> 10.000 €'].forEach((range) => {
      if (budget) budget.add(new Option(range, range));
    });
    if (!reduced && window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const elements = $$('[data-reveal]');
      elements.forEach((el) => gsap.from(el, { y: 30, opacity: 0, duration: .85, ease: 'power3.out',
        clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
      $$('.service-step').forEach((el, i) => gsap.from(el, { y: 38, rotation: i % 2 ? 4 : -4, opacity: 0,
        duration: .9, delay: i * .1, ease: 'power3.out', clearProps: 'all',
        scrollTrigger: { trigger: el.parentElement, start: 'top 85%', once: true } }));
    }
    $$('[data-filter]').forEach((button) => button.addEventListener('click', () => {
      const group = button.dataset.filter;
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      $$('.project-card').forEach((card) => { card.hidden = group !== 'all' && card.dataset.category !== group; });
      window.ScrollTrigger?.refresh();
    }));
  }
})();
