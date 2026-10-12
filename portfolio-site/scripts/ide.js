/*
 * ide.js: builds the IDE from window.PORTFOLIO.
 * Explorer, tabs, editor (generated code + highlighting), breadcrumbs,
 * cursor line, status bar. terminal.js adds Run and the cards via onRender().
 */
(function () {
  'use strict';

  const P = window.PORTFOLIO;
  const PROMPT = 'PS C:\\Users\\Bryson\\portfolio> ';

  // Language metadata: explorer icon, status bar name, indent size,
  // and the pattern that finds top-level symbols for the breadcrumb.
  const LANGS = {
    md:   { icon: 'M\u2193', color: 'var(--lang-md)', name: 'Markdown',   spaces: 2, symbol: /^#+\s(.+)/ },
    ts:   { icon: 'TS',  color: 'var(--lang-ts)', name: 'TypeScript', spaces: 2, symbol: /^const (\w+)/ },
    js:   { icon: 'JS',  color: 'var(--lang-js)', name: 'JavaScript', spaces: 2, symbol: /^const (\w+)/ },
    py:   { icon: 'PY',  color: 'var(--lang-py)', name: 'Python',     spaces: 4, symbol: /^(\w+)\s*=/ },
    cs:   { icon: 'C#',  color: 'var(--lang-cs)', name: 'C#',         spaces: 4, symbol: /^\s{4}public (?:const|static readonly) [\w[\]]+ (\w+)/ },
    yml:  { icon: 'YML', color: 'var(--lang-yml)', name: 'YAML',       spaces: 2, symbol: /^(\w+):/ },
    json: { icon: '{}',  color: 'var(--lang-json)', name: 'JSON',       spaces: 2, symbol: /^ {2}"(\w+)":/ },
    env:  { icon: 'ENV', color: 'var(--lang-env)', name: 'Properties', spaces: 2, symbol: /^([A-Z_]+)=/ },
  };

  /* ------------------------------------------------------------------
   * File model: every explorer entry, derived from content.js
   * ------------------------------------------------------------------ */
  const FILES = [];
  function addFile(path, folder, lang, kind, data) {
    const file = { path, folder, lang, kind, data };
    file.lines = window.CodeGen.generate(file, P);
    FILES.push(file);
  }
  P.projects.forEach((p) => addFile(p.file, 'projects/' + p.status, p.lang, 'project', p));
  P.experience.forEach((e) => addFile(e.file, 'experience', 'yml', 'experience', e));
  addFile(P.about.file, 'personal', 'json', 'about', P.about);
  addFile(P.skills.file, 'personal', 'yml', 'skills', P.skills);
  addFile(P.contact.file, 'personal', 'env', 'contact', P.contact);
  addFile('README.md', '', 'md', 'readme', P.owner);

  const byPath = (path) => FILES.find((f) => f.path === path) || null;

  // collapsed: folder paths the visitor has closed in the explorer.
  const state = { tabs: [], active: null, line: 1, collapsed: new Set() };

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function fileIcon(lang) {
    const meta = LANGS[lang];
    const icon = el('span', 'file-icon', meta.icon);
    icon.style.color = meta.color;
    return icon;
  }

  // Top-level symbols in a file, e.g. name, status, description...
  function outline(file) {
    const re = LANGS[file.lang].symbol;
    const out = [];
    file.lines.forEach((line, i) => {
      const m = line.match(re);
      if (m) out.push({ name: m[1], line: i + 1 });
    });
    return out;
  }

  /* ------------------------------------------------------------------
   * Explorer
   * ------------------------------------------------------------------ */
  // Explorer layout: folders in display order, with optional count badges.
  const TREE = [
    { path: 'projects', children: [
      { path: 'projects/published', badge: 'var(--green)' },
      { path: 'projects/wip', badge: 'var(--amber)' },
    ] },
    { path: 'experience' },
    { path: 'personal' },
  ];

  function folderRow(node, depth) {
    const open = !state.collapsed.has(node.path);
    const btn = el('button', 'tree-folder');
    btn.type = 'button';
    btn.style.paddingLeft = (12 + depth * 14) + 'px';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.append(el('span', 'caret', open ? '\u25BE' : '\u25B8'), el('span', null, node.path.split('/').pop()));
    if (node.badge) {
      const b = el('span', 'tree-badge', String(FILES.filter((f) => f.folder === node.path).length));
      b.style.background = node.badge;
      btn.append(b);
    }
    btn.addEventListener('click', () => toggleFolder(node.path));
    return btn;
  }

  function fileRow(file, depth) {
    const btn = el('button', 'tree-file');
    btn.type = 'button';
    btn.style.paddingLeft = (14 + depth * 14) + 'px';
    btn.dataset.path = file.path;
    btn.append(fileIcon(file.lang), el('span', null, file.path));
    btn.addEventListener('click', () => openFile(file.path));
    return btn;
  }

  function folderRows(node, depth) {
    const rows = [folderRow(node, depth)];
    if (state.collapsed.has(node.path)) return rows;
    (node.children || []).forEach((child) => rows.push(...folderRows(child, depth + 1)));
    FILES.filter((f) => f.folder === node.path).forEach((f) => rows.push(fileRow(f, depth + 1)));
    return rows;
  }

  function renderTree() {
    const rows = [];
    TREE.forEach((node) => rows.push(...folderRows(node, 0)));
    FILES.filter((f) => !f.folder).forEach((f) => rows.push(fileRow(f, 0)));
    document.getElementById('tree').replaceChildren(...rows);
    markTree();
  }

  function toggleFolder(path) {
    if (state.collapsed.has(path)) state.collapsed.delete(path);
    else state.collapsed.add(path);
    renderTree();
  }

  // Opening a file (e.g. from a tab) re-opens any folder it lives in.
  function revealInTree(file) {
    if (!file.folder) return false;
    let changed = false;
    const parts = file.folder.split('/');
    parts.forEach((_, i) => {
      const path = parts.slice(0, i + 1).join('/');
      if (state.collapsed.delete(path)) changed = true;
    });
    return changed;
  }

  function markTree() {
    document.querySelectorAll('.tree-file').forEach((btn) => {
      const on = btn.dataset.path === state.active;
      btn.classList.toggle('is-active', on);
      if (on) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------------
   * Tabs
   * ------------------------------------------------------------------ */
  function renderTabs() {
    const tabs = state.tabs.map((path) => {
      const file = byPath(path);
      const on = path === state.active;
      const tab = el('div', 'tab' + (on ? ' is-active' : ''));

      const label = el('button', 'tab-label');
      label.type = 'button';
      label.setAttribute('role', 'tab');
      label.setAttribute('aria-selected', on ? 'true' : 'false');
      label.append(fileIcon(file.lang), el('span', null, path));
      label.addEventListener('click', () => openFile(path));

      const close = el('button', 'tab-close', '\u00D7');
      close.type = 'button';
      close.setAttribute('aria-label', 'Close ' + path);
      close.addEventListener('click', () => closeFile(path));

      tab.append(label, close);
      return tab;
    });
    document.getElementById('tabs').replaceChildren(...tabs);
  }

  /* ------------------------------------------------------------------
   * Editor
   * ------------------------------------------------------------------ */
  function renderEditor() {
    const code = document.getElementById('code');
    const welcome = document.getElementById('welcome');
    const file = byPath(state.active);

    code.hidden = !file;
    welcome.hidden = !!file;
    if (!file) { code.replaceChildren(); return; }

    const rows = file.lines.map((text, i) => {
      const row = el('div', 'line');
      row.dataset.line = String(i + 1);
      const body = el('span', 'text');
      window.Highlight.tokenize(text, file.lang).forEach((tok) => {
        body.append(tok.cls ? el('span', 'tok-' + tok.cls, tok.text) : document.createTextNode(tok.text));
      });
      row.append(el('span', 'gutter', String(i + 1)), body);
      return row;
    });
    code.replaceChildren(...rows);
    markLine();
  }

  function markLine() {
    const code = document.getElementById('code');
    code.querySelectorAll('.caret-bar').forEach((c) => c.remove());
    code.querySelectorAll('.line').forEach((row) => {
      const on = Number(row.dataset.line) === state.line;
      row.classList.toggle('is-current', on);
      if (on) row.querySelector('.text').append(el('span', 'caret-bar'));
    });
  }

  function renderBreadcrumbs() {
    const file = byPath(state.active);
    const parts = ['portfolio'];
    if (file) {
      if (file.folder) parts.push(...file.folder.split('/'));
      parts.push(file.path);
      const sym = currentSymbol(file);
      if (sym) parts.push(sym.name);
    }
    const nodes = [];
    parts.forEach((p, i) => {
      if (i) nodes.push(el('span', 'sep', '\u203A'));
      nodes.push(el('span', 'crumb', p));
    });
    document.getElementById('breadcrumbs').replaceChildren(...nodes);
  }

  /* ------------------------------------------------------------------
   * Outline: the file's top-level variables, click to jump
   * ------------------------------------------------------------------ */
  function currentSymbol(file) {
    return outline(file).filter((s) => s.line <= state.line).pop() || null;
  }

  function renderOutline() {
    const box = document.getElementById('outline');
    const file = byPath(state.active);
    if (!file) { box.replaceChildren(el('div', 'outline-empty', 'No file open')); return; }
    const cur = currentSymbol(file);
    const items = outline(file).map((sym) => {
      const btn = el('button', 'outline-item' + (cur && cur.line === sym.line ? ' is-active' : ''));
      btn.type = 'button';
      btn.append(
        el('span', 'outline-sym', file.lang === 'md' ? '#' : 'x'),
        el('span', null, sym.name),
        el('span', 'outline-line', String(sym.line))
      );
      btn.addEventListener('click', () => {
        setLine(sym.line);
        const row = document.querySelector('#code .line[data-line="' + sym.line + '"]');
        if (row) row.scrollIntoView({ block: 'nearest' });
      });
      return btn;
    });
    box.replaceChildren(...items);
  }

  /* ------------------------------------------------------------------
   * Minimap: one bar per line, colored by its first token
   * ------------------------------------------------------------------ */
  const MINI_COLORS = { kw: 'var(--tok-kw)', str: 'var(--tok-str)', com: 'var(--tok-com)', num: 'var(--tok-num)', key: 'var(--tok-key)', type: 'var(--tok-type)', op: 'var(--tok-op)', head: 'var(--accent-ink)', '': 'var(--fg)' };

  function renderMinimap() {
    const lines = document.getElementById('minimap-lines');
    const file = byPath(state.active);
    if (!file) { lines.replaceChildren(); updateMinimapView(); return; }
    lines.replaceChildren(...file.lines.map((text) => {
      const bar = el('span');
      const trimmed = text.trim();
      const indent = text.length - text.trimStart().length;
      const first = window.Highlight.tokenize(text, file.lang).find((t) => t.text.trim()) || { cls: '' };
      bar.style.width = (trimmed ? Math.min(60, Math.max(4, Math.round(trimmed.length * 0.9))) : 0) + 'px';
      bar.style.marginLeft = Math.round(indent * 0.9) + 'px';
      bar.style.background = MINI_COLORS[first.cls] || MINI_COLORS[''];
      return bar;
    }));
    updateMinimapView();
  }

  function updateMinimapView() {
    const editor = document.getElementById('editor');
    const view = document.getElementById('minimap-view');
    const lines = document.getElementById('minimap-lines');
    const total = editor.scrollHeight || 1;
    const mapHeight = Math.max(lines.offsetHeight, 1);
    view.style.top = (editor.scrollTop / total) * mapHeight + 'px';
    view.style.height = Math.min(mapHeight, (editor.clientHeight / total) * mapHeight) + 'px';
  }

  document.getElementById('editor').addEventListener('scroll', updateMinimapView);
  window.addEventListener('resize', updateMinimapView);
  document.getElementById('minimap').addEventListener('click', (e) => {
    const editor = document.getElementById('editor');
    const lines = document.getElementById('minimap-lines');
    const ratio = (e.clientY - lines.getBoundingClientRect().top) / Math.max(lines.offsetHeight, 1);
    editor.scrollTop = ratio * editor.scrollHeight - editor.clientHeight / 2;
  });

  /* ------------------------------------------------------------------
   * Status bar
   * ------------------------------------------------------------------ */
  function renderStatus() {
    const published = P.projects.filter((p) => p.status === 'published').length;
    const wip = P.projects.length - published;
    document.getElementById('status-counts').textContent = published + ' published \u00B7 ' + wip + ' wip';

    const file = byPath(state.active);
    const lang = file ? LANGS[file.lang] : null;
    document.getElementById('status-lang').textContent = lang ? lang.name : 'Plain Text';
    document.getElementById('status-spaces').textContent = 'Spaces: ' + (lang ? lang.spaces : 2);
    document.getElementById('status-pos').textContent = 'Ln ' + (file ? state.line : 1) + ', Col 1';
  }

  /* ------------------------------------------------------------------
   * Actions
   * ------------------------------------------------------------------ */
  const renderHooks = [];
  function onRender(fn) { renderHooks.push(fn); fn(); }

  function render() {
    markTree();
    renderTabs();
    renderEditor();
    renderBreadcrumbs();
    renderOutline();
    renderMinimap();
    renderStatus();
    renderHooks.forEach((fn) => fn());
  }

  function openFile(path) {
    if (!byPath(path)) return;
    if (!state.tabs.includes(path)) state.tabs.push(path);
    if (state.active !== path) state.line = 1;
    state.active = path;
    if (revealInTree(byPath(path))) renderTree();
    render();
    document.getElementById('editor').scrollTop = 0;
  }

  function closeFile(path) {
    const i = state.tabs.indexOf(path);
    if (i < 0) return;
    state.tabs.splice(i, 1);
    if (state.active === path) {
      state.active = state.tabs[Math.min(i, state.tabs.length - 1)] || null;
      state.line = 1;
    }
    render();
  }

  function setLine(n) {
    state.line = n;
    markLine();
    renderBreadcrumbs();
    renderOutline();
    renderStatus();
  }

  // Click a line to move the cursor there.
  document.getElementById('code').addEventListener('click', (e) => {
    const row = e.target.closest('.line');
    if (row) setLine(Number(row.dataset.line));
  });

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */
  document.getElementById('welcome-name').textContent = P.owner.name;
  document.getElementById('welcome-title').textContent = P.owner.title;
  document.getElementById('welcome-quote-text').textContent = '\u201C' + P.contact.quote.text + '\u201D';
  document.getElementById('welcome-quote-author').textContent = '\u2014 ' + P.contact.quote.author;
  renderTree();

  // Start on the empty welcome screen; its button opens the flagship project.
  document.getElementById('welcome-open').addEventListener('click', () => openFile('astrolabe.ts'));
  render();

  // Expose for later commits.
  window.IDE = { FILES, LANGS, state, openFile, closeFile, outline, byPath, onRender, el, PROMPT, updateMinimap: updateMinimapView };
})();
