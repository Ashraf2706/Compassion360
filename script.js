/* Compassion360 — Site Script */

// ─ Nav scroll behavior ─────────────────────────────
const header = document.getElementById('site-header');
let lastScroll = 0;

function updateHeader() {
  const scrollY = window.scrollY;
  if (scrollY > 24) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = scrollY;
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// ─ Mobile nav toggle ───────────────────────────────
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navMenu.classList.toggle('open', !expanded);
  document.body.style.overflow = !expanded ? 'hidden' : '';

  // force white nav background when menu is open
  if (!expanded) {
    header.classList.add('scrolled');
  } else {
    // restore based on actual scroll position when closing
    if (window.scrollY <= 24) {
      header.classList.remove('scrolled');
    }
  }
});

// Close menu on link click
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!header.contains(e.target) && navMenu.classList.contains('open')) {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─ Scroll-in animations ────────────────────────────
function addAnimations() {
  const targets = [
    '.service-card',
    '.serve-card',
    '.pillar',
    '.mission-card',
    '.about-text',
    '.about-visual',
    '.why-text',
    '.contact-info',
    '.contact-form-wrap',
    '.section-header',
    '.mission-quote',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('animate-in');
      if (i === 1) el.classList.add('delay-1');
      if (i === 2) el.classList.add('delay-2');
      if (i === 3) el.classList.add('delay-3');
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

// Only animate if user hasn't requested reduced motion
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addAnimations();
} else {
  // Still make elements visible without animation
  document.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
}

// ─ Active nav link on scroll ───────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${id}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(section => sectionObserver.observe(section));

// ─ Contact form validation ─────────────────────────
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (!error) return;
  input.classList.add('invalid');
  error.textContent = message;
  error.classList.add('visible');
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (!error) return;
  input.classList.remove('invalid');
  error.textContent = '';
  error.classList.remove('visible');
}

// Live validation on blur
['name', 'email', 'message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => validateField(id));
  el.addEventListener('input', () => {
    if (el.classList.contains('invalid')) validateField(id);
  });
});

function validateField(id) {
  const el = document.getElementById(id);
  const val = el.value.trim();
  clearError(id);

  if (id === 'name' && !val) {
    showError('name', 'Please enter your full name.');
    return false;
  }
  if (id === 'email') {
    if (!val) { showError('email', 'Please enter your email address.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError('email', 'Please enter a valid email address.'); return false;
    }
  }
  if (id === 'message' && !val) {
    showError('message', 'Please enter your message.'); return false;
  }
  return true;
}

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const validName    = validateField('name');
    const validEmail   = validateField('email');
    const validMessage = validateField('message');

    if (!validName || !validEmail || !validMessage) {
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1400));

    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    formSuccess.hidden = false;
    formSuccess.focus();

    setTimeout(() => { formSuccess.hidden = true; }, 6000);
  });
}

// ─ Smooth scroll for anchor links ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // account for fixed header
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─ Dropdown toggle (mobile tap) ─────────────────────
document.querySelectorAll('.nav-dropdown-chevron').forEach(chevron => {
  chevron.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = chevron.closest('.nav-dropdown').querySelector('.nav-dropdown-menu');
    const isOpen = menu.classList.contains('open');

    // close any other open dropdowns first
    document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.nav-dropdown-chevron').forEach(c => c.setAttribute('aria-expanded', 'false'));

    if (!isOpen) {
      menu.classList.add('open');
      chevron.setAttribute('aria-expanded', 'true');
    }
  });
});

// close dropdown when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-dropdown-menu.open').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.nav-dropdown-chevron').forEach(c => c.setAttribute('aria-expanded', 'false'));
});

// ─ File upload labels ───────────────────────────────
document.querySelectorAll('.file-upload-zone').forEach(zone => {
  const input = zone.querySelector('input[type="file"]');
  const nameEl = zone.querySelector('.file-upload-name');
  const ctaEl  = zone.querySelector('.file-upload-cta');

  if (!input) return;

  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      const fileName = input.files[0].name;
      zone.classList.add('has-file');
      if (nameEl) { nameEl.textContent = fileName; nameEl.hidden = false; }
      if (ctaEl)  { ctaEl.textContent = 'File selected — click to change'; }
    }
  });

  zone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
});

