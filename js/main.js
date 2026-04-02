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
    runCycle(1, null);
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

// ── Cursor subtle glow trail (full page) ───────────────────────
(function initCursorGlow() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  document.addEventListener('mousemove', e => {
    const grad = ctx.createRadialGradient(e.clientX, e.clientY, 0, e.clientX, e.clientY, 160);
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

// ── Scroll progress bar ─────────────────────────────────────────
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive: true });
})();

// ── Copy to clipboard ───────────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const text = btn.dataset.copy;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);
    }).catch(() => {});
  });
});

// ── Resume download GA tracking ─────────────────────────────────
document.querySelectorAll('a[download]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'resume_download', {
        event_category: 'engagement',
        event_label: link.id || link.className || 'resume'
      });
    }
  });
});

// ── Navbar Resume dropdown (toggle + share) ────────────────────
(function initNavResume() {
  const wrap     = document.getElementById('navResumeWrap');
  const btn      = document.getElementById('navResumeBtn');
  const shareBtn = document.getElementById('navShareBtn');
  if (!wrap || !btn) return;

  function toggleNav(force) {
    const isOpen = force !== undefined ? force : !wrap.classList.contains('open');
    wrap.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  }

  btn.addEventListener('click', e => { e.stopPropagation(); toggleNav(); });
  document.addEventListener('click', () => toggleNav(false));
  window.addEventListener('scroll', () => toggleNav(false), { passive: true });
  wrap.addEventListener('click', e => e.stopPropagation());

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const pdfUrl  = 'Nawaaz_Mohammed_resume.pdf';
      const fileName = 'Nawaaz_Mohammed_Resume.pdf';
      toggleNav(false);

      if (navigator.canShare) {
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Share';
        fetch(pdfUrl)
          .then(r => r.blob())
          .then(blob => {
            const file = new File([blob], fileName, { type: 'application/pdf' });
            if (navigator.canShare({ files: [file] })) {
              return navigator.share({ title: 'Nawaaz Mohammed — Resume', text: 'Resume of Nawaaz Mohammed, DevOps Engineer', files: [file] });
            }
            return navigator.share({ title: 'Nawaaz Mohammed — Resume', url: window.location.origin + '/' + pdfUrl });
          })
          .then(() => { shareBtn.innerHTML = '<i class="fas fa-check"></i> Shared!'; setTimeout(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share'; }, 2000); })
          .catch(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share'; });
      } else if (navigator.share) {
        navigator.share({ title: 'Nawaaz Mohammed — Resume', url: window.location.origin + '/' + pdfUrl }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.origin + '/' + pdfUrl)
          .then(() => { shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!'; setTimeout(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share'; }, 2000); })
          .catch(() => {});
      }
    });
  }
})();

