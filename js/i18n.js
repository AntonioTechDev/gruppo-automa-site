/* IT/EN switch.
   The Italian copy lives in the HTML (default, indexable). English replaces it at load time.
   Elements: data-i18n → innerHTML, data-i18n-aria → aria-label, data-i18n-alt → alt.
   Language: ?lang= → saved choice → browser language. Switching reloads the page
   (keeps the scroll position) so every animation is rebuilt on the new text. */
(function () {
  var KEY = "automa-lang";

  var EN = {
    skip: "Skip to content",
    brandLabel: "Antipode, back to top",
    navLabel: "Sections", navServices: "Services", navHow: "How we work", navCases: "Case studies",
    navCta: "Book a call",

    heroPill: "AI consulting &amp; software development · Townsville &amp; Aversa",
    heroTitle: "Software, AI and automation <span class=\"grad\">built around</span> your business.",
    heroSub: "We help you see where technology can grow your business, then we design and build web apps, automations and AI agents. From idea to launch, with one team.",
    heroCta: "Book a 30-minute call", heroCta2: "See our work",
    assure1: "Written quote before we start", assure2: "Code and accounts in your name", assure3: "One point of contact, from idea to launch",
    f1: "AI consulting", f2: "Custom web apps", f3: "Automation", f4: "AI agents",
    s1: "enterprise portals", s2: "years of development",
    shotNote: "Some of the projects we've worked on",
    logosLabel: "Our team has worked on projects for",

    baTitle: "Your project: before and after Antipode.",
    baLead: "Fewer suppliers to juggle, less repetitive work, more time to grow the business.",
    baBeforeK: "Without a tech partner", baBeforeT: "Stalled ideas,<br>lost hours",
    baBeforeL: "<li>No idea where to start with AI</li><li>Five suppliers, nobody in charge</li><li>Hours of repetitive work every week</li><li>Tools that don't talk to each other</li>",
    baAfterK: "With Antipode", baAfterT: "One partner,<br>idea to launch",
    baAfterL: "<li>A clear roadmap with priorities and costs</li><li>One contact for strategy and build</li><li>Custom automated processes</li><li>Connected tools, tidy data</li>",
    baCta: "Let's talk about your project",

    usesTitle: "What we build for you.",
    usesLead: "Four services, one team. Pick where to start, we'll handle the rest.",
    u1T: "AI consulting &amp; strategy",
    u1D: "We look at your processes, data and tools and tell you where AI really saves money. You get a roadmap with priorities, costs and expected return.",
    u2T: "Custom software &amp; web apps",
    u2D: "Back-office tools, client portals, dashboards and SaaS designed around the way you work. From MVP to production.",
    u3T: "Automation &amp; AI agents",
    u3D: "We connect email, CRM, spreadsheets and back office with n8n workflows and AI agents. They do the repetitive work, your team handles the rest.",
    u4T: "Websites &amp; landing pages that sell",
    u4D: "Fast, accessible, built to rank on Google and turn visits into leads. Already connected to your tools.",
    usesCta: "Let's talk it through",
    u1L: "AI consulting &amp; strategy", u2L: "Custom software &amp; web apps", u3L: "Automation &amp; AI agents", u4L: "Websites that sell",
    r0: "AI audit · your business", r1: "3-phase roadmap",
    r2: "Customer replies", r3: "−60% time · 2 weeks", r4: "Automatic quotes", r5: "−8 hours/week · 4 weeks", r6: "Monthly reports", r7: "from 1 day to 10 minutes",
    a1: "Orders", a2: "Customers", a3: "Shipped", a4: "In progress",
    w0: "Automated workflow", w1: "New enquiry", w2: "email or website form", w3: "AI reads and sorts it", w4: "and drafts the reply",
    w5: "CRM updated", w6: "contact and quote", w7: "Team notified", w8: "only when needed",
    ws1: "Your product, explained well.", ws2: "Get a quote", ws3: "Accessibility", ws4: "Leads from the site",

    howTag: "How we work",
    howTitle: "Working with us is <span class=\"grad\">simpler</span> than you think.",
    howLead: "No endless projects, no jargon. Three phases, one contact person, results you can measure.",
    how1S: "Analysis &amp; consulting", how2S: "Design &amp; build", how3S: "Launch &amp; growth",
    calTitle: "Intro call",
    how1T: "Analysis &amp; consulting",
    how1D: "In a 30-minute call we learn your goals, processes and tools. Then you get a written quote with costs, timeline and expected results.",
    d1: "Design &amp; prototype", d2: "Frontend development", d3: "Backend &amp; database", d4: "AI &amp; automation",
    how2T: "Design &amp; build",
    how2D: "We design, build and test in stages. You see progress every week, not just at the end.",
    upd0: "Project update",
    updList: "<li>✓ Version 1.0 live</li><li>✓ All tests passed</li><li>✓ Team training done</li><li>→ Next step: automated reports</li>",
    how3T: "Launch &amp; growth",
    how3D: "We go live, train your team and measure results. Then we keep improving, if you want.",

    integK: "Technology &amp; integrations",
    integT: "We work with the best tools. And with the ones you already use.",
    integMore: "… and any tool with an API",

    roiTag: "Estimate your savings",
    roiTitle: "What is <span class=\"grad\">automating</span> repetitive work worth?",
    roiQ1: "People doing repetitive work", roiQ2: "Hours per week each", roiQ3: "Share that can be automated", roiQ4: "Average hourly cost",
    roiHours: "hours freed up per month", roiMoney: "operating cost per month",
    roiNote: "Rough estimate. On the call we redo it on your real processes.",
    roiCta: "Let's check your numbers",

    casesTag: "Case studies", casesTitle: "Real projects, not mockups.",
    moreBtn: "See all projects",
    casesNote: "The government and enterprise portals were built by our founder as a Senior Frontend Engineer at SMC, working in project teams.",
    st1k: "Startup · 2026", st1b: "4 channels. One AI assistant.", st1t: "CHEAI: AI customer service",
    st1d: "The platform we co-founded: CRM, campaigns and an assistant that replies on WhatsApp, Instagram, TikTok and Messenger.",
    st1c1: "LLM agents + RAG", st1c2: "Co-founded by us",
    st2k: "Public sector", st2b: "15+ portals. Zero barriers.", st2t: "Portals used by millions of citizens",
    st2d: "Italy's Revenue Agency, Ministry of Finance, Customs, UNAR and more: WCAG 2.1 AA accessible interfaces, migrations and custom components.",
    st3k: "Enterprise · E-commerce", st3b: "Banking, industry, e-commerce.", st3t: "Websites for companies selling worldwide",
    st3d: "Scame, Banca Sella, AXA: multilingual product sites and customer portals, fast and integrated with company systems.",
    st3c1: "Multilingual", st3c2: "Performance", visit: "Visit the site",

    founderQuote: "“The right technology isn't the most complicated one. It's the one that makes you work better from day one.”",
    founderRole: "Founder of Antipode · co-founder of CHEAI",
    founderBio: "Six years of software development, more than fifteen enterprise portals for government, healthcare and banking, and an AI customer service platform. Townsville and Aversa are eight hours apart: when you close the office, we're still working on your project.",
    st1: "years of development", st2: "enterprise portals", st3: "offices, two time zones",

    faqTitle: "The questions we get asked most.",
    faqLead: "Can't find yours? Write to us: a person will answer, not a bot.",
    q1: "How much does a project cost?",
    a1: "It depends on what you need: a consultation, an automation and a custom platform are different jobs. After the call you get a written quote with costs, timeline and what's included, before any work starts.",
    q2: "How long does it take?",
    a2: "A consultation or a simple automation takes a few weeks, a web app a few months. We split the work into stages, so you start using the software before the end.",
    q3: "Do you work on existing software too?",
    a3: "Yes. We can start with an audit of what you have, improve it, connect it to new tools or migrate it. No need to start from scratch.",
    q4: "Is AI safe for my company's data?",
    a4: "We only use the data you choose and handle it under the GDPR. Before we start, we explain which services we use, where the data goes and how it's protected.",
    q5: "Who owns the code, accounts and data?",
    a5: "You do. Domains, accounts and services are in your name, and on delivery you get the code and credentials. If you ever want to switch provider, you don't need anyone's permission.",
    q6: "Do you work remotely? How does it work?",
    a6: "Yes, with clients in Italy, Australia and elsewhere. Calls in English or Italian, weekly updates and a single point of contact who knows your project.",

    ctaPill: "We reply personally, within one working day",
    ctaTitle: "Got an idea or a process to improve? <span class=\"grad\">Let's talk.</span>",
    ctaLead: "Tell us in a couple of lines what you need. We'll reply with a few questions and a call proposal.",
    fName: "Name", fCompany: "Company (optional)", fBudget: "Rough budget", bud0: "Not sure yet",
    fNeed: "I'm interested in", fT1: "AI consulting", fT2: "Software / web app", fT3: "Automation &amp; AI agents", fT4: "Website / landing page",
    fMsg: "What do you need?", fSend: "Send request",
    fLegal: "The form opens your email app with the message ready: this site stores nothing. Read our <a href=\"privacy.html\">privacy policy</a>.",

    footTag: "AI consulting and custom software development, between Townsville and Aversa.",
    aboutLink: "About us", footContact: "Contact", italy: "Italy", vat: "VAT no.", legalLabel: "Legal",
    catPa: "Public sector", catEnt: "Healthcare &amp; Enterprise", catBiz: "Business &amp; E-commerce", catProd: "Startups &amp; products",


    /* v8 */
    wsv1: "Cleaning", wsv2: "Whitening", wsv3: "Implants", wa10: "#1039 · 2 items",
    aboutLink: "About us",
    stageLabel: "Browse all projects", stageCta: "Browse all projects",
    r0: "Antipode · AI audit", r1: "Your Company Ltd", r2: "High AI potential", r3: "12 processes analysed", r4: "up to 27 h/week",
    r5: "Priority opportunities", r6: "Customer replies", r7: "−14 h a week", r8: "Quotes from Excel", r9: "−8 h a week",
    r10: "CRM updates", r11: "−5 h a week", r12: "Full roadmap · PDF", hi: "High", md: "Medium",
    wa0: "Good morning,", wa1: "Revenue this month", wa2: "Orders", wa3: "Customers", wa4: "Inventory",
    wa5: "#1042 · 3 items", wa6: "Shipped", wa7: "#1041 · 1 item", wa8: "In progress", wa9: "#1040 · 5 items",
    lk0: "Tuesday 14 October", now: "now", lk1: "New quote request from Bianchi Ltd", lk2: "Antipode automation",
    lk3: "Quote #214 prepared and sent in 38 seconds ⚡", lk4: "Contact and deal updated · €4,800", lk5: "#sales · new deal assigned to Marco",
    ws0: "Dental clinic · Townsville", ws1: "The smile you want, without the wait.", ws2: "Book a visit", ws3: "4.9 on Google",
    ws4: "Accessibility", ws5: "New lead from the website", ws6: "Laura M. · visit request",
    how1S: "Intro call", how2S: "Design &amp; build", how3S: "Handover &amp; growth",
    calTitle: "Intro call · 30 min", calSub: "Google Meet · English or Italian", calDays: "Pick a day", calSlots: "Pick a time",
    calCta: "Book this call",
    how1T: "Intro call",
    how1D: "Pick a day and time: in 30 minutes we learn your goals, processes and tools. Then you get a written quote with costs, timeline and expected results.",
    tlK: "Example: a mid-size web app",
    tl1: "Workshop &amp; requirements", tl1w: "Week 1", tl2: "UX/UI &amp; clickable prototype", tl2w: "Weeks 2–3 · you approve it",
    tl3: "Frontend development", tl3w: "Weeks 3–6 · React, Next.js", tl4: "Backend, database &amp; integrations", tl4w: "Weeks 4–7",
    tl5: "AI &amp; automation", tl5w: "Weeks 6–8", tl6: "Testing, sign-off &amp; release", tl6w: "Week 8",
    how2T: "Design &amp; build",
    how2D: "We work in stages and show you progress every week. You approve the design before a single line of code is written.",
    dlK: "On handover you get",
    dlList: "<li>The software live, on your domain</li><li>Code, accounts and access in your name</li><li>Training for your team</li><li>Documentation and user guide</li>",
    afK: "After launch, if you want", af1: "Monthly report", af1d: "measured results", af2: "Maintenance", af2d: "updates and backups", af3: "New features", af3d: "when you need them",
    how3T: "Handover &amp; growth",
    how3D: "We put the project live, train your team and hand everything over. Then, if you like, we stay on to help it grow.",
    integMore: "… and any other tool",
    roiQ2: "Hours per week each, on those tasks", roiQ3: "Share that can be automated", roiQ4: "Average hourly cost per person",
    roiMoney: "of labour cost saved per month", roiHow: "How we calculate it",
    roiNote: "4.33 is the average number of weeks in a month. The automatable share depends on the process: in the audit we measure it task by task.",
    galTitle: "All projects", filterLabel: "Filter projects",
    expTitle: "The experience behind Antipode.", expRole: "Founder · Software engineer",
    expBio: "I've been building software for six years. I've worked on more than fifteen enterprise portals for government, healthcare and banking and co-founded an AI customer service platform. Today I put that experience to work for businesses in Italy and Australia.",
    st3: "projects in the portfolio", expLi: "LinkedIn profile ↗",
    x1w: "2026 → today", x1t: "Founder · Antipode", x1d: "AI consulting, custom software and automation for businesses in Italy and Australia.",
    x2w: "2026 → today", x2t: "Co-founder &amp; Product Engineer", x2d: "AI platform for multichannel customer service: architecture, AI agents with RAG, connectors and automation.",
    x3s: "SMC · Milan", x3d: "More than 15 enterprise portals for government, healthcare, banking and e-commerce. Themes and component libraries, WCAG 2.1 AA accessibility, Liferay 7.0 → 7.4 migrations, demos and client training.",
    x4t: "Junior Software Developer (internship)", x4d: "First enterprise project in a team: web applications, Git and structured development processes.",
    x5t: "Full Stack Development", x5s: "ITS Incom · Milan", x5d: "Post-secondary programme: Java, SQL, JavaScript and team projects.",
    x6w: "2020 → today", x6t: "Freelance developer", x6s: "Private clients", x6d: "Websites, web apps, automation, scraping and API integrations.",
    fbTag: "Feedback", fbTitle: "What people say about us.",
    close: "Close", prev: "Previous project", next: "Next project", visit: "Visit the site", bkTitle: "Book a 30-minute call",

    /* v9 */
    p1t: "AI roadmap", p1k: "Estimated savings", p1u: "hours a week", p1m1: "12 processes analysed", p1m2: "3 phases · 10 weeks",
    p1s: "Phase", p1l: "Priorities",
    p1r1: "Customer replies", p1r1s: "AI agent · 2 weeks", p1r2: "Automatic quotes", p1r2s: "Automation · 3 weeks",
    p1r3: "CRM always up to date", p1r3s: "Integration · 1 week", p1c: "Download the full report",
    p2g: "Good morning", p2k: "Revenue · October", p2t1: "Orders", p2t2: "New customers", p2l: "Latest orders",
    p2o1: "Shipped", p2o2: "Preparing", p2n3: "Customers", p2n4: "More",
    p3d: "Tuesday 14 October", p3a1: "New quote request", p3a2: "Bianchi Ltd · from the website form",
    p3b1: "Quote sent in 38 seconds", p3b2: "Written by AI from your price list",
    p3c1: "New deal · €4,800", p3c2: "Added to the sales pipeline", p3d2: "Marco, there's a new customer to call",
    p4r: "4.9 · 320 reviews", p4h: "The smile you want, without the wait.", p4s: "Dental clinic in Townsville. First visit within 48 hours.",
    p4b: "Book a visit", p4f1: "Online booking", p4f1s: "Pick a day and time in 30 seconds",
    p4f2: "Clear quotes", p4f2s: "Transparent prices before you start", p4t: "New request from the website", p4ts: "Laura M. · first visit",
    h1s: "Intro call · Antipode", h1pick: "Pick a day", h1note: "You'll get the invite with the Meet link by email",
    h2k: "Work plan", h2m1: "Prototype approved by you", h2m2: "Live",
    tl2: "UX/UI &amp; prototype", tl3: "Frontend", tl4: "Backend &amp; integrations", tl6: "Testing &amp; release",
    h3k: "Handover package", h3ks: "Everything in your name, no lock-in", h3ok: "Ready",
    h3c1: "Software live on your domain", h3c2: "Code, accounts and access in your name", h3c3: "Training for your team", h3c4: "Documentation and user guide",

    /* v10 pricing */
    prTag: "Pricing", prTitle: "Clear prices, <span class=\"grad\">before we start.</span>",
    prLead: "These are starting prices. After the call you get a fixed written quote, built around your project.",
    from: "from", prCta: "Book a call", prThen: "then quoted on scope",
    pr1T: "Landing page", pr1D: "One page built to present a service or campaign and capture leads.",
    pr1L: "<li>Custom design, mobile-first</li><li>Structure and copy built for enquiries</li><li>Form connected to email or CRM</li><li>Speed and basic SEO</li>", pr1W: "1–2 weeks",
    pr2T: "Business website", pr2D: "Up to 5 pages to present your business, get found on Google and receive enquiries.",
    pr2L: "<li>Up to 5 custom pages</li><li>Easy for you to update</li><li>Technical SEO and Google Business Profile</li><li>Accessibility and performance</li>", pr2W: "3–4 weeks",
    pr3T: "E-commerce", pr3D: "An online store ready to sell, easy to run day to day.",
    pr3L: "<li>Product catalogue and categories</li><li>Online payments (Stripe, PayPal)</li><li>Shipping and automatic emails</li><li>Simple order management</li>", pr3W: "4–6 weeks",
    pr4T: "Simple automation", pr4D: "One automated workflow that takes a repetitive task off your plate.",
    pr4L: "<li>1 automated workflow</li><li>Up to 3 connected tools</li><li>Testing and documentation</li><li>Support after launch</li>", pr4W: "1–2 weeks",
    pr5T: "Advanced automation / AI agent", pr5D: "AI agents and workflows that connect several systems and do the work for you.",
    pr5L: "<li>AI agent on WhatsApp, email or your site</li><li>Answers based on your documents</li><li>CRM and back-office integration</li><li>Hand-off to a person when needed</li>", pr5W: "3–5 weeks",
    pr6T: "SaaS / web app", pr6D: "A first working product to show your customers, grown in stages.",
    pr6L: "<li>Login and user management</li><li>Up to 3 core features</li><li>1 integration (e.g. Stripe or CRM)</li><li>Deployment</li>", pr6W: "from 4 weeks",
    prR1: "Website care", prR1d: "hosting, updates and backups", prR2: "Automation support", prR2d: "monitoring and small changes",
    prR3: "Extra hours", prR3d: "for work outside the quote", perMonth: "/month", perHour: "/hour",
    prNote: "Prices exclude GST. The final price depends on pages, content and integrations: you'll find it in the written quote, before any work starts.",
    a1: "You'll find starting prices in the Pricing section: for example a landing page starts from <b data-price=\"landing\"></b> and a simple automation from <b data-price=\"auto\"></b>. After the call you get a fixed written quote with costs, timeline and what's included, before any work starts.",
    p2v: "A$48,290", p3c1: "New deal · A$4,800",

    /* v10.1 timings */
    pr1W: "Up to 4 days", pr2W: "7–10 days", pr3W: "14 days", pr4W: "5 days", pr5W: "14 days", pr6W: "2–6 weeks",
    a2: "A landing page is ready in a few days, a business website in 7–10 days, a simple automation in about 5 days. A web app usually takes 2 to 6 weeks. We work in stages, so you see progress and start using the software before the end.",
    /* v12 viewer */
    pvAuto: "Auto preview", pvHint: "Drag or use the ← → keys to change project",
    /* strings used from JS */
    _title: "Antipode — AI consulting, custom software and automation",
    _desc: "Antipode is an AI consulting and software development agency based in Townsville (Australia) and Aversa (Italy). We design and build web apps, automations, AI agents and websites, from idea to launch.",
    _formErr: "Please add your name, a valid email and a short message.",
    _formOk: "Opening your email app…",
    _mailSubject: "New project",
    _mailHello: "Hi Antipode,",
    _mailNeed: "Interested in",
    _tbd: "to be defined",
    _newTab: "opens in a new tab",
    _client: "Client", _library: "Library",
    calCtaAlt: "Suggest this time", calCtaLive: "See available times", itTime: "Italian time",
    bkPrefill: "I'd like to book an intro call: {when}.",
    roiF1: "{p} people × {h} h a week × {s}% × 4.33 weeks = <b>{r} hours a month</b>",
    roiF2: "{r} hours × {c}/hour = <b>{m} a month</b>",
    gAll: "All", gPa: "Public sector", gCorp: "Enterprise &amp; companies", gProd: "Startups &amp; products",
    viaSmc: "with SMC", projectsWord: "projects", seeN: "See the {n} projects", _private: "private project",
    st1k: "Startups &amp; products", st1b: "4 channels. One AI assistant.", st1t: "CHEAI and our own products",
    st1d: "The AI customer service platform we co-founded, plus projects and libraries we built in-house.",
    st2k: "Public sector", st2b: "Portals used by millions of citizens.", st2t: "Revenue Agency, Ministry of Finance, Customs and more",
    st2d: "WCAG 2.1 AA accessible interfaces, migrations and custom components for ministries and agencies.",
    st3k: "Enterprise &amp; companies", st3b: "Banking, healthcare, industry, retail.", st3t: "Scame, Banca Sella, AXA, Coop and more",
    st3d: "Multilingual product sites and customer portals, fast and integrated with company systems.",
    st3c1: "Multilingual",
    _budget: "Budget", _todo: "to fill in"
  };

  var IT_JS = {
    _formErr: "Scrivi nome, un'email valida e due righe su cosa ti serve.",
    _formOk: "Apro il tuo programma di posta…",
    _mailSubject: "Nuovo progetto",
    _mailHello: "Ciao Gruppo Automa,",
    _mailNeed: "Mi interessa",
    _tbd: "da definire",
    _newTab: "apre in una nuova scheda",
    _client: "Cliente", _library: "Libreria",
    _budget: "Budget", _todo: "da compilare"
  };

  function pick() {
    return "it"; // Gruppo Automa: Italian only
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "it" || q === "en") return q;
    try { var s = localStorage.getItem(KEY); if (s === "it" || s === "en") return s; } catch (e) {}
    return /^it\b/i.test(navigator.language || "") ? "it" : "en";
  }

  var lang = pick();
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  window.I18N = {
    lang: lang,
    t: function (k) {
      var v = lang === "en" ? EN[k] : IT_JS[k];
      if (v === undefined) return null;
      return String(v).replace(/&amp;/g, "&"); // JS callers want plain text
    },
    set: function (l) {
      if (l === lang) return;
      try { localStorage.setItem(KEY, l); } catch (e) {}
      try { sessionStorage.setItem("automa-y", String(window.scrollY)); } catch (e) {}
      var u = new URL(location.href);
      u.searchParams.set("lang", l);
      u.hash = "";
      location.replace(u.toString());
    }
  };

  function apply(root) {
    if (lang !== "en") return;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = EN[el.dataset.i18n]; if (v !== undefined) el.innerHTML = v;
    });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var v = EN[el.dataset.i18nAria]; if (v !== undefined) el.setAttribute("aria-label", v);
    });
    root.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var v = EN[el.dataset.i18nAlt]; if (v !== undefined) el.alt = v;
    });
    document.title = EN._title;
    var d = document.querySelector('meta[name="description"]'); if (d) d.content = EN._desc;
  }
  window.I18N.apply = apply;
  if (document.body && !document.body.hasAttribute("data-legal")) apply(document);

  document.querySelectorAll(".lang__btn").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    b.addEventListener("click", function () { window.I18N.set(b.dataset.lang); });
  });
})();
