'use strict';
/* =========================================================================
   Content-Management: detaillierter Post-Editor, Plattform-Varianten,
   Zeichenzähler, Beitragsvorlagen und KI-Caption
   ========================================================================= */
const PLATFORM_LIMITS = { Instagram: 2200, TikTok: 4000, YouTube: 5000, LinkedIn: 3000, Pinterest: 500, X: 280, Threads: 500, Facebook: 63206 };
const ASPECTS = [['9:16', '9:16 Hochformat (Reel, TikTok, Short, Story)'], ['4:5', '4:5 Instagram-Hochformat'], ['1:1', '1:1 Quadrat'], ['16:9', '16:9 Querformat (YouTube)']];
const MUSIC_SOURCES = ['Instagram-Musikbibliothek', 'TikTok-Sounds (kommerziell freigegeben)', 'YouTube Audio Library', 'Lizenzfrei (z. B. Epidemic, Artlist)', 'Eigene Aufnahme', 'Ohne Musik'];
const DEFAULT_CHECKLIST = ['Hook in den ersten 2 Sekunden', 'Untertitel eingeblendet', 'Ton/Musik geprüft (Lizenz!)', 'Caption mit Call-to-Action', 'Hashtags (3–8 passende)', 'Cover/Thumbnail gestaltet', 'Alt-Text hinterlegt', 'Personen/Marken markiert', 'Beste Uhrzeit gewählt'];

const platformsOf = p => {
  const list = String(p.platforms || '').split(',').map(x => x.trim()).filter(Boolean);
  return list.length ? list : (p.platform ? [p.platform] : []);
};
const parseJSON = (s, fb) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

