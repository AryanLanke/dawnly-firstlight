const STORAGE_KEY = 'dawnly-theme';

function applyTheme(next) {
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
}

export function flipTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && typeof document.startViewTransition === 'function') {
    document.startViewTransition(function () { applyTheme(next); });
    return;
  }

  applyTheme(next);
}

export function initTheme() {
  const toggle = document.querySelector('.theme-toggle-btn');
  if (toggle) toggle.addEventListener('click', flipTheme);
}
