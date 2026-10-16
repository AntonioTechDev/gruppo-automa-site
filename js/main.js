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
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = new Intl.NumberFormat(LOCALE);
  const CFG = window.ANTIPODE_CONFIG || {};
  // Australia sees AUD, Italy sees EUR
  const CUR = LANG === "en" ? "aud" : "eur";
  const group = (n, sep) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep); // always group, also 4-digit numbers
  const money0 = (n) => (CUR === "aud" ? `A$${group(n, ",")}` : `${group(n, ".")} €`);
  const PRICES = (CFG.prices || {})[CUR] || {};
  $$("[data-price]").forEach((el) => { const v = PRICES[el.dataset.price]; if (v != null) el.textContent = money0(v); });
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
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
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

  gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.05 })
    .fromTo(".hero__title .w > span", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.045 })
    .fromTo([".hero .proof-pill", ".hero__sub", ".hero__ctas", ".assure"], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.25)
    .fromTo(".shot", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2 }, 0.5);

  $$("main section:not(.hero) [data-split]").forEach((h) => {
    const words = $$(".w > span", h);
    gsap.set(words, { yPercent: 110 });
    ScrollTrigger.create({ trigger: h, start: "top 86%", once: true, onEnter: () => gsap.to(words, { yPercent: 0, duration: 1, stagger: 0.035, ease: "power4.out" }) });
  });

  // reveal: rise + a touch of scale, long expo ease; transforms are cleared afterwards so tap feedback works
  const reveal = (sel, start = "top 90%") => {
    const els = typeof sel === "string" ? $$(sel) : sel;
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 46, scale: 0.97 });
    ScrollTrigger.batch(els, { start, once: true, onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 1.15, stagger: 0.09, ease: "expo.out", clearProps: "transform" }) });
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

    const panes = $$(".how__pane"), steps = $$(".how__steps li");
    gsap.set(panes, { autoAlpha: 0 });
    gsap.set(panes[0], { autoAlpha: 1 });
    let hi = 0, swap = null;
    const showPane = (i) => {
      const dir = i > hi ? 1 : -1, from = panes[hi], to = panes[i];
      hi = i;
      swap?.progress(1).kill();
      panes.forEach((p, k) => p.classList.toggle("is-active", k === i));
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      swap = gsap.timeline()
        .to(from, { autoAlpha: 0, y: -16 * dir, duration: 0.22, ease: "power2.in" })
        .fromTo(to, { autoAlpha: 0, y: 22 * dir }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" })
        .fromTo($$(".ui > *", to), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }, "<0.05");
    };
    ScrollTrigger.create({
      trigger: "#how-pin", start: "top top", end: "bottom bottom",
      onUpdate: (st) => {
        const i = Math.min(panes.length - 1, Math.floor(st.progress * panes.length));
        if (i !== hi) showPane(i);
      },
    });
  });
  mm.add("(max-width: 860px)", () => {
    ScrollTrigger.create({ trigger: "#ba-after", start: "top 70%", once: true, onEnter: () => gsap.to(scribble, { strokeDashoffset: 0, duration: 1, ease: "power2.out" }) });
    // all panes visible on mobile: animate each timeline when it enters
    $$(".how__pane").forEach((p) => {
      p.classList.remove("is-active");
      ScrollTrigger.create({ trigger: p, start: "top 80%", once: true, onEnter: () => p.classList.add("is-active") });
    });
  });

  // SERVICES: pinned lime band — one screen leaves, the next arrives, its items build in order
  const utexts = $$(".utext"), screens = $$(".scr"), dashes = $$(".dashes i");
  const pLabel = $("#phone-label"), pCount = $("#phone-count"), pBar = $("#phone-bar");
  const labels = [T("u1L", "Consulenza e strategia AI"), T("u2L", "Software e web app su misura"), T("u3L", "Automazioni e agenti AI"), T("u4L", "Siti e landing che vendono")];
  gsap.set([...screens, ...utexts], { autoAlpha: 0 });
  gsap.set([screens[0], utexts[0]], { autoAlpha: 1 });
  let ui = 0, uswap = null;
  const buildScreen = (scr) => {
    const items = $$("[data-a]", scr);
    const lock = scr.classList.contains("scr--lock");
    return gsap.fromTo(items, { autoAlpha: 0, y: 14, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", stagger: lock ? 0.32 : 0.06 });
  };
  ScrollTrigger.create({ trigger: "#uses-pin", start: "top 60%", once: true, onEnter: () => buildScreen(screens[0]) });
  ScrollTrigger.create({
    trigger: "#uses-pin", start: "top top", end: "bottom bottom",
    onUpdate: (st) => {
      const n = utexts.length, f = st.progress * n;
      const i = Math.min(n - 1, Math.floor(f));
      pBar.style.width = `${Math.min(1, f - i) * 100}%`;
      if (i === ui) return;
      const dir = i > ui ? 1 : -1, prevS = screens[ui], prevT = utexts[ui];
      ui = i;
      uswap?.progress(1).kill();
      screens.forEach((s, k) => s.classList.toggle("is-active", k === i));
      utexts.forEach((t, k) => t.classList.toggle("is-active", k === i));
      dashes.forEach((d, k) => d.classList.toggle("on", k === i));
      pLabel.textContent = labels[i];
      pCount.textContent = `${i + 1}/${n}`;
      gsap.set($$("[data-a]", screens[i]), { autoAlpha: 0 });
      uswap = gsap.timeline()
        .to([prevS, prevT], { autoAlpha: 0, y: -18 * dir, duration: 0.22, ease: "power2.in" })
        .set(prevS, { y: 0 })
        .fromTo(utexts[i], { autoAlpha: 0, y: 26 * dir }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" })
        .fromTo(screens[i], { autoAlpha: 0, y: 18 * dir }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, "<")
        .add(buildScreen(screens[i]), "<0.1");
    },
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
  $$(".pv, .bk").forEach((m) => {
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

  const bk = $("#bk"), bkBody = $("#bk-body");
  function openBooking() {
    const u = new URL(CFG.bookingUrl);
    if (u.hostname.endsWith("google.com")) u.searchParams.set("gv", "true");
    bkBody.innerHTML = `<iframe src="${esc(u.toString())}" title="${esc(T("bkTitle", "Prenota una call di 30 minuti"))}" loading="lazy"></iframe>`;
    openModal(bk);
  }
  $$("[data-book]").forEach((b) => b.addEventListener("click", (e) => {
    if (CFG.bookingUrl) { e.preventDefault(); openBooking(); return; }
    if (b.id === "book-btn") {
      // no booking page configured yet: propose the chosen slot through the contact form
      e.preventDefault();
      const ta = $('#cform textarea[name="messaggio"]');
      ta.value = fill(T("bkPrefill", "Vorrei prenotare una call conoscitiva: {when}."), { when: pickedText() });
      scrollToY($("#contatti"), { offset: -60, duration: 1.4 });
      setTimeout(() => $('#cform input[name="nome"]').focus({ preventScroll: true }), 1500);
    }
  }));
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
  const groupOf = (p) => (p.cat === "business" ? "web" : "corp");
  const GROUPS = ["all", "web", "corp"];
  const GLABEL = { all: "Tutti", web: "Siti ed e-commerce", corp: "Portali enterprise e PA" };
  const CAT = { pa: "Pubblica Amministrazione", enterprise: "Enterprise", business: "Sito aziendale", product: "Prodotto" };
  const whenLabel = (w) => w;
  const inGroup = (g) => PROJECTS.filter((p) => g === "all" || groupOf(p) === g);
  const host = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return T("_private", "progetto privato"); } };
  const media = (p, cls = "") => (p.img
    ? `<img src="assets/shots/${p.img}" alt="" loading="lazy" decoding="async" width="1200" height="750">`
    : `<div class="cover cover--${groupOf(p)} ${cls}"><span>${esc(p.title)}</span></div>`);
  const chipsHTML = (active) => GROUPS.map((g) => `<button type="button" class="fchip${g === active ? " on" : ""}" data-g="${g}" aria-pressed="${g === active}">${esc(GLABEL[g])}<small>${inGroup(g).length}</small></button>`).join("");

  // viewer — full-screen, continuous slider with auto-scrolling site previews
  const pv = $("#pv");
  const FULL = new Set(["adm", "agenzia-entrate", "armeria", "axa-lamiasalute", "casillo", "cheai", "dema", "demanio", "federalismo-fiscale", "finanze", "geoportale", "giustizia-tributaria", "mase", "meacasa", "mef", "miroma", "muoio", "repubblica-digitale", "scame", "scame-emobility", "sella", "setterre", "unar"]);
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
      link.hidden = !p.url;
      if (p.url) link.href = p.url;
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
    if (e.key === "Escape") { if (!pv.hidden) { stopPreview(); closeModal(pv); } if (!bk.hidden) closeModal(bk); }
  });
  pv.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) stopPreview(); });

  // hero stage opens the viewer
  const stage = $("#stage");
  stage.addEventListener("click", () => openViewer("all"));
  stage.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer("all"); } });

  // category cards
  const STORIES = [
    { g: "web", img: "muoio.webp", k: "Siti ed e-commerce", big: "Siti che fanno lavorare le aziende del territorio.", t: "Brand site, cataloghi ed e-commerce", d: "Da Muoio Project Shoes a Mea Casa e Armeria Piccolo: siti veloci, curati nel design e pensati per portare contatti e vendite.", chips: ["Design su misura", "E-commerce"] },
    { g: "corp", img: "agenzia-entrate.webp", k: "Portali enterprise e PA", big: "Portali usati da milioni di persone.", t: "Agenzia delle Entrate, Banca Sella, Scame", d: "Interfacce accessibili secondo le WCAG 2.1 AA e componenti su misura per enti pubblici, banche e industria.", chips: ["WCAG 2.1 AA", "Enterprise"] },
  ];
  $("#stories").innerHTML = STORIES.map((s) => {
    const n = inGroup(s.g).length;
    return `<button type="button" class="story" data-g="${s.g}" data-reveal>
      <div class="vcard story__top"><span class="story__count">${n} ${esc(T("projectsWord", "progetti"))}</span><span class="story__k">${esc(s.k)}</span><span class="story__big">${esc(s.big)}</span><img class="story__img" src="assets/shots/${s.img}" alt="" loading="lazy" width="1200" height="750"></div>
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
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qas.map((d) => ({ "@type": "Question", name: $("summary span", d).textContent.trim(), acceptedAnswer: { "@type": "Answer", text: $(".qa__a", d).textContent.trim() } })) });
  document.head.appendChild(ld);

  /* ---------------- contact form ---------------- */
  const form = $("#cform"), msg = $("#cform-msg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const nome = (d.get("nome") || "").trim(), email = (d.get("email") || "").trim(), testo = (d.get("messaggio") || "").trim();
    if (!nome || !/^\S+@\S+\.\S+$/.test(email) || !testo) {
      msg.textContent = T("_formErr");
      gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, .3)" });
      return;
    }
    const azienda = (d.get("azienda") || "").trim();
    const tipi = d.getAll("tipo").join(", ") || T("_tbd");
    const budget = d.get("budget") || T("_tbd");
    const body = `${T("_mailHello")}\n\n${testo}\n\n${T("_mailNeed")}: ${tipi}\n${T("_budget")}: ${budget}\n\n${nome}${azienda ? " · " + azienda : ""}\n${email}`;
    location.href = `mailto:info@gruppoautoma.it?subject=${encodeURIComponent(T("_mailSubject") + " — " + (azienda || nome))}&body=${encodeURIComponent(body)}`;
    msg.textContent = T("_formOk");
  });

  /* ---------------- PREMIUM MOTION ---------------- */
  // scroll progress bar
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  // extra reveals for supporting copy
  reveal(".ba__head .lead, .uses__head .lead, .price__head .lead, .cases .tag, .gal__head, .recur > div, .price__note, .cases__note, .faq .lead, .qa, .cta .lead");

  // lime band opens from a rounded card to full bleed; integrations card grows in
  gsap.fromTo(".uses__sticky", { clipPath: "inset(2.5% 3.5% round 40px)" }, { clipPath: "inset(0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: "#uses-pin", start: "top 90%", end: "top top", scrub: true } });
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
      onUpdate: (st) => navEl.classList.toggle("is-hidden", st.direction === 1 && st.scroll() > 500 && pv.hidden && bk.hidden),
    });

    // stacks: the card underneath shrinks and dims while the next one slides over it
    const stack = (cards) => cards.slice(0, -1).map((c, k) => gsap.to(c, {
      scale: 0.9, opacity: 0.55, ease: "none",
      scrollTrigger: { trigger: cards[k + 1], start: "top 92%", end: "top 30%", scrub: true },
    }));
    const tweens = [...stack([$("#ba-before"), $("#ba-after")]), ...stack($$(".how__pane"))];

    return () => { navST.kill(); navEl.classList.remove("is-hidden"); tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); gsap.set([$("#ba-before"), ...$$(".how__pane")], { clearProps: "scale,opacity,transform" }); };
  });

  // carousels: progress bar + counter, neighbours shrink, a one-time swipe nudge
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
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      items.forEach((c, k) => {
        const cMid = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cMid - mid);
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
    ScrollTrigger.create({
      trigger: track, start: "top 75%", once: true,
      onEnter: () => {
        if (getComputedStyle(track).overflowX !== "auto" || reduceMotion) return;
        setTimeout(() => track.scrollBy({ left: 70, behavior: "smooth" }), 500);
        setTimeout(() => track.scrollBy({ left: -70, behavior: "smooth" }), 1100);
      },
    });
  });

  /* ---------------- counters (created last, after every section is rendered) ---------------- */
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "", o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
  });
  ScrollTrigger.refresh();

  addEventListener("load", () => {
    ScrollTrigger.refresh();
    if (restoreY) scrollToY(restoreY, { immediate: true });
  });
})();