// ---------- Beitragsvorlagen ----------------------------------------------
const POST_TEMPLATES = [
  { id: 'tip-reel', name: 'Tipp-Reel', icon: 'lightbulb', desc: '3 schnelle Tipps, 20–40 s', v: {
    format: 'Reel', platforms: 'Instagram,TikTok,YouTube', aspect: '9:16', duration: '30 s', pillar: 'Wissen',
    hook: 'Du machst diesen Fehler bei [Thema] – und merkst es nicht.',
    script: '0–3 s  HOOK: Frage/Fehler direkt in die Kamera\n3–8 s  Problem kurz erklären\n8–25 s  Tipp 1 · Tipp 2 · Tipp 3 (je 1 Satz + Texteinblendung)\n25–30 s  CTA: „Speicher dir das für später!“',
    shotlist: 'Szene 1 | 3 s | Nahaufnahme, direkter Blick, Text: Hook\nSzene 2 | 5 s | Halbtotale, Problem zeigen\nSzene 3 | 17 s | B-Roll + Texteinblendungen Tipp 1–3\nSzene 4 | 5 s | Nahaufnahme, CTA mit Geste',
    caption: '[Hook wiederholen] 👇\n\n1️⃣ Tipp 1 …\n2️⃣ Tipp 2 …\n3️⃣ Tipp 3 …\n\nWelcher Tipp ist neu für dich? Schreib die Nummer in die Kommentare!',
    cta: 'Speichern & mit jemandem teilen, der das braucht', hashtags: '#[thema] #[thema]tipps #lernenmitreels', music: 'Trend-Sound, leise im Hintergrund (10–15 %)', music_source: 'Instagram-Musikbibliothek' } },
  { id: 'carousel', name: 'Karussell: Liste', icon: 'gallery-horizontal', desc: '5–8 Slides mit Mehrwert', v: {
    format: 'Karussell', platforms: 'Instagram,LinkedIn', aspect: '4:5', pillar: 'Wissen',
    hook: '5 Dinge, die ich gern früher über [Thema] gewusst hätte',
    script: 'Slide 1: Titel/Hook (groß, max. 8 Wörter)\nSlide 2: Warum das wichtig ist\nSlide 3–7: je 1 Punkt mit kurzer Erklärung\nSlide 8: Zusammenfassung + CTA „Folgen für mehr“',
    caption: 'Speicher dir diesen Post 📌\n\n[1–2 Sätze Kontext]\n\nWelcher Punkt hat dich überrascht?', cta: 'Folge für mehr Tipps zu [Thema]', hashtags: '#[thema] #karussell #tipps', music: 'Ruhiger Lo-Fi-Track', music_source: 'Instagram-Musikbibliothek' } },
  { id: 'bts', name: 'Behind the Scenes', icon: 'clapperboard', desc: 'Einblick in Prozess & Alltag', v: {
    format: 'Reel', platforms: 'Instagram,TikTok', aspect: '9:16', duration: '15–25 s', pillar: 'Behind the Scenes',
    hook: 'So entsteht eigentlich ein Post von mir 👀',
    script: 'Schnelle Schnitte (je 1–2 s) vom Prozess: Idee → Setup → Dreh → Schnitt → fertiger Post\nTextüberlagerung pro Schritt\nAm Ende: fertiges Ergebnis zeigen',
    shotlist: 'Notizbuch/Idee | 2 s\nLicht & Kamera aufbauen | 3 s\nDreh-Ausschnitt mit Fehler (Blooper) | 3 s\nSchnitt am Laptop | 3 s\nFertiger Post | 3 s',
    caption: 'Was ihr nicht seht: [ehrlicher Einblick] 😅\n\nWollt ihr mehr davon sehen?', cta: 'Kommentiere „MEHR“ für Teil 2', hashtags: '#behindthescenes #contentcreator #creatorlife', music: 'Upbeat-Trend-Sound, im Takt geschnitten', music_source: 'TikTok-Sounds (kommerziell freigegeben)' } },
  { id: 'tutorial', name: 'Tutorial / How-to', icon: 'graduation-cap', desc: 'Schritt-für-Schritt-Anleitung', v: {
    format: 'Video', platforms: 'YouTube,Instagram,TikTok', aspect: '9:16', duration: '45–60 s', pillar: 'Wissen',
    hook: 'In 60 Sekunden lernst du, wie du [Ergebnis] erreichst.',
    script: '0–3 s Ergebnis zuerst zeigen\n3–50 s Schritt 1–4 mit Bildschirm-/Handaufnahme, Voiceover\n50–60 s Zusammenfassung + CTA',
    voiceover: 'Schritt 1: … Schritt 2: … Schritt 3: … Und fertig!', caption: 'So geht’s 👇\n\nSchritt 1: …\nSchritt 2: …\nSchritt 3: …\n\nFragen? Ab in die Kommentare!', cta: 'Speichern zum Nachmachen', hashtags: '#tutorial #howto #[thema]', music: 'Instrumental, ruhig, unter dem Voiceover', music_source: 'YouTube Audio Library' } },
  { id: 'trend', name: 'Trend-Reel', icon: 'trending-up', desc: 'Trend-Sound/-Format auf dein Thema', v: {
    format: 'Reel', platforms: 'TikTok,Instagram', aspect: '9:16', duration: '7–15 s', pillar: 'Unterhaltung',
    hook: '[Trend-Text-Format, z. B. „POV: …“]', script: 'Trend-Sound auswählen (Lizenz prüfen!)\nSchnitte exakt auf den Beat\nText-Overlay mit Bezug zu deiner Nische',
    caption: 'Erkennt sich hier jemand wieder? 😂', cta: 'Markiere jemanden, dem das passiert', hashtags: '#trend #pov #[thema]', music: '[Name des Trend-Sounds]', music_source: 'TikTok-Sounds (kommerziell freigegeben)' } },
  { id: 'story-poll', name: 'Story mit Umfrage', icon: 'vote', desc: 'Interaktion & Feedback einholen', v: {
    format: 'Story', platforms: 'Instagram', aspect: '9:16', pillar: 'Community',
    hook: 'Kurze Frage an euch 👇', script: 'Story 1: Kontext (Foto/Video)\nStory 2: Umfrage-Sticker „A oder B?“\nStory 3: Fragen-Sticker „Was wollt ihr als Nächstes sehen?“',
    caption: '', cta: 'Abstimmen!', music: 'Kurzer Ausschnitt aus der Musikbibliothek', music_source: 'Instagram-Musikbibliothek' } },
  { id: 'offer', name: 'Angebot vorstellen', icon: 'shopping-bag', desc: 'Produkt, Kurs oder Kooperation', v: {
    format: 'Reel', platforms: 'Instagram,TikTok,Facebook', aspect: '9:16', duration: '20–30 s', pillar: 'Angebot',
    hook: 'Das hätte mir am Anfang so viel Zeit gespart …', script: 'Problem (5 s) → Lösung/Angebot zeigen (15 s) → Ergebnis/Testimonial (5 s) → CTA (5 s)',
    caption: '[Problem]\n\nDarum habe ich [Angebot] entwickelt: …\n\n✅ Vorteil 1\n✅ Vorteil 2\n✅ Vorteil 3\n\n👉 Link in Bio', cta: 'Link in Bio / Kommentiere „INFO“', link: 'https://', hashtags: '#[marke] #[thema]', music: 'Motivierend, aufbauend', music_source: 'Lizenzfrei (z. B. Epidemic, Artlist)' } },
  { id: 'qa', name: 'Q&A / FAQ', icon: 'message-circle-question', desc: 'Community-Frage beantworten', v: {
    format: 'Reel', platforms: 'Instagram,TikTok', aspect: '9:16', duration: '20–40 s', pillar: 'Community',
    hook: '„[Frage aus den Kommentaren]“ – gute Frage!', script: 'Kommentar als Sticker einblenden\nAntwort in 3 Sätzen\nBeispiel zeigen\nNach der nächsten Frage fragen',
    caption: 'Ihr fragt, ich antworte 💬\n\nWelche Frage soll ich als Nächstes beantworten?', cta: 'Stell deine Frage in den Kommentaren', hashtags: '#fragenundantworten #[thema]', music: 'Ohne Musik oder sehr leise', music_source: 'Ohne Musik' } },
  { id: 'story', name: 'Storytelling', icon: 'book-open', desc: 'Persönliche Geschichte mit Lerneffekt', v: {
    format: 'Video', platforms: 'Instagram,TikTok,LinkedIn', aspect: '9:16', duration: '45–75 s', pillar: 'Persönlich',
    hook: 'Vor einem Jahr hätte ich das nie gedacht …', script: 'Ausgangslage → Wendepunkt/Konflikt → Was ich gelernt habe → Was das für dich bedeutet',
    caption: '[Geschichte in 3–5 kurzen Absätzen]\n\nDas Wichtigste, das ich gelernt habe: …\n\nKennst du das?', cta: 'Teile deine Erfahrung in den Kommentaren', hashtags: '#storytime #[thema]', music: 'Emotional, Klavier/Ambient', music_source: 'Instagram-Musikbibliothek' } },
  { id: 'quote', name: 'Zitat-Post', icon: 'quote', desc: 'Statisches Bild mit Aussage', v: {
    format: 'Bild', platforms: 'Instagram,LinkedIn,Pinterest,Threads', aspect: '4:5', pillar: 'Inspiration',
    hook: '[Starker Satz]', caption: '[Kontext: warum dieser Satz für dich wichtig ist]\n\nStimmst du zu?', cta: 'Speichern als Erinnerung', hashtags: '#motivation #[thema]', music: '', music_source: 'Ohne Musik' } },
  { id: 'short', name: 'YouTube Short', icon: 'youtube', desc: 'Schnelles Format bis 60 s', v: {
    format: 'Short', platforms: 'YouTube', aspect: '9:16', duration: '30–60 s', pillar: 'Wissen',
    hook: 'Wusstest du, dass …?', script: 'Hook mit überraschendem Fakt\nErklärung in 3 Schritten\nLoop: Ende führt zurück zum Anfang', caption: '[Titel max. 100 Zeichen] #shorts', hashtags: '#shorts #[thema]', music: 'YouTube Audio Library – energetisch', music_source: 'YouTube Audio Library' } },
  { id: 'linkedin', name: 'LinkedIn Text-Post', icon: 'linkedin', desc: 'Expertise & Learnings', v: {
    format: 'Text', platforms: 'LinkedIn', pillar: 'Wissen',
    hook: '[Erste Zeile, die neugierig macht – max. 2 Zeilen vor „mehr anzeigen“]', caption: '[Hook]\n\n[Situation]\n\n3 Learnings:\n→ …\n→ …\n→ …\n\n[Frage an die Community]', cta: 'Was ist deine Erfahrung?', hashtags: '#[thema] #learnings', music_source: 'Ohne Musik' } },
];

