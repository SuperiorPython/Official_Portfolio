/*
 * terminal.js: the bottom panel.
 * Run turns the active file into a card in the terminal; quick-run chips
 * print every card in a folder. Panel tabs switch Problems / Output / Terminal.
 */
(function () {
  'use strict';

  const IDE = window.IDE;
  const P = window.PORTFOLIO;
  const el = IDE.el;

  const terminal = document.getElementById('terminal');
  const runBtn = document.getElementById('run-btn');

  /* ------------------------------------------------------------------
   * Commands: what "running" each file type looks like in PowerShell
   * ------------------------------------------------------------------ */
  function winPath(file) {
    return (file.folder ? file.folder.replace(/\//g, '\\') + '\\' : '') + file.path;
  }

  function commandFor(file) {
    const path = winPath(file);
    switch (file.lang) {
      case 'ts': return 'npx tsx ' + path;
      case 'js': return 'node ' + path;
      case 'py': return 'python ' + path;
      case 'cs': return 'dotnet run ' + path;
      case 'md': return 'portfolio help';
      case 'env': return 'portfolio contact';
      default: return 'portfolio show ' + path;
    }
  }

  /* ------------------------------------------------------------------
   * Card building blocks
   * ------------------------------------------------------------------ */
  function media(src, variant) {
    const box = el('div', 'card-media' + (variant ? ' card-media--' + variant : ''));
    const img = el('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    box.append(img);
    return box;
  }

  // All card buttons share one neutral style; gold appears on hover/focus only.
  function link(label, href, icon) {
    const a = el('a', 'card-link');
    a.href = href;
    if (!href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
    if (icon) {
      const i = el('img', 'card-link-icon');
      i.src = icon;
      i.alt = '';
      a.append(i);
    }
    a.append(el('span', null, label), el('span', 'card-link-arrow', '↗'));
    return a;
  }

  function chips(items) {
    const ul = el('ul', 'card-chips');
    items.forEach((t) => ul.append(el('li', null, t)));
    return ul;
  }

  function badge(text, kind) {
    return el('span', 'card-badge card-badge--' + kind, text);
  }

  function shell(mediaNode, title, badgeNode, parts) {
    const card = el('article', 'card');
    const body = el('div', 'card-body');
    const head = el('div', 'card-head');
    head.append(el('h3', 'card-title', title));
    if (badgeNode) head.append(badgeNode);
    body.append(head, ...parts.filter(Boolean));
    card.append(mediaNode, body);
    return card;
  }

  /* ------------------------------------------------------------------
   * One card per file kind
   * ------------------------------------------------------------------ */
  function projectCard(p) {
    const published = p.status === 'published';
    const links = el('div', 'card-links');
    if (p.links.site) links.append(link('Live site', p.links.site));
    if (p.links.repo) links.append(link('Repo', p.links.repo));
    if (!p.links.site && !p.links.repo) links.append(el('span', 'card-note', 'In development. Links coming soon.'));
    return shell(
      media(p.image, published ? null : 'wip'),
      p.name,
      badge(published ? 'PUBLISHED' : 'WIP', published ? 'published' : 'wip'),
      [el('p', 'card-desc', p.description), chips(p.skills), links]
    );
  }

  function experienceCard(e) {
    const bullets = el('ul', 'card-bullets');
    e.bullets.forEach((b) => bullets.append(el('li', null, b)));
    const meta = el('p', 'card-meta', e.role);
    const sub = el('p', 'card-sub', e.period + ' · ' + e.location);
    return shell(media(e.logo, 'logo'), e.company, e.current ? badge('CURRENT', 'published') : null, [meta, sub, bullets]);
  }

  function aboutCard(a) {
    const links = el('div', 'card-links');
    links.append(link('Resume', P.owner.resume), link('LinkedIn', P.contact.linkedin, P.contact.icons.linkedin));
    return shell(
      media(P.owner.photo, 'photo'),
      P.owner.name,
      null,
      [
        el('p', 'card-meta', P.owner.title),
        el('p', 'card-sub', a.year + ' · ' + a.major + ' · ' + a.school),
        el('p', 'card-desc', a.paragraphs[0]),
        links,
      ]
    );
  }

  function skillsCard(sk) {
    const grid = el('ul', 'card-skills card-skills--grid');
    sk.items.forEach((s) => {
      const li = el('li');
      const img = el('img');
      img.src = s.icon;
      img.alt = '';
      img.loading = 'lazy';
      li.append(img, el('span', null, s.name));
      grid.append(li);
    });
    // Media tile: a 2x2 collage of the first four skill icons.
    const collage = el('div', 'card-media card-media--collage');
    sk.items.slice(0, 4).forEach((s) => {
      const img = el('img');
      img.src = s.icon;
      img.alt = '';
      collage.append(img);
    });
    return shell(collage, 'Skills', badge(sk.items.length + ' TOOLS', 'published'), [el('p', 'card-desc', sk.subtitle), grid]);
  }

  // Copy text to the clipboard, with a fallback for browsers that block the async API.
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = el('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  // The Email button copies the address instead of opening a mail app,
  // since mailto: links do nothing for visitors without one set up.
  function copyEmailButton(c) {
    const btn = el('button', 'card-link');
    btn.type = 'button';
    btn.title = 'Copy ' + c.email;
    const icon = el('img', 'card-link-icon');
    icon.src = c.icons.email;
    icon.alt = '';
    const label = el('span', null, 'Email');
    label.setAttribute('aria-live', 'polite');
    const hint = el('span', 'card-link-arrow', '\u29C9');
    hint.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-label', 'Copy email address ' + c.email);
    btn.append(icon, label, hint);

    let timer = 0;
    btn.addEventListener('click', () => {
      copyText(c.email)
        .then(() => { label.textContent = 'Copied!'; btn.classList.add('is-copied'); })
        .catch(() => { label.textContent = c.email; })
        .finally(() => {
          clearTimeout(timer);
          timer = setTimeout(() => { label.textContent = 'Email'; btn.classList.remove('is-copied'); }, 2000);
        });
    });
    return btn;
  }

  function contactCard(c) {
    const links = el('div', 'card-links');
    links.append(
      copyEmailButton(c),
      link('LinkedIn', c.linkedin, c.icons.linkedin),
      link('GitHub', c.github, c.icons.github)
    );
    return shell(media(P.owner.logo, 'logo'), 'Get in touch', null, [el('p', 'card-desc', c.blurb), links]);
  }


  function readmeCard() {
    const links = el('div', 'card-links');
    links.append(link('Resume', P.owner.resume));
    return shell(
      media(P.owner.logo, 'logo'),
      'Start anywhere',
      null,
      [el('p', 'card-desc', 'Every file in this workspace runs to a card like this one. Open a project in projects/published and press Run, or use the quick-run buttons above.'), links]
    );
  }

  function cardFor(file) {
    switch (file.kind) {
      case 'project': return projectCard(file.data);
      case 'experience': return experienceCard(file.data);
      case 'about': return aboutCard(file.data);
      case 'skills': return skillsCard(file.data);
      case 'contact': return contactCard(file.data);
      default: return readmeCard();
    }
  }

  /* ------------------------------------------------------------------
   * Terminal output
   * ------------------------------------------------------------------ */
  function promptLine(cmd, withCursor) {
    const line = el('div', 'term-line');
    line.append(el('span', 'term-prompt', IDE.PROMPT));
    if (cmd) line.append(el('span', 'term-cmd', cmd));
    if (withCursor) line.append(el('span', 'term-cursor'));
    return line;
  }

  function run(cmd, files) {
    const grid = el('div', 'cards');
    files.forEach((f) => grid.append(cardFor(f)));
    const n = files.length;
    terminal.replaceChildren(
      promptLine(cmd),
      el('div', 'term-line term-ok', '✓ ' + n + (n === 1 ? ' card' : ' cards')),
      grid,
      promptLine('', true)
    );
    terminal.scrollTop = 0;
    showPanel('terminal');
  }

  function runActive() {
    const file = IDE.byPath(IDE.state.active);
    if (file) run(commandFor(file), [file]);
  }

  function runFolder(folder) {
    if (folder === 'cls') {
      terminal.replaceChildren(promptLine('', true));
      return;
    }
    const files = IDE.FILES.filter((f) => f.folder === folder);
    run('portfolio run ' + folder.replace(/\//g, '\\') + '\\*', files);
  }

  /* ------------------------------------------------------------------
   * Panel tabs
   * ------------------------------------------------------------------ */
  function showPanel(name) {
    document.querySelectorAll('.panel-tab').forEach((t) => {
      const on = t.dataset.panel === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.panel-view').forEach((v) => { v.hidden = v.dataset.view !== name; });
  }

  function renderOutput() {
    const published = P.projects.filter((p) => p.status === 'published').length;
    const lines = [
      '[portfolio] workspace loaded',
      '[portfolio] ' + IDE.FILES.length + ' files indexed',
      '[portfolio] ' + published + ' published, ' + (P.projects.length - published) + ' in progress',
      '[portfolio] ' + P.experience.length + ' experience entries',
    ];
    document.getElementById('output').replaceChildren(...lines.map((l) => el('div', 'term-line', l)));
  }

  /* ------------------------------------------------------------------
   * Wire up
   * ------------------------------------------------------------------ */
  runBtn.addEventListener('click', runActive);
  document.querySelectorAll('[data-run]').forEach((b) => b.addEventListener('click', () => runFolder(b.dataset.run)));
  document.querySelectorAll('.panel-tab').forEach((t) => t.addEventListener('click', () => showPanel(t.dataset.panel)));

  // The Run button only makes sense with a file open.
  IDE.onRender(() => { runBtn.hidden = !IDE.state.active; });

  renderOutput();
  // Boot: an idle prompt with a hint, until the visitor runs something.
  terminal.replaceChildren(
    promptLine('# Open a file and press \u25B6 Run, or try a quick run above.'),
    promptLine('', true)
  );
  terminal.querySelector('.term-cmd').classList.add('term-comment');
})();
