/* UNIFY NOW · calm edition
   Native scrolling only. This file adds: one soft reveal per block, hairlines
   that draw once, a header that gets out of the way, the mobile menu and the
   forms. Without it the page is complete and static. */
(function () {
  'use strict';

  var root = document.documentElement;
  var STATIC = root.classList.contains('static');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Reveals and hairlines: once, then left alone ---------- */
  var blocks = $$('.rv, .draw');
  if (STATIC || REDUCED || !('IntersectionObserver' in window)) {
    blocks.forEach(function (el) { el.classList.add('in'); });
  } else {
    root.classList.add('on'); // the hidden start state only exists once this script is really running
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(function (el) { io.observe(el); });
    // what is already on screen at load does not wait for the observer
    setTimeout(function () {
      blocks.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); });
    }, 40);
  }

  /* ---------- 2. Header: solid once you scroll, hides on the way down ---------- */
  var head = $('.head');
  var lastY = window.scrollY || 0, ticking = false;
  function headState() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    head.classList.toggle('is-solid', y > 16);
    if (!root.classList.contains('menu-open')) {
      if (y > 320 && y > lastY + 4) head.classList.add('is-hidden');
      else if (y < lastY - 4 || y <= 320) head.classList.remove('is-hidden');
    }
    lastY = y;
  }
  if (head) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(headState); } }, { passive: true });
    head.addEventListener('focusin', function () { head.classList.remove('is-hidden'); });
    headState();
  }

  /* ---------- 3. Mobile menu ---------- */
  var burger = $('.burger');
  var menu = $('.menu');
  if (burger && menu) {
    var setMenu = function (open) {
      root.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.querySelector('.burger__txt').textContent = open ? 'Close' : 'Menu';
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { var f = $('a', menu); if (f) setTimeout(function () { f.focus(); }, 60); }
    };
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 860 && root.classList.contains('menu-open')) setMenu(false); });
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a', menu); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); burger.focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); burger.focus(); }
    });
  }

  /* ---------- 4. Forms ----------
     Static site: there is no server to post to yet. If the form has a
     data-endpoint (for example a form service URL) we post JSON to it and show
     the site's own thank-you line. Otherwise we open the visitor's mail app
     with everything filled in, addressed to the firm. */
  $$('form[data-form]').forEach(function (form) {
    var status = $('.form__status', form);
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) return;
      e.preventDefault();
      var data = {};
      $$('input, select, textarea', form).forEach(function (f) { if (f.name) data[f.name] = f.value.trim(); });
      var endpoint = form.getAttribute('data-endpoint');
      var done = function (msg) { status.textContent = msg; status.classList.add('on'); status.focus(); };
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(); form.reset(); done(form.getAttribute('data-thanks')); })
          .catch(function () { done('Something went wrong. Please email us at ' + form.getAttribute('data-to') + '.'); });
        return;
      }
      var lines = [];
      $$('.field', form).forEach(function (fl) {
        var f = $('input, select, textarea', fl), l = $('label', fl);
        if (f && l) lines.push(l.textContent.trim() + ': ' + f.value.trim());
      });
      var subject = form.getAttribute('data-subject') || 'Website';
      if (data.role) subject += ': ' + data.role;
      location.href = 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      done('Your email app has opened with your details. Press send to finish.');
    });
  });
  // preselect the role on the apply page
  (function () {
    var sel = $('select[name="role"]');
    if (!sel) return;
    var m = /[?&]role=([^&#]+)/.exec(location.search);
    if (!m) return;
    var want = decodeURIComponent(m[1]);
    $$('option', sel).forEach(function (o) { if (o.getAttribute('data-slug') === want) sel.value = o.value; });
  })();

  /* ---------- 5. Legal: mark the section you are reading ---------- */
  (function () {
    var toc = $$('.legal__toc a');
    if (!toc.length || !('IntersectionObserver' in window)) return;
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        toc.forEach(function (a) { a.classList.remove('on'); });
        var a = map[en.target.id]; if (a) a.classList.add('on');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $$('.legal__body h2[id]').forEach(function (h) { io2.observe(h); });
  })();
})();