// ---------- Post-Editor -----------------------------------------------------
// ersetzt den einfachen Dialog aus app.js
editPost = function (post = {}, defaults = {}) {
  return new Promise(resolve => {
    const isNew = !post.id;
    let v = { platform: 'Instagram', status: 'idee', ...defaults, ...post };
    let variants = parseJSON(v.variants, {});
    let checklist = parseJSON(v.checklist, null) || DEFAULT_CHECKLIST.map(t => ({ t, done: false }));
    let published = parseJSON(v.published_urls, {});
    let tab = 'basics';
    const pillars = [...new Set(S.posts.map(p => p.pillar).filter(Boolean))];
    const ownTpl = () => getSetting('postTemplates', []);

    const el = h(`<div class="modal-backdrop"><form class="modal post-modal" autocomplete="off">
      <div class="pm-head"><h3>${isNew ? 'Neuer Beitrag' : 'Beitrag bearbeiten'}</h3>
        <div class="pm-head-actions"><button type="button" class="btn sm" data-a="tpl">${ic('layout-template', '#7C3AED', 'ic sm')} Vorlage anwenden</button>
        <button type="button" class="btn sm ghost" data-a="save-tpl">Als Vorlage speichern</button>
        <button type="button" class="btn sm ai-btn" data-a="ai">${ic('sparkles', '#7C3AED', 'ic sm')} KI-Texte</button></div></div>
      <div class="pm-tabs">${[['basics', 'Grundlagen'], ['text', 'Caption & Text'], ['video', 'Video & Audio'], ['publish', 'Veröffentlichung'], ['check', 'Checkliste']]
        .map(([k, l]) => `<button type="button" data-tab="${k}">${l}</button>`).join('')}</div>
      <div class="pm-body"></div>
      <div class="modal-actions">${isNew ? '' : '<button type="button" class="btn danger" data-a="delete">Löschen</button><button type="button" class="btn ghost" data-a="dup">Duplizieren</button>'}
        <span class="grow"></span><button type="button" class="btn ghost" data-a="cancel">Abbrechen</button><button class="btn primary">Speichern</button></div>
    </form></div>`);
    const body = $('.pm-body', el);
    const field = (key, label, type = 'text', extra = {}) => {
      const val = v[key] ?? '';
      let input;
      if (type === 'textarea') input = `<textarea data-f="${key}" rows="${extra.rows || 3}" placeholder="${esc(extra.ph || '')}">${esc(val)}</textarea>`;
      else if (type === 'select') input = `<select data-f="${key}">${extra.options.map(([o, l]) => `<option value="${esc(o)}" ${String(o) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      else input = `<input data-f="${key}" type="${type}" value="${esc(val)}" placeholder="${esc(extra.ph || '')}" ${extra.list ? `list="pl-${key}"` : ''}>${extra.list ? `<datalist id="pl-${key}">${extra.list.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`;
      return `<label class="field ${extra.half ? 'half' : ''}"><span>${label}${extra.counter ? ` <em class="cnt" data-cnt="${key}"></em>` : ''}</span>${input}</label>`;
    };
    const sel = () => platformsOf(v);

    function draw() {
      $$('[data-tab]', el).forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
      const p = sel();
      if (tab === 'basics') body.innerHTML = `<div class="fields">
        ${field('title', 'Titel / Thema (intern)', 'text', { ph: 'z. B. Reel: 3 Fehler beim Posten' })}
        <div class="field"><span>Plattformen (Crossposting)</span><div class="plat-pick">${PLATFORMS.map(pl => `<button type="button" class="plat ${p.includes(pl) ? 'on' : ''}" data-plat="${pl}">${ic(PLATFORM_ICON[pl], p.includes(pl) ? '#FFFFFF' : '#4B4563', 'ic sm')} ${pl}</button>`).join('')}</div></div>
        ${field('format', 'Format', 'select', { half: true, options: [['', '–'], ...FORMATS.map(f => [f, f])] })}
        ${field('status', 'Status', 'select', { half: true, options: POST_STATUS })}
        ${field('publish_date', 'Veröffentlichen am', 'date', { half: true })}
        ${field('publish_time', 'Uhrzeit', 'time', { half: true })}
        ${field('pillar', 'Content-Säule', 'text', { half: true, list: pillars })}
        ${field('kr_id', 'Zahlt ein auf Key Result', 'select', { half: true, options: krOptions() })}
        ${field('project_id', 'Projekt', 'select', { half: true, options: projectOptions(false) })}
        ${field('notes', 'Interne Notizen', 'textarea', { rows: 2 })}</div>`;
      if (tab === 'text') body.innerHTML = `<div class="fields">
        ${field('hook', 'Hook (erste Zeile / erste 2 Sekunden)', 'text', { ph: 'Der Satz, der zum Stoppen bringt' })}
        ${field('caption', 'Caption', 'textarea', { rows: 7, counter: true, ph: 'Haupttext des Beitrags' })}
        <div class="limits">${p.map(pl => `<span class="lim" data-lim="${pl}">${ic(PLATFORM_ICON[pl], '#6B6780', 'ic xs')} <b></b></span>`).join('')}</div>
        ${field('hashtags', 'Hashtags', 'text', { counter: true, ph: '#thema #nische' })}
        ${field('cta', 'Call-to-Action', 'text', { half: true })}
        ${field('link', 'Link (Bio / Beschreibung)', 'url', { half: true, ph: 'https://' })}
        ${field('first_comment', 'Erster Kommentar (z. B. weitere Hashtags)', 'textarea', { rows: 2 })}
        <div class="field"><span>Eigene Caption je Plattform <small class="muted">(leer = Haupt-Caption wird verwendet)</small></span>
          <div class="variants">${p.map(pl => `<details ${variants[pl] ? 'open' : ''}><summary>${ic(PLATFORM_ICON[pl], '#7C3AED', 'ic xs')} ${pl} <em class="cnt" data-vcnt="${pl}"></em></summary>
            <textarea data-var="${pl}" rows="4" placeholder="Angepasste Caption für ${pl}">${esc(variants[pl] || '')}</textarea>
            <button type="button" class="link" data-copy="${pl}">In Zwischenablage kopieren</button></details>`).join('') || '<span class="muted small">Wähle zuerst Plattformen unter „Grundlagen“.</span>'}</div></div></div>`;
      if (tab === 'video') body.innerHTML = `<div class="pub-info">${ic('film', '#7C3AED', 'ic sm')} <span>${(() => { const vp = post.id && S.videos.find(x => x.post_id === post.id); return vp ? `Verknüpftes Videoprojekt: <b>${esc(vp.name)}</b>` : 'Schneide das Video direkt hier im Video-Editor – mit Filtern, Text, Voiceover und Musik.'; })()}</span>
          <button type="button" class="btn sm primary" data-a="open-video">${isNew ? 'Speichern & ' : ''}Im Video-Editor öffnen</button></div>
        <div class="fields">
        ${field('aspect', 'Seitenverhältnis', 'select', { half: true, options: [['', '–'], ...ASPECTS] })}
        ${field('duration', 'Ziel-Länge', 'text', { half: true, ph: 'z. B. 30 s' })}
        ${field('script', 'Skript / Ablauf (mit Zeitmarken)', 'textarea', { rows: 6, ph: '0–3 s Hook …' })}
        ${field('shotlist', 'Shotlist: Szene | Dauer | Beschreibung (eine pro Zeile)', 'textarea', { rows: 4 })}
        ${field('voiceover', 'Voiceover-Text', 'textarea', { rows: 3 })}
        <div class="pm-sep">Ton & Musik</div>
        ${field('music', 'Hintergrundmusik (Titel – Interpret / Sound-Name)', 'text', { ph: 'z. B. „Golden Hour“ – JVKE' })}
        ${field('music_source', 'Quelle / Lizenz', 'select', { half: true, options: [['', '–'], ...MUSIC_SOURCES.map(m => [m, m])] })}
        ${field('music_start', 'Musik-Startpunkt', 'text', { half: true, ph: 'z. B. 0:42' })}
        ${field('audio_notes', 'Ton-Notizen (Lautstärke, Ducking, Effekte)', 'text', { ph: 'z. B. Musik 15 %, unter Voiceover absenken' })}
        <div class="pm-sep">Gestaltung & Barrierefreiheit</div>
        ${field('cover_text', 'Cover-/Thumbnail-Text', 'text', { half: true })}
        ${field('location', 'Ort', 'text', { half: true })}
        ${field('people_tags', 'Personen/Marken markieren', 'text', { half: true, ph: '@name, @marke' })}
        ${field('alt_text', 'Alt-Text (Bildbeschreibung)', 'text', { half: true })}
        ${field('media_notes', 'Mediendateien / Speicherort', 'text', { ph: 'z. B. Ordner „Reels/2026-11“ oder Datei-Link' })}</div>`;
      if (tab === 'publish') body.innerHTML = `
        <div class="pub-info">${ic('info', '#7C3AED', 'ic sm')} <span>Automatisches Veröffentlichen ist noch nicht angebunden. Bis dahin: Texte je Plattform mit einem Klick kopieren, Beitrag in der App posten und den Link hier eintragen – der Status wird dann auf „Veröffentlicht“ gesetzt.</span></div>
        <div class="pub-list">${p.map(pl => `<div class="pub-row">${ic(PLATFORM_ICON[pl], '#7C3AED', 'ic')}<b>${pl}</b>
          <button type="button" class="btn sm" data-copy="${pl}">Text kopieren</button>
          <input class="input" data-pub="${pl}" placeholder="Link zum veröffentlichten Beitrag" value="${esc(published[pl] || '')}"></div>`).join('') || empty('Keine Plattform gewählt')}</div>
        <div class="fields" style="margin-top:12px">${field('publish_date', 'Datum', 'date', { half: true })}${field('publish_time', 'Uhrzeit', 'time', { half: true })}</div>`;
      if (tab === 'check') body.innerHTML = `<div class="pm-check">${checklist.map((c, i) => `<label class="ck"><input type="checkbox" data-ck="${i}" ${c.done ? 'checked' : ''}><span>${esc(c.t)}</span><button type="button" class="mini" data-ckdel="${i}" title="Entfernen">×</button></label>`).join('')}</div>
        <div class="ck-add"><input class="input" id="ck-new" placeholder="Eigenen Prüfpunkt hinzufügen"><button type="button" class="btn sm" data-a="ck-add">Hinzufügen</button></div>
        <div class="muted small" style="margin-top:8px">${checklist.filter(c => c.done).length} von ${checklist.length} erledigt</div>`;
      counters();
    }
    function counters() {
      const cap = v.caption || '', tags = v.hashtags || '';
      const full = (cap + (tags ? '\n\n' + tags : '')).length;
      const cnt = $('[data-cnt=caption]', el); if (cnt) cnt.textContent = `${full} Zeichen inkl. Hashtags`;
      const tc = $('[data-cnt=hashtags]', el);
      if (tc) { const n = (tags.match(/#\S+/g) || []).length; tc.textContent = `${n} Hashtags${n > 30 ? ' – Instagram erlaubt max. 30!' : n > 8 ? ' – 3–8 wirken meist besser' : ''}`; tc.classList.toggle('warn', n > 30); }
      $$('[data-lim]', el).forEach(l => {
        const pl = l.dataset.lim; const len = ((variants[pl] || cap) + (tags ? '\n\n' + tags : '')).length; const max = PLATFORM_LIMITS[pl];
        $('b', l).textContent = `${len}/${max}`; l.classList.toggle('over', len > max);
      });
      $$('[data-vcnt]', el).forEach(c => { const pl = c.dataset.vcnt; const len = (variants[pl] || '').length; c.textContent = len ? `${len}/${PLATFORM_LIMITS[pl]}` : ''; c.classList.toggle('warn', len > PLATFORM_LIMITS[pl]); });
    }
    const textFor = pl => [variants[pl] || [v.hook && !(v.caption || '').startsWith(v.hook) ? v.hook : '', v.caption].filter(Boolean).join('\n\n'), v.hashtags].filter(Boolean).join('\n\n');

    el.addEventListener('input', e => {
      const t = e.target;
      if (t.dataset.f) { v[t.dataset.f] = t.value; counters(); }
      if (t.dataset.var) { variants[t.dataset.var] = t.value; counters(); }
      if (t.dataset.pub) published[t.dataset.pub] = t.value;
    });
    el.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.ck) { checklist[t.dataset.ck].done = t.checked; draw(); }
      if (t.dataset.pub && t.value && v.status !== 'veroeffentlicht' && platformsOf(v).every(pl => published[pl])) { v.status = 'veroeffentlicht'; toast('Alle Links eingetragen – Status: Veröffentlicht'); }
    });
    el.addEventListener('click', async e => {
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset;
      if (d.tab) { tab = d.tab; return draw(); }
      if (d.plat) {
        const list = sel(); const on = list.includes(d.plat);
        const next = on ? list.filter(x => x !== d.plat) : [...list, d.plat];
        v.platforms = next.join(','); v.platform = next[0] || v.platform; return draw();
      }
      if (d.copy) { try { await navigator.clipboard.writeText(textFor(d.copy)); toast(`Text für ${d.copy} kopiert`); } catch { toast('Kopieren nicht möglich – bitte manuell markieren'); } return; }
      if (d.ckdel) { checklist.splice(Number(d.ckdel), 1); return draw(); }
      switch (d.a) {
        case 'ck-add': { const inp = $('#ck-new', el); if (inp.value.trim()) { checklist.push({ t: inp.value.trim(), done: false }); draw(); } return; }
        case 'cancel': return close(null);
        case 'open-video': {
          let target = post;
          if (isNew) { if (!(v.title || '').trim()) { tab = 'basics'; draw(); return toast('Bitte zuerst einen Titel eingeben'); } target = await DB.create('posts', collect()); }
          else await DB.update('posts', post.id, collect(), true);
          close(target); location.hash = '#/video?post=' + target.id; return;
        }
        case 'delete': if (confirm('Beitrag wirklich löschen?')) { await DB.remove('posts', post.id); close(null); } return;
        case 'dup': { const copy = collect(); delete copy.id; copy.title += ' (Kopie)'; copy.status = 'idee'; copy.published_urls = '{}'; const r = await DB.create('posts', copy); close(r); return; }
        case 'tpl': {
          const own = ownTpl();
          const choice = await choose('Beitragsvorlage anwenden', [...own.map(t => ({ value: 'own:' + t.id, label: '★ ' + t.name, desc: 'Eigene Vorlage', icon: 'bookmark' })),
            ...POST_TEMPLATES.map(t => ({ value: t.id, label: t.name, desc: t.desc, icon: t.icon }))]);
          if (!choice) return;
          const tpl = choice.startsWith('own:') ? own.find(t => t.id === choice.slice(4)).v : POST_TEMPLATES.find(t => t.id === choice).v;
          const keepTitle = v.title;
          v = { ...v, ...tpl, title: keepTitle || tpl.hook || '' };
          if (tpl.platforms) v.platform = tpl.platforms.split(',')[0];
          if (tpl.checklist) checklist = parseJSON(tpl.checklist, checklist);
          if (tpl.variants) variants = parseJSON(tpl.variants, variants);
          toast('Vorlage angewendet – Platzhalter in [eckigen Klammern] ersetzen'); return draw();
        }
        case 'save-tpl': {
          const r = await openForm({ title: 'Als Beitragsvorlage speichern', fields: [{ key: 'name', label: 'Name der Vorlage', required: true }], values: { name: v.format ? `${v.format}: ${v.title || ''}` : v.title }, submitLabel: 'Speichern' });
          if (!r) return;
          const data = collect(); ['id', 'title', 'publish_date', 'publish_time', 'status', 'published_urls', 'created_at', 'updated_at', 'kr_id'].forEach(k => delete data[k]);
          data.checklist = JSON.stringify(checklist.map(c => ({ t: c.t, done: false })));
          await setSetting('postTemplates', [...ownTpl(), { id: Math.random().toString(36).slice(2, 9), name: r.name, v: data }]);
          return toast(`Vorlage „${r.name}“ gespeichert`);
        }
        case 'ai': {
          const plats = sel().join(', ') || 'Instagram';
          b.disabled = true; const old = b.innerHTML; b.innerHTML = '<span class="spinner sm"></span> KI schreibt …';
          const r = await AI.generate('caption', `Erstelle Texte für diesen Social-Media-Beitrag.\nThema/Titel: ${v.title || '-'}\nFormat: ${v.format || '-'}\nPlattformen: ${plats}\n` +
            `Content-Säule: ${v.pillar || '-'}\nVorhandener Hook: ${v.hook || '-'}\nVorhandene Caption/Notizen: ${(v.caption || v.notes || '-').slice(0, 1500)}\nSkript: ${(v.script || '-').slice(0, 1000)}\n` +
            `Liefere für jede dieser Plattformen eine Variante: ${plats}.`);
          b.disabled = false; b.innerHTML = old;
          if (!r) return;
          ['hook', 'caption', 'hashtags', 'cta', 'first_comment'].forEach(k => { if (r[k]) v[k] = r[k]; });
          if (r.script && !v.script) v.script = r.script;
          if (r.variants && typeof r.variants === 'object') variants = { ...variants, ...r.variants };
          if (Array.isArray(r.music_ideas) && r.music_ideas.length && !v.music) v.audio_notes = 'Musik-Ideen: ' + r.music_ideas.join(' · ');
          tab = 'text'; draw(); toast('KI-Vorschlag eingefügt – bitte prüfen und anpassen'); return;
        }
      }
    });
    function collect() {
      const out = {};
      const keys = ['title', 'platform', 'platforms', 'format', 'pillar', 'status', 'publish_date', 'publish_time', 'caption', 'hashtags', 'notes', 'kr_id', 'hook', 'cta', 'first_comment', 'link',
        'aspect', 'duration', 'script', 'shotlist', 'voiceover', 'music', 'music_source', 'music_start', 'audio_notes', 'cover_text', 'alt_text', 'location', 'people_tags', 'media_notes'];
      keys.forEach(k => { out[k] = v[k] ?? null; });
      out.kr_id = out.kr_id === '' || out.kr_id == null ? null : Number(out.kr_id);
      out.project_id = v.project_id === '' || v.project_id == null ? null : Number(v.project_id);
      out.platform = platformsOf(v)[0] || 'Instagram';
      out.platforms = platformsOf(v).join(',');
      out.variants = JSON.stringify(Object.fromEntries(Object.entries(variants).filter(([, t]) => t && t.trim())));
      out.checklist = JSON.stringify(checklist); out.published_urls = JSON.stringify(published);
      return out;
    }
    function close(r) { el.remove(); document.removeEventListener('keydown', onKey); resolve(r); }
    const onKey = e => { if (e.key === 'Escape' && $('#modal-root').lastElementChild === el) close(null); };
    document.addEventListener('keydown', onKey);
    $('form', el).onsubmit = async e => {
      e.preventDefault();
      if (!(v.title || '').trim()) { tab = 'basics'; draw(); toast('Bitte einen Titel eingeben'); return; }
      const data = collect();
      const r = isNew ? await DB.create('posts', data) : await DB.update('posts', post.id, data);
      close(r);
    };
    $('#modal-root').appendChild(el); draw();
    setTimeout(() => $('[data-f=title]', el)?.focus(), 30);
  });
};

// Karten zeigen alle Plattformen + Hinweise auf Musik/Skript
postCardHTML = function (p) {
  const plats = platformsOf(p);
  const cl = parseJSON(p.checklist, []); const done = cl.filter(c => c.done).length;
  return `<div class="kcard post" draggable="true" data-drag="posts:${p.id}" data-post="${p.id}">
    <div class="kcard-plats">${plats.map(pl => ic(PLATFORM_ICON[pl] || 'lucide:send', '#7C3AED', 'ic sm')).join('')}</div>
    <div class="kcard-title">${esc(p.title)}</div>
    <div class="kcard-meta">${p.format ? `<span class="chip ghost">${esc(p.format)}</span>` : ''}
      ${p.pillar ? `<span class="chip mint">${esc(p.pillar)}</span>` : ''}
      ${p.music ? `<span class="chip ghost" title="${esc(p.music)}">♪</span>` : ''}
      ${cl.length ? `<span class="chip ${done === cl.length ? 'mint' : 'ghost'}" title="Checkliste">✓ ${done}/${cl.length}</span>` : ''}
      ${p.publish_date ? `<span class="date">${fmtDate(p.publish_date)}${p.publish_time ? ' ' + esc(p.publish_time) : ''}</span>` : ''}</div>
  </div>`;
};
