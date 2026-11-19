'use strict';

(() => {
  const root = document.documentElement;
  let theme = 'dark';
  try {
    if (localStorage.getItem('portfolio-theme') === 'light') theme = 'light';
  } catch { /* Storage can be unavailable in private browsing. */ }
  root.dataset.theme = theme;

  function applyTheme(value) {
    root.dataset.theme = value;
    document.querySelector('meta[name="theme-color"]').content = value === 'dark' ? '#000000' : '#ffffff';
    const button = document.querySelector('[data-theme-toggle]');
    if (button) {
      const label = value === 'dark' ? 'Light mode' : 'Dark mode';
      button.querySelector('[data-theme-label]').textContent = label;
      button.querySelector('.theme-icon').textContent = value === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', `Switch to ${label.toLowerCase()}`);
      button.title = `Switch to ${label.toLowerCase()}`;
      button.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.dataset.theme);
    document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
      const value = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(value);
      try { localStorage.setItem('portfolio-theme', value); } catch { /* Keep the session choice. */ }
      document.dispatchEvent(new CustomEvent('themechange', { detail: value }));
    });
  });
})();
