(function () {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LANG = window.I18N?.lang || "it";
  const LOCALE = LANG === "en" ? "en-AU" : "it-IT";
  const T = (k, fallback) => window.I18N?.t(k) ?? fallback;
  const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchMotion = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = new Intl.NumberFormat(LOCALE);
  const CFG = window.ANTIPODE_CONFIG || {};
  // Australia sees AUD, Italy sees EUR
  const CUR = LANG === "en" ? "aud" : "eur";
  const group = (n, sep) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep); // always group, also 4-digit numbers
  const money0 = (n) => (CUR === "aud" ? `A$${group(n, ",")}` : `${group(n, ".")} €`);
  const budget = $("#budget");
  if (budget) {
    const ranges = CUR === "aud" ? [[0, 2000], [2000, 5000], [5000, 15000], [15000, 0]] : [[0, 1000], [1000, 3000], [3000, 10000], [10000, 0]];
    ranges.forEach(([a, b]) => {
      const label = !a ? `< ${money0(b)}` : !b ? `> ${money0(a)}` : `${money0(a)} – ${money0(b)}`;
      budget.insertAdjacentHTML("beforeend", `<option value="${esc(label)}">${esc(label)}</option>`);
    });
  }

  /* ---------------- smooth scroll + anchors ---------------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  let restoreY = 0;
  try { restoreY = +sessionStorage.getItem("automa-y") || 0; sessionStorage.removeItem("automa-y"); } catch (e) {}

  let lenis = null;
  if (!reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.AutomaSite?.setScrollController(lenis);
  const scrollToY = (target, opts = {}) => {
    if (lenis) return lenis.scrollTo(target, opts);
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY + (opts.offset || 0);
    scrollTo({ top: y, behavior: opts.immediate ? "auto" : "smooth" });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    if (CFG.bookingUrl && a.hasAttribute("data-book")) return; // handled by the booking modal
    const id = a.getAttribute("href");
    const el = id === "#top" ? 0 : $(id);
    if (el === null) return;
    e.preventDefault();
    scrollToY(el, { offset: -90, duration: 1.4 });
  }));

  /* ---------------- headings: word reveal ---------------- */
  function splitHTML(node, grad = false) {
    return [...node.childNodes].map((n) => {
      if (n.nodeType === 3) {
        return n.textContent.split(/(\s+)/).map((p) => (!p || /^\s+$/.test(p) ? p : `<span class="w"><span${grad ? ' class="grad"' : ""}>${esc(p)}</span></span>`)).join("");
      }
      if (n.nodeName === "BR") return "<br>";
      if (n.classList?.contains("grad")) return splitHTML(n, true);
      const tag = n.nodeName.toLowerCase();
      return `<${tag}>${splitHTML(n, grad)}</${tag}>`;
    }).join("");
  }
  $$("[data-split]").forEach((el) => { el.innerHTML = splitHTML(el); });

  // On phones the message and actions are readable from the first paint.
  // Keep a subtle settling motion without hiding text behind a word reveal.
  const heroMotion = gsap.timeline({ defaults: { ease: "power4.out" }, delay: .05 });
  if (touchMotion || matchMedia("(max-width: 860px)").matches) {
    heroMotion
      .fromTo(".hero__title", { y: 8 }, { y: 0, duration: .55, clearProps: "transform" })
      .fromTo([".hero .proof-pill", ".hero__ctas", ".assure"], { y: 8 }, { y: 0, duration: .45, stagger: .03, clearProps: "transform" }, 0)
      .fromTo(".shot", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .65 }, .15);
  } else {
    heroMotion
      .fromTo(".hero__title .w > span", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .045 })
      .fromTo([".hero .proof-pill", ".hero__sub", ".hero__ctas", ".assure"], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .9, stagger: .08 }, .25)
      .fromTo(".shot", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2 }, .5);
  }

  $$("main section:not(.hero) [data-split]:not(#uses-title):not(#how-title)").forEach((h) => {
    const words = $$(".w > span", h);
    gsap.set(words, { yPercent: 110 });
    ScrollTrigger.create({ trigger: h, start: "top 86%", once: true, onEnter: () => gsap.to(words, { yPercent: 0, duration: 1, stagger: 0.035, ease: "power4.out" }) });
  });

  // reveal: rise + a touch of scale, long expo ease; transforms are cleared afterwards so tap feedback works
  const reveal = (sel, start = "top 90%") => {
    const els = typeof sel === "string" ? $$(sel) : sel;
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: touchMotion ? 24 : 46, scale: 0.97 });
    ScrollTrigger.batch(els, { start, once: true, onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: touchMotion ? .65 : 1.15, stagger: touchMotion ? .05 : .09, ease: "expo.out", clearProps: "transform" }) });
  };
  reveal("[data-reveal]");

  /* ---------------- hero stage ---------------- */
  gsap.fromTo(".stage", { rotateX: 22, scale: 0.93 }, { rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: ".shot", start: "top 92%", end: "top 25%", scrub: true } });
  gsap.fromTo(".win--l", { x: 60, rotate: -2 }, { x: 0, rotate: -6, ease: "none", scrollTrigger: { trigger: ".shot", start: "top 92%", end: "top 20%", scrub: true } });
  gsap.fromTo(".win--r", { x: -60, rotate: 2 }, { x: 0, rotate: 6, ease: "none", scrollTrigger: { trigger: ".shot", start: "top 92%", end: "top 20%", scrub: true } });
  gsap.fromTo([".float", ".stage__cta"], { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: "back.out(2)", delay: 0.9 });
  if (!reduceMotion) $$(".float").forEach((f, i) => gsap.to(f, { y: i % 2 ? 8 : -8, duration: 2.4 + i * 0.3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.6 }));

  /* ---------------- responsive scroll scenes ---------------- */
  const mm = gsap.matchMedia();
  const scribble = $(".scribble path");
  const sLen = scribble.getTotalLength();
  gsap.set(scribble, { strokeDasharray: sLen, strokeDashoffset: sLen });

  mm.add("(min-width: 861px)", () => {
    const before = $("#ba-before"), after = $("#ba-after");
    const dx = () => (after.offsetWidth + 24) / 2;
    gsap.timeline({ scrollTrigger: { trigger: "#ba-pin", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } })
      .to(after, { x: () => -dx(), rotate: -1.5, ease: "power2.inOut", duration: 1 }, 0.15)
      .to(before, { x: () => dx() * 0.92, scale: 0.86, rotate: -4, opacity: 0.5, ease: "power2.inOut", duration: 1 }, 0.15)
      .to(after, { rotate: 0, duration: 0.3 }, 1.15)
      .to(scribble, { strokeDashoffset: 0, ease: "power2.out", duration: 0.6 }, 1.1)
      .to({}, { duration: 0.3 });

  });
  mm.add("(max-width: 860px)", () => {
    ScrollTrigger.create({ trigger: "#ba-after", start: "top 70%", once: true, onEnter: () => gsap.to(scribble, { strokeDashoffset: 0, duration: 1, ease: "power2.out" }) });
  });

  /* ---------------- integrations ---------------- */
  gsap.fromTo(".integ__tiles li", { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, stagger: 0.03, duration: 0.5, ease: "back.out(2)", scrollTrigger: { trigger: ".integ__tiles", start: "top 88%" } });

  /* ---------------- modal helpers ---------------- */
  let lastFocus = null;
  function openModal(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    gsap.fromTo(el.lastElementChild, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
    gsap.fromTo(el.firstElementChild, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    setTimeout(() => $(".pv__close", el)?.focus(), 50);
  }
  function closeModal(el) {
    el.hidden = true;
    document.documentElement.style.overflow = "";
    lenis?.start();
    lastFocus?.focus?.();
  }
  $$(".pv").forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(m); });
  });

  /* ---------------- BOOKING (Google Calendar appointment page) ---------------- */
  const calEl = $("#cal"), slotEls = $$("#slots button");
  const pick = { day: null, slot: "15:30" };
  const days = [];
  for (let d = new Date(), n = 0; n < 5;) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) { days.push(d); n++; }
  }
  const dow = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });
  const longDay = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" });
  calEl.innerHTML = days.map((d, i) => `<button type="button" class="day${i === 1 ? " sel" : ""}" data-i="${i}" aria-pressed="${i === 1}"><small>${esc(dow.format(d).replace(".", ""))}</small><b>${d.getDate()}</b></button>`).join("");
  pick.day = days[1];
  $("#cal-month").textContent = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" }).format(days[0]);
  $$(".day", calEl).forEach((b) => b.addEventListener("click", () => {
    $$(".day", calEl).forEach((x) => { x.classList.toggle("sel", x === b); x.setAttribute("aria-pressed", x === b); });
    pick.day = days[+b.dataset.i];
  }));
  slotEls.forEach((b) => b.addEventListener("click", () => {
    slotEls.forEach((x) => x.classList.toggle("sel", x === b));
    pick.slot = b.textContent.trim();
  }));
  const pickedText = () => `${longDay.format(pick.day)} · ${pick.slot} (${T("itTime", "ora italiana")})`;

  const bk = $("#bk");
  const openBooking = () => window.AutomaSite.openBooking();
  if (!CFG.bookingUrl) $("#book-btn span").textContent = T("calCtaAlt", "Proponi questo orario");
  else {
    // real availability comes from Google Calendar: days open the booking page, sample slots are hidden
    $("#slots").hidden = true;
    $("#book-btn span").textContent = T("calCtaLive", "Vedi gli orari disponibili");
    $$(".day", calEl).forEach((b) => b.addEventListener("click", openBooking));
  }

  /* ---------------- ROI ---------------- */
  const R = { ppl: $("#r-ppl"), hrs: $("#r-hrs"), share: $("#r-share"), cost: $("#r-cost") };
  const O = { ppl: $("#o-ppl"), hrs: $("#o-hrs"), share: $("#o-share"), cost: $("#o-cost") };
  const outH = $("#roi-hours"), outM = $("#roi-money"), f1 = $("#roi-f1"), f2 = $("#roi-f2");
  if (CUR === "aud") { R.cost.min = 25; R.cost.max = 100; R.cost.value = 45; }
  const money = { format: money0 };
  const shown = { h: 0, m: 0 };
  function calc() {
    Object.values(R).forEach((r) => r.style.setProperty("--p", `${((r.value - r.min) / (r.max - r.min)) * 100}%`));
    O.ppl.textContent = R.ppl.value; O.hrs.textContent = R.hrs.value; O.share.textContent = `${R.share.value}%`; O.cost.textContent = money0(R.cost.value);
    const hours = Math.round(R.ppl.value * R.hrs.value * (R.share.value / 100) * 4.33);
    const eur = hours * R.cost.value;
    f1.innerHTML = fill(T("roiF1", "{p} persone × {h} h a settimana × {s}% × 4,33 settimane = <b>{r} ore al mese</b>"), { p: R.ppl.value, h: R.hrs.value, s: R.share.value, r: nf.format(hours) });
    f2.innerHTML = fill(T("roiF2", "{r} ore × {c}/ora = <b>{m} al mese</b>"), { r: nf.format(hours), c: money0(R.cost.value), m: money.format(eur) });
    gsap.to(shown, { h: hours, m: eur, duration: 0.6, ease: "power3.out", onUpdate: () => { outH.textContent = nf.format(Math.round(shown.h)); outM.textContent = money.format(Math.round(shown.m)); } });
  }
  Object.values(R).forEach((r) => r.addEventListener("input", calc));
  calc();

  /* ---------------- clocks ---------------- */
  const clocks = $$(".js-clock");
  const tick = () => { const now = new Date(); clocks.forEach((el) => { el.textContent = new Intl.DateTimeFormat(LOCALE, { timeZone: el.dataset.tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now); }); };
  tick(); setInterval(tick, 20000);

  /* ---------------- PROJECTS: groups, viewer, gallery ---------------- */
  const PROJECTS = window.PROJECTS || [];
  $$(".js-pcount").forEach((el) => { el.textContent = PROJECTS.length; });
  const groupOf = (p) => p.cat;
  const GROUPS = ["all", "gestionali", "configuratori", "prodotti"];
  const GLABEL = { all: "Tutti", gestionali: "Gestionali", configuratori: "Configuratori", prodotti: "Prodotti Automa" };
  const CAT = { gestionali: "Gestionale", configuratori: "Configuratore", prodotti: "Prodotto Automa" };
  const whenLabel = (w) => w;
  const inGroup = (g) => PROJECTS.filter((p) => g === "all" || groupOf(p) === g);
  const host = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return T("_private", "progetto privato"); } };
  const media = (p, cls = "") => (p.img
    ? `<img src="assets/shots/${p.img}" srcset="assets/shots/${p.img.replace(".webp", "-800.webp")} 800w, assets/shots/${p.img} 1600w" sizes="(max-width: 860px) 85vw, 600px" alt="" loading="lazy" decoding="async" width="1600" height="900">`
    : `<div class="cover cover--${groupOf(p)} ${cls}"><span>${esc(p.title)}</span></div>`);
  const chipsHTML = (active) => GROUPS.map((g) => `<button type="button" class="fchip${g === active ? " on" : ""}" data-g="${g}" aria-pressed="${g === active}">${esc(GLABEL[g])}<small>${inGroup(g).length}</small></button>`).join("");

  // viewer — full-screen, continuous slider with auto-scrolling site previews
  const pv = $("#pv");
  const FULL = new Set(); // Copertine concettuali: nessuna simulazione di schermata scorrevole.
  const track = $("#pv-track"), stageEl = $("#pv-stage"), film = $("#pv-thumbs");
  const V = { group: "all", list: PROJECTS, i: 0, pos: 0, slides: [], step: 600, auto: !reduceMotion, scroll: null, nav: null };
  const slideHTML = (p) => {
    const name = p.img ? p.img.replace(".webp", "") : null;
    const screen = p.img
      ? `<img class="vw__base" src="assets/shots/${p.img}" alt="" decoding="async">${FULL.has(name) ? `<img class="vw__full" data-src="assets/shots/full/${name}.webp" alt="">` : ""}`
      : `<div class="vw__cover vw__cover--${groupOf(p)}"><span class="vw__mono">${esc(p.title.slice(0, 1))}</span><b>${esc(p.title)}</b><small>${esc(CAT[p.cat])}</small></div>`;
    return `<div class="vw__slide"><div class="vw__frame"><div class="vw__bar"><i></i><i></i><i></i><span>${esc(host(p.url))}</span></div><div class="vw__screen">${screen}<i class="vw__prog"><b></b></i></div></div></div>`;
  };
  const wrap = (x, n) => ((x % n) + n) % n;
  function layout() {
    const n = V.slides.length;
    V.slides.forEach((el, k) => {
      let off = k - V.pos;
      if (n > 2) off = wrap(off + n / 2, n) - n / 2;
      const a = Math.abs(off);
      const vis = a < 2.2;
      el.style.visibility = vis ? "visible" : "hidden";
      if (!vis) return;
      el.style.transform = `translate3d(${off * V.step}px,0,0) scale(${1 - Math.min(a, 1) * 0.16}) rotateY(${-off * 7}deg)`;
      el.style.opacity = String(1 - Math.min(a, 1.4) * 0.5);
      el.style.zIndex = String(100 - Math.round(a * 10));
      el.classList.toggle("is-active", a < 0.5);
    });
  }
  function measure() {
    const r = stageEl.getBoundingClientRect();
    const mobile = innerWidth < 861;
    const w = Math.min(r.width * (mobile ? 0.86 : 0.74), (r.height - (mobile ? 16 : 40)) * 1.48);
    stageEl.style.setProperty("--sw", `${w}px`);
    V.step = w * (mobile ? 0.94 : 0.9);
    layout();
  }
  function stopPreview() {
    V.scroll?.kill(); V.scroll = null;
    $$(".vw__full", track).forEach((im) => gsap.to(im, { y: 0, duration: 0.6, ease: "power2.out" }));
    $$(".vw__prog b", track).forEach((b) => gsap.set(b, { scaleY: 0 }));
  }
  function loadFull(k) {
    const el = V.slides[wrap(k, V.slides.length)];
    const im = el && $(".vw__full", el);
    if (im && !im.src) im.src = im.dataset.src;
    return im;
  }
  function startPreview() {
    stopPreview();
    const el = V.slides[V.i];
    const im = loadFull(V.i); loadFull(V.i + 1); loadFull(V.i - 1);
    if (!im || !V.auto) return;
    const go = () => {
      if (V.slides[V.i] !== el) return;
      const scr = $(".vw__screen", el), bar = $(".vw__prog b", el);
      const dist = im.offsetHeight - scr.offsetHeight;
      if (dist < 40) return;
      im.classList.add("is-on");
      V.scroll = gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 1 })
        .to(im, { y: -dist, duration: Math.max(6, dist / 110), ease: "sine.inOut" })
        .to(bar, { scaleY: 1, duration: Math.max(6, dist / 110), ease: "sine.inOut" }, "<")
        .to({}, { duration: 1.4 })
        .to([im], { y: 0, duration: 1.3, ease: "power3.inOut" })
        .to(bar, { scaleY: 0, duration: 1.3, ease: "power3.inOut" }, "<");
      if (stageEl.matches(":hover")) V.scroll.pause();
    };
    im.complete && im.naturalHeight ? go() : im.addEventListener("load", go, { once: true });
  }
  function renderInfo(animate) {
    const p = V.list[V.i];
    const fillInfo = () => {
      $("#pv-cat").textContent = `${CAT[p.cat]} · ${whenLabel(p.when)}`;
      $("#pv-title").textContent = p.title;
      $("#pv-desc").textContent = p.desc[LANG] || p.desc.it;
      $("#pv-tags").innerHTML = p.tags.map((t) => `<span>${esc(t)}</span>`).join("");
      const link = $("#pv-link");
      link.hidden = false;
      link.href = p.url || "/contatti/";
      link.textContent = p.label + (p.url ? " ↗" : " →");
      if (p.url) { link.target = "_blank"; link.rel = "noopener"; }
      else { link.removeAttribute("target"); link.removeAttribute("rel"); }
      $("#pv-play").hidden = !(p.img && FULL.has(p.img.replace(".webp", "")));
    };
    const nEl = $("#pv-n"), nTxt = String(V.i + 1).padStart(2, "0");
    $("#pv-total").textContent = `/ ${String(V.list.length).padStart(2, "0")}`;
    $$("button", film).forEach((b, k) => b.classList.toggle("on", k === V.i));
    const on = $$("button", film)[V.i];
    if (on) film.scrollTo({ left: on.offsetLeft - film.clientWidth / 2 + on.offsetWidth / 2, behavior: animate ? "smooth" : "auto" });
    if (!animate) { fillInfo(); nEl.textContent = nTxt; return; }
    gsap.timeline()
      .to([".vw__txt > *", nEl], { opacity: 0, y: -10, duration: 0.18, stagger: 0.02, ease: "power2.in" })
      .add(() => { fillInfo(); nEl.textContent = nTxt; })
      .fromTo([nEl, ".vw__txt > *"], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "expo.out" });
  }
  function goTo(target, animate = true) {
    const n = V.slides.length;
    // shortest way round
    let delta = target - V.pos;
    if (n > 2) delta = wrap(delta + n / 2, n) - n / 2;
    const end = V.pos + delta;
    V.i = wrap(Math.round(end), n);
    stopPreview();
    renderInfo(animate);
    V.nav?.kill();
    if (!animate) { V.pos = V.i; layout(); startPreview(); return; }
    V.nav = gsap.to(V, { pos: end, duration: 0.85, ease: "expo.out", onUpdate: layout, onComplete: () => { V.pos = V.i; layout(); startPreview(); } });
  }
  const vGo = (d) => goTo(Math.round(V.pos) + d);
  function vSet(group, title) {
    V.group = group; V.list = inGroup(group);
    V.i = Math.max(0, title ? V.list.findIndex((p) => p.title === title) : 0);
    V.pos = V.i;
    $("#pv-filters").innerHTML = chipsHTML(group);
    track.innerHTML = V.list.map(slideHTML).join("");
    V.slides = $$(".vw__slide", track);
    film.innerHTML = V.list.map((p, k) => `<button type="button" data-k="${k}" aria-label="${esc(p.title)}">${p.img ? `<img src="assets/shots/${p.img}" alt="" decoding="async">` : `<span class="vw__cover vw__cover--${groupOf(p)}"><b>${esc(p.title)}</b></span>`}<i></i></button>`).join("");
    measure();
    goTo(V.i, false);
  }
  function openViewer(group = "all", title) {
    pv.hidden = false;
    vSet(group, title);
    pv.hidden = true;
    openModal(pv);
    requestAnimationFrame(measure);
    gsap.fromTo(track, { opacity: 0, y: 50, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out", delay: 0.08, clearProps: "transform" });
    gsap.fromTo([".vw__top", ".vw__info", ".vw__film"], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "expo.out", delay: 0.2 });
  }
  $("#pv-prev").addEventListener("click", () => vGo(-1));
  $("#pv-next").addEventListener("click", () => vGo(1));
  film.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) goTo(+b.dataset.k); });
  $("#pv-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".fchip"); if (!b) return;
    vSet(b.dataset.g);
    gsap.fromTo(track, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out", clearProps: "transform" });
  });
  $("#pv-play").addEventListener("click", () => {
    V.auto = !V.auto;
    $("#pv-play").setAttribute("aria-pressed", V.auto);
    V.auto ? startPreview() : stopPreview();
  });
  // pause the preview while hovering (desktop) or holding (touch)
  stageEl.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") V.scroll?.pause(); });
  stageEl.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") V.scroll?.resume(); });
  // drag / swipe with the slides following the pointer
  let drag = null;
  stageEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    drag = { x: e.clientX, y: e.clientY, pos: V.pos, moved: false, id: e.pointerId };
    V.nav?.kill(); V.scroll?.pause();
  });
  stageEl.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      drag.moved = true; stageEl.setPointerCapture(drag.id); stageEl.classList.add("is-drag");
    }
    V.pos = drag.pos - dx / V.step;
    layout();
  });
  const endDrag = (e) => {
    if (!drag) return;
    const d = drag; drag = null; stageEl.classList.remove("is-drag");
    if (!d.moved) {
      V.scroll?.resume();
      // tap on a side slide goes to it
      const sl = e.target.closest?.(".vw__slide");
      if (sl && !sl.classList.contains("is-active")) goTo(V.slides.indexOf(sl));
      return;
    }
    const moved = V.pos - d.pos;
    const target = Math.abs(moved) > 0.15 ? (moved > 0 ? Math.ceil(V.pos) : Math.floor(V.pos)) : Math.round(d.pos);
    goTo(target);
  };
  stageEl.addEventListener("pointerup", endDrag);
  stageEl.addEventListener("pointercancel", endDrag);
  addEventListener("resize", () => { if (!pv.hidden) measure(); });
  addEventListener("keydown", (e) => {
    if (!pv.hidden) {
      if (e.key === "ArrowRight") vGo(1);
      if (e.key === "ArrowLeft") vGo(-1);
    }
    if (e.key === "Escape") { if (!pv.hidden) { stopPreview(); closeModal(pv); } }
  });
  pv.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) stopPreview(); });

  // hero stage opens the viewer
  const stage = $("#stage");
  stage.addEventListener("click", () => openViewer("all"));
  stage.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer("all"); } });

  // category cards
  const STORIES = [
    { g: "gestionali", img: "edilmanagement-automa.webp", k: "Gestionali su misura", big: "Il lavoro quotidiano, organizzato.", t: "EdilManagement e Il Vizietto", d: "Cantieri, documenti, biglietti e incassi: strumenti costruiti attorno ai processi delle aziende.", chips: ["Processi reali", "Dati collegati"] },
    { g: "prodotti", img: "cheai-automa.webp", k: "Prodotti Automa", big: "Dalle aziende da trovare ai clienti da seguire.", t: "Svelalo e CheAI", d: "Ricerca di aziende, conversazioni e appuntamenti: due prodotti Automa per il lavoro commerciale e la relazione con i clienti.", chips: ["Ricerca aziende", "Relazioni con i clienti"] },
  ];
  $("#stories").innerHTML = STORIES.map((s) => {
    const n = inGroup(s.g).length;
    return `<button type="button" class="story" data-g="${s.g}" data-reveal>
      <div class="vcard story__top"><span class="story__count">${n} ${esc(T("projectsWord", "progetti"))}</span><span class="story__k">${esc(s.k)}</span><span class="story__big">${esc(s.big)}</span><img class="story__img" src="assets/shots/${s.img}" alt="" loading="lazy" width="1600" height="900"></div>
      <h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>
      <div class="story__chips">${s.chips.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
      <span class="story__link">${esc(fill(T("seeN", "Vedi i {n} progetti"), { n }))} →</span>
    </button>`;
  }).join("");
  $$(".story").forEach((b) => b.addEventListener("click", () => openViewer(b.dataset.g)));
  reveal("#stories [data-reveal]");

  // full gallery
  let galGroup = "all";
  $("#gal-filters").innerHTML = chipsHTML("all");
  $("#gal").innerHTML = PROJECTS.map((p) => `<button type="button" class="gcard" data-g="${groupOf(p)}" data-title="${esc(p.title)}"><div class="gcard__img">${media(p)}</div><b>${esc(p.title)}</b><small>${esc(CAT[p.cat])}</small></button>`).join("");
  $("#gal-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".fchip"); if (!b) return;
    galGroup = b.dataset.g;
    $$("#gal-filters .fchip").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    const shown = $$(".gcard").filter((c) => { const on = galGroup === "all" || c.dataset.g === galGroup; c.hidden = !on; return on; });
    gsap.fromTo(shown, { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.025, duration: 0.4 });
    ScrollTrigger.refresh();
  });
  $("#gal").addEventListener("click", (e) => { const c = e.target.closest(".gcard"); if (c) openViewer(galGroup, c.dataset.title); });
  gsap.fromTo(".gcard", { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, stagger: 0.03, duration: 0.8, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: "#gal", start: "top 88%" } });

  /* ---------------- feedback (real only; placeholders on localhost) ---------------- */
  const isDev = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const realQ = (window.TESTIMONIALS || []).filter((t) => !t.placeholder);
  const quotes = realQ.length ? realQ : isDev ? window.TESTIMONIALS || [] : [];
  if (quotes.length) {
    $("#feedback").hidden = false;
    $("#quotes").innerHTML = quotes.map((t) => `
      <figure class="quote${t.placeholder ? " quote--todo" : ""}">
        ${t.placeholder ? `<span class="quote__todo mono">${T("_todo", "da compilare")}</span>` : ""}
        <blockquote>“${esc(t.quote[LANG] || t.quote.it)}”</blockquote>
        <figcaption><b>${esc(t.name)}</b><span>${esc(t.role[LANG] || t.role.it)}</span></figcaption>
      </figure>`).join("");
  }

  /* ---------------- FAQ ---------------- */
  const qas = $$(".qa");
  qas.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) qas.forEach((o) => { if (o !== d) o.open = false; });
    setTimeout(() => ScrollTrigger.refresh(), 450);
  }));
  // FAQ structured data is delivered in the HTML, also to crawlers without JavaScript.

  /* ---------------- PREMIUM MOTION ---------------- */
  // scroll progress bar
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  // extra reveals for supporting copy
  reveal(".ba__head .lead, .cases .tag, .gal__head, .cases__note, .faq .lead, .qa, .cta .lead");

  // lime band opens from a rounded card to full bleed; integrations card grows in
  gsap.fromTo(".integ", { scale: 0.9, borderRadius: 48 }, { scale: 1, borderRadius: 30, ease: "none", scrollTrigger: { trigger: ".integ", start: "top 95%", end: "top 45%", scrub: true } });

  // hero chips drift at different speeds (yPercent, so the idle bobbing on y keeps working)
  $$(".float").forEach((f, i) => gsap.to(f, { yPercent: [-90, -40, -130, -60][i] || -60, ease: "none", scrollTrigger: { trigger: ".shot", start: "top 70%", end: "bottom top", scrub: true } }));

  // experience: timeline line fills as you read
  const xp = $(".xp");
  if (xp) {
    const fillEl = document.createElement("i");
    fillEl.className = "xp__fill";
    xp.prepend(fillEl);
    gsap.to(fillEl, { scaleY: 1, ease: "none", scrollTrigger: { trigger: xp, start: "top 70%", end: "bottom 60%", scrub: true } });
  }

  // footer wordmark rises letter by letter
  const word = $(".footer__word");
  if (word) {
    word.innerHTML = [...word.textContent].map((c) => `<span style="display:inline-block">${esc(c)}</span>`).join("");
    gsap.fromTo($$("span", word), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 1, ease: "expo.out", scrollTrigger: { trigger: word, start: "top 98%" } });
  }

  // mobile-only: nav auto-hide, stacked sticky cards, swipe carousels
  mm.add("(max-width: 860px)", () => {
    const navEl = $("#nav");
    const navST = ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (st) => navEl.classList.toggle("is-hidden", st.direction === 1 && st.scroll() > 500 && pv.hidden && bk.hidden && $(".menu-toggle")?.getAttribute("aria-expanded") !== "true"),
    });

    // stacks: the card underneath shrinks and dims while the next one slides over it
    const stack = (cards) => cards.slice(0, -1).map((c, k) => gsap.to(c, {
      scale: 0.9, opacity: 0.55, ease: "none",
      scrollTrigger: { trigger: cards[k + 1], start: "top 92%", end: "top 30%", scrub: true },
    }));
    const tweens = stack([$("#ba-before"), $("#ba-after")]);

    return () => { navST.kill(); navEl.classList.remove("is-hidden"); tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); gsap.set([$("#ba-before")], { clearProps: "scale,opacity,transform" }); };
  });

  // carousels: progress bar + counter, neighbours shrink (no auto-scroll: they move only when the user swipes)
  $$(".snap").forEach((track) => {
    const two = track.classList.contains("snap--2");
    const bar = document.createElement("div");
    bar.className = "snapbar";
    bar.innerHTML = `<span class="snapbar__track"><i></i></span><span class="snapbar__n mono"></span>`;
    track.after(bar);
    const fillI = $("i", bar), num = $(".snapbar__n", bar);
    let raf = 0;
    const update = () => {
      raf = 0;
      if (getComputedStyle(track).overflowX !== "auto") return; // desktop: plain grid
      const items = [...track.children].filter((c) => !c.hidden);
      const max = track.scrollWidth - track.clientWidth;
      const pr = max > 0 ? track.scrollLeft / max : 1;
      const visible = track.clientWidth / (track.scrollWidth || 1);
      fillI.style.transform = `translateX(${pr * (1 - visible) * 100}%) scaleX(${Math.max(visible, 0.08)})`;
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const edge = track.getBoundingClientRect().left + pad, atEnd = track.scrollLeft >= max - 2;
      let best = 0, bestD = Infinity;
      items.forEach((c, k) => {
        const d = atEnd && k === items.length - 1 ? 0 : Math.abs(c.getBoundingClientRect().left - edge);
        if (d < bestD) { bestD = d; best = k; }
        if (!two) {
          const t = Math.min(1, d / c.offsetWidth);
          c.style.setProperty("--s", (1 - t * 0.07).toFixed(3));
          c.style.setProperty("--o", (1 - t * 0.35).toFixed(3));
        }
      });
      num.textContent = two ? `${Math.round(pr * 100)}%` : `${best + 1} / ${items.length}`;
      if (two) num.textContent = `${Math.min(items.length, Math.round(pr * Math.max(0, items.length - 4)) + 4)} / ${items.length}`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    track.addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    new MutationObserver(queue).observe(track, { attributes: true, subtree: true, attributeFilter: ["hidden"] });
    update();
  });

  /* ---------------- PREMIUM PASS ---------------- */
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // pointer spotlight that follows the cursor across cards
  if (fine && !reduceMotion) {
    $$(".member, .story, .prod, .team__stats").forEach((c) => {
      const g = document.createElement("span");
      g.className = "spot" + (c.matches(".prod, .team__stats") ? " spot--dark" : "");
      c.classList.add("has-spot");
      c.appendChild(g);
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${e.clientX - r.left}px`);
        c.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
    // magnetic primary buttons
    $$(".hero__ctas .btn, .btn--lime, .nav .btn--dark, .prod__ctas .btn, .cta .btn--dark").forEach((b) => {
      const xTo = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const yTo = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  if (!reduceMotion) {
    // team: the photo uncovers from the bottom, then drifts gently with the scroll
    $$(".member").forEach((m, k) => {
      const img = $(".member__photo img", m);
      gsap.fromTo(img, { clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 }, {
        clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.4, delay: (k % 3) * 0.12, ease: "expo.out", clearProps: "transform,clipPath",
        scrollTrigger: { trigger: m, start: "top 85%", once: true },
      });
      gsap.fromTo(img, { "--py": "18px" }, { "--py": "-6px", ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.from($$(".member__chips span", m), { opacity: 0, y: 10, scale: 0.9, stagger: 0.06, duration: 0.6, ease: "back.out(2)", scrollTrigger: { trigger: m, start: "top 70%", once: true } });
    });

    // CheAI: a tiny live conversation (question → typing → answer), then the stat pops
    const chat = $(".prod__visual");
    if (chat) {
      const qIn = $(".prod__bubble--in", chat), qOut = $(".prod__bubble--out", chat), stat = $(".prod__stat", chat);
      const typing = document.createElement("span");
      typing.className = "prod__typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      chat.appendChild(typing);
      gsap.set(qIn, { opacity: 0, scale: 0.6, y: 14, transformOrigin: "0% 100%" });
      gsap.set(qOut, { opacity: 0, scale: 0.6, y: 14, transformOrigin: "100% 100%" });
      gsap.set(stat, { opacity: 0, scale: 0.5, rotate: -8 });
      gsap.timeline({ scrollTrigger: { trigger: chat, start: "top 70%", once: true }, defaults: { ease: "back.out(1.8)" } })
        .from($(".prod__win", chat), { y: 40, rotate: 6, opacity: 0, duration: 1.1, ease: "expo.out" })
        .to(qIn, { opacity: 1, scale: 1, y: 0, duration: 0.6 }, 0.5)
        .to(typing, { opacity: 1, duration: 0.25, ease: "none" }, 1.2)
        .to(typing, { opacity: 0, duration: 0.2, ease: "none" }, 2.4)
        .to(qOut, { opacity: 1, scale: 1, y: 0, duration: 0.6 }, 2.45)
        .to(stat, { opacity: 1, scale: 1, rotate: 0, duration: 0.7 }, 2.9);
      gsap.from($$(".prod__channels img"), { opacity: 0, y: 12, scale: 0.6, stagger: 0.07, duration: 0.6, ease: "back.out(2.5)", scrollTrigger: { trigger: ".prod__channels", start: "top 92%", once: true } });
      gsap.from($$(".prod__feats li"), { opacity: 0, x: -16, stagger: 0.1, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: ".prod__feats", start: "top 88%", once: true } });
    }

    // the robot says hi on load
    gsap.from(".nav .brand__mark", { rotate: -25, scale: 0.4, opacity: 0, duration: 1, ease: "back.out(2.4)", delay: 0.2, transformOrigin: "50% 80%" });
  }

  // mobile CTA dock: shows after the hero, steps aside near the contact form and while a modal is open
  const dock = $(".dock");
  if (dock) {
    const contact = $("#contatti"), heroEl = $(".hero");
    const tick = () => {
      const past = scrollY > heroEl.offsetHeight * 0.7;
      const nearEnd = contact.getBoundingClientRect().top < innerHeight * 0.9;
      const typing = document.activeElement?.matches('input, textarea, select');
      const show = past && !nearEnd && pv.hidden && bk.hidden && !typing;
      dock.classList.toggle("is-on", show);
      dock.inert = !show;
    };
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick, { passive: true });
    document.addEventListener("focusin", tick);
    document.addEventListener("focusout", () => requestAnimationFrame(tick));
    tick();
    [pv, bk].forEach((m) => new MutationObserver(tick).observe(m, { attributes: true, attributeFilter: ["hidden"] }));
  }

  /* ---------------- counters (created last, after every section is rendered) ---------------- */
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "", o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
  });
  if (reduceMotion) {
    // Complete existing reveals once, then leave a readable static layout.
    gsap.globalTimeline.getChildren(true, true, true).forEach((animation) => {
      if (animation.repeat() !== -1) animation.totalProgress(1);
      animation.kill();
    });
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.set("[data-reveal], .w > span, .lead, .hero__sub, .hero__ctas, .assure, .shot, .stage, .win, .bacard, .how__pane, .utext, .footer__word span", { clearProps: "transform,opacity,visibility,clipPath" });
    $$("[data-count]").forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
  }
  ScrollTrigger.refresh();

  addEventListener("load", () => {
    ScrollTrigger.refresh();
    const anchor = location.hash && document.getElementById(location.hash.slice(1));
    if (anchor) scrollToY(anchor, { immediate: true, offset: -90 });
    else if (restoreY) scrollToY(restoreY, { immediate: true });
  });
})();
