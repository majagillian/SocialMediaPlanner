'use strict';
/* =========================================================================
   Designvorlagen (ähnlich Canva): Infografiken, Diagramme, Social Media, Karten
   Jede Vorlage rendert in ihrer Basisgröße und wird proportional skaliert.
   ========================================================================= */
window.DESIGN_THEMES = [
  { name: 'Violett', c1: '#7C3AED', c2: '#34D399', bg: '#FFFFFF', ink: '#1F1B2E' },
  { name: 'Mint', c1: '#059669', c2: '#7C3AED', bg: '#FFFFFF', ink: '#1F1B2E' },
  { name: 'Orange', c1: '#EA580C', c2: '#7C3AED', bg: '#FFFFFF', ink: '#1F1B2E' },
  { name: 'Lavendel', c1: '#7C3AED', c2: '#FB923C', bg: '#F5F3FF', ink: '#2E1065' },
  { name: 'Dunkel', c1: '#A78BFA', c2: '#34D399', bg: '#1F1B2E', ink: '#FFFFFF' },
  { name: 'Kräftig', c1: '#FFFFFF', c2: '#FDE68A', bg: '#7C3AED', ink: '#FFFFFF' },
  { name: 'Sanft', c1: '#8B5CF6', c2: '#F59E0B', bg: '#FEF3C7', ink: '#3F2D0B' },
];

