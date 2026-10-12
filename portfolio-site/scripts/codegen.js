/*
 * codegen.js: turns content.js entries into source "files".
 * Each project is written in its own language as plain variables
 * (name, status, description, skills, links). Experience and skills are
 * YAML, about is JSON, contact is a .env file, plus a README.
 * Returns an array of lines for the editor.
 */
(function () {
  'use strict';

  const WIDTH = 56;

  // Split text into chunks of at most `width` chars, breaking on spaces.
  // Every chunk but the last keeps its trailing space so concatenation is exact.
  function wrap(text, width) {
    width = width || WIDTH;
    const out = [];
    let cur = '';
    text.split(' ').forEach((word) => {
      if (cur && (cur + ' ' + word).length > width) {
        out.push(cur + ' ');
        cur = word;
      } else {
        cur = cur ? cur + ' ' + word : word;
      }
    });
    if (cur) out.push(cur);
    return out;
  }

  const q = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  const list = (arr) => '[' + arr.map(q).join(', ') + ']';

  function concat(text, indent, joiner, end) {
    const parts = wrap(text);
    return parts.map((p, i) => indent + q(p) + (i < parts.length - 1 ? joiner : end));
  }

  /* ---------------- projects ---------------- */

  function projectJs(p) {
    const link = (key) => {
      const v = p.links[key];
      return '  ' + key + ': ' + (v ? q(v) + ',' : 'null, // in development');
    };
    return [
      'const name = ' + q(p.name) + ';',
      'const status = ' + q(p.status) + ';',
      '',
      'const description =',
      ...concat(p.description, '  ', ' +', ';'),
      '',
      'const skills = ' + list(p.skills) + ';',
      '',
      'const links = {',
      link('site'),
      link('repo'),
      '};',
      '',
      'export default { name, status, description, skills, links };',
    ];
  }

  function projectPy(p) {
    const link = (key) => {
      const v = p.links[key];
      return '    ' + q(key) + ': ' + (v ? q(v) + ',' : 'None,  # in development');
    };
    return [
      'name = ' + q(p.name),
      'status = ' + q(p.status),
      '',
      'description = (',
      ...wrap(p.description).map((part) => '    ' + q(part)),
      ')',
      '',
      'skills = ' + list(p.skills),
      '',
      'links = {',
      link('site'),
      link('repo'),
      '}',
    ];
  }

  function projectCs(p) {
    const cls = p.name.replace(/[^A-Za-z0-9]/g, '');
    const link = (key, label) => {
      const v = p.links[key];
      return '    public const string ' + label + ' = ' + (v ? q(v) + ';' : 'null; // in development');
    };
    return [
      'public static class ' + cls,
      '{',
      '    public const string Name = ' + q(p.name) + ';',
      '    public const string Status = ' + q(p.status) + ';',
      '',
      '    public const string Description =',
      ...concat(p.description, '        ', ' +', ';'),
      '',
      '    public static readonly string[] Skills =',
      '        { ' + p.skills.map(q).join(', ') + ' };',
      '',
      link('site', 'Site'),
      link('repo', 'Repo'),
      '}',
    ];
  }

  /* ---------------- experience ---------------- */

  function experienceYml(e) {
    const lines = [
      'company: ' + q(e.company),
      'role: ' + q(e.role),
      'location: ' + q(e.location),
      'period: ' + q(e.period),
      'current: ' + (e.current ? 'true' : 'false'),
    ];
    lines.push('', 'highlights:');
    e.bullets.forEach((b) => {
      lines.push('  - >-');
      wrap(b, 52).forEach((part) => lines.push('    ' + part.trimEnd()));
    });
    return lines;
  }

  /* ---------------- about / contact / readme ---------------- */

  function aboutJson(a, owner) {
    const arr = (key, values, last) => {
      const out = ['  ' + q(key) + ': ['];
      values.forEach((v, i) => out.push('    ' + q(v) + (i < values.length - 1 ? ',' : '')));
      out.push('  ]' + (last ? '' : ','));
      return out;
    };
    return [
      '{',
      '  "name": ' + q(owner.name) + ',',
      '  "title": ' + q(owner.title) + ',',
      '  "school": ' + q(a.school) + ',',
      '  "major": ' + q(a.major) + ',',
      '  "year": ' + q(a.year) + ',',
      ...arr('bio', a.paragraphs),
      ...arr('interests', a.interests, true),
      '}',
    ];
  }

  function skillsYml(sk) {
    return [
      '# ' + sk.subtitle,
      'skills:',
      ...sk.items.map((item) => '  - ' + q(item.name)),
    ];
  }

  function contactEnv(c) {
    return [
      ...wrap(c.blurb, 60).map((part) => '# ' + part.trimEnd()),
      '',
      'EMAIL=' + q(c.email),
      'LINKEDIN=' + q(c.linkedin),
      'GITHUB=' + q(c.github),
      '',
      '# ' + q(c.quote.text) + ' (' + c.quote.author + ')',
    ];
  }

  function readme(owner) {
    return [
      '# ' + owner.name,
      '',
      owner.title,
      '',
      '## How to use this site',
      '- Open any file in the explorer',
      '- Press ▶ Run to turn it into a card with links',
      '',
      '## Layout',
      '- projects/published     shipped work',
      '- projects/wip           in development',
      '- experience             where I’ve worked',
      '- personal/about.json    who I am',
      '- personal/skills.yml    what I work with',
      '- personal/contact.env   how to reach me',
    ];
  }

  /* ---------------- dispatch ---------------- */

  function generate(file, P) {
    switch (file.kind) {
      case 'project':
        if (file.lang === 'py') return projectPy(file.data);
        if (file.lang === 'cs') return projectCs(file.data);
        return projectJs(file.data); // js and ts share syntax here
      case 'experience': return experienceYml(file.data);
      case 'about': return aboutJson(file.data, P.owner);
      case 'skills': return skillsYml(file.data);
      case 'contact': return contactEnv(file.data);
      case 'readme': return readme(P.owner);
      default: return [];
    }
  }

  window.CodeGen = { generate, wrap };
})();
