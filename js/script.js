// One script.js is loaded on every page (as js/script.js from the root
// pages, ../js/script.js from blog/*.html). Each block below is guarded by
// checking that its page-specific element exists (e.g. `if (aboutNav)`),
// so it's safe to add new blocks here — they simply do nothing on pages
// that don't have the relevant markup. Follow that pattern for new features.

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
  const aboutWheel = document.getElementById('aboutWheel');
  const wheelItems = aboutWheel ? aboutWheel.querySelectorAll('.about-wheel-item') : [];

  const centerActiveLink = (link) => {
    const scrollerRect = navScroller.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const linkOffset = navScroller.scrollLeft + (linkRect.left - scrollerRect.left);
    const targetLeft = linkOffset - (navScroller.clientWidth / 2) + (linkRect.width / 2);
    navScroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  // Fades/shrinks each wheel option by its distance from the wheel's
  // vertical centre, and flags whichever one is currently in that centre
  // band so it can be styled as the "selected" row.
  const updateWheelVisual = () => {
    if (!aboutWheel) return;
    const containerRect = aboutWheel.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    wheelItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - centerY);
      const norm = Math.min(dist / (containerRect.height / 2), 1);
      item.style.opacity = String(1 - norm * 0.7);
      item.style.transform = `scale(${(1 - norm * 0.14).toFixed(3)})`;
      item.classList.toggle('is-center', dist < rect.height / 2);
      item.setAttribute('aria-selected', dist < rect.height / 2 ? 'true' : 'false');
    });
  };

  const centerWheelItem = (target, smooth) => {
    if (!aboutWheel) return;
    const item = aboutWheel.querySelector(`.about-wheel-item[data-target="${target}"]`);
    if (!item) return;
    const top = item.offsetTop - aboutWheel.clientHeight / 2 + item.offsetHeight / 2;
    aboutWheel.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };

  const showPanel = (target, moveIndicator) => {
    if (!document.getElementById(target)) return;
    navLinks.forEach((link) => {
      const isActive = link.dataset.target === target;
      link.classList.toggle('active', isActive);
      if (isActive && moveIndicator) centerActiveLink(link);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === target);
    });
    if (moveIndicator) centerWheelItem(target, true);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPanel(link.dataset.target, true);
      history.replaceState(null, '', `#${link.dataset.target}`);
    });
  });

  if (aboutWheel) {
    wheelItems.forEach((item) => {
      item.addEventListener('click', () => {
        showPanel(item.dataset.target, true);
        history.replaceState(null, '', `#${item.dataset.target}`);
      });
    });

    // While scrolling, just update the fade/scale live. Once scrolling has
    // been idle for a moment, treat whichever item settled in the centre as
    // the selection and swap the panel.
    let wheelSettleTimer = null;
    aboutWheel.addEventListener('scroll', () => {
      updateWheelVisual();
      if (wheelSettleTimer) clearTimeout(wheelSettleTimer);
      wheelSettleTimer = setTimeout(() => {
        const centered = aboutWheel.querySelector('.about-wheel-item.is-center');
        if (centered) {
          showPanel(centered.dataset.target, false);
          history.replaceState(null, '', `#${centered.dataset.target}`);
        }
      }, 120);
    }, { passive: true });

    updateWheelVisual();
  }

  const initialTarget = window.location.hash.replace('#', '');
  if (initialTarget) showPanel(initialTarget, true);
}

