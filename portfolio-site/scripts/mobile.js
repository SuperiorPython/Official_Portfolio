/*
 * mobile.js: small-screen behavior (the CSS only applies it below 900px).
 * - The Files button opens the explorer as a drawer.
 * - Code / Terminal switcher shows one pane at a time.
 * - Opening a file jumps to Code; Run jumps to Terminal.
 */
(function () {
  'use strict';

  const IDE = window.IDE;
  const ide = document.getElementById('ide');
  const filesBtn = document.getElementById('files-btn');
  const backdrop = document.getElementById('drawer-backdrop');
  const dot = document.getElementById('pane-dot');
  const mobile = window.matchMedia('(max-width: 900px)');

  /* ---------------- drawer ---------------- */
  function setDrawer(open) {
    ide.classList.toggle('drawer-open', open);
    backdrop.hidden = !open;
    filesBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    filesBtn.setAttribute('aria-label', open ? 'Hide files' : 'Show files');
  }
  filesBtn.addEventListener('click', () => setDrawer(!ide.classList.contains('drawer-open')));
  backdrop.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ide.classList.contains('drawer-open')) { setDrawer(false); filesBtn.focus(); }
  });
  mobile.addEventListener('change', (e) => { if (!e.matches) setDrawer(false); });

  /* ---------------- panes ---------------- */
  function setPane(name) {
    ide.dataset.pane = name;
    document.querySelectorAll('.pane-btn').forEach((b) => {
      const on = b.dataset.pane === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (name === 'terminal') dot.hidden = true;
  }
  document.querySelectorAll('.pane-btn').forEach((b) => b.addEventListener('click', () => setPane(b.dataset.pane)));

  // Run (or a quick-run chip) shows the terminal; on phones that means switching panes.
  document.getElementById('run-btn').addEventListener('click', () => setPane('terminal'));

  // Opening a different file closes the drawer and returns to the code.
  let lastActive = IDE.state.active;
  IDE.onRender(() => {
    if (IDE.state.active !== lastActive) {
      lastActive = IDE.state.active;
      setDrawer(false);
      if (IDE.state.active) setPane('code');
    }
  });

  // Start on the welcome screen. The dot appears when a run happens while Code is showing.
  setPane('code');
})();