(() => {
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const pairs = s => lines(s).map(l => { const [a, ...b] = l.split('|'); return [a.trim(), b.join('|').trim()]; });
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
  const icon = (name, color, size) => name ? `<img src="https://api.iconify.design/${name.includes(':') ? name.replace(':', '/') : 'lucide/' + name}.svg?color=${encodeURIComponent(color)}" style="width:${size}px;height:${size}px" alt="">` : '';
  const mix = (hex, a) => { const n = parseInt((hex || '#7C3AED').slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const box = (c, w, h, inner, extra = '') => `<div class="ds" style="width:${w}px;height:${h}px;background:${c.bg};color:${c.ink};${extra}">${inner}</div>`;

  window.DESIGNS = {
    // ---------- Infografik ----------
    stat: {
      label: 'Kennzahl', cat: 'Infografik', w: 280, h: 180,
      fields: [['value', 'Zahl', 'text'], ['label', 'Beschriftung', 'text'], ['delta', 'Veränderung (z. B. +12 %)', 'text'], ['icon', 'Icon (Iconify-Name)', 'text']],
      defaults: { value: '1.250', label: 'Follower', delta: '+18 % zum Vormonat', icon: 'users' },
      render: (d, c) => box(c, 280, 180, `
        <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:15px;opacity:.75;font-weight:600">${e(d.label)}</span>
        <span style="width:42px;height:42px;border-radius:12px;background:${mix(c.c1, .14)};display:grid;place-items:center">${icon(d.icon, c.c1, 24)}</span></div>
        <div style="font-size:48px;font-weight:800;color:${c.c1};letter-spacing:-.02em;margin-top:10px">${e(d.value)}</div>
        <div style="font-size:13px;font-weight:600;color:${c.c2}">${e(d.delta)}</div>`, 'padding:22px;border-radius:18px'),
    },
    progress: {
      label: 'Fortschritt', cat: 'Infografik', w: 380, h: 110,
      fields: [['label', 'Beschriftung', 'text'], ['value', 'Prozent (0–100)', 'number']],
      defaults: { label: 'Ziel: 1.000 Follower', value: 62 },
      render: (d, c) => { const p = Math.max(0, Math.min(100, num(d.value))); return box(c, 380, 110, `
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px"><span>${e(d.label)}</span><span style="color:${c.c1}">${p}%</span></div>
        <div style="height:16px;border-radius:99px;background:${mix(c.c1, .14)};margin-top:16px;overflow:hidden"><div style="height:100%;width:${p}%;border-radius:99px;background:linear-gradient(90deg,${c.c1},${c.c2})"></div></div>`, 'padding:24px;border-radius:18px'); },
    },
    steps: {
      label: 'Prozess', cat: 'Infografik', w: 800, h: 190,
      fields: [['items', 'Schritte (einer pro Zeile)', 'textarea']],
      defaults: { items: 'Idee\nSkript\nDreh\nSchnitt\nPosten' },
      render: (d, c) => { const it = lines(d.items).slice(0, 6); const w = 800 / Math.max(1, it.length);
        return box(c, 800, 190, `<div style="display:flex;height:100%;align-items:center">${it.map((t, i) => `
          <div style="width:${w}px;height:120px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;
            background:${i % 2 ? mix(c.c1, .75) : c.c1};color:#fff;clip-path:polygon(0 0,calc(100% - 26px) 0,100% 50%,calc(100% - 26px) 100%,0 100%${i ? ',26px 50%' : ''});margin-left:${i ? -18 : 0}px;padding:0 30px 0 ${i ? 40 : 20}px">
            <div style="font-size:13px;opacity:.8;font-weight:600">Schritt ${i + 1}</div><div style="font-size:19px;font-weight:700;text-align:center">${e(t)}</div></div>`).join('')}</div>`, 'padding:0 20px;border-radius:18px'); },
    },
    timeline: {
      label: 'Zeitstrahl', cat: 'Infografik', w: 800, h: 230,
      fields: [['items', 'Einträge: Datum | Text (einer pro Zeile)', 'textarea']],
      defaults: { items: 'Woche 1 | Nische festlegen\nWoche 2 | Erste 5 Posts\nWoche 4 | 100 Follower\nMonat 3 | 1.000 Follower' },
      render: (d, c) => { const it = pairs(d.items).slice(0, 6); const n = Math.max(1, it.length);
        return box(c, 800, 230, `<div style="position:relative;height:100%">
          <div style="position:absolute;left:30px;right:30px;top:96px;height:4px;border-radius:2px;background:linear-gradient(90deg,${c.c1},${c.c2})"></div>
          ${it.map(([a, b], i) => { const x = 30 + (n === 1 ? 370 : i * 740 / (n - 1)); return `
            <div style="position:absolute;left:${x}px;top:86px;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:${c.bg};border:5px solid ${i % 2 ? c.c2 : c.c1}"></div>
            <div style="position:absolute;left:${x}px;transform:translateX(-50%);${i % 2 ? 'top:126px' : 'bottom:146px'};width:150px;text-align:center">
              <div style="font-weight:800;color:${i % 2 ? c.c2 : c.c1};font-size:15px">${e(a)}</div><div style="font-size:14px;margin-top:2px">${e(b)}</div></div>`; }).join('')}</div>`, 'padding:20px;border-radius:18px'); },
    },
    compare: {
      label: 'Vergleich', cat: 'Infografik', w: 580, h: 330,
      fields: [['titleA', 'Titel links', 'text'], ['itemsA', 'Punkte links (einer pro Zeile)', 'textarea'], ['titleB', 'Titel rechts', 'text'], ['itemsB', 'Punkte rechts', 'textarea']],
      defaults: { titleA: 'Vorher', itemsA: 'Unregelmäßig posten\nKein roter Faden\nKaum Interaktion', titleB: 'Nachher', itemsB: '3 Posts pro Woche\nKlare Content-Säulen\nAktive Community' },
      render: (d, c) => { const col = (t, items, col, mark) => `<div style="flex:1;background:${mix(col, .1)};border-radius:16px;padding:20px">
          <div style="font-size:20px;font-weight:800;color:${col};margin-bottom:12px">${e(t)}</div>
          ${lines(items).map(x => `<div style="display:flex;gap:10px;align-items:flex-start;margin:9px 0;font-size:15px"><b style="color:${col}">${mark}</b><span>${e(x)}</span></div>`).join('')}</div>`;
        return box(c, 580, 330, `<div style="display:flex;gap:16px;height:100%">${col(d.titleA, d.itemsA, c.c2 === c.c1 ? '#94A3B8' : '#EF6461', '✕')}${col(d.titleB, d.itemsB, c.c1, '✓')}</div>`, 'padding:18px;border-radius:20px'); },
    },
    pyramid: {
      label: 'Pyramide', cat: 'Infografik', w: 440, h: 340,
      fields: [['items', 'Ebenen von oben nach unten', 'textarea']],
      defaults: { items: 'Angebot\nCommunity\nVertrauen\nReichweite' },
      render: (d, c) => { const it = lines(d.items).slice(0, 6); const n = Math.max(1, it.length); const hh = 300 / n;
        return box(c, 440, 340, it.map((t, i) => { const top = 400 * i / n, bot = 400 * (i + 1) / n;
          return `<div style="height:${hh - 6}px;margin:0 auto 6px;width:400px;background:${mix(c.c1, 1 - i * 0.6 / n)};color:#fff;display:grid;place-items:center;font-weight:700;font-size:17px;
          clip-path:polygon(${200 - top / 2}px 0,${200 + top / 2}px 0,${200 + bot / 2}px 100%,${200 - bot / 2}px 100%)">${e(t)}</div>`; }).join(''), 'padding:20px;border-radius:18px'); },
    },
    cycle: {
      label: 'Kreislauf', cat: 'Infografik', w: 400, h: 400,
      fields: [['center', 'Mitte', 'text'], ['items', 'Stationen (3–6)', 'textarea']],
      defaults: { center: 'Content-Zyklus', items: 'Planen\nProduzieren\nPosten\nAnalysieren' },
      render: (d, c) => { const it = lines(d.items).slice(0, 6); const n = Math.max(1, it.length);
        return box(c, 400, 400, `<svg width="400" height="400" style="position:absolute;inset:0"><circle cx="200" cy="200" r="130" fill="none" stroke="${mix(c.c1, .3)}" stroke-width="3" stroke-dasharray="8 8"/></svg>
          <div style="position:absolute;left:125px;top:150px;width:150px;height:100px;display:grid;place-items:center;text-align:center;font-weight:800;font-size:18px;color:${c.c1}">${e(d.center)}</div>
          ${it.map((t, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; const x = 200 + Math.cos(a) * 130, y = 200 + Math.sin(a) * 130;
            return `<div style="position:absolute;left:${x - 52}px;top:${y - 52}px;width:104px;height:104px;border-radius:50%;background:${i % 2 ? c.c2 : c.c1};color:#fff;display:grid;place-items:center;text-align:center;font-weight:700;font-size:14px;padding:8px;box-shadow:0 6px 16px ${mix(c.c1, .25)}"><span><small style="opacity:.8">${i + 1}</small><br>${e(t)}</span></div>`; }).join('')}`, 'position:relative;border-radius:50%'); },
    },
    checklist: {
      label: 'Checkliste', cat: 'Infografik', w: 340, h: 320,
      fields: [['title', 'Titel', 'text'], ['items', 'Punkte (mit [x] am Anfang = erledigt)', 'textarea']],
      defaults: { title: 'Vor dem Posten', items: '[x] Hook in den ersten 2 Sekunden\n[x] Untertitel eingefügt\n[ ] Caption mit Call-to-Action\n[ ] 5–10 passende Hashtags\n[ ] Beste Uhrzeit gewählt' },
      render: (d, c) => box(c, 340, 320, `<div style="font-size:21px;font-weight:800;margin-bottom:14px">${e(d.title)}</div>
        ${lines(d.items).map(l => { const done = /^\[x\]/i.test(l); const t = l.replace(/^\[[ x]?\]\s*/i, '');
          return `<div style="display:flex;gap:11px;align-items:center;margin:10px 0;font-size:15px"><span style="width:22px;height:22px;flex:none;border-radius:7px;border:2px solid ${c.c1};background:${done ? c.c1 : 'transparent'};color:#fff;display:grid;place-items:center;font-size:13px;font-weight:900">${done ? '✓' : ''}</span><span style="${done ? 'opacity:.6;text-decoration:line-through' : ''}">${e(t)}</span></div>`; }).join('')}`, `padding:24px;border-radius:18px;border-top:6px solid ${c.c1}`),
    },
    // ---------- Diagramme ----------
    donut: {
      label: 'Kreisdiagramm', cat: 'Diagramme', w: 240, h: 260,
      fields: [['value', 'Prozent', 'number'], ['label', 'Beschriftung', 'text']],
      defaults: { value: 72, label: 'Engagement-Ziel' },
      render: (d, c) => { const p = Math.max(0, Math.min(100, num(d.value))); const r = 80, C = 2 * Math.PI * r;
        return box(c, 240, 260, `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="${r}" fill="none" stroke="${mix(c.c1, .14)}" stroke-width="22"/>
          <circle cx="100" cy="100" r="${r}" fill="none" stroke="${c.c1}" stroke-width="22" stroke-linecap="round" stroke-dasharray="${C * p / 100} ${C}" transform="rotate(-90 100 100)"/>
          <text x="100" y="112" text-anchor="middle" font-size="38" font-weight="800" fill="${c.ink}" font-family="system-ui">${p}%</text></svg>
          <div style="text-align:center;font-weight:700;font-size:15px;margin-top:4px">${e(d.label)}</div>`, 'padding:20px;border-radius:18px;text-align:center'); },
    },
    bars: {
      label: 'Balkendiagramm', cat: 'Diagramme', w: 480, h: 320,
      fields: [['title', 'Titel', 'text'], ['items', 'Werte: Label | Zahl (einer pro Zeile)', 'textarea']],
      defaults: { title: 'Reichweite pro Woche', items: 'KW 1 | 420\nKW 2 | 680\nKW 3 | 910\nKW 4 | 1350\nKW 5 | 1720' },
      render: (d, c) => { const it = pairs(d.items).slice(0, 10); const max = Math.max(1, ...it.map(x => num(x[1])));
        return box(c, 480, 320, `<div style="font-size:18px;font-weight:800;margin-bottom:10px">${e(d.title)}</div>
          <div style="display:flex;align-items:flex-end;gap:12px;height:230px;border-bottom:2px solid ${mix(c.ink, .15)}">${it.map(([l, v], i) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
              <div style="font-size:12px;font-weight:700;margin-bottom:4px;color:${c.c1}">${e(v)}</div>
              <div style="width:100%;height:${num(v) / max * 190}px;border-radius:8px 8px 2px 2px;background:${i === it.length - 1 ? c.c2 : c.c1}"></div></div>`).join('')}</div>
          <div style="display:flex;gap:12px;margin-top:6px">${it.map(([l]) => `<div style="flex:1;text-align:center;font-size:12px;opacity:.7">${e(l)}</div>`).join('')}</div>`, 'padding:20px 22px;border-radius:18px'); },
    },
    kpis: {
      label: 'KPI-Reihe', cat: 'Diagramme', w: 760, h: 150,
      fields: [['items', 'Kennzahlen: Label | Wert (bis zu 4)', 'textarea']],
      defaults: { items: 'Follower | 1.250\nReichweite | 48 Tsd.\nEngagement | 6,2 %\nPosts | 24' },
      render: (d, c) => box(c, 760, 150, `<div style="display:flex;gap:14px;height:100%">${pairs(d.items).slice(0, 4).map(([l, v], i) => `
        <div style="flex:1;border-radius:14px;padding:18px;background:${mix(i % 2 ? c.c2 : c.c1, .12)};display:flex;flex-direction:column;justify-content:center">
          <div style="font-size:13px;font-weight:600;opacity:.75">${e(l)}</div><div style="font-size:32px;font-weight:800;color:${i % 2 ? c.c2 : c.c1}">${e(v)}</div></div>`).join('')}</div>`, 'padding:16px;border-radius:18px'),
    },
    // ---------- Social Media ----------
    post: {
      label: 'Instagram-Post', cat: 'Social Media', w: 360, h: 450,
      fields: [['handle', 'Account-Name', 'text'], ['kicker', 'Oberzeile', 'text'], ['headline', 'Überschrift', 'textarea'], ['cta', 'Call-to-Action', 'text']],
      defaults: { handle: '@deinaccount', kicker: '5 TIPPS', headline: 'So gewinnst du deine ersten 1.000 Follower', cta: 'Speichern & teilen' },
      render: (d, c) => box(c, 360, 450, `
        <div style="display:flex;align-items:center;gap:9px;padding:12px 14px;font-size:13px;font-weight:700"><span style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,${c.c1},${c.c2})"></span>${e(d.handle)}</div>
        <div style="height:360px;background:linear-gradient(150deg,${c.c1},${mix(c.c1, .7)});color:#fff;padding:34px;display:flex;flex-direction:column;justify-content:center">
          <div style="font-size:14px;font-weight:800;letter-spacing:.12em;color:${c.c2}">${e(d.kicker)}</div>
          <div style="font-size:31px;font-weight:800;line-height:1.15;margin-top:10px">${e(d.headline)}</div>
          <div style="margin-top:24px;display:inline-block;align-self:flex-start;background:#fff;color:${c.c1};padding:8px 14px;border-radius:99px;font-weight:800;font-size:13px">${e(d.cta)} →</div></div>
        <div style="padding:8px 14px;font-size:20px;letter-spacing:6px;opacity:.8">♡ ◯ ➤</div>`, 'border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.12)'),
    },
    story: {
      label: 'Story / Reel (9:16)', cat: 'Social Media', w: 270, h: 480,
      fields: [['top', 'Oberzeile', 'text'], ['headline', 'Überschrift', 'textarea'], ['cta', 'Button / Sticker', 'text']],
      defaults: { top: 'NEU', headline: 'Mein Setup für Reels unter 50 €', cta: 'Link in Bio' },
      render: (d, c) => box(c, 270, 480, `
        <div style="display:flex;gap:4px;margin-bottom:18px"><i style="flex:1;height:3px;background:#fff;border-radius:2px"></i><i style="flex:1;height:3px;background:rgba(255,255,255,.4);border-radius:2px"></i><i style="flex:1;height:3px;background:rgba(255,255,255,.4);border-radius:2px"></i></div>
        <span style="background:${c.c2};color:${c.ink === '#FFFFFF' ? '#1F1B2E' : c.ink};font-weight:800;font-size:12px;padding:4px 10px;border-radius:6px">${e(d.top)}</span>
        <div style="font-size:30px;font-weight:800;line-height:1.15;margin-top:110px">${e(d.headline)}</div>
        <div style="position:absolute;left:50%;bottom:44px;transform:translateX(-50%);background:#fff;color:${c.c1};font-weight:800;padding:10px 18px;border-radius:12px;white-space:nowrap;font-size:14px">🔗 ${e(d.cta)}</div>`,
        `position:relative;padding:16px 20px;border-radius:22px;color:#fff;background:linear-gradient(170deg,${c.c1},${mix(c.c1, .55)} 70%,${c.c2})`),
    },
    carousel: {
      label: 'Karussell-Slide', cat: 'Social Media', w: 360, h: 360,
      fields: [['index', 'Slide-Nummer (z. B. 2/5)', 'text'], ['headline', 'Überschrift', 'text'], ['body', 'Text', 'textarea']],
      defaults: { index: '2/5', headline: 'Tipp 1: Der Hook', body: 'Die ersten 2 Sekunden entscheiden, ob jemand weiterschaut. Starte mit einer Frage oder einem überraschenden Fakt.' },
      render: (d, c) => box(c, 360, 360, `<div style="display:flex;justify-content:space-between;font-weight:800;color:${c.c1}"><span>●</span><span style="font-size:13px">${e(d.index)}</span></div>
        <div style="font-size:28px;font-weight:800;line-height:1.15;margin-top:40px;color:${c.c1}">${e(d.headline)}</div>
        <div style="font-size:16px;margin-top:14px;line-height:1.45">${e(d.body)}</div>
        <div style="position:absolute;right:26px;bottom:22px;font-weight:800;color:${c.c2};font-size:14px">Weiter →</div>`, `position:relative;padding:28px;border-radius:14px;border:2px solid ${mix(c.c1, .15)}`),
    },
    persona: {
      label: 'Zielgruppen-Persona', cat: 'Social Media', w: 440, h: 300,
      fields: [['name', 'Name', 'text'], ['meta', 'Alter / Beruf', 'text'], ['goals', 'Ziele & Wünsche', 'textarea'], ['pains', 'Probleme', 'textarea']],
      defaults: { name: 'Lena', meta: '27 · Marketing-Einsteigerin', goals: 'Eigene Marke aufbauen\nSchnelle, umsetzbare Tipps', pains: 'Wenig Zeit\nWeiß nicht, was sie posten soll' },
      render: (d, c) => box(c, 440, 300, `<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">
          <div style="width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,${c.c1},${c.c2});display:grid;place-items:center;color:#fff;font-size:26px;font-weight:800">${e((d.name || '?')[0])}</div>
          <div><div style="font-size:22px;font-weight:800">${e(d.name)}</div><div style="opacity:.7;font-size:14px">${e(d.meta)}</div></div></div>
        <div style="display:flex;gap:14px">${[['Ziele', d.goals, c.c1], ['Probleme', d.pains, c.c2]].map(([t, v, col]) => `<div style="flex:1;background:${mix(col, .1)};border-radius:12px;padding:12px 14px">
          <div style="font-weight:800;color:${col};font-size:13px;text-transform:uppercase;letter-spacing:.05em">${t}</div>${lines(v).map(x => `<div style="font-size:14px;margin-top:6px">• ${e(x)}</div>`).join('')}</div>`).join('')}</div>`, 'padding:22px;border-radius:18px'),
    },
    // ---------- Text & Karten ----------
    banner: {
      label: 'Titel-Banner', cat: 'Text & Karten', w: 760, h: 170,
      fields: [['kicker', 'Oberzeile', 'text'], ['title', 'Titel', 'text'], ['sub', 'Untertitel', 'text']],
      defaults: { kicker: 'PROJEKT', title: 'Social-Media-Strategie 2027', sub: 'Ziele · Content · Zeitplan' },
      render: (d, c) => box(c, 760, 170, `<div style="font-size:13px;font-weight:800;letter-spacing:.16em;color:${c.c2}">${e(d.kicker)}</div>
        <div style="font-size:40px;font-weight:800;letter-spacing:-.02em;margin:6px 0">${e(d.title)}</div><div style="font-size:17px;opacity:.85">${e(d.sub)}</div>`,
        `padding:28px 36px;border-radius:20px;background:linear-gradient(120deg,${c.c1},${mix(c.c1, .75)});color:#fff`),
    },
    quote: {
      label: 'Zitat', cat: 'Text & Karten', w: 440, h: 250,
      fields: [['text', 'Zitat', 'textarea'], ['author', 'Autor:in', 'text']],
      defaults: { text: 'Konsistenz schlägt Perfektion. Jeder Post ist ein Schritt nach vorn.', author: 'Mein Leitsatz' },
      render: (d, c) => box(c, 440, 250, `<div style="font-size:70px;line-height:.8;color:${c.c1};font-family:Georgia,serif">“</div>
        <div style="font-size:21px;font-weight:600;line-height:1.35;margin-top:4px">${e(d.text)}</div><div style="margin-top:14px;font-weight:700;color:${c.c2}">— ${e(d.author)}</div>`,
        `padding:26px 30px;border-radius:18px;border-left:8px solid ${c.c1}`),
    },
    card: {
      label: 'Info-Karte', cat: 'Text & Karten', w: 320, h: 220,
      fields: [['icon', 'Icon (Iconify-Name)', 'text'], ['title', 'Titel', 'text'], ['body', 'Text', 'textarea']],
      defaults: { icon: 'lightbulb', title: 'Content-Säule: Wissen', body: 'Tipps, Anleitungen und Fakten, die meiner Zielgruppe echten Mehrwert bieten.' },
      render: (d, c) => box(c, 320, 220, `<div style="width:48px;height:48px;border-radius:14px;background:${mix(c.c1, .14)};display:grid;place-items:center">${icon(d.icon, c.c1, 26)}</div>
        <div style="font-size:19px;font-weight:800;margin-top:14px">${e(d.title)}</div><div style="font-size:14px;opacity:.8;margin-top:6px;line-height:1.45">${e(d.body)}</div>`, 'padding:22px;border-radius:18px'),
    },
    numbered: {
      label: 'Nummerierte Liste', cat: 'Text & Karten', w: 380, h: 320,
      fields: [['title', 'Titel', 'text'], ['items', 'Punkte (einer pro Zeile)', 'textarea']],
      defaults: { title: 'Meine 4 Content-Regeln', items: 'Mehrwert vor Reichweite\nJeden Post mit Hook\nAuf jeden Kommentar antworten\nWöchentlich auswerten' },
      render: (d, c) => box(c, 380, 320, `<div style="font-size:21px;font-weight:800;margin-bottom:14px">${e(d.title)}</div>
        ${lines(d.items).slice(0, 7).map((t, i) => `<div style="display:flex;gap:12px;align-items:center;margin:10px 0"><span style="width:30px;height:30px;flex:none;border-radius:50%;background:${i % 2 ? c.c2 : c.c1};color:#fff;display:grid;place-items:center;font-weight:800">${i + 1}</span><span style="font-size:15px;font-weight:500">${e(t)}</span></div>`).join('')}`, 'padding:24px;border-radius:18px'),
    },
  };
})();
