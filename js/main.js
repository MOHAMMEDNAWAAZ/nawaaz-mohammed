/* ============================================================
   MAIN.JS  —  Portfolio Site for Nawaaz Mohammed
   ============================================================ */

// ── Auto-scroll hint: scroll down then back, twice ─────────────
(function autoScrollHint() {
  const SCROLL_AMOUNT = 220;   // px to scroll down each time
  const SCROLL_DURATION = 600; // ms for each scroll move
  const PAUSE = 400;           // ms pause at bottom before scrolling back

  function smoothScrollTo(target, duration, onDone) {
    const start = window.scrollY;
    const diff  = target - start;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed  = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress; // easeInOutQuad
      window.scrollTo(0, start + diff * ease);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function runCycle(count, onDone) {
    if (count <= 0) { if (onDone) onDone(); return; }
    smoothScrollTo(SCROLL_AMOUNT, SCROLL_DURATION, () => {
      setTimeout(() => {
        smoothScrollTo(0, SCROLL_DURATION, () => {
          setTimeout(() => runCycle(count - 1, onDone), 300);
        });
      }, PAUSE);
    });
  }

  // Start after hero animations finish; cancel if user scrolls first
  let cancelled = false;
  const cancelOnScroll = () => { cancelled = true; };
  window.addEventListener('scroll', cancelOnScroll, { once: true, passive: true });

  setTimeout(() => {
    if (cancelled) return;
    window.removeEventListener('scroll', cancelOnScroll);
    runCycle(2, null);
  }, 2600);
})();

// ── Scroll hint: continuous pulse after fade-in completes ───────
setTimeout(() => {
  const hint = document.querySelector('.hero-scroll-hint');
  if (hint) hint.classList.add('is-pulsing');
}, 2200);

// ── Navbar: scroll effect + active link highlight ──────────────
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('#navLinks li a:not(.btn-download-nav)');

window.addEventListener('scroll', () => {
  // Scrolled class
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.id;
    }
  });
  navLinkEls.forEach(link => {
    link.parentElement.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && href === `#${current}`) {
      link.parentElement.classList.add('active');
    }
  });

  // Back to top
  const btn = document.getElementById('backToTop');
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}, { passive: true });

// ── Back-to-top button ──────────────────────────────────────────
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Hamburger mobile menu ───────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ── Typed text effect ───────────────────────────────────────────
const words = [
  'DevOps Engineer',
  'AWS Cloud Migration Specialist',
  'Terraform Expert'
];
let wordIdx   = 0;
let charIdx   = 0;
let isDeleting = false;
const typedEl  = document.getElementById('typedText');

function typeLoop() {
  const current = words[wordIdx];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
    }
  }

  const speed = isDeleting ? 50 : 90;
  setTimeout(typeLoop, speed);
}

// Start after hero animations
setTimeout(typeLoop, 1600);

// ── Particle Canvas ─────────────────────────────────────────────
(function initParticles() {
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * w;
      this.y    = Math.random() * h;
      this.size = Math.random() * 1.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.opDir = Math.random() > 0.5 ? 1 : -1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity += this.opDir * 0.003;
      if (this.opacity >= 0.65 || this.opacity <= 0.05) this.opDir *= -1;
      if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Init particles
  const count = Math.min(Math.floor((w * h) / 14000), 120);
  for (let i = 0; i < count; i++) particles.push(new Particle());

  // Draw lines between close particles
  function drawConnections() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }
  animate();

  // Pause when hero is scrolled past (perf)
  const hero = document.getElementById('hero');
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) animate();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0 });
  io.observe(hero);
})();

// ── Scroll-reveal (AOS-lite) ────────────────────────────────────
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
})();