// ─ Careers form ─────────────────────────────────────
const careersForm      = document.getElementById('careersForm');
const careersSubmitBtn = document.getElementById('careersSubmitBtn');
const careersSuccess   = document.getElementById('careersSuccess');

if (careersForm) {
  const cFields = {
    'c-name':     { required: true,  message: 'Please enter your full name.' },
    'c-email':    { required: true,  message: 'Please enter a valid email address.', isEmail: true },
    'c-phone':    { required: true,  message: 'Please enter your phone number.' },
    'c-position': { required: true,  message: 'Please select a position of interest.' },
    'c-message':  { required: true,  message: 'Please add a short cover note.' },
    'c-resume':   { required: true,  message: 'Please upload your resume.', isFile: true },
  };

  function validateCareersField(id) {
    const el    = document.getElementById(id);
    const error = document.getElementById(id + '-error');
    const rules = cFields[id];
    if (!el || !error || !rules) return true;

    const val = rules.isFile
      ? (el.files && el.files.length > 0)
      : el.value.trim();

    el.classList.remove('invalid');
    error.textContent = '';
    error.classList.remove('visible');

    if (rules.required && !val) {
      el.classList.add('invalid');
      error.textContent = rules.message;
      error.classList.add('visible');
      return false;
    }
    if (rules.isEmail && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) {
      el.classList.add('invalid');
      error.textContent = rules.message;
      error.classList.add('visible');
      return false;
    }
    return true;
  }

  Object.keys(cFields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => validateCareersField(id));
    el.addEventListener('change', () => validateCareersField(id));
  });

  careersForm.addEventListener('submit', async e => {
    e.preventDefault();
    const allValid = Object.keys(cFields).map(id => validateCareersField(id)).every(Boolean);
    if (!allValid) {
      const first = careersForm.querySelector('.invalid');
      if (first) first.focus();
      return;
    }

    careersSubmitBtn.disabled = true;
    careersSubmitBtn.textContent = 'Submitting…';

    await new Promise(r => setTimeout(r, 1500));

    careersForm.reset();
    document.querySelectorAll('.file-upload-zone').forEach(zone => {
      zone.classList.remove('has-file');
      const nameEl = zone.querySelector('.file-upload-name');
      const ctaEl  = zone.querySelector('.file-upload-cta');
      if (nameEl) { nameEl.hidden = true; nameEl.textContent = ''; }
      if (ctaEl && ctaEl.dataset.original) ctaEl.textContent = ctaEl.dataset.original;
    });

    careersSubmitBtn.disabled = false;
    careersSubmitBtn.innerHTML = `Submit Application <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    careersSuccess.hidden = false;
    careersSuccess.focus();
    setTimeout(() => { careersSuccess.hidden = true; }, 8000);
  });
}

// ─ Font Size Resizer ────────────────────────────────
(function () {
  const root        = document.documentElement;
  const increaseBtn = document.getElementById('fontIncrease');
  const decreaseBtn = document.getElementById('fontDecrease');
  const resetBtn    = document.getElementById('fontReset');

  // Size steps in px — default is 16
  const sizes    = [14, 16, 18, 20, 22, 24];
  const DEFAULT  = 18;
  let currentSize = parseInt(localStorage.getItem('c360-font-size')) || DEFAULT;

  // Apply size on load
  applySize(currentSize);

  function applySize(size) {
    currentSize = size;
    root.style.fontSize = size + 'px';
    localStorage.setItem('c360-font-size', size);

    // Disable buttons at limits
    if (decreaseBtn) decreaseBtn.disabled = size <= sizes[0];
    if (increaseBtn) increaseBtn.disabled = size >= sizes[sizes.length - 1];

    // Highlight reset when not at default
    if (resetBtn) {
      resetBtn.classList.toggle('active', size !== DEFAULT);
    }
  }

  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      const idx = sizes.indexOf(currentSize);
      if (idx < sizes.length - 1) applySize(sizes[idx + 1]);
    });
  }

  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      const idx = sizes.indexOf(currentSize);
      if (idx > 0) applySize(sizes[idx - 1]);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => applySize(DEFAULT));
  }
})();