/*
 * theme.js: light / dark toggle.
 * With no saved choice the site follows the visitor's system setting.
 * Clicking the button saves an explicit choice (localStorage 'theme').
 * The saved value is applied before first paint by the inline script in <head>.
 */
(function () {
  'use strict';

  const root = document.documentElement;
  const btn = document.getElementById('theme-btn');
  const systemLight = window.matchMedia('(prefers-color-scheme: light)');

  function current() {
    return root.dataset.theme || (systemLight.matches ? 'light' : 'dark');
  }

  function sync() {
    const mode = current();
    const next = mode === 'dark' ? 'light' : 'dark';
    btn.dataset.mode = mode;
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    btn.title = 'Switch to ' + next + ' theme';
  }

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode: still switches for this visit */ }
    sync();
  });

  // Follow system changes live while the visitor hasn't picked a theme.
  systemLight.addEventListener('change', sync);
  sync();
})();
