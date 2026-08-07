// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

navToggle.addEventListener('click', () => {
  const isOpen = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

primaryNav.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
