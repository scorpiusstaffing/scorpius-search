/* Argushaus — page counter + reveal motion */
(function () {
  'use strict';

  const revealTargets = document.querySelectorAll(
    '.label, .display, .body-line, .link-underline, ' +
    '.wordmark-tag, .wordmark-tagline, .hero-cities, ' +
    '.pool, .pillars, .mandates, .timeline, ' +
    '.cities-stack, .cities-note, ' +
    '.about-terms, .contact-stack, .cta-row, .media'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const wordmark = document.querySelector('.wordmark');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 100px 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  requestAnimationFrame(() => {
    if (wordmark) wordmark.classList.add('is-visible');
  });

  /* Background loop. The <source> elements carry data-src and only get a src here,
     and only once the frame comes near the screen: with reduced motion or without
     script nothing is fetched and the still stays. Paused while off screen; one
     pause and play control per video, remembered for the visit. */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-video]').forEach(frame => {
    const v = frame.querySelector('video');
    const still = frame.querySelector('img');
    const btn = frame.querySelector('.media-toggle');
    if (!v || reduceMotion || !('IntersectionObserver' in window)) return;

    let held = false;
    try { held = sessionStorage.getItem('ah-video') === 'paused'; } catch (e) {}
    let attached = false;
    let onScreen = false;

    const sync = () => {
      if (!btn) return;
      btn.setAttribute('data-paused', v.paused ? '1' : '0');
      btn.setAttribute('aria-label', v.paused ? 'Play video' : 'Pause video');
    };
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(sync); };
    const attach = () => {
      if (attached) return;
      attached = true;
      if (still && still.currentSrc) v.poster = still.currentSrc;   /* already loaded, no second fetch */
      const sources = Array.from(v.querySelectorAll('source[data-src]'));
      const pick = sources.find(s => !s.dataset.media || window.matchMedia(s.dataset.media).matches);
      sources.forEach(s => { if (s !== pick) s.remove(); });
      if (!pick) return;
      pick.src = pick.dataset.src;
      v.autoplay = false;               /* play only while on screen */
      v.load();
      if (btn) btn.hidden = false;
      if (onScreen && !held) play();
      sync();
    };

    v.addEventListener('playing', () => { frame.classList.add('is-playing'); sync(); });
    v.addEventListener('pause', sync);

    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) attach();
    }, { threshold: 0.05 }).observe(frame);

    new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      if (!attached) return;
      if (onScreen && !held) play(); else v.pause();
    }, { threshold: 0 }).observe(frame);

    if (btn) btn.addEventListener('click', () => {
      held = !v.paused;
      try { sessionStorage.setItem('ah-video', held ? 'paused' : 'playing'); } catch (e) {}
      if (held) v.pause(); else play();
    });
  });

  /* Marginalia over a picture: toggle the cream plate while they overlap a frame. */
  const marks = Array.from(document.querySelectorAll('.fixtop > *, .fixbottom > *, .counter'));
  const frames = Array.from(document.querySelectorAll('.media'));
  if (marks.length && frames.length) {
    let ticking = false;
    const check = () => {
      ticking = false;
      const boxes = frames.map(f => f.getBoundingClientRect());
      marks.forEach(m => {
        const r = m.getBoundingClientRect();
        const over = boxes.some(b => r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom);
        m.classList.toggle('over-media', over);
      });
    };
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    check();
  }

  const counterEl = document.getElementById('counter-current');
  const screens   = Array.from(document.querySelectorAll('.screen[data-index]'));

  if (counterEl && screens.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver(() => {
      const currentBest = screens
        .map(s => {
          const rect = s.getBoundingClientRect();
          const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
          return { idx: s.getAttribute('data-index'), v: visible };
        })
        .sort((a, b) => b.v - a.v)[0];
      if (currentBest && currentBest.idx !== counterEl.textContent) {
        counterEl.style.opacity = '0';
        setTimeout(() => {
          counterEl.textContent = currentBest.idx;
          counterEl.style.opacity = '1';
        }, 120);
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

    screens.forEach(s => counterIO.observe(s));
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id === '#top') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
