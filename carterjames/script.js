/* Carter James 2026, quiet version. No dependencies, native scrolling only.
   Everything here is enhancement: without this file the site is complete and readable. */
(function () {
  'use strict';
  window.__cj = true;

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
      /* small screens: start just before a block enters, so nothing is ever on screen and still empty */
      ? { rootMargin: '0px 0px 16% 0px', threshold: 0 }
      : { rootMargin: '0px 0px -4% 0px', threshold: 0.01 });
    blocks.forEach(function (el) { io.observe(el); });
  }

  /* Nav: mark the section you are in. */
  var navLinks = $$('.nav-links a');
  var sections = navLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').split('#')[1];
    return id ? document.getElementById(id) : null;
  });
  function markCurrent() {
    var mark = window.scrollY + window.innerHeight * 0.4;
    var current = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top + window.scrollY <= mark) current = i;
    }
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (open && window.innerWidth > 1100) setMenu(false); });
  }
})();