// ── Floating FAB group (toggle + share) ────────────────────────
(function initFab() {
  const group    = document.getElementById('fabGroup');
  const mainBtn  = document.getElementById('fabMainBtn');
  const shareBtn = document.getElementById('fabShareBtn');
  if (!group || !mainBtn) return;

  function toggleFab(force) {
    const isOpen = force !== undefined ? force : !group.classList.contains('open');
    group.classList.toggle('open', isOpen);
    mainBtn.classList.toggle('open', isOpen);
    mainBtn.setAttribute('aria-expanded', isOpen);
    mainBtn.innerHTML = isOpen
      ? '<i class="fas fa-times"></i>'
      : '<span class="fab-main-icons"><i class="fas fa-download"></i><i class="fas fa-share-alt"></i></span>';
  }

  mainBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleFab();
  });

  // Close when clicking outside or scrolling
  document.addEventListener('click', () => toggleFab(false));
  window.addEventListener('scroll', () => toggleFab(false), { passive: true });
  group.addEventListener('click', e => e.stopPropagation());

  // Share button
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const pdfUrl = 'Nawaaz_Mohammed_resume.pdf';
      const fileName = 'Nawaaz_Mohammed_Resume.pdf';

      // Try to share as actual file (Web Share API Level 2)
      if (navigator.canShare) {
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        fetch(pdfUrl)
          .then(r => r.blob())
          .then(blob => {
            const file = new File([blob], fileName, { type: 'application/pdf' });
            if (navigator.canShare({ files: [file] })) {
              return navigator.share({
                title: 'Nawaaz Mohammed — Resume',
                text: 'Resume of Nawaaz Mohammed, DevOps Engineer',
                files: [file]
              });
            } else {
              // Device doesn't support file sharing, fall back to URL share
              return navigator.share({
                title: 'Nawaaz Mohammed — Resume',
                text: 'Resume of Nawaaz Mohammed, DevOps Engineer',
                url: window.location.origin + '/' + pdfUrl
              });
            }
          })
          .then(() => {
            shareBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>'; }, 2000);
          })
          .catch(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>'; });
      } else if (navigator.share) {
        // Fallback: share URL
        navigator.share({
          title: 'Nawaaz Mohammed — Resume',
          text: 'Resume of Nawaaz Mohammed, DevOps Engineer',
          url: window.location.origin + '/' + pdfUrl
        }).catch(() => {});
      } else {
        // Last resort: copy link to clipboard
        navigator.clipboard.writeText(window.location.origin + '/' + pdfUrl)
          .then(() => {
            shareBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>'; }, 2000);
          }).catch(() => {});
      }
    });
  }
})();
// ── 3D Card Tilt on mouse move ──────────────────────────────────
(function init3DTilt() {
  const MAX_TILT = 12;

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rotY =  dx * MAX_TILT;
    const rotX = -dy * MAX_TILT;
    card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
    card.style.boxShadow  = `${-rotY * 1.5}px ${rotX * 1.5}px 40px rgba(0,212,255,0.18), 0 8px 48px rgba(0,0,0,0.5)`;
    card.style.borderColor = 'rgba(0,212,255,0.4)';
    const shine = card.querySelector('.tilt-shine');
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${50 + dx*30}% ${50 + dy*30}%, rgba(255,255,255,0.11) 0%, transparent 65%)`;
      shine.style.opacity = '1';
    }
  }

  function resetTilt(card) {
    card.style.transform   = '';
    card.style.boxShadow   = '';
    card.style.borderColor = '';
    const shine = card.querySelector('.tilt-shine');
    if (shine) { shine.style.background = ''; shine.style.opacity = ''; }
  }

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => applyTilt(card, e), { passive: true });
    card.addEventListener('mouseleave', () => resetTilt(card));
  });
})();

// ── Hero 3D Mouse Parallax ──────────────────────────────────────
(function initHeroParallax() {
  const hero    = document.getElementById('hero');
  const content = hero ? hero.querySelector('.hero-content') : null;
  if (!hero || !content) return;

  const layers = [
    { el: content.querySelector('.hero-greeting'),  depth: 0.012 },
    { el: content.querySelector('.hero-name'),       depth: 0.025 },
    { el: content.querySelector('.hero-title-wrap'), depth: 0.018 },
    { el: content.querySelector('.hero-tagline'),    depth: 0.010 },
    { el: content.querySelector('.hero-cta'),        depth: 0.008 },
    { el: content.querySelector('.hero-socials'),    depth: 0.006 },
  ].filter(l => l.el);

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf = null;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    targetX = e.clientX - rect.left - rect.width  / 2;
    targetY = e.clientY - rect.top  - rect.height / 2;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  function tick() {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    layers.forEach(({ el, depth }) => {
      el.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
    });
    raf = requestAnimationFrame(tick);
  }
})();

// ── 3D Depth Particle System (replaces 2D) ─────────────────────
(function upgrade3DParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  // Stop old 2D loop by replacing the canvas context draw — we hijack via new RAF
  const ctx  = canvas.getContext('2d');
  const FOCAL = 500;
  let W, H, particles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class P3 {
    constructor(init) { this.reset(init); }
    reset(init) {
      this.x  = (Math.random() - 0.5) * W * 2.2;
      this.y  = (Math.random() - 0.5) * H * 2.2;
      this.z  = init ? Math.random() * FOCAL : FOCAL;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.vz = -(Math.random() * 0.9 + 0.15);
    }
    project() {
      const s = FOCAL / (FOCAL + this.z);
      return { sx: this.x * s + W / 2, sy: this.y * s + H / 2, size: Math.max(0.3, s * 2.4), alpha: Math.min(0.85, s * 0.75) };
    }
  }

  const COUNT = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 10000), 140);
  for (let i = 0; i < COUNT; i++) particles.push(new P3(true));

  function draw3D() {
    ctx.clearRect(0, 0, W, H);
    particles.sort((a, b) => b.z - a.z);

    // Connections
    for (let i = 0; i < particles.length; i++) {
      const pi = particles[i].project();
      for (let j = i + 1; j < particles.length; j++) {
        const pj = particles[j].project();
        const dist = Math.hypot(pi.sx - pj.sx, pi.sy - pj.sy);
        if (dist < 120) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 120) * 0.13 * Math.min(pi.alpha, pj.alpha);
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth   = 0.5;
          ctx.beginPath(); ctx.moveTo(pi.sx, pi.sy); ctx.lineTo(pj.sx, pj.sy); ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (p.z <= 1) p.reset(false);
      const { sx, sy, size, alpha } = p.project();
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
      const t = 1 - p.z / FOCAL;
      ctx.save();
      ctx.globalAlpha  = alpha;
      ctx.fillStyle    = `rgb(${Math.round(t*0)},${Math.round(100 + t*112)},${Math.round(180 + t*75)})`;
      ctx.shadowBlur   = size * 4;
      ctx.shadowColor  = `rgba(0,212,255,${alpha * 0.5})`;
      ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw3D);
  }
  draw3D();
})();
