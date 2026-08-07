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

// About page — sidebar tab switching
const aboutNav = document.getElementById('aboutNav');
if (aboutNav) {
  const navScroller = aboutNav.closest('.about-sidebar') || aboutNav;
  const navLinks = aboutNav.querySelectorAll('.about-nav-link');
  const panels = document.querySelectorAll('.about-panel');

  const centerActiveLink = (link) => {
    const scrollerRect = navScroller.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const linkOffset = navScroller.scrollLeft + (linkRect.left - scrollerRect.left);
    const targetLeft = linkOffset - (navScroller.clientWidth / 2) + (linkRect.width / 2);
    navScroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const showPanel = (target, centerLink) => {
    if (!document.getElementById(target)) return;
    navLinks.forEach((link) => {
      const isActive = link.dataset.target === target;
      link.classList.toggle('active', isActive);
      if (isActive && centerLink) centerActiveLink(link);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === target);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPanel(link.dataset.target, true);
      history.replaceState(null, '', `#${link.dataset.target}`);
    });
  });

  const initialTarget = window.location.hash.replace('#', '');
  if (initialTarget) showPanel(initialTarget, true);
}
