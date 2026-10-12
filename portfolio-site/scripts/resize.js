/*
 * resize.js: the draggable divider between the editor and the terminal panel.
 * Drag it, or focus it and use Arrow Up/Down (Home/End for max/min).
 * Double-click resets. The chosen height is remembered in localStorage.
 * Desktop only: on phones the CSS hides it and shows one pane at a time.
 */
(function () {
  'use strict';

  const ide = document.getElementById('ide');
  const main = document.querySelector('.main');
  const sash = document.getElementById('sash');
  const panel = document.querySelector('.panel');

  const KEY = 'panel-height';
  const DEFAULT = 360;
  const MIN = 120;          // keep the panel tabs and a couple of lines visible
  const EDITOR_MIN = 120;   // keep some code visible above
  const STEP = 24;

  let height = DEFAULT;

  function maxHeight() {
    const chrome = 36 + 24; // tab bar + breadcrumbs
    return Math.max(MIN, main.clientHeight - chrome - EDITOR_MIN);
  }

  function apply(h, save) {
    height = Math.round(Math.min(maxHeight(), Math.max(MIN, h)));
    ide.style.setProperty('--panel-h', height + 'px');
    sash.setAttribute('aria-valuemin', String(MIN));
    sash.setAttribute('aria-valuemax', String(Math.round(maxHeight())));
    sash.setAttribute('aria-valuenow', String(height));
    if (save) {
      try { localStorage.setItem(KEY, String(height)); } catch (e) { /* storage blocked: still resizes */ }
    }
    if (window.IDE && window.IDE.updateMinimap) window.IDE.updateMinimap();
  }

  /* ---------------- pointer drag ---------------- */
  let startY = 0;
  let startH = 0;
  let frame = 0;

  sash.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    sash.setPointerCapture(e.pointerId);
    startY = e.clientY;
    startH = panel.getBoundingClientRect().height;
    sash.classList.add('is-dragging');
    document.body.classList.add('is-resizing');
  });

  sash.addEventListener('pointermove', (e) => {
    if (!sash.hasPointerCapture(e.pointerId)) return;
    const next = startH + (startY - e.clientY);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => apply(next, false));
  });

  function endDrag(e) {
    if (!sash.hasPointerCapture(e.pointerId)) return;
    sash.releasePointerCapture(e.pointerId);
    sash.classList.remove('is-dragging');
    document.body.classList.remove('is-resizing');
    apply(height, true);
  }
  sash.addEventListener('pointerup', endDrag);
  sash.addEventListener('pointercancel', endDrag);

  /* ---------------- keyboard + reset ---------------- */
  sash.addEventListener('keydown', (e) => {
    const moves = { ArrowUp: height + STEP, ArrowDown: height - STEP, Home: maxHeight(), End: MIN };
    if (!(e.key in moves)) return;
    e.preventDefault();
    apply(moves[e.key], true);
  });

  sash.addEventListener('dblclick', () => {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    apply(DEFAULT, false);
  });

  // Keep the panel inside the window when it shrinks.
  window.addEventListener('resize', () => apply(height, false));

  /* ---------------- boot ---------------- */
  let saved = NaN;
  try { saved = parseInt(localStorage.getItem(KEY), 10); } catch (e) { /* ignore */ }
  apply(Number.isFinite(saved) ? saved : DEFAULT, false);
})();
