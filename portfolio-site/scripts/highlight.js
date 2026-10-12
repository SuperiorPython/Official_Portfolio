/*
 * highlight.js: a small per-language tokenizer for the editor.
 * tokenize(line, lang) -> [{ text, cls }], where cls maps to a .tok-* class.
 */
(function () {
  'use strict';

  const STR = '"(?:[^"\\\\]|\\\\.)*"';

  const RULES = {
    js: [
      ['\\/\\/.*$', 'com'],
      [STR, 'str'],
      ['\\b(?:const|let|export|default|import|from|null|true|false)\\b', 'kw'],
      ['\\b\\d+\\b', 'num'],
      ['\\b\\w+(?=:\\s|\\s*=(?:[^=>]|$))', 'key'],
    ],
    py: [
      ['#.*$', 'com'],
      [STR + '(?=:)', 'key'],
      [STR, 'str'],
      ['\\b(?:None|True|False)\\b', 'kw'],
      ['\\b\\d+\\b', 'num'],
      ['\\b\\w+(?=\\s*=[^=])', 'key'],
    ],
    cs: [
      ['\\/\\/.*$', 'com'],
      [STR, 'str'],
      ['\\b(?:public|private|static|readonly|const|class|null|new)\\b', 'kw'],
      ['\\b(?:string|int|bool)\\b(?:\\[\\])?', 'type'],
      ['\\b\\d+\\b', 'num'],
      ['\\b[A-Z]\\w*(?=\\s*=(?:[^=]|$)|\\s*$)', 'key'],
    ],
    yml: [
      ['#.*$', 'com'],
      [STR, 'str'],
      ['^\\s*[\\w-]+(?=:)', 'key'],
      ['^\\s*-(?=\\s)', 'op'],
      ['>-$', 'op'],
      ['\\b(?:true|false|null)\\b', 'kw'],
    ],
    json: [
      [STR + '(?=\\s*:)', 'key'],
      [STR, 'str'],
      ['\\b(?:null|true|false)\\b', 'kw'],
      ['-?\\b\\d+(?:\\.\\d+)?\\b', 'num'],
    ],
    env: [
      ['#.*$', 'com'],
      ['^[A-Z_]+(?==)', 'key'],
      [STR, 'str'],
    ],
  };
  RULES.ts = RULES.js;

  const COMPILED = {};
  Object.keys(RULES).forEach((lang) => {
    COMPILED[lang] = new RegExp(RULES[lang].map((r) => '(' + r[0] + ')').join('|'), 'g');
  });

  function tokenizeMarkdown(line) {
    if (/^#/.test(line)) return [{ text: line, cls: 'head' }];
    if (/^>/.test(line)) return [{ text: line, cls: 'com' }];
    if (/^- /.test(line)) return [{ text: '- ', cls: 'head' }, { text: line.slice(2), cls: '' }];
    return [{ text: line, cls: '' }];
  }

  function tokenize(line, lang) {
    if (!line) return [];
    if (lang === 'md') return tokenizeMarkdown(line);
    const rules = RULES[lang];
    const re = COMPILED[lang];
    if (!rules) return [{ text: line, cls: '' }];

    re.lastIndex = 0;
    const out = [];
    let last = 0;
    let m;
    while ((m = re.exec(line))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      if (m.index > last) out.push({ text: line.slice(last, m.index), cls: '' });
      for (let k = 0; k < rules.length; k++) {
        if (m[k + 1] !== undefined) { out.push({ text: m[0], cls: rules[k][1] }); break; }
      }
      last = re.lastIndex;
    }
    if (last < line.length) out.push({ text: line.slice(last), cls: '' });
    return out;
  }

  window.Highlight = { tokenize };
})();
