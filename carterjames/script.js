/* Carter James 2026. No dependencies.
   Everything here is enhancement: with this file missing the site is complete and readable. */
(function () {
  'use strict';
  window.__cj = true;

  var root = document.documentElement;
  var isStatic = root.classList.contains('static');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- Load sequence: wait for the display face, then let the hero in ---------- */
  function loaded() {
    root.classList.add('loaded');
    setTimeout(function () { root.classList.add('settled'); }, 1500);
  }
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1800); })])
      .then(function () { requestAnimationFrame(loaded); });
  } else { loaded(); }

  /* ---------- Reveals ---------- */
  var revealEls = $$('[data-r]');
  if (isStatic || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, window.innerWidth < 721
      /* small screens: start just before a block enters, so nothing is ever on screen and still empty */
      ? { rootMargin: '0px 0px 16% 0px', threshold: 0 }
      : { rootMargin: '0px 0px -5% 0px', threshold: 0.02 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  var pin = { on: false, top: 0, dist: 0, span: 0, cur: 0, target: 0, lefts: [], raf: 0 };

  /* ---------- Nav: progress, current section, hide on the way down ---------- */
  var nav = $('#nav');
  var progress = $('#progress');
  var navLinks = $$('.nav-links a');
  var sections = navLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').split('#')[1];
    return id ? document.getElementById(id) : null;
  });
  var lastY = window.scrollY;
  var menu = $('#menu');
  var toggle = $('.nav-toggle');
  var menuOpen = false;

  function updateNav(y) {
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';

    if (nav && !menuOpen) {
      var goingDown = y > lastY + 4;
      var goingUp = y < lastY - 4;
      var inBoard = pin.on && y >= pin.top - 2 && y <= pin.top + pin.span + 2;
      root.classList.toggle('in-board', inBoard);
      if (y < 200 || inBoard) nav.classList.remove('is-hidden');
      else if (goingDown) nav.classList.add('is-hidden');
      else if (goingUp) nav.classList.remove('is-hidden');
    }
    lastY = y;

    var mark = y + window.innerHeight * 0.4;
    var current = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top + y <= mark) current = i;
    }
    navLinks.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Menu (small screens) ---------- */
  function setMenu(open) {
    if (!menu || !toggle) return;
    menuOpen = open;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      nav.classList.remove('is-hidden');
      var first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (menuOpen && window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------- The roles board: pinned, travels sideways through seven stages ---------- */
  var boardScroll = $('#boardScroll');
  var track = $('#track');
  var railFill = $('#railFill');
  var railItems = $$('#rail li');
  var stages = $$('.stage');
  var mqPin = window.matchMedia('(min-width: 1101px) and (min-height: 620px)');
  var K = 0.85; // vertical pixels spent per horizontal pixel travelled

  function measurePin() {
    if (!pin.on) return;
    track.style.transform = 'none';
    pin.dist = Math.max(0, track.scrollWidth - window.innerWidth);
    pin.span = pin.dist * K;
    boardScroll.style.height = Math.round(window.innerHeight + pin.span) + 'px';
    pin.top = boardScroll.getBoundingClientRect().top + window.scrollY;
    pin.lefts = stages.map(function (s) { return s.offsetLeft; });
    pin.cur = pin.target = targetX(window.scrollY);
    paintPin();
  }
  function targetX(y) { return pin.span ? clamp((y - pin.top) / pin.span, 0, 1) * pin.dist : 0; }
  function paintPin() {
    track.style.transform = 'translate3d(' + (-pin.cur).toFixed(2) + 'px,0,0)';
    var p = pin.dist ? pin.cur / pin.dist : 0;
    if (railFill) railFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    root.classList.toggle('board-end', p > 0.96);
    var mid = pin.cur + window.innerWidth * 0.42;
    var idx = 0;
    for (var i = 0; i < pin.lefts.length; i++) if (pin.lefts[i] <= mid) idx = i;
    railItems.forEach(function (li, i) {
      li.classList.toggle('is-current', i === idx);
      li.classList.toggle('is-done', i < idx);
    });
  }
  function tickPin() {
    pin.raf = 0;
    var d = pin.target - pin.cur;
    if (Math.abs(d) < 0.3) { pin.cur = pin.target; paintPin(); return; }
    pin.cur += d * 0.16;
    paintPin();
    pin.raf = requestAnimationFrame(tickPin);
  }
  function setupPin() {
    if (!boardScroll || !track) return;
    var want = mqPin.matches && !isStatic;
    pin.on = want;
    root.classList.toggle('pin', want);
    if (!want) {
      boardScroll.style.height = '';
      track.style.transform = '';
      return;
    }
    measurePin();
  }
  railItems.forEach(function (li, i) {
    var a = $('a', li);
    if (!a) return;
    a.addEventListener('click', function (e) {
      if (!pin.on) return;
      e.preventDefault();
      var x = clamp(pin.lefts[i] - parseFloat(getComputedStyle(track).paddingLeft || 0), 0, pin.dist);
      window.scrollTo({ top: pin.top + (pin.dist ? x / pin.dist : 0) * pin.span + 1, behavior: 'smooth' });
    });
  });

  /* ---------- Hero: the staircase leans as you leave it ---------- */
  var fls = $$('.funnel .fl');
  var heroSide = $('.hero-side');
  function updateHero(y) {
    if (isStatic || !fls.length || window.innerWidth < 721) return;
    var p = clamp(y / window.innerHeight, 0, 1);
    if (fls[1]) fls[1].style.transform = 'translate3d(' + (p * 5).toFixed(3) + 'vw,0,0)';
    if (fls[2]) fls[2].style.transform = 'translate3d(' + (p * 10).toFixed(3) + 'vw,0,0)';
    if (heroSide) heroSide.style.transform = 'translate3d(0,' + (p * -40).toFixed(1) + 'px,0)';
  }

  /* ---------- Staircase headlines settle into alignment as they arrive ---------- */
  var leans = $$('[data-lean]').map(function (el) {
    return { el: el, lines: $$('.ln', el), dir: el.getAttribute('data-lean') === 'left' ? -1 : 1 };
  });
  function updateLean() {
    if (isStatic || !leans.length || window.innerWidth < 721) return;
    var vh = window.innerHeight;
    leans.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = clamp((vh - r.top) / (vh * 0.72), 0, 1);
      var k = Math.pow(1 - p, 2);
      for (var i = 1; i < o.lines.length; i++) {
        o.lines[i].style.transform = 'translate3d(' + (o.dir * k * i * 3.4).toFixed(3) + 'vw,0,0)';
      }
    });
  }

  /* ---------- Contact: the cross on the signature line follows the pointer ---------- */
  var signLine = $('#signline');
  var signX = $('#signx');
  var contact = $('#contact');
  if (signLine && signX && contact && !isStatic && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var sx = { cur: 0, target: 0, raf: 0 };
    var stepSign = function () {
      sx.raf = 0;
      var d = sx.target - sx.cur;
      if (Math.abs(d) < 0.4) { sx.cur = sx.target; } else { sx.cur += d * 0.14; sx.raf = requestAnimationFrame(stepSign); }
      signX.style.transform = 'translate3d(' + sx.cur.toFixed(1) + 'px,0,0)';
    };
    contact.addEventListener('pointermove', function (e) {
      var r = signLine.getBoundingClientRect();
      sx.target = clamp(e.clientX - r.left - 8, 0, r.width - 16);
      if (!sx.raf) sx.raf = requestAnimationFrame(stepSign);
    });
    contact.addEventListener('pointerleave', function () {
      sx.target = 0;
      if (!sx.raf) sx.raf = requestAnimationFrame(stepSign);
    });
  }

  /* ---------- One scroll handler ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      updateNav(y);
      updateHero(y);
      updateLean();
      if (pin.on) {
        pin.target = targetX(y);
        if (!pin.raf) pin.raf = requestAnimationFrame(tickPin);
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { setupPin(); updateNav(window.scrollY); }, 120);
  });
  if (mqPin.addEventListener) mqPin.addEventListener('change', setupPin);

  setupPin();
  updateNav(window.scrollY);
  updateLean();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measurePin(); });
  window.addEventListener('load', function () { measurePin(); updateNav(window.scrollY); });
})();
