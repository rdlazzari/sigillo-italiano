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

  // -------- Mobile nav toggle --------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('is-open');
      const isOpen = links.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
    }));
  }

  // -------- Reveal on scroll --------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-visible'));
  }

  // -------- Subtle parallax on hero/photo-break images --------
  const parallaxTargets = document.querySelectorAll('[data-parallax]');
  if (parallaxTargets.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const update = () => {
      parallaxTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!inView) return;
        const speed = parseFloat(el.dataset.parallax) || 0.18;
        // distance from viewport center, normalized
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const offset = -center * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // -------- Contact form — AJAX submission via Formspree --------
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.form-submit');
      const err = contactForm.querySelector('.form-error');

      if (btn) btn.disabled = true;
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
          if (btn) btn.disabled = false;
          if (err) err.hidden = false;
        }
      } catch (error) {
        if (btn) btn.disabled = false;
        if (err) err.hidden = false;
      }
    });
  }
})();
