/* ==========================================================================
   Vanilla ports of ReactBits components (https://reactbits.dev)
   - DecryptedText, CountUp, SpotlightCard, ScrollReveal
   ========================================================================== */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- DecryptedText: reveal characters left-to-right through random glyphs ---- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$<>/\\';
  function decrypt(el) {
    const target = el.dataset.text || el.textContent;
    if (reduced) { el.textContent = target; return; }
    const speed = +(el.dataset.speed || 45);
    let revealed = 0;
    el.setAttribute('aria-label', target);
    const tick = setInterval(() => {
      let out = '';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        if (i < revealed || ch === ' ') out += ch;
        else out += '<span class="enc" aria-hidden="true">' + GLYPHS[(Math.random() * GLYPHS.length) | 0] + '</span>';
      }
      el.innerHTML = out;
      if (revealed++ > target.length) { clearInterval(tick); el.textContent = target; }
    }, speed);
  }

  /* ---- CountUp: animate numbers once visible ---- */
  function countUp(el) {
    const to = parseFloat(el.dataset.to);
    const decimals = +(el.dataset.decimals || 0);
    const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (reduced) { el.textContent = fmt(to); return; }
    const dur = 1600, t0 = performance.now();
    (function frame(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }

  /* ---- SpotlightCard: track cursor position in CSS vars ---- */
  document.querySelectorAll('.spotlight').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---- ScrollReveal + triggers for CountUp/Decrypt ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('reveal')) el.classList.add('in');
      if (el.classList.contains('count-up')) countUp(el);
      if (el.classList.contains('decrypt')) decrypt(el);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .count-up, .decrypt').forEach((el, i) => {
    if (el.classList.contains('reveal')) el.style.transitionDelay = ((i % 4) * 70) + 'ms';
    io.observe(el);
  });
})();

/* ==========================================================================
   Round 2: ScrollProgress, RotatingText, Magnet, ClickSpark,
   active-nav, section line draw, chart draw-in (ports of reactbits.dev ideas)
   ========================================================================== */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll progress */
  const bar = document.getElementById('scrollProgress');
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = 'scaleX(' + (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) + ')';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* RotatingText (typewriter) */
  const rot = document.querySelector('.rotator .word');
  if (rot) {
    const words = JSON.parse(rot.dataset.words);
    let wi = 0, ci = words[0].length, deleting = false;
    rot.textContent = words[0];
    if (!reduced) (function step() {
      const w = words[wi];
      if (!deleting && ci === w.length) { deleting = true; return setTimeout(step, 1800); }
      if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      ci += deleting ? -1 : 1;
      rot.textContent = words[wi].slice(0, ci);
      setTimeout(step, deleting ? 35 : 65);
    })();
  }

  /* Magnet buttons */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn, .theme-toggle-btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ClickSpark */
  if (!reduced) document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      const a = (i / 8) * Math.PI * 2;
      s.className = 'spark';
      s.style.left = e.clientX + 'px';
      s.style.top = (e.clientY - 10) + 'px';
      s.style.rotate = (a * 180 / Math.PI + 90) + 'deg';
      s.style.setProperty('--dx', Math.cos(a) * 22 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 22 + 'px');
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  });

  /* Section header line draw */
  const hio = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); hio.unobserve(en.target); }
  }), { threshold: 0.5 });
  document.querySelectorAll('.section-header').forEach((h) => hio.observe(h));

  /* Active nav link */
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sio = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => sio.observe(s));

  /* Chart draw-in: measure path lengths after every render */
  const panel = document.getElementById('chart-panel');
  const prep = () => panel.querySelectorAll('.chart-svg path[stroke]').forEach((p) => {
    if (p.getAttribute('stroke-dasharray')) {           // keep dashed style; fade instead
      p.style.animation = 'fadeIn 1s ease both';
      return;
    }
    p.style.setProperty('--len', Math.ceil(p.getTotalLength()));
  });
  new MutationObserver(prep).observe(panel, { childList: true });
  prep();
})();

/* Replay chart draw-in when the benchmarks section first scrolls into view */
(function () {
  const sec = document.getElementById('telemetry');
  const o = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) { renderChart(window.currentChartKey); o.disconnect(); }
  }, { threshold: 0.3 });
  o.observe(sec);
})();
