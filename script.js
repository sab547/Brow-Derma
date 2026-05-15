// Sticky nav
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Hamburger
const burger   = document.getElementById('burger');
const navlinks = document.getElementById('navlinks');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  navlinks.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open');
  navlinks.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && burger.classList.contains('open')) {
    burger.classList.remove('open');
    navlinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// Active nav link
const sections = document.querySelectorAll('section[id], header[id]');
const links    = document.querySelectorAll('.nav__links a');
new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe !== undefined &&
  sections.forEach(s => new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav__links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' }).observe(s));

// Fade-in
new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 }).observe !== undefined &&
  document.querySelectorAll('.fade-in').forEach(el =>
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        entries[0].target.classList.add('visible');
        obs.unobserve(entries[0].target);
      }
    }, { threshold: 0.08 }).observe(el)
  );

// FAQ accordion
document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const ans    = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq__q.open').forEach(other => {
      other.classList.remove('open');
      other.nextElementSibling.style.maxHeight = null;
    });
    if (!isOpen) {
      btn.classList.add('open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

// Contact form
const form = document.getElementById('contact-form');
if (form) {
  const rules = {
    name:    { validate: v => v.trim().length >= 2 ? '' : 'Veuillez indiquer votre nom et prénom.' },
    email:   { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Adresse e-mail invalide.' },
    message: { validate: v => v.trim().length >= 10 ? '' : 'Message trop court (10 caractères minimum).' },
  };
  Object.keys(rules).forEach(k => {
    const el  = document.getElementById(k);
    const err = document.getElementById('err-' + k);
    rules[k].el  = el;
    rules[k].err = err;
    if (el) {
      el.addEventListener('blur',  () => showErr(k));
      el.addEventListener('input', () => { if (err.textContent) showErr(k); });
    }
  });
  function showErr(k) {
    const msg = rules[k].validate(rules[k].el.value);
    rules[k].err.textContent = msg;
    rules[k].el.style.borderColor = msg ? '#c0392b' : '';
    return !msg;
  }
  const okEl = document.getElementById('form-ok');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!Object.keys(rules).map(showErr).every(Boolean)) return;
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Envoyer ma demande';
      btn.disabled = false;
      form.reset();
      okEl.classList.add('show');
      setTimeout(() => okEl.classList.remove('show'), 6000);
    }, 1200);
  });
}
