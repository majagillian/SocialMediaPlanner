'use strict';
/* =========================================================================
   Violet Planner – Whiteboard
   Live-Module, freie Farben, Designvorlagen, HTML-Visualisierungen,
   Frames, Präsentationsmodus mit Animationen, Timer & Stoppuhr
   ========================================================================= */
window.Board = (() => {
  const BRAND = ['#7C3AED', '#A78BFA', '#EDE9FE', '#34D399', '#D1FAE5', '#FB923C', '#FFEDD5', '#FEF9C3', '#FCE7F3', '#1F1B2E', '#94A3B8', '#FFFFFF'];
  const NOTE_COLORS = ['#EDE9FE', '#D1FAE5', '#FFEDD5', '#FEF9C3', '#FCE7F3', '#E0F2FE', '#FFFFFF'];
  const ANIMS = [['none', 'Keine'], ['fade', 'Einblenden'], ['up', 'Von unten'], ['down', 'Von oben'], ['left', 'Von links'], ['right', 'Von rechts'],
    ['zoom', 'Heranzoomen'], ['pop', 'Aufploppen'], ['wipe', 'Wischen'], ['blur', 'Unschärfe'], ['spin', 'Drehen']];
  const TEXTUAL = ['note', 'text', 'rect', 'ellipse', 'diamond', 'shape'];
  const SHAPES = ['rect', 'ellipse', 'diamond', 'shape'];
  // Formenbibliothek (SVG im 100×100-Raster, wird frei skaliert)
  const SHAPE_DEFS = {
    triangle: ['Dreieck', '<polygon points="50,2 98,98 2,98"/>', 160, 140],
    rtriangle: ['Rechtwinkliges Dreieck', '<polygon points="2,2 98,98 2,98"/>', 150, 150],
    pentagon: ['Fünfeck', '<polygon points="50,2 98,38 80,98 20,98 2,38"/>', 160, 155],
    hexagon: ['Sechseck', '<polygon points="25,2 75,2 98,50 75,98 25,98 2,50"/>', 180, 156],
    octagon: ['Achteck', '<polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30"/>', 160, 160],
    star: ['Stern', '<polygon points="50,2 61,37 98,37 68,59 79,96 50,74 21,96 32,59 2,37 39,37"/>', 170, 165],
    parallelogram: ['Parallelogramm', '<polygon points="22,2 98,2 78,98 2,98"/>', 200, 110],
    trapezoid: ['Trapez', '<polygon points="22,2 78,2 98,98 2,98"/>', 200, 120],
    arrow: ['Pfeil', '<polygon points="2,30 62,30 62,4 98,50 62,96 62,70 2,70"/>', 210, 110],
    darrow: ['Doppelpfeil', '<polygon points="2,50 28,6 28,30 72,30 72,6 98,50 72,94 72,70 28,70 28,94"/>', 230, 110],
    uparrow: ['Pfeil nach oben', '<polygon points="50,2 96,40 70,40 70,98 30,98 30,40 4,40"/>', 120, 180],
    chevron: ['Chevron (Prozess)', '<polygon points="2,2 74,2 98,50 74,98 2,98 26,50"/>', 200, 100],
    pentarrow: ['Prozess-Pfeil', '<polygon points="2,2 76,2 98,50 76,98 2,98"/>', 200, 100],
    cross: ['Plus', '<polygon points="35,2 65,2 65,35 98,35 98,65 65,65 65,98 35,98 35,65 2,65 2,35 35,35"/>', 140, 140],
    heart: ['Herz', '<path d="M50,95 C20,72 2,55 2,32 C2,14 16,3 30,3 C40,3 47,9 50,17 C53,9 60,3 70,3 C84,3 98,14 98,32 C98,55 80,72 50,95 Z"/>', 160, 150],
    bubble: ['Sprechblase', '<path d="M8,4 H92 Q98,4 98,10 V66 Q98,72 92,72 H40 L18,96 L24,72 H8 Q2,72 2,66 V10 Q2,4 8,4 Z"/>', 220, 160],
    thought: ['Gedankenblase', '<path d="M24,70 C8,70 2,60 2,48 C2,36 12,28 22,30 C22,14 36,4 52,6 C64,2 80,8 84,22 C94,24 98,34 98,44 C98,60 86,70 72,70 Z"/><circle cx="20" cy="84" r="7"/><circle cx="9" cy="95" r="4"/>', 220, 160],
    cloud: ['Wolke', '<path d="M26,86 C10,86 2,76 2,64 C2,52 11,44 22,44 C22,26 36,14 52,14 C66,14 76,22 80,34 C91,35 98,45 98,58 C98,74 87,86 72,86 Z"/>', 220, 150],
    cylinder: ['Zylinder / Datenbank', '<path d="M2,14 C2,3 98,3 98,14 V86 C98,97 2,97 2,86 Z"/><path d="M2,14 C2,25 98,25 98,14" style="fill:none"/>', 140, 170],
    document: ['Dokument', '<path d="M2,2 H98 V84 C76,72 56,100 30,92 C18,88 10,86 2,88 Z"/>', 170, 160],
    folded: ['Notizzettel (Ecke)', '<path d="M2,2 H98 V74 L74,98 H2 Z"/><path d="M98,74 H74 V98" style="fill:none"/>', 170, 170],
    banner: ['Banner', '<path d="M2,10 H98 L86,50 L98,90 H2 L14,50 Z"/>', 240, 100],
    shield: ['Schild', '<path d="M50,2 L96,16 V46 C96,72 76,90 50,98 C24,90 4,72 4,46 V16 Z"/>', 150, 170],
    moon: ['Mond', '<path d="M68,4 C40,8 22,30 22,52 C22,76 42,96 68,96 C76,96 84,94 90,90 C66,86 50,70 50,50 C50,30 64,14 84,8 C79,5 74,4 68,4 Z"/>', 140, 160],
    lightning: ['Blitz', '<polygon points="60,2 14,56 46,56 36,98 86,40 52,40"/>', 120, 170],
    tag: ['Etikett', '<path d="M2,2 H70 L98,50 L70,98 H2 Z"/><circle cx="74" cy="50" r="6" style="fill:#fff"/>', 200, 110],
    frame_rect: ['Klammer (Gruppe)', '<path d="M20,2 H2 V98 H20 M80,2 H98 V98 H80" style="fill:none"/>', 240, 140],
  };
  const QUICK_COLORS = [['#EDE9FE', '#7C3AED'], ['#7C3AED', '#5B21B6'], ['#C4B5FD', '#7C3AED'], ['#D1FAE5', '#059669'], ['#34D399', '#059669'], ['#FFEDD5', '#EA580C'],
    ['#FB923C', '#C2410C'], ['#FEF9C3', '#CA8A04'], ['#FCE7F3', '#DB2777'], ['#E0F2FE', '#0284C7'], ['#F1F5F9', '#64748B'], ['#1F1B2E', '#1F1B2E'], ['#FFFFFF', '#CBD5E1']];
  /** dunkle Füllung → helle Schrift */
  function contrastText(hex) {
    const n = parseInt(toHex6(hex).slice(1), 16); const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#1F1B2E' : '#FFFFFF';
  }
  const uid = () => Math.random().toString(36).slice(2, 10);
  /** Mehrfachauswahl-Taste: Strg (Windows/Linux), Cmd (Mac) oder Shift */
  const addKey = e => e.shiftKey || e.ctrlKey || e.metaKey;
  const CORNERS = ['tl', 'tr', 'br', 'bl'];
  const CORNER_PRESETS = { alle: [1, 1, 1, 1], keine: [0, 0, 0, 0], oben: [1, 1, 0, 0], unten: [0, 0, 1, 1], links: [1, 0, 0, 1], rechts: [0, 1, 1, 0], diagonal: [1, 0, 1, 0], gegendiagonal: [0, 1, 0, 1] };
  function rectRadius(it) {
    const r = it.radius ?? 8; const c = it.corners || {};
    return CORNERS.map(k => (c[k] === false ? 0 : r) + 'px').join(' ');
  }

  const EMBEDS = {
    okr:      { label: 'OKR-Ziel', desc: 'Ein Ziel mit Key Results und Fortschritt', icon: 'target', w: 400, h: 330, ref: 'objectives', module: 'okr' },
    'okr-all':{ label: 'Alle Ziele', desc: 'Fortschritt aller Ziele auf einen Blick', icon: 'trophy', w: 380, h: 240, module: 'okr' },
    tasks:    { label: 'Aufgabenliste', desc: 'Abhakbare Liste, optional nach Projekt gefiltert', icon: 'list-checks', w: 380, h: 330, filter: true, module: 'tasks' },
    task:     { label: 'Einzelne Aufgabe', desc: 'Eine Aufgabe als Karte', icon: 'square-check', w: 300, h: 130, ref: 'tasks', module: 'tasks' },
    kanban:   { label: 'Aufgaben-Kanban', desc: 'Offen / In Arbeit / Erledigt mit Drag & Drop', icon: 'kanban', w: 800, h: 420, filter: true, module: 'tasks' },
    calendar: { label: 'Kalender', desc: 'Monatsansicht mit Aufgaben, Posts und Stichtagen', icon: 'calendar-days', w: 620, h: 500, module: 'calendar' },
    pipeline: { label: 'Content-Pipeline', desc: 'Idee → Skript → Produktion → Geplant → Veröffentlicht', icon: 'clapperboard', w: 1060, h: 420, platform: true, module: 'content' },
    posts:    { label: 'Nächste Posts', desc: 'Kommende Beiträge als Liste', icon: 'send', w: 380, h: 330, platform: true, module: 'content' },
    post:     { label: 'Einzelner Post', desc: 'Ein Beitrag als Karte', icon: 'image', w: 300, h: 140, ref: 'posts', module: 'content' },
  };

  let root, viewport, world, svg, props, board, data;
  let tool = 'select', selected = null, connectFrom = null, spaceDown = false;
  let saveTimer = null, undoStack = [], drag = null, pendingSnap = null;
  let designTheme = 0;
  let multi = []; // Mehrfachauswahl (IDs)
  let penColor = '#7C3AED', penWidth = 4;
  let uiPrefs = (() => { try { return { tools: true, toc: false, ...JSON.parse(localStorage.getItem('vp-ui') || '{}') }; } catch { return { tools: true, toc: false }; } })();
  const saveUi = () => { try { localStorage.setItem('vp-ui', JSON.stringify(uiPrefs)); } catch { /* egal */ } };
  let replaceImageTarget = null, mouseWorld = { x: 0, y: 0 }, propsOpen = (() => { try { return localStorage.getItem('vp-props') !== '0'; } catch { return true; } })();
  let lastShapeColors = ['#EDE9FE', '#7C3AED']; // zuletzt gewählte Schnellfarbe für neue Formen

  // ---------- Laden / Speichern / Rückgängig -------------------------------
  function parseBoard(b) {
    let d; try { d = JSON.parse(b.data || '{}'); } catch { d = {}; }
    d.items ||= []; d.connectors ||= []; d.view ||= { x: 80, y: 60, z: 1 };
    return d;
  }
  function lastBoardId() { try { return Number(localStorage.getItem('vp-board')); } catch { return 0; } }
  function rememberBoard(id) { try { localStorage.setItem('vp-board', id); } catch { /* egal */ } }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 500); }
  function saveNow() {
    clearTimeout(saveTimer); saveTimer = null;
    if (board) DB.update('boards', board.id, { data: JSON.stringify(data) }, true).catch(() => {});
  }
  const snapshot = () => JSON.stringify({ items: data.items, connectors: data.connectors });
  function pushUndo(snap = snapshot()) { undoStack.push(snap); if (undoStack.length > 80) undoStack.shift(); }
  function undo() {
    const s = undoStack.pop(); if (!s) return toast('Nichts zum Rückgängigmachen');
    Object.assign(data, JSON.parse(s)); selected = null; render(); scheduleSave();
  }
  const find = id => data.items.find(i => i.id === id);
  const findLink = id => data.connectors.find(c => c.id === id);
  const nodeOf = id => world.querySelector(`.wb-item[data-id="${id}"]`);

  // ---------- Farben ------------------------------------------------------
  function hexA(hex, a) {
    const h6 = toHex6(hex); const n = parseInt(h6.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  function toHex6(c) {
    if (!c) return '#7C3AED';
    if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).split('').map(x => x + x).join('');
    return /^#[0-9a-f]{6}$/i.test(c) ? c : '#7C3AED';
  }
  const savedPalette = () => getSetting('palette', []);

  // ---------- Montieren ---------------------------------------------------
  function mount(main) {
    board = S.boards.find(b => b.id === lastBoardId()) || S.boards[0];
    data = parseBoard(board); undoStack = []; selected = null; tool = 'select';
    main.innerHTML = `
      <div class="wb">
        <div class="wb-top">
          <select class="input wb-boards">${S.boards.map(b => `<option value="${b.id}" ${b.id === board.id ? 'selected' : ''}>${esc(b.name)}${b.project_id && projName(b.project_id) ? ` · ${esc(projName(b.project_id))}` : ''}</option>`).join('')}</select>
          <button class="btn sm" data-b="new">+ Board</button>
          <button class="btn sm ghost" data-b="rename">Bearbeiten</button>
          <button class="btn sm ghost" data-b="delete">Löschen</button>
          <span class="grow"></span>
          <button class="btn sm ghost" data-b="template">${ic('layout-template', '#7C3AED', 'ic sm')} Board-Vorlage</button>
          <button class="btn sm ghost" data-b="timer">${ic('timer', '#7C3AED', 'ic sm')} Timer</button>
          <div class="seg wb-toggles" title="Bereiche ein-/ausblenden">
            <button data-b="toc" title="Inhaltsverzeichnis der Frames">${ic('list-tree', '#6B6780', 'ic sm')}<span>Inhalt</span></button>
            <button data-b="tools" title="Werkzeugleiste ein-/ausblenden">${ic('pencil-ruler', '#6B6780', 'ic sm')}<span>Werkzeuge</span></button>
            <button data-b="propsp" title="Eigenschaften-Panel ein-/ausblenden">${ic('sliders-horizontal', '#6B6780', 'ic sm')}<span>Eigenschaften</span></button>
            <button data-b="nav" title="Navigationskonsole (nur bei Boards mit Phasen)">${ic('gamepad-2', '#6B6780', 'ic sm')}<span>Navigation</span></button>
          </div>
          <button class="btn sm ghost" data-b="help" title="Tastenkürzel & Bedienung (?)">${ic('keyboard', '#6B6780', 'ic sm')}</button>
          <button class="btn sm ghost" data-b="undo" title="Rückgängig (Strg+Z)">${ic('undo-2', '#6B6780', 'ic sm')}</button>
          <div class="zoom"><button data-b="zoomout">−</button><span class="wb-zoom">100%</span><button data-b="zoomin">+</button></div>
          <button class="btn sm ghost" data-b="fit">Einpassen</button>
          <button class="btn sm primary" data-b="present">${ic('play', '#FFFFFF', 'ic sm')} Präsentieren</button>
        </div>
        <div class="wb-tools">
          ${toolBtn('select', 'mouse-pointer-2', 'Auswählen (V)')}
          ${toolBtn('hand', 'hand', 'Verschieben (H / Leertaste)')}
          <i class="sep"></i>
          ${toolBtn('note', 'sticky-note', 'Haftnotiz (N)')}
          ${toolBtn('text', 'type', 'Text (T)')}
          ${toolBtn('rect', 'square', 'Rechteck (R)')}
          ${toolBtn('ellipse', 'circle', 'Kreis (O)')}
          <button class="tool" data-tool="shapes" title="Formenbibliothek (D)">${ic('shapes', '#4B4563', 'ic')}</button>
          ${toolBtn('connect', 'move-up-right', 'Verbinden (L): erst Start, dann Ziel anklicken – oder an den ● Punkten ziehen')}
          ${toolBtn('pen', 'pen-line', 'Stift – freihand zeichnen (B)')}
          <button class="tool" data-tool="choice" title="Auswahlliste – Optionen zum Anklicken (K)">${ic('list-checks', '#4B4563', 'ic')}</button>
          ${toolBtn('frame', 'frame', 'Frame / Folie (F) – mit Vorlagen')}
          <i class="sep"></i>
          ${toolBtn('design', 'palette', 'Designvorlagen (G)')}
          ${toolBtn('icon', 'shapes', 'Icon-Bibliothek (I)')}
          ${toolBtn('image', 'image-plus', 'Bild einfügen')}
          ${toolBtn('html', 'code-xml', 'HTML-Visualisierung (Y)')}
          ${toolBtn('proto', 'smartphone', 'Klickbarer Prototyp (U) – importieren, kommentieren, mit KI bearbeiten')}
          <i class="sep"></i>
          <button class="tool embed-tool" data-tool="embed" title="Modul einbetten (E)">${ic('blocks', '#FFFFFF', 'ic')}</button>
        </div>
        <div class="wb-toc"></div>
        <div class="wb-viewport"><div class="wb-world"><svg class="wb-links" width="1" height="1"></svg></div></div>
        <div class="wb-props hidden"></div>
        <div class="wb-ctx hidden"></div>
        <div class="wb-hint"></div>
        <div class="wb-nav hidden"></div>
        <div class="pres-bar">
          <button class="pb" data-pres="prev" title="Zurück (←)">‹</button>
          <span class="pres-info"></span>
          <button class="pb" data-pres="next" title="Weiter (→ / Leertaste)">›</button>
          <i class="sep"></i>
          <button class="pb pres-timer" data-pres="timer" title="Timer / Stoppuhr">${ic('timer', '#FFFFFF', 'ic sm')}<span></span></button>
          <button class="pb" data-pres="exit" title="Beenden (Esc)">${ic('x', '#FFFFFF', 'ic sm')}</button>
        </div>
        <input type="file" accept="image/*" class="wb-file" hidden>
      </div>`;
    root = $('.wb', main); viewport = $('.wb-viewport', root); world = $('.wb-world', root);
    svg = $('.wb-links', root); props = $('.wb-props', root);

    bindCommon(world);
    bindToolbar(); bindPointer(); bindProps(); bindCtxBar(); Timer.attach(root); bindPresentation();
    viewport.addEventListener('contextmenu', openContextMenu);
    const onKey = e => keydown(e), onKeyUp = e => { if (e.code === 'Space') { spaceDown = false; viewport.classList.remove('panning'); } };
    const onPaste = e => paste(e), onData = () => refreshEmbeds();
    const onCopy = e => copySelection(e, false), onCut = e => copySelection(e, true);
    const onMouse = e => { lastMouse = { x: e.clientX, y: e.clientY }; mouseWorld = toWorld(e.clientX, e.clientY); };
    document.addEventListener('copy', onCopy); document.addEventListener('cut', onCut); document.addEventListener('pointermove', onMouse);
    const onFs = () => { if (P.active && !document.fullscreenElement && P.fs) stopPresentation(); };
    document.addEventListener('keydown', onKey); document.addEventListener('keyup', onKeyUp);
    document.addEventListener('paste', onPaste); document.addEventListener('fullscreenchange', onFs);
    listeners.add(onData);

    render(); setTool('select'); applyUi();
    try { // Vorlage für ein frisch angelegtes Board anwenden
      const pend = JSON.parse(localStorage.getItem('vp-board-tpl') || 'null');
      if (pend && pend.id === board.id) { localStorage.removeItem('vp-board-tpl'); setTimeout(() => applyTemplate(pend.tpl), 50); }
    } catch { /* egal */ }
    return () => {
      if (P.active) stopPresentation();
      if (saveTimer) saveNow();
      document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('paste', onPaste); document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('copy', onCopy); document.removeEventListener('cut', onCut); document.removeEventListener('pointermove', onMouse);
      listeners.delete(onData); Timer.detach();
    };
  }
  const toolBtn = (t, icon, title) => `<button class="tool" data-tool="${t}" title="${title}">${ic(icon, '#4B4563', 'ic')}</button>`;
  function switchBoard(id) { if (saveTimer) saveNow(); rememberBoard(id); route(); }

  // ---------- Toolbar -----------------------------------------------------
  function bindToolbar() {
    $$('[data-tool]', root).forEach(b => b.onclick = () => {
      const t = b.dataset.tool;
      if (t === 'icon') return openIconPicker();
      if (t === 'embed') return openEmbedPicker();
      if (t === 'image') return $('.wb-file', root).click();
      if (t === 'design') return openDesignGallery();
      if (t === 'html') return addHtml();
      if (t === 'proto') return addProto();
      if (t === 'frame') return openFrameTemplates();
      if (t === 'shapes') return toggleShapePicker(b);
      if (t === 'choice') return addChoice();
      setTool(t);
    });
    $('.wb-file', root).onchange = e => { const f = e.target.files[0]; if (f) addImageFile(f, null, replaceImageTarget); replaceImageTarget = null; e.target.value = ''; };
    $('.wb-boards', root).onchange = e => switchBoard(Number(e.target.value));
    $$('[data-b]', root).forEach(b => b.onclick = async () => {
      const a = b.dataset.b;
      if (a === 'zoomin') zoomAt(null, null, 1.2);
      if (a === 'zoomout') zoomAt(null, null, 1 / 1.2);
      if (a === 'fit') fit();
      if (a === 'undo') undo();
      if (a === 'template') applyTemplate();
      if (a === 'timer') Timer.toggle();
      if (a === 'help') showShortcuts();
      if (a === 'tools') { uiPrefs.tools = !uiPrefs.tools; saveUi(); applyUi(); }
      if (a === 'propsp') { propsOpen = !propsOpen; try { localStorage.setItem('vp-props', propsOpen ? '1' : '0'); } catch { /* egal */ } applyUi(); renderProps(); $('.wb-ctx', root).dataset.key = ''; updateCtxBar(); }
      if (a === 'toc') { uiPrefs.toc = !uiPrefs.toc; saveUi(); applyUi(); }
      if (a === 'nav') { uiPrefs.nav = uiPrefs.nav === false; saveUi(); applyUi(); if (uiPrefs.nav && !navLanes().length) toast('Die Navigation erscheint bei Boards mit Phasen, z. B. der Vorlage „App-Konzept“'); }
      if (a === 'present') startPresentation();
      if (a === 'new') {
        const own = getSetting('boardTemplates', []);
        const v = await openForm({ title: 'Neues Board', submitLabel: 'Anlegen', values: { tpl: '' },
          fields: [{ key: 'name', label: 'Name', required: true },
            { key: 'tpl', label: 'Vorlage', type: 'select', options: [['', 'Leeres Board'], ['appconcept', 'App-Konzept (Vibe Coding)'], ...own.map(t => ['own:' + t.id, '★ ' + t.name]), ['strategy', 'Content-Strategie'], ['pitch', 'Präsentation (3 Folien)'], ['brainstorm', 'Ideen-Brainstorm'], ['week', 'Wochenplanung']] },
            { key: 'project_id', label: 'Projekt (optional)', type: 'select', numeric: true, options: [['', '– keines –'], ...S.projects.map(p => [p.id, p.name])] }] });
        if (!v) return;
        const nb = await DB.create('boards', { name: v.name, project_id: v.project_id, data: JSON.stringify({ items: [], connectors: [], view: { x: 80, y: 60, z: 1 } }) }, true);
        if (v.tpl) { try { localStorage.setItem('vp-board-tpl', JSON.stringify({ id: nb.id, tpl: v.tpl })); } catch { /* egal */ } }
        switchBoard(nb.id);
      }
      if (a === 'rename') {
        const v = await openForm({ title: 'Board bearbeiten', values: { name: board.name, project_id: board.project_id }, fields: [{ key: 'name', label: 'Name', required: true }, { key: 'project_id', label: 'Projekt', type: 'select', numeric: true, options: [['', '– keines –'], ...S.projects.map(p => [p.id, p.name])] }] });
        if (!v) return;
        await DB.update('boards', board.id, { name: v.name, project_id: v.project_id }, true); switchBoard(board.id);
      }
      if (a === 'delete') {
        if (S.boards.length <= 1) return toast('Das letzte Board kann nicht gelöscht werden');
        if (!confirm(`Board „${board.name}“ wirklich löschen?`)) return;
        clearTimeout(saveTimer); saveTimer = null;
        await api('DELETE', `/api/boards/${board.id}`);
        S.boards = S.boards.filter(b => b.id !== board.id); board = null;
        switchBoard(S.boards[0].id);
      }
    });
  }

  function setTool(t) {
    tool = t; connectFrom = null;
    $$('[data-tool]', root).forEach(b => b.classList.toggle('on', b.dataset.tool === t || (b.dataset.tool === 'shapes' && (t.startsWith('shape:') || t === 'diamond'))));
    $('.shape-pop', root)?.remove(); $('.pen-pop', root)?.remove(); if (t === 'pen') setTimeout(showPenPop, 0);
    if (t !== 'select') { $$('.wb-handle', world).forEach(n => n.remove()); $('.wb-ctx', root)?.classList.add('hidden'); } else setTimeout(() => { drawHandles(); updateCtxBar(); }, 0);
    viewport.dataset.tool = t;
    $$('.wb-item.connect-src', world).forEach(n => n.classList.remove('connect-src'));
    const hints = {
      select: 'Ziehen = verschieben · Doppelklick = bearbeiten · Doppelklick auf leere Fläche = Notiz · Mausrad = Zoom',
      hand: 'Fläche ziehen zum Verschieben',
      note: 'Klicke auf die Fläche, um eine Haftnotiz zu setzen', text: 'Klicke, um Text zu setzen',
      rect: 'Klicke, um ein Rechteck zu setzen', ellipse: 'Klicke, um einen Kreis zu setzen', diamond: 'Klicke, um eine Raute zu setzen',
      connect: 'Klicke auf das Start-Element, dann auf das Ziel-Element',
      pen: 'Freihand zeichnen – Farbe und Stärke im Menü links wählen · V oder Esc zum Beenden',
      frame: 'Klicke, um einen Frame (Folie 16:9) zu setzen. Frames werden im Präsentationsmodus nacheinander gezeigt.',
    };
    $('.wb-hint', root).textContent = hints[t] || (t.startsWith('shape:') ? `Klicke auf die Fläche, um „${SHAPE_DEFS[t.slice(6)][0]}“ zu setzen` : '');
  }

  // ---------- Auswahllisten & KI-Prompt -----------------------------------
  function choiceHeight(it) {
    const n = (it.onlySelected ? Math.max(1, (it.options || []).filter(o => o.on).length) : (it.options || []).length) + (it.other ? (it.cols || 1) : 0);
    return 58 + Math.ceil(Math.max(1, n) / (it.cols || 1)) * 37 + 8;
  }
  function makeChoice(title, options, { mode = 'multi', cols = 1, color = '#7C3AED', w = 560, sel = [], other = false, section, label, noPrompt } = {}) {
    const it = { type: 'choice', title, mode, cols, color, w, other, options: options.map(t => typeof t === 'string' ? { t, on: sel.includes(t) } : { ...t, on: sel.includes(t.t) }) };
    if (section) it.section = section; if (label) it.label = label; if (noPrompt) it.noPrompt = true;
    it.h = choiceHeight(it); return it;
  }
  async function toggleOption(it, i) {
    const o = it.options[i]; if (!o) return;
    let val = null;
    if (o.ask && !o.on) { // Option braucht eine Angabe (z. B. Repository-Link)
      const v = await openForm({ title: o.t, values: { val: o.val || '' }, submitLabel: 'Auswählen', fields: [{ key: 'val', label: o.ask, required: true }] });
      if (!v) return; val = v.val.trim();
    }
    pushUndo();
    if (val != null) o.val = val;
    if (it.mode === 'single') { const was = o.on; it.options.forEach(x => { x.on = false; }); o.on = !was; if (o.on) it.otherText = ''; } else o.on = !o.on;
    if (it.onlySelected) it.h = choiceHeight(it);
    updateVisual(it); refreshSummaries(); renderProps(); scheduleSave();
  }
  async function editChoice(it) {
    const v = await openForm({
      title: 'Auswahlliste bearbeiten', submitLabel: 'Übernehmen',
      extra: '<p class="muted small" style="margin:-6px 0 12px">Eine Option pro Zeile. Mit <b>[x]</b> am Zeilenanfang ist sie ausgewählt. Auf dem Board schaltest du Optionen einfach per Klick um.</p>',
      values: { other: !!it.other, title: it.title, label: it.label || '', mode: it.mode || 'multi', cols: it.cols || 1, options: (it.options || []).map(o => (o.on ? '[x] ' : '') + o.t).join('\n') },
      fields: [
        { key: 'title', label: 'Überschrift', required: true, half: true },
        { key: 'label', label: 'Bezeichnung im KI-Prompt (optional)', half: true },
        { key: 'mode', label: 'Auswahl', type: 'select', half: true, options: [['multi', 'Mehrere Optionen'], ['single', 'Nur eine Option']] },
        { key: 'cols', label: 'Spalten', type: 'select', half: true, numeric: true, options: [[1, '1 Spalte'], [2, '2 Spalten'], [3, '3 Spalten']] },
        { key: 'options', label: 'Optionen', type: 'textarea', rows: 10 },
        { key: 'other', label: '„Sonstiges“ mit Freitext anbieten', type: 'checkbox' },
      ],
    });
    if (!v) return;
    pushUndo();
    it.title = v.title; it.label = v.label || ''; it.mode = v.mode; it.cols = v.cols || 1;
    const prev = Object.fromEntries((it.options || []).map(o => [o.t, o]));
    it.options = v.options.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const t = l.replace(/^\[[ x]?\]\s*/i, ''); return { ...(prev[t] || {}), on: /^\[x\]/i.test(l), t }; });
    it.other = !!v.other;
    if (it.mode === 'single') { let seen = false; it.options.forEach(o => { if (o.on && seen) o.on = false; if (o.on) seen = true; }); }
    it.h = Math.max(it.h, choiceHeight(it)); rerenderItem(it); refreshSummaries();
  }
  const PALETTES = [
    ['Violet Planner', ['#7C3AED', '#34D399', '#FB923C', '#FFFFFF', '#1F1B2E']], ['Ozean', ['#0EA5E9', '#0F766E', '#F59E0B', '#F0F9FF', '#0C4A6E']],
    ['Sonnenuntergang', ['#F97316', '#DB2777', '#FACC15', '#FFF7ED', '#431407']], ['Wald', ['#15803D', '#A3E635', '#CA8A04', '#F7FEE7', '#14532D']],
    ['Neon-Nacht', ['#A855F7', '#22D3EE', '#F472B6', '#0B0B1A', '#F5F3FF']], ['Pastell', ['#A78BFA', '#5EEAD4', '#FDBA74', '#FFFBF5', '#3F3F46']],
    ['Minimal Mono', ['#111827', '#6B7280', '#2563EB', '#FFFFFF', '#111827']], ['Retro-Arcade', ['#FF006E', '#3A86FF', '#FFBE0B', '#1A1A2E', '#FFFFFF']],
    ['Kinder bunt', ['#EF4444', '#3B82F6', '#FACC15', '#FFFFFF', '#1F2937']], ['Business', ['#1E3A8A', '#64748B', '#10B981', '#F8FAFC', '#0F172A']],
    ['Candy', ['#EC4899', '#8B5CF6', '#22D3EE', '#FDF2F8', '#500724']], ['Erdtöne', ['#9A3412', '#78716C', '#65A30D', '#FAFAF9', '#292524']],
    ['Cyberpunk', ['#FDE047', '#06B6D4', '#E11D48', '#09090B', '#FAFAFA']], ['Gaming Dark', ['#22C55E', '#6366F1', '#F43F5E', '#111827', '#F9FAFB']],
  ];
  const PAL_ROLES = ['Primär', 'Sekundär', 'Akzent', 'Hintergrund', 'Text'];
  /** „- Spielstand speichern (hoch)“ → { t, prio } */
  function parseFeatureLine(line) {
    let t = line.replace(/\*\*/g, '').replace(/^\s*(?:[-•*–]|\d+[.)])\s*/, '').trim(); if (!t || (/:$/.test(t) && t.length < 40)) return null;
    let prio = null; const m = t.match(/\s*[(\[]\s*(?:Priorität:?\s*)?(hoch|mittel|niedrig)\s*[)\]]\s*$/i) || t.match(/\s+[–—-]\s*(?:Priorität:?\s*)?(hoch|mittel|niedrig)\s*$/i);
    if (m) { prio = m[1].toLowerCase(); t = t.slice(0, m.index).trim(); }
    return t ? { t, prio } : null;
  }
  async function itemAction(it, act, pt) {
    const [a, arg] = act.split(':'); const i = Number(arg);
    if (a.startsWith('pr-')) return protoAction(it, a, arg, pt);
    if (a === 'ch-other') {
      const v = await openForm({ title: `${it.title}: Sonstiges`, values: { t: it.otherText || '' }, submitLabel: 'Übernehmen', fields: [{ key: 't', label: 'Eigene Angabe (leer lassen = nicht ausgewählt)', type: 'textarea', rows: 2 }] });
      if (!v) return; pushUndo(); it.otherText = v.t.trim();
      if (it.mode === 'single' && it.otherText) it.options.forEach(o => { o.on = false; });
      updateVisual(it); refreshSummaries(); return scheduleSave();
    }
    if (a === 'fx-add' || a === 'fx-edit') {
      const r = a === 'fx-edit' ? it.rows[i] : null;
      const v = await openForm({ title: r ? 'Funktion bearbeiten' : 'Technische Funktionen hinzufügen', submitLabel: r ? 'Übernehmen' : 'Hinzufügen', values: { t: r?.t || '', prio: r?.prio || 'mittel' },
        extra: r ? '' : '<p class="muted small" style="margin:-6px 0 12px">Mehrere Funktionen auf einmal: eine pro Zeile – du kannst die Liste aus der KI-Antwort (Brainstorming) direkt einfügen. Prioritäten wie „(hoch)“ am Zeilenende werden automatisch erkannt.</p>',
        fields: [{ key: 't', label: r ? 'Funktion' : 'Funktion(en)', type: r ? 'text' : 'textarea', rows: 4, required: true }, { key: 'prio', label: 'Priorität', type: 'select', options: [['hoch', 'Hoch – unverzichtbar'], ['mittel', 'Mittel – wichtig'], ['niedrig', 'Niedrig – nice to have']] }] });
      if (!v) return; pushUndo();
      if (r) { r.t = v.t.trim(); r.prio = v.prio; } else v.t.split('\n').map(parseFeatureLine).filter(Boolean).forEach(x => it.rows.push({ t: x.t, prio: x.prio || v.prio }));
      updateVisual(it); refreshSummaries(); return scheduleSave();
    }
    if (a === 'fx-prio') { pushUndo(); const order = ['hoch', 'mittel', 'niedrig']; const r = it.rows[i]; r.prio = order[(order.indexOf(r.prio || 'mittel') + 1) % 3]; updateVisual(it); refreshSummaries(); return scheduleSave(); }
    if (a === 'fx-done') { pushUndo(); it.rows[i].done = !it.rows[i].done; updateVisual(it); refreshSummaries(); return scheduleSave(); }
    if (a === 'iter-new') return addIteration();
    if (a === 'dl-go') return jumpToFrame(arg);
    if (a === 'fx-del') { pushUndo(); it.rows.splice(i, 1); updateVisual(it); refreshSummaries(); return scheduleSave(); }
    if (a === 'fx-sort') { pushUndo(); const o = { hoch: 0, mittel: 1, niedrig: 2 }; it.rows.sort((x, y) => o[x.prio || 'mittel'] - o[y.prio || 'mittel']); updateVisual(it); refreshSummaries(); return scheduleSave(); }
    if (a === 'pal-edit') {
      const c = it.colors[i];
      const v = await openForm({ title: `${c.role}-Farbe`, values: { pick: c.hex, hex: c.hex, role: c.role }, submitLabel: 'Übernehmen',
        fields: [{ key: 'pick', label: 'Farbe wählen', type: 'color', half: true }, { key: 'hex', label: 'oder Hex-Code eingeben (hat Vorrang, wenn geändert)', half: true }, { key: 'role', label: 'Bezeichnung' }] });
      if (!v) return; pushUndo();
      const hx = /^#?[0-9a-f]{6}$/i.test(v.hex.trim()) && v.hex.trim().replace('#', '').toLowerCase() !== c.hex.replace('#', '').toLowerCase() ? '#' + v.hex.trim().replace('#', '') : v.pick;
      c.hex = hx.toUpperCase(); c.role = v.role || c.role; it.name = 'Eigene Palette';
      updateVisual(it); refreshSummaries(); return scheduleSave();
    }
    if (a === 'pal-choose') {
      const el = h(`<div class="modal-backdrop"><div class="modal pal-modal"><h3>Farbpalette wählen</h3>
        <div class="pal-grid">${PALETTES.map(([n, cs], k) => `<button class="pal-opt" data-k="${k}"><span class="pal-strip">${cs.map(c => `<i style="background:${c}"></i>`).join('')}</span><b>${esc(n)}</b></button>`).join('')}</div>
        <div class="modal-actions"><span class="muted small">Einzelne Farben änderst du danach per Klick auf das Farbfeld.</span><span class="grow"></span><button class="btn ghost" data-x>Abbrechen</button></div></div></div>`);
      const close = () => el.remove(); el.addEventListener('mousedown', e => { if (e.target === el) close(); }); $('[data-x]', el).onclick = close;
      el.onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; const [n, cs] = PALETTES[b.dataset.k]; pushUndo(); it.name = n; it.colors = cs.map((hx, k) => ({ role: PAL_ROLES[k], hex: hx })); close(); updateVisual(it); refreshSummaries(); scheduleSave(); };
      $('#modal-root').appendChild(el); return;
    }
    if (a === 'gl-add') { pushUndo(); it.entries = [...(it.entries || []), { label: `Bild ${(it.entries || []).length + 1}`, cap: '' }]; updateVisual(it); return scheduleSave(); }
    if (a === 'gl-img') { it._pick = i; replaceImageTarget = it; return $('.wb-file', root).click(); }
    if (a === 'gl-cap') {
      const e2 = it.entries[i]; if (!e2) return;
      const v = await openForm({ title: 'Bild beschreiben', submitLabel: 'Übernehmen', values: { label: e2.label || '', cap: e2.cap || '' }, fields: [
        { key: 'label', label: 'Titel (z. B. „Hauptfigur“, „Level 2“, „Gegner: Schleimmonster“)', required: true },
        { key: 'cap', label: 'Erklärung – was soll die KI daraus übernehmen?', type: 'textarea', rows: 4, placeholder: 'z. B. „So soll die Hauptfigur aussehen: runder Roboter, Neon-Farben, kann doppelt springen“' }] });
      if (!v) return; pushUndo(); e2.label = v.label.trim(); e2.cap = v.cap.trim(); updateVisual(it); refreshSummaries(); return scheduleSave();
    }
    if (a === 'gl-del') { pushUndo(); it.entries.splice(i, 1); updateVisual(it); refreshSummaries(); return scheduleSave(); }
    if (a === 'slot-pick') { replaceImageTarget = it; return $('.wb-file', root).click(); }
  }

  /** Reihenfolge: nach Frames (Folien-Nr./Position), darin von oben nach unten */
  function orderedByFrames(list) {
    const frames = data.items.filter(i => i.type === 'frame').sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.y - b.y || a.x - b.x);
    const fi = it => { const cx = it.x + it.w / 2, cy = it.y + it.h / 2; const k = frames.findIndex(f => cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h); return k < 0 ? 1e6 : k; };
    return [...list].sort((a, b) => fi(a) - fi(b) || a.y - b.y || a.x - b.x);
  }
  // ---------- Prompt-Bausteine ---------------------------------------------
  const frameOf = it => { const cx = it.x + it.w / 2, cy = it.y + it.h / 2; return data.items.find(f => f.type === 'frame' && f !== it && cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h); };
  const inPhase = it => !!frameOf(it)?.phase;
  const PROMPT_TYPES = ['choice', 'note', 'text', 'features', 'palette', 'image', 'gallery', 'rect', 'ellipse', 'diamond', 'shape'];
  const optText = o => o.val ? `${o.t} (${o.val})` : o.t;
  const picked = c => [...(c.options || []).filter(o => o.on), ...(c.other && (c.otherText || '').trim() ? [{ t: c.otherText.trim(), p: c.otherText.trim() }] : [])];
  function noteLine(n) {
    if (n.ph && n.text.trim() === n.ph.trim()) return null;
    const ls = n.text.split('\n').map(l => l.trim()).filter(l => l && !/^[•\-–*]\s*$/.test(l) && !/…$/.test(l));
    if (!ls.length) return null;
    if (/:$/.test(ls[0])) { if (ls.length === 1) return null; return ls.length === 2 ? `${ls[0]} ${ls[1].replace(/^[•\-–*]\s*/, '')}` : `${ls[0]}\n${ls.slice(1).map(l => '  ' + (l.startsWith('•') ? l : '• ' + l)).join('\n')}`; }
    const m = ls[0].match(/^(.+?:)\s*(.+)$/); if (m && ls.length === 1) return `${m[1]} ${m[2]}`;
    return ls.join('\n');
  }
  /** sammelt alle Prompt-Inhalte aus einer Menge von Elementen */
  function collectParts(items) {
    const ord = orderedByFrames(items);
    const choices = ord.filter(i => i.type === 'choice');
    const parts = {};
    parts.role = choices.find(c => c.section === 'role' && !c.noPrompt && picked(c).length);
    parts.notes = ord.filter(i => (i.type === 'note' || i.type === 'text' || SHAPES.includes(i.type)) && i.promptInclude && !i.taskNote && (i.text || '').trim()).map(noteLine).filter(Boolean);
    parts.req = choices.filter(c => !c.noPrompt && !c.section && !c.haveList).map(c => [c.label || c.title, picked(c).map(optText), c]).filter(([, l]) => l.length);
    ord.filter(i => i.type === 'palette' && !i.noPrompt).forEach(pl => parts.req.push([`${pl.title || 'Farbpalette'}${pl.name ? ` („${pl.name}“)` : ''}`, [(pl.colors || []).map(c => `${c.role} ${c.hex.toUpperCase()}`).join(', ')]]));
    // Listen „bereits vorhanden / noch nicht vorhanden“ (z. B. Go-Live-Voraussetzungen)
    parts.have = choices.filter(c => c.haveList && !c.noPrompt).map(c => ({ c, yes: picked(c).map(optText), no: (c.options || []).filter(o => !o.on).map(o => o.t) }));
    const o = { hoch: 0, mittel: 1, niedrig: 2 };
    parts.features = ord.filter(i => i.type === 'features' && !i.noPrompt).map(fx => ({ title: fx.label || fx.title || 'Funktionen', rows: [...(fx.rows || [])].filter(r => !r.done).sort((a, b) => o[a.prio || 'mittel'] - o[b.prio || 'mittel']) })).filter(f => f.rows.length);
    parts.refs = ord.filter(i => i.type === 'image' && i.refImage);
    parts.gallery = ord.filter(i => i.type === 'gallery' && !i.noPrompt).flatMap(g => (g.entries || []).filter(e2 => e2.src || e2.cap).map(e2 => ({ ...e2, g })));
    parts.work = choices.filter(c => c.section === 'work' && !c.noPrompt).flatMap(c => picked(c).map(op => (op.p || `${c.label || c.title}: ${op.t}`).replace('{val}', op.val || '')));
    parts.tasks = choices.filter(c => c.section === 'tasks' && !c.noPrompt).flatMap(c => picked(c).map(op => (op.p || op.t).replace('{val}', op.val || '(Link fehlt – bitte ergänzen)')));
    ord.filter(i => i.type === 'note' && i.taskNote && (i.text || '').trim() && (!i.ph || i.text.trim() !== i.ph.trim()))
      .forEach(n => n.text.split('\n').map(l => l.replace(/^[•\-–*]\s*/, '').trim()).filter(l => l && !/:$/.test(l)).forEach(l => parts.tasks.push(l)));
    return parts;
  }
  function partsToLines(P2, { reqTitle = 'Anforderungen:', refText, tasksTitle } = {}) {
    const lines = [];
    if (P2.notes.length) { lines.push(''); P2.notes.forEach(l => lines.push(l)); }
    if (P2.req.length) { lines.push('', reqTitle); P2.req.forEach(([t, l]) => lines.push(`- ${t}: ${l.join(', ')}`)); }
    P2.have.forEach(hv => { if (hv.yes.length) lines.push(`- Bereits vorhanden: ${hv.yes.join(', ')}`); if (hv.no.length) lines.push(`- Noch nicht vorhanden: ${hv.no.join(', ')}`); });
    P2.features.forEach(f => { lines.push('', `${f.title} (nach Priorität):`); f.rows.forEach(r => lines.push(`- [${(r.prio || 'mittel').toUpperCase()}] ${r.t}`)); });
    if (P2.refs.length) lines.push('', (refText || 'Referenzbilder: Ich lade dir zusätzlich {n} hoch ({list}). Orientiere dich bei Stil, Figuren und Setting daran.').replace('{n}', `${P2.refs.length} Bild${P2.refs.length > 1 ? 'er' : ''}`).replace('{list}', P2.refs.map(r => r.caption || 'Bild').join(', ')));
    if (P2.gallery.length) {
      const withImg = P2.gallery.filter(e2 => e2.src).length;
      lines.push('', withImg === 1 ? 'Bilder mit Erklärung (das Bild lade ich dir zusätzlich hoch):' : withImg ? `Bilder mit Erklärung (ich lade dir die ${withImg} Bilder zusätzlich hoch, in dieser Reihenfolge):` : 'Beschreibungen zu Figuren & Welt:');
      P2.gallery.forEach((e2, k) => lines.push(`${k + 1}. ${e2.label || 'Bild'}${e2.src ? '' : ' (ohne Bild)'}${e2.cap ? `: ${e2.cap}` : ''}`));
    }
    if (P2.work.length) { lines.push('', 'Arbeitsweise:'); P2.work.forEach(w => lines.push(`- ${w}`)); }
    if (P2.tasks.length) { lines.push('', tasksTitle || 'Zusätzliche Aufgaben für dich:'); P2.tasks.forEach((t2, k) => lines.push(`${k + 1}. ${t2}`)); }
    return lines;
  }
  /** Kurzbeschreibung der App aus dem Konzept (für Folge-Prompts) */
  function appContext() {
    const main = data.items.filter(i => PROMPT_TYPES.includes(i.type) && !inPhase(i));
    const noteVal = re => { const n = main.find(i => i.type === 'note' && re.test(i.ph || i.text || '')); if (!n) return ''; const l = noteLine(n); return l ? l.replace(/^[^:]*:\s*/, '').replace(/\n\s*•\s*/g, ', ').trim() : ''; };
    const choiceVal = lab => { const c = main.find(i => i.type === 'choice' && (i.label === lab || i.title === lab)); return c ? picked(c).map(optText).join(', ') : ''; };
    const name = noteVal(/^Arbeitstitel/); const idea = noteVal(/^Die Idee/);
    const facts = [['Typ', choiceVal('App-Typ')], ['Plattform', choiceVal('Plattform / Endgeräte')], ['Technik', choiceVal('Technik')], ['Zielgruppe', choiceVal('Zielgruppe')]].filter(([, v]) => v);
    const ctx = [idea && `Kurz zur App: ${idea}`, facts.length && facts.map(([k, v]) => `${k}: ${v}`).join(' · ')].filter(Boolean).join('\n');
    return { name, ctx };
  }
  const PHASE_TEXT = {
    main: {
      intro: 'Du bist ein erfahrener Software-Entwickler. Entwickle mit mir Schritt für Schritt die folgende App.',
      outro: 'Beginne mit einem lauffähigen Prototyp (MVP) mit den wichtigsten Funktionen. Erkläre kurz die Dateistruktur, halte den Code einfach und frage nach, wenn etwas unklar ist.',
    },
    iteration: {
      intro: 'Wir entwickeln meine App{name} weiter. Ich habe die aktuelle Version getestet ({round}) und möchte die folgenden Punkte umsetzen.',
      outro: 'Gehe so vor: Analysiere zuerst die Ursachen der Fehler, ändere dann gezielt nur die betroffenen Stellen (bestehende Funktionen bitte nicht kaputt machen) und gib mir am Ende eine Liste aller Änderungen (Changelog) sowie konkrete Schritte, wie ich die neue Version testen kann.',
    },
    brainstorm: {
      intro: 'Ich habe eine erste, noch grobe Idee für eine App und möchte sie mit dir ausarbeiten. Hier sind meine Stichworte:',
      outro: 'Antworte strukturiert mit Überschriften. Wo dir Angaben fehlen, triff eine plausible Annahme und kennzeichne sie als „Annahme“. Schreib noch keinen Code – es geht erst um das Konzept.',
    },
    testing: {
      intro: 'Ich möchte meine App{name} mit echten Nutzern testen (User Testing).',
      outro: 'Erstelle mir einen konkreten Testplan mit Testaufgaben, einen kurzen Fragebogen für die Tester (inkl. Bewertungsskala) und eine Vorlage, mit der ich das Feedback auswerten und als priorisierte To-do-Liste für die nächste Weiterentwicklung nutzen kann.',
    },
    golive: {
      intro: 'Ich möchte meine App{name} jetzt veröffentlichen.',
      outro: 'Bitte erstelle mir eine Schritt-für-Schritt-Anleitung für die Veröffentlichung: Was ist zu tun, welche Voraussetzungen muss ich erfüllen (Konten, Kosten und Gebühren, rechtliche Anforderungen wie Datenschutzerklärung und Impressum, technische Anforderungen, Store-Richtlinien und Prüfprozess), welche Unterlagen brauche ich (Icon, Screenshots, Texte) und in welcher Reihenfolge gehe ich vor? Weise mich auf typische Stolperfallen hin.',
    },
  };
  function buildPrompt(sum) {
    const mode = sum?.mode || 'main';
    const T2 = PHASE_TEXT[mode] || PHASE_TEXT.main;
    if (mode === 'main') {
      const P2 = collectParts(data.items.filter(i => PROMPT_TYPES.includes(i.type) && !inPhase(i)));
      const lines = [];
      const intro = sum?.intro ?? T2.intro;
      lines.push(P2.role ? intro.replace(/erfahrener Software-Entwickler|erfahrene[rn]? [^.]*?(?=\. )/, picked(P2.role).map(optText).join(' und ')) : intro);
      const body = partsToLines(P2);
      const aiF = data.items.filter(f => f.type === 'frame' && f.aiDecides && !f.phase && !inPhase(f)).map(f => (f.title || '').replace(/^[\d.]+ · /, ''));
      if (aiF.length) body.push('', `Bei diesen Punkten entscheidest du selbst, was für diese App sinnvoll ist – halte es einfach und nenne mir kurz deine Entscheidung: ${aiF.join(', ')}.`);
      if (!P2.req.length) body.push('', '(Wähle in den Auswahllisten Optionen aus – sie erscheinen hier automatisch.)');
      lines.push(...body, '', sum?.outro ?? T2.outro);
      return lines.join('\n');
    }
    // Phasen-Prompt: nur Inhalte aus dem eigenen Frame + Kurzbeschreibung der App
    const frame = sum && frameOf(sum);
    const items = frame ? data.items.filter(i => i !== sum && PROMPT_TYPES.includes(i.type) && frameOf(i) === frame) : [];
    const P2 = collectParts(items);
    const { name, ctx } = appContext();
    const round = frame?.iterNo ? `Weiterentwicklung #${frame.iterNo}` : 'aktueller Stand';
    const lines = [];
    const roleOpt = P2.role && picked(P2.role).filter(o => !/Wie im Hauptprompt/.test(o.t));
    if (roleOpt && roleOpt.length) lines.push(`Du bist in dieser Runde ${roleOpt.map(o => o.p || o.t).join(' und ')}. Konzentriere dich besonders auf dein Fachgebiet.`);
    lines.push((sum.intro ?? T2.intro).replace('{name}', name ? ` „${name}“` : '').replace('{round}', round));
    if (ctx && mode !== 'brainstorm') lines.push('', ctx);
    lines.push(...partsToLines(P2, { reqTitle: mode === 'golive' ? 'Meine Angaben zur Veröffentlichung:' : mode === 'testing' ? 'Rahmen für den Test:' : mode === 'brainstorm' ? 'Grober Rahmen:' : 'Rahmen dieser Runde:', tasksTitle: mode === 'brainstorm' ? 'Das brauche ich von dir:' : undefined,
      refText: mode === 'iteration' ? 'Screenshots: Ich lade dir zusätzlich {n} hoch ({list}), die die Probleme zeigen.' : undefined }));
    if (lines.length <= 3) lines.push('', '(Fülle die Listen und Notizen in diesem Frame aus – sie erscheinen hier automatisch.)');
    lines.push('', sum.outro ?? T2.outro);
    return lines.join('\n');
  }
  // ---------- Klickbarer Prototyp --------------------------------------------
  const PR_DEV = { phone: { w: 420, h: 900, ic: '📱', t: 'Handy' }, tablet: { w: 860, h: 1200, ic: '📲', t: 'Tablet' }, desktop: { w: 1280, h: 860, ic: '🖥️', t: 'Desktop' } };
  const PR_SAMPLE = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Star Jumper</title>
<style>*{box-sizing:border-box;margin:0}body{font-family:system-ui,sans-serif;background:#F5F3FF;color:#1F1B2E;height:100vh;display:flex;flex-direction:column}
header{background:#7C3AED;color:#fff;padding:18px 20px;font-weight:800;font-size:20px}.screen{flex:1;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center}.screen.on{display:flex}
button{border:0;border-radius:14px;padding:14px 26px;font-size:17px;font-weight:700;background:#34D399;color:#064E3B;cursor:pointer}button.sec{background:#fff;color:#7C3AED;border:2px solid #7C3AED}
.star{font-size:64px;cursor:pointer;transition:transform .15s}.star:active{transform:scale(1.3)}.score{font-size:28px;font-weight:800;color:#7C3AED}</style></head>
<body><header>⭐ Star Jumper</header>
<section class="screen on" id="start"><div style="font-size:72px">🚀</div><h2>Sammle so viele Sterne wie möglich!</h2><button onclick="go('game')">Spiel starten</button><button class="sec" onclick="go('scores')">Bestenliste</button></section>
<section class="screen" id="game"><div class="score">Punkte: <span id="p">0</span></div><div class="star" onclick="hit()">⭐</div><p>Tippe auf den Stern!</p><button class="sec" onclick="go('start')">Beenden</button></section>
<section class="screen" id="scores"><h2>🏆 Bestenliste</h2><p>1. Maja – 42<br>2. Tom – 37<br>3. Lea – 29</p><button onclick="go('start')">Zurück</button></section>
<script>let pts=0;function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));if(id==='game'){pts=0;p.textContent=0}}function hit(){p.textContent=++pts}<\/script></body></html>`;
  function protoHead(it) {
    const dev = it.device || 'phone', open = (it.pins || []).filter(p => !p.done).length;
    return `<span class="pr-title" title="${esc(it.title || 'Prototyp')}">${esc(it.title || 'Prototyp')}</span><span class="pr-ver" title="Aktuelle Version">v${(it.versions || []).length + 1}</span>
      <span class="pr-dev">${Object.entries(PR_DEV).map(([k, v]) => `<button data-act="pr-dev:${k}" class="${dev === k ? 'on' : ''}" title="${v.t}-Ansicht">${v.ic}</button>`).join('')}</span>
      <span class="grow"></span>
      <button data-act="pr-reload" class="pr-btn" title="Neu starten">↻</button>
      <button data-act="pr-cm" class="pr-btn ${it._cm ? 'on' : ''}" title="${it._cm ? 'Kommentarmodus beenden' : 'Kommentieren: Pins auf den Prototyp setzen'}">💬 ${open}</button>
      <button data-act="pr-ai" class="pr-btn ai" title="Mit KI bearbeiten">✨ KI</button>
      <button data-act="pr-menu" class="pr-btn" title="Mehr: Code, Versionen, Download, an Weiterentwicklung übergeben">⋯</button>`;
  }
  const protoPins = it => (it.pins || []).map(p => `<button class="pr-pin ${p.done ? 'done' : ''} ${p.sent ? 'sent' : ''}" data-act="pr-pin:${p.id}" style="left:${p.x}%;top:${p.y}%" title="${esc(p.text)}">${p.n}</button>`).join('');
  /** Kopf und Pins aktualisieren, ohne den Prototyp neu zu laden */
  function refreshProto(it) {
    const n = nodeOf(it.id); if (!n) return;
    n.classList.toggle('commenting', !!it._cm);
    $('.pr-head', n).innerHTML = protoHead(it); $('.pr-layer', n).innerHTML = protoPins(it);
  }
  function pickHtmlFile() {
    return new Promise(resolve => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.html,.htm,text/html';
      inp.onchange = async () => { const f = inp.files[0]; if (!f) return resolve(null); resolve({ name: f.name.replace(/\.html?$/i, ''), html: await f.text() }); };
      inp.click();
    });
  }
  async function askHtmlCode(title = '', html = '') {
    const v = await openForm({ title: html ? 'Prototyp-Code bearbeiten' : 'Prototyp-Code einfügen', submitLabel: 'Übernehmen', values: { title, html }, fields: [
      { key: 'title', label: 'Name', required: true },
      { key: 'html', label: 'HTML-Code (eine vollständige HTML-Datei, z. B. aus Claude kopiert)', type: 'textarea', rows: 14, required: true },
    ] });
    return v ? { name: v.title, html: v.html } : null;
  }
  async function addProto(pos) {
    const how = await choose('Klickbaren Prototyp einfügen', [
      { value: 'file', label: 'HTML-Datei hochladen', desc: 'z. B. den heruntergeladenen Prototyp aus Claude', icon: 'upload' },
      { value: 'code', label: 'Code einfügen', desc: 'HTML aus der Zwischenablage einfügen', icon: 'clipboard-paste' },
      { value: 'sample', label: 'Beispiel-Prototyp', desc: 'Kleine Demo-App zum Ausprobieren', icon: 'sparkles' },
    ]);
    if (!how) return;
    const r = how === 'file' ? await pickHtmlFile() : how === 'code' ? await askHtmlCode('Mein Prototyp') : { name: 'Star Jumper (Beispiel)', html: PR_SAMPLE };
    if (!r || !r.html.trim()) return;
    const dv = PR_DEV.phone;
    const it = addItem({ type: 'proto', title: r.name || 'Prototyp', html: r.html, device: 'phone', pins: [], versions: [], w: dv.w, h: dv.h }, pos);
    toast('Prototyp eingefügt – direkt durchklicken, mit 💬 kommentieren oder mit ✨ KI ändern');
    return it;
  }
  function pushVersion(it, note) {
    it.versions = [...(it.versions || []), { html: it.html, at: new Date().toISOString(), note: note || '' }].slice(-25);
  }
  const fmtDT = iso => { const d = new Date(iso); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}. ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  async function protoAction(it, a, arg, pt) {
    const node = nodeOf(it.id);
    if (a === 'pr-reload') { const f = node && $('iframe', node); if (f) f.srcdoc = it.html || ''; return; }
    if (a === 'pr-dev') { if ((it.device || 'phone') === arg) return; pushUndo(); const dv = PR_DEV[arg]; const cx = it.x + it.w / 2; it.device = arg; it.w = dv.w; it.h = dv.h; it.x = Math.round(cx - dv.w / 2); updateVisual(it); return scheduleSave(); }
    if (a === 'pr-cm') { it._cm = !it._cm; refreshProto(it); if (it._cm) toast('Kommentarmodus: Klicke auf eine Stelle im Prototyp, um einen Kommentar anzuheften'); return; }
    if (a === 'pr-add') {
      if (!it._cm || !pt || !node) return;
      const r = $('.pr-screen', node).getBoundingClientRect();
      const x = Math.round(Math.min(98, Math.max(2, (pt.x - r.left) / r.width * 100)) * 10) / 10, y = Math.round(Math.min(98, Math.max(2, (pt.y - r.top) / r.height * 100)) * 10) / 10;
      const v = await openForm({ title: 'Kommentar anheften', submitLabel: 'Anheften', values: { text: '' }, fields: [{ key: 'text', label: 'Was fällt dir hier auf? (Fehler, Wunsch, Idee)', type: 'textarea', rows: 3, required: true }] });
      if (!v) return; pushUndo();
      const n = Math.max(0, ...(it.pins || []).map(p => p.n)) + 1;
      it.pins = [...(it.pins || []), { id: uid(), n, x, y, text: v.text.trim(), done: false, created: new Date().toISOString(), ver: (it.versions || []).length + 1 }];
      refreshProto(it); return scheduleSave();
    }
    if (a === 'pr-pin') {
      const p = (it.pins || []).find(q => q.id === arg); if (!p) return;
      const c = await choose(`Kommentar #${p.n}: ${p.text}`, [
        { value: 'edit', label: 'Bearbeiten', icon: 'pencil' },
        { value: 'done', label: p.done ? 'Wieder öffnen' : 'Als erledigt markieren', icon: p.done ? 'rotate-ccw' : 'check' },
        { value: 'del', label: 'Löschen', icon: 'trash-2' },
      ]);
      if (!c) return; pushUndo();
      if (c === 'edit') { const v = await openForm({ title: `Kommentar #${p.n}`, values: { text: p.text }, fields: [{ key: 'text', label: 'Kommentar', type: 'textarea', rows: 3, required: true }] }); if (v) p.text = v.text.trim(); }
      if (c === 'done') p.done = !p.done;
      if (c === 'del') it.pins = it.pins.filter(q => q !== p);
      refreshProto(it); return scheduleSave();
    }
    if (a === 'pr-ai') return protoAi(it);
    if (a === 'pr-menu') {
      const open = (it.pins || []).filter(p => !p.done);
      const c = await choose(it.title || 'Prototyp', [
        { value: 'code', label: 'Code bearbeiten', desc: 'HTML direkt ändern (neue Version)', icon: 'code-xml' },
        { value: 'file', label: 'Neue Version hochladen', desc: 'z. B. nach einer Runde in Claude', icon: 'upload' },
        { value: 'versions', label: `Versionen (${(it.versions || []).length + 1})`, desc: 'Zurückspringen oder alte Version zum Vergleich daneben legen', icon: 'history' },
        { value: 'iter', label: `Offene Kommentare → Weiterentwicklung (${open.filter(p => !p.sent).length})`, desc: 'Als Punkte in die aktuelle Weiterentwicklungs-Runde übernehmen', icon: 'git-branch-plus' },
        { value: 'copy', label: 'Kommentare als Text kopieren', desc: 'Zum Einfügen in Claude oder ein anderes KI-Tool', icon: 'copy' },
        { value: 'dl', label: 'Als HTML-Datei herunterladen', icon: 'download' },
        { value: 'rename', label: 'Umbenennen', icon: 'type' },
      ]);
      if (!c) return;
      if (c === 'code' || c === 'file') {
        const r = c === 'file' ? await pickHtmlFile() : await askHtmlCode(it.title, it.html);
        if (!r || !r.html.trim() || r.html === it.html) return; pushUndo();
        pushVersion(it, c === 'file' ? 'vor Upload' : 'vor Code-Änderung'); it.html = r.html; if (c === 'code' && r.name) it.title = r.name;
        updateVisual(it); scheduleSave(); return toast(`Version ${(it.versions || []).length + 1} gespeichert`);
      }
      if (c === 'versions') return protoVersions(it);
      if (c === 'iter') return protoToIteration(it);
      if (c === 'copy') { const txt = protoCommentText(it, open); if (!txt) return toast('Keine offenen Kommentare'); try { await navigator.clipboard.writeText(txt); toast('Kommentare kopiert'); } catch { toast('Kopieren nicht möglich'); } return; }
      if (c === 'dl') { const a2 = document.createElement('a'); a2.href = URL.createObjectURL(new Blob([it.html || ''], { type: 'text/html' })); a2.download = (it.title || 'prototyp').replace(/[^\wäöüÄÖÜß -]+/g, '').trim().replace(/\s+/g, '-') + '.html'; a2.click(); setTimeout(() => URL.revokeObjectURL(a2.href), 2000); return; }
      if (c === 'rename') { const v = await openForm({ title: 'Prototyp umbenennen', values: { t: it.title || '' }, fields: [{ key: 't', label: 'Name', required: true }] }); if (v) { pushUndo(); it.title = v.t; refreshProto(it); scheduleSave(); } }
    }
  }
  const pinPlace = p => `${p.y < 33 ? 'oben' : p.y > 66 ? 'unten' : 'Mitte'}${p.x < 33 ? ' links' : p.x > 66 ? ' rechts' : ''}`;
  const protoCommentText = (it, pins) => pins.length ? `Kommentare zum Prototyp „${it.title || 'Prototyp'}“ (${PR_DEV[it.device || 'phone'].t}-Ansicht):\n` + pins.map(p => `${p.n}. [${pinPlace(p)}, ca. ${Math.round(p.x)} % von links / ${Math.round(p.y)} % von oben] ${p.text}`).join('\n') : '';
  async function protoAi(it) {
    const open = (it.pins || []).filter(p => !p.done);
    const v = await openForm({ title: '✨ Prototyp mit KI bearbeiten', submitLabel: 'Änderung starten', values: { instr: '', pins: open.length ? 'ja' : 'nein' }, fields: [
      { key: 'instr', label: 'Was soll sich ändern?', type: 'textarea', rows: 4, placeholder: 'z. B. „Mach den Start-Button größer und grün“ oder „Füge einen Einstellungs-Screen hinzu“' },
      { key: 'pins', label: `Offene Kommentare mitschicken (${open.length})`, type: 'select', options: [['ja', 'Ja – alle offenen Kommentare umsetzen'], ['nein', 'Nein']] },
    ] });
    if (!v) return;
    const usePins = v.pins === 'ja' && open.length;
    if (!v.instr.trim() && !usePins) return toast('Bitte beschreibe die Änderung oder schicke Kommentare mit');
    const prompt = [v.instr.trim() && `Änderungswunsch:\n${v.instr.trim()}`, usePins && protoCommentText(it, open), `Aktuelle HTML-Datei:\n${it.html || ''}`].filter(Boolean).join('\n\n');
    const node = nodeOf(it.id); node?.classList.add('busy');
    const res = await window.AI.generate('protoedit', prompt);
    nodeOf(it.id)?.classList.remove('busy');
    if (!res || !res.html || !/<html|<body|<div/i.test(res.html)) return res ? toast('Die KI hat keinen gültigen HTML-Code geliefert – bitte erneut versuchen') : null;
    pushUndo(); pushVersion(it, `vor KI: ${(v.instr.trim() || `${open.length} Kommentare`).slice(0, 60)}`);
    it.html = res.html; if (usePins) open.forEach(p => { p.done = true; p.ai = true; });
    updateVisual(it); scheduleSave();
    toast(`Version ${(it.versions || []).length + 1} erstellt${usePins ? ' – umgesetzte Kommentare sind abgehakt' : ''}. Über ⋯ → Versionen kannst du zurück.`);
  }
  async function protoVersions(it) {
    const vs = (it.versions || []).map((v, i) => ({ ...v, i })).reverse();
    if (!vs.length) return toast('Noch keine älteren Versionen – sie entstehen bei jeder Änderung');
    const pick = await choose(`Versionen von „${it.title}“ (aktuell: v${vs.length + 1})`, vs.map(v => ({ value: String(v.i), label: `v${v.i + 1} · ${fmtDT(v.at)}`, desc: v.note ? `Stand ${v.note}` : '', icon: 'history' })));
    if (pick == null) return; const ver = it.versions[+pick];
    const c = await choose(`Version v${+pick + 1}`, [
      { value: 'side', label: 'Zum Vergleich daneben legen', desc: 'Erstellt eine Kopie dieser Version rechts neben dem Prototyp', icon: 'columns-2' },
      { value: 'restore', label: 'Wiederherstellen', desc: 'Die aktuelle Version bleibt im Verlauf erhalten', icon: 'rotate-ccw' },
    ]);
    if (c === 'restore') { pushUndo(); pushVersion(it, 'vor Wiederherstellung'); it.html = ver.html; updateVisual(it); scheduleSave(); toast(`v${+pick + 1} wiederhergestellt`); }
    if (c === 'side') { pushUndo(); const cp = { id: uid(), type: 'proto', title: `${it.title} (v${+pick + 1})`, html: ver.html, device: it.device, pins: [], versions: [], x: it.x + it.w + 60, y: it.y, w: it.w, h: it.h }; data.items.push(cp); render(); scheduleSave(); flyTo(bbox([it, cp]), 60); }
  }
  async function protoToIteration(it) {
    const pins = (it.pins || []).filter(p => !p.done && !p.sent);
    if (!pins.length) return toast('Keine neuen offenen Kommentare');
    let frame = data.items.filter(f => f.type === 'frame' && f.phase === 'iteration').sort((a, b) => (b.iterNo || 0) - (a.iterNo || 0))[0];
    if (!frame) { const ok = await choose('Noch keine Weiterentwicklungs-Runde', [{ value: 'new', label: 'Neue Runde anlegen', icon: 'git-branch-plus' }]); if (!ok) return; addIteration(); frame = data.items.filter(f => f.type === 'frame' && f.phase === 'iteration').sort((a, b) => (b.iterNo || 0) - (a.iterNo || 0))[0]; if (!frame) return; }
    const lists = data.items.filter(l => l.type === 'features' && frameOf(l) === frame);
    if (!lists.length) return toast('In der Runde gibt es keine Liste');
    const pick = await choose(`${pins.length} Kommentar${pins.length === 1 ? '' : 'e'} → ${frame.title.replace(/^[\d.]+ · /, '')}`, lists.map(l => ({ value: l.id, label: l.title, icon: /nicht|Fehler/.test(l.title) ? 'bug' : /Verbesser/.test(l.title) ? 'settings-2' : 'sparkles' })));
    if (!pick) return; const list = find(pick); pushUndo();
    list.rows = [...(list.rows || []), ...pins.map(p => ({ t: `${p.text} (Prototyp „${it.title}“, Kommentar #${p.n}, ${pinPlace(p)})`, prio: 'mittel' }))];
    pins.forEach(p => { p.sent = true; });
    updateVisual(list); refreshProto(it); refreshSummaries(); scheduleSave();
    toast(`${pins.length} Punkt${pins.length === 1 ? '' : 'e'} in „${list.title}“ übernommen – der Prompt der Runde ist aktualisiert`);
  }
  /** Frame der KI überlassen: Inhalt wird ausgeblendet (im Frame gespeichert), Frames darunter rücken nach */
  function shiftBelow(f, oldBottom, delta) {
    const lane = data.items.find(l => l.type === 'lane' && !l.guide && inside(f, l));
    const x0 = lane ? lane.x : f.x, x1 = lane ? lane.x + lane.w : f.x + f.w;
    data.items.filter(o => o !== f && o.type !== 'lane' && o.y >= oldBottom - 1 && o.x >= x0 - 1 && o.x + o.w <= x1 + 1 && (!lane || o.y <= lane.y + lane.h)).forEach(o => { o.y += delta; });
    if (lane && delta > 0) { const bottom = Math.max(...data.items.filter(o => o.type === 'frame' && o.x >= lane.x && o.x + o.w <= lane.x + lane.w && o.y >= lane.y).map(o => o.y + o.h)); if (bottom + 40 > lane.y + lane.h) lane.h = bottom + 40 - lane.y; }
  }
  function toggleFrameAi(f) {
    if (!f) return; pushUndo();
    if (!f.aiDecides) {
      const kids = data.items.filter(c => c.type !== 'frame' && c.type !== 'lane' && inside(c, f));
      f.stash = kids.map(k => ({ ...k, dx: k.x - f.x, dy: k.y - f.y }));
      data.items = data.items.filter(c => !kids.includes(c));
      const oldBottom = f.y + f.h; f.hFull = f.h; f.h = 170; f.aiDecides = true;
      shiftBelow(f, oldBottom, f.h - f.hFull);
      toast('Ausgeblendet – die KI entscheidet diesen Punkt selbst');
    } else {
      const oldBottom = f.y + f.h; const full = f.hFull || f.h;
      shiftBelow(f, oldBottom, full - f.h); f.h = full; f.aiDecides = false;
      (f.stash || []).forEach(k => { const { dx, dy, ...it } = k; it.x = f.x + dx; it.y = f.y + dy; data.items.push(it); });
      delete f.stash; delete f.hFull;
    }
    render(); scheduleSave(); refreshSummaries();
  }
  async function editLane(it) {
    const v = await openForm({ title: it.guide ? 'Hinweisbox bearbeiten' : 'Phase bearbeiten', values: { ic: it.ic || '', t: it.t || '', sub: it.sub || '', steps: (it.steps || []).join('\n'), c: it.c || '#7C3AED' }, fields: [
      { key: 'ic', label: 'Emoji', half: true }, { key: 'c', label: 'Farbe (Hex)', half: true },
      { key: 't', label: 'Titel', required: true },
      it.guide ? { key: 'steps', label: 'Schritte (einer pro Zeile)', type: 'textarea', rows: 5 } : { key: 'sub', label: 'Erklärung (für dich und deine Zuschauer)', type: 'textarea' },
    ] });
    if (!v) return; pushUndo();
    Object.assign(it, { ic: v.ic, t: v.t, c: /^#[0-9a-f]{6}$/i.test(v.c) ? v.c : it.c });
    if (it.guide) it.steps = v.steps.split('\n').map(x => x.trim()).filter(Boolean); else it.sub = v.sub;
    updateVisual(it); refreshToc(); scheduleSave();
  }
  /** Auswahllisten wachsen automatisch, falls Optionen nicht hineinpassen (Frame wächst mit) */
  function autoFitChoices(ids) {
    let changed = false;
    data.items.filter(i => ['choice', 'features', 'palette', 'devlog', 'gallery'].includes(i.type) && (!ids || ids.includes(i.id))).forEach(it => {
      const n = nodeOf(it.id); if (!n) return;
      const need = Math.ceil(n.scrollHeight + 2);
      if (need > it.h + 1) {
        const grow = need - it.h; const frame = data.items.find(f => f.type === 'frame' && inside(it, f));
        it.h = need; place(n, it); changed = true;
        if (frame) { // alles darunter im selben Frame nach unten schieben und Frame vergrößern
          const lane = data.items.find(l => l.type === 'lane' && !l.guide && inside(frame, l));
          const oldBottom = frame.y + frame.h;
          data.items.filter(o => o !== it && o.type !== 'frame' && inside(o, frame) && o.y >= it.y + it.h - grow - 1).forEach(o => { o.y += grow; const on = nodeOf(o.id); if (on) place(on, o); });
          frame.h += grow; const fn = nodeOf(frame.id); if (fn) place(fn, frame);
          if (lane) { // Frames darunter in derselben Phase mitschieben, Phase verlängern
            data.items.filter(o => o !== frame && o.type !== 'lane' && o.y >= oldBottom - 1 && o.x >= lane.x && o.x + o.w <= lane.x + lane.w && o.y <= lane.y + lane.h).forEach(o => { o.y += grow; const on = nodeOf(o.id); if (on) place(on, o); });
            const bottom = Math.max(...data.items.filter(o => o.type === 'frame' && inside(o, { ...lane, h: 1e7 })).map(o => o.y + o.h));
            if (bottom + 40 > lane.y + lane.h) { lane.h = bottom + 40 - lane.y; const ln = nodeOf(lane.id); if (ln) place(ln, lane); }
          }
        }
      }
    });
    if (changed) { drawLinks(); scheduleSave(); }
  }
  function refreshSummaries() {
    data.items.filter(i => i.type === 'devlog').forEach(it => { const n = nodeOf(it.id); if (n) updateVisual(it); });
    data.items.filter(i => i.type === 'summary').forEach(it => { const n = nodeOf(it.id); const b = n && $('.sum-body', n); if (b) b.textContent = buildPrompt(it); });
  }
  async function copyPrompt(it) {
    const txt = buildPrompt(it);
    try { await navigator.clipboard.writeText(txt); toast('Prompt kopiert – jetzt in dein Vibe-Coding-Tool einfügen'); }
    catch { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Prompt kopiert'); }
  }
  async function editSummary(it) {
    const T2 = PHASE_TEXT[it.mode || 'main'];
    const v = await openForm({ title: 'KI-Prompt anpassen', values: { title: it.title || 'KI-Prompt', intro: it.intro ?? T2.intro, outro: it.outro ?? T2.outro },
      extra: '<p class="muted small" style="margin:-6px 0 12px">Dazwischen fügt die App automatisch deine Notizen mit „✦ Prompt“ und alle ausgewählten Optionen ein.</p>',
      fields: [{ key: 'title', label: 'Überschrift' }, { key: 'intro', label: 'Einleitung', type: 'textarea', rows: 3 }, { key: 'outro', label: 'Abschluss / Anweisung', type: 'textarea', rows: 4 }] });
    if (v) { pushUndo(); Object.assign(it, v); rerenderItem(it); }
  }

  // ---------- Stift (freihand) --------------------------------------------
  function addChoice() {
    const it = makeChoice('Auswahl', ['Option 1', 'Option 2', 'Option 3', 'Option 4'], { w: 320 });
    addItem(it); setTimeout(() => editChoice(find(selected)), 50);
  }
  function smoothPath(pts) {
    if (!pts?.length) return '';
    if (pts.length < 3) return `M${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]},${p[1]}`).join(' ');
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; d += ` Q${pts[i][0]},${pts[i][1]} ${mx.toFixed(1)},${my.toFixed(1)}`; }
    const l = pts[pts.length - 1]; return d + ` L${l[0]},${l[1]}`;
  }
  function startPen(e, p) {
    const pts = [[p.x, p.y]];
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'wb-temp-pen'); path.style.stroke = penColor; path.style.strokeWidth = penWidth; svg.appendChild(path);
    try { viewport.setPointerCapture(e.pointerId); } catch { /* synthetisches Ereignis */ }
    const mv = ev => { const q = toWorld(ev.clientX, ev.clientY); const l = pts[pts.length - 1]; if (Math.hypot(q.x - l[0], q.y - l[1]) > 2 / data.view.z) { pts.push([Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10]); path.setAttribute('d', smoothPath(pts)); } };
    const up = () => {
      viewport.removeEventListener('pointermove', mv); viewport.removeEventListener('pointerup', up); path.remove();
      if (pts.length < 2) return;
      const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); const pd = penWidth;
      const x0 = Math.min(...xs) - pd, y0 = Math.min(...ys) - pd, w = Math.max(...xs) - x0 + pd, hh = Math.max(...ys) - y0 + pd;
      pushUndo();
      data.items.push({ id: uid(), type: 'draw', x: Math.round(x0), y: Math.round(y0), w: Math.max(8, Math.round(w)), h: Math.max(8, Math.round(hh)), vw: Math.max(8, w), vh: Math.max(8, hh),
        pts: pts.map(q => [Math.round((q[0] - x0) * 10) / 10, Math.round((q[1] - y0) * 10) / 10]), color: penColor, width: penWidth });
      render(); scheduleSave();
    };
    viewport.addEventListener('pointermove', mv); viewport.addEventListener('pointerup', up);
  }
  function showPenPop() {
    $('.pen-pop', root)?.remove();
    const cols = ['#7C3AED', '#34D399', '#FB923C', '#1F1B2E', '#EF4444', '#0284C7', '#FFFFFF', ...savedPalette().slice(0, 4)];
    const pop = h(`<div class="pen-pop"><div class="swatches">${cols.map(c => `<button class="sw ${c === penColor ? 'on' : ''}" style="background:${c}" data-pc="${c}"></button>`).join('')}
      <label class="sw custom"><input type="color" data-pcc value="${toHex6(penColor)}"></label></div>
      <div class="pen-widths">${[2, 4, 8, 14].map(w => `<button class="${w === penWidth ? 'on' : ''}" data-pw="${w}" title="${w} px"><i style="height:${w}px"></i></button>`).join('')}</div>
      <span class="muted small">Zeichnen mit gedrückter Maustaste · Esc beendet</span></div>`);
    const tb = $('[data-tool=pen]', root).getBoundingClientRect(), rr = root.getBoundingClientRect();
    pop.style.left = (tb.right - rr.left + 10) + 'px'; pop.style.top = (tb.top - rr.top - 10) + 'px';
    pop.addEventListener('pointerdown', ev => ev.stopPropagation());
    pop.onclick = ev => { const b = ev.target.closest('[data-pc],[data-pw]'); if (!b) return; if (b.dataset.pc) penColor = b.dataset.pc; if (b.dataset.pw) penWidth = Number(b.dataset.pw); showPenPop(); };
    pop.onchange = ev => { if (ev.target.dataset.pcc !== undefined) { penColor = ev.target.value; showPenPop(); } };
    root.appendChild(pop);
  }

  // ---------- Formen-Auswahl ----------------------------------------------
  function shapeGridHTML(current) {
    const base = [['rect', 'Rechteck', '<rect x="4" y="16" width="92" height="68" rx="8"/>'], ['ellipse', 'Kreis / Ellipse', '<ellipse cx="50" cy="50" rx="46" ry="46"/>'],
      ['diamond', 'Raute', '<polygon points="50,2 98,50 50,98 2,50"/>']];
    return `<div class="shape-grid">${base.map(([k, l, svgIn]) => `<button class="shape-btn ${current === k ? 'on' : ''}" data-shape-pick="${k}" title="${l}"><svg viewBox="0 0 100 100">${svgIn}</svg></button>`).join('')}
      ${Object.entries(SHAPE_DEFS).map(([k, [l, svgIn]]) => `<button class="shape-btn ${current === k ? 'on' : ''}" data-shape-pick="shape:${k}" title="${l}"><svg viewBox="-4 -4 108 108">${svgIn}</svg></button>`).join('')}</div>`;
  }
  function toggleShapePicker(btn, replaceItem) {
    const old = $('.shape-pop', root); if (old) { old.remove(); if (!replaceItem) return; }
    const pop = h(`<div class="shape-pop"><div class="shape-pop-head">${replaceItem ? 'Form ändern' : 'Form wählen – dann auf die Fläche klicken'}</div>
      <div class="shape-pop-colors">${QUICK_COLORS.map(([f, s2]) => `<button class="qc ${lastShapeColors[0] === f ? 'on' : ''}" data-qc-new="${f}|${s2}" style="--f:${f};--s:${s2}" title="Füllung ${f}"></button>`).join('')}</div>
      ${shapeGridHTML(replaceItem ? (replaceItem.type === 'shape' ? replaceItem.shape : replaceItem.type) : '')}</div>`);
    const r = btn.getBoundingClientRect(), rr = root.getBoundingClientRect();
    pop.style.left = (r.right - rr.left + 10) + 'px'; pop.style.top = Math.max(60, r.top - rr.top - 120) + 'px';
    if (replaceItem) { pop.style.left = ''; pop.style.right = '300px'; pop.style.top = '70px'; }
    pop.onclick = e => {
      const q = e.target.closest('[data-qc-new]');
      if (q) { lastShapeColors = q.dataset.qcNew.split('|'); $$('.qc', pop).forEach(x => x.classList.toggle('on', x === q)); return; }
      const b = e.target.closest('[data-shape-pick]'); if (!b) return;
      const k = b.dataset.shapePick; pop.remove();
      if (replaceItem) {
        pushUndo();
        if (k.startsWith('shape:')) { replaceItem.type = 'shape'; replaceItem.shape = k.slice(6); } else { replaceItem.type = k; delete replaceItem.shape; }
        return rerenderItem(replaceItem);
      }
      if (k.startsWith('shape:')) return setTool(k);
      setTool(k);
    };
    root.appendChild(pop);
    setTimeout(() => document.addEventListener('pointerdown', function off(ev) { if (!pop.contains(ev.target) && !ev.target.closest('[data-tool=shapes],[data-p=reshape]')) { pop.remove(); } document.removeEventListener('pointerdown', off); }), 0);
  }

  // ---------- Rendern -----------------------------------------------------
  function applyView() {
    const v = data.view;
    world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
    const g = 24 * v.z;
    viewport.style.backgroundSize = `${g}px ${g}px`;
    viewport.style.backgroundPosition = `${v.x}px ${v.y}px`;
    const zEl = $('.wb-zoom', root); if (zEl) zEl.textContent = Math.round(v.z * 100) + '%';
    clearTimeout(applyView.nt); applyView.nt = setTimeout(() => { if (Date.now() > navLockUntil) { navPos = navFromView(); } updateNavLabel(); }, 120);
    updateCtxBar(); if ($('.wb-handle', world)) { clearTimeout(applyView.t); applyView.t = setTimeout(drawHandles, 60); }
  }

  function render() {
    $$('.wb-item', world).forEach(n => n.remove());
    // Frames immer zuunterst
    [...data.items.filter(i => i.type === 'lane'), ...data.items.filter(i => i.type === 'frame'), ...data.items.filter(i => i.type !== 'frame' && i.type !== 'lane')]
      .forEach(it => world.appendChild(itemEl(it)));
    drawLinks(); applyView(); renderProps(); drawHandles(); updateCtxBar();
    autoFitChoices(); refreshToc(); renderNav();
    if (P.active) applyPresentState(false);
  }

  function place(node, it) {
    Object.assign(node.style, { left: it.x + 'px', top: it.y + 'px', width: it.w + 'px', height: it.h + 'px' });
  }

  function itemEl(it) {
    const d = document.createElement('div');
    d.className = `wb-item wb-${it.type}${multi.includes(it.id) || selected === it.id ? ' selected' : ''}${it.group ? ' grouped' : ''}${it.shadow ? ' shadow' : ''}`;
    d.dataset.id = it.id; place(d, it);
    if (it.opacity != null && it.opacity < 1) d.style.opacity = it.opacity;
    if (it.rot) d.style.transform = `rotate(${it.rot}deg)`;
    const tc = it.textColor || (it.type === 'text' ? it.color : null) || '#1F1B2E';
    const jc = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[it.valign || (it.type === 'text' ? 'top' : 'middle')];
    const padCss = it.pad != null && it.type !== 'note' ? `padding:${it.pad}px;` : '';
    const textStyle = `font-size:${it.fs || (it.type === 'text' ? 22 : 16)}px;${it.bold ? 'font-weight:700;' : ''}${it.italic ? 'font-style:italic;' : ''}text-align:${it.align || (it.type === 'text' ? 'left' : 'center')};color:${tc};display:flex;flex-direction:column;justify-content:${jc};${padCss}`;
    switch (it.type) {
      case 'note':
        d.style.background = it.color || NOTE_COLORS[0];
        if (it.pad != null) d.style.padding = it.pad + 'px';
        d.innerHTML = `<div class="wb-text" style="${textStyle}">${esc(it.text || '')}</div>`; break;
      case 'text':
        d.innerHTML = `<div class="wb-text" style="${textStyle}">${esc(it.text || '')}</div>`; break;
      case 'rect': case 'ellipse': case 'diamond': case 'shape': {
        const c = it.color || '#7C3AED';
        const fo = it.fillOpacity ?? (it.fill === false ? 0 : 0.12);
        const fill = fo > 0 ? hexA(it.fillColor || c, fo) : 'transparent';
        const sw = it.strokeWidth ?? 2.5;
        if (it.type === 'diamond' || it.type === 'shape') {
          const inner = it.type === 'diamond' ? '<polygon points="50,1 99,50 50,99 1,50"/>' : (SHAPE_DEFS[it.shape] || SHAPE_DEFS.star)[1];
          d.innerHTML = `<svg class="shape" viewBox="0 0 100 100" preserveAspectRatio="none" style="overflow:visible"><g style="fill:${fill};stroke:${sw ? c : 'none'};stroke-width:${sw};stroke-linejoin:round;${it.dashed ? 'stroke-dasharray:8 6;' : ''}">${inner}</g></svg>`;
        } else {
          d.innerHTML = `<div class="shape-box" style="background:${fill};border:${sw}px ${it.dashed ? 'dashed' : 'solid'} ${sw ? c : 'transparent'};
            border-radius:${it.type === 'ellipse' ? '50%' : rectRadius(it)}"></div>`;
        }
        d.insertAdjacentHTML('beforeend', `<div class="wb-text" style="${textStyle}">${esc(it.text || '')}</div>`); break;
      }
      case 'icon':
        d.innerHTML = `<img src="${iconUrl(it.icon, it.color || '#7C3AED')}" draggable="false" alt="">`; break;
      case 'choice': {
        const opts = it.options || []; const acc = it.color || '#7C3AED';
        const shown = opts.map((o, i) => ({ ...o, i })).filter(o => !it.onlySelected || o.on);
        d.style.setProperty('--acc', acc);
        const otherOn = !!(it.other && (it.otherText || '').trim());
        const cnt = opts.filter(o => o.on).length + (otherOn ? 1 : 0);
        d.innerHTML = `<div class="ch-head"><span>${esc(it.title || 'Auswahl')}</span><em>${it.mode === 'single' ? 'eine Option' : 'mehrere möglich'} · ${cnt}/${opts.length + (it.other ? 1 : 0)}</em></div>
          <div class="ch-opts" style="grid-template-columns:repeat(${it.cols || 1},minmax(0,1fr))">${shown.map(o => `<div class="ch-opt ${o.on ? 'on' : ''}" data-opt="${o.i}" title="${esc(o.t)}${o.ask ? ' – fragt beim Auswählen nach einer Angabe' : ''}"><i class="ch-box ${it.mode === 'single' ? 'radio' : ''}"></i><span${o.f ? ` style="font-family:'${o.f}',system-ui;font-size:${o.f === 'Press Start 2P' ? 11 : 15}px"` : ''}>${esc(o.t)}${o.on && o.val ? ` <b class="ch-val">${esc(o.val)}</b>` : ''}</span></div>`).join('')}
          ${it.other && (!it.onlySelected || otherOn) ? `<div class="ch-opt ch-other ${otherOn ? 'on' : ''}" data-act="ch-other" style="grid-column:1/-1"><i class="ch-box ${it.mode === 'single' ? 'radio' : ''}"></i><span>Sonstiges: ${otherOn ? `<b>${esc(it.otherText)}</b>` : '<i class="ch-ph">eigene Angabe eintragen …</i>'}</span></div>` : ''}
          ${!shown.length && !(it.other && otherOn) ? '<div class="ch-empty">Noch nichts ausgewählt</div>' : ''}</div>`;
        break;
      }
      case 'features': {
        const rows = it.rows || []; d.style.setProperty('--acc', it.color || '#7C3AED');
        const PR = { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' };
        d.innerHTML = `<div class="ch-head"><span>${esc(it.title || 'Funktionen')}</span><em>${rows.filter(r => !r.done).length} offen · ${rows.filter(r => r.done).length} erledigt</em></div>
          <div class="fx-rows">${rows.map((r, i) => `<div class="fx-row ${r.done ? 'done' : ''}"><button class="fx-done" data-act="fx-done:${i}" title="${r.done ? 'Wieder öffnen' : 'Als erledigt markieren'}">${r.done ? '✓' : ''}</button><button class="fx-prio p-${r.prio || 'mittel'}" data-act="fx-prio:${i}" title="Priorität ändern">${PR[r.prio || 'mittel']}</button>
            <span class="fx-text" data-act="fx-edit:${i}" title="Klicken zum Bearbeiten">${esc(r.t)}</span><button class="fx-del" data-act="fx-del:${i}" title="Entfernen">×</button></div>`).join('') || `<div class="ch-empty">${esc(it.hint || 'Noch keine Funktion. Beispiel: „Highscore wird online gespeichert“ oder „Login mit Google“.')}</div>`}</div>
          <div class="fx-actions"><button class="fx-add" data-act="fx-add">+ Funktion hinzufügen</button>${rows.length > 1 ? '<button class="fx-sort" data-act="fx-sort">Nach Priorität sortieren</button>' : ''}</div>`;
        break;
      }
      case 'palette': {
        const cols = it.colors || [];
        d.innerHTML = `<div class="ch-head"><span>${esc(it.title || 'Farbpalette')}</span><em>${it.name ? esc(it.name) + ' · ' : ''}Farbe anklicken zum Ändern</em></div>
          <div class="pal-row">${cols.map((c, i) => `<div class="pal-sw" data-act="pal-edit:${i}" title="${esc(c.role)} ändern"><i style="background:${c.hex}"></i><b>${esc(c.role)}</b><code>${esc(c.hex.toUpperCase())}</code></div>`).join('')}</div>
          <div class="fx-actions"><button class="fx-add" data-act="pal-choose">${ic('palette', '#7C3AED', 'ic xs')} Farbpalette wählen</button></div>`;
        break;
      }
      case 'gallery': {
        const es = it.entries || [];
        d.style.setProperty('--acc', it.color || '#DB2777');
        d.innerHTML = `<div class="ch-head"><span>${esc(it.title || 'Bilder mit Erklärung')}</span><em>${es.filter(e2 => e2.src).length} von ${es.length} mit Bild</em></div>
          <div class="gl-grid">${es.map((e2, k) => `<div class="gl-card"><button class="gl-del" data-act="gl-del:${k}" title="Entfernen">×</button>
            <div class="gl-img" data-act="gl-img:${k}" title="${e2.src ? 'Bild ersetzen' : 'Bild auswählen'}">${e2.src ? `<img src="${e2.src}" alt="">` : `${ic('image-plus', '#8A85A0', 'ic')}<span>Bild wählen</span>`}</div>
            <div class="gl-cap" data-act="gl-cap:${k}" title="Titel & Erklärung bearbeiten"><b>${esc(e2.label || `Bild ${k + 1}`)}</b><span class="${e2.cap ? '' : 'ph'}">${esc(e2.cap || 'Erklärung hinzufügen …')}</span></div></div>`).join('')}
            <button class="gl-add" data-act="gl-add" title="Weiteres Bild mit Erklärung">＋<span>Bild hinzufügen</span></button></div>`;
        break;
      }
      case 'proto': {
        const dev = it.device || 'phone';
        d.classList.toggle('commenting', !!it._cm);
        d.innerHTML = `<div class="pr-head">${protoHead(it)}</div>
          <div class="pr-body dev-${dev}"><div class="pr-screen"><iframe sandbox="allow-scripts allow-forms allow-modals" title="${esc(it.title || 'Prototyp')}"></iframe><div class="pr-layer" data-act="pr-add">${protoPins(it)}</div></div></div>
          <div class="pr-busy"><span></span>KI überarbeitet den Prototyp …</div>`;
        $('iframe', d).srcdoc = it.html || '';
        break;
      }
      case 'lane': {
        d.style.setProperty('--lc', it.c || '#7C3AED');
        d.style.background = hexA(it.c || '#7C3AED', it.guide ? 0.07 : 0.05);
        d.innerHTML = it.guide
          ? `<div class="lane-head"><span class="lane-ic">${esc(it.ic || '👋')}</span><div><b>${esc(it.t || '')}</b></div></div><ol class="lane-steps">${(it.steps || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>`
          : `<div class="lane-head"><span class="lane-ic">${esc(it.ic || '')}</span><div><span class="lane-no">Phase ${it.no || ''}</span><b>${esc(it.t || '')}</b><p>${esc(it.sub || '')}</p></div></div>${it.last ? '' : '<span class="lane-arrow">→</span>'}`;
        break;
      }
      case 'devlog': {
        const fr = data.items.filter(f => f.type === 'frame');
        const statusOf = f => { const c = data.items.find(i => i.type === 'choice' && i.statusOf && frameOf(i) === f); return c ? (picked(c)[0]?.t || '–') : '–'; };
        const iters = fr.filter(f => f.phase === 'iteration').sort((a, b) => (a.iterNo || 0) - (b.iterNo || 0));
        const testF = fr.find(f => f.phase === 'testing'), liveF = fr.find(f => f.phase === 'golive');
        const mainSel = data.items.filter(i => i.type === 'choice' && !inPhase(i) && !i.noPrompt && picked(i).length).length;
        const doneIt = iters.filter(f => /Erledigt/.test(statusOf(f))).length;
        const step = (label, ok, sub, id) => `<div class="dl-step ${ok ? 'ok' : ''}" ${id ? `data-act="dl-go:${id}"` : ''}><i>${ok ? '✓' : ''}</i><b>${label}</b><small>${sub}</small></div>`;
        const counts = f => { const lists = data.items.filter(i => i.type === 'features' && frameOf(i) === f); return lists.map(l => { const r = l.rows || []; return r.length ? `<span title="${esc(l.title)}">${/Fehler|Bug|nicht/.test(l.title) ? '🐞' : /Verbesser/.test(l.title) ? '⚙️' : '✨'} ${r.filter(x => x.done).length}/${r.length}</span>` : ''; }).join(''); };
        const stCls = st => /Erledigt|Live|Abgeschlossen/.test(st) ? 'done' : /Arbeit|Läuft|Getestet|Eingereicht/.test(st) ? 'run' : 'plan';
        d.innerHTML = `<div class="ch-head"><span>${esc(it.title || 'Entwicklungsverlauf')}</span><em>wird automatisch aktualisiert</em></div>
          <div class="dl-steps">${step('Konzept', mainSel >= 3, `${mainSel} Listen ausgefüllt`)}${step('Weiterentwicklung', doneIt > 0, `${iters.length} Runde${iters.length === 1 ? '' : 'n'} · ${doneIt} erledigt`, iters[iters.length - 1]?.id)}${step('User Testing', testF && /Abgeschlossen/.test(statusOf(testF)), testF ? statusOf(testF) : 'nicht angelegt', testF?.id)}${step('Go-Live', liveF && /Live/.test(statusOf(liveF)), liveF ? statusOf(liveF) : 'nicht angelegt', liveF?.id)}</div>
          <div class="dl-rows">${iters.map(f => { const st = statusOf(f); return `<div class="dl-row" data-act="dl-go:${f.id}"><b>#${f.iterNo}</b><span class="dl-date">${f.created ? fmtDate(f.created) : ''}</span><span class="dl-st ${stCls(st)}">${esc(st)}</span><span class="dl-counts">${counts(f) || '<em>noch leer</em>'}</span><span class="dl-go">öffnen →</span></div>`; }).join('') || '<div class="ch-empty">Noch keine Weiterentwicklungs-Runde.</div>'}</div>
          <div class="fx-actions"><button class="fx-add" data-act="iter-new">+ Neue Weiterentwicklungs-Runde</button></div>`;
        break;
      }
      case 'imgslot':
        d.innerHTML = `<div class="slot-in" data-act="slot-pick">${ic('image-plus', '#8A85A0', 'ic')}<b>${esc(it.label || 'Bild')}</b><span>Klicken oder Bild hierher ziehen</span></div>`;
        break;
      case 'summary':
        d.innerHTML = `<div class="sum-head">${ic('sparkles', '#FFFFFF', 'ic sm')}<span>${esc(it.title || 'KI-Prompt')}</span><button class="emb-btn sum-copy" data-copy-prompt title="Prompt in die Zwischenablage kopieren">${ic('copy', '#FFFFFF', 'ic xs')} Kopieren</button></div>
          <pre class="sum-body">${esc(buildPrompt(it))}</pre>`;
        break;
      case 'draw':
        d.innerHTML = `<svg class="draw" viewBox="0 0 ${it.vw} ${it.vh}" preserveAspectRatio="none"><path d="${smoothPath(it.pts)}" style="fill:none;stroke:${it.color || '#7C3AED'};stroke-width:${it.width || 4};stroke-linecap:round;stroke-linejoin:round;${it.dashed ? 'stroke-dasharray:10 8;' : ''}"/></svg>`; break;
      case 'image':
        d.innerHTML = `<img src="${it.src}" draggable="false" alt="" style="border-radius:${it.radius ?? 6}px">${it.caption ? `<span class="img-cap">${it.refImage ? '📎 ' : ''}${esc(it.caption)}</span>` : ''}`; break;
      case 'embed':
        d.innerHTML = `<div class="emb-head" style="background:${it.headColor || '#7C3AED'}"></div><div class="emb-body"></div>`;
        fillEmbed(d, it); break;
      case 'frame': {
        d.style.background = it.color || '#FFFFFF';
        const sp = it.preset && SOCIAL_PRESETS.find(x => x.key === it.preset);
        d.innerHTML = `<div class="frame-title">${ic(sp ? sp.icon : 'frame', '#8A85A0', 'ic xs')} ${esc(it.title || 'Frame')}${it.export ? ` <em>${it.export.w}×${it.export.h}</em>` : ''}
          <button class="frame-btn" data-frame-export title="Als Bild exportieren">${ic('download', '#7C3AED', 'ic xs')}</button>${it.canAi ? `<button class="frame-ai ${it.aiDecides ? 'on' : ''}" data-frame-ai title="${it.aiDecides ? 'Wieder selbst festlegen' : 'Diesen Punkt der KI überlassen und ausblenden'}">🤖 ${it.aiDecides ? 'KI entscheidet' : 'KI entscheiden lassen'}</button>` : ''}</div>
          ${it.safe && it.showSafe !== false ? `<div class="safe-zone sz-${it.safe}"></div>` : ''}
          ${it.aiDecides ? `<div class="frame-aibox"><b>🤖 Die KI entscheidet hier selbst</b><span>Der Punkt ist ausgeblendet. Im Prompt steht, dass die KI hier eine sinnvolle, einfache Lösung wählt.</span><button data-frame-ai>Doch selbst festlegen</button></div>` : ''}`;
        break;
      }
      case 'design': {
        const def = DESIGNS[it.kind];
        if (!def) { d.innerHTML = empty('Unbekannte Vorlage'); break; }
        const s = it.w / def.w;
        d.innerHTML = `<div class="ds-wrap" style="width:${def.w}px;height:${def.h}px;transform:scale(${s})">${def.render({ ...def.defaults, ...(it.data || {}) }, it.c || DESIGN_THEMES[0])}</div>`;
        break;
      }
      case 'html':
        d.innerHTML = `<div class="html-head" style="background:${it.headColor || '#1F1B2E'}">${ic('code-xml', '#FFFFFF', 'ic xs')}<span>${esc(it.title || 'HTML')}</span>
          <button class="emb-btn" data-html-edit title="Code bearbeiten">${ic('pencil', '#FFFFFF', 'ic xs')}</button>
          <button class="emb-btn" data-html-reload title="Neu abspielen">${ic('rotate-ccw', '#FFFFFF', 'ic xs')}</button></div>
          <iframe sandbox="allow-scripts" title="${esc(it.title || 'HTML')}"></iframe>`;
        $('iframe', d).srcdoc = it.html || '';
        if (it.hideHead) d.classList.add('no-head');
        break;
    }
    if (it.link) {
      const ent = byId(it.link.table, it.link.id);
      if (ent) d.insertAdjacentHTML('beforeend', `<button class="wb-linkbadge" ${linkAttr(it.link)} title="Verknüpft: ${esc(ent.title)}">${ic('link', '#FFFFFF', 'ic xs')}</button>`);
    }
    if (it.type !== 'frame') {
      const animated = it.anim && it.anim !== 'none';
      if (animated || it.cover) d.insertAdjacentHTML('beforeend', `<span class="pres-badge" title="Präsentation: Schritt ${it.step || 1}${it.cover ? ' · verdeckt' : ''}">${it.cover ? '?' : '▶'}${it.step || 1}</span>`);
      if (it.presHide) d.classList.add('pres-hide-mark');
    }
    if (it.goto) { const tf = find(it.goto); if (tf) d.insertAdjacentHTML('beforeend', `<button class="wb-goto ${it.type === 'frame' ? 'in-frame' : ''}" data-goto="${tf.id}" title="Zu „${esc(tf.title || 'Frame')}“ springen">↗ ${esc(tf.title || 'Frame')}</button>`); }
    if (it.promptInclude && (it.type === 'note' || it.type === 'text')) d.insertAdjacentHTML('beforeend', '<span class="prompt-badge" title="Fließt in den KI-Prompt ein">✦ Prompt</span>');
    if (it.locked) { d.classList.add('locked'); d.insertAdjacentHTML('beforeend', `<span class="lock-badge" title="Gesperrt (Strg+L zum Entsperren)">${ic('lock', '#FFFFFF', 'ic xs')}</span>`); }
    d.insertAdjacentHTML('beforeend', '<div class="wb-resize"></div>');
    return d;
  }
  const linkAttr = l => l.table === 'tasks' ? `data-task="${l.id}"` : l.table === 'posts' ? `data-post="${l.id}"` : `data-obj="${l.id}"`;

  function updateVisual(it) {
    const old = nodeOf(it.id); if (!old) return;
    const n = itemEl(it); old.replaceWith(n);
    if (['choice', 'features', 'palette', 'devlog', 'gallery'].includes(it.type)) autoFitChoices([it.id]);
    if (P.active) applyPresentState(false);
    drawLinks();
  }
  function rerenderItem(it) { updateVisual(it); renderProps(); scheduleSave(); }

  // ---------- Eingebettete Module -----------------------------------------
  function embedTitle(it) {
    const def = EMBEDS[it.kind] || {}; const c = it.cfg || {};
    if (it.kind === 'okr') return byId('objectives', c.ref)?.title || def.label;
    if (it.kind === 'task' || it.kind === 'post') return def.label;
    if (it.kind === 'calendar') { const [y, m] = calMonth(it); return `${MONTHS[m]} ${y}`; }
    let t = def.label;
    if (c.project) t += ` · ${projName(c.project) || c.project}`;
    if (c.platform) t += ` · ${c.platform}`;
    return t;
  }
  function calMonth(it) {
    if (it.cfg?.month) { const [y, m] = it.cfg.month.split('-').map(Number); return [y, m - 1]; }
    const d = new Date(); return [d.getFullYear(), d.getMonth()];
  }
  function embedBody(it) {
    const c = it.cfg || {};
    switch (it.kind) {
      case 'okr': { const o = byId('objectives', c.ref); return o ? objectiveCardHTML(o, true) : gone('Ziel'); }
      case 'okr-all': return okrSummaryHTML();
      case 'tasks': {
        const l = S.tasks.filter(t => inProject(t, c.project) && (c.showDone || t.status !== 'done'));
        return `${taskListHTML(sortTasks(l))}<button class="link add-inline" data-add-task="todo">+ Aufgabe</button>`;
      }
      case 'task': { const t = byId('tasks', c.ref); return t ? taskCardHTML(t).replace('draggable="true"', '') : gone('Aufgabe'); }
      case 'kanban': return kanbanHTML(S.tasks.filter(t => inProject(t, c.project)), TASK_STATUS, 'tasks', true);
      case 'calendar': { const [y, m] = calMonth(it); return monthGridHTML(y, m, true); }
      case 'pipeline': return kanbanHTML(S.posts.filter(p => !c.platform || p.platform === c.platform), POST_STATUS, 'posts', true);
      case 'posts': {
        const l = upcomingPosts(c.platform);
        return `${l.length ? `<div class="rows">${l.map(postRowHTML).join('')}</div>` : empty('Keine offenen Posts')}<button class="link add-inline" data-add-post="idee">+ Post</button>`;
      }
      case 'post': { const p = byId('posts', c.ref); return p ? postCardHTML(p).replace('draggable="true"', '') : gone('Post'); }
    }
    return '';
  }
  const gone = what => empty(`${what} wurde gelöscht. Einbettung entfernen oder neu verknüpfen.`);
  function fillEmbed(node, it) {
    const def = EMBEDS[it.kind] || { icon: 'box' };
    $('.emb-head', node).innerHTML = `${ic(def.icon, '#FFFFFF', 'ic sm')}<span class="emb-title">${esc(embedTitle(it))}</span>
      ${it.kind === 'calendar' ? `<button class="emb-btn" data-cal="-1" title="Vorheriger Monat">‹</button><button class="emb-btn" data-cal="1" title="Nächster Monat">›</button>` : ''}
      <button class="emb-btn" data-open title="Im Modul öffnen">${ic('external-link', '#FFFFFF', 'ic xs')}</button>`;
    const body = $('.emb-body', node); const st = body.scrollTop;
    body.innerHTML = embedBody(it); body.scrollTop = st;
    if (it.cfg?.project) body.__project = it.cfg.project;
  }
  function refreshEmbeds() {
    data.items.forEach(it => { if (it.type === 'embed') { const n = nodeOf(it.id); if (n) fillEmbed(n, it); } });
    drawLinks(); renderProps();
  }
  async function openEmbedPicker(pos) {
    const kind = await choose('Modul ins Whiteboard einbetten', Object.entries(EMBEDS).map(([k, v]) => ({ value: k, label: v.label, desc: v.desc, icon: v.icon })));
    if (!kind) return;
    const cfg = await embedConfig(kind); if (!cfg) return;
    const def = EMBEDS[kind];
    addItem({ type: 'embed', kind, cfg, w: def.w, h: def.h }, pos);
  }
  async function embedConfig(kind, current = {}) {
    const def = EMBEDS[kind];
    if (def.ref) {
      const table = def.ref; const opts = S[table].map(x => [x.id, x.title]);
      const v = await openForm({
        title: `${def.label} auswählen`, submitLabel: 'Einbetten', values: { ref: current.ref ?? opts[0]?.[0] ?? 'new' },
        fields: [{ key: 'ref', label: 'Eintrag', type: 'select', options: [...opts, ['new', '+ Neu anlegen …']] }],
      });
      if (!v) return null;
      if (v.ref === 'new') {
        const created = table === 'objectives' ? await editObjective() : table === 'tasks' ? await editTask() : await editPost();
        return created ? { ref: created.id } : null;
      }
      return { ref: Number(v.ref) };
    }
    if (def.filter) {
      const fields = [{ key: 'project', label: 'Projekt-Filter', type: 'select', options: [['', 'Alle Projekte'], ...S.projects.map(p => [String(p.id), p.name])] }];
      if (kind === 'tasks') fields.push({ key: 'showDone', label: 'Erledigte anzeigen', type: 'checkbox' });
      return openForm({ title: def.label, fields, values: current, submitLabel: 'Übernehmen' });
    }
    if (def.platform) {
      return openForm({ title: def.label, values: current, submitLabel: 'Übernehmen',
        fields: [{ key: 'platform', label: 'Plattform', type: 'select', options: [['', 'Alle Plattformen'], ...PLATFORMS.map(p => [p, p])] }] });
    }
    return {};
  }

  /** Neues Element mittig (oder an pos) einfügen und auswählen */
  function addItem(obj, pos) {
    const p = pos || viewCenter();
    pushUndo();
    const it = { id: uid(), ...obj };
    it.x = Math.round(obj.x ?? p.x - it.w / 2); it.y = Math.round(obj.y ?? p.y - it.h / 2);
    data.items.push(it); selected = it.id; setTool('select'); render(); scheduleSave();
    return it;
  }

  // ---------- Designvorlagen ----------------------------------------------
  function openDesignGallery(replaceItem) {
    const cats = [...new Set(Object.values(DESIGNS).map(d => d.cat))];
    let cat = 'Alle';
    const el = h(`<div class="modal-backdrop"><div class="modal design-modal">
      <h3>Designvorlagen <small class="muted">Infografiken, Diagramme, Social Media & mehr</small></h3>
      <div class="ds-toolbar">
        <div class="seg ds-cats">${['Alle', ...cats].map(c => `<button data-cat="${c}" class="${c === cat ? 'on' : ''}">${c}</button>`).join('')}</div>
        <div class="ds-themes">${DESIGN_THEMES.map((t, i) => `<button class="theme-chip ${i === designTheme ? 'on' : ''}" data-theme="${i}" title="${t.name}">
          <i style="background:${t.bg}"></i><i style="background:${t.c1}"></i><i style="background:${t.c2}"></i></button>`).join('')}</div>
      </div>
      <div class="ds-grid"></div>
      <div class="modal-actions"><span class="muted small">Inhalte und Farben kannst du nach dem Einfügen rechts im Eigenschaften-Panel anpassen.</span><span class="grow"></span><button class="btn ghost" data-act="cancel">Schließen</button></div>
    </div></div>`);
    const grid = $('.ds-grid', el);
    const draw = () => {
      const th = DESIGN_THEMES[designTheme];
      grid.innerHTML = Object.entries(DESIGNS).filter(([, d]) => cat === 'Alle' || d.cat === cat).map(([k, d]) => {
        const s = Math.min(200 / d.w, 140 / d.h);
        return `<button class="ds-cell" data-kind="${k}"><div class="ds-thumb"><div style="width:${d.w}px;height:${d.h}px;transform:translate(-50%,-50%) scale(${s})">${d.render(d.defaults, th)}</div></div><span>${esc(d.label)}</span></button>`;
      }).join('');
    };
    const close = () => el.remove();
    el.addEventListener('mousedown', e => { if (e.target === el) close(); });
    $('[data-act=cancel]', el).onclick = close;
    $$('[data-cat]', el).forEach(b => b.onclick = () => { cat = b.dataset.cat; $$('[data-cat]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    $$('[data-theme]', el).forEach(b => b.onclick = () => { designTheme = Number(b.dataset.theme); $$('[data-theme]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    grid.onclick = e => {
      const c = e.target.closest('[data-kind]'); if (!c) return;
      const def = DESIGNS[c.dataset.kind]; const th = { ...DESIGN_THEMES[designTheme] }; delete th.name;
      close();
      addItem({ type: 'design', kind: c.dataset.kind, data: { ...def.defaults }, c: th, w: def.w, h: def.h });
    };
    $('#modal-root').appendChild(el); draw();
  }
  async function editDesignContent(it) {
    const def = DESIGNS[it.kind];
    const v = await openForm({
      title: `${def.label} bearbeiten`, values: { ...def.defaults, ...(it.data || {}) },
      fields: def.fields.map(([key, label, type]) => ({ key, label, type: type === 'textarea' ? 'textarea' : type === 'number' ? 'number' : 'text', rows: 5, step: 'any' })),
    });
    if (!v) return;
    pushUndo(); it.data = v; rerenderItem(it);
  }

  // ---------- HTML-Visualisierung -----------------------------------------
  async function addHtml(pos) {
    const r = await HtmlTool.openEditor();
    if (r) addItem({ type: 'html', title: r.title, html: r.html, w: 620, h: 420 }, pos);
  }
  async function editHtml(it) {
    const r = await HtmlTool.openEditor(it);
    if (!r) return;
    pushUndo(); it.title = r.title; it.html = r.html; rerenderItem(it);
  }

  // ---------- Verbindungen ------------------------------------------------
  function edgePoint(a, b) {
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    const dx = (b.x + b.w / 2) - cx, dy = (b.y + b.h / 2) - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const s = Math.min((a.w / 2) / Math.abs(dx || 1e-9), (a.h / 2) / Math.abs(dy || 1e-9));
    return { x: cx + dx * s, y: cy + dy * s };
  }
  function drawLinks() {
    let defs = '';
    const paths = data.connectors.map(c => {
      const a = find(c.from), b = find(c.to); if (!a || !b) return '';
      const p1 = edgePoint(a, b), p2 = edgePoint(b, a);
      const col = c.color || '#7C3AED', w = c.width || 2.5, sel = selected === c.id;
      const mid = `m${c.id}`;
      defs += `<marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="${5 + w}" markerHeight="${5 + w}" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`;
      const hidden = P.active && (isHiddenInPres(a) || isHiddenInPres(b) || c.presHide);
      return `<g class="wb-link ${sel ? 'sel' : ''}" data-link="${c.id}" style="opacity:${hidden ? 0 : (c.opacity ?? 1)}">
        <line class="hit" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"/>
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${col}" stroke-width="${sel ? w + 1 : w}" ${c.dashed ? 'stroke-dasharray="8 6"' : ''}
          marker-end="${c.arrow === false ? '' : `url(#${mid})`}" ${c.both ? `marker-start="url(#${mid})"` : ''}/>
        ${c.label ? `<text x="${(p1.x + p2.x) / 2}" y="${(p1.y + p2.y) / 2 - 6}" text-anchor="middle">${esc(c.label)}</text>` : ''}
      </g>`;
    }).join('');
    svg.innerHTML = `<defs>${defs}</defs>${paths}`;
  }

  // ---------- Koordinaten & Zoom ------------------------------------------
  function toWorld(cx, cy) {
    const r = viewport.getBoundingClientRect(), v = data.view;
    return { x: (cx - r.left - v.x) / v.z, y: (cy - r.top - v.y) / v.z };
  }
  function viewCenter() { const r = viewport.getBoundingClientRect(); return toWorld(r.left + r.width / 2, r.top + r.height / 2); }
  function zoomAt(cx, cy, factor) {
    const r = viewport.getBoundingClientRect(); const v = data.view;
    const px = cx == null ? r.width / 2 : cx - r.left, py = cy == null ? r.height / 2 : cy - r.top;
    const nz = clamp(v.z * factor, 0.1, 4);
    v.x = px - (px - v.x) * (nz / v.z); v.y = py - (py - v.y) * (nz / v.z); v.z = nz;
    applyView(); scheduleSave();
  }
  function viewFor(box, padd = 60, leftExtra = 50) {
    const r = viewport.getBoundingClientRect();
    const z = clamp(Math.min((r.width - padd * 2 - leftExtra) / (box.w || 1), (r.height - padd * 2) / (box.h || 1)), 0.05, 4);
    return { z, x: (r.width + leftExtra - box.w * z) / 2 - box.x * z, y: (r.height - box.h * z) / 2 - box.y * z };
  }
  function bbox(items) {
    const xs = items.flatMap(i => [i.x, i.x + i.w]), ys = items.flatMap(i => [i.y, i.y + i.h]);
    const x = Math.min(...xs), y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }
  function fit() {
    if (!data.items.length) { data.view = { x: 80, y: 60, z: 1 }; return applyView(); }
    data.view = viewFor(bbox(data.items)); applyView(); scheduleSave();
  }

  // ---------- Maus / Zeiger -----------------------------------------------
  function bindPointer() {
    viewport.addEventListener('wheel', e => {
      if (P.active) { e.preventDefault(); return; }
      const body = e.target.closest('.emb-body');
      if (body && !e.ctrlKey && body.scrollHeight > body.clientHeight + 1) return;
      e.preventDefault();
      if (e.ctrlKey || !e.shiftKey) zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
      else { data.view.x -= e.deltaY; applyView(); scheduleSave(); }
    }, { passive: false });
    viewport.addEventListener('pointerdown', e => { const b = e.target.closest('[data-frame-ai]'); if (!b || e.button) return; e.stopPropagation(); e.preventDefault(); toggleFrameAi(find(b.closest('.wb-item').dataset.id)); }, true);
    viewport.addEventListener('pointerdown', e => { const a = e.target.closest('.lane-arrow'); if (!a) return; e.stopPropagation(); e.preventDefault(); const it = find(a.closest('.wb-item').dataset.id); const i = navLanes().indexOf(it); if (i >= 0) navGo(i + 1, -1); }, true);
    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('dblclick', onDblClick);

    world.addEventListener('click', e => {
      const cp = e.target.closest('[data-copy-prompt]');
      if (cp) { e.stopPropagation(); return copyPrompt(find(cp.closest('.wb-item').dataset.id)); }
      const fx = e.target.closest('[data-frame-export]');
      if (fx) { e.stopPropagation(); return openFrameExport(find(fx.closest('.wb-item').dataset.id)); }
      const btn = e.target.closest('[data-cal],[data-open],[data-html-edit],[data-html-reload]'); if (!btn) return;
      e.stopPropagation();
      const node = btn.closest('.wb-item'); const it = find(node.dataset.id);
      if (btn.dataset.htmlEdit !== undefined) return editHtml(it);
      if (btn.dataset.htmlReload !== undefined) { $('iframe', node).srcdoc = it.html || ''; return; }
      if (btn.dataset.open !== undefined) { location.hash = '#/' + EMBEDS[it.kind].module; return; }
      const [y, m] = calMonth(it); const d = new Date(y, m + Number(btn.dataset.cal), 1);
      it.cfg = { ...(it.cfg || {}), month: `${d.getFullYear()}-${pad(d.getMonth() + 1)}` };
      fillEmbed(node, it); scheduleSave();
    }, true);

    viewport.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); });
    viewport.addEventListener('drop', e => {
      const f = [...(e.dataTransfer.files || [])].find(x => x.type.startsWith('image/'));
      if (f) {
        e.preventDefault();
        const slotNode = document.elementFromPoint(e.clientX, e.clientY)?.closest('.wb-imgslot, .wb-image');
        const slot = slotNode && find(slotNode.dataset.id);
        addImageFile(f, toWorld(e.clientX, e.clientY), slot && (slot.type === 'imgslot' || slot.refImage) ? slot : null);
      }
    });
  }

  const CREATE = {
    note: p => ({ type: 'note', x: p.x - 100, y: p.y - 75, w: 200, h: 150, color: NOTE_COLORS[0], text: '' }),
    text: p => ({ type: 'text', x: p.x, y: p.y - 16, w: 260, h: 44, text: '', fs: 22 }),
    rect: p => ({ type: 'rect', x: p.x - 90, y: p.y - 60, w: 180, h: 120, color: '#7C3AED', fillColor: '#EDE9FE', fillOpacity: 1, text: '' }),
    ellipse: p => ({ type: 'ellipse', x: p.x - 70, y: p.y - 70, w: 140, h: 140, color: '#059669', fillColor: '#D1FAE5', fillOpacity: 1, text: '' }),
    diamond: p => ({ type: 'diamond', x: p.x - 80, y: p.y - 80, w: 160, h: 160, color: '#EA580C', fillColor: '#FFEDD5', fillOpacity: 1, text: '' }),
    frame: p => ({ type: 'frame', x: p.x - 480, y: p.y - 270, w: 960, h: 540, color: '#FFFFFF', title: `Folie ${data.items.filter(i => i.type === 'frame').length + 1}` }),
  };

  const inside = (it, f) => it.x >= f.x - 1 && it.y >= f.y - 1 && it.x + it.w <= f.x + f.w + 1 && it.y + it.h <= f.y + f.h + 1;

  function onDown(e) {
    if (P.active) return presClick(e);
    closeMenus();
    const handle = e.target.closest('.wb-handle');
    if (handle && e.button === 0) { e.stopPropagation(); return handle.classList.contains('rot') ? startRotate(e) : startLinkDrag(e, handle.dataset.dir); }
    const gotoBtn = e.target.closest('.wb-goto');
    if (gotoBtn && e.button === 0) { e.stopPropagation(); return jumpToFrame(gotoBtn.dataset.goto); }
    if (e.target.closest('.wb-text[contenteditable="true"]')) return;
    let node = e.target.closest('.wb-item');
    const linkG = e.target.closest('.wb-link');
    // Frames nur über die Titelzeile oder den Griff greifen – die Fläche verhält sich wie Hintergrund
    if (node?.classList.contains('wb-frame') && !e.target.closest('.frame-title, .wb-resize') && selected !== node.dataset.id) node = null;
    if (node?.classList.contains('wb-frame') && !e.target.closest('.frame-title, .wb-resize') && tool === 'select') node = null;

    if (!node && !linkG && tool === 'select' && addKey(e) && e.button === 0) {
      const start = toWorld(e.clientX, e.clientY);
      const box = document.createElement('div'); box.className = 'wb-marquee'; world.appendChild(box);
      return startDrag(e, { mode: 'marquee', sx: e.clientX, sy: e.clientY, start, box, base: [...multi] });
    }
    if (e.button === 1 || spaceDown || tool === 'hand' || (!node && !linkG && tool === 'select')) {
      if (!node && !linkG && tool === 'select') select(null);
      return startDrag(e, { mode: 'pan', sx: e.clientX, sy: e.clientY, vx: data.view.x, vy: data.view.y });
    }
    if (e.button !== 0) return;
    const p = toWorld(e.clientX, e.clientY);

    if (tool === 'pen') return startPen(e, p);
    if (CREATE[tool] || tool.startsWith('shape:')) {
      pushUndo();
      let it;
      if (CREATE[tool]) it = { id: uid(), ...CREATE[tool](p) };
      else { const key = tool.slice(6); const [, , w, h] = SHAPE_DEFS[key]; const [fc, sc] = lastShapeColors;
        it = { id: uid(), type: 'shape', shape: key, x: p.x - w / 2, y: p.y - h / 2, w, h, color: sc, fillColor: fc, fillOpacity: 1, textColor: contrastText(fc), text: '' }; }
      it.x = Math.round(it.x); it.y = Math.round(it.y);
      data.items.push(it); selected = it.id; setTool('select'); render(); scheduleSave();
      if (it.type === 'note' || it.type === 'text') setTimeout(() => editText(it.id), 0);
      return;
    }
    if (linkG) { select(linkG.dataset.link); return; }
    if (!node) return;
    const it = find(node.dataset.id);

    if (tool === 'connect') {
      if (!connectFrom) { connectFrom = it.id; node.classList.add('connect-src'); return; }
      if (connectFrom !== it.id) {
        pushUndo();
        data.connectors.push({ id: uid(), from: connectFrom, to: it.id, color: '#7C3AED' });
        drawLinks(); scheduleSave();
      }
      setTool('select'); return;
    }
    if (addKey(e) && !e.target.classList.contains('wb-resize')) { // Mehrfachauswahl umschalten (Strg/Cmd/Shift + Klick)
      world.__suppressClick = true; setTimeout(() => { world.__suppressClick = false; }, 0); // kein Öffnen von Einträgen in Modulen
      const ids = groupMembers(it);
      const on = ids.every(i => multi.includes(i) || (multi.length === 0 && selected === i));
      const base = multi.length ? multi : (selected && find(selected) ? [selected] : []);
      return selectMany(on ? base.filter(i => !ids.includes(i)) : [...base, ...ids]);
    }
    if (it.locked) { if (it.group) selectMany(groupMembers(it)); else select(it.id); return; }
    if (e.target.classList.contains('wb-resize')) {
      select(it.id); pushUndo();
      return startDrag(e, { mode: 'resize', it, node, sx: e.clientX, sy: e.clientY, w: it.w, h: it.h });
    }
    if (it.type === 'embed' && !e.target.closest('.emb-head')) { select(it.id); return; }
    if (it.type === 'html' && !e.target.closest('.html-head')) { select(it.id); return; }
    if (e.target.closest('.emb-btn, .wb-linkbadge, .frame-btn, .sum-copy')) { select(it.id); return; }
    if (!(multi.length > 1 && multi.includes(it.id))) {
      if (it.group) selectMany(groupMembers(it)); else select(it.id);
    }
    pushUndo();
    const moving = new Set(multi.length > 1 ? multi : [it.id]);
    selItems().filter(f => f.type === 'frame').concat(it.type === 'frame' ? [it] : []).forEach(f =>
      data.items.forEach(c => { if (c.type !== 'frame' && inside(c, f)) moving.add(c.id); }));
    moving.delete(it.id);
    [...moving].forEach(id => { if (find(id)?.locked) moving.delete(id); });
    const children = [...moving].map(find).filter(Boolean).map(c => ({ c, ox: c.x, oy: c.y, node: nodeOf(c.id) }));
    const orig = { [it.id]: { x: it.x, y: it.y } }; children.forEach(ch => { orig[ch.c.id] = { x: ch.ox, y: ch.oy }; });
    const optEl = it.type === 'choice' ? e.target.closest('[data-opt]') : null;
    const actEl = e.target.closest('[data-act]');
    startDrag(e, { mode: 'move', it, node, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, children, orig, ids: new Set(Object.keys(orig)), opt: optEl ? Number(optEl.dataset.opt) : null, act: actEl ? actEl.dataset.act : null });
  }

  function startDrag(e, state) {
    drag = { ...state, moved: false };
    try { viewport.setPointerCapture(e.pointerId); } catch { /* synthetisches Ereignis */ }
    if (state.mode !== 'pan') { $$('.wb-handle', world).forEach(n => n.remove()); $('.wb-ctx', root).classList.add('hidden'); }
    if (state.mode === 'pan') viewport.classList.add('panning');
    const move = ev => {
      const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      const z = data.view.z;
      if (drag.mode === 'pan') { data.view.x = drag.vx + dx; data.view.y = drag.vy + dy; applyView(); }
      if (drag.mode === 'marquee') {
        const cur = toWorld(ev.clientX, ev.clientY);
        const r = { x: Math.min(cur.x, drag.start.x), y: Math.min(cur.y, drag.start.y), w: Math.abs(cur.x - drag.start.x), h: Math.abs(cur.y - drag.start.y) };
        Object.assign(drag.box.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
        drag.rect = r;
      }
      if (drag.mode === 'move') {
        let rdx = dx / z, rdy = dy / z;
        if (ev.shiftKey) { rdx = Math.round((drag.ox + rdx) / 24) * 24 - drag.ox; rdy = Math.round((drag.oy + rdy) / 24) * 24 - drag.oy; }
        else if (drag.moved) [rdx, rdy] = smartSnap(drag.ids, rdx, rdy, ev);
        const mx = Math.round(rdx), my = Math.round(rdy); const nx = drag.ox + mx, ny = drag.oy + my;
        drag.it.x = nx; drag.it.y = ny; place(drag.node, drag.it);
        drag.children.forEach(ch => { ch.c.x = ch.ox + mx; ch.c.y = ch.oy + my; if (ch.node) place(ch.node, ch.c); });
        drawLinks();
      }
      if (drag.mode === 'resize') {
        const it = drag.it; const ratio = drag.h / drag.w;
        it.w = Math.max(40, Math.round(drag.w + dx / z));
        const lock = it.type === 'icon' || it.type === 'design' || (it.type === 'frame' && it.export) || (it.type === 'image' && !ev.shiftKey) || (it.type !== 'image' && ev.shiftKey);
        it.h = lock ? Math.round(it.w * ratio) : Math.max(30, Math.round(drag.h + dy / z));
        if (it.type === 'design') updateVisual(it), drag.node = nodeOf(it.id);
        else place(drag.node, it);
        drawLinks();
      }
    };
    const up = () => {
      if (drag.mode === 'marquee') {
        drag.box.remove();
        if (drag.rect) {
          const hit = data.items.filter(i => inside(i, drag.rect)).flatMap(groupMembers);
          const base = drag.base; drag = null; selectMany([...base, ...hit]);
        }
        viewport.removeEventListener('pointermove', move); viewport.removeEventListener('pointerup', up); viewport.removeEventListener('pointercancel', up);
        drag = null; drawHandles(); updateCtxBar(); return;
      }
      viewport.removeEventListener('pointermove', move); viewport.removeEventListener('pointerup', up); viewport.removeEventListener('pointercancel', up);
      viewport.classList.remove('panning');
      if (drag.moved) {
        world.__suppressClick = true; setTimeout(() => { world.__suppressClick = false; }, 0);
        scheduleSave();
        if (drag.mode !== 'pan') renderProps();
      } else if (drag.mode !== 'pan') {
        undoStack.pop();
        if (drag.opt != null) { const d0 = drag; drag = null; toggleOption(d0.it, d0.opt); }
        else if (drag.act) { const d0 = drag; drag = null; itemAction(d0.it, d0.act, { x: d0.sx, y: d0.sy }); }
      }
      drag = null;
      $$('.wb-guide', world).forEach(g => g.remove());
      drawHandles(); updateCtxBar();
    };
    viewport.addEventListener('pointermove', move); viewport.addEventListener('pointerup', up); viewport.addEventListener('pointercancel', up);
  }

  function onDblClick(e) {
    if (P.active) return;
    // Wegen Pointer-Capture zeigt e.target auf die Zeichenfläche – das echte Element unter dem Mauszeiger ermitteln
    const tgt = document.elementFromPoint(e.clientX, e.clientY) || e.target;
    if (tgt.closest('.wb-ctx, .wb-props, .wb-tools, .wb-top')) return;
    let node = tgt.closest('.wb-item');
    const linkG = tgt.closest('.wb-link');
    if (linkG) { const ln = findLink(linkG.dataset.link); select(ln.id); return editLinkLabel(ln); }
    if (node?.classList.contains('wb-frame') && !tgt.closest('.frame-title')) node = null;
    if (!node) {
      if (tool !== 'select') return;
      const p = toWorld(e.clientX, e.clientY);
      pushUndo();
      const it = { id: uid(), ...CREATE.note(p) }; it.x = Math.round(it.x); it.y = Math.round(it.y);
      data.items.push(it); selected = it.id; render(); scheduleSave(); editText(it.id);
      return;
    }
    const it = find(node.dataset.id);
    if (it.type === 'embed' && tgt.closest('.emb-head') && !tgt.closest('.emb-btn')) { location.hash = '#/' + EMBEDS[it.kind].module; return; }
    if (it.type === 'design') return editDesignContent(it);
    if (it.type === 'html') return editHtml(it);
    if (it.type === 'frame') return renameFrame(it);
    if (it.type === 'icon') return openIconPicker(it);
    if (it.type === 'choice') return editChoice(it);
    if (it.type === 'summary') return editSummary(it);
    if (['features', 'palette', 'imgslot', 'devlog', 'gallery'].includes(it.type)) return; // werden per Einzelklick bedient
    if (it.type === 'lane') return editLane(it);
    if (it.type === 'image') { replaceImageTarget = it; return $('.wb-file', root).click(); }
    if (TEXTUAL.includes(it.type)) editText(it.id);
  }
  async function editLinkLabel(ln) {
    const v = await openForm({ title: 'Verbindung beschriften', values: { label: ln.label || '' }, fields: [{ key: 'label', label: 'Text an der Verbindung' }] });
    if (v) { pushUndo(); ln.label = v.label; drawLinks(); renderProps(); scheduleSave(); }
  }
  async function renameFrame(it) {
    const v = await openForm({ title: 'Frame umbenennen', values: { title: it.title }, fields: [{ key: 'title', label: 'Titel' }] });
    if (v) { pushUndo(); it.title = v.title; rerenderItem(it); }
  }

  /** Text direkt im Element bearbeiten. opts.initial = erstes getipptes Zeichen, opts.selectAll = alles markieren */
  function editText(id, opts = {}) {
    let node = nodeOf(id); const it = find(id);
    if (!node || !it) return;
    if (selected !== id) { select(id); node = nodeOf(id); }
    const tx = $('.wb-text', node); if (!tx) return;
    node.classList.add('editing'); root.classList.add('is-editing');
    tx.contentEditable = 'true'; tx.spellcheck = true; tx.focus();
    if (opts.initial != null) tx.textContent = (tx.textContent ? tx.textContent + (opts.initial.match(/\s/) ? '' : '') : '') + opts.initial;
    const range = document.createRange(); range.selectNodeContents(tx);
    if (!opts.selectAll && opts.initial == null && (it.text || '').length) range.collapse(false); // Cursor ans Ende
    else if (opts.initial != null) range.collapse(false);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    $('.wb-hint', root).textContent = 'Schreiben … · Enter = neue Zeile · Strg+Enter oder Esc = fertig · Klick daneben = fertig';
    const grow = () => { // Element wächst mit dem Text
      if (it.type === 'text') { it.h = Math.max(30, Math.ceil(tx.scrollHeight) + 4); node.style.height = it.h + 'px'; }
      else if (tx.scrollHeight > tx.clientHeight + 2) { it.h = Math.ceil(it.h + (tx.scrollHeight - tx.clientHeight) + 8); node.style.height = it.h + 'px'; }
      drawLinks(); updateCtxBar();
    };
    tx.oninput = grow; grow();
    const finish = () => {
      tx.oninput = null; root.classList.remove('is-editing'); setTool(tool);
      tx.contentEditable = 'false'; node.classList.remove('editing');
      const val = tx.innerText.replace(/ /g, ' ').replace(/\n$/, '');
      if (val !== (it.text || '')) { pushUndo(); it.text = val; scheduleSave(); if (it.promptInclude) refreshSummaries(); }
      if (it.type === 'text' && !val.trim()) removeSelected(id);
    };
    tx.addEventListener('blur', finish, { once: true });
    tx.onkeydown = ev => {
      if (ev.key === 'Escape' || (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey))) { ev.preventDefault(); tx.blur(); }
      if (ev.key === 'Tab') { ev.preventDefault(); tx.blur(); }
      ev.stopPropagation();
    };
    tx.onpaste = ev => { ev.preventDefault(); ev.stopPropagation(); const t = ev.clipboardData.getData('text/plain'); document.execCommand('insertText', false, t); };
  }

  // ---------- Auswahl & Eigenschaften-Panel -------------------------------
  function select(id) {
    selected = id; multi = id && find(id) ? [id] : [];
    markSelection(); drawLinks(); renderProps();
  }
  function selectMany(ids) {
    multi = [...new Set(ids)]; selected = multi.length === 1 ? multi[0] : (multi.length ? multi[multi.length - 1] : null);
    markSelection(); drawLinks(); renderProps();
  }
  function markSelection() {
    $$('.wb-item', world).forEach(n => n.classList.toggle('selected', multi.includes(n.dataset.id) || selected === n.dataset.id));
    drawHandles(); updateCtxBar();
  }
  const groupMembers = it => it.group ? data.items.filter(i => i.group === it.group).map(i => i.id) : [it.id];
  const selItems = () => (multi.length ? multi : selected ? [selected] : []).map(find).filter(Boolean);

  function colorRow(label, prop, cur) {
    const saved = savedPalette();
    const cc = toHex6(cur);
    return `<div class="c-row" data-cprop="${prop}">
      <div class="c-head"><span>${label}</span><span class="c-hex">${cc.toUpperCase()}</span></div>
      <div class="swatches">
        ${BRAND.map(c => `<button class="sw ${c.toLowerCase() === cc.toLowerCase() ? 'on' : ''}" style="background:${c}" data-sw="${c}" title="${c}"></button>`).join('')}
        ${saved.map(c => `<button class="sw saved ${c.toLowerCase() === cc.toLowerCase() ? 'on' : ''}" style="background:${c}" data-sw="${c}" title="${c} · Rechtsklick entfernt"></button>`).join('')}
        <label class="sw custom" title="Eigene Farbe wählen" style="background:${cc}"><input type="color" value="${cc}" data-cin="${prop}"></label>
        <button class="sw add" data-csave="${prop}" title="Aktuelle Farbe in der Palette speichern">＋</button>
        ${window.EyeDropper ? `<button class="sw add" data-pick="${prop}" title="Farbe vom Bildschirm aufnehmen (Pipette)">${ic('pipette', '#6B6780', 'ic xs')}</button>` : ''}
      </div></div>`;
  }
  function cornerPickHTML(it) {
    const c = it.corners || {}; const on = k => c[k] !== false; const r = Math.min(it.radius ?? 8, 18);
    const rad = CORNERS.map(k => (on(k) ? r : 0) + 'px').join(' ');
    return `<div class="corner-row"><span>Gerundete Ecken</span>
      <div class="corner-pick" title="Ecken anklicken zum Ein-/Ausschalten">
        <i class="corner-prev" style="border-radius:${rad}"></i>
        ${CORNERS.map(k => `<button class="cp cp-${k} ${on(k) ? 'on' : ''}" data-corner="${k}" title="${{ tl: 'oben links', tr: 'oben rechts', br: 'unten rechts', bl: 'unten links' }[k]}"></button>`).join('')}
      </div></div>
      <div class="p-row corner-presets">${Object.keys(CORNER_PRESETS).map(k => `<button class="pbtn" data-cpreset="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>`;
  }
  function rangeRow(label, prop, val, min, max, step, unit = '') {
    const shown = unit === '%' ? Math.round(val * 100) : val;
    return `<div class="r-row"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-rng="${prop}"><b data-out="${prop}">${shown}${unit}</b></div>`;
  }

  function renderProps() {
    if (P.active || !propsOpen) { props.classList.add('hidden'); return; }
    if (multi.length > 1) { props.classList.remove('hidden'); props.innerHTML = `<button class="props-close" data-close-props>×</button>` + multiPanel(); return; }
    const it = selected && find(selected); const ln = selected && findLink(selected);
    if (!it && !ln) { props.classList.add('hidden'); return; }
    props.classList.remove('hidden');
    let html = '';
    if (ln) {
      html = `<div class="p-title">Verbindung</div>${colorRow('Farbe', 'color', ln.color || '#7C3AED')}
        ${rangeRow('Linienstärke', 'width', ln.width ?? 2.5, 1, 10, 0.5)}
        <div class="p-row"><button class="pbtn ${ln.dashed ? 'on' : ''}" data-tog="dashed">Gestrichelt</button><button class="pbtn ${ln.arrow === false ? '' : 'on'}" data-tog-not="arrow">Pfeil</button>
          <button class="pbtn ${ln.both ? 'on' : ''}" data-tog="both">Beidseitig</button><button class="pbtn" data-p="flip">Richtung ↔</button></div>
        <div class="p-row"><button class="pbtn" data-p="llabel">Beschriftung</button><button class="pbtn ${ln.presHide ? 'on' : ''}" data-tog="presHide">In Präsentation ausblenden</button></div>
        <div class="p-row"><button class="pbtn danger" data-p="delete">Löschen</button></div>`;
    } else {
      const type = it.type;
      const names = { gallery: 'Bilder mit Erklärung', proto: 'Prototyp', lane: 'Phase', devlog: 'Entwicklungsverlauf', features: 'Funktionsliste', palette: 'Farbpalette', imgslot: 'Bild-Platzhalter', choice: 'Auswahlliste', summary: 'KI-Prompt (automatisch)', draw: 'Zeichnung', note: 'Haftnotiz', text: 'Text', rect: 'Rechteck', ellipse: 'Kreis', diamond: 'Raute', shape: SHAPE_DEFS[it.shape]?.[0] || 'Form', icon: 'Icon', image: 'Bild', frame: 'Frame / Folie',
        embed: EMBEDS[it.kind]?.label || 'Modul', design: DESIGNS[it.kind]?.label || 'Design', html: 'HTML-Visualisierung' };
      html = `<div class="p-title">${names[type]}</div>`;
      // Inhalt
      if (type === 'design') html += `<div class="p-row"><button class="pbtn accent wide" data-p="dcontent">${ic('pencil', '#7C3AED', 'ic xs')} Inhalt bearbeiten</button></div>
        <div class="p-sub">Farbthema</div><div class="p-row">${DESIGN_THEMES.map((t, i) => `<button class="theme-chip" data-dtheme="${i}" title="${t.name}"><i style="background:${t.bg}"></i><i style="background:${t.c1}"></i><i style="background:${t.c2}"></i></button>`).join('')}</div>`;
      if (type === 'html') html += `<div class="p-row"><button class="pbtn accent wide" data-p="hedit">${ic('code-xml', '#7C3AED', 'ic xs')} Code bearbeiten</button><button class="pbtn ${it.hideHead ? 'on' : ''}" data-tog="hideHead">Kopfzeile aus</button></div>`;
      if (type === 'embed') html += `<div class="p-row">${(EMBEDS[it.kind].ref || EMBEDS[it.kind].filter || EMBEDS[it.kind].platform) ? '<button class="pbtn" data-p="config">Einstellungen</button>' : ''}<button class="pbtn" data-p="open">Im Modul öffnen</button></div>`;
      if (type === 'icon') html += `<div class="p-row"><button class="pbtn" data-p="reicon">Icon tauschen</button></div>`;
      if (type === 'choice') html += `<div class="p-row"><button class="pbtn accent wide" data-p="ch-edit">${ic('list-checks', '#7C3AED', 'ic xs')} Optionen bearbeiten</button></div>
        <div class="p-row"><button class="pbtn ${it.mode !== 'single' ? 'on' : ''}" data-chmode="multi">Mehrfach</button><button class="pbtn ${it.mode === 'single' ? 'on' : ''}" data-chmode="single">Nur eine</button>
          ${[1, 2, 3].map(c => `<button class="pbtn ${(it.cols || 1) === c ? 'on' : ''}" data-chcols="${c}">${c} Sp.</button>`).join('')}</div>
        <label class="p-check"><input type="checkbox" data-chkinv="noPrompt" ${it.noPrompt ? '' : 'checked'}> ✦ Im KI-Prompt verwenden${it.label ? ` (als „${esc(it.label)}“)` : ''}</label>
        <div class="p-row"><button class="pbtn ${it.onlySelected ? 'on' : ''}" data-p="ch-only">Nur Ausgewähltes zeigen</button><button class="pbtn" data-p="ch-reset">Auswahl leeren</button><button class="pbtn" data-p="ch-fit">Höhe anpassen</button></div>`;
      if (type === 'summary') html += `<div class="p-row"><button class="pbtn accent wide" data-p="sum-copy">${ic('copy', '#7C3AED', 'ic xs')} Prompt kopieren</button></div>
        <div class="p-row"><button class="pbtn wide" data-p="sum-edit">Einleitung & Abschluss anpassen</button></div>
        <div class="muted small">Sammelt automatisch alle ausgewählten Optionen und Notizen mit „In KI-Prompt übernehmen“.</div>`;
      if (it.group) html += `<div class="p-row"><button class="pbtn" data-m="ungroup">Gruppierung aufheben</button></div>`;
      if (type === 'frame') html += `<div class="p-row"><button class="pbtn accent wide" data-p="save-frame">${ic('bookmark-plus', '#7C3AED', 'ic xs')} Als Frame-Vorlage speichern</button></div>`;
      if (type === 'frame') html += `<div class="p-row"><input class="input sm wide" data-txt="title" value="${esc(it.title || '')}" placeholder="Titel"></div>
        <div class="r-row"><span>Folien-Nr.</span><input class="input sm" type="number" min="1" data-num="order" value="${it.order ?? ''}" placeholder="auto"></div>
        <div class="p-row"><button class="pbtn accent wide" data-p="present-here">${ic('play', '#7C3AED', 'ic xs')} Ab dieser Folie präsentieren</button></div>
        <div class="p-sub">Format & Export</div>
        <div class="r-row"><span>Format</span><select class="input sm" data-frameformat><option value="">Frei (${Math.round(it.w)}×${Math.round(it.h)})</option>${SOCIAL_PRESETS.map(x => `<option value="${x.key}" ${it.preset === x.key ? 'selected' : ''}>${esc(x.label)} · ${x.w}×${x.h}</option>`).join('')}</select></div>
        ${it.safe ? `<label class="p-check"><input type="checkbox" data-chk="showSafe" ${it.showSafe !== false ? 'checked' : ''}> Sicherheitszonen anzeigen (wird nicht exportiert)</label>` : ''}
        <div class="p-row"><button class="pbtn accent wide" data-p="frame-export">${ic('download', '#7C3AED', 'ic xs')} Als PNG/JPG exportieren${it.export ? ` (${it.export.w}×${it.export.h})` : ''}</button></div>
        ${it.carousel ? `<div class="p-row"><button class="pbtn wide" data-p="add-slide">+ Slide anhängen</button></div>` : ''}`;

      // Farben
      html += `<div class="p-sub">Farben & Stil</div>`;
      if (type === 'note') html += colorRow('Hintergrund', 'color', it.color || NOTE_COLORS[0]) + colorRow('Schrift', 'textColor', it.textColor || '#1F1B2E');
      if (type === 'text') html += colorRow('Schrift', 'color', it.color || '#1F1B2E');
      if (SHAPES.includes(type) || type === 'note') {
        html += `<div class="c-row"><div class="c-head"><span>Schnellfarben</span></div><div class="swatches qcs">${QUICK_COLORS.map(([f, s2]) => `<button class="qc" data-qc="${f}|${s2}" style="--f:${f};--s:${s2}" title="Füllung ${f} · Rahmen ${s2}"></button>`).join('')}</div></div>`;
      }
      if (SHAPES.includes(type)) {
        html += `<div class="p-row"><button class="pbtn accent wide" data-p="reshape">${ic('shapes', '#7C3AED', 'ic xs')} Form ändern</button></div>`;
        html += colorRow('Füllung', 'fillColor', it.fillColor || it.color || '#7C3AED') + colorRow('Rahmen', 'color', it.color || '#7C3AED')
          + rangeRow('Deckkraft Füllung', 'fillOpacity', it.fillOpacity ?? (it.fill === false ? 0 : 0.12), 0, 1, 0.05, '%')
          + rangeRow('Rahmenstärke', 'strokeWidth', it.strokeWidth ?? 2.5, 0, 12, 0.5)
          + (type === 'rect' ? rangeRow('Eckenradius', 'radius', it.radius ?? 8, 0, 200, 1) + cornerPickHTML(it) : '')
          + `<div class="p-row"><button class="pbtn ${it.dashed ? 'on' : ''}" data-tog="dashed">Gestrichelt</button></div>`
          + colorRow('Schrift', 'textColor', it.textColor || '#1F1B2E');
      }
      if (type === 'icon') html += colorRow('Farbe', 'color', it.color || '#7C3AED');
      if (type === 'choice') html += colorRow('Akzentfarbe', 'color', it.color || '#7C3AED');
      if (type === 'draw') html += colorRow('Strichfarbe', 'color', it.color || '#7C3AED') + rangeRow('Strichstärke', 'width', it.width || 4, 1, 40, 1) + `<div class="p-row"><button class="pbtn ${it.dashed ? 'on' : ''}" data-tog="dashed">Gestrichelt</button></div>`;
      if (type === 'embed') html += colorRow('Kopfzeile', 'headColor', it.headColor || '#7C3AED');
      if (type === 'html') html += colorRow('Kopfzeile', 'headColor', it.headColor || '#1F1B2E');
      if (type === 'frame') html += colorRow('Hintergrund', 'color', it.color || '#FFFFFF');
      if (type === 'image') html += rangeRow('Eckenradius', 'radius', it.radius ?? 6, 0, 200, 1);
      if (type === 'design') {
        const c = it.c || DESIGN_THEMES[0];
        html += colorRow('Hauptfarbe', 'c.c1', c.c1) + colorRow('Akzent', 'c.c2', c.c2) + colorRow('Hintergrund', 'c.bg', c.bg) + colorRow('Schrift', 'c.ink', c.ink);
      }
      html += rangeRow('Deckkraft', 'opacity', it.opacity ?? 1, 0.05, 1, 0.05, '%');
      if (type !== 'frame') html += rangeRow('Drehung', 'rot', it.rot || 0, -180, 180, 1, '°');
      html += `<div class="p-row"><button class="pbtn ${it.shadow ? 'on' : ''}" data-tog="shadow">Schatten</button></div>`;

      if (type === 'note' || type === 'text' || SHAPES.includes(type)) html += `<label class="p-check"><input type="checkbox" data-chk="promptInclude" ${it.promptInclude ? 'checked' : ''}> ✦ In KI-Prompt übernehmen</label>`;
      // Text
      if (TEXTUAL.includes(type)) {
        html += `<div class="p-sub">Text</div><div class="p-row"><button class="pbtn" data-p="fs-">A−</button><span class="fs-val">${it.fs || (type === 'text' ? 22 : 16)}px</span><button class="pbtn" data-p="fs+">A+</button>
          <button class="pbtn ${it.bold ? 'on' : ''}" data-tog="bold"><b>B</b></button><button class="pbtn ${it.italic ? 'on' : ''}" data-tog="italic"><i>I</i></button>
          <button class="pbtn" data-p="align">${{ left: 'Links', center: 'Mitte', right: 'Rechts' }[it.align || (type === 'text' ? 'left' : 'center')]}</button></div>
          <div class="r-row"><span>Vertikal</span><div class="seg sm-seg">${[['top', 'Oben'], ['middle', 'Mitte'], ['bottom', 'Unten']].map(([v, l]) => `<button class="${(it.valign || (type === 'text' ? 'top' : 'middle')) === v ? 'on' : ''}" data-valign="${v}">${l}</button>`).join('')}</div></div>
          ${rangeRow('Abstand zum Rand', 'pad', it.pad ?? (type === 'note' ? 14 : type === 'text' ? 0 : 14), 0, 80, 1)}`;
        html += `<div class="p-sub">Umwandeln & Verknüpfen</div><div class="p-row">
          <button class="pbtn accent" data-p="to-task">${ic('square-check', '#7C3AED', 'ic xs')} Aufgabe</button>
          <button class="pbtn accent" data-p="to-post">${ic('send', '#7C3AED', 'ic xs')} Post</button>
          <button class="pbtn accent" data-p="to-obj">${ic('target', '#7C3AED', 'ic xs')} Ziel</button></div>
          <div class="p-row"><button class="pbtn" data-p="link">${ic('link', '#6B6780', 'ic xs')} ${it.link ? 'Verknüpfung ändern' : 'Mit Eintrag verknüpfen'}</button>
          ${it.link ? '<button class="pbtn" data-p="unlink">Lösen</button>' : ''}</div>`;
      }

      // Präsentation
      if (type !== 'frame') {
        html += `<div class="p-sub">Präsentation</div>
          <div class="r-row"><span>Animation</span><select class="input sm" data-sel="anim">${ANIMS.map(([v, l]) => `<option value="${v}" ${(it.anim || 'none') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="r-row"><span>Schritt</span><input class="input sm" type="number" min="1" max="99" data-num="step" value="${it.step || 1}"><button class="pbtn" data-p="preview-anim">▶ Vorschau</button></div>
          <label class="p-check"><input type="checkbox" data-chk="cover" ${it.cover ? 'checked' : ''}> Verdecken – wird im Schritt aufgedeckt</label>
          ${it.cover ? `<div class="p-row"><input class="input sm wide" data-txt="coverText" value="${esc(it.coverText || '')}" placeholder="Text auf der Abdeckung (optional)"></div>` : ''}
          <label class="p-check"><input type="checkbox" data-chk="presHide" ${it.presHide ? 'checked' : ''}> In der Präsentation ausblenden</label>`;
      }
      const frs = framesOrdered().filter(f => f.id !== it.id);
      if (frs.length) html += `<div class="p-sub">Verlinken</div><div class="r-row"><span>Sprung zu Frame</span><select class="input sm" data-sel="goto"><option value="">– kein Link –</option>${frs.map(f => `<option value="${f.id}" ${it.goto === f.id ? 'selected' : ''}>${esc(f.title || 'Frame')}</option>`).join('')}</select></div>`;
      html += `<div class="p-sub">Anordnen</div><div class="p-row"><button class="pbtn" data-p="front">Nach vorn</button><button class="pbtn" data-p="back">Nach hinten</button><button class="pbtn" data-p="dup">Duplizieren</button></div>
        <div class="p-row"><button class="pbtn danger" data-p="delete">Löschen</button></div>`;
    }
    const st = props.scrollTop;
    props.innerHTML = `<button class="props-close" data-close-props title="Eigenschaften ausblenden (über die Leiste am Element wieder einblenden)">×</button>` + html + (it?.locked ? '<div class="muted small">🔒 Gesperrt – Strg+L oder Schloss-Symbol zum Entsperren</div>' : ''); props.scrollTop = st;
  }

  function setProp(obj, prop, value) {
    if (prop.startsWith('c.')) { obj.c = { ...(obj.c || DESIGN_THEMES[0]) }; delete obj.c.name; obj.c[prop.slice(2)] = value; }
    else obj[prop] = value;
  }
  /** Farbe setzen; bei Füllfarbe eine fast unsichtbare Deckkraft auf voll anheben */
  function setColor(o, prop, value) {
    setProp(o, prop, value);
    if (prop === 'fillColor' && (o.fillOpacity ?? (o.fill === false ? 0 : 0.12)) < 0.35) o.fillOpacity = 1;
    if (prop === 'fillColor' && !o.textColorManual) o.textColor = contrastText(value);
    if (prop === 'textColor') o.textColorManual = true;
  }
  function applyQuick(o, [f, s2]) {
    if (o.type === 'note') { o.color = f; o.textColor = contrastText(f); return; }
    if (SHAPES.includes(o.type)) { o.fillColor = f; o.color = s2; o.fillOpacity = 1; o.textColor = contrastText(f); delete o.textColorManual; return; }
    if (o.type === 'text' || o.type === 'icon') { o.color = s2 === '#1F1B2E' || f === '#FFFFFF' ? (f === '#FFFFFF' ? '#FFFFFF' : s2) : s2; return; }
    if (o.type === 'frame') { o.color = f; return; }
    if (o.type === 'embed' || o.type === 'html') { o.headColor = s2; return; }
    if ('from' in o) { o.color = s2; }
  }
  const current = () => find(selected) || findLink(selected);
  const isLink = o => !!o && 'from' in o;
  function liveUpdate(o) { if (isLink(o)) drawLinks(); else updateVisual(o); }
  function commitSnap() { if (pendingSnap) { pushUndo(pendingSnap); pendingSnap = null; } }

  function bindProps() {
    props.addEventListener('pointerdown', () => { pendingSnap = snapshot(); });
    props.addEventListener('focusin', () => { if (!pendingSnap) pendingSnap = snapshot(); });
    props.addEventListener('input', e => {
      if (multi.length > 1) return;
      const o = current(); if (!o) return;
      const t = e.target;
      if (t.dataset.cin) { commitSnap(); setColor(o, t.dataset.cin, t.value); t.parentElement.style.background = t.value; const hx = t.closest('.c-row').querySelector('.c-hex'); if (hx) hx.textContent = t.value.toUpperCase(); liveUpdate(o); scheduleSave(); }
      if (t.dataset.rng) {
        commitSnap(); const v = Number(t.value); setProp(o, t.dataset.rng, v);
        const out = props.querySelector(`[data-out="${t.dataset.rng}"]`);
        if (out) out.textContent = ['opacity', 'fillOpacity'].includes(t.dataset.rng) ? Math.round(v * 100) + '%' : t.dataset.rng === 'rot' ? v + '°' : v;
        liveUpdate(o); scheduleSave();
      }
    });
    props.addEventListener('change', e => {
      if (e.target.id === 'multi-fill') return multiAction('fill:' + e.target.value);
      if (multi.length > 1) return;
      const o = current(); if (!o) return;
      const t = e.target;
      if (t.dataset.cin || t.dataset.rng) { pendingSnap = null; renderProps(); return; }
      if (t.dataset.frameformat !== undefined) {
        commitSnap(); const sp = SOCIAL_PRESETS.find(x => x.key === t.value);
        if (sp) { o.preset = sp.key; o.export = { w: sp.w, h: sp.h }; o.safe = sp.safe || null; o.w = Math.round(sp.w * SOC_SCALE); o.h = Math.round(sp.h * SOC_SCALE); if (!o.title || /Folie|Frame/.test(o.title)) o.title = sp.label; }
        else { delete o.preset; delete o.export; o.safe = null; }
        render(); return scheduleSave();
      }
      commitSnap();
      if (t.dataset.sel) { setProp(o, t.dataset.sel, t.value); if (t.dataset.sel === 'goto' && !t.value) delete o.goto; }
      if (t.dataset.num) setProp(o, t.dataset.num, t.value === '' ? null : Number(t.value));
      if (t.dataset.chk) setProp(o, t.dataset.chk, t.checked);
      if (t.dataset.chkinv) { setProp(o, t.dataset.chkinv, !t.checked); setTimeout(refreshSummaries, 0); }
      if (t.dataset.txt) setProp(o, t.dataset.txt, t.value);
      if (t.dataset.sel === 'anim' && t.value !== 'none') previewAnim(o);
      if (t.dataset.chk === 'promptInclude') setTimeout(refreshSummaries, 0);
      liveUpdate(o); renderProps(); scheduleSave();
    });
    props.addEventListener('contextmenu', async e => {
      const sw = e.target.closest('.sw.saved'); if (!sw) return;
      e.preventDefault();
      await setSetting('palette', savedPalette().filter(c => c !== sw.dataset.sw)); renderProps(); toast('Farbe aus der Palette entfernt');
    });
    props.addEventListener('click', e => propClick(e));
  }

  async function propClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.closeProps !== undefined) { propsOpen = false; try { localStorage.setItem('vp-props', '0'); } catch { /* egal */ } const bar = $('.wb-ctx', root); bar.dataset.key = ''; renderProps(); return updateCtxBar(); }
    if (b.dataset.m) return multiAction(b.dataset.m);
    const o = current(); if (!o) return;
    const d = b.dataset;
    if (d.valign) { pushUndo(); o.valign = d.valign; return rerenderItem(o); }
    if (d.chmode) { pushUndo(); o.mode = d.chmode; if (o.mode === 'single') { let seen = false; o.options.forEach(x => { if (x.on && seen) x.on = false; if (x.on) seen = true; }); } rerenderItem(o); return refreshSummaries(); }
    if (d.chcols) { pushUndo(); o.cols = Number(d.chcols); o.h = choiceHeight(o); return rerenderItem(o); }
    if (d.corner) { pushUndo(); o.corners = { ...(o.corners || {}) }; o.corners[d.corner] = o.corners[d.corner] === false; if ((o.radius ?? 8) === 0) o.radius = 16; liveUpdate(o); renderProps(); return scheduleSave(); }
    if (d.cpreset) { pushUndo(); const v = CORNER_PRESETS[d.cpreset]; o.corners = Object.fromEntries(CORNERS.map((k, i) => [k, !!v[i]])); if (d.cpreset !== 'keine' && (o.radius ?? 8) === 0) o.radius = 16; liveUpdate(o); renderProps(); return scheduleSave(); }
    if (d.qc) { pushUndo(); applyQuick(o, d.qc.split('|')); lastShapeColors = d.qc.split('|'); liveUpdate(o); renderProps(); return scheduleSave(); }
    if (d.pick) {
      try { const r = await new EyeDropper().open(); pushUndo(); setColor(o, d.pick, r.sRGBHex); liveUpdate(o); renderProps(); scheduleSave(); } catch { /* abgebrochen */ }
      return;
    }
    if (d.sw) { pushUndo(); setColor(o, b.closest('.c-row').dataset.cprop, d.sw); liveUpdate(o); renderProps(); return scheduleSave(); }
    if (d.csave) {
      const val = toHex6(d.csave.startsWith('c.') ? (o.c || {})[d.csave.slice(2)] : o[d.csave]);
      const pal = savedPalette();
      if (pal.includes(val) || BRAND.includes(val.toUpperCase())) return toast('Diese Farbe ist schon in der Palette');
      await setSetting('palette', [...pal, val].slice(-24)); renderProps(); return toast('Farbe gespeichert – sie steht jetzt überall zur Auswahl');
    }
    if (d.tog) { pushUndo(); o[d.tog] = !o[d.tog]; liveUpdate(o); renderProps(); return scheduleSave(); }
    if (d.togNot) { pushUndo(); o[d.togNot] = o[d.togNot] === false; liveUpdate(o); renderProps(); return scheduleSave(); }
    if (d.dtheme) { pushUndo(); const th = { ...DESIGN_THEMES[d.dtheme] }; delete th.name; o.c = th; return rerenderItem(o); }
    if (isLink(o)) {
      if (d.p === 'flip') { pushUndo(); [o.from, o.to] = [o.to, o.from]; }
      if (d.p === 'llabel') {
        const v = await openForm({ title: 'Beschriftung', values: { label: o.label || '' }, fields: [{ key: 'label', label: 'Text an der Verbindung' }] });
        if (v) { pushUndo(); o.label = v.label; }
      }
      if (d.p === 'delete') { pushUndo(); data.connectors = data.connectors.filter(c => c !== o); selected = null; }
      drawLinks(); renderProps(); return scheduleSave();
    }
    const it = o;
    switch (d.p) {
      case 'fs-': case 'fs+': pushUndo(); it.fs = clamp((it.fs || (it.type === 'text' ? 22 : 16)) + (d.p === 'fs+' ? 2 : -2), 8, 160); return rerenderItem(it);
      case 'align': { pushUndo(); const order = ['left', 'center', 'right']; const cur = it.align || (it.type === 'text' ? 'left' : 'center'); it.align = order[(order.indexOf(cur) + 1) % 3]; return rerenderItem(it); }
      case 'front': pushUndo(); data.items = data.items.filter(x => x !== it).concat(it); render(); return scheduleSave();
      case 'back': pushUndo(); data.items = [it, ...data.items.filter(x => x !== it)]; render(); return scheduleSave();
      case 'dup': return duplicate(it);
      case 'delete': return removeSelected(it.id);
      case 'open': location.hash = '#/' + EMBEDS[it.kind].module; return;
      case 'config': { const cfg = await embedConfig(it.kind, it.cfg || {}); if (!cfg) return; pushUndo(); it.cfg = { ...it.cfg, ...cfg }; return rerenderItem(it); }
      case 'reicon': return openIconPicker(it);
      case 'ch-edit': return editChoice(it);
      case 'ch-only': pushUndo(); it.onlySelected = !it.onlySelected; it.h = choiceHeight(it); return rerenderItem(it);
      case 'ch-reset': pushUndo(); it.options.forEach(o => { o.on = false; }); if (it.onlySelected) it.h = choiceHeight(it); rerenderItem(it); return refreshSummaries();
      case 'ch-fit': pushUndo(); it.h = choiceHeight(it); return rerenderItem(it);
      case 'sum-copy': return copyPrompt(it);
      case 'sum-edit': return editSummary(it);
      case 'reshape': return toggleShapePicker(b, it);
      case 'dcontent': return editDesignContent(it);
      case 'hedit': return editHtml(it);
      case 'present-here': return startPresentation(it.id);
      case 'save-frame': return saveFrameTemplate(it);
      case 'frame-export': return openFrameExport(it);
      case 'add-slide': return addCarouselSlide(it);
      case 'preview-anim': return previewAnim(it);
      case 'to-task': case 'to-post': case 'to-obj': return convert(it, d.p.slice(3));
      case 'link': return linkItem(it);
      case 'unlink': pushUndo(); delete it.link; return rerenderItem(it);
    }
  }

  // ---------- Mehrfachauswahl: Gruppieren, Ausrichten, Verteilen ----------
  function multiPanel() {
    const items = selItems(); const grouped = items.some(i => i.group);
    return `<div class="p-title">${items.length} Elemente ausgewählt</div>
      <div class="p-row"><button class="pbtn accent" data-m="group">${ic('group', '#7C3AED', 'ic xs')} Gruppieren</button>
        ${grouped ? `<button class="pbtn" data-m="ungroup">${ic('ungroup', '#6B6780', 'ic xs')} Aufheben</button>` : ''}</div>
      <div class="p-sub">Farbe für alle</div>
      <div class="swatches qcs">${QUICK_COLORS.map(([f, s2]) => `<button class="qc" data-m="qc:${f}|${s2}" style="--f:${f};--s:${s2}"></button>`).join('')}
        <label class="sw custom" title="Eigene Füllfarbe für alle"><input type="color" id="multi-fill" value="#7C3AED"></label></div>
      ${items.some(i => i.type === 'rect') ? `<div class="p-sub">Ecken (alle Rechtecke)</div>
        <div class="p-row">${[0, 8, 16, 32, 64].map(r => `<button class="pbtn" data-m="rad:${r}">${r} px</button>`).join('')}</div>
        <div class="p-row corner-presets">${Object.keys(CORNER_PRESETS).map(k => `<button class="pbtn" data-m="cpre:${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>` : ''}
      <div class="p-sub">Ausrichten</div>
      <div class="p-row icons">
        <button class="pbtn" data-m="al-left" title="Links ausrichten">${ic('align-start-vertical', '#4B4563', 'ic sm')}</button>
        <button class="pbtn" data-m="al-cx" title="Horizontal zentrieren">${ic('align-center-vertical', '#4B4563', 'ic sm')}</button>
        <button class="pbtn" data-m="al-right" title="Rechts ausrichten">${ic('align-end-vertical', '#4B4563', 'ic sm')}</button>
        <button class="pbtn" data-m="al-top" title="Oben ausrichten">${ic('align-start-horizontal', '#4B4563', 'ic sm')}</button>
        <button class="pbtn" data-m="al-cy" title="Vertikal zentrieren">${ic('align-center-horizontal', '#4B4563', 'ic sm')}</button>
        <button class="pbtn" data-m="al-bottom" title="Unten ausrichten">${ic('align-end-horizontal', '#4B4563', 'ic sm')}</button></div>
      <div class="p-sub">Gleichmäßig verteilen</div>
      <div class="r-row"><span>Abstand (px)</span><input class="input sm" type="number" min="0" id="dist-gap" placeholder="auto"></div>
      <div class="p-row"><button class="pbtn" data-m="dist-h">${ic('align-horizontal-space-between', '#4B4563', 'ic xs')} Horizontal</button>
        <button class="pbtn" data-m="dist-v">${ic('align-vertical-space-between', '#4B4563', 'ic xs')} Vertikal</button></div>
      <div class="p-row"><button class="pbtn" data-m="size-w">Gleiche Breite</button><button class="pbtn" data-m="size-h">Gleiche Höhe</button></div>
      <div class="muted small">„auto“ verteilt innerhalb der aktuellen Breite/Höhe. Mit Zahl: fester Abstand.</div>
      <div class="p-sub">Präsentation</div>
      <div class="r-row"><span>Animation</span><select class="input sm" id="multi-anim"><option value="">– unverändert –</option>${ANIMS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>
      <div class="p-row"><button class="pbtn" data-m="steps">Schritte nacheinander vergeben</button></div>
      <div class="p-sub">Weitere</div>
      <div class="p-row"><button class="pbtn" data-m="frame">In Frame packen</button><button class="pbtn" data-m="dup">Duplizieren</button></div>
      <div class="p-row"><button class="pbtn danger" data-m="delete">Alle löschen</button></div>
      <div class="muted small">Tipp: Strg/Cmd + Klick fügt hinzu oder entfernt, Strg/Cmd + Ziehen auf leerer Fläche wählt per Rahmen.</div>`;
  }

  function multiAction(a) {
    let items = selItems();
    if (a.startsWith('rad:') || a.startsWith('cpre:')) {
      pushUndo();
      items.filter(i => i.type === 'rect').forEach(i => {
        if (a.startsWith('rad:')) i.radius = Number(a.slice(4));
        else { const v = CORNER_PRESETS[a.slice(5)]; i.corners = Object.fromEntries(CORNERS.map((k, n) => [k, !!v[n]])); if ((i.radius ?? 8) === 0 && a !== 'cpre:keine') i.radius = 16; }
        updateVisual(i);
      });
      markSelection(); return scheduleSave();
    }
    if (a.startsWith('qc:') || a.startsWith('fill:')) {
      pushUndo();
      const pair = a.startsWith('qc:') ? a.slice(3).split('|') : [a.slice(5), a.slice(5)];
      items.forEach(i => { if (a.startsWith('fill:') && SHAPES.includes(i.type)) { setColor(i, 'fillColor', pair[0]); } else applyQuick(i, pair); });
      items.forEach(updateVisual); markSelection(); scheduleSave(); return;
    }
    if (a === 'ungroup' && items.length === 0 && selected) items = [find(selected)].filter(Boolean);
    if (!items.length) return;
    pushUndo();
    const b = bbox(items);
    const gapVal = $('#dist-gap', props)?.value;
    switch (a) {
      case 'group': { if (items.length < 2) { undoStack.pop(); return toast('Mindestens zwei Elemente auswählen'); } const g = uid(); items.forEach(i => i.group = g); toast('Gruppiert – die Gruppe wird jetzt gemeinsam ausgewählt und bewegt'); break; }
      case 'ungroup': { const gs = new Set(items.map(i => i.group).filter(Boolean)); data.items.forEach(i => { if (gs.has(i.group)) delete i.group; }); break; }
      case 'al-left': items.forEach(i => i.x = b.x); break;
      case 'al-right': items.forEach(i => i.x = b.x + b.w - i.w); break;
      case 'al-cx': items.forEach(i => i.x = Math.round(b.x + b.w / 2 - i.w / 2)); break;
      case 'al-top': items.forEach(i => i.y = b.y); break;
      case 'al-bottom': items.forEach(i => i.y = b.y + b.h - i.h); break;
      case 'al-cy': items.forEach(i => i.y = Math.round(b.y + b.h / 2 - i.h / 2)); break;
      case 'dist-h': case 'dist-v': {
        const hz = a === 'dist-h'; const P1 = hz ? 'x' : 'y', S1 = hz ? 'w' : 'h';
        const units = groupUnits(items).sort((p, q) => p.box[P1] - q.box[P1]);
        if (units.length < 2) { undoStack.pop(); return toast('Mindestens zwei Elemente (oder Gruppen) auswählen'); }
        const total = units.reduce((s, u) => s + u.box[S1], 0);
        const span = units[units.length - 1].box[P1] + units[units.length - 1].box[S1] - units[0].box[P1];
        const gap = gapVal !== '' && gapVal != null ? Number(gapVal) : (span - total) / (units.length - 1);
        let pos = units[0].box[P1];
        units.forEach(u => { const d = Math.round(pos - u.box[P1]); u.items.forEach(i => i[P1] += d); pos += u.box[S1] + gap; });
        toast(`${hz ? 'Horizontal' : 'Vertikal'} verteilt · Abstand ${Math.round(gap)} px`); break;
      }
      case 'size-w': { const w = items[items.length - 1].w; items.forEach(i => { if (i.type === 'design' || i.type === 'icon') i.h = Math.round(i.h * w / i.w); i.w = w; }); break; }
      case 'size-h': { const h2 = items[items.length - 1].h; items.forEach(i => { if (i.type === 'design' || i.type === 'icon') i.w = Math.round(i.w * h2 / i.h); i.h = h2; }); break; }
      case 'steps': {
        const anim = $('#multi-anim', props)?.value;
        items.filter(i => i.type !== 'frame').sort((p, q) => p.y - q.y || p.x - q.x).forEach((i, n) => { i.step = n + 1; if (anim) i.anim = anim; else if (!i.anim || i.anim === 'none') i.anim = 'fade'; });
        toast('Schritte 1, 2, 3 … von oben nach unten vergeben'); break;
      }
      case 'frame': {
        const pad2 = 60; const f = { id: uid(), type: 'frame', x: b.x - pad2, y: b.y - pad2, w: b.w + pad2 * 2, h: b.h + pad2 * 2, color: '#FFFFFF', title: `Folie ${data.items.filter(i => i.type === 'frame').length + 1}` };
        data.items.unshift(f); break;
      }
      case 'dup': {
        const map = {}; const g = {};
        const copies = items.map(i => { const c = JSON.parse(JSON.stringify(i)); c.id = uid(); map[i.id] = c.id; c.x += 40; c.y += 40; if (c.group) c.group = g[c.group] ||= uid(); return c; });
        data.connectors.filter(c => map[c.from] && map[c.to]).forEach(c => data.connectors.push({ ...c, id: uid(), from: map[c.from], to: map[c.to] }));
        data.items.push(...copies); multi = copies.map(c => c.id); break;
      }
      case 'delete': undoStack.pop(); return removeSelected(items[0].id);
    }
    if (a === 'steps' || a === 'frame' || a === 'dup' || a === 'group' || a === 'ungroup') render(); else { items.forEach(updateVisual); renderProps(); }
    if (a !== 'dup') markSelection();
    scheduleSave();
  }
  /** Gruppen beim Verteilen als eine Einheit behandeln */
  function groupUnits(items) {
    const units = new Map();
    items.forEach(i => { const k = i.group || i.id; if (!units.has(k)) units.set(k, []); units.get(k).push(i); });
    return [...units.values()].map(list => ({ items: list, box: bbox(list) }));
  }

  // ---------- Frame-Vorlagen ----------------------------------------------
  const FRAME_PRESETS = [
    { key: 'blank169', label: 'Leer 16:9', desc: 'Präsentationsfolie 960 × 540', icon: 'rectangle-horizontal', w: 960, h: 540, items: [] },
    { key: 'story', label: 'Story / Reel 9:16', desc: 'Hochformat 540 × 960', icon: 'smartphone', w: 540, h: 960, items: [] },
    { key: 'square', label: 'Post 1:1', desc: 'Quadratisch 720 × 720', icon: 'square', w: 720, h: 720, items: [] },
    { key: 'portrait', label: 'Post 4:5', desc: 'Instagram-Hochformat 720 × 900', icon: 'rectangle-vertical', w: 720, h: 900, items: [] },
    { key: 'title', label: 'Titelfolie', desc: 'Großer Titel mit Untertitel', icon: 'heading', w: 960, h: 540, color: '#7C3AED', items: [
      { type: 'text', x: 80, y: 190, w: 800, h: 80, text: 'Titel der Präsentation', fs: 56, bold: true, color: '#FFFFFF', anim: 'up', step: 1 },
      { type: 'text', x: 80, y: 290, w: 800, h: 40, text: 'Untertitel · Datum', fs: 24, color: '#EDE9FE', anim: 'fade', step: 2 }] },
    { key: 'two', label: 'Zwei Spalten', desc: 'Überschrift + zwei Inhaltsbereiche', icon: 'columns-2', w: 960, h: 540, items: [
      { type: 'text', x: 60, y: 40, w: 840, h: 54, text: 'Überschrift', fs: 36, bold: true },
      { type: 'rect', x: 60, y: 130, w: 400, h: 350, color: '#7C3AED', fillOpacity: 0.08, radius: 16, text: 'Linke Spalte', anim: 'left', step: 1 },
      { type: 'rect', x: 500, y: 130, w: 400, h: 350, color: '#34D399', fillOpacity: 0.1, radius: 16, text: 'Rechte Spalte', anim: 'right', step: 2 }] },
    { key: 'three', label: 'Drei Punkte', desc: 'Überschrift + 3 Karten mit Icons', icon: 'layout-grid', w: 960, h: 540, items: [
      { type: 'text', x: 60, y: 40, w: 840, h: 54, text: 'Drei Kernpunkte', fs: 36, bold: true },
      ...[0, 1, 2].map(i => ({ type: 'design', kind: 'card', data: { icon: ['lightbulb', 'target', 'rocket'][i], title: `Punkt ${i + 1}`, body: 'Kurze Beschreibung dieses Punktes.' },
        c: { c1: ['#7C3AED', '#059669', '#EA580C'][i], c2: '#34D399', bg: '#FFFFFF', ink: '#1F1B2E' }, x: 60 + i * 290, y: 160, w: 260, h: 179, anim: 'up', step: i + 1 }))] },
    { key: 'kpi', label: 'Kennzahlen', desc: 'KPI-Reihe + Balkendiagramm', icon: 'chart-column', w: 960, h: 540, items: [
      { type: 'text', x: 60, y: 30, w: 840, h: 54, text: 'Zahlen & Fortschritt', fs: 36, bold: true },
      { type: 'design', kind: 'kpis', data: { ...DESIGNS.kpis.defaults }, c: { c1: '#7C3AED', c2: '#34D399', bg: '#FFFFFF', ink: '#1F1B2E' }, x: 60, y: 110, w: 840, h: 166, anim: 'fade', step: 1 },
      { type: 'design', kind: 'progress', data: { ...DESIGNS.progress.defaults }, c: { c1: '#7C3AED', c2: '#34D399', bg: '#FFFFFF', ink: '#1F1B2E' }, x: 60, y: 320, w: 500, h: 145, anim: 'left', step: 2 }] },
  ];

  function openFrameTemplates(pos) {
    const own = getSetting('frameTemplates', []);
    const thumb = (w, hgt) => { const s2 = Math.min(56 / w, 56 / hgt); return `<div class="ft-th"><i class="ft-shape" style="width:${Math.round(w * s2)}px;height:${Math.round(hgt * s2)}px"></i></div>`; };
    const cats = [...new Set(SOCIAL_PRESETS.map(x => x.cat))];
    const el = h(`<div class="modal-backdrop"><div class="modal frame-modal">
      <h3>Frame einfügen <small class="muted">exakte Formate zum Exportieren & Posten</small></h3>
      ${cats.map(c => `<h4 class="sub">${c}</h4><div class="ft-grid">${SOCIAL_PRESETS.filter(x => x.cat === c).map(x => `<button class="ft" data-soc="${x.key}">
        ${thumb(x.w, x.h)}<span><b>${ic(x.icon, '#7C3AED', 'ic xs')} ${esc(x.label)}</b><small>${x.w} × ${x.h} px${x.carousel ? ' · mehrere Slides' : ''}</small></span></button>`).join('')}</div>`).join('')}
      <h4 class="sub">Präsentation & Layouts</h4><div class="ft-grid">${FRAME_PRESETS.map(x => `<button class="ft" data-pre="${x.key}">${thumb(x.w, x.h)}<span><b>${esc(x.label)}</b><small>${esc(x.desc)}</small></span></button>`).join('')}</div>
      ${own.length ? `<h4 class="sub">Eigene Vorlagen</h4><div class="ft-grid">${own.map(t => `<button class="ft" data-own="${t.id}">${thumb(t.frame.w, t.frame.h)}<span><b>★ ${esc(t.name)}</b><small>${t.items.length} Elemente</small></span><i class="ft-del" data-del-own="${t.id}" title="Vorlage löschen">×</i></button>`).join('')}</div>` : ''}
      <div class="modal-actions"><span class="muted small">Tipp: Eigene Frames über „Als Frame-Vorlage speichern“ in den Eigenschaften eines Frames anlegen.</span><span class="grow"></span><button class="btn ghost" data-x>Abbrechen</button></div>
    </div></div>`);
    const close = () => el.remove();
    el.addEventListener('mousedown', e => { if (e.target === el) close(); }); $('[data-x]', el).onclick = close;
    el.onclick = async e => {
      const del = e.target.closest('[data-del-own]');
      if (del) { e.stopPropagation(); const t = own.find(x => x.id === del.dataset.delOwn); if (confirm(`Vorlage „${t.name}“ löschen?`)) { await setSetting('frameTemplates', getSetting('frameTemplates', []).filter(x => x.id !== t.id)); close(); openFrameTemplates(pos); } return; }
      const b = e.target.closest('[data-soc],[data-pre],[data-own]'); if (!b) return;
      close();
      if (b.dataset.soc) return insertSocialFrame(SOCIAL_PRESETS.find(x => x.key === b.dataset.soc), pos);
      if (b.dataset.own) return insertFrameTemplate(own.find(t => t.id === b.dataset.own), pos);
      const p0 = FRAME_PRESETS.find(x => x.key === b.dataset.pre);
      insertFrameTemplate({ frame: { type: 'frame', w: p0.w, h: p0.h, color: p0.color || '#FFFFFF', title: p0.label }, items: p0.items, connectors: [] }, pos);
    };
    $('#modal-root').appendChild(el);
  }

  // ---------- Social-Media-Frames -----------------------------------------
  const SOC_SCALE = 0.5; // Board-Einheiten pro Export-Pixel
  const SOCIAL_PRESETS = [
    { key: 'ig-post', cat: 'Instagram', label: 'Instagram Post (4:5)', w: 1080, h: 1350, icon: 'mdi:instagram' },
    { key: 'ig-square', cat: 'Instagram', label: 'Instagram Post (1:1)', w: 1080, h: 1080, icon: 'mdi:instagram' },
    { key: 'ig-carousel', cat: 'Instagram', label: 'Instagram Karussell', w: 1080, h: 1350, icon: 'mdi:instagram', carousel: true },
    { key: 'ig-story', cat: 'Instagram', label: 'Story / Reel-Cover (9:16)', w: 1080, h: 1920, icon: 'mdi:instagram', safe: 'story' },
    { key: 'tiktok', cat: 'TikTok & YouTube', label: 'TikTok (9:16)', w: 1080, h: 1920, icon: 'ic:baseline-tiktok', safe: 'tiktok' },
    { key: 'tiktok-carousel', cat: 'TikTok & YouTube', label: 'TikTok Foto-Karussell', w: 1080, h: 1920, icon: 'ic:baseline-tiktok', carousel: true, safe: 'tiktok' },
    { key: 'yt-thumb', cat: 'TikTok & YouTube', label: 'YouTube Thumbnail', w: 1280, h: 720, icon: 'mdi:youtube', safe: 'thumb' },
    { key: 'yt-short', cat: 'TikTok & YouTube', label: 'YouTube Short-Cover', w: 1080, h: 1920, icon: 'mdi:youtube', safe: 'short' },
    { key: 'yt-banner', cat: 'TikTok & YouTube', label: 'YouTube Kanalbanner', w: 2560, h: 1440, icon: 'mdi:youtube', safe: 'ytbanner' },
    { key: 'li-post', cat: 'LinkedIn, Facebook & Co.', label: 'LinkedIn Post (1,91:1)', w: 1200, h: 627, icon: 'mdi:linkedin' },
    { key: 'li-portrait', cat: 'LinkedIn, Facebook & Co.', label: 'LinkedIn Hochformat (4:5)', w: 1080, h: 1350, icon: 'mdi:linkedin' },
    { key: 'li-carousel', cat: 'LinkedIn, Facebook & Co.', label: 'LinkedIn Karussell (PDF-Slides)', w: 1080, h: 1350, icon: 'mdi:linkedin', carousel: true },
    { key: 'fb-post', cat: 'LinkedIn, Facebook & Co.', label: 'Facebook Post (1:1)', w: 1080, h: 1080, icon: 'mdi:facebook' },
    { key: 'pin', cat: 'LinkedIn, Facebook & Co.', label: 'Pinterest Pin (2:3)', w: 1000, h: 1500, icon: 'mdi:pinterest' },
    { key: 'x-post', cat: 'LinkedIn, Facebook & Co.', label: 'X / Threads Bild (16:9)', w: 1600, h: 900, icon: 'ri:twitter-x-fill' },
  ];
  async function insertSocialFrame(sp, pos) {
    let count = 1;
    if (sp.carousel) {
      const v = await openForm({ title: sp.label, values: { n: 5 }, submitLabel: 'Anlegen', fields: [{ key: 'n', label: 'Anzahl Slides (2–20)', type: 'number' }] });
      if (!v) return; count = clamp(Math.round(v.n || 5), 2, 20);
    }
    const w = Math.round(sp.w * SOC_SCALE), hh = Math.round(sp.h * SOC_SCALE), gap = 50;
    let fx, fy;
    if (pos) { fx = Math.round(pos.x - w / 2); fy = Math.round(pos.y - hh / 2); }
    else if (data.items.length) { const fr = data.items.filter(i => i.type === 'frame'); const ref = bbox(fr.length ? fr : data.items); fx = ref.x + ref.w + 100; fy = ref.y; }
    else { const c = viewCenter(); fx = Math.round(c.x - (w * count + gap * (count - 1)) / 2); fy = Math.round(c.y - hh / 2); }
    pushUndo();
    const cid = sp.carousel ? uid() : null; const made = [];
    for (let i = 0; i < count; i++) {
      const f = { id: uid(), type: 'frame', x: fx + i * (w + gap), y: fy, w, h: hh, color: '#FFFFFF', preset: sp.key, export: { w: sp.w, h: sp.h }, safe: sp.safe || null,
        title: sp.carousel ? `${sp.label.replace(/ \(.*\)/, '')} ${i + 1}/${count}` : sp.label };
      if (cid) { f.carousel = cid; f.slide = i + 1; }
      made.push(f);
    }
    data.items.unshift(...made);
    selected = made[0].id; multi = [made[0].id]; setTool('select'); render(); scheduleSave();
    world.style.transition = 'transform .5s ease'; data.view = viewFor(bbox(made), 80); applyView(); setTimeout(() => { world.style.transition = ''; }, 550);
    toast(sp.carousel ? `${count} Slides angelegt – gestalte sie und exportiere alle auf einmal` : `${sp.label} angelegt · Export in ${sp.w}×${sp.h} px`);
  }
  function addCarouselSlide(f) {
    const group = data.items.filter(i => i.carousel === f.carousel).sort((a, b) => a.slide - b.slide);
    const last = group[group.length - 1]; pushUndo();
    const n = { ...JSON.parse(JSON.stringify(last)), id: uid(), x: last.x + last.w + 50, slide: last.slide + 1 };
    data.items.unshift(n);
    const total = group.length + 1; [...group, n].forEach(x => { x.title = x.title.replace(/\d+\/\d+$/, `${x.slide}/${total}`); });
    selected = n.id; multi = [n.id]; render(); scheduleSave();
  }

  // ---------- Frame-Export (PNG/JPG in Originalgröße) ----------------------
  let h2iLoading = null;
  function loadHtmlToImage() {
    if (window.htmlToImage) return Promise.resolve();
    h2iLoading ||= new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'vendor/html-to-image.js'; /* lokal mitgeliefert (MIT-Lizenz) */ sc.onload = res; sc.onerror = () => { h2iLoading = null; rej(new Error('Export-Bibliothek konnte nicht geladen werden.')); }; document.head.appendChild(sc); });
    return h2iLoading;
  }
  async function renderFrame(f, fmt) {
    await loadHtmlToImage();
    const center = i => { const cx = i.x + i.w / 2, cy = i.y + i.h / 2; return cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h; };
    const keep = new Set(data.items.filter(i => i.type !== 'frame' && !i.presHide && center(i)).map(i => i.id)); keep.add(f.id);
    const prevSel = [...multi]; multi = []; selected = null; markSelection(); renderProps();
    world.classList.add('exporting');
    const ratio = f.export ? f.export.w / f.w : 2;
    const opts = {
      width: Math.round(f.w), height: Math.round(f.h), pixelRatio: ratio, backgroundColor: f.color || '#FFFFFF', skipFonts: true, cacheBust: false,
      imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      style: { transform: `translate(${-f.x}px, ${-f.y}px)`, transformOrigin: '0 0', transition: 'none' },
      filter: n => {
        if (!n.classList) return true;
        if (n.classList.contains('wb-item')) return keep.has(n.dataset.id);
        if (n.classList.contains('wb-handle') || n.classList.contains('wb-guide') || n.classList.contains('wb-marquee')) return false;
        if (n.classList.contains('wb-link')) { const c = findLink(n.dataset.link); return c && keep.has(c.from) && keep.has(c.to); }
        return true;
      },
    };
    try {
      const url = fmt === 'jpg' ? await htmlToImage.toJpeg(world, { ...opts, quality: 0.95 }) : await htmlToImage.toPng(world, opts);
      return url;
    } finally { world.classList.remove('exporting'); multi = prevSel; selected = prevSel[prevSel.length - 1] || null; markSelection(); renderProps(); }
  }
  async function openFrameExport(f) {
    if (!f || f.type !== 'frame') return;
    const group = f.carousel ? data.items.filter(i => i.carousel === f.carousel).sort((a, b) => a.slide - b.slide) : [f];
    const dims = f.export ? `${f.export.w} × ${f.export.h} px` : `${Math.round(f.w * 2)} × ${Math.round(f.h * 2)} px`;
    const v = await openForm({
      title: `„${f.title || 'Frame'}“ exportieren`, submitLabel: 'Exportieren',
      extra: `<p class="muted small" style="margin:-6px 0 12px">Größe: <b>${dims}</b>${group.length > 1 ? ` · Karussell mit ${group.length} Slides` : ''}. Elemente, die „In der Präsentation ausblenden“ haben, und die Sicherheitszonen werden nicht mit exportiert. HTML-Visualisierungen erscheinen im Bild nicht.</p>`,
      values: { fmt: 'png', scope: group.length > 1 ? 'all' : 'one', post: '' },
      fields: [
        { key: 'fmt', label: 'Format', type: 'select', options: [['png', 'PNG (beste Qualität, Transparenz)'], ['jpg', 'JPG (kleinere Datei)']] },
        ...(group.length > 1 ? [{ key: 'scope', label: 'Umfang', type: 'select', options: [['all', `Alle ${group.length} Slides`], ['one', 'Nur diese Slide']] }] : []),
        { key: 'post', label: 'Zusätzlich im Beitrag hinterlegen (optional)', type: 'select', options: [['', '– nein, nur herunterladen –'], ...S.posts.filter(p => p.status !== 'veroeffentlicht').map(p => [p.id, p.title])] },
      ],
    });
    if (!v) return;
    const list = v.scope === 'all' ? group : [f];
    const urls = [];
    toast('Exportiere …');
    try {
      for (const [n, fr] of list.entries()) {
        const url = await renderFrame(fr, v.fmt);
        const base = (fr.title || 'frame').replace(/[^\wäöüÄÖÜß -]+/g, '').trim().replace(/\s+/g, '-') || 'frame';
        const name = `${base}${list.length > 1 ? '' : ''}-${fr.export ? fr.export.w + 'x' + fr.export.h : 'export'}.${v.fmt}`;
        const a = document.createElement('a'); a.href = url; a.download = list.length > 1 ? `${String(n + 1).padStart(2, '0')}-${name}` : name; document.body.appendChild(a); a.click(); a.remove();
        if (v.post) { const blob = await (await fetch(url)).blob(); const up = await (await fetch('/api/media?name=' + encodeURIComponent(name), { method: 'POST', body: blob })).json(); urls.push(up.url); }
        await new Promise(r => setTimeout(r, 250));
      }
      if (v.post) {
        const post = byId('posts', v.post);
        const note = `${post.media_notes ? post.media_notes + '\n' : ''}${list.length > 1 ? 'Karussell' : 'Bild'}: ${urls.map(u => location.origin + u).join(' , ')}`;
        await DB.update('posts', post.id, { media_notes: note }, true);
      }
      toast(`${list.length > 1 ? list.length + ' Bilder' : 'Bild'} exportiert${v.post ? ' und im Beitrag hinterlegt' : ''}`);
    } catch (e) { console.error(e); toast((e && e.message) || 'Export fehlgeschlagen – bitte erneut versuchen'); }
  }
  function insertFrameTemplate(tpl, pos) {
    let fx, fy;
    if (pos) { fx = Math.round(pos.x - tpl.frame.w / 2); fy = Math.round(pos.y - tpl.frame.h / 2); }
    else if (data.items.length) { // rechts neben den vorhandenen Inhalt setzen
      const frames = data.items.filter(i => i.type === 'frame'); const ref = bbox(frames.length ? frames : data.items);
      fx = ref.x + ref.w + 100; fy = frames.length ? ref.y : Math.round(viewCenter().y - tpl.frame.h / 2);
    } else { const c = viewCenter(); fx = Math.round(c.x - tpl.frame.w / 2); fy = Math.round(c.y - tpl.frame.h / 2); }
    const map = {}; const groups = {};
    pushUndo();
    const frame = { ...JSON.parse(JSON.stringify(tpl.frame)), id: uid(), x: fx, y: fy };
    frame.title = frame.title || 'Frame'; delete frame.order;
    const items = tpl.items.map(i => { const n = JSON.parse(JSON.stringify(i)); n.id = uid(); if (i.id) map[i.id] = n.id; n.x = fx + i.x; n.y = fy + i.y; if (n.group) n.group = groups[n.group] ||= uid(); return n; });
    data.items.unshift(frame); data.items.push(...items);
    (tpl.connectors || []).forEach(k => { if (map[k.from] && map[k.to]) data.connectors.push({ ...k, id: uid(), from: map[k.from], to: map[k.to] }); });
    selected = frame.id; multi = [frame.id]; setTool('select'); render(); scheduleSave();
    world.style.transition = 'transform .5s ease'; data.view = viewFor(frame, 80); applyView();
    setTimeout(() => { world.style.transition = ''; }, 550);
  }
  async function saveFrameTemplate(f) {
    const v = await openForm({ title: 'Als Frame-Vorlage speichern', values: { name: f.title || 'Meine Vorlage' }, submitLabel: 'Speichern',
      extra: '<p class="muted small" style="margin:-6px 0 12px">Der Frame wird mit allen Elementen darin (inkl. Farben, Animationen und Verbindungen) gespeichert und steht dann in jedem Board unter „Frame“ zur Verfügung.</p>',
      fields: [{ key: 'name', label: 'Name der Vorlage', required: true }] });
    if (!v) return;
    const inner = data.items.filter(i => i.type !== 'frame' && inside(i, f));
    const ids = new Set(inner.map(i => i.id));
    const strip = o => { const c = JSON.parse(JSON.stringify(o)); return c; };
    const tpl = { id: uid(), name: v.name,
      frame: (() => { const c = strip(f); delete c.id; delete c.x; delete c.y; return c; })(),
      items: inner.map(i => { const c = strip(i); c.x = i.x - f.x; c.y = i.y - f.y; return c; }),
      connectors: data.connectors.filter(k => ids.has(k.from) && ids.has(k.to)).map(strip) };
    await setSetting('frameTemplates', [...getSetting('frameTemplates', []), tpl]);
    toast(`Vorlage „${v.name}“ gespeichert`);
  }
  async function manageFrameTemplates() {
    const own = getSetting('frameTemplates', []);
    const v = await choose('Eigene Frame-Vorlage löschen', own.map(t => ({ value: t.id, label: t.name, desc: 'Klicken zum Löschen', icon: 'trash-2' })));
    if (!v) return;
    const t = own.find(x => x.id === v);
    if (confirm(`Vorlage „${t.name}“ löschen?`)) { await setSetting('frameTemplates', own.filter(x => x.id !== v)); toast('Vorlage gelöscht'); }
  }

  function duplicate(it) {
    pushUndo();
    const c = { ...JSON.parse(JSON.stringify(it)), id: uid(), x: it.x + 30, y: it.y + 30 };
    data.items.push(c); selected = c.id; render(); scheduleSave();
  }
  function previewAnim(it) {
    const n = nodeOf(it.id); if (!n || !it.anim || it.anim === 'none') return;
    n.classList.remove(...[...n.classList].filter(c => c.startsWith('anim-')));
    void n.offsetWidth; n.classList.add('anim-' + it.anim);
    setTimeout(() => n.classList.remove('anim-' + it.anim), 1000);
  }

  function removeSelected(id = selected) {
    if (!id) return;
    if (multi.length > 1 && multi.includes(id)) {
      pushUndo(); const ids = new Set(multi);
      data.items = data.items.filter(i => !ids.has(i.id)); data.connectors = data.connectors.filter(c => !ids.has(c.from) && !ids.has(c.to));
      multi = []; selected = null; render(); scheduleSave(); return;
    }
    pushUndo();
    if (findLink(id)) data.connectors = data.connectors.filter(c => c.id !== id);
    else { data.items = data.items.filter(i => i.id !== id); data.connectors = data.connectors.filter(c => c.from !== id && c.to !== id); }
    if (selected === id) selected = null;
    render(); scheduleSave();
  }

  async function convert(it, what) {
    const [first, ...rest] = (it.text || '').trim().split('\n');
    let created;
    if (what === 'task') created = await editTask({}, { title: first, notes: rest.join('\n'), status: 'todo' });
    if (what === 'post') created = await editPost({}, { title: first, notes: rest.join('\n'), status: 'idee' });
    if (what === 'obj') created = await editObjective({ title: first, description: rest.join('\n') });
    if (!created) return;
    pushUndo();
    const kind = what === 'task' ? 'task' : what === 'post' ? 'post' : 'okr'; const def = EMBEDS[kind];
    const { x, y } = it;
    Object.keys(it).forEach(k => { if (k !== 'id') delete it[k]; });
    Object.assign(it, { type: 'embed', kind, cfg: { ref: created.id }, x, y, w: def.w, h: def.h });
    selected = it.id; render(); scheduleSave();
    toast('Umgewandelt – die Karte ist jetzt live mit dem Modul verknüpft');
  }
  async function linkItem(it) {
    const opts = [...S.tasks.map(t => [`tasks:${t.id}`, `Aufgabe · ${t.title}`]), ...S.posts.map(p => [`posts:${p.id}`, `Post · ${p.title}`]),
      ...S.objectives.map(o => [`objectives:${o.id}`, `Ziel · ${o.title}`])];
    if (!opts.length) return toast('Noch keine Einträge zum Verknüpfen vorhanden');
    const v = await openForm({ title: 'Mit Eintrag verknüpfen', submitLabel: 'Verknüpfen', values: { ref: it.link ? `${it.link.table}:${it.link.id}` : '' },
      fields: [{ key: 'ref', label: 'Eintrag', type: 'select', options: opts }] });
    if (!v) return;
    const [table, id] = v.ref.split(':'); pushUndo(); it.link = { table, id: Number(id) }; rerenderItem(it);
  }

  // =========================================================================
  // Präsentationsmodus
  // =========================================================================
  const P = { active: false, slides: [], si: 0, step: 0, extra: new Set(), fs: false };
  const isHiddenInPres = it => !!it.presHide;
  const revealable = it => it.type !== 'frame' && !it.presHide && ((it.anim && it.anim !== 'none') || it.cover);

  function buildSlides() {
    const frames = data.items.filter(i => i.type === 'frame')
      .map((f, idx) => ({ f, idx })).sort((a, b) => (a.f.order ?? 1e9) - (b.f.order ?? 1e9) || a.f.y - b.f.y || a.f.x - b.f.x || a.idx - b.idx).map(x => x.f);
    const others = data.items.filter(i => i.type !== 'frame');
    const slideOf = f => {
      const items = f ? others.filter(i => { const cx = i.x + i.w / 2, cy = i.y + i.h / 2; return cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h; }) : others;
      const steps = [...new Set(items.filter(revealable).map(i => i.step || 1))].sort((a, b) => a - b);
      return { frame: f, items, ids: new Set(items.map(i => i.id)), steps };
    };
    return frames.length ? frames.map(slideOf) : [slideOf(null)];
  }

  function startPresentation(fromFrameId) {
    if (!data.items.length) return toast('Das Board ist noch leer');
    commitSnap(); select(null); setTool('select');
    P.slides = buildSlides(); P.si = 0; P.step = 0; P.extra = new Set(); P.active = true; renderNav();
    if (fromFrameId) { const i = P.slides.findIndex(s => s.frame?.id === fromFrameId); if (i >= 0) P.si = i; }
    root.classList.add('presenting');
    P.fs = false;
    if (root.requestFullscreen) root.requestFullscreen().then(() => { P.fs = true; setTimeout(() => fly(false), 120); }).catch(() => {});
    P.saved = { ...data.view };
    applyPresentState(false); fly(false);
    if (!P.slides.some(s => s.frame)) toast('Tipp: Lege Frames (F) an – sie werden nacheinander als Folien gezeigt');
  }
  function stopPresentation() {
    setTimeout(renderNav, 0);
    P.active = false; root.classList.remove('presenting');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    world.style.transition = '';
    $$('.wb-item', world).forEach(n => {
      n.classList.remove('p-hidden', 'p-off', 'p-pending', 'p-covered', 'p-current');
      n.classList.remove(...[...n.classList].filter(c => c.startsWith('anim-')));
      n.querySelector('.p-cover')?.remove();
    });
    if (P.saved) data.view = P.saved;
    applyView(); drawLinks(); renderProps();
  }

  function applyPresentState(animate, justRevealed = []) {
    const slide = P.slides[P.si]; if (!slide) return;
    const revealedSteps = new Set(slide.steps.slice(0, P.step));
    data.items.forEach(it => {
      const n = nodeOf(it.id); if (!n) return;
      n.classList.toggle('p-hidden', !!it.presHide);
      const inSlide = it.type === 'frame' ? (!slide.frame || slide.frame.id === it.id) : (!slide.frame || slide.ids.has(it.id));
      n.classList.toggle('p-off', !inSlide);
      n.classList.toggle('p-current', it.type === 'frame' && inSlide);
      if (!inSlide || !revealable(it)) { n.classList.remove('p-pending'); n.querySelector('.p-cover')?.remove(); return; }
      const shown = revealedSteps.has(it.step || 1) || P.extra.has(it.id);
      const cover = n.querySelector('.p-cover');
      if (!shown) {
        if (it.cover) {
          n.classList.remove('p-pending');
          if (!cover) n.insertAdjacentHTML('beforeend', `<div class="p-cover" style="border-radius:${it.type === 'ellipse' ? '50%' : '10px'}"><span>${esc(it.coverText || '')}</span></div>`);
          else cover.classList.remove('out');
        } else { n.classList.add('p-pending'); cover?.remove(); }
        n.classList.remove(...[...n.classList].filter(c => c.startsWith('anim-')));
      } else {
        n.classList.remove('p-pending');
        const fresh = animate && justRevealed.includes(it.id);
        if (it.cover) {
          if (cover && fresh) { cover.classList.add('out'); setTimeout(() => cover.remove(), 650); } else cover?.remove();
        }
        if (fresh && it.anim && it.anim !== 'none') { n.classList.remove('anim-' + it.anim); void n.offsetWidth; n.classList.add('anim-' + it.anim); }
      }
    });
    drawLinks();
    const total = P.slides.length;
    $('.pres-info', root).textContent = `${slide.frame ? (slide.frame.title || 'Folie') + ' · ' : ''}${P.si + 1} / ${total}${slide.steps.length ? ` · Schritt ${P.step}/${slide.steps.length}` : ''}`;
  }

  function fly(animate = true) {
    const slide = P.slides[P.si];
    const box = slide.frame || (slide.items.length ? bbox(slide.items.filter(i => !i.presHide)) : { x: 0, y: 0, w: 800, h: 600 });
    world.style.transition = animate ? 'transform .75s cubic-bezier(.65,0,.25,1)' : '';
    data.view = viewFor(box, slide.frame ? 24 : 60, 0);
    applyView();
    if (animate) setTimeout(() => { world.style.transition = ''; }, 800);
  }

  function next() {
    const slide = P.slides[P.si];
    if (P.step < slide.steps.length) {
      const stepVal = slide.steps[P.step]; P.step++;
      const ids = slide.items.filter(i => revealable(i) && (i.step || 1) === stepVal && !P.extra.has(i.id)).map(i => i.id);
      applyPresentState(true, ids);
    } else if (P.si < P.slides.length - 1) { P.si++; P.step = 0; P.extra = new Set(); applyPresentState(false); fly(true); }
    else toast('Ende der Präsentation – Esc zum Beenden');
  }
  function prev() {
    if (P.step > 0) { P.step--; P.extra = new Set(); applyPresentState(false); }
    else if (P.si > 0) { P.si--; P.step = P.slides[P.si].steps.length; P.extra = new Set(); applyPresentState(false); fly(true); }
  }
  function presClick(e) {
    const g = e.target.closest('.wb-goto'); if (g) return jumpToFrame(g.dataset.goto);
    if (e.target.closest('.emb-body, iframe, .emb-btn, button, input, select, a')) return; // interaktive Elemente bedienbar lassen
    const coverNode = e.target.closest('.p-cover');
    if (coverNode) { // gezielt aufdecken
      const it = find(coverNode.closest('.wb-item').dataset.id);
      P.extra.add(it.id); applyPresentState(true, [it.id]); return;
    }
    if (e.button === 0) next();
  }
  function bindPresentation() {
    $$('[data-pres]', root).forEach(b => b.onclick = e => {
      e.stopPropagation();
      const a = b.dataset.pres;
      if (a === 'next') next(); if (a === 'prev') prev(); if (a === 'exit') stopPresentation(); if (a === 'timer') Timer.toggle();
    });
    window.addEventListener('resize', () => { if (P.active) fly(false); });
  }

  // =========================================================================
  // Timer & Stoppuhr (Zustand bleibt beim Wechseln der Ansicht erhalten)
  // =========================================================================
  const Timer = (() => {
    const T = { open: false, mode: 'timer', duration: 300, remaining: 300, running: false, endAt: 0,
      sw: { running: false, start: 0, acc: 0, laps: [] }, done: false };
    let el = null, host = null, tick = null;
    const fmt = (s, tenth) => {
      const neg = s < 0; s = Math.abs(s);
      const m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return `${neg ? '−' : ''}${pad(m)}:${pad(sec)}${tenth ? ',' + Math.floor((s * 10) % 10) : ''}`;
    };
    const remaining = () => T.running ? (T.endAt - Date.now()) / 1000 : T.remaining;
    const swTime = () => (T.sw.acc + (T.sw.running ? Date.now() - T.sw.start : 0)) / 1000;

    function beep() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.35, 0.7].forEach(t => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.value = 880; o.type = 'sine'; o.connect(g); g.connect(ctx.destination);
          g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.28);
          o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
        });
      } catch { /* kein Ton möglich */ }
    }
    function loop() {
      if (T.running && remaining() <= 0 && !T.done) {
        T.done = true; T.running = false; T.remaining = 0; beep(); toast('⏰ Die Zeit ist um!');
        el?.classList.add('ring');
      }
      update();
    }
    function ensureTick() { if (!tick) tick = setInterval(loop, 200); }

    function attach(r) { host = r; draw(); ensureTick(); }
    function detach() { el?.remove(); el = null; host = null; }
    function toggle() { T.open = !T.open; draw(); }

    function draw() {
      el?.remove(); el = null;
      if (!host || !T.open) { update(); return; }
      el = h(`<div class="wb-timer">
        <div class="tm-head"><div class="seg"><button data-m="timer" class="${T.mode === 'timer' ? 'on' : ''}">Timer</button><button data-m="sw" class="${T.mode === 'sw' ? 'on' : ''}">Stoppuhr</button></div>
          <button class="tm-x" data-t="close" title="Schließen">×</button></div>
        ${T.mode === 'timer' ? `
          <div class="tm-display" data-t="set" title="Klicken, um die Zeit einzustellen"></div>
          <div class="tm-bar"><i></i></div>
          <div class="tm-presets">${[1, 3, 5, 10, 15, 30].map(m => `<button class="chip ghost" data-preset="${m}">${m} min</button>`).join('')}</div>
          <div class="tm-ctrl"><button class="pbtn" data-t="minus">−1 min</button><button class="btn primary sm" data-t="start"></button><button class="pbtn" data-t="plus">+1 min</button><button class="pbtn" data-t="reset">Zurücksetzen</button></div>`
        : `
          <div class="tm-display sw"></div>
          <div class="tm-ctrl"><button class="btn primary sm" data-t="swstart"></button><button class="pbtn" data-t="lap">Runde</button><button class="pbtn" data-t="swreset">Zurücksetzen</button></div>
          <div class="tm-laps"></div>`}
      </div>`);
      el.onclick = e => action(e);
      host.appendChild(el); update();
    }
    async function action(e) {
      const b = e.target.closest('[data-m],[data-t],[data-preset]'); if (!b) return;
      const d = b.dataset;
      if (d.m) { T.mode = d.m; return draw(); }
      if (d.preset) { T.duration = T.remaining = Number(d.preset) * 60; T.running = false; T.done = false; el.classList.remove('ring'); }
      switch (d.t) {
        case 'close': T.open = false; return draw();
        case 'start':
          if (T.running) { T.remaining = remaining(); T.running = false; }
          else { if (T.remaining <= 0) T.remaining = T.duration; T.endAt = Date.now() + T.remaining * 1000; T.running = true; T.done = false; el.classList.remove('ring'); }
          break;
        case 'plus': case 'minus': {
          const delta = d.t === 'plus' ? 60 : -60;
          if (T.running) T.endAt = Math.max(Date.now(), T.endAt + delta * 1000); else T.remaining = Math.max(0, T.remaining + delta);
          T.duration = Math.max(T.duration, T.running ? remaining() : T.remaining); break;
        }
        case 'reset': T.running = false; T.remaining = T.duration; T.done = false; el.classList.remove('ring'); break;
        case 'set': {
          if (T.running) return;
          const v = await openForm({ title: 'Timer einstellen', values: { m: Math.floor(T.duration / 60), s: T.duration % 60 },
            fields: [{ key: 'm', label: 'Minuten', type: 'number', half: true }, { key: 's', label: 'Sekunden', type: 'number', half: true }] });
          if (v) { T.duration = T.remaining = Math.max(1, (v.m || 0) * 60 + (v.s || 0)); T.done = false; }
          break;
        }
        case 'swstart':
          if (T.sw.running) { T.sw.acc += Date.now() - T.sw.start; T.sw.running = false; } else { T.sw.start = Date.now(); T.sw.running = true; }
          break;
        case 'lap': if (swTime() > 0) T.sw.laps.unshift(swTime()); break;
        case 'swreset': T.sw = { running: false, start: 0, acc: 0, laps: [] }; break;
      }
      update();
    }
    function update() {
      const running = T.running || T.sw.running;
      // Kompakte Anzeige in der Präsentationsleiste
      const pt = host && $('.pres-timer span', host);
      if (pt) pt.textContent = T.running || T.done ? fmt(Math.max(0, remaining())) : T.sw.running ? fmt(swTime()) : '';
      const tb = host && $('[data-b=timer]', host);
      if (tb) tb.classList.toggle('active', running);
      if (!el) return;
      if (T.mode === 'timer') {
        const r = Math.max(0, remaining());
        $('.tm-display', el).textContent = fmt(Math.ceil(r));
        $('.tm-display', el).classList.toggle('low', T.running && r <= 10);
        $('.tm-bar i', el).style.width = (T.duration ? r / T.duration * 100 : 0) + '%';
        $('[data-t=start]', el).textContent = T.running ? 'Pause' : (T.remaining < T.duration && T.remaining > 0 ? 'Weiter' : 'Start');
      } else {
        $('.tm-display', el).textContent = fmt(swTime(), true);
        $('[data-t=swstart]', el).textContent = T.sw.running ? 'Stopp' : (T.sw.acc ? 'Weiter' : 'Start');
        const laps = $('.tm-laps', el);
        const html = T.sw.laps.map((l, i) => `<div><span>Runde ${T.sw.laps.length - i}</span><b>${fmt(l, true)}</b></div>`).join('');
        if (laps.innerHTML !== html) laps.innerHTML = html;
      }
    }
    return { attach, detach, toggle };
  })();

  // ---------- Icon-Bibliothek ---------------------------------------------
  const DE_EN = {
    ziel: 'target', ziele: 'target', rakete: 'rocket', idee: 'lightbulb', kamera: 'camera', foto: 'photo', bild: 'image',
    kalender: 'calendar', geld: 'money', herz: 'heart', stern: 'star', person: 'user', personen: 'users', team: 'users',
    pfeil: 'arrow', pfeile: 'arrow', uhr: 'clock', zeit: 'clock', haken: 'check', warnung: 'alert', buch: 'book',
    mikrofon: 'microphone', musik: 'music', telefon: 'phone', brief: 'mail', haus: 'home', suche: 'search',
    einstellungen: 'settings', diagramm: 'chart', grafik: 'chart', wachstum: 'trending up', erfolg: 'trophy', pokal: 'trophy',
    blitz: 'flash', feuer: 'fire', schloss: 'lock', schlüssel: 'key', welt: 'globe', ort: 'map pin', karte: 'map',
    sprechblase: 'chat', nachricht: 'message', kommentar: 'comment', daumen: 'thumb', video: 'video',
    film: 'film', schreiben: 'pen', stift: 'pencil', notiz: 'note', ordner: 'folder', datei: 'file', wolke: 'cloud',
    sonne: 'sun', mond: 'moon', essen: 'food', kaffee: 'coffee', reise: 'travel', auto: 'car', flugzeug: 'plane',
    einkauf: 'shopping', warenkorb: 'cart', geschenk: 'gift', lupe: 'search', glocke: 'bell', fahne: 'flag', flagge: 'flag',
    werkzeug: 'tool', zahnrad: 'cog', gehirn: 'brain', lernen: 'school', schule: 'school', sport: 'sport', yoga: 'yoga',
  };
  const ICON_STYLES = [['', 'Alle Stile'], ['lucide,tabler,ph,iconoir', 'Linien'], ['mdi,material-symbols,ri,fa6-solid', 'Gefüllt'],
    ['fluent-emoji-flat,noto,twemoji,openmoji', 'Bunt / Emoji'], ['logos,simple-icons,mdi', 'Marken & Logos']];
  const ICON_QUICK = [['Social Media', 'social'], ['Instagram', 'instagram'], ['Video', 'video'], ['Kamera', 'camera'], ['Ziel', 'target'],
    ['Wachstum', 'trending up'], ['Idee', 'lightbulb'], ['Personen', 'users'], ['Kalender', 'calendar'], ['Pfeile', 'arrow'],
    ['Diagramm', 'chart'], ['Geld', 'money'], ['Herz', 'heart'], ['Stern', 'star'], ['Rakete', 'rocket'], ['Chat', 'chat']];

  function openIconPicker(replaceItem) {
    let color = replaceItem?.color || '#7C3AED', style = '', query = 'social';
    const palette = [...new Set([...BRAND.filter(c => !['#FFFFFF', '#EDE9FE', '#D1FAE5', '#FFEDD5', '#FEF9C3', '#FCE7F3'].includes(c)), ...savedPalette()])];
    const el = h(`<div class="modal-backdrop"><div class="modal icon-modal">
      <h3>Icon-Bibliothek <small class="muted">über 200.000 Icons · Iconify</small></h3>
      <div class="icon-search">
        <input class="input" placeholder="Suchen, z. B. Rakete, camera, instagram …" value="">
        <select class="input">${ICON_STYLES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
        <div class="swatches">${palette.map(c => `<button class="sw ${c === color ? 'on' : ''}" style="background:${c}" data-c="${c}"></button>`).join('')}
          <label class="sw custom" style="background:${color}" title="Eigene Farbe"><input type="color" value="${toHex6(color)}" data-cc></label></div>
      </div>
      <div class="quick">${ICON_QUICK.map(([l, q]) => `<button class="chip ghost" data-q="${q}">${l}</button>`).join('')}</div>
      <div class="icon-grid"><div class="muted">Lade …</div></div>
      <div class="modal-actions"><span class="muted small">Klick auf ein Icon fügt es in die Mitte der Ansicht ein. Benötigt Internet.</span><span class="grow"></span><button class="btn ghost" data-act="cancel">Schließen</button></div>
    </div></div>`);
    const input = $('input.input', el), sel = $('select', el), grid = $('.icon-grid', el);
    const close = () => { el.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    el.addEventListener('mousedown', e => { if (e.target === el) close(); });
    $('[data-act=cancel]', el).onclick = close;
    let seq = 0;
    async function search() {
      const my = ++seq;
      const words = query.trim().toLowerCase().split(/\s+/).map(w => DE_EN[w] || w).join(' ');
      if (!words) return;
      grid.innerHTML = '<div class="muted">Suche …</div>';
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(words)}&limit=160${style ? `&prefixes=${style}` : ''}`);
        const json = await res.json(); if (my !== seq) return;
        const icons = json.icons || [];
        grid.innerHTML = icons.length ? icons.map(n => `<button class="icon-cell" data-icon="${n}" title="${n}"><img loading="lazy" src="${iconUrl(n, color)}" alt=""></button>`).join('')
          : '<div class="muted">Keine Treffer – versuche einen englischen Begriff.</div>';
      } catch { grid.innerHTML = '<div class="muted">Icons konnten nicht geladen werden. Besteht eine Internetverbindung?</div>'; }
    }
    const recolor = () => $$('.icon-cell', el).forEach(c => { $('img', c).src = iconUrl(c.dataset.icon, color); });
    let t; input.oninput = () => { clearTimeout(t); t = setTimeout(() => { query = input.value || 'social'; search(); }, 300); };
    sel.onchange = () => { style = sel.value; search(); };
    $$('[data-q]', el).forEach(b => b.onclick = () => { query = b.dataset.q; input.value = b.textContent; search(); });
    $$('[data-c]', el).forEach(b => b.onclick = () => { color = b.dataset.c; $$('[data-c]', el).forEach(x => x.classList.toggle('on', x === b)); recolor(); });
    $('[data-cc]', el).onchange = e => { color = e.target.value; e.target.parentElement.style.background = color; recolor(); };
    grid.onclick = e => {
      const c = e.target.closest('.icon-cell'); if (!c) return;
      if (replaceItem) { pushUndo(); replaceItem.icon = c.dataset.icon; replaceItem.color = color; close(); return rerenderItem(replaceItem); }
      const p = viewCenter(); const off = (data.items.length % 5) * 16;
      addItem({ type: 'icon', icon: c.dataset.icon, color, w: 72, h: 72, x: p.x - 36 + off, y: p.y - 36 + off });
      toast('Icon eingefügt');
    };
    $('#modal-root').appendChild(el); input.focus(); search();
  }

  // ---------- Bilder ------------------------------------------------------
  function addImageFile(file, pos, replaceItem) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400; const s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        const src = cv.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
        const w = Math.min(380, cv.width); const hh = Math.round(w * cv.height / cv.width);
        if (replaceItem && replaceItem.type === 'gallery') {
          const e2 = (replaceItem.entries || [])[replaceItem._pick]; delete replaceItem._pick; if (!e2) return;
          const s2 = Math.min(1, 900 / Math.max(img.width, img.height)); const cv2 = document.createElement('canvas'); cv2.width = Math.round(img.width * s2); cv2.height = Math.round(img.height * s2);
          cv2.getContext('2d').drawImage(img, 0, 0, cv2.width, cv2.height);
          pushUndo(); e2.src = cv2.toDataURL('image/jpeg', 0.85); updateVisual(replaceItem); refreshSummaries(); scheduleSave();
          if (!e2.cap) setTimeout(() => itemAction(replaceItem, `gl-cap:${replaceItem.entries.indexOf(e2)}`), 50);
          return toast('Bild hinterlegt – jetzt kurz beschreiben, was die KI daraus übernehmen soll');
        }
        if (replaceItem) {
          pushUndo();
          if (replaceItem.type === 'imgslot') { replaceItem.type = 'image'; replaceItem.caption = replaceItem.label; replaceItem.refImage = true; delete replaceItem.label; toast('Bild hinterlegt – denk daran, es später auch im KI-Tool hochzuladen'); }
          replaceItem.src = src; replaceItem.h = Math.round(replaceItem.w * cv.height / cv.width); rerenderItem(replaceItem); return refreshSummaries();
        }
        addItem({ type: 'image', src, w, h: hh }, pos);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  const busyField = () => (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) || document.activeElement?.isContentEditable;
  function copySelection(e, cut) {
    if (P.active || $('#modal-root').children.length || busyField()) return;
    const items = selItems(); if (!items.length) return;
    const ids = new Set(items.map(i => i.id));
    items.filter(i => i.type === 'frame').forEach(f => data.items.forEach(c => { if (c.type !== 'frame' && inside(c, f)) ids.add(c.id); }));
    const all = data.items.filter(i => ids.has(i.id));
    const payload = JSON.stringify({ items: all, connectors: data.connectors.filter(c => ids.has(c.from) && ids.has(c.to)) });
    e.preventDefault();
    e.clipboardData.setData('application/x-violet-board', payload);
    e.clipboardData.setData('text/plain', all.map(i => i.text || i.title || '').filter(Boolean).join('\n') || ' ');
    try { localStorage.setItem('vp-clip', payload); } catch { /* egal */ }
    if (cut) { pushUndo(); data.items = data.items.filter(i => !ids.has(i.id)); data.connectors = data.connectors.filter(c => !ids.has(c.from) && !ids.has(c.to)); multi = []; selected = null; render(); scheduleSave(); }
    toast(cut ? 'Ausgeschnitten' : `${all.length} Element${all.length > 1 ? 'e' : ''} kopiert`);
  }
  function pasteItems(payload, at) {
    const { items, connectors } = JSON.parse(payload); if (!items?.length) return;
    const b = bbox(items); const target = at || { x: b.x + 40, y: b.y + 40 };
    const dx = Math.round(target.x - (at ? b.w / 2 : 0) - b.x), dy = Math.round(target.y - (at ? b.h / 2 : 0) - b.y);
    const map = {}, groups = {};
    pushUndo();
    const copies = items.map(i => { const c = JSON.parse(JSON.stringify(i)); c.id = uid(); map[i.id] = c.id; c.x += dx; c.y += dy; delete c.locked; if (c.group) c.group = groups[c.group] ||= uid(); return c; });
    data.items.push(...copies.filter(c => c.type !== 'frame')); data.items.unshift(...copies.filter(c => c.type === 'frame'));
    (connectors || []).forEach(k => data.connectors.push({ ...k, id: uid(), from: map[k.from], to: map[k.to] }));
    multi = copies.map(c => c.id); selected = multi[multi.length - 1]; render(); scheduleSave();
  }
  function paste(e) {
    if (P.active || $('#modal-root').children.length || busyField()) return;
    const cd = e.clipboardData;
    const f = [...(cd?.items || [])].find(i => i.type.startsWith('image/'))?.getAsFile();
    if (f) { e.preventDefault(); return addImageFile(f, mouseInView() ? mouseWorld : null); }
    const own = cd?.getData('application/x-violet-board');
    if (own) { e.preventDefault(); return pasteItems(own, mouseInView() ? mouseWorld : null); }
    const txt = cd?.getData('text/plain')?.trim();
    if (txt) { // Text aus anderen Programmen → Notizen (eine pro Absatz, max. 20)
      e.preventDefault();
      const parts = txt.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).slice(0, 20);
      const p0 = mouseInView() ? mouseWorld : viewCenter(); pushUndo(); const ids = [];
      parts.forEach((t, n) => { const it = { id: uid(), ...CREATE.note({ x: p0.x + (n % 5) * 220, y: p0.y + Math.floor(n / 5) * 170 }), text: t }; it.x = Math.round(it.x); it.y = Math.round(it.y); data.items.push(it); ids.push(it.id); });
      multi = ids; selected = ids[ids.length - 1]; render(); scheduleSave(); toast(parts.length > 1 ? `${parts.length} Notizen aus Text erstellt` : 'Notiz aus Text erstellt');
    }
  }
  let lastMouse = { x: 0, y: 0 };
  const mouseInView = () => { const r = viewport.getBoundingClientRect(); return lastMouse.x > r.left && lastMouse.x < r.right && lastMouse.y > r.top && lastMouse.y < r.bottom; };

  function nudge(key, step) {
    const items = selItems().filter(i => !i.locked); if (!items.length) return;
    if (!nudge.t) pushUndo(); clearTimeout(nudge.t); nudge.t = setTimeout(() => { nudge.t = null; }, 600);
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[key];
    const moving = new Set(items.map(i => i.id));
    items.filter(i => i.type === 'frame').forEach(f => data.items.forEach(c => { if (c.type !== 'frame' && inside(c, f)) moving.add(c.id); }));
    moving.forEach(id => { const it = find(id); it.x += d[0]; it.y += d[1]; const n = nodeOf(id); if (n) place(n, it); });
    drawLinks(); drawHandles(); updateCtxBar(); scheduleSave();
  }
  function toggleLock() {
    const items = selItems(); if (!items.length) return;
    pushUndo(); const lock = !items.every(i => i.locked);
    items.forEach(i => { i.locked = lock; updateVisual(i); }); markSelection(); renderProps(); scheduleSave();
    toast(lock ? 'Gesperrt – kann nicht mehr verschoben werden' : 'Entsperrt');
  }

  // ---------- Kontextleiste (schwebend über der Auswahl) -------------------
  function updateCtxBar() {
    const bar = $('.wb-ctx', root); if (!bar) return;
    const items = selItems();
    const interactive = items.length === 1 && ['choice', 'features', 'palette', 'imgslot', 'summary', 'devlog', 'lane', 'proto', 'gallery'].includes(items[0].type); // dort würde die Leiste darüberliegende Listen verdecken
    if (!items.length || P.active || drag || tool !== 'select' || interactive) { bar.classList.add('hidden'); return; }
    const one = items.length === 1 ? items[0] : null;
    const key = items.map(i => i.id + (i.locked ? 'L' : '') + i.type).join(',');
    if (bar.dataset.key !== key) { bar.dataset.key = key; bar.innerHTML = ctxBarHTML(items, one); }
    bar.classList.remove('hidden');
    const b = bbox(items); const v = data.view; const vr = viewport.getBoundingClientRect(), rr = root.getBoundingClientRect();
    const cx = vr.left - rr.left + v.x + (b.x + b.w / 2) * v.z;
    let top = vr.top - rr.top + v.y + b.y * v.z - bar.offsetHeight - 30;
    if (top < vr.top - rr.top + 8) top = vr.top - rr.top + v.y + (b.y + b.h) * v.z + 34;
    bar.classList.remove('hidden');
    const half = bar.offsetWidth / 2 + 10;
    bar.style.left = Math.max(half + 60, Math.min(rr.width - half - (propsOpen && $('.wb-props', root) && !$('.wb-props', root).classList.contains('hidden') ? 290 : 0), cx)) + 'px'; bar.style.top = top + 'px';
  }
  function ctxBarHTML(items, one) {
    const textual = one && TEXTUAL.includes(one.type);
    const colorable = items.some(i => SHAPES.includes(i.type) || ['note', 'text', 'icon', 'frame'].includes(i.type));
    const locked = items.every(i => i.locked);
    const quick = QUICK_COLORS.slice(0, 7);
    return `${textual ? `<button class="cb" data-cb="edit" title="Text bearbeiten (Enter oder einfach lostippen)">${ic('pencil', '#4B4563', 'ic sm')}<span>Text</span></button><i class="cb-sep"></i>` : ''}
      ${one?.type === 'design' ? `<button class="cb" data-cb="design" title="Inhalt bearbeiten">${ic('pencil', '#4B4563', 'ic sm')}<span>Inhalt</span></button><i class="cb-sep"></i>` : ''}
      ${one?.type === 'choice' ? `<button class="cb" data-cb="choice" title="Optionen bearbeiten (Doppelklick)">${ic('list-checks', '#4B4563', 'ic sm')}<span>Optionen</span></button><i class="cb-sep"></i>` : ''}
      ${one?.type === 'summary' ? `<button class="cb" data-cb="prompt" title="Prompt kopieren">${ic('copy', '#4B4563', 'ic sm')}<span>Prompt kopieren</span></button><i class="cb-sep"></i>` : ''}
      ${one?.type === 'html' ? `<button class="cb" data-cb="html" title="Code bearbeiten">${ic('code-xml', '#4B4563', 'ic sm')}<span>Code</span></button><i class="cb-sep"></i>` : ''}
      ${one?.type === 'frame' ? `<button class="cb" data-cb="export" title="Frame als Bild exportieren">${ic('download', '#4B4563', 'ic sm')}<span>Export</span></button><i class="cb-sep"></i>` : ''}
      ${colorable ? `${quick.map(([f, s2]) => `<button class="qc" data-cbq="${f}|${s2}" style="--f:${f};--s:${s2}" title="Farbe"></button>`).join('')}
        <label class="sw custom cb-custom" title="Eigene Farbe"><input type="color" data-cbc value="#7C3AED"></label><i class="cb-sep"></i>` : ''}
      ${textual ? `<button class="cb" data-cb="fs-" title="Schrift kleiner">A−</button><button class="cb" data-cb="fs+" title="Schrift größer">A+</button><button class="cb ${one.bold ? 'on' : ''}" data-cb="bold" title="Fett"><b>B</b></button><i class="cb-sep"></i>` : ''}
      ${items.length > 1 ? `<button class="cb" data-cb="group" title="Gruppieren (Strg+G)">${ic('group', '#4B4563', 'ic sm')}</button><button class="cb" data-cb="dist-h" title="Horizontal gleich verteilen">${ic('align-horizontal-space-between', '#4B4563', 'ic sm')}</button><button class="cb" data-cb="dist-v" title="Vertikal gleich verteilen">${ic('align-vertical-space-between', '#4B4563', 'ic sm')}</button><i class="cb-sep"></i>` : ''}
      ${one && one.type !== 'frame' ? `<button class="cb" data-cb="rot90" title="90° drehen (oder am ⟳-Griff ziehen)">${ic('rotate-cw', '#4B4563', 'ic sm')}</button>` : ''}
      <button class="cb" data-cb="dup" title="Duplizieren (Strg+D)">${ic('copy', '#4B4563', 'ic sm')}</button>
      <button class="cb ${locked ? 'on' : ''}" data-cb="lock" title="${locked ? 'Entsperren' : 'Sperren'} (Strg+L)">${ic(locked ? 'lock' : 'lock-open', '#4B4563', 'ic sm')}</button>
      <button class="cb" data-cb="delete" title="Löschen (Entf)">${ic('trash-2', '#EF4444', 'ic sm')}</button>
      <button class="cb ${propsOpen ? 'on' : ''}" data-cb="props" title="Alle Eigenschaften ein-/ausblenden">${ic('sliders-horizontal', '#4B4563', 'ic sm')}</button>`;
  }
  function bindCtxBar() {
    const bar = $('.wb-ctx', root);
    bar.addEventListener('pointerdown', e => e.stopPropagation());
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-cb],[data-cbq]'); if (!b) return;
      const items = selItems(); const one = items.length === 1 ? items[0] : null;
      if (b.dataset.cbq) {
        pushUndo(); items.forEach(i => applyQuick(i, b.dataset.cbq.split('|'))); lastShapeColors = b.dataset.cbq.split('|');
        items.forEach(updateVisual); markSelection(); renderProps(); return scheduleSave();
      }
      switch (b.dataset.cb) {
        case 'edit': return editText(one.id, { selectAll: true });
        case 'design': return editDesignContent(one);
        case 'html': return editHtml(one);
        case 'choice': return editChoice(one);
        case 'prompt': return copyPrompt(one);
        case 'export': return openFrameExport(one);
        case 'fs-': case 'fs+': pushUndo(); one.fs = clamp((one.fs || (one.type === 'text' ? 22 : 16)) + (b.dataset.cb === 'fs+' ? 2 : -2), 8, 160); return rerenderItem(one);
        case 'bold': pushUndo(); one.bold = !one.bold; bar.dataset.key = ''; return rerenderItem(one);
        case 'group': return multiAction('group');
        case 'dist-h': case 'dist-v': return multiAction(b.dataset.cb);
        case 'rot90': pushUndo(); one.rot = (((one.rot || 0) + 90 + 180) % 360) - 180; rerenderItem(one); return drawHandles();
        case 'dup': return items.length > 1 ? multiAction('dup') : duplicate(one);
        case 'lock': bar.dataset.key = ''; return toggleLock();
        case 'delete': if (items.some(i => i.locked)) return toast('Gesperrte Elemente zuerst entsperren'); return removeSelected(items[0].id);
        case 'props': propsOpen = !propsOpen; try { localStorage.setItem('vp-props', propsOpen ? '1' : '0'); } catch { /* egal */ } bar.dataset.key = ''; renderProps(); return updateCtxBar();
      }
    });
    bar.addEventListener('change', e => {
      if (!e.target.dataset.cbc && e.target.dataset.cbc !== '') return;
      const c = e.target.value; const items = selItems(); pushUndo();
      items.forEach(i => { if (SHAPES.includes(i.type)) setColor(i, 'fillColor', c); else if (i.type === 'note' || i.type === 'frame') { i.color = c; if (i.type === 'note') i.textColor = contrastText(c); } else i.color = c; updateVisual(i); });
      markSelection(); renderProps(); scheduleSave();
    });
  }

  // ---------- Verbindungspunkte (zum Verbinden ziehen) --------------------
  function drawHandles() {
    $$('.wb-handle', world).forEach(n => n.remove());
    const it = multi.length <= 1 && selected ? find(selected) : null;
    if (!it || it.type === 'frame' || P.active || tool !== 'select' || drag) return;
    if (data.view.z < 0.45) return; // bei starkem Herauszoomen würden die Punkte Nachbarelemente verdecken
    const o = 22 / data.view.z; // fester Abstand in Bildschirm-Pixeln, unabhängig vom Zoom
    [['n', it.x + it.w / 2, it.y - o], ['e', it.x + it.w + o, it.y + it.h / 2], ['s', it.x + it.w / 2, it.y + it.h + o], ['w', it.x - o, it.y + it.h / 2]].forEach(([dir, x, y]) => {
      const hd = document.createElement('div'); hd.className = 'wb-handle'; hd.dataset.dir = dir; hd.title = 'Ziehen zum Verbinden · Klicken für neues verbundenes Element';
      hd.style.left = x + 'px'; hd.style.top = y + 'px'; hd.style.transform = `translate(-50%,-50%) scale(${1 / data.view.z})`;
      world.appendChild(hd);
    });
    if (it.locked || it.type === 'draw' && false) return;
    const rh = document.createElement('div'); rh.className = 'wb-handle rot'; rh.title = 'Ziehen zum Drehen (Shift = 15°-Schritte)';
    rh.style.left = (it.x + it.w + o) + 'px'; rh.style.top = (it.y - o) + 'px'; rh.style.transform = `translate(-50%,-50%) scale(${1 / data.view.z})`;
    world.appendChild(rh);
  }
  function startLinkDrag(e, dir) {
    const src = find(selected); const z = data.view.z;
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'line'); tmp.setAttribute('class', 'wb-temp-link'); svg.appendChild(tmp);
    const cx = src.x + src.w / 2, cy = src.y + src.h / 2;
    tmp.setAttribute('x1', cx); tmp.setAttribute('y1', cy); tmp.setAttribute('x2', cx); tmp.setAttribute('y2', cy);
    let moved = false; const sx = e.clientX, sy = e.clientY;
    try { viewport.setPointerCapture(e.pointerId); } catch { /* synthetisches Ereignis */ }
    const mv = ev => { if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 4) moved = true; const p = toWorld(ev.clientX, ev.clientY); tmp.setAttribute('x2', p.x); tmp.setAttribute('y2', p.y); };
    const up = ev => {
      viewport.removeEventListener('pointermove', mv); viewport.removeEventListener('pointerup', up); tmp.remove();
      const under = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.wb-item');
      const target = under && under.dataset.id !== src.id ? find(under.dataset.id) : null;
      pushUndo();
      if (target && target.type !== 'frame') { data.connectors.push({ id: uid(), from: src.id, to: target.id, color: '#7C3AED' }); drawLinks(); scheduleSave(); return; }
      // neues Element in Zugrichtung (Klick) bzw. an der Mausposition (Ziehen) anlegen
      const gap = 80; const p = toWorld(ev.clientX, ev.clientY);
      const base = TEXTUAL.includes(src.type) && src.type !== 'text' ? JSON.parse(JSON.stringify(src)) : { ...CREATE.note({ x: 0, y: 0 }) };
      delete base.link; delete base.locked; delete base.group; delete base.anim; delete base.cover; delete base.presHide;
      const n = { ...base, id: uid(), text: '', w: base.w || 200, h: base.h || 150 };
      if (moved) { n.x = Math.round(p.x - n.w / 2); n.y = Math.round(p.y - n.h / 2); }
      else { const off = { n: [0, -(n.h + gap)], s: [0, src.h + gap], e: [src.w + gap, 0], w: [-(n.w + gap), 0] }[dir]; n.x = src.x + off[0] + (dir === 'n' || dir === 's' ? (src.w - n.w) / 2 : 0); n.y = src.y + off[1] + (dir === 'e' || dir === 'w' ? (src.h - n.h) / 2 : 0); }
      data.items.push(n); data.connectors.push({ id: uid(), from: src.id, to: n.id, color: '#7C3AED' });
      selected = n.id; multi = [n.id]; render(); scheduleSave(); editText(n.id);
    };
    viewport.addEventListener('pointermove', mv); viewport.addEventListener('pointerup', up);
  }

  // ---------- Bereiche ein-/ausblenden ------------------------------------
  function applyUi() {
    if (!root) return;
    root.classList.toggle('tools-hidden', !uiPrefs.tools);
    root.classList.toggle('toc-open', !!uiPrefs.toc);
    $('[data-b=tools]', root)?.classList.toggle('on', !!uiPrefs.tools);
    $('[data-b=toc]', root)?.classList.toggle('on', !!uiPrefs.toc);
    $('[data-b=propsp]', root)?.classList.toggle('on', !!propsOpen);
    $('[data-b=nav]', root)?.classList.toggle('on', uiPrefs.nav !== false);
    refreshToc(); renderNav();
  }

  // ---------- Inhaltsverzeichnis ------------------------------------------
  const framesOrdered = () => data.items.filter(i => i.type === 'frame').map((f, idx) => ({ f, idx }))
    .sort((a, b) => (a.f.order ?? 1e9) - (b.f.order ?? 1e9) || a.f.y - b.f.y || a.f.x - b.f.x || a.idx - b.idx).map(x => x.f);
  function refreshToc() {
    const box = root && $('.wb-toc', root); if (!box || !uiPrefs.toc) return;
    const frames = framesOrdered(); const q = (box.__q || '').toLowerCase(); refreshToc.lastLane = null;
    const heads = data.items.filter(i => i.type === 'text' && (i.fs || 22) >= 28 && (i.text || '').trim());
    const list = frames.filter(f => !q || (f.title || '').toLowerCase().includes(q));
    const st = $('.toc-list', box)?.scrollTop || 0;
    box.innerHTML = `<div class="toc-head"><b>Inhalt</b><span class="muted small">${frames.length} Frames</span><button class="props-close" data-toc-close title="Schließen">×</button></div>
      <input class="input sm toc-search" placeholder="Frames suchen …" value="${esc(box.__q || '')}">
      <div class="toc-list">${list.map((f, i) => { const n = data.items.filter(c => c.type !== 'frame' && c.type !== 'lane' && inside(c, f)).length;
        const ln = data.items.find(l => l.type === 'lane' && !l.guide && inside(f, l)); let head = '';
        if (ln && ln !== refreshToc.lastLane) head = `<div class="toc-sub toc-lane" data-toc-el="${ln.id}" style="--lc:${ln.c}">${esc(ln.ic || '')} Phase ${ln.no} · ${esc(ln.t)}</div>`;
        refreshToc.lastLane = ln || null;
        return head + `<div class="toc-item ${multi.includes(f.id) ? 'on' : ''}" data-toc="${f.id}"><span class="toc-n">${frames.indexOf(f) + 1}</span><span class="toc-t">${esc(f.title || 'Frame')}<small>${n} Elemente${f.export ? ` · ${f.export.w}×${f.export.h}` : ''}</small></span>
          <span class="toc-mv"><button data-toc-up="${f.id}" title="Nach oben (Reihenfolge für Präsentation)">▲</button><button data-toc-down="${f.id}" title="Nach unten">▼</button></span></div>`; }).join('') || '<div class="muted small" style="padding:10px">Noch keine Frames. Lege welche mit F an.</div>'}
      ${heads.length && !q ? `<div class="toc-sub">Überschriften</div>${heads.map(t2 => `<div class="toc-item head" data-toc-el="${t2.id}"><span class="toc-n">#</span><span class="toc-t">${esc(t2.text.split('\n')[0])}</span></div>`).join('')}` : ''}</div>
      <div class="toc-foot"><button class="pbtn wide" data-toc-all>Alles anzeigen</button></div>`;
    $('.toc-list', box).scrollTop = st;
    const inp = $('.toc-search', box);
    inp.oninput = () => { box.__q = inp.value; refreshToc(); const i2 = $('.toc-search', box); i2.focus(); i2.setSelectionRange(i2.value.length, i2.value.length); };
    if (!box.__bound) {
      box.__bound = true;
      box.addEventListener('pointerdown', e => e.stopPropagation());
      box.addEventListener('click', e => {
        const b = e.target.closest('[data-toc],[data-toc-up],[data-toc-down],[data-toc-close],[data-toc-all],[data-toc-el]'); if (!b) return;
        const d = b.dataset;
        if (d.tocClose !== undefined) { uiPrefs.toc = false; saveUi(); return applyUi(); }
        if (d.tocAll !== undefined) return fit();
        if (d.tocUp || d.tocDown) {
          e.stopPropagation(); const fr = framesOrdered(); const id = d.tocUp || d.tocDown; const i = fr.findIndex(f => f.id === id); const j = d.tocUp ? i - 1 : i + 1;
          if (j < 0 || j >= fr.length) return; pushUndo(); [fr[i], fr[j]] = [fr[j], fr[i]]; fr.forEach((f, k) => { f.order = k + 1; }); scheduleSave(); return refreshToc();
        }
        if (d.tocEl) { const it = find(d.tocEl); if (it) { flyTo(it.type === 'lane' ? { x: it.x, y: it.y, w: it.w, h: Math.min(it.h, it.w * 1.15) } : it, it.type === 'lane' ? 40 : 120); if (it.type !== 'lane') select(it.id); } return; }
        if (d.toc) { const f = find(d.toc); flyTo(f, 40); select(f.id); }
      });
    }
  }
  // ---------- Navigationskonsole (Phasen →, Schritte ↓) ----------------------
  let navPos = null, navLockUntil = 0;
  const navLanes = () => data.items.filter(l => l.type === 'lane' && !l.guide).sort((a, b) => a.x - b.x);
  const navFrames = lane => data.items.filter(f => f.type === 'frame' && inside(f, lane)).sort((a, b) => a.y - b.y);
  function navFromView() {
    const lanes = navLanes(); if (!lanes.length) return null;
    const r = viewport.getBoundingClientRect(); const c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
    if (r.width / data.view.z > lanes[0].w * 2.6) return { li: -1, fi: -1, all: true };
    let li = lanes.findIndex(l => c.x >= l.x && c.x <= l.x + l.w);
    if (li < 0) { if (c.y < lanes[0].y) return { li: -1, fi: -1 }; li = lanes.reduce((bi, l, i) => Math.abs(l.x + l.w / 2 - c.x) < Math.abs(lanes[bi].x + lanes[bi].w / 2 - c.x) ? i : bi, 0); }
    if (c.y < lanes[li].y - 100) return { li: -1, fi: -1 };
    const fr = navFrames(lanes[li]); let fi = fr.findIndex(f => c.y >= f.y - 40 && c.y <= f.y + f.h + 40);
    if (fi < 0) fi = c.y < (fr[0]?.y ?? 0) ? -1 : fr.length - 1;
    if (fi === 0 && c.y < fr[0].y + 60) fi = -1;
    return { li, fi };
  }
  function navGo(li, fi) {
    const lanes = navLanes(); if (!lanes.length) return;
    navPos = { li, fi }; navLockUntil = Date.now() + 900;
    if (li < 0) { // Start: Kopfbereich oben, darunter der Anfang der Phasen
      const head = data.items.filter(i => i.type !== 'lane' && i.y < lanes[0].y - 20); const hb = head.length ? bbox(head) : { x: lanes[0].x, y: lanes[0].y, w: lanes[0].w, h: 300 };
      const r = viewport.getBoundingClientRect(); const w = Math.max(hb.w, lanes[Math.min(4, lanes.length - 1)].x + lanes[0].w - hb.x);
      flyTo({ x: hb.x, y: hb.y - 40, w, h: w * (r.height - 120) / Math.max(200, r.width - 120 - (uiPrefs.toc ? 300 : 50)) }, 60); }
    else {
      const lane = lanes[li], fr = navFrames(lane);
      if (fi < 0 || !fr[fi]) flyTo({ x: lane.x, y: lane.y, w: lane.w, h: Math.min(lane.h, lane.w * 1.15) }, 40);
      else { // Schritt: Frame-Anfang in gut lesbarer Größe (max. 110 %) zeigen
        const f = fr[fi], r = viewport.getBoundingClientRect(), zMax = 1.1;
        const w = Math.max(f.w + 40, (r.width - 60 - (uiPrefs.toc ? 300 : 50)) / zMax), h = Math.max(Math.min(f.h + 70, (f.w + 40) * 1.25), (r.height - 60) / zMax);
        const hh = Math.min(h, Math.max(f.h + 70, (r.height - 60) / zMax));
        flyTo({ x: f.x + f.w / 2 - w / 2, y: f.y - 50, w, h: hh }, 30); }
    }
    updateNavLabel();
  }
  function navMove(dir) {
    const lanes = navLanes(); if (!lanes.length) return;
    let { li, fi } = navPos || navFromView() || { li: -1, fi: -1 };
    if (dir === 'home') return navGo(-1, -1);
    if (dir === 'right') return navGo(Math.min(li + 1, lanes.length - 1), -1);
    if (dir === 'left') return navGo(Math.max(li - 1, -1), -1);
    if (li < 0) return dir === 'down' ? navGo(0, -1) : navGo(-1, -1);
    const n = navFrames(lanes[li]).length;
    if (dir === 'down') { if (fi + 1 < n) return navGo(li, fi + 1); if (li + 1 < lanes.length) { toast(`Weiter mit Phase ${li + 2}: ${lanes[li + 1].t}`); return navGo(li + 1, -1); } return toast('Ende erreicht – die App ist live? 🎉'); }
    if (dir === 'up') { if (fi >= 0) return navGo(li, fi - 1); if (li > 0) return navGo(li - 1, navFrames(lanes[li - 1]).length - 1); return navGo(-1, -1); }
  }
  function renderNav() {
    const box = root && $('.wb-nav', root); if (!box) return;
    const lanes = navLanes(); const show = lanes.length && uiPrefs.nav !== false && !P.active;
    box.classList.toggle('hidden', !show); if (!show) return;
    box.classList.toggle('nav-collapsed', !!uiPrefs.navMini);
    box.innerHTML = `<div class="nav-top"><span class="nav-title">Navigation</span><button data-nav="mini" title="${uiPrefs.navMini ? 'Aufklappen' : 'Einklappen'}">${uiPrefs.navMini ? '▴' : '▾'}</button><button data-nav="close" title="Ausblenden (über „Navigation“ oben wieder einblenden)">×</button></div>
      <div class="nav-where"><i></i><div><small></small><b></b></div></div>
      <div class="nav-body">
        <div class="nav-pad">
          <button class="np-up" data-nav="up" title="Vorheriger Schritt (↑)">▲</button>
          <button class="np-left" data-nav="left" title="Vorherige Phase (←)">◀</button>
          <button class="np-home" data-nav="home" title="Zum Anfang / Übersicht">⌂</button>
          <button class="np-right" data-nav="right" title="Nächste Phase (→)">▶</button>
          <button class="np-down" data-nav="down" title="Nächster Schritt (↓)">▼</button>
        </div>
        <div class="nav-side">
          <div class="nav-dots">${lanes.map((l, i) => `<button data-nav="lane:${i}" style="--lc:${l.c}" title="Phase ${l.no}: ${esc(l.t)}">${esc(l.ic || String(i + 1))}</button>`).join('')}</div>
          <div class="nav-steps"></div>
          <div class="nav-keys">Pfeiltasten: ← → Phase · ↑ ↓ Schritt</div>
        </div>
      </div>`;
    if (!box.__bound) {
      box.__bound = true;
      box.addEventListener('pointerdown', e => e.stopPropagation());
      box.addEventListener('click', e => {
        const b = e.target.closest('[data-nav]'); if (!b) return; const v = b.dataset.nav;
        if (v === 'close') { uiPrefs.nav = false; saveUi(); return applyUi(); }
        if (v === 'mini') { uiPrefs.navMini = !uiPrefs.navMini; saveUi(); return renderNav(); }
        if (v.startsWith('lane:')) return navGo(+v.slice(5), -1);
        if (v.startsWith('step:')) { const [li, fi] = v.slice(5).split(',').map(Number); return navGo(li, fi); }
        navMove(v);
      });
    }
    updateNavLabel();
  }
  function updateNavLabel() {
    const box = root && $('.wb-nav', root); if (!box || box.classList.contains('hidden')) return;
    const lanes = navLanes(); const pos = navPos || { li: -1, fi: -1 };
    const lane = lanes[pos.li]; const fr = lane ? navFrames(lane) : [];
    const ic2 = $('.nav-where i', box), sm = $('.nav-where small', box), bb = $('.nav-where b', box);
    box.style.setProperty('--lc', lane ? lane.c : '#7C3AED');
    if (!lane) { ic2.textContent = pos.all ? '🗺️' : '🏁'; sm.textContent = pos.all ? 'Gesamtansicht' : 'Start'; bb.textContent = pos.all ? '▼ oder ▶ drücken, um bei Phase 1 zu starten' : 'Übersicht & Anleitung'; }
    else { ic2.textContent = lane.ic || ''; sm.textContent = `Phase ${lane.no} von ${lanes.length}${pos.fi >= 0 ? ` · Schritt ${pos.fi + 1}/${fr.length}` : ''}`; bb.textContent = pos.fi >= 0 && fr[pos.fi] ? (fr[pos.fi].title || '').replace(/^[\d.]+ · /, '') : lane.t; }
    $$('.nav-dots button', box).forEach((b, i) => { b.classList.toggle('on', i === pos.li); b.classList.toggle('done', i < pos.li); });
    const st = $('.nav-steps', box); if (st) st.innerHTML = lane ? fr.map((f, i) => `<button data-nav="step:${pos.li},${i}" class="${i === pos.fi ? 'on' : ''}" title="${esc(f.title || '')}">${i + 1}</button>`).join('') : '';
    const lim = (sel, dis) => { const b = $(sel, box); if (b) b.disabled = dis; };
    lim('.np-left', pos.li < 0); lim('.np-right', pos.li >= lanes.length - 1); lim('.np-up', pos.li < 0);
  }
  function flyTo(box, pad = 60) {
    world.style.transition = 'transform .55s cubic-bezier(.65,0,.25,1)';
    data.view = viewFor(box, pad, uiPrefs.toc ? 300 : 50); applyView(); scheduleSave();
    setTimeout(() => { world.style.transition = ''; }, 600);
  }

  // ---------- Sprung-Links zwischen Frames --------------------------------
  let backView = null;
  function jumpToFrame(id) {
    const f = find(id); if (!f) return toast('Ziel-Frame existiert nicht mehr');
    if (P.active) { const i = P.slides.findIndex(sl => sl.frame?.id === id); if (i >= 0) { P.si = i; P.step = 0; P.extra = new Set(); applyPresentState(false); fly(true); } return; }
    backView = { ...data.view }; flyTo(f, 40); select(f.id);
    $('.wb-back', root)?.remove();
    const bk = h(`<button class="wb-back">↩ Zurück</button>`); root.appendChild(bk);
    bk.onclick = () => { world.style.transition = 'transform .5s ease'; data.view = backView; applyView(); setTimeout(() => { world.style.transition = ''; }, 550); bk.remove(); };
    setTimeout(() => bk.remove(), 12000);
  }

  // ---------- Drehen per Griff --------------------------------------------
  function startRotate(e) {
    const it = find(selected); if (!it || it.locked) return;
    const node = nodeOf(it.id); const r = node.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2; pushUndo();
    try { viewport.setPointerCapture(e.pointerId); } catch { /* egal */ }
    $$('.wb-handle', world).forEach(n => n.remove()); $('.wb-ctx', root).classList.add('hidden');
    const tip = h('<div class="rot-tip"></div>'); root.appendChild(tip);
    const mv = ev => {
      let a = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90;
      a = ((a + 540) % 360) - 180; if (ev.shiftKey) a = Math.round(a / 15) * 15; else if (Math.abs(a % 90) < 4 || Math.abs(a % 90) > 86) a = Math.round(a / 90) * 90;
      it.rot = Math.round(a); node.style.transform = `rotate(${it.rot}deg)`;
      const rr = root.getBoundingClientRect(); tip.textContent = it.rot + '°'; tip.style.left = (ev.clientX - rr.left + 14) + 'px'; tip.style.top = (ev.clientY - rr.top + 14) + 'px';
    };
    const up = () => { viewport.removeEventListener('pointermove', mv); viewport.removeEventListener('pointerup', up); tip.remove(); drawHandles(); updateCtxBar(); renderProps(); scheduleSave(); };
    viewport.addEventListener('pointermove', mv); viewport.addEventListener('pointerup', up);
  }

  // ---------- Rechtsklick-Menü --------------------------------------------
  function closeMenus() { $$('.wb-menu', root).forEach(m => m.remove()); }
  function openContextMenu(e) {
    if (P.active) return; e.preventDefault(); closeMenus();
    if (e.ctrlKey && e.button === 0) return; // Mac: Ctrl+Klick dient der Mehrfachauswahl, kein Menü
    const tgt = document.elementFromPoint(e.clientX, e.clientY);
    let node = tgt?.closest('.wb-item'); if (node?.classList.contains('wb-frame') && !tgt.closest('.frame-title')) node = null;
    const pt = toWorld(e.clientX, e.clientY);
    if (node && !multi.includes(node.dataset.id)) { const it = find(node.dataset.id); it.group ? selectMany(groupMembers(it)) : select(it.id); }
    if (!node && !addKey(e)) select(null);
    const items = selItems(); const one = items.length === 1 ? items[0] : null;
    const entries = items.length ? [
      one && TEXTUAL.includes(one.type) && ['edit', 'pencil', 'Text bearbeiten', 'Enter'],
      one?.type === 'frame' && ['export', 'download', 'Als Bild exportieren', ''],
      ['copy', 'copy', 'Kopieren', 'Strg+C'], ['cut', 'scissors', 'Ausschneiden', 'Strg+X'], ['dup', 'copy-plus', 'Duplizieren', 'Strg+D'], '-',
      ['front', 'bring-to-front', 'Nach vorn', ''], ['back', 'send-to-back', 'Nach hinten', ''],
      items.length > 1 && ['group', 'group', 'Gruppieren', 'Strg+G'], items.some(i => i.group) && ['ungroup', 'ungroup', 'Gruppierung aufheben', 'Strg+Shift+G'],
      items.length > 1 && ['frame', 'frame', 'In Frame packen', ''],
      ['lock', items.every(i => i.locked) ? 'lock-open' : 'lock', items.every(i => i.locked) ? 'Entsperren' : 'Sperren', 'Strg+L'], '-',
      ['delete', 'trash-2', 'Löschen', 'Entf'],
    ] : [
      ['paste', 'clipboard-paste', 'Einfügen', 'Strg+V'], ['note', 'sticky-note', 'Notiz hier', 'Doppelklick'], ['text', 'type', 'Text hier', ''],
      ['frameHere', 'frame', 'Frame / Social-Post hier …', 'F'], '-', ['all', 'box-select', 'Alles auswählen', 'Strg+A'], ['fit', 'maximize', 'Alles einpassen', '0'], ['help', 'keyboard', 'Tastenkürzel', '?'],
    ];
    const m = h(`<div class="wb-menu">${entries.filter(Boolean).map(x => x === '-' ? '<i class="m-sep"></i>' : `<button data-mn="${x[0]}">${ic(x[1], x[0] === 'delete' ? '#EF4444' : '#4B4563', 'ic sm')}<span>${x[2]}</span><kbd>${x[3]}</kbd></button>`).join('')}</div>`);
    const rr = root.getBoundingClientRect();
    m.style.left = Math.min(e.clientX - rr.left, rr.width - 250) + 'px'; m.style.top = Math.min(e.clientY - rr.top, rr.height - 40 - entries.length * 34) + 'px';
    m.addEventListener('pointerdown', ev => ev.stopPropagation());
    m.onclick = async ev => {
      const b = ev.target.closest('[data-mn]'); if (!b) return; closeMenus();
      switch (b.dataset.mn) {
        case 'edit': return editText(one.id, { selectAll: true });
        case 'export': return openFrameExport(one);
        case 'copy': case 'cut': {
          const payloadEv = { preventDefault() {}, clipboardData: { data: {}, setData(k, v) { this.data[k] = v; } } };
          copySelection(payloadEv, b.dataset.mn === 'cut');
          try { await navigator.clipboard.writeText(payloadEv.clipboardData.data['text/plain'] || ''); } catch { /* egal */ }
          return;
        }
        case 'paste': { let pl = null; try { pl = localStorage.getItem('vp-clip'); } catch { /* egal */ } if (pl) pasteItems(pl, pt); else toast('Zwischenablage ist leer'); return; }
        case 'dup': return items.length > 1 ? multiAction('dup') : duplicate(one);
        case 'front': pushUndo(); data.items = data.items.filter(x => !items.includes(x)).concat(items); render(); return scheduleSave();
        case 'back': pushUndo(); { const fr = data.items.filter(x => x.type === 'frame' && !items.includes(x)); data.items = [...fr, ...items, ...data.items.filter(x => !items.includes(x) && !fr.includes(x))]; } render(); return scheduleSave();
        case 'group': case 'ungroup': case 'frame': return multiAction(b.dataset.mn);
        case 'lock': return toggleLock();
        case 'delete': return removeSelected(items[0].id);
        case 'note': case 'text': { pushUndo(); const it = { id: uid(), ...CREATE[b.dataset.mn](pt) }; it.x = Math.round(it.x); it.y = Math.round(it.y); data.items.push(it); select(it.id); render(); scheduleSave(); return editText(it.id); }
        case 'frameHere': return openFrameTemplates(pt);
        case 'all': return selectMany(data.items.map(i => i.id));
        case 'fit': return fit();
        case 'help': return showShortcuts();
      }
    };
    root.appendChild(m);
    setTimeout(() => document.addEventListener('pointerdown', closeMenus, { once: true }), 0);
  }

  // ---------- Hilfslinien beim Verschieben --------------------------------
  function smartSnap(moveIds, dx, dy, ev) {
    $$('.wb-guide', world).forEach(g => g.remove());
    if (ev.altKey || ev.shiftKey) return [dx, dy];
    const moving = [...moveIds].map(find).filter(Boolean); if (!moving.length) return [dx, dy];
    const b = bbox(moving.map(i => ({ ...i, x: drag.orig[i.id].x + dx, y: drag.orig[i.id].y + dy })));
    const th = 6 / data.view.z; const others = data.items.filter(i => !moveIds.has(i.id));
    const xs = [b.x, b.x + b.w / 2, b.x + b.w], ys = [b.y, b.y + b.h / 2, b.y + b.h];
    let bx = null, by = null;
    others.forEach(o => {
      const oxs = [o.x, o.x + o.w / 2, o.x + o.w], oys = [o.y, o.y + o.h / 2, o.y + o.h];
      xs.forEach(x => oxs.forEach(ox => { const d = ox - x; if (Math.abs(d) < th && (!bx || Math.abs(d) < Math.abs(bx.d))) bx = { d, x: ox, o }; }));
      ys.forEach(y => oys.forEach(oy => { const d = oy - y; if (Math.abs(d) < th && (!by || Math.abs(d) < Math.abs(by.d))) by = { d, y: oy, o }; }));
    });
    if (bx) { dx += bx.d; const y1 = Math.min(b.y, bx.o.y) - 20, y2 = Math.max(b.y + b.h, bx.o.y + bx.o.h) + 20; addGuide(bx.x, y1, 0, y2 - y1); }
    if (by) { dy += by.d; const x1 = Math.min(b.x, by.o.x) - 20, x2 = Math.max(b.x + b.w, by.o.x + by.o.w) + 20; addGuide(x1, by.y, x2 - x1, 0); }
    return [dx, dy];
  }
  function addGuide(x, y, w, hgt) {
    const g = document.createElement('div'); g.className = 'wb-guide';
    Object.assign(g.style, { left: x + 'px', top: y + 'px', width: Math.max(w, 1 / data.view.z) + 'px', height: Math.max(hgt, 1 / data.view.z) + 'px' });
    world.appendChild(g);
  }

  // ---------- Tastenkürzel-Hilfe ------------------------------------------
  function showShortcuts() {
    const rows = [
      ['Bearbeiten', [['Doppelklick', 'Text/Inhalt bearbeiten'], ['Einfach lostippen', 'Text der Auswahl ersetzen'], ['Enter', 'Text bearbeiten'], ['Esc / Strg+Enter', 'Bearbeiten beenden'], ['Doppelklick auf leere Fläche', 'Neue Notiz']]],
      ['Auswahl', [['Strg/Cmd + Klick', 'Zur Auswahl hinzufügen / entfernen'], ['Strg/Cmd + Ziehen', 'Auswahlrahmen (auch Shift)'], ['Strg+A', 'Alles auswählen'], ['Pfeiltasten', 'Auswahl verschieben (Shift = 10 px) · ohne Auswahl in Phasen-Boards: navigieren'], ['Alt + Pfeiltasten', 'Immer navigieren: ← → Phase, ↑ ↓ Schritt'], ['U', 'Klickbaren Prototyp einfügen'], ['Strg+G / Strg+Shift+G', 'Gruppieren / aufheben'], ['Strg+L', 'Sperren / entsperren']]],
      ['Allgemein', [['Strg+C / X / V', 'Kopieren / Ausschneiden / Einfügen'], ['Strg+D', 'Duplizieren'], ['Strg+Z', 'Rückgängig'], ['Entf', 'Löschen'], ['Rechtsklick', 'Kontextmenü'], ['Ziehen an ● Punkten', 'Verbinden bzw. neues Element']]],
      ['Werkzeuge', [['V / H', 'Auswählen / Hand'], ['N / T', 'Notiz / Text'], ['R / O / D', 'Rechteck / Kreis / Formen'], ['L', 'Verbindung'], ['B', 'Stift (freihand)'], ['F', 'Frame & Social-Formate'], ['G / I / Y / E', 'Designs / Icons / HTML / Modul']]],
      ['Ansicht', [['Mausrad', 'Zoomen'], ['Leertaste + Ziehen', 'Fläche verschieben'], ['0', 'Alles einpassen'], ['P', 'Präsentieren'], ['Alt beim Ziehen', 'Hilfslinien aus'], ['?', 'Diese Hilfe']]],
    ];
    const el = h(`<div class="modal-backdrop"><div class="modal shortcuts-modal"><h3>Tastenkürzel & Bedienung</h3>
      <div class="sc-grid">${rows.map(([t, list]) => `<div><h4>${t}</h4>${list.map(([k, d]) => `<div class="sc-row"><kbd>${k}</kbd><span>${d}</span></div>`).join('')}</div>`).join('')}</div>
      <div class="modal-actions"><span class="grow"></span><button class="btn primary" data-x>Verstanden</button></div></div></div>`);
    const close = () => el.remove();
    el.addEventListener('mousedown', ev => { if (ev.target === el) close(); }); $('[data-x]', el).onclick = close;
    $('#modal-root').appendChild(el);
  }

  // ---------- Tastatur ----------------------------------------------------
  function keydown(e) {
    if ($('#modal-root').children.length) return;
    if (P.active) {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') stopPresentation();
      else if (e.key.toLowerCase() === 't') Timer.toggle();
      return;
    }
    const tag = document.activeElement?.tagName;
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || document.activeElement?.isContentEditable) return;
    const k = e.key.toLowerCase();
    const single = multi.length <= 1 && selected ? find(selected) : null;
    // Lostippen: ausgewählte Notiz/Form/Text wird sofort bearbeitet
    if (single && TEXTUAL.includes(single.type) && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); return editText(single.id, { initial: e.key });
    }
    if (e.key.startsWith('Arrow') && navLanes().length && (e.altKey || !selItems().some(i => i.type !== 'lane'))) { e.preventDefault(); return navMove({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key]); }
    if (e.key.startsWith('Arrow') && (selected || multi.length)) { e.preventDefault(); return nudge(e.key, e.shiftKey ? 10 : 1); }
    if (e.key === '?' || (e.key === 'F1')) { e.preventDefault(); return showShortcuts(); }
    if ((e.ctrlKey || e.metaKey) && k === 'l' && (selected || multi.length)) { e.preventDefault(); return toggleLock(); }
    if ((e.ctrlKey || e.metaKey) && (k === 'z' || k === 'y')) { e.preventDefault(); return undo(); }
    if ((e.ctrlKey || e.metaKey) && k === 'd' && selected && find(selected)) { e.preventDefault(); return multi.length > 1 ? multiAction('dup') : duplicate(find(selected)); }
    if ((e.ctrlKey || e.metaKey) && k === 'a') { e.preventDefault(); return selectMany(data.items.map(i => i.id)); }
    if ((e.ctrlKey || e.metaKey) && k === 'g') { e.preventDefault(); return multiAction(e.shiftKey ? 'ungroup' : 'group'); }
    if (e.code === 'Space') { spaceDown = true; viewport.classList.add('panning'); e.preventDefault(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { if (selected || multi.length) { e.preventDefault(); if (selItems().some(i => i.locked)) return toast('Gesperrte Elemente zuerst entsperren (Strg+L)'); removeSelected(selected || multi[0]); } return; }
    if (e.key === 'Escape') { setTool('select'); select(null); closeMenus(); return; }
    if (e.key === 'Enter' && selected && find(selected)) { e.preventDefault(); const it = find(selected); if (TEXTUAL.includes(it.type)) return editText(selected, { selectAll: true }); if (it.type === 'design') return editDesignContent(it); if (it.type === 'html') return editHtml(it); if (it.type === 'choice') return editChoice(it); if (it.type === 'summary') return editSummary(it); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const map = { v: 'select', h: 'hand', n: 'note', t: 'text', r: 'rect', o: 'ellipse', l: 'connect', b: 'pen' };
    if (k === 'f') return openFrameTemplates();
    if (k === 'd') return toggleShapePicker($('[data-tool=shapes]', root));
    if (k === 'k') return addChoice();
    if (map[k]) setTool(map[k]);
    if (k === 'i') openIconPicker();
    if (k === 'e') openEmbedPicker();
    if (k === 'g') openDesignGallery();
    if (k === 'y') addHtml();
    if (k === 'u') addProto();
    if (k === 'p') startPresentation();
    if (k === '0') fit();
    if (k === '+' || k === '=') zoomAt(null, null, 1.2);
    if (k === '-') zoomAt(null, null, 1 / 1.2);
  }

  // ---------- Board-Vorlagen ----------------------------------------------
  async function applyTemplate(direct) {
    const own = getSetting('boardTemplates', []);
    const t = direct || await choose('Board-Vorlage einfügen', [
      { value: 'appconcept', label: 'App-Konzept (Vibe Coding)', desc: 'Frames für Idee, Zielgruppe, Endgerät, Funktionen, Design, UX & UI, Tools … + automatischer KI-Prompt', icon: 'smartphone' },
      { value: 'iteration', label: 'App-Konzept: neue Weiterentwicklungs-Runde', desc: 'Frame für Fehler, fehlende Funktionen & Verbesserungen mit eigenem Prompt – wird im Verlauf getrackt', icon: 'git-branch-plus' },
      { value: 'lifecycle', label: 'App-Konzept: Verlauf, Testing & Go-Live nachrüsten', desc: 'Für Konzept-Boards, die vor diesem Update angelegt wurden', icon: 'route' },
      { value: 'appblock', label: 'App-Konzept: einzelnen Block einfügen …', desc: 'z. B. „UX & UI“, „KI-Anweisungen“ oder „Spezifische Funktionen“ in ein bestehendes Konzept-Board nachrüsten', icon: 'layout-panel-left' },
      ...own.map(x => ({ value: 'own:' + x.id, label: '★ ' + x.name, desc: `Eigene Vorlage · ${x.items.length} Elemente`, icon: 'bookmark' })),
      { value: 'save', label: 'Aktuelles Board als Vorlage speichern …', desc: 'Alles (oder nur die Auswahl) als eigene, wiederverwendbare Vorlage', icon: 'bookmark-plus' },
      ...(own.length ? [{ value: 'manage', label: 'Eigene Vorlagen verwalten', desc: 'Umbenennen oder löschen', icon: 'settings' }] : []),
      { value: 'pitch', label: 'Präsentation (3 Folien)', desc: 'Frames mit Titel, Kennzahlen und Zeitstrahl – inkl. Animationen', icon: 'presentation' },
      { value: 'strategy', label: 'Content-Strategie', desc: 'Zielgruppe, Säulen, Funnel + eingebettete Ziele & Pipeline', icon: 'map' },
      { value: 'week', label: 'Wochenplanung', desc: '7 Tagesspalten, Aufgabenliste und Kalender', icon: 'calendar-range' },
      { value: 'brainstorm', label: 'Ideen-Brainstorm', desc: 'Zentrales Thema mit 6 Ideen-Notizen', icon: 'lightbulb' },
      { value: 'swot', label: 'SWOT-Analyse', desc: 'Stärken, Schwächen, Chancen, Risiken', icon: 'grid-2x2' },
      { value: 'funnel', label: 'Content-Funnel', desc: 'Reichweite → Vertrauen → Community → Angebot', icon: 'filter' },
    ]);
    if (!t) return;
    if (t === 'appblock') {
      const names = buildAppConcept(null, '__names');
      const pick = await choose('Welchen Block einfügen?', names.map(n2 => ({ value: n2, label: n2, icon: 'frame' })));
      if (!pick) return; return applyTemplate('appblock:' + pick);
    }
    if (t === 'iteration') return addIteration();
    if (t === 'lifecycle') return addLifecycle();
    if (t === 'save') return saveBoardTemplate();
    if (t === 'manage') return manageBoardTemplates();
    if (t.startsWith('own:')) { const tp = own.find(x => x.id === t.slice(4)); if (!tp) return toast('Vorlage nicht gefunden'); return insertBoardTemplate(tp); }
    const xs = data.items.map(i => i.x + i.w);
    const ox = xs.length ? Math.max(...xs) + 160 : 0, oy = data.items.length ? Math.min(...data.items.map(i => i.y)) : 0;
    const items = [], links = [];
    const add = o => { const it = { id: uid(), ...o, x: o.x + ox, y: o.y + oy }; items.push(it); return it.id; };
    const link = (a, b, color = '#7C3AED') => links.push({ id: uid(), from: a, to: b, color });
    const title = s => add({ type: 'text', x: 0, y: 0, w: 700, h: 56, text: s, fs: 32, bold: true });
    const th = { c1: '#7C3AED', c2: '#34D399', bg: '#FFFFFF', ink: '#1F1B2E' };
    const design = (kind, x, y, scale = 1, extra = {}) => { const d = DESIGNS[kind]; return add({ type: 'design', kind, data: { ...d.defaults }, c: { ...th }, x, y, w: Math.round(d.w * scale), h: Math.round(d.h * scale), ...extra }); };

    if (t === 'appconcept') buildAppConcept(add);
    if (t.startsWith('appblock:')) buildAppConcept(add, t.slice(9));
    if (t === 'pitch') {
      add({ type: 'frame', x: 0, y: 0, w: 960, h: 540, color: '#FFFFFF', title: 'Folie 1 – Titel', order: 1 });
      design('banner', 100, 150, 1, { anim: 'up', step: 1 });
      add({ type: 'text', x: 100, y: 360, w: 760, h: 40, text: 'Mein Plan für die nächsten 3 Monate', fs: 24, color: '#4B4563', anim: 'fade', step: 2 });
      add({ type: 'frame', x: 1060, y: 0, w: 960, h: 540, color: '#F5F3FF', title: 'Folie 2 – Kennzahlen', order: 2 });
      add({ type: 'text', x: 1120, y: 40, w: 700, h: 50, text: 'Wo ich stehe', fs: 32, bold: true });
      design('stat', 1120, 140, 1, { anim: 'pop', step: 1 });
      design('donut', 1440, 120, 1, { anim: 'zoom', step: 2 });
      design('progress', 1120, 390, 1, { anim: 'left', step: 3 });
      add({ type: 'note', x: 1740, y: 150, w: 220, h: 170, color: '#FFEDD5', text: 'Größte Chance:\nReels mit Tipps', cover: true, coverText: 'Klicken zum Aufdecken', step: 4, anim: 'fade' });
      add({ type: 'frame', x: 2120, y: 0, w: 960, h: 540, color: '#FFFFFF', title: 'Folie 3 – Fahrplan', order: 3 });
      add({ type: 'text', x: 2180, y: 40, w: 700, h: 50, text: 'Fahrplan', fs: 32, bold: true });
      design('timeline', 2200, 160, 1, { anim: 'wipe', step: 1 });
      add({ type: 'note', x: 2180, y: 420, w: 800, h: 80, color: '#D1FAE5', text: 'Nur für mich: Sprechernotiz – wird in der Präsentation ausgeblendet', presHide: true });
    }
    if (t === 'strategy') {
      title('Content-Strategie');
      const z = add({ type: 'note', x: 0, y: 90, w: 240, h: 170, color: '#EDE9FE', text: 'Zielgruppe\nWer? Probleme? Wünsche?' });
      const pos = add({ type: 'note', x: 260, y: 90, w: 240, h: 170, color: '#EDE9FE', text: 'Positionierung\nWofür will ich bekannt sein?' });
      const p1 = add({ type: 'note', x: 0, y: 300, w: 160, h: 120, color: '#D1FAE5', text: 'Säule 1\nWissen' });
      add({ type: 'note', x: 175, y: 300, w: 160, h: 120, color: '#D1FAE5', text: 'Säule 2\nUnterhaltung' });
      const p3 = add({ type: 'note', x: 350, y: 300, w: 160, h: 120, color: '#D1FAE5', text: 'Säule 3\nBehind the Scenes' });
      link(z, pos);
      add({ type: 'embed', kind: 'okr-all', cfg: {}, x: 560, y: 90, w: 380, h: 240 });
      const pipe = add({ type: 'embed', kind: 'pipeline', cfg: { platform: '' }, x: 0, y: 470, w: 1060, h: 420 });
      link(p1, pipe, '#FB923C'); link(p3, pipe, '#FB923C');
    }
    if (t === 'week') {
      title('Wochenplanung');
      ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].forEach((d, i) =>
        add({ type: 'rect', x: i * 190, y: 90, w: 175, h: 380, color: i < 5 ? '#7C3AED' : '#FB923C', fillOpacity: 0.08, text: d, fs: 16, bold: true }));
      add({ type: 'embed', kind: 'tasks', cfg: { project: '', showDone: false }, x: 0, y: 510, w: 420, h: 360 });
      add({ type: 'embed', kind: 'calendar', cfg: {}, x: 460, y: 510, w: 620, h: 480 });
    }
    if (t === 'brainstorm') {
      const c = add({ type: 'ellipse', x: 300, y: 220, w: 220, h: 220, color: '#7C3AED', fillOpacity: 0.15, text: 'Thema', fs: 22, bold: true });
      const colors = ['#EDE9FE', '#D1FAE5', '#FFEDD5'], strokes = ['#7C3AED', '#34D399', '#FB923C'];
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 - Math.PI / 2;
        const n = add({ type: 'note', x: Math.round(410 + Math.cos(a) * 340 - 90), y: Math.round(330 + Math.sin(a) * 260 - 65), w: 180, h: 130, color: colors[i % 3], text: `Idee ${i + 1}` });
        link(c, n, strokes[i % 3]);
      }
    }
    if (t === 'swot') {
      title('SWOT-Analyse');
      [['Stärken', '#D1FAE5', 0, 0], ['Schwächen', '#FFEDD5', 1, 0], ['Chancen', '#EDE9FE', 0, 1], ['Risiken', '#FCE7F3', 1, 1]].forEach(([l, c, i, j]) =>
        add({ type: 'note', x: i * 360, y: 90 + j * 280, w: 340, h: 260, color: c, text: `${l}\n• `, align: 'left' }));
    }
    if (t === 'funnel') {
      title('Content-Funnel');
      const steps = [['Reichweite\nReels, Trends, Shorts', 640], ['Vertrauen\nKarussells, Tipps, Storytelling', 520], ['Community\nStories, Lives, Kommentare', 400], ['Angebot\nNewsletter, Produkt, Kooperation', 280]];
      let prevId = null;
      steps.forEach(([txt, w], i) => {
        const col = ['#7C3AED', '#6366F1', '#34D399', '#FB923C'][i];
        const id = add({ type: 'rect', x: (640 - w) / 2, y: 90 + i * 130, w, h: 105, color: col, fillColor: col, fillOpacity: 0.9, textColor: '#FFFFFF', text: txt, fs: 16, radius: 14, anim: 'up', step: i + 1 });
        if (prevId) link(prevId, id, '#94A3B8'); prevId = id;
      });
      add({ type: 'embed', kind: 'posts', cfg: { platform: '' }, x: 700, y: 90, w: 380, h: 500 });
    }
    pushUndo();
    data.items.push(...items); data.connectors.push(...links);
    render(); fit(); scheduleSave();
  }

  // ---------- Vorlage: App-Konzept (Vibe Coding) --------------------------
  function buildAppConcept(add, onlyBlock) {
    const FW = 620, PAD = 24, GAP = 70, COLS = 3;
    // Bezeichnung im KI-Prompt (null = nicht in den Prompt übernehmen)
    const LABELS = { 'Was wird gebaut?': 'App-Typ', 'Für wen?': 'Zielgruppe', 'Technik-Erfahrung der Nutzer': 'Technik-Erfahrung der Nutzer', 'Läuft auf': 'Plattform / Endgeräte', 'Ausrichtung': 'Bildschirm-Ausrichtung',
      'Funktionen': 'Allgemeine Funktionen', 'Navigation': 'Navigation', 'Wichtige Screens': 'Screens', 'UX-Prinzipien': 'UX-Anforderungen', 'Feedback & Animation': 'Interaktion & Feedback', 'Genre': 'Spiel-Genre', 'Steuerung': 'Steuerung', 'Fortschritt': 'Spielfortschritt', 'Look': 'Design-Stil', 'Speicherung': 'Daten & Backend', 'Tool': null,
      'Technik (falls gewünscht)': 'Technik', 'Geschäftsmodell': 'Monetarisierung', 'Wo erscheint die App?': 'Veröffentlichung', 'Komplexität': 'Umfang', 'Video-Format': null, 'Kapitel (abhaken beim Dreh)': null };
    const colors = ['#7C3AED', '#059669', '#EA580C', '#6366F1', '#DB2777', '#0284C7'];
    const F = f => ({ t: f, f });  // Schrift mit Vorschau
    const T = (t, p, ask) => ({ t, p, ...(ask ? { ask } : {}) });  // Aufgabe für die KI
    const S = [
      ['App-Idee', [
        { note: 'Die Idee in einem Satz:\nEine App, die …', h: 110, prompt: true, color: '#EDE9FE' },
        { note: 'Welches Problem löst sie? Warum ist sie nützlich oder macht Spaß?', h: 100, prompt: true, color: '#EDE9FE' },
        { row: [{ note: 'Arbeitstitel / Name:', h: 70, prompt: true, color: '#FFEDD5' }, { note: 'Vorbild / ähnliche Apps:', h: 70, prompt: true, color: '#FFEDD5' }] },
      ]],
      ['App-Typ', [{ ch: ['Was wird gebaut?', ['Handyspiel (Casual Game)', 'Web-App', 'Native Handy-App (iOS/Android)', 'Progressive Web App (PWA)', 'Desktop-App', 'Browser-Erweiterung', 'KI-App / Chatbot', 'Tool / Utility', 'Landingpage / Website'], { mode: 'single', cols: 2 }] }]],
      ['Zielgruppe', [
        { ch: ['Für wen?', ['Kinder', 'Jugendliche', 'Junge Erwachsene', 'Erwachsene', 'Senioren', 'Familien', 'Gamer', 'Studierende', 'Berufstätige', 'Selbstständige', 'Unternehmen (B2B)', 'Content Creator'], { cols: 3 }] },
        { ch: ['Technik-Erfahrung der Nutzer', ['Anfänger', 'Fortgeschritten', 'Profis'], { mode: 'single', cols: 3 }] },
      ]],
      ['Endgerät & Plattform', [
        { ch: ['Läuft auf', ['Smartphone (iOS)', 'Smartphone (Android)', 'Tablet', 'Desktop-Browser', 'Mobiler Browser', 'Installierbar (PWA)', 'Smartwatch', 'Smart-TV'], { cols: 2 }] },
        { ch: ['Ausrichtung', ['Hochformat', 'Querformat', 'Beides'], { mode: 'single', cols: 3 }] },
      ]],
      ['Allgemeine Funktionen', [{ ch: ['Funktionen', ['Login / Benutzerkonto', 'Profil', 'Feed / Startseite', 'Suche & Filter', 'Chat / Nachrichten', 'Push-Benachrichtigungen', 'Kamera / Fotos', 'Standort & Karten', 'Kalender / Termine', 'Bestenliste / Highscore', 'Offline nutzbar', 'Teilen in Social Media', 'Bezahlfunktion', 'KI-Funktion', 'Datei-Upload', 'Statistiken & Diagramme', 'Mehrsprachig', 'Dark Mode', 'Sound & Musik', 'Einstellungen'], { cols: 2 }] }]],
      ['Spezifische technische Funktionen', [
        { fx: true },
        { note: 'Tipp: Je konkreter, desto besser – z. B. „Highscore wird online gespeichert und weltweit verglichen“ statt „Highscore“. Hoch = muss in Version 1.', h: 70, color: '#F1F5F9', np: true },
      ]],
      ['Spiel: Mechanik', [
        { ch: ['Genre', ['Jump’n’Run', 'Endless Runner', 'Puzzle', 'Quiz', 'Arcade-Klassiker', 'Idle / Clicker', 'Geschicklichkeit', 'Strategie', 'Rätsel / Escape', 'Multiplayer'], { cols: 2 }] },
        { ch: ['Steuerung', ['Tippen', 'Wischen', 'Gedrückt halten', 'Neigen (Sensor)', 'Tastatur', 'Maus'], { cols: 3 }] },
        { ch: ['Fortschritt', ['Level', 'Punkte', 'Leben', 'Power-ups', 'Errungenschaften', 'Tägliche Belohnung'], { cols: 3 }] },
      ]],
      ['Spiel: Story & Kontext', [
        { note: 'Ausgangssituation – worum geht es? (Wer, wo, was ist passiert?):', h: 120, prompt: true, color: '#FCE7F3' },
        { row: [{ note: 'Ziel des Spielers / Konflikt:', h: 110, prompt: true, color: '#FCE7F3' }, { note: 'Setting / Spielwelt (Ort, Zeit, Atmosphäre):', h: 110, prompt: true, color: '#D1FAE5' }] },
        { ch: ['Ton & Stimmung', ['Lustig', 'Kindgerecht', 'Spannend', 'Episch', 'Düster', 'Mysteriös', 'Entspannt'], { cols: 3, label: 'Ton & Stimmung' }] },
        { ch: ['Wie wird erzählt?', ['Intro-Text', 'Zwischensequenzen', 'Dialoge mit Figuren', 'Die Welt erzählt (ohne Text)', 'Tagebuch / Briefe / Funde', 'Keine Story nötig'], { cols: 2, label: 'Erzählweise' }] },
        { note: 'Ausführliche Story / Kontext (gern komplett aus einem Dokument einfügen):', h: 170, prompt: true, color: '#FEF9C3' },
      ]],
      ['Spiel: Figuren & Bilder', [
        { row: [{ note: 'Hauptfigur (Aussehen, Fähigkeiten, Persönlichkeit):', h: 120, prompt: true, color: '#EDE9FE' }, { note: 'Gegner / Nebenfiguren:', h: 120, prompt: true, color: '#EDE9FE' }] },
        { gallery: ['Hauptfigur', 'Gegner', 'Setting / Hintergrund'] },
        { note: '📎 Mit „＋ Bild hinzufügen“ beliebig viele Bilder mit Erklärung anlegen (Figuren, Level, Gegenstände …). Der Prompt enthält nur Text – lade die Bilder im KI-Tool zusätzlich hoch, z. B. per Drag & Drop in den Chat.', h: 80, color: '#FFEDD5', np: true },
      ]],
      ['Design: Stil, Farben & Schrift', [
        { ch: ['Look', ['Minimalistisch', 'Verspielt & bunt', 'Retro / Pixel-Art', 'Modern & clean', 'Dunkel / Neon', 'Glassmorphism', 'Handgezeichnet', 'Business / seriös', 'Cartoon'], { cols: 3 }] },
        { pal: true },
        { ch: ['Schrift für Überschriften', [F('Poppins'), F('Montserrat'), F('Inter'), F('Nunito'), F('Fredoka'), F('Bebas Neue'), F('Playfair Display'), F('Space Grotesk'), F('Press Start 2P')], { mode: 'single', cols: 3, label: 'Schriftart Überschriften' }] },
        { ch: ['Schrift für Fließtext', [F('Inter'), F('Roboto'), F('Open Sans'), F('Nunito'), F('Lato'), F('Merriweather'), F('Quicksand'), F('Source Sans 3'), F('System-Schrift')], { mode: 'single', cols: 3, label: 'Schriftart Fließtext' }] },
        { slots: ['Moodboard / Inspiration 1', 'Moodboard / Inspiration 2'], h: 130 },
      ]],
      ['UX & UI', [
        { ch: ['Navigation', ['Tab-Leiste unten', 'Seitenmenü (Hamburger)', 'Obere Tabs', 'Wischen zwischen Seiten', 'Eine Seite zum Scrollen', 'Schritt-für-Schritt (Wizard)', 'Startmenü (bei Spielen)'], { cols: 2 }] },
        { ch: ['Wichtige Screens', ['Splash / Ladebildschirm', 'Onboarding / Tutorial', 'Login & Registrierung', 'Startseite / Dashboard', 'Liste / Übersicht', 'Detailansicht', 'Suche', 'Profil', 'Einstellungen', 'Leerer Zustand („Noch nichts da“)', 'Spielbildschirm', 'Pause-Menü', 'Game Over / Ergebnis', 'Bestenliste', 'Shop'], { cols: 2 }] },
        { ch: ['UX-Prinzipien', ['Einhand-Bedienung (Daumenzone)', 'Große Touch-Flächen (min. 44 px)', 'Gut lesbar (Kontrast & Schriftgröße)', 'Barrierefrei (Screenreader, Farbenblind)', 'Max. 3 Klicks zum Ziel', 'Klare Fehlermeldungen', 'Rückgängig-Funktion', 'Ladezustände (Skeleton / Spinner)', 'Funktioniert ohne Erklärung'], { cols: 1 }] },
        { ch: ['Feedback & Animation', ['Micro-Animationen bei Klicks', 'Sanfte Seitenübergänge', 'Vibration (haptisches Feedback)', 'Sound-Effekte', 'Belohnung (Konfetti, Sterne)', 'Fortschrittsanzeige', 'Toast-Hinweise'], { cols: 2 }] },
        { note: 'User Flow (Hauptweg des Nutzers):\nApp öffnen → … → Ziel erreicht', h: 90, prompt: true, color: '#E0F2FE' },
        { note: 'Wireframe-Skizze: Mit dem Stift (Taste B) oder Formen die wichtigsten Screens grob aufzeichnen.', h: 70, color: '#F1F5F9', np: true },
      ]],
      ['Daten & Backend', [{ ch: ['Speicherung', ['Keine Daten nötig', 'Lokal im Gerät (LocalStorage)', 'Datenbank (z. B. Supabase, Firebase)', 'Benutzerkonten & Login', 'Echtzeit-Synchronisation', 'Datei- / Bildspeicher', 'Externe APIs (Wetter, Karten …)', 'KI-API (z. B. Claude)'], { cols: 1 }] }]],
      ['Vibe-Coding-Tool & Technik', [
        { ch: ['Tool', ['Claude', 'Claude Code', 'Cursor', 'Lovable', 'Bolt', 'Replit', 'v0', 'GitHub Copilot'], { cols: 2 }] },
        { ch: ['Technik (falls gewünscht)', ['Einfach: HTML, CSS & JavaScript', 'React', 'Next.js', 'React Native / Expo', 'Flutter', 'Python', 'Phaser (2D-Spiele)', 'Three.js (3D)', 'Tailwind CSS', 'Egal – die KI soll entscheiden'], { cols: 2 }] },
      ]],
      ['Monetarisierung', [{ ch: ['Geschäftsmodell', ['Kostenlos', 'Werbung', 'In-App-Käufe', 'Abo', 'Einmalkauf', 'Spenden', 'Nur Demo fürs Video'], { cols: 2 }] }]],
      ['Veröffentlichung', [{ ch: ['Wo erscheint die App?', ['Apple App Store', 'Google Play Store', 'Eigene Website', 'GitHub Pages', 'Vercel / Netlify', 'itch.io (Spiele)', 'Nur lokal / Demo'], { cols: 2 }] }]],
      ['Umfang & MVP-Plan', [
        { ch: ['Komplexität', ['Mini (unter 1 Stunde)', 'Klein (1 Tag)', 'Mittel (Wochenende)', 'Groß (mehrere Wochen)'], { mode: 'single', cols: 2 }] },
        { row: [{ note: 'MUSS (Version 1):\n• \n• \n• ', h: 190, prompt: true, color: '#D1FAE5', align: 'left' }, { note: 'SOLL:\n• \n• ', h: 190, prompt: true, color: '#FEF9C3', align: 'left' }, { note: 'KANN später:\n• \n• ', h: 190, color: '#FCE7F3', align: 'left' }] },
      ]],
      ['Video-Ablauf', [
        { ch: ['Video-Format', ['YouTube Short', 'Tutorial (10–20 Min.)', 'Langes Projekt-Video', 'Mehrteilige Serie', 'Livestream'], { cols: 2 }] },
        { ch: ['Kapitel (abhaken beim Dreh)', ['Hook: fertige App zuerst zeigen', 'Die Idee erklären', 'Konzept auf diesem Board', 'Erster Prompt', 'Erster Prototyp', 'Iterieren & verbessern', 'Fehler & wie die KI sie löst', 'Design-Feinschliff', 'Ergebnis & Live-Test', 'Fazit + Call-to-Action'], { cols: 1 }] },
        { note: 'Hook-Idee für den Einstieg:', h: 80, color: '#FFEDD5' },
      ]],
      ['KI-Anweisungen (Gespräch strukturieren)', [
        { ch: ['Rolle der KI', ['erfahrener Software-Entwickler', 'geduldiger Mentor für Einsteiger', 'erfahrener Game-Developer', 'erfahrener UX/UI-Designer', 'erfahrener Produktmanager', 'Senior-Software-Architekt'], { mode: 'single', cols: 2, section: 'role' }] },
        { ch: ['Arbeitsweise', [
          T('Stell mir zuerst Rückfragen', 'Stelle mir zuerst alle wichtigen Rückfragen, bevor du mit dem Code beginnst.'),
          T('In kleinen Schritten mit Feedback', 'Arbeite in kleinen Schritten und warte nach jedem Schritt auf mein Feedback.'),
          T('Einsteigerfreundlich erklären (fürs Video)', 'Erkläre jeden Schritt einsteigerfreundlich und in einfachen Worten – ich zeige den Prozess in einem YouTube-Video.'),
          T('Erst Plan, dann Code', 'Erstelle zuerst einen kurzen Plan (Struktur, Screens, Komponenten), bevor du Code schreibst.'),
          T('Vollständige Dateien statt Ausschnitte', 'Gib immer vollständige, lauffähige Dateien aus statt einzelner Code-Ausschnitte.'),
          T('Kurz & knapp antworten', 'Antworte kurz und knapp, ohne lange Erklärungen.'),
          T('Antworten auf Deutsch', 'Antworte auf Deutsch.'),
          T('Code-Kommentare auf Deutsch', 'Kommentiere den Code auf Deutsch.'),
        ], { cols: 1, section: 'work', other: true }] },
        { ch: ['Zusätzliche Aufgaben', [
          T('Benchmark-Analyse ähnlicher Apps', 'Führe eine Benchmark-Analyse ähnlicher Apps durch: Was machen sie gut, was fehlt ihnen?'),
          T('Ergänzende Funktionen vorschlagen', 'Schlage Funktionen vor, um die die App sinnvoll ergänzt werden könnte, und begründe sie kurz.'),
          T('Wettbewerbsfähigkeit einschätzen', 'Schätze ehrlich ein, ob meine App wettbewerbsfähig ist und wie sie sich abheben kann.'),
          T('Klickbaren Prototyp erstellen', 'Erstelle zuerst einen klickbaren Prototyp, damit ich Ablauf und Design testen kann.'),
          T('Schritt-für-Schritt-Testanleitung', 'Erstelle eine Schritt-für-Schritt-Anleitung, wie ich die App testen kann (inkl. Testfälle).'),
          T('Code in mein Git-Repository pushen', 'Pushe den Code in mein Git-Repository: {val}', 'Link zum Git-Repository (z. B. https://github.com/name/repo)'),
          T('README & Dokumentation schreiben', 'Schreibe eine README mit Installations- und Startanleitung.'),
          T('Deployment-Anleitung', 'Erkläre, wie ich die App kostenlos online stelle (Deployment), Schritt für Schritt.'),
          T('Datenschutz (DSGVO) prüfen', 'Prüfe, welche Datenschutz-Punkte (DSGVO) ich beachten muss.'),
          T('Barrierefreiheit prüfen', 'Prüfe die App auf Barrierefreiheit und schlage Verbesserungen vor.'),
          T('Automatische Tests schreiben', 'Schreibe automatische Tests für die wichtigsten Funktionen.'),
          T('Performance optimieren', 'Optimiere die App auf Ladezeit und Performance.'),
          T('App-Store-Texte schreiben', 'Schreibe App-Store-Texte: Name, Untertitel, Beschreibung und Keywords.'),
          T('Launch- & Marketing-Ideen', 'Gib mir Ideen für Launch und Marketing, besonders für Social Media.'),
          T('Ideen für Thumbnail & Videotitel', 'Schlage 5 YouTube-Videotitel und Thumbnail-Ideen für das Video über die Entwicklung vor.'),
        ], { cols: 1, section: 'tasks', other: true }] },
        { note: 'Weitere Anweisungen an die KI (eine pro Zeile):\n• ', h: 110, color: '#EDE9FE', align: 'left', task: true },
      ]],
    ];
    if (onlyBlock === '__names') return S.map(e => e[0]);
    const byName = Object.fromEntries(S.map(e => [e[0], e[1]]));
    if (onlyBlock) { // nur einen einzelnen Block einfügen (für bestehende Boards)
      const bl = byName[onlyBlock]; if (!bl) return;
      const { kids, h } = layoutBlocks(bl, 0, 0, FW, '#7C3AED', LABELS);
      add({ type: 'frame', x: 0, y: 0, w: FW, h, color: '#FFFFFF', title: onlyBlock }); kids.forEach(k => add(k)); return;
    }
    // ---- Phasen von links nach rechts (Swimlanes) ----
    const PH = [
      { ic: '🧠', t: 'Brainstorming', sub: 'Idee grob skizzieren – die KI macht ein erstes Konzept, stellt Rückfragen und schlägt Funktionen vor.', c: '#C026D3', b: ['__brain'] },
      { ic: '💡', t: 'Idee & Zielgruppe', sub: 'Worum geht es – und für wen bauen wir die App?', c: '#7C3AED', b: ['App-Idee', 'App-Typ', 'Zielgruppe'] },
      { ic: '🧩', t: 'Funktionen & Umfang', sub: 'Was soll die App können – und was kommt in Version 1?', c: '#6366F1', b: ['Endgerät & Plattform', 'Allgemeine Funktionen', 'Spezifische technische Funktionen', 'Umfang & MVP-Plan'] },
      { ic: '🎮', t: 'Spiel', sub: 'Nur ausfüllen, wenn du ein Spiel baust – sonst einfach überspringen.', c: '#DB2777', b: ['Spiel: Mechanik', 'Spiel: Story & Kontext', 'Spiel: Figuren & Bilder'] },
      { ic: '🎨', t: 'Design & UX', sub: 'Wie sieht die App aus und wie fühlt sie sich an?', c: '#EA580C', b: ['Design: Stil, Farben & Schrift', 'UX & UI'] },
      { ic: '⚙️', t: 'Technik & Business', sub: 'Womit bauen wir, wo liegen die Daten, wie verdient die App Geld?', c: '#0284C7', b: ['Daten & Backend', 'Vibe-Coding-Tool & Technik', 'Monetarisierung', 'Veröffentlichung'] },
      { ic: '🤖', t: 'Prompt an die KI', sub: 'Alles von links fließt automatisch in diesen Prompt – kopieren & loslegen.', c: '#9333EA', b: ['KI-Anweisungen (Gespräch strukturieren)', '__prompt'] },
      { ic: '🔁', t: 'Weiterentwickeln', sub: 'Ausprobieren, Fehler sammeln, neuen Prompt erzeugen – so oft du willst.', c: '#D97706', b: ['__iter'] },
      { ic: '🧪', t: 'User Testing', sub: 'Echte Menschen probieren die App aus – wir sammeln Feedback.', c: '#0891B2', b: ['__test'] },
      { ic: '🚀', t: 'Go-Live', sub: 'Die App wird veröffentlicht: Schritt für Schritt in den Store oder ins Netz.', c: '#059669', b: ['__live'] },
      { ic: '🎬', t: 'Video', sub: 'Planung für dein YouTube-Video über das Projekt.', c: '#E11D48', b: ['Video-Ablauf'] },
    ];
    const LP = 40, LW = FW + LP * 2, LG = 150, HEAD = 210, VG = 60;
    const totalW = PH.length * LW + (PH.length - 1) * LG;
    // Kopfbereich
    add({ type: 'text', x: 0, y: 0, w: 2400, h: 84, text: 'App-Konzept · Vibe Coding', fs: 64, bold: true, color: '#1F1B2E' });
    add({ type: 'text', x: 0, y: 92, w: 2400, h: 40, text: 'Von der Idee bis zur veröffentlichten App – Phase für Phase von links nach rechts.', fs: 26, color: '#6B6680' });
    add({ type: 'lane', guide: true, x: 0, y: 170, w: 1500, h: 440, c: '#7C3AED', ic: '👋', t: 'So funktioniert die Vorlage', locked: true,
      steps: ['Optionen anklicken – fertig. „Sonstiges“ für eigene Angaben.', 'Notizen per Doppelklick ausfüllen. Mit „✦ Prompt“ markierte fließen in den Prompt.', 'Klein anfangen? In Phase 1 die Idee grob notieren – die KI macht ein erstes Konzept daraus.', 'Nicht jeder Punkt nötig? „🤖 KI entscheiden lassen“ am Frame blendet ihn aus.', 'In Phase 7 den fertigen Prompt kopieren und ins KI-Tool einfügen.', 'Danach: weiterentwickeln, testen, veröffentlichen – jede Phase hat ihren eigenen Prompt.', 'Navigieren: Konsole unten rechts oder Pfeiltasten – ← → wechselt die Phase, ↑ ↓ den Schritt.'] });
    const ov = layoutBlocks([{ devlog: true }], 1600, 170, 2600, '#7C3AED', LABELS);
    add({ type: 'frame', x: 1600, y: 170, w: 2600, h: ov.h, color: '#F5F3FF', title: 'Entwicklungsverlauf (Übersicht)', order: 1, phase: 'overview' });
    ov.kids.forEach(k => add(k));
    const top = 170 + Math.max(440, ov.h) + 140;
    const lanes = [];
    PH.forEach((ph, pi) => {
      const lx = pi * (LW + LG); let cy = top + HEAD; let k = 0;
      const frame = (title, blocks, extra = {}) => {
        k++; const lay = layoutBlocks(blocks, lx + LP, cy, FW, ph.c, LABELS);
        add({ type: 'frame', x: lx + LP, y: cy, w: FW, h: lay.h, color: '#FFFFFF', title: `${pi + 1}.${k} · ${title}`, order: (pi + 1) * 100 + k, ...extra });
        lay.kids.forEach(kd => add(kd)); cy += lay.h + VG;
      };
      ph.b.forEach(name => {
        if (name === '__prompt') frame('KI-Prompt (wird automatisch erstellt)', [{ sum: { mode: 'main', title: 'Dein Prompt für das Vibe-Coding-Tool', h: 820 } }]);
        else if (name === '__iter') frame('Weiterentwicklung #1', iterationBlocks(1), { phase: 'iteration', iterNo: 1, created: today(), order: 701 });
        else if (name === '__test') frame('User Testing', testingBlocks(), { phase: 'testing' });
        else if (name === '__live') frame('Go-Live (Veröffentlichung)', goliveBlocks(), { phase: 'golive' });
        else if (name === '__brain') frame('Ideen sammeln & KI-Brainstorming', brainstormBlocks(), { phase: 'brainstorm' });
        else frame(name, byName[name], { canAi: true });
      });
      lanes.push({ type: 'lane', x: lx, y: top, w: LW, h: cy - top - VG + LP, c: ph.c, ic: ph.ic, no: pi + 1, t: ph.t, sub: ph.sub, last: pi === PH.length - 1, locked: true });
    });
    const LH = Math.max(...lanes.map(l => l.h));
    lanes.forEach(l => add({ ...l, h: LH }));
    void totalW;
  }

  /** legt Blöcke untereinander in einem Frame an (relativ zu fx/fy) */
  function layoutBlocks(blocks, fx, fy, FW, color, LABELS = {}) {
    const PAD = 24, W = FW - PAD * 2; const kids = []; let cy = PAD + 4;
    blocks.forEach(b => {
      if (b.ch) { const [t, o, opt = {}] = b.ch; const c = makeChoice(t, o, { other: !['role'].includes(opt.section) && !opt.status && !/Kapitel|Ausrichtung|Komplexität|Technik-Erfahrung/.test(t), ...opt, color, w: W }); const lab = LABELS[t]; if (lab === null || opt.status) c.noPrompt = true; else if (lab) c.label = lab; if (opt.status) c.statusOf = true; if (opt.haveList) c.haveList = true; kids.push({ ...c, x: fx + PAD, y: fy + cy }); cy += c.h + 18; }
      if (b.note) { kids.push({ type: 'note', x: fx + PAD, y: fy + cy, w: W, h: b.h, color: b.color, text: b.note, ph: b.note, fs: 15, align: b.align || 'left', promptInclude: !!b.prompt || !!b.task, ...(b.task ? { taskNote: true } : {}) }); cy += b.h + 18; }
      if (b.fx) { const o = b.fx === true ? {} : b.fx; const it = { type: 'features', title: o.title || 'Spezifische technische Funktionen', hint: o.hint, color: o.color || color, rows: [], x: fx + PAD, y: fy + cy, w: W, h: 150 }; if (o.label) it.label = o.label; kids.push(it); cy += 150 + 18; }
      if (b.pal) { const [nm, cs] = PALETTES[0]; kids.push({ type: 'palette', title: 'Farbpalette', name: nm, colors: cs.map((hx, k) => ({ role: PAL_ROLES[k], hex: hx })), x: fx + PAD, y: fy + cy, w: W, h: 168 }); cy += 168 + 18; }
      if (b.slots) { const sw = (W - (b.slots.length - 1) * 14) / b.slots.length; b.slots.forEach((lb, i) => kids.push({ type: 'imgslot', label: lb, x: fx + PAD + i * (sw + 14), y: fy + cy, w: Math.round(sw), h: b.h })); cy += b.h + 18; }
      if (b.row) { const cw = (W - (b.row.length - 1) * 14) / b.row.length; const hh = Math.max(...b.row.map(r => r.h));
        b.row.forEach((r, i) => kids.push({ type: 'note', x: fx + PAD + i * (cw + 14), y: fy + cy, w: Math.round(cw), h: hh, color: r.color, text: r.note, ph: r.note, fs: 14, align: r.align || 'left', promptInclude: !!r.prompt }));
        cy += hh + 18; }
      if (b.sum) { kids.push({ type: 'summary', mode: b.sum.mode, title: b.sum.title, x: fx + PAD, y: fy + cy, w: W, h: b.sum.h || 380 }); cy += (b.sum.h || 380) + 18; }
      if (b.gallery) { const n = b.gallery.length; const hh = 60 + Math.ceil((n + 1) / 3) * 228; kids.push({ type: 'gallery', title: 'Bilder mit Erklärung', color, entries: b.gallery.map(l => ({ label: l, cap: '' })), x: fx + PAD, y: fy + cy, w: W, h: hh }); cy += hh + 18; }
      if (b.devlog) { kids.push({ type: 'devlog', title: 'Entwicklungsverlauf', x: fx + PAD, y: fy + cy, w: W, h: 260 }); cy += 260 + 18; }
    });
    return { kids, h: cy + PAD - 18 + 8 };
  }
  const STATUS_ITER = ['Geplant', 'In Arbeit', 'Getestet', 'Erledigt'];
  function brainstormBlocks() {
    return [
      { note: 'Meine Idee in Stichworten (ganz grob reicht):', h: 150, prompt: true, color: '#FAE8FF' },
      { row: [{ note: 'Welches Problem löst sie / warum macht sie Spaß?', h: 110, prompt: true, color: '#FAE8FF' }, { note: 'Für wen ist sie gedacht?', h: 110, prompt: true, color: '#FAE8FF' }] },
      { row: [{ note: 'Inspiration / ähnliche Apps oder Spiele:', h: 110, prompt: true, color: '#EDE9FE' }, { note: 'Wie soll sie sich anfühlen? (z. B. schnell, gemütlich, motivierend)', h: 110, prompt: true, color: '#EDE9FE' }] },
      { ch: ['Grobe Richtung', ['App', 'Spiel', 'Web-Tool', 'Noch offen'], { mode: 'single', cols: 4, label: 'Grobe Richtung' }] },
      { ch: ['Was soll die KI im Brainstorming liefern?', [
        { t: 'Erstes Konzept', p: 'Erstelle aus meinen Stichworten ein kompaktes erstes Konzept: Kernidee, Zielgruppe, wichtigste Screens und der Ablauf aus Sicht der Nutzer.' },
        { t: 'Rückfragen', p: 'Stelle mir 5–10 gezielte Rückfragen, die für die weitere Planung wichtig sind – nummeriert, damit ich sie leicht beantworten kann.' },
        { t: 'Technische Funktionen vorschlagen', p: 'Schlage technische Funktionen vor – als Liste zum Kopieren, eine Funktion pro Zeile im Format „- Funktion (hoch)“, „(mittel)“ oder „(niedrig)“ für die Priorität. Ich füge die Liste danach in meine Planungsvorlage ein.' },
        { t: 'MVP-Vorschlag', p: 'Schlage vor, was in eine erste Version (MVP) gehört und was später kommen kann.' },
        { t: 'Namensideen', p: 'Mache 5 Vorschläge für einen Namen.' },
        { t: 'Risiken & Stolpersteine', p: 'Nenne die größten Risiken oder schwierigen Stellen bei der Umsetzung mit Vibe Coding.' },
        { t: 'Passende Technik', p: 'Empfiehl eine einfache, passende Technik bzw. ein geeignetes Vibe-Coding-Tool.' },
      ], { cols: 1, section: 'tasks', sel: ['Erstes Konzept', 'Rückfragen', 'Technische Funktionen vorschlagen'] }] },
      { note: '💡 So geht’s weiter: Antwort der KI lesen und Rückfragen beantworten. Die vorgeschlagenen Funktionen kopieren → in Phase 3 bei „Spezifische technische Funktionen“ auf „+ Funktion“ klicken und einfügen – Prioritäten in Klammern werden automatisch erkannt.', h: 100, color: '#FFEDD5', np: true },
      { sum: { mode: 'brainstorm', title: 'Prompt fürs Brainstorming', h: 420 } },
    ];
  }
  function iterationBlocks(n) {
    return [
      { ch: ['Status dieser Runde', STATUS_ITER, { mode: 'single', cols: 4, status: true, sel: ['Geplant'] }] },
      { ch: ['Rolle der KI in dieser Runde', [{ t: 'Wie im Hauptprompt' }, { t: 'UX/UI-Designer', p: 'ein erfahrener UX/UI-Designer mit Fokus auf Bedienbarkeit, klare Gestaltung und Barrierefreiheit' }, { t: 'Frontend-Entwickler', p: 'ein erfahrener Frontend-Entwickler' }, { t: 'Backend- & Datenbank-Experte', p: 'ein erfahrener Backend- und Datenbank-Experte' }, { t: 'Game-Designer', p: 'ein erfahrener Game-Designer (Spielmechanik, Balancing, Spielspaß)' }, { t: 'QA- & Test-Ingenieur', p: 'ein gründlicher QA- und Test-Ingenieur, der Fehler systematisch findet und behebt' }, { t: 'Performance-Experte', p: 'ein Experte für Performance und Ladezeiten' }, { t: 'Experte für Barrierefreiheit', p: 'ein Experte für digitale Barrierefreiheit (WCAG)' }, { t: 'Security-Experte', p: 'ein erfahrener Security-Experte' }], { mode: 'single', cols: 2, section: 'role', sel: ['Wie im Hauptprompt'], other: true }] },
      { ch: ['Schwerpunkt', ['Fehler beheben', 'Fehlende Funktionen ergänzen', 'Neue Ideen umsetzen', 'Design & UX verbessern', 'Performance / Ladezeit', 'Code aufräumen', 'Tests ergänzen'], { cols: 2, label: 'Schwerpunkt' }] },
      { fx: { title: 'Funktioniert nicht (Fehler / Bugs)', label: 'Fehler, die behoben werden müssen', color: '#DC2626', hint: 'Was funktioniert nicht? Möglichst genau: Was hast du gemacht, was ist passiert, was hätte passieren sollen?' } },
      { fx: { title: 'Fehlt noch / neue Funktionen', label: 'Fehlende oder neue Funktionen', color: '#7C3AED', hint: 'Funktionen, die im ersten Entwurf fehlen oder dir beim Testen eingefallen sind.' } },
      { fx: { title: 'Verbesserungen (Design, UX, Performance)', label: 'Verbesserungen', color: '#0284C7', hint: 'z. B. „Buttons größer machen“, „Ladezeit beim Start verkürzen“.' } },
      { row: [{ note: 'Was funktioniert schon gut? (bitte nicht verändern):', h: 110, prompt: true, color: '#D1FAE5' }, { note: 'Fehlermeldungen (aus Konsole/Terminal kopieren):', h: 110, prompt: true, color: '#FEE2E2' }] },
      { slots: ['Screenshot 1', 'Screenshot 2', 'Screenshot 3'], h: 120 },
      { note: '📎 Screenshots per Klick oder Drag & Drop hinterlegen – und im KI-Tool zusätzlich hochladen, der Prompt enthält nur Text.', h: 60, color: '#FFEDD5' },
      { note: '📱 Tipp: Den klickbaren Prototyp mit „U“ aufs Board holen, mit 💬 kommentieren und über ⋯ → „Offene Kommentare → Weiterentwicklung“ direkt in diese Runde übernehmen.', h: 70, color: '#EDE9FE' },
      { sum: { mode: 'iteration', title: `Prompt für Weiterentwicklung #${n}`, h: 380 } },
    ];
  }
  function testingBlocks() {
    return [
      { ch: ['Status', ['Geplant', 'Läuft', 'Abgeschlossen'], { mode: 'single', cols: 3, status: true, sel: ['Geplant'] }] },
      { ch: ['Testmethode', ['Selbsttest', 'Freunde & Familie', 'Personen aus der Zielgruppe', 'Remote-Test per Videocall', 'Beta-Test (TestFlight / Google Play Testing)', 'Umfrage nach dem Test', 'A/B-Test zweier Varianten'], { cols: 2, label: 'Testmethode' }] },
      { ch: ['Testgeräte', ['iPhone', 'Android-Smartphone', 'Tablet', 'Desktop: Chrome', 'Desktop: Safari', 'Desktop: Firefox', 'Langsames Internet'], { cols: 2, label: 'Testgeräte' }] },
      { row: [{ note: 'Testpersonen (Anzahl, wer):', h: 90, prompt: true, color: '#E0F2FE' }, { note: 'Was soll der Test herausfinden?', h: 90, prompt: true, color: '#E0F2FE' }] },
      { fx: { title: 'Testaufgaben für die Tester', label: 'Testaufgaben', color: '#0284C7', hint: 'z. B. „Registriere dich und starte das erste Level“.' } },
      { note: 'Feedback & Beobachtungen der Tester (hier eintragen – die KI wertet es aus):', h: 130, prompt: true, color: '#FEF9C3' },
      { ch: ['Was soll die KI liefern?', [{ t: 'Testplan', p: 'Erstelle einen Testplan mit Ablauf und Zeitbedarf.' }, { t: 'Fragebogen für Tester', p: 'Erstelle einen kurzen Fragebogen (inkl. System Usability Scale).' }, { t: 'Feedback auswerten', p: 'Werte das Feedback oben aus und leite priorisierte To-dos ab.' }, { t: 'Einladungstext für Tester', p: 'Schreibe einen freundlichen Einladungstext für Testpersonen.' }, { t: 'Beta-Test einrichten', p: 'Erkläre Schritt für Schritt, wie ich einen Beta-Test über TestFlight bzw. Google Play einrichte.' }], { cols: 1, section: 'tasks' }] },
      { sum: { mode: 'testing', title: 'Prompt für das User Testing', h: 340 } },
    ];
  }
  function goliveBlocks() {
    return [
      { ch: ['Status', ['Vorbereitung', 'Eingereicht / in Prüfung', 'Live 🎉'], { mode: 'single', cols: 3, status: true, sel: ['Vorbereitung'] }] },
      { ch: ['Wo veröffentlichen?', ['Google Play Store (Android)', 'Apple App Store (iOS)', 'Web mit eigener Domain', 'GitHub Pages', 'Vercel / Netlify', 'itch.io (Spiele)', 'Microsoft Store', 'Chrome Web Store (Erweiterung)', 'Steam'], { cols: 2, label: 'Veröffentlichen in' }] },
      { ch: ['Was habe ich schon?', ['Google-Play-Entwicklerkonto', 'Apple Developer Program', 'Eigene Domain', 'Datenschutzerklärung', 'Impressum', 'App-Icon', 'Screenshots für den Store', 'Store-Beschreibung', 'Gewerbe angemeldet'], { cols: 2, haveList: true, noPrompt: false }] },
      { row: [{ note: 'App-Name & ggf. Paketname (com.name.app):', h: 90, prompt: true, color: '#D1FAE5' }, { note: 'Geplanter Termin / Kosten-Budget:', h: 90, prompt: true, color: '#D1FAE5' }] },
      { ch: ['Monetarisierung beim Start', ['Kostenlos', 'Werbung', 'In-App-Käufe', 'Abo', 'Einmalkauf'], { cols: 3, label: 'Monetarisierung' }] },
      { ch: ['Zusätzlich gewünscht', [{ t: 'Checkliste vor dem Launch', p: 'Erstelle eine Checkliste, was vor dem Launch erledigt sein muss.' }, { t: 'Store-Texte & Keywords', p: 'Schreibe Store-Texte (Titel, Kurz- und Langbeschreibung, Keywords).' }, { t: 'Datenschutzerklärung (Entwurf)', p: 'Erstelle einen Entwurf für eine Datenschutzerklärung (Hinweis: rechtlich prüfen lassen).' }, { t: 'Build- & Release-Einstellungen', p: 'Erkläre die nötigen Build- und Release-Einstellungen (Signierung, Versionsnummer, App-Bundle).' }, { t: 'Launch-Plan für Social Media', p: 'Erstelle einen Launch-Plan für Social Media und meinen YouTube-Kanal.' }, { t: 'Kosten-Übersicht', p: 'Liste alle einmaligen und laufenden Kosten auf.' }], { cols: 1, section: 'tasks' }] },
      { sum: { mode: 'golive', title: 'Prompt für den Go-Live', h: 360 } },
    ];
  }
  /** Verlauf + Testing + Go-Live in ein bestehendes Board einfügen */
  function addLifecycle() {
    const b = data.items.length ? bbox(data.items) : { x: 0, y: 0, w: 0, h: 0 };
    const x0 = b.x, y0 = b.y + b.h + 200, FW = 740, SW = 2000; pushUndo();
    const mk = (blocks, x, y, w, color, frameProps) => { const lay = layoutBlocks(blocks, x, y, w, color); const f = { id: uid(), type: 'frame', x, y, w, h: lay.h, color: '#FFFFFF', ...frameProps }; data.items.unshift(f); data.items.push(...lay.kids.map(k => ({ id: uid(), ...k }))); return f; };
    const ov = mk([{ devlog: true }], x0, y0, SW, '#7C3AED', { title: 'Entwicklungsverlauf (Übersicht)', color: '#F5F3FF', order: 40, phase: 'overview' });
    const it1 = mk(iterationBlocks(1), x0, ov.y + ov.h + 100, FW, '#EA580C', { title: 'Weiterentwicklung #1', order: 41, phase: 'iteration', iterNo: 1, created: today() });
    const ts = mk(testingBlocks(), x0, it1.y + it1.h + 100, FW, '#0284C7', { title: 'User Testing', order: 90, phase: 'testing' });
    mk(goliveBlocks(), x0 + FW + 70, ts.y, FW, '#059669', { title: 'Go-Live (Veröffentlichung)', order: 91, phase: 'golive' });
    render(); scheduleSave(); flyTo(ov, 60); toast('Verlauf, Weiterentwicklung, User Testing und Go-Live eingefügt');
  }
  /** neue Weiterentwicklungs-Runde per Klick anlegen */
  function addIteration() {
    const iters = data.items.filter(f => f.type === 'frame' && f.phase === 'iteration').sort((a, b) => (a.iterNo || 0) - (b.iterNo || 0));
    const n = (iters.length ? Math.max(...iters.map(f => f.iterNo || 0)) : 0) + 1;
    const FW = 740; let x, y;
    let lane = null;
    if (iters.length) { const last = iters[iters.length - 1]; lane = data.items.find(l => l.type === 'lane' && !l.guide && inside(last, l));
      if (lane) { x = last.x; y = Math.max(...iters.filter(f => inside(f, lane)).map(f => f.y + f.h)) + 60; } else { x = last.x + last.w + 80; y = last.y; } }
    else { const ov = data.items.find(f => f.type === 'frame' && f.phase === 'overview'); if (ov) { x = ov.x; y = ov.y + ov.h + 100; } else { const b = data.items.length ? bbox(data.items) : { x: 0, y: 0, w: 0, h: 0 }; x = b.x + b.w + 150; y = b.y; } }
    const fw = lane ? iters[iters.length - 1].w : FW;
    const lay = layoutBlocks(iterationBlocks(n), x, y, fw, lane ? lane.c : '#EA580C');
    pushUndo();
    if (lane) { const need = y + lay.h + 40 - lane.y; if (need > lane.h) lane.h = need; }
    const frame = { id: uid(), type: 'frame', x, y, w: fw, h: lay.h, color: '#FFFFFF', title: lane ? `${iters[0].title.match(/^\d+/)?.[0] || 7}.${n} · Weiterentwicklung #${n}` : `Weiterentwicklung #${n}`, order: (lane ? 700 : 40) + n, phase: 'iteration', iterNo: n, created: today() };
    const kids = lay.kids.map(k => ({ id: uid(), ...k }));
    // die Status-Auswahl der vorherigen Runde auf „Erledigt“ vorschlagen? – bewusst nicht automatisch
    data.items.unshift(frame); data.items.push(...kids);
    render(); scheduleSave(); flyTo(frame, 40); select(frame.id);
    toast(`Weiterentwicklung #${n} angelegt – trage ein, was nicht funktioniert oder fehlt`);
  }


  // ---------- Eigene Board-Vorlagen ---------------------------------------
  async function saveBoardTemplate() {
    if (!data.items.length) return toast('Das Board ist leer');
    const sel = selItems();
    const v = await openForm({ title: 'Als Board-Vorlage speichern', submitLabel: 'Speichern',
      values: { name: board.name, scope: sel.length > 1 ? 'sel' : 'all', reset: false },
      extra: '<p class="muted small" style="margin:-6px 0 12px">Gespeichert werden alle Elemente samt Frames, Farben, Auswahllisten, Verbindungen und Animationen. Die Vorlage steht danach in jedem Board unter „Board-Vorlage“ und beim Anlegen neuer Boards zur Verfügung.</p>',
      fields: [
        { key: 'name', label: 'Name der Vorlage', required: true },
        { key: 'scope', label: 'Umfang', type: 'select', options: [['all', `Ganzes Board (${data.items.length} Elemente)`], ...(sel.length > 1 ? [['sel', `Nur Auswahl (${sel.length} Elemente)`]] : [])] },
        { key: 'reset', label: 'Ausgewählte Optionen in Auswahllisten zurücksetzen (leere Vorlage)', type: 'checkbox' },
      ] });
    if (!v) return;
    let items = v.scope === 'sel' ? sel : data.items;
    const ids = new Set(items.map(i => i.id));
    if (v.scope === 'sel') items.filter(i => i.type === 'frame').forEach(f => data.items.forEach(c => { if (inside(c, f)) ids.add(c.id); }));
    items = data.items.filter(i => ids.has(i.id)).filter(i => i.type !== 'embed' || true);
    const b = bbox(items);
    const copy = JSON.parse(JSON.stringify(items)).map(i => { i.x -= b.x; i.y -= b.y; delete i.locked; if (v.reset && i.type === 'choice') i.options.forEach(o => { o.on = false; }); return i; });
    const tpl = { id: uid(), name: v.name, items: copy, connectors: JSON.parse(JSON.stringify(data.connectors.filter(c => ids.has(c.from) && ids.has(c.to)))) };
    const list = getSetting('boardTemplates', []).filter(x => x.name !== v.name);
    await setSetting('boardTemplates', [...list, tpl]);
    toast(`Vorlage „${v.name}“ gespeichert${list.length !== getSetting('boardTemplates', []).length - 1 ? ' (überschrieben)' : ''}`);
  }
  function insertBoardTemplate(tpl) {
    const xs = data.items.map(i => i.x + i.w);
    const ox = xs.length ? Math.max(...xs) + 200 : 0, oy = data.items.length ? Math.min(...data.items.map(i => i.y)) : 0;
    const map = {}, groups = {}, carousels = {};
    pushUndo();
    const items = JSON.parse(JSON.stringify(tpl.items)).map(i => { const nid = uid(); map[i.id] = nid; i.id = nid; i.x += ox; i.y += oy; if (i.group) i.group = groups[i.group] ||= uid(); if (i.carousel) i.carousel = carousels[i.carousel] ||= uid(); return i; });
    data.items.unshift(...items.filter(i => i.type === 'frame')); data.items.push(...items.filter(i => i.type !== 'frame'));
    (tpl.connectors || []).forEach(c => { if (map[c.from] && map[c.to]) data.connectors.push({ ...c, id: uid(), from: map[c.from], to: map[c.to] }); });
    render(); world.style.transition = 'transform .5s ease'; data.view = viewFor(bbox(items), 60); applyView(); setTimeout(() => { world.style.transition = ''; }, 550);
    scheduleSave(); toast(`Vorlage „${tpl.name}“ eingefügt`);
  }
  async function manageBoardTemplates() {
    const own = getSetting('boardTemplates', []);
    const id = await choose('Eigene Board-Vorlagen', own.map(t => ({ value: t.id, label: t.name, desc: `${t.items.length} Elemente · klicken zum Umbenennen oder Löschen`, icon: 'bookmark' })));
    if (!id) return;
    const t = own.find(x => x.id === id);
    const act = await choose(`„${t.name}“`, [{ value: 'rename', label: 'Umbenennen', icon: 'pencil' }, { value: 'delete', label: 'Löschen', icon: 'trash-2' }]);
    if (act === 'rename') { const v = await openForm({ title: 'Vorlage umbenennen', values: { name: t.name }, fields: [{ key: 'name', label: 'Name', required: true }] }); if (v) { t.name = v.name; await setSetting('boardTemplates', own); toast('Umbenannt'); } }
    if (act === 'delete' && confirm(`Vorlage „${t.name}“ löschen?`)) { await setSetting('boardTemplates', own.filter(x => x.id !== id)); toast('Vorlage gelöscht'); }
  }

  return { mount };
})();