// Shared filter/sort behaviour for a grid of cards (blog index, research
// publications). `filters` is a list of { select, test(card, value) } pairs;
// `sortFns` maps a sort-select value to a comparator. To wire up a new
// filterable list elsewhere on the site: give its container an id, give
// each item a data-* attribute to filter/sort on, add the matching
// <select>/<button> markup (reuse the .filter-bar/.filter-group CSS), and
// call this function once for that container — see the two call sites
// below for the pattern.
function setupCardFilterSort({ grid, cardSelector, filters, sortSelect, sortFns, defaultSort, resetBtn, emptyState }) {
  const cards = Array.from(grid.querySelectorAll(cardSelector));

  const applySort = () => {
    const sortFn = sortFns[sortSelect ? sortSelect.value : defaultSort];
    if (!sortFn) return;
    [...cards].sort(sortFn).forEach((card) => grid.appendChild(card));
  };

  const applyFilters = () => {
    let visibleCount = 0;
    cards.forEach((card) => {
      const matches = filters.every(({ select, test }) => select.value === 'all' || test(card, select.value));
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  };

  const update = () => {
    applySort();
    applyFilters();
  };

  filters.forEach(({ select }) => select.addEventListener('change', update));
  if (sortSelect) sortSelect.addEventListener('change', update);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filters.forEach(({ select }) => { select.value = 'all'; });
      if (sortSelect) sortSelect.value = defaultSort;
      update();
    });
  }

  update();
  return cards;
}

// Populate a <select>'s options from a set of values found in the DOM, so
// year filters stay correct as new posts/publications get added.
function populateYearOptions(select, years) {
  Array.from(new Set(years))
    .sort((a, b) => b.localeCompare(a))
    .forEach((year) => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    });
}

// Blog index — filter by type/year/month, sort by date
const blogGrid = document.getElementById('blogGrid');
if (blogGrid) {
  const typeSelect = document.getElementById('blogFilterType');
  const yearSelect = document.getElementById('blogFilterYear');
  const monthSelect = document.getElementById('blogFilterMonth');

  populateYearOptions(
    yearSelect,
    Array.from(blogGrid.querySelectorAll('.blog-card')).map((card) => card.dataset.date.slice(0, 4))
  );

  setupCardFilterSort({
    grid: blogGrid,
    cardSelector: '.blog-card',
    filters: [
      { select: typeSelect, test: (card, value) => card.dataset.type === value },
      { select: yearSelect, test: (card, value) => card.dataset.date.slice(0, 4) === value },
      { select: monthSelect, test: (card, value) => String(Number(card.dataset.date.split('-')[1])) === value },
    ],
    sortSelect: document.getElementById('blogSort'),
    sortFns: {
      newest: (a, b) => b.dataset.date.localeCompare(a.dataset.date),
      oldest: (a, b) => a.dataset.date.localeCompare(b.dataset.date),
    },
    defaultSort: 'newest',
    resetBtn: document.getElementById('blogResetFilters'),
    emptyState: document.getElementById('blogEmptyState'),
  });
}

// Research page — filter publications and conference presentations by
// year (shared Year/Sort controls), sort by year
const pubList = document.getElementById('pubList');
const confList = document.getElementById('confList');
if (pubList || confList) {
  const yearSelect = document.getElementById('pubFilterYear');
  const sortSelect = document.getElementById('pubSort');
  const resetBtn = document.getElementById('pubResetFilters');

  const byYearFilter = { select: yearSelect, test: (card, value) => card.dataset.year === value };
  const byYearSortFns = {
    newest: (a, b) => b.dataset.year.localeCompare(a.dataset.year),
    oldest: (a, b) => a.dataset.year.localeCompare(b.dataset.year),
  };

  const allYears = [
    ...(pubList ? Array.from(pubList.querySelectorAll('.pub-card')).map((card) => card.dataset.year) : []),
    ...(confList ? Array.from(confList.querySelectorAll('li')).map((li) => li.dataset.year) : []),
  ];
  populateYearOptions(yearSelect, allYears);

  if (pubList) {
    setupCardFilterSort({
      grid: pubList,
      cardSelector: '.pub-card',
      filters: [byYearFilter],
      sortSelect,
      sortFns: byYearSortFns,
      defaultSort: 'newest',
      resetBtn,
      emptyState: document.getElementById('pubEmptyState'),
    });
  }

  if (confList) {
    setupCardFilterSort({
      grid: confList,
      cardSelector: 'li',
      filters: [byYearFilter],
      sortSelect,
      sortFns: byYearSortFns,
      defaultSort: 'newest',
      resetBtn,
      emptyState: document.getElementById('confEmptyState'),
    });
  }
}
