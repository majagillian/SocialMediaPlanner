'use strict';
/* =========================================================================
   Violet Planner – Video-Editor für Social Media
   Zeitleiste mit Spuren, Schnitt, Filter & Belichtung, Text, Übergänge,
   Musik, Voiceover-Aufnahme, Ducking, Export (Reels, Shorts, YouTube …)
   Vorschau und Export nutzen denselben Canvas-Renderer (WYSIWYG).
   ========================================================================= */
window.VideoEditor = (() => {
  const FORMATS = {
    '9:16': { w: 1080, h: 1920, label: '9:16 · Reel, TikTok, Short, Story' },
    '4:5': { w: 1080, h: 1350, label: '4:5 · Instagram-Feed' },
    '1:1': { w: 1080, h: 1080, label: '1:1 · Quadrat' },
    '16:9': { w: 1920, h: 1080, label: '16:9 · YouTube' },
  };
  const TRACKS = [
    { id: 'sub', label: 'Untertitel', kind: 'text', icon: 'captions' },
    { id: 'txt', label: 'Text', kind: 'text', icon: 'type' },
    { id: 'v2', label: 'Overlay', kind: 'visual', icon: 'layers' },
    { id: 'v1', label: 'Video', kind: 'visual', icon: 'film' },
    { id: 'vo', label: 'Voiceover', kind: 'audio', icon: 'mic' },
    { id: 'mus', label: 'Musik', kind: 'audio', icon: 'music' },
  ];
  const ADJ = [
    ['exposure', 'Belichtung', -1, 1], ['contrast', 'Kontrast', -1, 1], ['saturation', 'Sättigung', -1, 1],
    ['temperature', 'Temperatur', -1, 1], ['tint', 'Tönung', -1, 1], ['hue', 'Farbton', -180, 180],
    ['fade', 'Verblassen', 0, 1], ['vignette', 'Vignette', 0, 1], ['blur', 'Weichzeichner', 0, 20], ['grain', 'Körnung', 0, 1],
  ];
  const FILTERS = {
    none: { label: 'Original', adj: {} },
    vivid: { label: 'Lebendig', adj: { saturation: 0.35, contrast: 0.12 } },
    warm: { label: 'Warm', adj: { temperature: 0.5, saturation: 0.1, exposure: 0.03 } },
    cool: { label: 'Kühl', adj: { temperature: -0.5, contrast: 0.05 } },
    cinema: { label: 'Kino', adj: { contrast: 0.25, saturation: -0.15, temperature: 0.12, tint: -0.1, vignette: 0.45 } },
    vintage: { label: 'Vintage', css: 'sepia(0.35)', adj: { contrast: -0.1, exposure: 0.05, fade: 0.25, vignette: 0.5, grain: 0.3 } },
    bw: { label: 'Schwarz-Weiß', css: 'grayscale(1)', adj: { contrast: 0.15 } },
    noir: { label: 'Noir', css: 'grayscale(1)', adj: { contrast: 0.5, exposure: -0.05, vignette: 0.7, grain: 0.25 } },
    matte: { label: 'Matt', adj: { contrast: -0.25, exposure: 0.05, saturation: -0.2, fade: 0.35 } },
    sunset: { label: 'Sonnenuntergang', adj: { temperature: 0.75, saturation: 0.2, tint: 0.2, exposure: 0.02 } },
    pastel: { label: 'Pastell', adj: { saturation: -0.3, exposure: 0.12, contrast: -0.15, fade: 0.2 } },
    drama: { label: 'Drama', adj: { contrast: 0.45, saturation: -0.2, vignette: 0.55, exposure: -0.05 } },
    fresh: { label: 'Frisch', adj: { exposure: 0.08, saturation: 0.15, temperature: -0.15, contrast: 0.08 } },
    golden: { label: 'Goldene Stunde', adj: { temperature: 0.55, exposure: 0.06, saturation: 0.12, vignette: 0.2 } },
  };
  const ANIMS = [['none', 'Keine'], ['fade', 'Einblenden'], ['black', 'Aus Schwarz'], ['slideL', 'Von links'], ['slideR', 'Von rechts'], ['slideU', 'Von unten'],
    ['zoom', 'Zoom'], ['pop', 'Pop'], ['wipe', 'Wischen'], ['blur', 'Unschärfe'], ['spin', 'Drehen'], ['type', 'Schreibmaschine (Text)']];
  const FONTS = [['Inter, system-ui, sans-serif', 'Modern (Sans)'], ['"Arial Black", Impact, sans-serif', 'Fett (Arial Black)'], ['Impact, Haettenschweiler, sans-serif', 'Impact'],
    ['Georgia, "Times New Roman", serif', 'Serif'], ['"Courier New", monospace', 'Schreibmaschine'], ['"Comic Sans MS", "Marker Felt", cursive', 'Handschrift'], ['"Trebuchet MS", sans-serif', 'Rund']];
  const TEXT_PRESETS = {
    hook: { label: 'Hook (groß)', style: { font: FONTS[1][0], size: 92, color: '#FFFFFF', stroke: 6, strokeColor: '#000000', bg: 0, weight: 900, align: 'center', y: 0.22, upper: true }, inAnim: 'pop' },
    title: { label: 'Titel', style: { font: FONTS[0][0], size: 84, color: '#FFFFFF', bg: 0, weight: 800, align: 'center', y: 0.45, shadow: 1 }, inAnim: 'slideU' },
    caption: { label: 'Untertitel', style: { font: FONTS[0][0], size: 54, color: '#FFFFFF', bg: 0.75, bgColor: '#000000', weight: 700, align: 'center', y: 0.72 }, inAnim: 'fade' },
    box: { label: 'Box (Violett)', style: { font: FONTS[0][0], size: 60, color: '#FFFFFF', bg: 1, bgColor: '#7C3AED', weight: 800, align: 'center', y: 0.5 }, inAnim: 'pop' },
    mint: { label: 'Highlight (Mint)', style: { font: FONTS[0][0], size: 60, color: '#1F1B2E', bg: 1, bgColor: '#34D399', weight: 800, align: 'center', y: 0.5 }, inAnim: 'slideL' },
    lower: { label: 'Bauchbinde', style: { font: FONTS[0][0], size: 46, color: '#FFFFFF', bg: 0.9, bgColor: '#7C3AED', weight: 700, align: 'left', x: -0.3, y: 0.82 }, inAnim: 'slideL' },
    outline: { label: 'Kontur', style: { font: FONTS[2][0], size: 110, color: 'rgba(0,0,0,0)', stroke: 5, strokeColor: '#FFFFFF', bg: 0, weight: 400, align: 'center', y: 0.4, upper: true }, inAnim: 'zoom' },
    neon: { label: 'Neon', style: { font: FONTS[6][0], size: 80, color: '#FFFFFF', bg: 0, weight: 700, align: 'center', y: 0.4, glow: '#A78BFA' }, inAnim: 'fade' },
    cta: { label: 'Call-to-Action', style: { font: FONTS[0][0], size: 56, color: '#FFFFFF', bg: 1, bgColor: '#FB923C', weight: 800, align: 'center', y: 0.8 }, inAnim: 'pop', text: 'Folgen für mehr 👉' },
  };
  const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
  const uid = () => Math.random().toString(36).slice(2, 10);
  const fmtT = (s, frames) => { s = Math.max(0, s); const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${pad(sec)}${frames ? '.' + Math.floor((s % 1) * 10) : ''}`; };

  let root, canvas, ctx, off, offCtx, proj, P, sel = null, time = 0, playing = false, t0 = 0, tStart = 0, pps = 60;
  let rt = {}, images = {}, peaks = {}, ac = null, master = null, streamDest = null, raf = 0, saveTimer = null, undoStack = [], redoStack = [];
  let snap = true, safeZones = false, exporting = false, recorder = null, leftTab = 'media', inspTab = 'image', drag = null, grainCanvas = null;

  // =========================================================================
  // Projektliste
  // =========================================================================
  function mount(main) {
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    if (qs.get('post')) {
      const postId = Number(qs.get('post'));
      const existing = S.videos.find(v => v.post_id === postId);
      if (existing) return openProject(main, existing);
      const post = byId('posts', postId);
      createProject({ name: post?.title || 'Neues Video', aspect: FORMATS[post?.aspect] ? post.aspect : '9:16', post_id: postId, template: 'blank' }).then(v => openProject(main, v));
      main.innerHTML = '<div class="loading">Lege Projekt an …</div>';
      return () => cleanup();
    }
    if (qs.get('id')) { const v = S.videos.find(x => x.id === Number(qs.get('id'))); if (v) return openProject(main, v); }
    renderList(main);
    return () => cleanup();
  }

  function renderList(main) {
    const list = [...S.videos].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    main.innerHTML = pageHead('Video-Editor', 'Schneide Reels, Shorts, Stories und YouTube-Videos – mit Filtern, Text, Voiceover und Musik.',
      `<button class="btn primary" data-new>+ Neues Video</button>`) +
      `<div class="vid-grid">${list.map(v => {
        const d = parseJSON(v.data, {}); const dur = projectDuration(d);
        const thumb = (d.assets || []).find(a => a.thumb)?.thumb;
        const post = v.post_id ? byId('posts', v.post_id) : null;
        return `<div class="vid-card" data-open="${v.id}">
          <div class="vid-thumb ${v.aspect === '16:9' ? 'wide' : ''}" style="${thumb ? `background-image:url(${thumb})` : ''}"><span>${esc(v.aspect)}</span></div>
          <div class="vid-info"><b>${esc(v.name)}</b><small>${fmtT(dur)} · ${(d.clips || []).length} Clips${post ? ` · Post: ${esc(post.title)}` : ''}</small></div>
          <div class="vid-actions"><button class="mini" data-ren="${v.id}" title="Umbenennen">✎</button><button class="mini" data-del="${v.id}" title="Löschen">×</button></div>
        </div>`;
      }).join('') || empty('Noch keine Videos. Lege dein erstes Projekt an.')}</div>`;
    main.onclick = async e => {
      const t = e.target.closest('[data-new],[data-open],[data-ren],[data-del]'); if (!t) return;
      if (t.dataset.new !== undefined) return newProjectDialog();
      if (t.dataset.del) { e.stopPropagation(); const v = byId('videos', t.dataset.del); if (confirm(`Projekt „${v.name}“ löschen? (Mediendateien bleiben erhalten)`)) { await DB.remove('videos', v.id); renderList(main); } return; }
      if (t.dataset.ren) { e.stopPropagation(); const v = byId('videos', t.dataset.ren); const r = await openForm({ title: 'Umbenennen', values: { name: v.name }, fields: [{ key: 'name', label: 'Name', required: true }] }); if (r) { await DB.update('videos', v.id, { name: r.name }, true); renderList(main); } return; }
      if (t.dataset.open) { location.hash = '#/video?id=' + t.dataset.open; }
    };
  }

  async function newProjectDialog(defaults = {}) {
    const v = await openForm({
      title: 'Neues Video', submitLabel: 'Anlegen', values: defaults,
      fields: [
        { key: 'name', label: 'Name', required: true, default: 'Neues Video' },
        { key: 'aspect', label: 'Format', type: 'select', options: Object.entries(FORMATS).map(([k, f]) => [k, f.label]) },
        { key: 'template', label: 'Vorlage', type: 'select', options: [['blank', 'Leer'], ['tips', 'Reel: Hook + 3 Tipps + CTA'], ['intro', 'YouTube-Intro'], ['story', 'Story-Ankündigung'], ['quote', 'Zitat-Video']] },
        { key: 'post_id', label: 'Mit Beitrag verknüpfen (optional)', type: 'select', numeric: true, options: [['', '– keiner –'], ...S.posts.map(p => [p.id, p.title])] },
        { key: 'project_id', label: 'Projekt (optional)', type: 'select', numeric: true, options: [['', '– keines –'], ...S.projects.map(p => [p.id, p.name])] },
      ],
    });
    if (!v) return;
    const created = await createProject(v);
    location.hash = '#/video?id=' + created.id;
  }

  async function createProject({ name, aspect, template, post_id, project_id }) {
    const d = { format: aspect || '9:16', bg: { mode: 'blur', color: '#1F1B2E' }, assets: [], clips: [] };
    const T = (text, preset, start, dur, extra = {}) => d.clips.push(textClip(text, preset, start, dur, extra));
    if (template === 'tips') {
      d.bg = { mode: 'color', color: '#7C3AED' };
      T('3 Fehler, die deine Reels killen', 'hook', 0, 3);
      T('1. Kein Hook', 'box', 3, 3); T('2. Zu lang', 'mint', 6, 3); T('3. Kein Call-to-Action', 'box', 9, 3);
      T('Folgen für mehr Tipps 👉', 'cta', 12, 3);
    }
    if (template === 'intro') {
      d.bg = { mode: 'color', color: '#1F1B2E' };
      T('Kanalname', 'title', 0.3, 4, { style: { ...TEXT_PRESETS.title.style, size: 110 } });
      T('Folge 1 · Thema des Videos', 'caption', 1.2, 3.1, { style: { ...TEXT_PRESETS.caption.style, y: 0.62, bgColor: '#7C3AED', bg: 1 } });
    }
    if (template === 'story') {
      d.bg = { mode: 'color', color: '#FB923C' };
      T('NEU', 'box', 0, 5, { style: { ...TEXT_PRESETS.box.style, y: 0.2, size: 48 } });
      T('Morgen um 18 Uhr\nkommt etwas Großes', 'title', 0.4, 4.6);
      T('Erinnern lassen 🔔', 'cta', 1.5, 3.5);
    }
    if (template === 'quote') {
      d.bg = { mode: 'color', color: '#1F1B2E' };
      T('„Konsistenz schlägt Perfektion.“', 'title', 0.5, 5, { inAnim: 'type', inDur: 2 });
      T('— dein Name', 'caption', 3, 2.5, { style: { ...TEXT_PRESETS.caption.style, bg: 0, y: 0.6 } });
    }
    if (!project_id && post_id) project_id = byId('posts', post_id)?.project_id || null;
    return DB.create('videos', { name, aspect: d.format, post_id: post_id || null, project_id: project_id || null, data: JSON.stringify(d) }, true);
  }
  function textClip(text, preset = 'title', start = 0, dur = 3, extra = {}) {
    const pr = TEXT_PRESETS[preset] || TEXT_PRESETS.title;
    return { id: uid(), track: 'txt', type: 'text', text: text || pr.text || 'Dein Text', start, dur, style: { ...pr.style }, inAnim: pr.inAnim || 'fade', inDur: 0.4, outAnim: 'fade', outDur: 0.3, x: 0, y: 0, scale: 1, rot: 0, opacity: 1, ...extra };
  }
  const projectDuration = d => Math.max(0, ...(d.clips || []).map(c => c.start + c.dur));

  // =========================================================================
  // Editor
  // =========================================================================
  function openProject(main, v) {
    proj = v; P = parseJSON(v.data, {}); P.assets ||= []; P.clips ||= []; P.format ||= v.aspect || '9:16'; P.bg ||= { mode: 'blur', color: '#1F1B2E' };
    sel = null; time = 0; playing = false; undoStack = []; redoStack = []; rt = {}; images = {};
    main.innerHTML = `
      <div class="ve">
        <div class="ve-top">
          <button class="btn sm ghost" data-a="back">‹ Projekte</button>
          <input class="input ve-name" value="${esc(v.name)}">
          <select class="input sm ve-format">${Object.entries(FORMATS).map(([k, f]) => `<option value="${k}" ${k === P.format ? 'selected' : ''}>${f.label}</option>`).join('')}</select>
          <span class="grow"></span>
          <button class="btn sm ghost" data-a="undo" title="Rückgängig (Strg+Z)">${ic('undo-2', '#6B6780', 'ic sm')}</button>
          <button class="btn sm ghost" data-a="redo" title="Wiederholen (Strg+Shift+Z)">${ic('redo-2', '#6B6780', 'ic sm')}</button>
          ${v.post_id ? `<button class="btn sm ghost" data-a="post">${ic('send', '#7C3AED', 'ic sm')} Beitrag</button>` : ''}
          <button class="btn sm primary" data-a="export">${ic('download', '#FFFFFF', 'ic sm')} Exportieren</button>
        </div>
        <div class="ve-main">
          <aside class="ve-left">
            <div class="ve-tabs">${[['media', 'Medien', 'folder-open'], ['text', 'Text', 'type'], ['audio', 'Audio', 'music'], ['filter', 'Filter', 'sparkles']]
              .map(([k, l, i]) => `<button data-lt="${k}">${ic(i, '#6B6780', 'ic sm')}<span>${l}</span></button>`).join('')}</div>
            <div class="ve-left-body"></div>
          </aside>
          <section class="ve-stage">
            <div class="ve-canvas-wrap"><canvas class="ve-canvas"></canvas><div class="ve-safe"></div><div class="ve-drop-hint">Dateien hier ablegen</div></div>
            <div class="ve-transport">
              <button class="mini" data-a="start" title="Zum Anfang">⏮</button>
              <button class="ve-play" data-a="play" title="Abspielen (Leertaste)">▶</button>
              <button class="mini" data-a="end" title="Zum Ende">⏭</button>
              <span class="ve-time">0:00.0 / 0:00</span>
              <span class="grow"></span>
              <label class="ve-check"><input type="checkbox" data-a="safe"> Sicherheitszonen</label>
              <select class="input sm ve-bg" title="Hintergrund bei Einpassen"><option value="blur">Hintergrund: unscharf</option><option value="color">Hintergrund: Farbe</option></select>
              <input type="color" class="ve-bgcolor" value="${toHex(P.bg.color)}" title="Hintergrundfarbe">
            </div>
          </section>
          <aside class="ve-insp"></aside>
        </div>
        <div class="ve-timeline">
          <div class="ve-tl-tools">
            <button class="pbtn" data-a="split" title="Am Abspielkopf teilen (S)">${ic('scissors', '#4B4563', 'ic xs')} Teilen</button>
            <button class="pbtn" data-a="dup" title="Duplizieren (Strg+D)">${ic('copy', '#4B4563', 'ic xs')} Duplizieren</button>
            <button class="pbtn" data-a="del" title="Löschen (Entf)">${ic('trash-2', '#4B4563', 'ic xs')} Löschen</button>
            <button class="pbtn" data-a="ripple" title="Lücken in der Video-Spur schließen">${ic('fold-horizontal', '#4B4563', 'ic xs')} Lücken schließen</button>
            <label class="ve-check"><input type="checkbox" data-a="snap" checked> Einrasten</label>
            <span class="grow"></span>
            <span class="muted small">Zoom</span><input type="range" min="10" max="300" value="${pps}" class="ve-zoom">
          </div>
          <div class="ve-tl-scroll">
            <div class="ve-tl-inner">
              <div class="ve-ruler"></div>
              ${TRACKS.map(t => `<div class="ve-track ve-${t.kind}" data-track="${t.id}"><div class="ve-track-label">${ic(t.icon, '#8A85A0', 'ic xs')}${t.label}</div><div class="ve-track-lane"></div></div>`).join('')}
              <div class="ve-playhead"><i></i></div>
            </div>
          </div>
        </div>
        <input type="file" class="ve-file" accept="video/*,audio/*,image/*" multiple hidden>
      </div>`;
    root = $('.ve', main); canvas = $('.ve-canvas', root); ctx = canvas.getContext('2d');
    off = document.createElement('canvas'); offCtx = off.getContext('2d');
    setCanvasSize(false);
    bindUI();
    P.assets.forEach(a => prepareAsset(a));
    drawLeft(); drawInspector(); drawTimeline(); requestRender();
    window.addEventListener('resize', fitCanvas);
    fitCanvas();
    return () => cleanup();
  }

  function cleanup() {
    playing = false; cancelAnimationFrame(raf);
    if (saveTimer) saveNow();
    Object.values(rt).forEach(r => { try { r.el.pause(); r.el.removeAttribute('src'); r.el.load(); } catch { /* egal */ } });
    rt = {};
    if (ac) { ac.close().catch(() => {}); ac = null; master = null; streamDest = null; }
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', fitCanvas);
    proj = null;
  }

  function setCanvasSize(full) {
    const f = FORMATS[P.format]; const s = full ? 1 : (f.w > f.h ? 960 / f.w : 540 / f.w);
    canvas.width = Math.round(f.w * s); canvas.height = Math.round(f.h * s);
    off.width = canvas.width; off.height = canvas.height;
  }
  function fitCanvas() {
    if (!root) return;
    const wrap = $('.ve-canvas-wrap', root); const f = FORMATS[P.format];
    const W = wrap.clientWidth - 16, H = wrap.clientHeight - 16; const s = Math.min(W / f.w, H / f.h);
    canvas.style.width = Math.max(50, f.w * s) + 'px'; canvas.style.height = Math.max(50, f.h * s) + 'px';
    const safe = $('.ve-safe', root); safe.style.width = canvas.style.width; safe.style.height = canvas.style.height;
    safe.classList.toggle('on', safeZones); safe.dataset.fmt = P.format;
  }

  // ---------- Speichern & Rückgängig ---------------------------------------
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 700); }
  function saveNow() {
    clearTimeout(saveTimer); saveTimer = null; if (!proj) return;
    DB.update('videos', proj.id, { data: JSON.stringify(P), aspect: P.format, name: $('.ve-name', root)?.value || proj.name }, true).catch(() => {});
  }
  const snapshotP = () => JSON.stringify({ clips: P.clips, assets: P.assets.map(a => ({ ...a })), bg: P.bg, format: P.format });
  function commit(before) { undoStack.push(before); if (undoStack.length > 100) undoStack.shift(); redoStack = []; scheduleSave(); }
  function change(fn, { timeline = true, insp = true } = {}) {
    const before = snapshotP(); fn(); commit(before);
    if (timeline) drawTimeline(); if (insp) drawInspector(); syncMedia(true); requestRender();
  }
  function undo(redo) {
    const from = redo ? redoStack : undoStack, to = redo ? undoStack : redoStack;
    const s = from.pop(); if (!s) return toast(redo ? 'Nichts zum Wiederholen' : 'Nichts zum Rückgängigmachen');
    to.push(snapshotP()); const d = JSON.parse(s); Object.assign(P, d);
    if (!P.clips.find(c => c.id === sel)) sel = null;
    drawTimeline(); drawInspector(); syncMedia(true); requestRender(); scheduleSave();
  }

  // ---------- Medien ------------------------------------------------------
  async function uploadFile(file, nameHint) {
    const res = await fetch('/api/media?name=' + encodeURIComponent(nameHint || file.name), { method: 'POST', body: file });
    if (!res.ok) throw new Error('Upload fehlgeschlagen');
    return res.json();
  }
  async function addFiles(files) {
    for (const file of files) {
      const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('image') ? 'image' : null;
      if (!type) { toast(`${file.name}: Dateityp wird nicht unterstützt`); continue; }
      toast(`Lade ${file.name} hoch …`);
      try {
        const up = await uploadFile(file);
        const a = { id: uid(), url: up.url, name: file.name, type, size: up.size };
        await probe(a);
        change(() => P.assets.push(a), { timeline: false, insp: false });
        prepareAsset(a); drawLeft();
        if (!P.clips.some(c => c.track === (type === 'audio' ? 'mus' : 'v1'))) addClipFromAsset(a); // erstes Medium gleich einfügen
      } catch (e) { toast(e.message); }
    }
  }
  function probe(a) {
    return new Promise(resolve => {
      if (a.type === 'image') {
        const img = new Image(); img.onload = () => { a.w = img.naturalWidth; a.h = img.naturalHeight; a.dur = 5; a.thumb = thumbFrom(img, img.naturalWidth, img.naturalHeight); resolve(); };
        img.onerror = () => resolve(); img.src = a.url; return;
      }
      const el = document.createElement(a.type === 'video' ? 'video' : 'audio');
      el.preload = 'auto'; el.muted = true; el.src = a.url;
      el.onloadedmetadata = () => {
        a.dur = isFinite(el.duration) ? el.duration : 0; if (a.type === 'audio') return resolve();
        a.w = el.videoWidth; a.h = el.videoHeight; el.currentTime = Math.min(0.5, a.dur / 2);
      };
      el.onseeked = () => { a.thumb = thumbFrom(el, a.w, a.h); resolve(); };
      el.onerror = () => resolve();
      setTimeout(resolve, 8000);
    });
  }
  function thumbFrom(src, w, h) {
    const c = document.createElement('canvas'); const s = 160 / Math.max(w, h); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
    try { c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.7); } catch { return null; }
  }
  function prepareAsset(a) {
    if (a.type === 'image' && !images[a.id]) { const img = new Image(); img.onload = requestRender; img.src = a.url; images[a.id] = img; }
    if ((a.type === 'audio' || (a.type === 'video' && (a.size || 0) < 250e6)) && !peaks[a.id]) loadPeaks(a);
  }
  async function loadPeaks(a) {
    try {
      peaks[a.id] = 'loading';
      const buf = await (await fetch(a.url)).arrayBuffer();
      const tmp = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, 44100);
      const audio = await tmp.decodeAudioData(buf);
      const data = audio.getChannelData(0); const perSec = 50; const n = Math.ceil(audio.duration * perSec); const step = Math.floor(data.length / n) || 1;
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) { let m = 0; for (let j = i * step, e = Math.min(data.length, j + step); j < e; j += 8) m = Math.max(m, Math.abs(data[j])); out[i] = m; }
      peaks[a.id] = { perSec, data: out }; drawTimeline();
    } catch { peaks[a.id] = null; }
  }
  const asset = c => P.assets.find(a => a.id === c.asset);

  function addClipFromAsset(a, track, start) {
    track ||= a.type === 'audio' ? (/(voice|vo|sprach|aufnahme)/i.test(a.name) ? 'vo' : 'mus') : (P.clips.some(c => c.track === 'v1') && start != null ? 'v1' : 'v1');
    if (start == null) start = track === 'v1' ? Math.max(0, ...P.clips.filter(c => c.track === 'v1').map(c => c.start + c.dur)) : time;
    const dur = a.type === 'image' ? 4 : (a.dur || 5);
    const c = { id: uid(), track, asset: a.id, type: a.type, start: Math.max(0, start), in: 0, dur, speed: 1, volume: 1, fadeIn: 0, fadeOut: 0,
      fit: a.type === 'image' && track === 'v2' ? 'fit' : 'fill', x: 0, y: 0, scale: track === 'v2' ? 0.45 : 1, rot: 0, opacity: 1,
      filter: 'none', filterAmt: 1, adj: {}, inAnim: 'none', inDur: 0.5, outAnim: 'none', outDur: 0.5, kenburns: a.type === 'image', duck: track === 'mus' };
    change(() => { P.clips.push(c); sel = c.id; });
    return c;
  }

  // ---------- Audio-Engine ------------------------------------------------
  function ensureAudio() {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.connect(ac.destination);
    streamDest = ac.createMediaStreamDestination(); master.connect(streamDest);
  }
  function runtime(c) {
    if (rt[c.id]) return rt[c.id];
    const a = asset(c); if (!a || a.type === 'image') return null;
    const el = document.createElement(a.type === 'video' ? 'video' : 'audio');
    el.src = a.url; el.preload = 'auto'; el.playsInline = true; el.crossOrigin = 'anonymous';
    el.addEventListener('seeked', requestRender); el.addEventListener('loadeddata', requestRender);
    const r = { el, gain: null };
    try { ensureAudio(); const src = ac.createMediaElementSource(el); r.gain = ac.createGain(); src.connect(r.gain); r.gain.connect(master); } catch { /* ohne WebAudio */ }
    rt[c.id] = r; return r;
  }
  const active = (c, t) => t >= c.start && t < c.start + c.dur;
  function clipGain(c, t) {
    if (c.muted || c.type === 'image' || c.type === 'text') return 0;
    let g = c.volume ?? 1; const local = t - c.start;
    if (c.fadeIn > 0 && local < c.fadeIn) g *= local / c.fadeIn;
    if (c.fadeOut > 0 && c.dur - local < c.fadeOut) g *= Math.max(0, (c.dur - local) / c.fadeOut);
    if (c.duck && P.clips.some(v => v.track === 'vo' && !v.muted && active(v, t))) g *= c.duckLevel ?? 0.25;
    return Math.max(0, g);
  }
  function syncMedia(force) {
    const t = time;
    P.clips.forEach(c => {
      if (c.type === 'text' || c.type === 'image') return;
      const on = active(c, t) || (!playing && Math.abs(t - c.start) < 0.001);
      if (!on) { const r = rt[c.id]; if (r && !r.el.paused) r.el.pause(); return; }
      const r = runtime(c); if (!r) return;
      const want = (c.in || 0) + (t - c.start) * (c.speed || 1);
      r.el.playbackRate = c.speed || 1;
      const g = clipGain(c, t);
      if (r.gain) r.gain.gain.setTargetAtTime(g, ac.currentTime, 0.04); else r.el.volume = Math.min(1, g);
      if (playing) {
        if (r.el.paused) { r.el.currentTime = want; r.el.play().catch(() => {}); }
        else if (Math.abs(r.el.currentTime - want) > 0.3) r.el.currentTime = want;
      } else {
        if (!r.el.paused) r.el.pause();
        if (force || Math.abs(r.el.currentTime - want) > 0.04) { try { r.el.currentTime = want; } catch { /* noch nicht geladen */ } }
      }
    });
  }

  // ---------- Wiedergabe --------------------------------------------------
  function play() {
    if (playing) return pause();
    ensureAudio(); ac.resume();
    const end = projectDuration(P); if (time >= end - 0.05) time = 0;
    playing = true; t0 = performance.now(); tStart = time;
    $('[data-a=play]', root).textContent = '❚❚';
    syncMedia(true); loop();
  }
  function pause() {
    playing = false; cancelAnimationFrame(raf);
    $('[data-a=play]', root) && ($('[data-a=play]', root).textContent = '▶');
    Object.values(rt).forEach(r => r.el.pause()); syncMedia(true); requestRender(); updateTimeUI();
  }
  function loop() {
    if (!playing) return;
    time = tStart + (performance.now() - t0) / 1000;
    const end = projectDuration(P);
    if (time >= end) { time = end; if (exporting) { finishExport(); return; } pause(); return; }
    syncMedia(false); render(); updateTimeUI();
    raf = requestAnimationFrame(loop);
  }
  function seek(t) {
    time = Math.max(0, t); if (playing) { t0 = performance.now(); tStart = time; }
    syncMedia(true); requestRender(); updateTimeUI();
  }
  let renderQueued = false;
  function requestRender() { if (renderQueued || playing) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }
  function updateTimeUI() {
    const tEl = $('.ve-time', root); if (!tEl) return;
    tEl.textContent = `${fmtT(time, true)} / ${fmtT(projectDuration(P))}`;
    const ph = $('.ve-playhead', root); ph.style.left = (120 + time * pps) + 'px';
    if (playing) { const sc = $('.ve-tl-scroll', root); const x = 120 + time * pps; if (x > sc.scrollLeft + sc.clientWidth - 40) sc.scrollLeft = x - 160; }
  }

  // ---------- Renderer ----------------------------------------------------
  function animState(c, t) {
    const local = t - c.start; const st = { alpha: 1, dx: 0, dy: 0, scale: 1, rot: 0, blur: 0, wipe: 1, black: 0, chars: 1 };
    const apply = (anim, p) => { // p: 0 = unsichtbar, 1 = fertig
      const e = 1 - Math.pow(1 - p, 3);
      switch (anim) {
        case 'fade': st.alpha *= p; break;
        case 'black': st.black = Math.max(st.black, 1 - p); break;
        case 'slideL': st.dx -= (1 - e) * 1.1; st.alpha *= Math.min(1, p * 3); break;
        case 'slideR': st.dx += (1 - e) * 1.1; st.alpha *= Math.min(1, p * 3); break;
        case 'slideU': st.dy += (1 - e) * 0.5; st.alpha *= p; break;
        case 'zoom': st.scale *= 0.6 + 0.4 * e; st.alpha *= p; break;
        case 'pop': { const b = p < 1 ? 1 + Math.sin(p * Math.PI) * 0.18 : 1; st.scale *= (0.3 + 0.7 * e) * b; st.alpha *= Math.min(1, p * 2); break; }
        case 'wipe': st.wipe = Math.min(st.wipe, e); break;
        case 'blur': st.blur += (1 - p) * 24; st.alpha *= p; break;
        case 'spin': st.rot += (1 - e) * -180; st.scale *= 0.4 + 0.6 * e; st.alpha *= p; break;
        case 'type': st.chars = p; break;
      }
    };
    if (c.inAnim && c.inAnim !== 'none' && local < (c.inDur || 0.5)) apply(c.inAnim, clamp(local / (c.inDur || 0.5), 0, 1));
    if (c.outAnim && c.outAnim !== 'none' && c.dur - local < (c.outDur || 0.5)) apply(c.outAnim === 'type' ? 'fade' : c.outAnim, clamp((c.dur - local) / (c.outDur || 0.5), 0, 1));
    return st;
  }
  function effAdj(c) {
    const f = FILTERS[c.filter || 'none'] || FILTERS.none; const amt = c.filterAmt ?? 1; const out = {};
    ADJ.forEach(([k]) => { out[k] = (c.adj?.[k] || 0) + (f.adj[k] || 0) * amt; });
    out.css = f.css ? f.css.replace(/\(([\d.]+)\)/, (m, v) => `(${Number(v) * amt})`) : '';
    return out;
  }
  function cssFilter(adj, extraBlur = 0) {
    const parts = [];
    if (adj.exposure) parts.push(`brightness(${(1 + adj.exposure).toFixed(3)})`);
    if (adj.contrast) parts.push(`contrast(${(1 + adj.contrast).toFixed(3)})`);
    if (adj.saturation) parts.push(`saturate(${(1 + adj.saturation).toFixed(3)})`);
    if (adj.hue) parts.push(`hue-rotate(${adj.hue}deg)`);
    if (adj.css) parts.push(adj.css);
    const b = (adj.blur || 0) + extraBlur; if (b > 0.1) parts.push(`blur(${(b * canvas.width / 1080).toFixed(1)}px)`);
    return parts.join(' ') || 'none';
  }
  function render() {
    if (!ctx) return;
    const W = canvas.width, H = canvas.height, t = time;
    ctx.save(); ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.fillStyle = P.bg.mode === 'color' ? P.bg.color : '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const order = ['v1', 'v2', 'txt', 'sub'];
    order.forEach(tr => P.clips.filter(c => c.track === tr && active(c, t)).sort((a, b) => a.start - b.start).forEach(c => drawClip(c, t, W, H)));
    // Grenze am Ende: letzter Frame
    if (!P.clips.some(c => active(c, t)) && P.clips.length && t > 0) {
      const last = P.clips.filter(c => c.track !== 'mus' && c.track !== 'vo' && Math.abs(c.start + c.dur - t) < 0.05);
      last.forEach(c => drawClip(c, c.start + c.dur - 0.001, W, H));
    }
  }
  function sourceOf(c) {
    if (c.type === 'image') return images[c.asset];
    const r = runtime(c); return r && r.el.readyState >= 2 ? r.el : null;
  }
  function drawClip(c, t, W, H) {
    const st = animState(c, t);
    if (c.type === 'text') return drawText(c, st, W, H, t);
    const src = sourceOf(c); const a = asset(c); if (!src || !a) return;
    const sw = a.w || src.videoWidth || src.naturalWidth || 1, sh = a.h || src.videoHeight || src.naturalHeight || 1;
    const adj = effAdj(c);
    // in Offscreen-Canvas zeichnen, damit Farbeffekte nur diesen Clip betreffen
    offCtx.save(); offCtx.setTransform(1, 0, 0, 1, 0, 0); offCtx.clearRect(0, 0, W, H); offCtx.globalAlpha = 1; offCtx.filter = 'none';
    const cover = Math.max(W / sw, H / sh), contain = Math.min(W / sw, H / sh);
    if (c.track === 'v1' && c.fit === 'fit' && P.bg.mode === 'blur') { // unscharfer Hintergrund
      offCtx.filter = `blur(${Math.round(W / 22)}px) brightness(0.7)`;
      offCtx.drawImage(src, (W - sw * cover * 1.1) / 2, (H - sh * cover * 1.1) / 2, sw * cover * 1.1, sh * cover * 1.1);
    }
    let base = c.fit === 'fit' ? contain : cover;
    let kb = 1; if (c.kenburns) kb = 1 + 0.12 * clamp((t - c.start) / c.dur, 0, 1);
    const s = base * (c.scale ?? 1) * st.scale * kb;
    const cx = W / 2 + ((c.x || 0) + st.dx) * W, cy = H / 2 + ((c.y || 0) + st.dy) * H;
    offCtx.translate(cx, cy); offCtx.rotate(((c.rot || 0) + st.rot) * Math.PI / 180);
    offCtx.filter = cssFilter(adj, st.blur);
    offCtx.drawImage(src, -sw * s / 2, -sh * s / 2, sw * s, sh * s);
    offCtx.filter = 'none';
    // Farbstiche, Verblassen, Vignette, Körnung (auf den Clipbereich)
    offCtx.globalCompositeOperation = 'source-atop';
    const rect = [-sw * s / 2, -sh * s / 2, sw * s, sh * s];
    if (adj.temperature) { offCtx.globalAlpha = Math.min(0.6, Math.abs(adj.temperature) * 0.45); offCtx.fillStyle = adj.temperature > 0 ? '#FF8A1F' : '#1F8BFF'; offCtx.globalCompositeOperation = 'soft-light'; offCtx.fillRect(...rect); }
    if (adj.tint) { offCtx.globalAlpha = Math.min(0.5, Math.abs(adj.tint) * 0.4); offCtx.fillStyle = adj.tint > 0 ? '#FF2FB0' : '#2FFF6A'; offCtx.globalCompositeOperation = 'soft-light'; offCtx.fillRect(...rect); }
    offCtx.globalCompositeOperation = 'source-atop';
    if (adj.fade > 0) { offCtx.globalAlpha = adj.fade * 0.35; offCtx.fillStyle = '#B8B2C8'; offCtx.globalCompositeOperation = 'lighten'; offCtx.fillRect(...rect); }
    offCtx.globalCompositeOperation = 'source-atop';
    if (adj.vignette > 0) {
      offCtx.globalAlpha = 1; const r = Math.max(sw * s, sh * s) / 2;
      const g = offCtx.createRadialGradient(0, 0, r * 0.35, 0, 0, r * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${Math.min(0.9, adj.vignette * 0.85)})`);
      offCtx.fillStyle = g; offCtx.fillRect(...rect);
    }
    if (adj.grain > 0) {
      if (!grainCanvas) { grainCanvas = document.createElement('canvas'); grainCanvas.width = grainCanvas.height = 256; const g = grainCanvas.getContext('2d'); const id = g.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }
      offCtx.globalAlpha = adj.grain * 0.18; offCtx.globalCompositeOperation = 'overlay';
      offCtx.fillStyle = offCtx.createPattern(grainCanvas, 'repeat'); offCtx.save(); offCtx.translate(Math.random() * 256, Math.random() * 256); offCtx.fillRect(rect[0] - 256, rect[1] - 256, rect[2] + 512, rect[3] + 512); offCtx.restore();
    }
    offCtx.restore();
    // Ergebnis auf den Haupt-Canvas
    ctx.save(); ctx.globalAlpha = (c.opacity ?? 1) * st.alpha;
    if (st.wipe < 1) { ctx.beginPath(); ctx.rect(0, 0, W * st.wipe, H); ctx.clip(); }
    ctx.drawImage(off, 0, 0);
    ctx.restore();
    if (st.black > 0) { ctx.save(); ctx.globalAlpha = st.black; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  function wrapLines(text, maxW) {
    const out = [];
    String(text).split('\n').forEach(par => {
      const words = par.split(' '); let line = '';
      words.forEach(w => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test; });
      out.push(line);
    });
    return out;
  }
  function drawText(c, st, W, H) {
    const s = c.style || {}; const k = W / 1080;
    let text = s.upper ? String(c.text || '').toUpperCase() : String(c.text || '');
    if (st.chars < 1) text = text.slice(0, Math.ceil(text.length * st.chars));
    if (!text) return;
    const size = (s.size || 60) * k * (c.scale ?? 1);
    ctx.save();
    ctx.font = `${s.italic ? 'italic ' : ''}${s.weight || 700} ${size}px ${s.font || 'Inter, system-ui, sans-serif'}`;
    ctx.textBaseline = 'middle';
    const maxW = W * (s.width || 0.86);
    const lines = wrapLines(text, maxW); const lh = size * 1.18;
    const widths = lines.map(l => ctx.measureText(l).width); const blockW = Math.max(...widths); const blockH = lines.length * lh;
    const cx = W / 2 + ((s.x || 0) + (c.x || 0) + st.dx) * W, cy = (s.y ?? 0.5) * H + ((c.y || 0) + st.dy) * H;
    ctx.translate(cx, cy); ctx.rotate(((c.rot || 0) + st.rot) * Math.PI / 180); ctx.scale(st.scale, st.scale);
    ctx.globalAlpha = (c.opacity ?? 1) * st.alpha;
    if (st.blur > 0.5) ctx.filter = `blur(${st.blur * k}px)`;
    if (st.wipe < 1) { ctx.beginPath(); ctx.rect(-blockW / 2 - 40 * k, -blockH / 2 - 40 * k, (blockW + 80 * k) * st.wipe, blockH + 80 * k); ctx.clip(); }
    const align = s.align || 'center';
    const xFor = w => align === 'left' ? -blockW / 2 : align === 'right' ? blockW / 2 - w : -w / 2;
    lines.forEach((l, i) => {
      const y = -blockH / 2 + lh * (i + 0.5); const w = widths[i]; const x = xFor(w);
      if (s.bg > 0) { ctx.save(); ctx.globalAlpha *= s.bg; ctx.fillStyle = s.bgColor || '#000'; const px = size * 0.32, py = size * 0.12; roundRect(x - px, y - lh / 2 + py * 0.3, w + px * 2, lh - py * 0.6 + py, size * 0.22); ctx.fill(); ctx.restore(); }
      ctx.textAlign = 'left';
      if (s.glow) { ctx.shadowColor = s.glow; ctx.shadowBlur = size * 0.5; }
      else if (s.shadow) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = size * 0.25; ctx.shadowOffsetY = size * 0.06; }
      if (s.stroke > 0) { ctx.lineWidth = s.stroke * 2 * k; ctx.strokeStyle = s.strokeColor || '#000'; ctx.lineJoin = 'round'; ctx.strokeText(l, x, y); }
      ctx.fillStyle = s.color || '#fff'; ctx.fillText(l, x, y);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    });
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // ---------- Zeitleiste --------------------------------------------------
  function drawTimeline() {
    if (!root) return;
    const end = Math.max(projectDuration(P) + 10, 30);
    const inner = $('.ve-tl-inner', root); inner.style.width = (120 + end * pps) + 'px';
    const step = pps >= 120 ? 1 : pps >= 50 ? 2 : pps >= 25 ? 5 : 10;
    $('.ve-ruler', root).innerHTML = Array.from({ length: Math.ceil(end / step) + 1 }, (_, i) => `<span style="left:${120 + i * step * pps}px">${fmtT(i * step)}</span>`).join('');
    TRACKS.forEach(t => {
      const lane = $(`[data-track="${t.id}"] .ve-track-lane`, root);
      lane.innerHTML = P.clips.filter(c => c.track === t.id).map(clipHTML).join('');
    });
    $$('.ve-clip canvas', root).forEach(cv => drawWave(cv));
    updateTimeUI();
  }
  function clipHTML(c) {
    const a = asset(c);
    const label = c.type === 'text' ? c.text.split('\n')[0] : a?.name || 'Fehlt';
    const style = `left:${c.start * pps}px;width:${Math.max(6, c.dur * pps)}px;${a?.thumb && c.type !== 'audio' ? `background-image:url(${a.thumb})` : ''}`;
    const badges = [c.speed && c.speed !== 1 ? `${c.speed}×` : '', c.filter && c.filter !== 'none' ? '✦' : '', c.muted ? '🔇' : '', c.duck ? '↓' : ''].filter(Boolean).join(' ');
    return `<div class="ve-clip ${c.type} ${sel === c.id ? 'sel' : ''}" data-clip="${c.id}" style="${style}">
      <i class="h l"></i><span class="ve-clip-label">${esc(label)}</span>${badges ? `<em>${badges}</em>` : ''}
      ${(c.type === 'audio' || c.type === 'video') && peaks[c.asset]?.data ? `<canvas data-wave="${c.id}" height="20"></canvas>` : ''}
      ${c.fadeIn > 0 ? `<b class="fade-in" style="width:${c.fadeIn * pps}px"></b>` : ''}${c.fadeOut > 0 ? `<b class="fade-out" style="width:${c.fadeOut * pps}px"></b>` : ''}
      <i class="h r"></i></div>`;
  }
  function drawWave(cv) {
    const c = P.clips.find(x => x.id === cv.dataset.wave); const pk = c && peaks[c.asset]; if (!pk?.data) return;
    const w = Math.max(6, Math.round(c.dur * pps)); cv.width = w; const g = cv.getContext('2d'); g.clearRect(0, 0, w, 20);
    g.fillStyle = c.type === 'audio' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.6)';
    for (let x = 0; x < w; x += 2) {
      const srcT = (c.in || 0) + (x / pps) * (c.speed || 1); const v = pk.data[Math.floor(srcT * pk.perSec)] || 0;
      const hh = Math.max(1, v * 20 * (c.volume ?? 1)); g.fillRect(x, 10 - hh / 2, 1.5, hh);
    }
  }
  const trackKind = id => TRACKS.find(t => t.id === id)?.kind;
  function snapTime(t, exclude) {
    if (!snap) return t;
    const th = 8 / pps; let best = t, bd = th;
    const pts = [0, time, ...P.clips.filter(c => c.id !== exclude).flatMap(c => [c.start, c.start + c.dur])];
    pts.forEach(p => { const d = Math.abs(p - t); if (d < bd) { bd = d; best = p; } });
    return best;
  }
  function maxDur(c) { const a = asset(c); if (!a || c.type === 'image' || c.type === 'text') return 3600; return Math.max(0.1, ((a.dur || 0) - (c.in || 0)) / (c.speed || 1)); }

  function timelineDown(e) {
    const sc = $('.ve-tl-scroll', root);
    const rect = sc.getBoundingClientRect();
    const xToT = x => Math.max(0, (x - rect.left + sc.scrollLeft - 120) / pps);
    const clipEl = e.target.closest('.ve-clip');
    if (!clipEl) {
      if (e.target.closest('.ve-track-label')) return;
      // Abspielkopf setzen / ziehen
      seek(xToT(e.clientX));
      if (!e.target.closest('.ve-ruler, .ve-playhead')) { sel = null; drawTimeline(); drawInspector(); }
      const mv = ev => seek(xToT(ev.clientX)); const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); return;
    }
    const c = P.clips.find(x => x.id === clipEl.dataset.clip);
    if (sel !== c.id) { sel = c.id; $$('.ve-clip', root).forEach(n => n.classList.toggle('sel', n === clipEl)); drawInspector(); }
    const mode = e.target.classList.contains('l') ? 'trimL' : e.target.classList.contains('r') ? 'trimR' : 'move';
    const before = snapshotP(); const o = { start: c.start, dur: c.dur, in: c.in || 0, track: c.track }; const sx = e.clientX; let moved = false;
    const mv = ev => {
      const dt = (ev.clientX - sx) / pps; if (Math.abs(ev.clientX - sx) > 2) moved = true; if (!moved) return;
      if (mode === 'move') {
        let ns = Math.max(0, o.start + dt); const sEnd = snapTime(ns + c.dur, c.id) - c.dur; const sSt = snapTime(ns, c.id);
        ns = Math.abs(sSt - ns) <= Math.abs(sEnd - ns) ? sSt : sEnd; c.start = Math.max(0, ns);
        const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.ve-track');
        if (over && trackKind(over.dataset.track) === trackKind(c.track) && over.dataset.track !== c.track) c.track = over.dataset.track;
      } else if (mode === 'trimL') {
        let ns = snapTime(o.start + dt, c.id); let d = ns - o.start;
        if (c.type === 'video' || c.type === 'audio') d = Math.max(d, -o.in / (c.speed || 1));
        d = Math.min(d, o.dur - 0.1); c.start = o.start + d; c.dur = o.dur - d; if (c.type === 'video' || c.type === 'audio') c.in = o.in + d * (c.speed || 1);
      } else {
        const ne = snapTime(o.start + o.dur + dt, c.id); c.dur = clamp(ne - o.start, 0.1, (c.type === 'video' || c.type === 'audio') ? (asset(c)?.dur - o.in) / (c.speed || 1) : 3600);
      }
      drawTimeline(); requestRender();
    };
    const up = () => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      if (moved) { commit(before); drawInspector(); syncMedia(true); requestRender(); }
      else seek(xToT(e.clientX));
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }

  // ---------- Bearbeitungsbefehle -----------------------------------------
  const selClip = () => P.clips.find(c => c.id === sel);
  function split() {
    const c = selClip() || P.clips.find(x => x.track === 'v1' && active(x, time));
    if (!c || !active(c, time) || time - c.start < 0.05 || c.start + c.dur - time < 0.05) return toast('Abspielkopf auf einen Clip setzen');
    change(() => {
      const d = time - c.start; const b = JSON.parse(JSON.stringify(c)); b.id = uid();
      b.start = time; b.dur = c.dur - d; if (c.type === 'video' || c.type === 'audio') b.in = (c.in || 0) + d * (c.speed || 1);
      c.dur = d; c.outAnim = 'none'; c.fadeOut = 0; b.inAnim = 'none'; b.fadeIn = 0; b.inDur = 0.5;
      P.clips.push(b); sel = b.id;
    });
  }
  function removeSel() { const c = selClip(); if (!c) return; change(() => { P.clips = P.clips.filter(x => x !== c); sel = null; }); }
  function duplicateSel() {
    const c = selClip(); if (!c) return;
    change(() => { const b = JSON.parse(JSON.stringify(c)); b.id = uid(); b.start = c.start + c.dur; P.clips.push(b); sel = b.id; });
  }
  function ripple() {
    change(() => { let t = 0; P.clips.filter(c => c.track === 'v1').sort((a, b) => a.start - b.start).forEach(c => { c.start = t; t += c.dur; }); });
    toast('Lücken in der Video-Spur geschlossen');
  }

  // ---------- Linke Seitenleiste -----------------------------------------
  function drawLeft() {
    if (!root) return;
    $$('[data-lt]', root).forEach(b => b.classList.toggle('on', b.dataset.lt === leftTab));
    const body = $('.ve-left-body', root);
    if (leftTab === 'media') {
      const vis = P.assets.filter(a => a.type !== 'audio');
      body.innerHTML = `<button class="btn primary sm wide" data-a="upload">${ic('upload', '#FFFFFF', 'ic sm')} Videos & Bilder hochladen</button>
        <p class="muted small">Oder Dateien auf die Vorschau ziehen. Klick fügt an der Video-Spur an, Ziehen auf eine Spur setzt frei.</p>
        <div class="ve-assets">${vis.map(assetHTML).join('') || '<div class="muted small">Noch keine Medien</div>'}</div>`;
    }
    if (leftTab === 'audio') {
      const aud = P.assets.filter(a => a.type === 'audio');
      body.innerHTML = `<button class="btn primary sm wide" data-a="upload-audio">${ic('music', '#FFFFFF', 'ic sm')} Musik / Audio hochladen</button>
        <div class="ve-rec">
          <b>${ic('mic', '#7C3AED', 'ic sm')} Voiceover aufnehmen</b>
          <label class="ve-check"><input type="checkbox" id="rec-play" checked> Video währenddessen abspielen</label>
          <button class="btn sm wide ${recorder ? 'danger' : ''}" data-a="rec">${recorder ? '■ Aufnahme stoppen' : '● Aufnahme starten (ab Abspielkopf)'}</button>
          <div class="muted small">Das Mikrofon wird beim ersten Mal freigegeben. Tipp: Kopfhörer verwenden.</div>
        </div>
        <div class="muted small" style="margin:8px 0">Lizenzhinweis: Verwende nur Musik, die du für Social Media nutzen darfst (lizenzfrei oder selbst erstellt).</div>
        <div class="ve-assets audio">${aud.map(assetHTML).join('') || '<div class="muted small">Noch keine Audiodateien</div>'}</div>`;
    }
    if (leftTab === 'text') {
      body.innerHTML = `<div class="ve-presets">${Object.entries(TEXT_PRESETS).map(([k, p]) => `<button class="ve-tp" data-tp="${k}"><span style="font-family:${p.style.font};font-weight:${p.style.weight};color:${p.style.color === 'rgba(0,0,0,0)' ? '#1F1B2E' : p.style.bg ? p.style.color : '#1F1B2E'};${p.style.bg ? `background:${p.style.bgColor}` : ''}">${p.label}</span></button>`).join('')}</div>
        <div class="ve-subs">
          <b>Untertitel aus Text</b>
          <textarea id="subs-text" rows="5" placeholder="Skript oder Voiceover-Text einfügen – jeder Satz bzw. jede Zeile wird ein Untertitel."></textarea>
          <div class="r-row"><span>Sek. pro Zeile</span><input class="input sm" type="number" id="subs-sec" value="auto" placeholder="auto" min="0.5" step="0.1"></div>
          <button class="btn sm wide" data-a="subs">Untertitel erzeugen</button>
          <div class="muted small">„auto“ verteilt die Zeilen über den ausgewählten Voiceover-Clip (sonst 2,5 s je Zeile ab Abspielkopf).</div>
        </div>`;
    }
    if (leftTab === 'filter') {
      const c = selClip();
      body.innerHTML = c && (c.type === 'video' || c.type === 'image') ? `<div class="muted small" style="margin-bottom:8px">Filter für den ausgewählten Clip:</div>
        <div class="ve-filters">${Object.entries(FILTERS).map(([k, f]) => `<button class="ve-f ${c.filter === k ? 'on' : ''}" data-filter="${k}"><canvas data-fprev="${k}" width="96" height="64"></canvas><span>${f.label}</span></button>`).join('')}</div>
        <button class="pbtn wide" data-a="filter-all" style="margin-top:8px">Diesen Filter auf alle Clips anwenden</button>`
        : '<div class="muted small">Wähle in der Zeitleiste einen Video- oder Bild-Clip aus, um Filter anzuwenden.</div>';
      if (c) drawFilterPreviews(c);
    }
  }
  function assetHTML(a) {
    return `<div class="ve-asset ${a.type}" draggable="true" data-asset="${a.id}" title="${esc(a.name)}">
      <div class="ve-asset-th" style="${a.thumb ? `background-image:url(${a.thumb})` : ''}">${a.type === 'audio' ? ic('audio-lines', '#7C3AED', 'ic') : ''}<span>${a.type === 'image' ? 'Bild' : fmtT(a.dur || 0)}</span></div>
      <div class="ve-asset-name">${esc(a.name)}</div></div>`;
  }
  function drawFilterPreviews(c) {
    const a = asset(c); const src = c.type === 'image' ? images[c.asset] : rt[c.id]?.el;
    if (!src || !a) return;
    $$('[data-fprev]', root).forEach(cv => {
      const g = cv.getContext('2d'); const fake = { ...c, filter: cv.dataset.fprev, filterAmt: 1 }; const adj = effAdj(fake);
      const sw = a.w || 1, sh = a.h || 1; const s = Math.max(96 / sw, 64 / sh);
      g.filter = cssFilter(adj); try { g.drawImage(src, (96 - sw * s) / 2, (64 - sh * s) / 2, sw * s, sh * s); } catch { /* egal */ }
      g.filter = 'none';
      if (adj.temperature) { g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.abs(adj.temperature) * 0.45; g.fillStyle = adj.temperature > 0 ? '#FF8A1F' : '#1F8BFF'; g.fillRect(0, 0, 96, 64); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    });
  }

  // ---------- Inspector ---------------------------------------------------
  const slider = (key, label, val, min, max, step, fmt = v => v) => `<div class="r-row"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-k="${key}"><b data-o="${key}">${fmt(val)}</b><button class="mini rs" data-reset="${key}" title="Zurücksetzen">↺</button></div>`;
  const pct = v => Math.round(v * 100) + '%';
  function drawInspector() {
    if (!root) return;
    const box = $('.ve-insp', root); const c = selClip();
    if (!c) {
      box.innerHTML = `<div class="p-title">Projekt</div>
        <div class="muted small">${FORMATS[P.format].label} · ${fmtT(projectDuration(P))} · ${P.clips.length} Clips</div>
        <div class="p-sub">Kurzanleitung</div>
        <div class="ve-help">Medien links hochladen → in die Zeitleiste ziehen<br>Clip anklicken → rechts bearbeiten<br><b>S</b> teilen · <b>Entf</b> löschen · <b>Leertaste</b> abspielen<br><b>←/→</b> Bild für Bild · <b>Strg+Z</b> rückgängig<br>Ränder eines Clips ziehen = trimmen</div>`;
      return;
    }
    const isVis = c.type === 'video' || c.type === 'image'; const isText = c.type === 'text'; const hasAudio = c.type === 'video' || c.type === 'audio';
    const tabs = [isText && ['text', 'Text'], (isVis || isText) && ['image', 'Bild'], isVis && ['color', 'Farbe'], (isVis || isText) && ['anim', 'Animation'], (hasAudio || isVis) && ['speed', hasAudio ? 'Tempo & Ton' : 'Dauer']].filter(Boolean);
    if (!tabs.find(t => t[0] === inspTab)) inspTab = tabs[0][0];
    let html = `<div class="p-title">${isText ? 'Text-Clip' : esc(asset(c)?.name || 'Clip')}</div><div class="muted small">${fmtT(c.start, true)} – ${fmtT(c.start + c.dur, true)} · ${c.dur.toFixed(1)} s</div>
      <div class="seg ve-itabs">${tabs.map(([k, l]) => `<button data-it="${k}" class="${k === inspTab ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    if (inspTab === 'text') {
      const s = c.style || {};
      html += `<textarea class="ve-textarea" data-text rows="3">${esc(c.text)}</textarea>
        <div class="p-sub">Stilvorlagen</div><div class="p-row">${Object.entries(TEXT_PRESETS).map(([k, p]) => `<button class="pbtn" data-tpreset="${k}">${p.label}</button>`).join('')}</div>
        <div class="r-row"><span>Schrift</span><select class="input sm" data-s="font">${FONTS.map(([f, l]) => `<option value='${f}' ${s.font === f ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        ${slider('style.size', 'Größe', s.size || 60, 16, 220, 1)}
        ${slider('style.weight', 'Stärke', s.weight || 700, 300, 900, 100)}
        <div class="r-row"><span>Farbe</span><input type="color" data-c="style.color" value="${toHex(s.color)}"><span>Kontur</span><input type="color" data-c="style.strokeColor" value="${toHex(s.strokeColor || '#000000')}"></div>
        ${slider('style.stroke', 'Konturstärke', s.stroke || 0, 0, 14, 0.5)}
        <div class="r-row"><span>Hintergrund</span><input type="color" data-c="style.bgColor" value="${toHex(s.bgColor || '#000000')}"></div>
        ${slider('style.bg', 'Deckkraft Box', s.bg || 0, 0, 1, 0.05, pct)}
        ${slider('style.width', 'Max. Breite', s.width || 0.86, 0.3, 1, 0.02, pct)}
        <div class="p-row"><button class="pbtn ${s.upper ? 'on' : ''}" data-tog="style.upper">GROSS</button><button class="pbtn ${s.italic ? 'on' : ''}" data-tog="style.italic"><i>Kursiv</i></button><button class="pbtn ${s.shadow ? 'on' : ''}" data-tog="style.shadow">Schatten</button>
          <button class="pbtn" data-align>${{ left: 'Links', center: 'Mitte', right: 'Rechts' }[s.align || 'center']}</button></div>
        ${slider('style.y', 'Höhe im Bild', s.y ?? 0.5, 0, 1, 0.01, pct)}`;
    }
    if (inspTab === 'image') {
      html += `${isVis ? `<div class="p-row"><button class="pbtn ${c.fit !== 'fit' ? 'on' : ''}" data-fit="fill">Füllen</button><button class="pbtn ${c.fit === 'fit' ? 'on' : ''}" data-fit="fit">Einpassen</button></div>` : ''}
        ${slider('scale', 'Skalierung', c.scale ?? 1, 0.1, 3, 0.01, pct)}
        ${slider('x', 'Position X', c.x || 0, -1, 1, 0.01, pct)}
        ${slider('y', 'Position Y', c.y || 0, -1, 1, 0.01, pct)}
        ${slider('rot', 'Drehung', c.rot || 0, -180, 180, 1, v => v + '°')}
        ${slider('opacity', 'Deckkraft', c.opacity ?? 1, 0, 1, 0.01, pct)}
        ${isVis ? `<label class="p-check"><input type="checkbox" data-chk="kenburns" ${c.kenburns ? 'checked' : ''}> Ken-Burns-Zoom (langsames Heranfahren)</label>` : ''}
        <div class="p-row"><button class="pbtn" data-preset-pos="center">Zentrieren</button>${isVis ? '<button class="pbtn" data-preset-pos="pip">Bild-im-Bild</button>' : ''}</div>`;
    }
    if (inspTab === 'color') {
      const adj = c.adj || {};
      html += `<div class="r-row"><span>Filter</span><select class="input sm" data-filtersel>${Object.entries(FILTERS).map(([k, f]) => `<option value="${k}" ${c.filter === k ? 'selected' : ''}>${f.label}</option>`).join('')}</select></div>
        ${slider('filterAmt', 'Filterstärke', c.filterAmt ?? 1, 0, 1, 0.01, pct)}
        <div class="p-sub">Anpassen</div>
        ${ADJ.map(([k, l, mn, mx]) => slider('adj.' + k, l, adj[k] || 0, mn, mx, k === 'hue' ? 1 : k === 'blur' ? 0.5 : 0.01, k === 'hue' ? (v => v + '°') : k === 'blur' ? (v => v + ' px') : pct)).join('')}
        <div class="p-row"><button class="pbtn" data-a="adj-reset">Alles zurücksetzen</button><button class="pbtn" data-a="adj-copy">Auf alle Clips übertragen</button></div>`;
    }
    if (inspTab === 'anim') {
      html += `<div class="p-sub">Einblenden</div>
        <div class="r-row"><span>Effekt</span><select class="input sm" data-sel="inAnim">${ANIMS.map(([v, l]) => `<option value="${v}" ${(c.inAnim || 'none') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        ${slider('inDur', 'Dauer', c.inDur || 0.5, 0.1, 3, 0.05, v => v + ' s')}
        <div class="p-sub">Ausblenden</div>
        <div class="r-row"><span>Effekt</span><select class="input sm" data-sel="outAnim">${ANIMS.filter(a => a[0] !== 'type').map(([v, l]) => `<option value="${v}" ${(c.outAnim || 'none') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        ${slider('outDur', 'Dauer', c.outDur || 0.5, 0.1, 3, 0.05, v => v + ' s')}
        <div class="muted small">Für Überblendungen zwischen zwei Videos: den zweiten Clip auf die Overlay-Spur legen, leicht überlappen lassen und „Einblenden“ wählen.</div>`;
    }
    if (inspTab === 'speed') {
      html += `${hasAudio ? `<div class="p-sub">Geschwindigkeit</div><div class="p-row">${SPEEDS.map(s => `<button class="pbtn ${(c.speed || 1) === s ? 'on' : ''}" data-speed="${s}">${s}×</button>`).join('')}</div>` : ''}
        <div class="r-row"><span>Dauer (s)</span><input class="input sm" type="number" step="0.1" min="0.1" data-dur value="${c.dur.toFixed(2)}"></div>
        ${hasAudio ? `<div class="p-sub">Ton</div>
        ${slider('volume', 'Lautstärke', c.volume ?? 1, 0, 2, 0.01, pct)}
        ${slider('fadeIn', 'Einblenden', c.fadeIn || 0, 0, 5, 0.1, v => v + ' s')}
        ${slider('fadeOut', 'Ausblenden', c.fadeOut || 0, 0, 5, 0.1, v => v + ' s')}
        <label class="p-check"><input type="checkbox" data-chk="muted" ${c.muted ? 'checked' : ''}> Stumm</label>
        <label class="p-check"><input type="checkbox" data-chk="duck" ${c.duck ? 'checked' : ''}> Automatisch leiser bei Voiceover (Ducking)</label>
        ${c.duck ? slider('duckLevel', 'Ducking-Pegel', c.duckLevel ?? 0.25, 0, 1, 0.05, pct) : ''}
        ${c.type === 'video' ? '<div class="p-row"><button class="pbtn" data-a="detach">Ton abtrennen (auf Musik-Spur)</button></div>' : ''}` : ''}`;
    }
    html += `<div class="p-row" style="margin-top:10px"><button class="pbtn" data-a="split">Teilen</button><button class="pbtn" data-a="dup">Duplizieren</button><button class="pbtn danger" data-a="del">Löschen</button></div>`;
    box.innerHTML = html;
  }
  function getPath(o, path) { return path.split('.').reduce((a, k) => a?.[k], o); }
  function setPath(o, path, v) { const ks = path.split('.'); const last = ks.pop(); let cur = o; ks.forEach(k => { cur[k] ||= {}; cur = cur[k]; }); cur[last] = v; }

  function bindInspector() {
    const box = $('.ve-insp', root); let before = null;
    box.addEventListener('pointerdown', () => { before = snapshotP(); });
    box.addEventListener('focusin', () => { if (!before) before = snapshotP(); });
    box.addEventListener('input', e => {
      const c = selClip(); if (!c) return; const t = e.target;
      if (t.dataset.k) { const v = Number(t.value); setPath(c, t.dataset.k, v); const o = box.querySelector(`[data-o="${t.dataset.k}"]`); if (o) o.textContent = t.closest('.r-row').querySelector('b').textContent = fmtFor(t.dataset.k, v); }
      if (t.dataset.c) setPath(c, t.dataset.c, t.value);
      if (t.dataset.text !== undefined) { c.text = t.value; const lab = $(`[data-clip="${c.id}"] .ve-clip-label`, root); if (lab) lab.textContent = c.text.split('\n')[0]; }
      syncMedia(false); requestRender(); scheduleSave();
    });
    box.addEventListener('change', e => {
      const c = selClip(); if (!c) return; const t = e.target;
      if (before) { commit(before); before = null; }
      if (t.dataset.sel) c[t.dataset.sel] = t.value;
      if (t.dataset.s) setPath(c, 'style.' + t.dataset.s, t.value);
      if (t.dataset.chk) c[t.dataset.chk] = t.checked;
      if (t.dataset.filtersel !== undefined) c.filter = t.value;
      if (t.dataset.dur !== undefined) c.dur = clamp(Number(t.value) || c.dur, 0.1, maxDur(c));
      if (t.dataset.sel || t.dataset.chk || t.dataset.filtersel !== undefined || t.dataset.dur !== undefined || t.dataset.s) { drawInspector(); drawTimeline(); if (leftTab === 'filter') drawLeft(); }
      syncMedia(true); requestRender(); scheduleSave();
    });
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const c = selClip(); const d = b.dataset;
      if (d.it) { inspTab = d.it; return drawInspector(); }
      if (!c) return;
      if (d.reset) return change(() => { const def = { scale: 1, opacity: 1, volume: 1, filterAmt: 1, 'style.size': 60, 'style.weight': 700, 'style.y': 0.5, 'style.width': 0.86, inDur: 0.5, outDur: 0.5, duckLevel: 0.25 }; setPath(c, d.reset, def[d.reset] ?? 0); });
      if (d.tpreset) return change(() => { const p = TEXT_PRESETS[d.tpreset]; c.style = { ...p.style }; c.inAnim = p.inAnim; });
      if (d.tog) return change(() => setPath(c, d.tog, !getPath(c, d.tog)));
      if (d.align !== undefined) return change(() => { const o = ['left', 'center', 'right']; c.style.align = o[(o.indexOf(c.style.align || 'center') + 1) % 3]; });
      if (d.fit) return change(() => { c.fit = d.fit; });
      if (d.presetPos) return change(() => { if (d.presetPos === 'center') { c.x = 0; c.y = 0; c.rot = 0; } else { c.fit = 'fit'; c.scale = 0.4; c.x = 0.27; c.y = -0.3; } });
      if (d.speed) return change(() => { const ns = Number(d.speed); const srcLen = c.dur * (c.speed || 1); c.speed = ns; c.dur = Math.min(srcLen / ns, maxDur(c)); });
      switch (d.a) {
        case 'adj-reset': return change(() => { c.adj = {}; c.filter = 'none'; c.filterAmt = 1; });
        case 'adj-copy': return change(() => P.clips.filter(x => x !== c && (x.type === 'video' || x.type === 'image')).forEach(x => { x.adj = { ...(c.adj || {}) }; x.filter = c.filter; x.filterAmt = c.filterAmt; }));
        case 'detach': return change(() => { const b2 = JSON.parse(JSON.stringify(c)); b2.id = uid(); b2.track = 'mus'; b2.type = 'audio'; b2.duck = false; P.clips.push(b2); c.muted = true; toast('Ton liegt jetzt auf der Musik-Spur'); });
        case 'split': return split(); case 'dup': return duplicateSel(); case 'del': return removeSel();
      }
    });
  }
  const fmtFor = (k, v) => ['scale', 'opacity', 'volume', 'filterAmt', 'x', 'y', 'style.bg', 'style.y', 'style.width', 'duckLevel'].includes(k) || (k.startsWith('adj.') && !['adj.hue', 'adj.blur'].includes(k)) ? Math.round(v * 100) + '%'
    : k === 'rot' || k === 'adj.hue' ? v + '°' : k === 'adj.blur' ? v + ' px' : ['inDur', 'outDur', 'fadeIn', 'fadeOut'].includes(k) ? v + ' s' : v;

  // ---------- UI-Verdrahtung ----------------------------------------------
  function bindUI() {
    const fileIn = $('.ve-file', root);
    fileIn.onchange = e => { addFiles([...e.target.files]); e.target.value = ''; };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-a],[data-lt],[data-tp],[data-filter],[data-asset]'); if (!b) return;
      if (b.closest('.ve-insp')) return;
      const d = b.dataset;
      if (d.lt) { leftTab = d.lt; return drawLeft(); }
      if (d.tp) { const c = textClip(null, d.tp, time, 3); return change(() => { P.clips.push(c); sel = c.id; inspTab = 'text'; }); }
      if (d.filter) { const c = selClip(); if (c) { change(() => { c.filter = d.filter; c.filterAmt = 1; }); drawLeft(); } return; }
      if (d.asset && !d.a) { const a = P.assets.find(x => x.id === d.asset); if (a) addClipFromAsset(a); return; }
      switch (d.a) {
        case 'back': location.hash = '#/video'; return;
        case 'undo': return undo(false); case 'redo': return undo(true);
        case 'post': return editPost(byId('posts', proj.post_id));
        case 'export': return openExport();
        case 'play': return play();
        case 'start': return seek(0);
        case 'end': return seek(projectDuration(P));
        case 'split': return split(); case 'dup': return duplicateSel(); case 'del': return removeSel(); case 'ripple': return ripple();
        case 'upload': fileIn.accept = 'video/*,image/*'; return fileIn.click();
        case 'upload-audio': fileIn.accept = 'audio/*'; return fileIn.click();
        case 'rec': return recorder ? stopRecording() : startRecording();
        case 'subs': return makeSubtitles();
        case 'filter-all': { const c = selClip(); if (c) change(() => P.clips.filter(x => x.type === 'video' || x.type === 'image').forEach(x => { x.filter = c.filter; x.filterAmt = c.filterAmt; })); toast('Filter auf alle Clips angewendet'); return; }
      }
    });
    root.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.a === 'snap') snap = t.checked;
      if (t.dataset.a === 'safe') { safeZones = t.checked; fitCanvas(); }
      if (t.classList.contains('ve-format')) { const before = snapshotP(); P.format = t.value; commit(before); setCanvasSize(false); fitCanvas(); requestRender(); }
      if (t.classList.contains('ve-bg')) { const before = snapshotP(); P.bg.mode = t.value; commit(before); requestRender(); }
      if (t.classList.contains('ve-name')) { proj.name = t.value; scheduleSave(); }
    });
    $('.ve-bgcolor', root).addEventListener('input', e => { P.bg.color = e.target.value; if (P.bg.mode !== 'color') { P.bg.mode = 'color'; $('.ve-bg', root).value = 'color'; } requestRender(); scheduleSave(); });
    $('.ve-bg', root).value = P.bg.mode;
    $('.ve-zoom', root).addEventListener('input', e => { pps = Number(e.target.value); drawTimeline(); });
    $('.ve-tl-scroll', root).addEventListener('pointerdown', timelineDown);
    $('.ve-tl-scroll', root).addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); pps = clamp(pps * Math.exp(-e.deltaY * 0.002), 10, 300); $('.ve-zoom', root).value = pps; drawTimeline(); } }, { passive: false });
    // Drag & Drop: Dateien auf Vorschau / Zeitleiste, Assets auf Spuren
    root.addEventListener('dragstart', e => { const a = e.target.closest?.('[data-asset]'); if (a) e.dataTransfer.setData('text/x-asset', a.dataset.asset); });
    root.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files') || e.dataTransfer.types.includes('text/x-asset')) { e.preventDefault(); root.classList.add('drag-over'); } });
    root.addEventListener('dragleave', e => { if (e.target === root || !root.contains(e.relatedTarget)) root.classList.remove('drag-over'); });
    root.addEventListener('drop', e => {
      root.classList.remove('drag-over');
      const files = [...(e.dataTransfer.files || [])];
      if (files.length) { e.preventDefault(); return addFiles(files); }
      const id = e.dataTransfer.getData('text/x-asset'); if (!id) return;
      e.preventDefault(); const a = P.assets.find(x => x.id === id);
      const tr = e.target.closest('.ve-track');
      if (tr) {
        const sc = $('.ve-tl-scroll', root); const t = Math.max(0, (e.clientX - sc.getBoundingClientRect().left + sc.scrollLeft - 120) / pps);
        const kind = trackKind(tr.dataset.track);
        if ((kind === 'audio') !== (a.type === 'audio') || kind === 'text') return toast('Diese Spur passt nicht zum Medientyp');
        addClipFromAsset(a, tr.dataset.track, snapTime(t));
      } else addClipFromAsset(a);
    });
    bindInspector();
    document.addEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (!root || $('#modal-root').children.length) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.code === 'Space') { e.preventDefault(); return play(); }
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); return undo(e.shiftKey); }
    if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); return undo(true); }
    if ((e.ctrlKey || e.metaKey) && k === 'd') { e.preventDefault(); return duplicateSel(); }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); return removeSel(); }
    if (k === 's' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); return split(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); return seek(time + (e.shiftKey ? 1 : 1 / 30)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); return seek(time - (e.shiftKey ? 1 : 1 / 30)); }
    if (e.key === 'Home') return seek(0);
    if (e.key === 'End') return seek(projectDuration(P));
  }

  // ---------- Untertitel aus Text -----------------------------------------
  function makeSubtitles() {
    const txt = $('#subs-text', root).value.trim(); if (!txt) return toast('Bitte Text einfügen');
    let lines = txt.split(/\n+/).flatMap(l => l.match(/[^.!?]+[.!?]*/g) || [l]).map(s => s.trim()).filter(Boolean);
    // lange Sätze in kurze Stücke (max. ~6 Wörter) teilen – typisch für Reels
    lines = lines.flatMap(l => { const w = l.split(' '); if (w.length <= 7) return [l]; const out = []; for (let i = 0; i < w.length; i += 6) out.push(w.slice(i, i + 6).join(' ')); return out; });
    const vo = selClip()?.track === 'vo' ? selClip() : null;
    const secIn = parseFloat($('#subs-sec', root).value);
    const start = vo ? vo.start : time;
    const totalWords = lines.reduce((s, l) => s + l.split(' ').length, 0);
    let t = start;
    change(() => lines.forEach(l => {
      const d = !isNaN(secIn) ? secIn : vo ? vo.dur * (l.split(' ').length / totalWords) : 2.5;
      P.clips.push(textClip(l, 'caption', t, Math.max(0.4, d), { track: 'sub', inAnim: 'pop', inDur: 0.2, outAnim: 'none' })); t += d;
    }));
    toast(`${lines.length} Untertitel erzeugt`);
  }

  // ---------- Voiceover-Aufnahme ------------------------------------------
  async function startRecording() {
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch { return toast('Kein Mikrofonzugriff. Bitte im Browser erlauben (bei Server-Betrieb ist HTTPS nötig).'); }
    const chunks = []; const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(m => MediaRecorder.isTypeSupported(m)) || '';
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const recStart = time; const t0r = performance.now();
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const dur = (performance.now() - t0r) / 1000; recorder = null; drawLeft();
      if (dur < 0.3) return;
      const blob = new Blob(chunks, { type: mime || 'audio/webm' });
      const ext = (mime || 'audio/webm').includes('mp4') ? 'm4a' : (mime || '').includes('ogg') ? 'ogg' : 'weba';
      try {
        const up = await uploadFile(blob, `voiceover.${ext}`);
        const a = { id: uid(), url: up.url, name: `Voiceover ${new Date().toLocaleTimeString('de-DE')}`, type: 'audio', dur, size: up.size };
        change(() => P.assets.push(a), { timeline: false, insp: false }); prepareAsset(a);
        addClipFromAsset(a, 'vo', recStart);
        const m = P.clips.find(c => c.track === 'mus'); if (m && !m.duck) toast('Tipp: Ducking bei der Musik aktivieren, damit sie unter der Stimme leiser wird');
        else toast('Voiceover eingefügt');
      } catch (e) { toast(e.message); }
    };
    recorder.start(250); drawLeft(); toast('Aufnahme läuft …');
    if ($('#rec-play', root)?.checked && !playing) play();
  }
  function stopRecording() { if (playing) pause(); recorder?.stop(); }

  // ---------- Export ------------------------------------------------------
  let exp = null;
  async function openExport() {
    if (!P.clips.length) return toast('Das Projekt ist noch leer');
    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
    if (!mime) return toast('Dieser Browser unterstützt keinen Video-Export. Bitte Chrome oder Edge verwenden.');
    const ff = await api('GET', '/api/ffmpeg').catch(() => ({ available: false }));
    const f = FORMATS[P.format];
    const v = await openForm({
      title: 'Video exportieren', submitLabel: 'Export starten',
      extra: `<p class="muted small" style="margin:-6px 0 12px">Das Video wird in Echtzeit gerendert (${fmtT(projectDuration(P))}). Lass den Tab währenddessen geöffnet und im Vordergrund.
        Format: ${ff.available ? '<b>MP4 (H.264/AAC)</b> – wird mit ffmpeg optimiert, passt für alle Plattformen' : `<b>${mime.startsWith('video/mp4') ? 'MP4' : 'WebM'}</b> – für garantiert plattformtaugliche MP4-Dateien ffmpeg installieren (siehe README)`}.</p>`,
      values: { res: 'full', fps: 30, quality: 'high' },
      fields: [
        { key: 'res', label: 'Auflösung', type: 'select', options: [['full', `${f.w} × ${f.h} (Full HD)`], ['720', `${Math.round(f.w * 2 / 3)} × ${Math.round(f.h * 2 / 3)} (720p, schneller)`]] },
        { key: 'fps', label: 'Bilder pro Sekunde', type: 'select', options: [[30, '30 fps (empfohlen)'], [25, '25 fps'], [60, '60 fps']], numeric: true },
        { key: 'quality', label: 'Qualität', type: 'select', options: [['high', 'Hoch (größere Datei)'], ['medium', 'Mittel']] },
      ],
    });
    if (!v) return;
    startExport(v, mime, ff.available);
  }
  function startExport(opt, mime, hasFF) {
    pause(); ensureAudio(); ac.resume();
    const f = FORMATS[P.format]; const s = opt.res === '720' ? 2 / 3 : 1;
    canvas.width = Math.round(f.w * s / 2) * 2; canvas.height = Math.round(f.h * s / 2) * 2; off.width = canvas.width; off.height = canvas.height;
    master.disconnect(ac.destination); // während des Exports stumm
    const stream = canvas.captureStream(opt.fps || 30);
    streamDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    const chunks = [];
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: (opt.quality === 'high' ? 12e6 : 6e6) * s, audioBitsPerSecond: 192000 });
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    const overlay = h(`<div class="ve-export"><div class="ve-export-box"><b>Exportiere Video …</b><div class="bar"><i style="width:0%"></i></div><span class="muted small">Bitte Tab geöffnet lassen</span><button class="btn sm ghost" data-x>Abbrechen</button></div></div>`);
    root.appendChild(overlay);
    exp = { rec, chunks, mime, hasFF, overlay, cancelled: false };
    $('[data-x]', overlay).onclick = () => { exp.cancelled = true; finishExport(); };
    // alle Medien auf 0 setzen und kurz warten, damit die ersten Frames bereit sind
    time = 0; syncMedia(true); render();
    setTimeout(() => {
      rec.start(500); exporting = true; playing = true; t0 = performance.now(); tStart = 0; syncMedia(true);
      const prog = () => { if (!exporting) return; $('.bar i', overlay).style.width = Math.min(100, time / projectDuration(P) * 100) + '%'; requestAnimationFrame(prog); };
      prog(); loop();
    }, 900);
  }
  function finishExport() {
    if (!exp) return;
    exporting = false; playing = false; cancelAnimationFrame(raf);
    Object.values(rt).forEach(r => r.el.pause());
    const { rec, chunks, mime, hasFF, overlay, cancelled } = exp; exp = null;
    rec.onstop = async () => {
      try { master.connect(ac.destination); } catch { /* bereits verbunden */ }
      setCanvasSize(false); fitCanvas(); $('[data-a=play]', root).textContent = '▶'; requestRender();
      if (cancelled) { overlay.remove(); return toast('Export abgebrochen'); }
      const blob = new Blob(chunks, { type: mime });
      $('.ve-export-box', overlay).innerHTML = '<b>Speichere Video …</b><span class="spinner"></span>';
      const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
      const safe = (proj.name || 'video').replace(/[^\wäöüÄÖÜß -]+/g, '').trim() || 'video';
      let result;
      try { result = await uploadFile(blob, `${safe}.${ext}`); } catch (e) { overlay.remove(); return toast(e.message); }
      if (hasFF) { // immer in H.264/AAC-MP4 umwandeln – das akzeptieren alle Plattformen
        $('.ve-export-box', overlay).innerHTML = '<b>Wandle in MP4 (H.264) um …</b><span class="spinner"></span>';
        try { result = await api('POST', '/api/convert', { name: result.name }); } catch { /* WebM behalten */ }
      }
      const url = result.url; const fname = url.split('/').pop();
      $('.ve-export-box', overlay).innerHTML = `<b>✓ Export fertig</b><video src="${url}" controls playsinline class="ve-export-video"></video>
        <div class="p-row"><a class="btn primary sm" href="${url}" download="${esc(fname)}">${ic('download', '#FFFFFF', 'ic sm')} Herunterladen</a>
        ${proj.post_id ? '<button class="btn sm" data-link>Mit Beitrag verknüpfen</button>' : ''}<button class="btn sm ghost" data-close>Schließen</button></div>
        <span class="muted small">Gespeichert unter media/${esc(fname)}</span>`;
      $('[data-close]', overlay).onclick = () => overlay.remove();
      $('[data-link]', overlay)?.addEventListener('click', async () => {
        const post = byId('posts', proj.post_id); const note = `${post.media_notes ? post.media_notes + '\n' : ''}Video: ${location.origin}${url}`;
        await DB.update('posts', post.id, { media_notes: note, status: post.status === 'idee' || post.status === 'skript' || post.status === 'produktion' ? 'geplant' : post.status }, true);
        toast('Video im Beitrag hinterlegt'); overlay.remove();
      });
    };
    if (rec.state !== 'inactive') rec.stop(); else rec.onstop();
  }

  // ---------- Helfer ------------------------------------------------------
  function toHex(c) {
    if (!c) return '#ffffff'; if (/^#[0-9a-f]{6}$/i.test(c)) return c;
    if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).split('').map(x => x + x).join('');
    return '#ffffff';
  }
  return { mount, FORMATS, newProjectDialog };
})();
