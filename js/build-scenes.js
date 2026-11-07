/* Scroll is the clock: each scene builds, settles, then yields to the next one. */
(() => {
  const {gsap, ScrollTrigger} = window;
  if (!gsap || !ScrollTrigger) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const media = gsap.matchMedia();
  media.add({mobile: '(max-width: 860px)', desktop: '(min-width: 861px)', motion: '(prefers-reduced-motion: no-preference)'}, ({conditions}) => {
    if (!conditions.motion) return;
    const cleanups = [];
    const howCopy = $('.how__copy'), howStage = $('.how__sticky');
    if (conditions.mobile) $('#come-lavoriamo').insertBefore(howCopy, $('#how-pin'));
    const configs = [
      {section: $('#servizi'), pin: $('#uses-pin'), stage: $('.uses__grid'), scenes: $$('.utext'), visuals: $$('.phone-wrap .scr'), type: 'services'},
      {section: $('#come-lavoriamo'), pin: $('#how-pin'), stage: howStage, scenes: $$('.how__pane'), type: 'method'},
    ];
    configs.forEach(({section, pin, stage, scenes, visuals = scenes, type}) => {
      section.classList.add('build-mode');
      const slots = [];
      if (type === 'method') scenes.forEach(scene => {
        const ui = $('.ui', scene), slot = document.createElement('div');
        slot.className = 'build-ui-slot'; ui.before(slot); slot.append(ui); slots.push(slot);
      });
      const guide = document.createElement('div');
      guide.className = 'build-guide';
      guide.innerHTML = '<span class="build-guide__arrow" aria-hidden="true">↓</span><span>Scorri e guarda prendere forma</span><span class="build-guide__count"></span><span class="build-guide__track" aria-hidden="true"><i class="build-guide__fill"></i></span>';
      stage.append(guide);
      const overlay = document.createElement('div');
      overlay.className = 'build-overlay'; overlay.setAttribute('aria-hidden', 'true'); stage.append(overlay);
      const names = conditions.mobile ? ['Design', 'Contenuti', 'Sviluppo', 'AI'] : ['Design', 'Contenuti', 'Frontend', 'API', 'Qualità', 'AI'];
      const count = names.length;
      const agents = names.map((name, k) => {
        const el = document.createElement('div'); el.className = 'build-agent'; el.style.setProperty('--agent-color', ['var(--v1)', 'var(--ink)', 'var(--v2)', 'var(--v1)', 'var(--ink)', 'var(--v2)'][k]); el.style.setProperty('--agent-text', k === 2 || k === 5 ? 'var(--ink)' : 'var(--surface)');
        el.innerHTML = '<svg viewBox="0 0 24 28"><path d="M2 2L21 17L12 18L8 26Z"/></svg><span>'+name+'</span>';
        overlay.append(el); return el;
      });
      const boxes = Array.from({length: count * 2}, () => { const el = document.createElement('div'); el.className = 'build-selection'; overlay.prepend(el); return el; });
      const timelines = [], geometry = [];
      let active = -1, disposed = false;
      const clamp = gsap.utils.clamp;
      const fit = () => {
        if (type === 'services') {
          const space = $('.phone-wrap');
          space.style.setProperty('--phone-scale', Math.min(1, (space.clientWidth - 24) / 300, space.clientHeight / 600));
        } else slots.forEach(slot => {
          const ui = $('.ui', slot);
          slot.style.setProperty('--ui-scale', Math.min(1, slot.clientWidth / 480, slot.clientHeight / ui.offsetHeight));
        });
      };
      const measure = () => {
        if (disposed) return;
        fit();
        const root = stage.getBoundingClientRect();
        scenes.forEach((scene, i) => {
          const components = type === 'services' ? $$('[data-a]', visuals[i]) : [...$('.ui', scene).children];
          const title = type === 'services' ? $('h3', scene) : $('.how__text h3', scene);
          const targets = [title, ...components.filter(el => el.offsetHeight > 0)];
          geometry[i] = Array.from({length: count * 2}, (_, k) => {
            const r = targets[k % targets.length].getBoundingClientRect();
            return {x: r.left - root.left, y: r.top - root.top, w: r.width, h: r.height};
          });
        });
        timelines.forEach(tl => tl.invalidate());
      };
      scenes.forEach((scene, i) => {
        const components = type === 'services' ? $$('[data-a]', visuals[i]) : [...$('.ui', scene).children];
        const tl = gsap.timeline({paused: true});
        tl.fromTo(components, {autoAlpha: 0, y: 12, clipPath: 'inset(0 100% 0 0)'}, {autoAlpha: 1, y: 0, clipPath: 'inset(0 0% 0 0)', duration: .24, stagger: {amount: .28}, ease: 'power2.out'}, .08);
        const details = visuals[i];
        const tweenIf = (selector, from, to, at) => {
          const elements = $$(selector, details);
          if (elements.length) tl.fromTo(elements, from, {...to, duration: .24, stagger: .025, ease: 'none'}, at);
        };
        tweenIf('.rep__bar i', {scaleX: 0}, {scaleX: 1}, .22);
        tweenIf('.wa__line', {strokeDashoffset: 400}, {strokeDashoffset: 0}, .25);
        tweenIf('.gt__bar', {scaleX: 0}, {scaleX: 1}, .25);
        tweenIf('.gt__ms', {autoAlpha: 0}, {autoAlpha: 1}, .48);
        tweenIf('.chk__b svg', {strokeDashoffset: 24}, {strokeDashoffset: 0}, .3);
        // Settle for reading, then clear the canvas before the next build.
        if (i < scenes.length - 1) tl.to(components, {autoAlpha: 0, y: -8, duration: .06, ease: 'power1.in'}, .94);
        tl.to({}, {duration: .23}, .77);
        timelines.push(tl);
      });
      const render = (value) => {
        if (disposed) return;
        const index = Math.min(scenes.length - 1, Math.floor(value));
        const p = Math.min(1, value - index);
        {
          active = index;
          scenes.forEach((scene, k) => {
            const selected = k === index;
            gsap.set(scene, {autoAlpha: selected ? 1 : 0});
            scene.classList.toggle('is-active', selected); scene.inert = !selected;
            scene.setAttribute('aria-hidden', String(!selected));
            if (visuals[k] !== scene) { gsap.set(visuals[k], {autoAlpha: selected ? 1 : 0}); visuals[k].classList.toggle('is-active', selected); }
          });
          $$('.how__steps li', section).forEach((el, k) => el.classList.toggle('is-active', k === index));
          $('.build-guide__count', guide).textContent = `${String(index + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
        }
        timelines[index].progress(p);
        $('.build-guide__fill', guide).style.transform = `scaleX(${value / scenes.length})`;
        const fade = clamp(0, 1, p / .06) * clamp(0, 1, (.82 - p) / .12);
        agents.forEach((agent, k) => {
          const first = geometry[index]?.[k], second = geometry[index]?.[k + count];
          if (!first || !second) return;
          const travel = gsap.parseEase('power2.inOut')(clamp(0, 1, (p - .22 - k * .025) / .3));
          const x = first.x + first.w * (.12 + k / (count - 1) * .6) + (second.x + second.w * (.78 - k / (count - 1) * .6) - first.x - first.w * (.12 + k / (count - 1) * .6)) * travel;
          const y = first.y + (second.y - first.y) * travel + 8;
          gsap.set(agent, {x: clamp(4, stage.clientWidth - 80, x), y: clamp(45, stage.clientHeight - 44, y), opacity: fade});
        });
        boxes.forEach((box, k) => {
          const r = geometry[index]?.[k]; if (!r) return;
          const start = k < count ? .03 + k * .025 : .32 + (k - count) * .025;
          const progress = clamp(0, 1, (p - start) / .18);
          const opacity = clamp(0, 1, (p - start) / .025) * clamp(0, 1, ((k < count ? .48 : .78) - p) / .12);
          gsap.set(box, {x: r.x - 3, y: r.y - 3, width: r.w + 6, height: r.h + 6, scaleX: .1 + .9 * progress, opacity});
        });
      };
      measure(); render(0);
      const clock = {value: 0};
      gsap.to(clock, {value: scenes.length - .0001, ease: 'none', onUpdate: () => render(clock.value), scrollTrigger: {trigger: pin, start: 'top top', end: 'bottom bottom', scrub: .35, invalidateOnRefresh: true, onRefresh: () => {measure(); render(clock.value);}}});
      const observer = new ResizeObserver(() => {measure(); render(clock.value);});
      observer.observe(stage);
      requestAnimationFrame(() => {measure(); render(clock.value);});
      document.fonts.ready.then(() => {if (!disposed && section.classList.contains('build-mode')) {measure(); render(clock.value);}});
      cleanups.push(() => {
        disposed = true; observer.disconnect(); // matchMedia reverts its timelines and triggers.
        scenes.forEach((el, i) => { el.inert = false; el.removeAttribute('aria-hidden'); el.classList.toggle('is-active', i === 0); });
        gsap.set([...scenes, ...visuals, ...visuals.flatMap(el => $$('[data-a], .rep__bar i, .wa__line, .gt__bar, .gt__ms, .chk__b svg', el)), ...slots.flatMap(slot => [...$('.ui', slot).children])], {clearProps: 'opacity,visibility,transform,clipPath,strokeDashoffset'});
        slots.forEach(slot => {slot.before(slot.firstElementChild); slot.remove();});
        guide.remove(); overlay.remove(); section.classList.remove('build-mode');
      });
    });
    ScrollTrigger.refresh();
    return () => {cleanups.forEach(fn => fn()); if (conditions.mobile) howStage.prepend(howCopy);};
  });
})();
