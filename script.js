// ── Sticky nav ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && hamburger.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Fade-in on scroll ──
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => fadeObserver.observe(el));

// ── FAQ accordion ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');

    document.querySelectorAll('.faq-question.open').forEach(other => {
      other.classList.remove('open');
      other.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      btn.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ── Contact form validation ──
const form = document.getElementById('contact-form');
if (form) {
  const rules = {
    name:    { el: null, error: null, validate: v => v.trim().length >= 2 ? '' : 'Veuillez indiquer votre nom et prénom.' },
    email:   { el: null, error: null, validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Adresse e-mail invalide.' },
    message: { el: null, error: null, validate: v => v.trim().length >= 10 ? '' : 'Votre message est trop court (10 caractères minimum).' },
  };

  Object.keys(rules).forEach(key => {
    rules[key].el    = document.getElementById(key);
    rules[key].error = document.getElementById('error-' + key);
    if (rules[key].el) {
      rules[key].el.addEventListener('blur', () => showError(key));
      rules[key].el.addEventListener('input', () => { if (rules[key].error.textContent) showError(key); });
    }
  });

  function showError(key) {
    const msg = rules[key].validate(rules[key].el.value);
    rules[key].error.textContent = msg;
    rules[key].el.style.borderColor = msg ? '#c0392b' : '';
    return msg === '';
  }

  const successEl = document.getElementById('form-success');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const valid = Object.keys(rules).map(showError).every(Boolean);
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Envoyer ma demande';
      btn.disabled = false;
      form.reset();
      successEl.classList.add('show');
      setTimeout(() => successEl.classList.remove('show'), 6000);
    }, 1200);
  });
}
