/* Unify Now group: shared behaviour. No dependencies, native scrolling only.
   Everything here is enhancement: without this file every page is complete and readable. */
(function () {
  'use strict';
  window.__un = true;

  var root = document.documentElement;
  var isStatic = root.classList.contains('static');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* One soft reveal per block, once. */
  var blocks = $$('[data-r]');
  if (isStatic || !('IntersectionObserver' in window)) {
    blocks.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, window.innerWidth < 721
      ? { rootMargin: '0px 0px 16% 0px', threshold: 0 }
      : { rootMargin: '0px 0px -4% 0px', threshold: 0.01 });
    blocks.forEach(function (el) {
      /* Blocks already in the first screen reveal on the next frame, never waiting on the observer. */
      if (el.getBoundingClientRect().top < window.innerHeight) {
        requestAnimationFrame(function () { el.classList.add('in'); });
        setTimeout(function () { el.classList.add('in'); }, 400);
      } else { io.observe(el); }
    });
  }

  /* Background video: muted, looping. The sources carry data-src and get their src only here, so with
     reduced motion, ?static=1 or no script nothing is fetched and the poster stays. Videos are grouped
     by the nearest [data-video-scope] (or their section); one pause and play control per group, and each
     video pauses while off screen. */
  var groups = [];
  $$('.media video').forEach(function (v) {
    var scope = v.closest('[data-video-scope]') || v.closest('section') || document.body;
    var g = groups.filter(function (x) { return x.scope === scope; })[0];
    if (!g) { g = { scope: scope, videos: [] }; groups.push(g); }
    g.videos.push(v);
  });
  groups.forEach(function (g) {
    var btn = $('.media-toggle', g.scope);
    var held = false;                                   /* the visitor paused it */
    try { held = sessionStorage.getItem('un-video') === 'paused'; } catch (e) {}
    if (isStatic) return;
    function play(v) { var p = v.play(); if (p && p.catch) p.catch(sync); }
    function sync() {
      if (!btn) return;
      var paused = g.videos.every(function (v) { return v.paused; });
      btn.setAttribute('data-paused', paused ? '1' : '0');
      $('.vh', btn).textContent = paused ? 'Play background video' : 'Pause background video';
      $('.t', btn).textContent = paused ? 'Play' : 'Pause';
    }
    g.videos.forEach(function (v) {
      var still = $('img', v.parentNode);               /* the poster the <picture> already chose for this width */
      if (still) v.poster = still.currentSrc || still.src;
      if (held) v.autoplay = false;
      $$('source[data-src]', v).forEach(function (s) { s.src = s.getAttribute('data-src'); });
      v.load();
      v.addEventListener('play', sync);
      v.addEventListener('pause', sync);
      if (!held && v.paused) play(v);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          if (held) return;
          if (en[0].isIntersecting) play(v); else v.pause();
        }, { threshold: 0 }).observe(v);
      }
    });
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        held = !g.videos.every(function (v) { return v.paused; });
        try { sessionStorage.setItem('un-video', held ? 'paused' : 'playing'); } catch (e) {}
        g.videos.forEach(function (v) { if (held) v.pause(); else play(v); });
      });
      sync();
    }
  });

  /* Nav: mark the section you are in (one-page sites). */
  var navLinks = $$('.nav-links a');
  var sections = navLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').split('#')[1];
    return id ? document.getElementById(id) : null;
  });
  function markCurrent() {
    var mark = window.scrollY + window.innerHeight * 0.4;
    var current = -1;
    if (window.scrollY < 40) { paint(current); return; }
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top + window.scrollY <= mark) current = i;
    }
    paint(current);
  }
  function paint(current) {
    navLinks.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if (sections.some(Boolean)) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; markCurrent(); });
    }, { passive: true });
    markCurrent();
  }

  /* Menu on small screens. */
  var menu = $('#menu');
  var toggle = $('.nav-toggle');
  var open = false;
  function setMenu(next) {
    if (!menu || !toggle) return;
    open = next;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = $('a', menu); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!open); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { setMenu(false); toggle.focus(); } });
    window.addEventListener('resize', function () { if (open && window.innerWidth > 1100) setMenu(false); });
  }
})();
