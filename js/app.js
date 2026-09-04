/* =====================================================================
   Minecraft MOTD Generator Pro — app.js
   Build Minecraft server MOTD / chat text using the real §-code formatting
   system, with a live server-list preview and JSON chat-component output.
   Classic script (no modules). Depends on window.WUS (core.js).
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'motd.state';
  var LINE_WARN_LEN = 59;
  var OBFUSCATE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  /* =================================================================
     REFERENCE DATA — official Minecraft Java Edition formatting codes
     ================================================================= */
  var COLORS = [
    { code: '0', name: 'Black',        hex: '#000000', json: 'black' },
    { code: '1', name: 'Dark Blue',    hex: '#0000AA', json: 'dark_blue' },
    { code: '2', name: 'Dark Green',   hex: '#00AA00', json: 'dark_green' },
    { code: '3', name: 'Dark Aqua',    hex: '#00AAAA', json: 'dark_aqua' },
    { code: '4', name: 'Dark Red',     hex: '#AA0000', json: 'dark_red' },
    { code: '5', name: 'Dark Purple',  hex: '#AA00AA', json: 'dark_purple' },
    { code: '6', name: 'Gold',         hex: '#FFAA00', json: 'gold' },
    { code: '7', name: 'Gray',         hex: '#AAAAAA', json: 'gray' },
    { code: '8', name: 'Dark Gray',    hex: '#555555', json: 'dark_gray' },
    { code: '9', name: 'Blue',         hex: '#5555FF', json: 'blue' },
    { code: 'a', name: 'Green',        hex: '#55FF55', json: 'green' },
    { code: 'b', name: 'Aqua',         hex: '#55FFFF', json: 'aqua' },
    { code: 'c', name: 'Red',          hex: '#FF5555', json: 'red' },
    { code: 'd', name: 'Light Purple', hex: '#FF55FF', json: 'light_purple' },
    { code: 'e', name: 'Yellow',       hex: '#FFFF55', json: 'yellow' },
    { code: 'f', name: 'White',        hex: '#FFFFFF', json: 'white' }
  ];

  var FORMATS = [
    { code: 'k', name: 'Obfuscated',    key: 'obfuscated',   desc: 'Randomly cycles glyphs while displayed' },
    { code: 'l', name: 'Bold',          key: 'bold',          desc: 'Renders text with thicker glyphs' },
    { code: 'm', name: 'Strikethrough', key: 'strikethrough', desc: 'Draws a line through the text' },
    { code: 'n', name: 'Underline',     key: 'underline',     desc: 'Draws a line under the text' },
    { code: 'o', name: 'Italic',        key: 'italic',        desc: 'Slants the text' }
  ];

  var RESET = { code: 'r', name: 'Reset', desc: 'Clears all active colors and formatting' };

  var COLOR_BY_CODE = {};
  COLORS.forEach(function (c) { COLOR_BY_CODE[c.code] = c; });

  var FORMAT_KEY_BY_CODE = {};
  FORMATS.forEach(function (f) { FORMAT_KEY_BY_CODE[f.code] = f.key; });

  var VALID_CODES = COLORS.map(function (c) { return c.code; })
    .concat(FORMATS.map(function (f) { return f.code; }))
    .concat([RESET.code]);

  /* ----------------------------- DOM refs ---------------------------- */
  var line1 = document.getElementById('line1');
  var line2 = document.getElementById('line2');
  var line1Counter = document.getElementById('line1Counter');
  var line2Counter = document.getElementById('line2Counter');

  var colorSwatches = document.getElementById('colorSwatches');
  var formatButtons = document.getElementById('formatButtons');
  var btnReset = document.getElementById('btnReset');
  var btnClear = document.getElementById('btnClear');

  var mcPreviewLine1 = document.getElementById('mcPreviewLine1');
  var mcPreviewLine2 = document.getElementById('mcPreviewLine2');

  var rawOutput = document.getElementById('rawOutput');
  var jsonOutput = document.getElementById('jsonOutput');
  var btnCopyRaw = document.getElementById('btnCopyRaw');
  var btnCopyJson = document.getElementById('btnCopyJson');

  var refRows = document.getElementById('refRows');

  var activeTextarea = line1;

  /* =================================================================
     §-STRING PARSER
     Splits a raw §-coded string into formatting runs. A color code
     resets bold/italic/underline/strikethrough/obfuscated (matching
     real Minecraft chat behavior); §r resets everything including
     color; format codes toggle on without touching color or other
     active formats.
     ================================================================= */
  function defaultState() {
    return { color: null, bold: false, italic: false, underline: false, strikethrough: false, obfuscated: false };
  }

  function cloneState(s) {
    return { color: s.color, bold: s.bold, italic: s.italic, underline: s.underline, strikethrough: s.strikethrough, obfuscated: s.obfuscated };
  }

  function parseMotd(text) {
    var runs = [];
    var state = defaultState();
    var buffer = '';
    var i = 0;
    var len = text.length;

    function flush() {
      if (buffer.length) {
        var r = cloneState(state);
        r.text = buffer;
        runs.push(r);
        buffer = '';
      }
    }

    while (i < len) {
      var ch = text.charAt(i);
      if (ch === '§' && i + 1 < len) {
        var code = text.charAt(i + 1).toLowerCase();
        if (VALID_CODES.indexOf(code) !== -1) {
          flush();
          if (COLOR_BY_CODE[code]) {
            state = defaultState();
            state.color = code;
          } else if (code === RESET.code) {
            state = defaultState();
          } else if (FORMAT_KEY_BY_CODE[code]) {
            state = cloneState(state);
            state[FORMAT_KEY_BY_CODE[code]] = true;
          }
          i += 2;
          continue;
        }
      }
      buffer += ch;
      i += 1;
    }
    flush();
    return runs;
  }

  /* Strip §-codes to get the "visible" length of a line for the char counter. */
  function stripCodes(text) {
    return text.replace(/§[0-9a-fk-or]/gi, '');
  }

  /* =================================================================
     JSON CHAT-COMPONENT BUILDER
     ================================================================= */
  function runToComponent(run) {
    var c = { text: run.text };
    if (run.color) c.color = COLOR_BY_CODE[run.color].json;
    if (run.bold) c.bold = true;
    if (run.italic) c.italic = true;
    if (run.underline) c.underline = true;
    if (run.strikethrough) c.strikethrough = true;
    if (run.obfuscated) c.obfuscated = true;
    return c;
  }

  function buildJsonComponents(text) {
    return parseMotd(text).map(runToComponent);
  }

  /* =================================================================
     CURSOR-AWARE CODE INSERTION
     ================================================================= */
  function insertAtCursor(textarea, code) {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    if (typeof start !== 'number') start = textarea.value.length;
    if (typeof end !== 'number') end = start;
    var val = textarea.value;
    var insertion = '§' + code;
    textarea.value = val.slice(0, start) + insertion + val.slice(end);
    var newPos = start + insertion.length;
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
    activeTextarea = textarea;
    handleTextChange();
  }

  /* =================================================================
     PREVIEW RENDERING (Minecraft server-list style)
     ================================================================= */
  function decorationFor(run) {
    var parts = [];
    if (run.underline) parts.push('underline');
    if (run.strikethrough) parts.push('line-through');
    return parts.join(' ');
  }

  function renderPreviewLine(container, text) {
    container.innerHTML = '';
    var runs = parseMotd(text);
    if (!runs.length) {
      container.innerHTML = '&nbsp;';
      return;
    }
    runs.forEach(function (run) {
      var span = document.createElement('span');
      span.textContent = run.text;
      if (run.color) span.style.color = COLOR_BY_CODE[run.color].hex;
      if (run.bold) span.style.fontWeight = '700';
      if (run.italic) span.style.fontStyle = 'italic';
      var deco = decorationFor(run);
      if (deco) span.style.textDecoration = deco;
      if (run.obfuscated) {
        span.classList.add('mc-obfuscated');
        span.dataset.original = run.text;
        if (!prefersReducedMotion) {
          span.textContent = randomizeText(run.text);
        }
      }
      container.appendChild(span);
    });
  }

  function randomizeText(original) {
    var out = '';
    for (var i = 0; i < original.length; i++) {
      var ch = original.charAt(i);
      if (/\s/.test(ch)) { out += ch; continue; }
      out += OBFUSCATE_POOL.charAt(Math.floor(Math.random() * OBFUSCATE_POOL.length));
    }
    return out;
  }

  var prefersReducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var obfuscateTimer = null;
  function startObfuscationLoop() {
    if (prefersReducedMotion || obfuscateTimer) return;
    obfuscateTimer = setInterval(function () {
      var nodes = document.querySelectorAll('.mc-obfuscated');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = randomizeText(nodes[i].dataset.original || '');
      }
    }, 50);
  }

  /* =================================================================
     CHARACTER COUNTERS
     ================================================================= */
  function updateCounter(counterEl, value) {
    var visible = stripCodes(value).length;
    counterEl.textContent = visible + ' / ' + LINE_WARN_LEN;
    counterEl.classList.toggle('is-warn', visible > LINE_WARN_LEN);
  }

  /* =================================================================
     OUTPUT RENDERING + PERSISTENCE
     ================================================================= */
  function combinedRaw() {
    return line1.value + '\n' + line2.value;
  }

  function render() {
    updateCounter(line1Counter, line1.value);
    updateCounter(line2Counter, line2.value);

    renderPreviewLine(mcPreviewLine1, line1.value);
    renderPreviewLine(mcPreviewLine2, line2.value);
    startObfuscationLoop();

    rawOutput.textContent = combinedRaw();

    var components = buildJsonComponents(combinedRaw());
    jsonOutput.textContent = JSON.stringify(components, null, 2);
  }

  function persist() {
    WUS.store.set(STORE_KEY, { line1: line1.value, line2: line2.value });
  }
  var persistDebounced = WUS.debounce(persist, 400);

  function handleTextChange() {
    render();
    persistDebounced();
  }

  function restore() {
    var saved = WUS.store.get(STORE_KEY, null);
    if (saved) {
      if (typeof saved.line1 === 'string') line1.value = saved.line1;
      if (typeof saved.line2 === 'string') line2.value = saved.line2;
    } else {
      line1.value = '§6§lWelcome §rto §a§nmy server';
      line2.value = '§7Running §fPaper §71.21 §8| §b0/100 players';
    }
    render();
  }

  /* =================================================================
     ACTIONS
     ================================================================= */
  function clearAll() {
    line1.value = '';
    line2.value = '';
    render();
    persist();
    line1.focus();
    activeTextarea = line1;
    WUS.toast('Cleared');
  }

  function copyRaw() {
    WUS.copy(combinedRaw(), 'Raw §-coded string copied');
  }

  function copyJson() {
    WUS.copy(jsonOutput.textContent, 'JSON chat component copied');
  }

  /* =================================================================
     TOOLBAR BUILD
     ================================================================= */
  function buildColorSwatches() {
    var html = '';
    COLORS.forEach(function (c) {
      html += '<button type="button" class="swatch-btn" data-color="' + c.code + '" ' +
        'title="' + WUS.escapeHtml(c.name) + ' (§' + c.code + ')" aria-label="Insert ' + WUS.escapeHtml(c.name) + ' color code">' +
        '<span class="swatch-chip" style="background:' + c.hex + '"></span>' + WUS.escapeHtml(c.name) +
        '</button>';
    });
    colorSwatches.innerHTML = html;
  }

  function buildFormatButtons() {
    var html = '';
    FORMATS.forEach(function (f) {
      html += '<button type="button" class="btn btn--sm format-btn" data-fmt="' + f.code + '" ' +
        'title="' + WUS.escapeHtml(f.name) + ' (§' + f.code + ')">' +
        '§' + f.code + ' ' + WUS.escapeHtml(f.name) +
        '</button>';
    });
    formatButtons.innerHTML = html;
  }

  function buildReferenceTable() {
    var html = '';
    COLORS.forEach(function (c) {
      html += '<tr><td class="mono">§' + c.code + '</td>' +
        '<td><span class="ref-swatch" style="background:' + c.hex + '"></span></td>' +
        '<td>' + WUS.escapeHtml(c.name) + '</td>' +
        '<td class="muted">Color · ' + c.hex + '</td></tr>';
    });
    FORMATS.forEach(function (f) {
      html += '<tr><td class="mono">§' + f.code + '</td>' +
        '<td><span class="ref-swatch" style="background:transparent;border-style:dashed"></span></td>' +
        '<td>' + WUS.escapeHtml(f.name) + '</td>' +
        '<td class="muted">' + WUS.escapeHtml(f.desc) + '</td></tr>';
    });
    html += '<tr><td class="mono">§' + RESET.code + '</td>' +
      '<td><span class="ref-swatch" style="background:transparent;border-style:dashed"></span></td>' +
      '<td>' + WUS.escapeHtml(RESET.name) + '</td>' +
      '<td class="muted">' + WUS.escapeHtml(RESET.desc) + '</td></tr>';
    refRows.innerHTML = html;
  }

  /* =================================================================
     SHORTCUTS HELP MODAL
     ================================================================= */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'C'], desc: 'Copy raw §-coded string' },
    { keys: ['mod', 'Shift', 'C'], desc: 'Copy JSON chat component' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];

  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }

  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }

  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) {
    if (e.target === helpBackdrop) closeHelp();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp();
  });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  /* =================================================================
     WIRING
     ================================================================= */
  buildColorSwatches();
  buildFormatButtons();
  buildReferenceTable();
  buildShortcutTable();

  colorSwatches.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.swatch-btn') : null;
    if (!btn) return;
    insertAtCursor(activeTextarea, btn.getAttribute('data-color'));
  });

  formatButtons.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.format-btn') : null;
    if (!btn) return;
    insertAtCursor(activeTextarea, btn.getAttribute('data-fmt'));
  });

  btnReset.addEventListener('click', function () { insertAtCursor(activeTextarea, RESET.code); });
  btnClear.addEventListener('click', clearAll);
  btnCopyRaw.addEventListener('click', copyRaw);
  btnCopyJson.addEventListener('click', copyJson);

  [line1, line2].forEach(function (ta) {
    ta.addEventListener('focus', function () { activeTextarea = ta; });
    ta.addEventListener('input', handleTextChange);
  });

  WUS.registerShortcut('mod+c', function () { copyRaw(); }, 'Copy raw §-coded string');
  WUS.registerShortcut('mod+shift+c', function () { copyJson(); }, 'Copy JSON chat component');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* =================================================================
     INIT
     ================================================================= */
  restore();
})();
