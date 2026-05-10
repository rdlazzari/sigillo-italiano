/* Sigillo Italiano — interactions */
(function () {
  'use strict';

  // -------- Sticky nav with scrim on scroll --------
  const nav = document.querySelector('.nav-bar');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -------- Full-screen overlay menu --------
  const toggle  = document.querySelector('.nav-toggle');
  const overlay = document.getElementById('nav-overlay');

  const openMenu = () => {
    if (!overlay || !nav) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    nav.classList.add('menu-open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    if (!overlay || !nav) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    nav.classList.remove('menu-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      overlay && overlay.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }

  if (overlay) {
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    /* close when clicking the overlay backdrop (outside the menu items) */
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMenu();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // -------- Reveal on scroll --------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-visible'));
  }

  // -------- Contact form — AJAX submission via Formspree --------
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.form-submit');
      const err = contactForm.querySelector('.form-error');
      btn.disabled = true;
      if (err) err.hidden = true;
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const msg = contactForm.dataset.success || 'Message sent.';
          contactForm.innerHTML = '<p class="form-success">' + msg + '</p>';
        } else {
          btn.disabled = false;
          if (err) err.hidden = false;
        }
      } catch (_) {
        btn.disabled = false;
        if (err) err.hidden = false;
      }
    });
  }

  // -------- Email obfuscation — assembled by JS, invisible to scrapers --------
  document.querySelectorAll('.js-email').forEach(function (el) {
    var em = el.getAttribute('data-u') + '@' + el.getAttribute('data-d');
    el.href   = 'mai' + 'lto:' + em;
    el.textContent = em;
  });

  // -------- Subtle parallax on hero/photo-break images --------
  const parallaxTargets = document.querySelectorAll('[data-parallax]');
  if (parallaxTargets.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const update = () => {
      parallaxTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!inView) return;
        const speed  = parseFloat(el.dataset.parallax) || 0.18;
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const offset = -center * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
