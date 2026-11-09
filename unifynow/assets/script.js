/* UNIFY NOW · "In Register"
   No dependencies. Everything here is enhancement: without it the page is
   simply already in register. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('on'); // reveal-dependent CSS only applies once this file is really running
  var STATIC = root.classList.contains('static');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CALM = STATIC || REDUCED;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Clock: it is always now in Amsterdam ---------- */
  (function clock() {
    var els = $$('[data-clock]');
    if (!els.length) return;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) { return; }
    function tick() {
      var now = new Date();
      var t = fmt.format(now);
      for (var i = 0; i < els.length; i++) {
        els[i].textContent = t;
        els[i].setAttribute('datetime', now.toISOString());
      }
    }
    tick();
    if (!STATIC) setInterval(tick, 1000);
  })();

  /* ---------- 2. Registered headings: build the two plates ---------- */
  var regs = $$('.reg');
  regs.forEach(function (el) {
    if (el.classList.contains('reg--on')) return;
    var html = el.innerHTML;
    el.innerHTML = '<span class="reg__src">' + html + '</span>' +
      '<span class="reg__p reg__p--a" aria-hidden="true">' + html + '</span>' +
      '<span class="reg__p reg__p--b" aria-hidden="true">' + html + '</span>';
    $$('.reg__p [id]', el).forEach(function (n) { n.removeAttribute('id'); });
    el.classList.add('reg--on');
    if (!CALM && el.getAttribute('data-reg') !== 'hold' && el.getAttribute('data-reg') !== 'load') el.style.setProperty('--o', '1');
  });

  /* ---------- 3. Scroll scrub: slide plates into register ---------- */
  var scrubbed = CALM ? [] : regs.filter(function (el) {
    var m = el.getAttribute('data-reg');
    return m !== 'load' && m !== 'hold';
  });
  var nowdots = CALM ? [] : $$('.nowdot');
  var hero = $('.hero');
  var sides = $('.sides__stage');
  var vh = window.innerHeight;

  function progress(el, startF, endF) {
    // 1 while the element's top is below startF of the viewport, 0 once above endF
    var r = el.getBoundingClientRect();
    return clamp((r.top - vh * endF) / (vh * (startF - endF)), 0, 1);
  }
  function ease(t) { return t * t * (3 - 2 * t); }

  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var i, o;
    for (i = 0; i < scrubbed.length; i++) {
      var el = scrubbed[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      o = ease(clamp((r.top - vh * 0.5) / (vh * 0.48), 0, 1));
      el.style.setProperty('--o', o.toFixed(4));
    }
    for (i = 0; i < nowdots.length; i++) {
      o = ease(progress(nowdots[i], 0.95, 0.35));
      nowdots[i].style.setProperty('--o', o.toFixed(4));
    }
    if (hero && !CALM) {
      hero.style.setProperty('--hp', clamp(y / (vh * 0.55), 0, 1).toFixed(4));
    }
    if (sides && !CALM && window.innerWidth > 860) {
      sides.style.setProperty('--sp', ease(progress(sides, 0.9, 0.2)).toFixed(4));
    }
    headState(y);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  /* ---------- 4. Header behaviour ---------- */
  var head = $('.head');
  var lastY = 0;
  var bars = [];
  function measureBars() {
    var y0 = window.scrollY || window.pageYOffset;
    bars = $$('[data-bar]').map(function (el) {
      var r = el.getBoundingClientRect();
      return { top: r.top + y0, bottom: r.bottom + y0, on: el.getAttribute('data-bar') };
    });
  }
  function headState(y) {
    if (!head) return;
    head.classList.toggle('is-solid', y > 24);
    var probe = y + head.offsetHeight * 0.5, on = '';
    for (var k = 0; k < bars.length; k++) if (probe >= bars[k].top && probe < bars[k].bottom) on = bars[k].on;
    if (head.getAttribute('data-on') !== on) head.setAttribute('data-on', on);
    if (root.classList.contains('menu-open')) { lastY = y; return; }
    if (y > 240 && y > lastY + 6) head.classList.add('is-hidden');
    else if (y < lastY - 6 || y <= 240) head.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; measureBars(); onScroll(); });
  window.addEventListener('load', function () { measureBars(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measureBars(); onScroll(); });
  measureBars();
  if (head) head.addEventListener('focusin', function () { head.classList.remove('is-hidden'); });

  /* ---------- 5. Mobile menu ---------- */
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
    // keep focus inside the open menu
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a', menu); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); burger.focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); burger.focus(); }
    });
  }

  /* ---------- 6. Hero: load sequence, then the cursor knocks it off register ---------- */
  if (hero) {
    var title = $('.hero__title', hero);
    if (CALM) {
      hero.classList.add('is-in', 'is-live');
    } else {
      title.style.setProperty('--o', '1.6');
      hero.style.setProperty('--in', '1');
      // let the curtain start opening, then bring both plates into register
      setTimeout(function () {
        hero.classList.add('is-in');
        title.style.setProperty('--o', '0');
        hero.style.setProperty('--in', '0');
      }, 520);
      setTimeout(function () { hero.classList.add('is-live'); }, 2200);

      if (FINE) {
        var still;
        hero.addEventListener('pointermove', function (e) {
          if (!hero.classList.contains('is-live')) return;
          var nx = (e.clientX / window.innerWidth - 0.5) * 2;
          var ny = (e.clientY / vh - 0.5) * 2;
          title.style.setProperty('--jx', (nx * 9).toFixed(1) + 'px');
          title.style.setProperty('--jy', (ny * 5).toFixed(1) + 'px');
          hero.style.setProperty('--mx', (nx * 16).toFixed(1) + 'px');
          hero.style.setProperty('--my', (ny * 10).toFixed(1) + 'px');
          clearTimeout(still);
          still = setTimeout(function () {
            title.style.setProperty('--jx', '0px');
            title.style.setProperty('--jy', '0px');
          }, 260);
        });
        hero.addEventListener('pointerleave', function () {
          title.style.setProperty('--jx', '0px'); title.style.setProperty('--jy', '0px');
          hero.style.setProperty('--mx', '0px'); hero.style.setProperty('--my', '0px');
        });
      }
    }
  }

  /* ---------- 7. Purpose: words take ink as you read down ---------- */
  var big = $('[data-words]');
  if (big && !CALM) {
    var walk = function (node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (k) {
        if (k.nodeType === 3) {
          var frag = document.createDocumentFragment();
          k.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, k);
        } else if (k.nodeType === 1) walk(k);
      });
    };
    walk(big);
    var words = $$('.w', big);
    var paint = function () {
      var r = big.getBoundingClientRect();
      var p = clamp((vh * 0.86 - r.top) / (r.height + vh * 0.36), 0, 1);
      var n = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(paint); }, { passive: true });
    paint();
  }

  /* ---------- 8. One-shot observers: hairlines draw, bars grow ---------- */
  var once = $$('.draw, .ladder');
  if (CALM || !('IntersectionObserver' in window)) {
    once.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    once.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 9. Cursor: two dots, off register in motion, one dot at rest ---------- */
  if (FINE && !CALM) {
    var cur = document.createElement('div');
    cur.className = 'cursor is-hidden';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<i></i><i></i>';
    document.body.appendChild(cur);
    root.classList.add('has-cursor');
    var a = cur.children[0], b = cur.children[1];
    var tx = -100, ty = -100, ax = -100, ay = -100, bx = -100, by = -100, running = false;
    var loop = function () {
      ax += (tx - ax) * 0.34; ay += (ty - ay) * 0.34;
      bx += (tx - bx) * 0.13; by += (ty - by) * 0.13;
      a.style.transform = 'translate3d(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px,0)';
      b.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px,0)';
      if (Math.abs(tx - bx) > 0.1 || Math.abs(ty - by) > 0.1) requestAnimationFrame(loop); else running = false;
    };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX + 18; ty = e.clientY + 18;
      if (cur.classList.contains('is-hidden')) { ax = bx = tx; ay = by = ty; cur.classList.remove('is-hidden'); }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.add('is-hidden'); });
    document.documentElement.addEventListener('mouseleave', function () { cur.classList.add('is-hidden'); });
  }

  /* ---------- 10. Page-to-page: the plates close, then open on the next page ---------- */
  if (!CALM) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest ? e.target.closest('a[href]') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      var url;
      try { url = new URL(link.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchor
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      e.preventDefault();
      root.classList.add('is-leaving');
      // force a frame so the transition starts from the open position
      void document.body.offsetWidth;
      requestAnimationFrame(function () {
        root.classList.add('is-covered');
        setTimeout(function () { location.href = url.href; }, 470);
      });
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) root.classList.remove('is-leaving', 'is-covered');
    });
  }

  /* ---------- 11. Forms ----------
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

  /* ---------- 12. Legal: mark the section you are reading ---------- */
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

  frame();
})();