// ── Counter animation on section enter ─────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const dur    = 1500;
        const start  = performance.now();

        function tick(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / dur, 1);
          // easeOutExpo
          const ease = 1 - Math.pow(2, -10 * progress);
          el.textContent = Math.round(ease * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ── Skill bars animate on scroll ───────────────────────────────
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.getAttribute('data-width') + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

// ── Smooth-scroll for all nav/anchor links ──────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Cursor subtle glow trail on hero ───────────────────────────
(function initCursorGlow() {
  const hero   = document.getElementById('hero');
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let mx = -999, my = -999;

  hero.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    // Draw a soft radial glow at cursor position
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.06)');
    grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, { passive: true });
})();

// ── Collect sender metadata (all hidden, never shown in form) ──────────
(function collectSenderMetadata() {
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  const ua  = navigator.userAgent;

  // Browser
  let browser = 'Unknown';
  if      (/Edg\//.test(ua))     browser = 'Edge '    + (ua.match(/Edg\/([\.\d]+)/)     || ['',''])[1];
  else if (/OPR\//.test(ua))     browser = 'Opera '   + (ua.match(/OPR\/([\.\d]+)/)     || ['',''])[1];
  else if (/Chrome\//.test(ua))  browser = 'Chrome '  + (ua.match(/Chrome\/([\.\d]+)/)  || ['',''])[1];
  else if (/Firefox\//.test(ua)) browser = 'Firefox ' + (ua.match(/Firefox\/([\.\d]+)/) || ['',''])[1];
  else if (/Safari\//.test(ua))  browser = 'Safari '  + (ua.match(/Version\/([\.\d]+)/) || ['',''])[1];

  // OS
  let os = 'Unknown';
  if      (/Windows NT 10/.test(ua))   os = 'Windows 10/11';
  else if (/Windows NT/.test(ua))      os = 'Windows';
  else if (/Mac OS X/.test(ua))        os = 'macOS ' + ((ua.match(/Mac OS X ([\d_]+)/) || ['',''])[1].replace(/_/g, '.'));
  else if (/Android ([\d.]+)/.test(ua)) os = 'Android ' + RegExp.$1;
  else if (/(iPhone|iPad)/.test(ua))   os = 'iOS ' + ((ua.match(/OS ([\d_]+)/) || ['',''])[1].replace(/_/g, '.'));
  else if (/Linux/.test(ua))           os = 'Linux';

  // Device type
  const device = /Tablet|iPad/i.test(ua) ? 'Tablet' : /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop';

  // Populate sync fields
  set('sender-device',   device + ' — ' + os);
  set('sender-browser',  browser);
  set('sender-screen',   screen.width + 'x' + screen.height + ' (DPR: ' + window.devicePixelRatio + ')');
  set('sender-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  set('sender-language', navigator.language);

  // IP + location + ISP (async)
  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(d => {
      set('sender-location', [d.city, d.region, d.country_name].filter(Boolean).join(', '));
      set('sender-ip-info',  'IP: ' + d.ip + ' | ISP: ' + d.org + ' | TZ: ' + d.timezone);
    })
    .catch(() => {});

  // GPS pinpoint — mandatory, form is blocked if denied
  const form   = document.querySelector('.contact-form');
  const geoErr = document.getElementById('form-geo-error');

  // Declared as a statement so it is hoisted and accessible everywhere below
  function handleGeoSubmit(e) {
    e.preventDefault();
    form.removeEventListener('submit', handleGeoSubmit);
    if (geoErr) geoErr.style.display = 'none';

    if (!('geolocation' in navigator)) {
      // Browser has no geolocation support — block and inform
      if (geoErr) {
        geoErr.style.display = 'block';
        geoErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.addEventListener('submit', handleGeoSubmit);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const acc = Math.round(pos.coords.accuracy);
        set('sender-gps-link',
          'https://www.google.com/maps?q=' + lat + ',' + lng +
          ' (accuracy: \u00b1' + acc + 'm)');
        form.submit();
      },
      () => {
        // Denied, dismissed, or timed out — block the form, show error, allow retry
        if (geoErr) {
          geoErr.style.display = 'block';
          geoErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.addEventListener('submit', handleGeoSubmit);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  if (form) {
    form.addEventListener('submit', handleGeoSubmit);
  }
})();
