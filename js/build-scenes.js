/* Build each scene once on arrival; scrolling only selects what to read. */
(() => {
  const {gsap, ScrollTrigger} = window;
  if (!gsap || !ScrollTrigger) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = gsap.utils.clamp(0, 1);
  const ease = gsap.parseEase('power2.inOut');
  // Keep visit history across responsive rebuilds, for this page visit only.
  const seenScenes = new WeakSet(), seenIntros = new WeakSet();
  const buildDuration = 1.05;
  const media = gsap.matchMedia();
  media.add({mobile: '(max-width: 860px)', desktop: '(min-width: 861px)', motion: '(prefers-reduced-motion: no-preference)'}, ({conditions}) => {
    if (!conditions.motion) {
      $$('.utext, .how__pane').forEach(el => seenScenes.add(el));
      $$('.uses__head, .how__copy').forEach(el => seenIntros.add(el));
      return;
    }
    const cleanups = [];
    const howCopy = $('.how__copy'), howStage = $('.how__sticky');
    if (conditions.mobile) $('#come-lavoriamo').insertBefore(howCopy, $('#how-pin'));

    // Each part has a place in the layout, a responsible cursor and a reveal time.
    // Skeletons are measured from real elements; no screenshot or duplicate copy.
    const part = (el, start, kind = 'text', duration = .17) => ({el, start, kind, duration});
    function builder(stage, plans, compact = false) {
      const overlay = document.createElement('div');
      overlay.className = 'build-overlay'; overlay.setAttribute('aria-hidden', 'true');
      stage.append(overlay);
      const roles = compact ? ['Design', 'Contenuti'] : conditions.mobile
        ? ['Layout', 'Design', 'Contenuti', 'Frontend', 'Dati', 'AI']
        : ['Layout', 'Design', 'Contenuti', 'Frontend', 'API', 'Dati', 'Qualità', 'AI'];
      const colors = ['var(--v1)', 'var(--ink)', 'var(--v2)', 'var(--v1)', 'var(--ink)', 'var(--v2)', 'var(--v1)', 'var(--ink)'];
      const agents = roles.map((name, i) => {
        const el = document.createElement('div'); el.className = 'build-agent';
        el.style.setProperty('--agent-color', colors[i]); el.style.setProperty('--agent-text', 'var(--surface)');
        el.innerHTML = '<svg viewBox="0 0 24 28"><path d="M2 2L21 17L12 18L8 26Z"/></svg><span>'+name+'</span>';
        overlay.append(el); return el;
      });
      const layers = plans.map(parts => parts.filter(p => p.el).map((p, i) => {
        const box = document.createElement('div');
        box.className = 'build-selection build-selection--' + p.kind;
        box.style.setProperty('--part-color', colors[i % colors.length]);
        box.innerHTML = '<i class="build-placeholder"></i>';
        overlay.prepend(box);
        return {...p, box, rect: null};
      }));
      const timelines = layers.map(parts => {
        const tl = gsap.timeline({paused: true});
        parts.forEach(p => tl.fromTo(p.el,
          {autoAlpha: 0, clipPath: 'inset(0 100% 0 0)'},
          {autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: p.duration, ease: 'power2.out'}, p.start));
        // Hold the finished composition right up to the next scene's wireframe.
        // Fading it to zero leaves an empty viewport at the boundary on reverse scroll.
        tl.to({}, {duration: .01}, .99);
        return tl;
      });
      let active = -1;
      const measure = () => {
        const root = stage.getBoundingClientRect();
        layers.forEach(parts => parts.forEach(p => {
          const r = p.el.getBoundingClientRect();
          p.rect = {x: r.left - root.left, y: r.top - root.top, w: r.width, h: r.height};
        }));
      };
      const draw = (index, progress) => {
        if (index !== active) {
          // Shared surfaces (phone frame / method copy) must restart as well.
          if (active >= 0) timelines[active].progress(0);
          layers.forEach((parts, i) => parts.forEach(p => {p.box.hidden = i !== index;}));
          active = index;
          timelines[index].progress(0);
        }
        timelines[index].progress(progress);
        const parts = layers[index].filter(p => p.rect?.w > 0 && p.rect?.h > 0);
        parts.forEach(p => {
          const r = p.rect, appear = Math.max(0, p.start - .15);
          const build = clamp((progress - p.start) / p.duration);
          const outline = clamp((progress - appear) / .035) * clamp((p.start + p.duration + .1 - progress) / .1);
          // Major blocks are present even at progress zero. Detail selections still
          // enter with their agent; the scaffold gives way only as real content arrives.
          const scaffold = p.kind === 'detail' ? 0 : .65 * (1 - build);
          gsap.set(p.box, {x: r.x, y: r.y, width: r.w, height: r.h, opacity: Math.max(scaffold, outline), scaleX: .96 + .04 * clamp((progress - appear) / .1)});
          p.box.style.setProperty('--placeholder-opacity', 1 - build);
          p.box.style.setProperty('--placeholder-cut', `${build * 100}%`);
        });
        const working = parts.filter(p => progress >= Math.max(0, p.start - .15) && progress < p.start + p.duration + .08);
        agents.forEach((agent, k) => {
          const tasks = parts.filter((_, i) => i % agents.length === k);
          const current = tasks.find(p => progress < p.start + p.duration) || tasks[tasks.length - 1];
          if (!current) {gsap.set(agent, {opacity: 0}); return;}
          const previous = tasks[Math.max(0, tasks.indexOf(current) - 1)];
          const travel = ease(clamp((progress - current.start + .15) / .12));
          const a = previous.rect, b = current.rect;
          const writing = clamp((progress - current.start) / current.duration);
          const x = a.x + (b.x - a.x) * travel + b.w * (.08 + .76 * writing);
          const y = a.y + (b.y - a.y) * travel + Math.min(b.h - 4, 8 + b.h * (k % 3) / 4);
          const opacity = clamp((progress - Math.max(0, current.start - .15)) / .03) * clamp((current.start + current.duration + .09 - progress) / .07);
          gsap.set(agent, {x: gsap.utils.clamp(2, stage.clientWidth - 76, x), y: gsap.utils.clamp(2, stage.clientHeight - 36, y), opacity: working.length ? opacity : 0});
        });
      };
      const clear = () => {
        overlay.remove();
        gsap.set([...new Set(layers.flatMap(parts => parts.map(p => p.el)))], {clearProps: 'opacity,visibility,clipPath'});
      };
      return {measure, draw, clear, timelines};
    }

    // Introductions also finish without requiring any further scroll.
    [$('.uses__head'), ...(conditions.mobile ? [howCopy] : [])].forEach(intro => {
      intro.classList.add('build-intro');
      const pieces = [...intro.children].filter(el => !el.matches('.how__hint'));
      const build = builder(intro, [pieces.map((el, i) => part(el, .13 + i * .08))], true);
      const clock = {value: seenIntros.has(intro) ? 1 : 0};
      let disposed = false, started = seenIntros.has(intro), playback;
      const render = () => {if (!disposed) build.draw(0, clock.value);};
      const finish = () => {
        if (disposed) return;
        playback?.kill(); started = true; seenIntros.add(intro); clock.value = 1; render();
      };
      const play = () => {
        if (disposed || started) return;
        started = true; seenIntros.add(intro);
        playback = gsap.to(clock, {value: 1, duration: buildDuration, ease: 'none', onUpdate: render});
      };
      const measure = () => {if (!disposed) {build.measure(); render();}};
      measure();
      ScrollTrigger.create({trigger: intro, start: 'top 80%', end: 'bottom top',
        onEnter: play, onEnterBack: finish, onLeave: finish,
        onLeaveBack: () => {if (started) finish();},
        onRefresh: self => {if (self.progress > 0) {if (intro.getBoundingClientRect().bottom <= 0) finish(); else play();}},
      });
      const observer = new ResizeObserver(measure); observer.observe(intro);
      cleanups.push(() => {disposed = true; playback?.kill(); observer.disconnect(); build.clear(); intro.classList.remove('build-intro');});
    });

    [
      {section: $('#servizi'), pin: $('#uses-pin'), stage: $('.uses__grid'), scenes: $$('.utext'), visuals: $$('.phone-wrap .scr'), type: 'services'},
      {section: $('#come-lavoriamo'), pin: $('#how-pin'), stage: howStage, scenes: $$('.how__pane'), type: 'method'},
    ].forEach(({section, pin, stage, scenes, visuals = scenes, type}) => {
      section.classList.add('build-mode');
      const slots = [];
      if (type === 'method') scenes.forEach(scene => {
        const ui = $('.ui', scene), slot = document.createElement('div');
        slot.className = 'build-ui-slot'; ui.before(slot); slot.append(ui); slots.push(slot);
      });
      const guide = document.createElement('div'); guide.className = 'build-guide';
      guide.innerHTML = '<span class="build-guide__arrow" aria-hidden="true">↓</span><span>Scorri per esplorare</span><span class="build-guide__count"></span><span class="build-guide__track" aria-hidden="true"><i class="build-guide__fill"></i></span>';
      stage.append(guide);
      const plans = scenes.map((scene, i) => {
        if (type === 'services') return [
          part($('.phone'), .18, 'frame', .2),
          part($('.utext__n', scene), .14),
          part($('h3', scene), .18, 'title', .22),
          part($('p:last-child', scene), .28, 'text', .22),
          part($('.uses__copy > .btn'), .43, 'text'),
          ...[...visuals[i].children].map((el, k) => part(el, .32 + k * .022, 'detail', .15)),
        ];
        return [
          ...(!conditions.mobile ? [...howCopy.children].filter(el => !el.matches('.how__hint')).map((el, k) => part(el, .12 + k * .065, el.matches('h2') ? 'title' : 'text', .2)) : []),
          part($('.how__card'), .17, 'frame', .2),
          ...[...$('.how__text', scene).children].map((el, k) => part(el, .22 + k * .065, el.matches('h3') ? 'title' : 'text', .19)),
          part($('.ui', scene), .29, 'frame', .18),
          ...[...$('.ui', scene).children].map((el, k) => part(el, .37 + k * .025, 'detail', .15)),
        ];
      });
      const build = builder(stage, plans);
      const detailTimelines = visuals.map(el => {
        const tl = gsap.timeline({paused: true});
        const tween = (selector, from, to, at) => {const els = $$(selector, el); if (els.length) tl.fromTo(els, from, {...to, duration: .2, stagger: .015, ease: 'none'}, at);};
        tween('.rep__bar i', {scaleX: 0}, {scaleX: 1}, .44);
        tween('.wa__line', {strokeDashoffset: 400}, {strokeDashoffset: 0}, .46);
        tween('.gt__bar', {scaleX: 0}, {scaleX: 1}, .46);
        tween('.gt__ms', {autoAlpha: 0}, {autoAlpha: 1}, .57);
        tween('.chk__b svg', {strokeDashoffset: 24}, {strokeDashoffset: 0}, .45);
        tl.to({}, {duration: .01}, .99); return tl;
      });
      const clock = {value: 0};
      let disposed = false, index = 0, entered = false, playback;
      const render = () => {
        if (disposed) return;
        scenes.forEach((scene, k) => {
          const selected = k === index;
          gsap.set(scene, {autoAlpha: selected ? 1 : 0}); scene.classList.toggle('is-active', selected);
          scene.inert = !selected; scene.setAttribute('aria-hidden', String(!selected));
          if (visuals[k] !== scene) {gsap.set(visuals[k], {autoAlpha: selected ? 1 : 0}); visuals[k].classList.toggle('is-active', selected);}
        });
        build.draw(index, clock.value); detailTimelines[index].progress(clock.value);
        $$('.how__steps li', section).forEach((el, k) => el.classList.toggle('is-active', k === index));
        $('.build-guide__count', guide).textContent = `${String(index + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
        $('.build-guide__fill', guide).style.transform = `scaleX(${(index + 1) / scenes.length})`;
      };
      const measure = () => {
        if (disposed) return;
        if (type === 'services') {
          const space = $('.phone-wrap');
          space.style.setProperty('--phone-scale', Math.min(1, (space.clientWidth - 24) / 300, space.clientHeight / 600));
        } else slots.forEach(slot => {
          const ui = $('.ui', slot);
          slot.style.setProperty('--ui-scale', Math.min(1, slot.clientWidth / 480, slot.clientHeight / ui.offsetHeight));
        });
        build.measure(); render();
      };
      const finish = () => {
        playback?.kill(); clock.value = 1; render();
      };
      const sync = (progress, direction) => {
        if (disposed) return;
        const next = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
        if (next !== index) {
          playback?.kill(); index = next; entered = false;
          clock.value = seenScenes.has(scenes[index]) ? 1 : 0;
          render();
        }
        const r = pin.getBoundingClientRect();
        const inView = r.top <= innerHeight * .55 && r.bottom > 0;
        if (inView && !entered) {
          entered = true;
          const complete = seenScenes.has(scenes[index]) || direction < 0;
          seenScenes.add(scenes[index]);
          if (type === 'method') seenIntros.add(howCopy);
          if (complete) finish();
          else {
            clock.value = 0; render();
            playback = gsap.to(clock, {value: 1, duration: buildDuration, ease: 'none', onUpdate: render});
          }
        } else if (!inView && entered) finish();
      };
      measure();
      const selection = ScrollTrigger.create({trigger: pin, start: 'top top', end: 'bottom bottom',
        onUpdate: self => sync(self.progress, self.direction),
        onRefresh: self => {measure(); sync(self.progress, self.direction);},
      });
      // The first scene starts as it arrives, before the sticky area reaches the top.
      ScrollTrigger.create({trigger: pin, start: 'top 55%', end: 'bottom top',
        onEnter: self => sync(selection.progress, self.direction),
        onEnterBack: self => sync(selection.progress, self.direction),
        onLeave: () => {if (entered) finish();},
        onLeaveBack: () => {if (entered) finish();},
      });
      const observer = new ResizeObserver(measure); observer.observe(stage);
      document.fonts.ready.then(measure);
      cleanups.push(() => {
        disposed = true; playback?.kill(); observer.disconnect(); build.clear();
        scenes.forEach((el, i) => {el.inert = false; el.removeAttribute('aria-hidden'); el.classList.toggle('is-active', i === 0);});
        gsap.set([...scenes, ...visuals, ...visuals.flatMap(el => $$('.rep__bar i, .wa__line, .gt__bar, .gt__ms, .chk__b svg', el))], {clearProps: 'opacity,visibility,transform,clipPath,strokeDashoffset'});
        slots.forEach(slot => {slot.before(slot.firstElementChild); slot.remove();});
        guide.remove(); section.classList.remove('build-mode');
      });
    });
    ScrollTrigger.refresh();
    return () => {cleanups.forEach(fn => fn()); if (conditions.mobile) howStage.prepend(howCopy);};
  });
})();
