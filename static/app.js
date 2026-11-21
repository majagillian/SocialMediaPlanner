'use strict';
/* =========================================================================
   Violet Planner – Daten, gemeinsame Komponenten und Modul-Ansichten
   ========================================================================= */

// ---------- Daten-Store ---------------------------------------------------
const S = { projects: [], objectives: [], key_results: [], tasks: [], posts: [], boards: [], settings: [], videos: [] };
const listeners = new Set();
const emit = () => listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { toast(data.error || 'Fehler beim Speichern'); throw new Error(data.error || res.status); }
  return data;
}

const DB = {
  async load() { Object.assign(S, await api('GET', '/api/all')); },
  async create(t, obj, silent) {
    const r = await api('POST', `/api/${t}`, obj);
    S[t].push(r); if (!silent) emit(); return r;
  },
  async update(t, id, patch, silent) {
    const r = await api('PUT', `/api/${t}/${id}`, patch);
    const i = S[t].findIndex(x => x.id === id);
    if (i >= 0) S[t][i] = r;
    if (!silent) emit();
    return r;
  },
  async remove(t, id) {
    await api('DELETE', `/api/${t}/${id}`);
    await DB.load(); emit();
  },
};
const byId = (t, id) => S[t].find(x => x.id === Number(id));

// Einstellungen (z. B. gespeicherte Farbpalette) – liegen in der Tabelle settings
function getSetting(key, fallback) {
  const r = S.settings.find(x => x.key === key);
  if (!r) return fallback;
  try { return JSON.parse(r.value); } catch { return fallback; }
}
async function setSetting(key, value) {
  const r = S.settings.find(x => x.key === key);
  const v = JSON.stringify(value);
  if (r) await DB.update('settings', r.id, { value: v }, true);
  else await DB.create('settings', { key, value: v }, true);
}

// ---------- Helfer --------------------------------------------------------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return iso(d); };
const fmtDate = s => s ? new Date(s + 'T00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : '';
const fmtNum = n => Number(n ?? 0).toLocaleString('de-DE', { maximumFractionDigits: 2 });
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** Icon über Iconify (über 200.000 Icons, benötigt Internet). name = "prefix:name" oder nur lucide-Name */
function iconUrl(name, color = '#6B6780') {
  const [prefix, icon] = name.includes(':') ? name.split(':') : ['lucide', name];
  return `https://api.iconify.design/${prefix}/${icon}.svg?color=${encodeURIComponent(color)}`;
}
const ic = (name, color, cls = 'ic') => `<img class="${cls}" src="${iconUrl(name, color)}" alt="" draggable="false">`;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- Konstanten ----------------------------------------------------
const TASK_STATUS = [['todo', 'Offen'], ['doing', 'In Arbeit'], ['done', 'Erledigt']];
const PRIORITIES = [['hoch', 'Hoch'], ['mittel', 'Mittel'], ['niedrig', 'Niedrig']];
const POST_STATUS = [['idee', 'Idee'], ['skript', 'Skript'], ['produktion', 'Produktion'], ['geplant', 'Geplant'], ['veroeffentlicht', 'Veröffentlicht']];
const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Pinterest', 'X', 'Threads', 'Facebook'];
const PLATFORM_ICON = {
  Instagram: 'mdi:instagram', TikTok: 'ic:baseline-tiktok', YouTube: 'mdi:youtube', LinkedIn: 'mdi:linkedin',
  Pinterest: 'mdi:pinterest', X: 'ri:twitter-x-fill', Threads: 'ri:threads-fill', Facebook: 'mdi:facebook',
};
const FORMATS = ['Reel', 'Karussell', 'Bild', 'Story', 'Video', 'Short', 'Live', 'Text'];
const OBJ_COLORS = [['#7C3AED', 'Violett'], ['#34D399', 'Mint'], ['#FB923C', 'Orange'], ['#6366F1', 'Indigo'], ['#EC4899', 'Pink']];
const label = (list, v) => (list.find(x => x[0] === v) || [v, v])[1];

// ---------- OKR-Berechnungen ----------------------------------------------
function krProgress(kr) {
  const span = kr.target_value - kr.start_value;
  if (!span) return kr.current_value >= kr.target_value ? 100 : 0;
  return clamp(Math.round((kr.current_value - kr.start_value) / span * 100), 0, 100);
}
const krsOf = o => S.key_results.filter(k => k.objective_id === o.id);
function objProgress(o) {
  const krs = krsOf(o);
  return krs.length ? Math.round(krs.reduce((a, k) => a + krProgress(k), 0) / krs.length) : 0;
}
const progressColor = p => p >= 70 ? 'var(--mint)' : p >= 35 ? 'var(--violet)' : 'var(--orange)';

// ---------- Modale Dialoge ------------------------------------------------
function openForm({ title, fields, values = {}, onDelete, submitLabel = 'Speichern', extra = '' }) {
  return new Promise(resolve => {
    const body = fields.map(f => {
      const v = values[f.key] ?? f.default ?? '';
      let input;
      if (f.type === 'textarea') input = `<textarea name="${f.key}" rows="${f.rows || 3}">${esc(v)}</textarea>`;
      else if (f.type === 'select') input = `<select name="${f.key}">${f.options.map(([val, lab]) =>
        `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
      else if (f.type === 'checkbox') input = `<input name="${f.key}" type="checkbox" ${v ? 'checked' : ''}>`;
      else input = `<input name="${f.key}" type="${f.type || 'text'}" value="${esc(v)}" ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''} ${f.list ? `list="dl-${f.key}"` : ''}>
        ${f.list ? `<datalist id="dl-${f.key}">${f.list.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`;
      return `<label class="field ${f.half ? 'half' : ''} ${f.type === 'checkbox' ? 'check' : ''}"><span>${esc(f.label)}</span>${input}</label>`;
    }).join('');
    const el = h(`<div class="modal-backdrop"><form class="modal">
      <h3>${esc(title)}</h3>${extra}<div class="fields">${body}</div>
      <div class="modal-actions">
        ${onDelete ? '<button type="button" class="btn danger" data-act="delete">Löschen</button>' : ''}
        <span class="grow"></span>
        <button type="button" class="btn ghost" data-act="cancel">Abbrechen</button>
        <button class="btn primary">${esc(submitLabel)}</button>
      </div></form></div>`);
    const close = v => { el.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    document.addEventListener('keydown', onKey);
    el.addEventListener('mousedown', e => { if (e.target === el) close(null); });
    $('[data-act=cancel]', el).onclick = () => close(null);
    const del = $('[data-act=delete]', el);
    if (del) del.onclick = async () => { if (confirm('Wirklich löschen?')) { await onDelete(); close(null); } };
    $('form', el).onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target); const out = {};
      fields.forEach(f => {
        let v = fd.get(f.key);
        if (f.type === 'checkbox') v = v === 'on';
        else if (f.type === 'number' || f.numeric) v = (v === '' || v === null) ? null : Number(v);
        out[f.key] = v;
      });
      close(out);
    };
    $('#modal-root').appendChild(el);
    $('input:not([type=checkbox]),textarea,select', el)?.focus();
  });
}

/** Auswahl-Dialog mit Kacheln. options: [{value,label,desc,icon}] */
function choose(title, options) {
  return new Promise(resolve => {
    const el = h(`<div class="modal-backdrop"><div class="modal">
      <h3>${esc(title)}</h3>
      <div class="choices">${options.map(o => `<button class="choice" data-v="${esc(o.value)}">
        ${o.icon ? ic(o.icon, '#7C3AED', 'choice-ic') : ''}<span><b>${esc(o.label)}</b>${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</span></button>`).join('')}</div>
      <div class="modal-actions"><span class="grow"></span><button class="btn ghost" data-act="cancel">Abbrechen</button></div>
    </div></div>`);
    const close = v => { el.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    document.addEventListener('keydown', onKey);
    el.addEventListener('mousedown', e => { if (e.target === el) close(null); });
    $('[data-act=cancel]', el).onclick = () => close(null);
    $$('.choice', el).forEach(b => b.onclick = () => close(b.dataset.v));
    $('#modal-root').appendChild(el);
  });
}

// ---------- Editoren für Datensätze ---------------------------------------
const krOptions = () => [['', '– keines –'], ...S.key_results.map(k =>
  [k.id, `${byId('objectives', k.objective_id)?.title || '?'} › ${k.title}`])];
const projectList = () => [...new Set(S.tasks.map(t => t.project).filter(Boolean))]; // Altbestand
const projName = id => byId('projects', id)?.name || '';
const projectOptions = (withNew = true) => [['', '– kein Projekt –'], ...S.projects.filter(p => p.status !== 'abgeschlossen' || true).map(p => [p.id, p.name]), ...(withNew ? [['new', '+ Neues Projekt …']] : [])];
/** gehört ein Eintrag zum Projekt? ref = Projekt-ID oder (Altbestand) Projektname */
function inProject(item, ref) {
  if (!ref) return true;
  const id = Number(ref);
  if (id) return item.project_id === id;
  const p = S.projects.find(x => x.name === ref);
  return p ? item.project_id === p.id : item.project === ref;
}
async function resolveProjectChoice(v) {
  if (v.project_id === 'new') { const p = await editProject(); v.project_id = p ? p.id : null; }
  else v.project_id = v.project_id ? Number(v.project_id) : null;
  return v;
}

async function editTask(task = {}, defaults = {}) {
  const isNew = !task.id;
  const v = await openForm({
    title: isNew ? 'Neue Aufgabe' : 'Aufgabe bearbeiten',
    values: { ...defaults, ...task },
    onDelete: isNew ? null : () => DB.remove('tasks', task.id),
    fields: [
      { key: 'title', label: 'Titel', required: true },
      { key: 'status', label: 'Status', type: 'select', options: TASK_STATUS, half: true, default: 'todo' },
      { key: 'priority', label: 'Priorität', type: 'select', options: PRIORITIES, half: true, default: 'mittel' },
      { key: 'due_date', label: 'Fällig am', type: 'date', half: true },
      { key: 'project_id', label: 'Projekt', type: 'select', half: true, options: projectOptions() },
      { key: 'kr_id', label: 'Zahlt ein auf Key Result', type: 'select', options: krOptions(), numeric: true },
      { key: 'tags', label: 'Tags (kommagetrennt)' },
      { key: 'notes', label: 'Notizen', type: 'textarea' },
    ],
  });
  if (!v) return null;
  await resolveProjectChoice(v); v.project = projName(v.project_id);
  return isNew ? DB.create('tasks', v) : DB.update('tasks', task.id, v);
}

async function editPost(post = {}, defaults = {}) {
  const isNew = !post.id;
  const pillars = [...new Set(S.posts.map(p => p.pillar).filter(Boolean))];
  const v = await openForm({
    title: isNew ? 'Neuer Post' : 'Post bearbeiten',
    values: { ...defaults, ...post },
    onDelete: isNew ? null : () => DB.remove('posts', post.id),
    fields: [
      { key: 'title', label: 'Titel / Thema', required: true },
      { key: 'platform', label: 'Plattform', type: 'select', options: PLATFORMS.map(p => [p, p]), half: true, default: 'Instagram' },
      { key: 'format', label: 'Format', type: 'select', options: [['', '–'], ...FORMATS.map(f => [f, f])], half: true },
      { key: 'status', label: 'Status', type: 'select', options: POST_STATUS, half: true, default: 'idee' },
      { key: 'pillar', label: 'Content-Säule', half: true, list: pillars },
      { key: 'publish_date', label: 'Veröffentlichen am', type: 'date', half: true },
      { key: 'publish_time', label: 'Uhrzeit', type: 'time', half: true },
      { key: 'kr_id', label: 'Zahlt ein auf Key Result', type: 'select', options: krOptions(), numeric: true },
      { key: 'caption', label: 'Caption / Skript', type: 'textarea', rows: 4 },
      { key: 'hashtags', label: 'Hashtags' },
      { key: 'notes', label: 'Notizen', type: 'textarea', rows: 2 },
    ],
  });
  if (!v) return null;
  return isNew ? DB.create('posts', v) : DB.update('posts', post.id, v);
}

async function editObjective(o = {}) {
  const isNew = !o.id;
  const v = await openForm({
    title: isNew ? 'Neues Ziel (Objective)' : 'Ziel bearbeiten',
    values: o,
    onDelete: isNew ? null : () => DB.remove('objectives', o.id),
    fields: [
      { key: 'title', label: 'Ziel – qualitativ & motivierend', required: true },
      { key: 'period', label: 'Zeitraum (z. B. Q1 2027)', half: true },
      { key: 'due_date', label: 'Stichtag', type: 'date', half: true },
      { key: 'color', label: 'Farbe', type: 'select', options: OBJ_COLORS, default: '#7C3AED' },
      { key: 'description', label: 'Warum ist dieses Ziel wichtig?', type: 'textarea' },
    ],
  });
  if (!v) return null;
  return isNew ? DB.create('objectives', v) : DB.update('objectives', o.id, v);
}

async function editKR(kr = {}, objectiveId) {
  const isNew = !kr.id;
  const v = await openForm({
    title: isNew ? 'Neues Key Result' : 'Key Result bearbeiten',
    values: { objective_id: objectiveId, ...kr },
    onDelete: isNew ? null : () => DB.remove('key_results', kr.id),
    fields: [
      { key: 'title', label: 'Messbares Ergebnis', required: true },
      { key: 'objective_id', label: 'Gehört zu Ziel', type: 'select', options: S.objectives.map(o => [o.id, o.title]), numeric: true },
      { key: 'start_value', label: 'Startwert', type: 'number', step: 'any', half: true, default: 0 },
      { key: 'target_value', label: 'Zielwert', type: 'number', step: 'any', half: true, default: 100 },
      { key: 'current_value', label: 'Aktueller Wert', type: 'number', step: 'any', half: true, default: 0 },
      { key: 'step', label: 'Schrittweite für +/−', type: 'number', step: 'any', half: true, default: 1 },
      { key: 'unit', label: 'Einheit (z. B. Follower, %, Posts)' },
    ],
  });
  if (!v) return null;
  return isNew ? DB.create('key_results', v) : DB.update('key_results', kr.id, v);
}

async function addOnDay(ds) {
  const what = await choose(`Am ${new Date(ds + 'T00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}`, [
    { value: 'task', label: 'Aufgabe', desc: 'To-do mit Fälligkeit', icon: 'square-check' },
    { value: 'post', label: 'Post', desc: 'Social-Media-Beitrag planen', icon: 'send' },
  ]);
  if (what === 'task') editTask({}, { due_date: ds });
  if (what === 'post') editPost({}, { publish_date: ds, status: 'geplant' });
}

// ---------- Gemeinsame Bausteine (auch fürs Whiteboard) -------------------
const empty = msg => `<div class="empty">${esc(msg)}</div>`;
const prioChip = p => `<span class="chip prio-${p || 'mittel'}">${esc(label(PRIORITIES, p || 'mittel'))}</span>`;
function dueChip(d, done) {
  if (!d) return '';
  const cls = !done && d < today() ? 'overdue' : !done && d === today() ? 'due-today' : '';
  return `<span class="date ${cls}">${d === today() ? 'Heute' : fmtDate(d)}</span>`;
}

function taskRowHTML(t) {
  const done = t.status === 'done';
  return `<div class="row task-row ${done ? 'done' : ''}" data-task="${t.id}">
    <input type="checkbox" data-toggle-task="${t.id}" ${done ? 'checked' : ''} title="Erledigt">
    <span class="row-title">${esc(t.title)}</span>
    ${t.status === 'doing' ? '<span class="chip doing">In Arbeit</span>' : ''}
    ${prioChip(t.priority)}${dueChip(t.due_date, done)}
  </div>`;
}
function taskListHTML(list) {
  return list.length ? `<div class="rows">${list.map(taskRowHTML).join('')}</div>` : empty('Keine Aufgaben');
}
const sortTasks = list => [...list].sort((a, b) =>
  (a.status === 'done') - (b.status === 'done') || (a.due_date || '9999').localeCompare(b.due_date || '9999'));

function postRowHTML(p) {
  return `<div class="row post-row" data-post="${p.id}">
    ${ic(PLATFORM_ICON[p.platform] || 'lucide:send', '#7C3AED')}
    <span class="row-title">${esc(p.title)}</span>
    <span class="chip st-${p.status}">${esc(label(POST_STATUS, p.status))}</span>
    ${p.publish_date ? `<span class="date">${fmtDate(p.publish_date)}${p.publish_time ? ' ' + esc(p.publish_time) : ''}</span>` : ''}
  </div>`;
}
const upcomingPosts = (platform = '') => S.posts
  .filter(p => p.status !== 'veroeffentlicht' && (!platform || p.platform === platform))
  .sort((a, b) => ((a.publish_date || '9999') + (a.publish_time || '')).localeCompare((b.publish_date || '9999') + (b.publish_time || '')));

function krRowHTML(k) {
  const p = krProgress(k);
  return `<div class="kr" data-kr="${k.id}">
    <div class="kr-top"><span class="kr-title">${esc(k.title)}</span>
      <span class="kr-val">${fmtNum(k.current_value)} / ${fmtNum(k.target_value)} ${esc(k.unit || '')}</span>
      <button class="mini" data-kr-inc="${k.id}" data-dir="-1" title="Verringern">−</button>
      <button class="mini" data-kr-inc="${k.id}" data-dir="1" title="Erhöhen">+</button></div>
    <div class="bar"><i style="width:${p}%;background:${progressColor(p)}"></i></div>
  </div>`;
}
function ringHTML(p, size = 54) {
  return `<div class="ring" style="--p:${p};--c:${progressColor(p)};width:${size}px;height:${size}px"><span>${p}%</span></div>`;
}
function objectiveCardHTML(o, compact = false) {
  const krs = krsOf(o); const p = objProgress(o);
  const linked = S.tasks.filter(t => krs.some(k => k.id === t.kr_id));
  const linkedPosts = S.posts.filter(x => krs.some(k => k.id === x.kr_id));
  return `<div class="okr-card ${compact ? 'compact' : ''}" style="--accent:${o.color || '#7C3AED'}">
    <div class="okr-head" data-obj="${o.id}">
      <div><div class="okr-period">${esc(o.period || '')}${o.due_date ? ` · bis ${fmtDate(o.due_date)}` : ''}</div>
      <h3>${esc(o.title)}</h3></div>${ringHTML(p)}
    </div>
    ${!compact && o.description ? `<p class="muted small">${esc(o.description)}</p>` : ''}
    <div class="kr-list">${krs.map(krRowHTML).join('') || '<div class="muted small">Noch keine Key Results</div>'}</div>
    <div class="okr-foot"><span><button class="link" data-add-kr="${o.id}">+ Key Result</button>${compact ? '' : ` <button class="link ai-link" data-ai-obj="${o.id}">✦ KI prüfen</button>`}</span>
      <span class="muted small">${linked.filter(t => t.status === 'done').length}/${linked.length} Aufgaben · ${linkedPosts.length} Posts</span></div>
  </div>`;
}
function okrSummaryHTML() {
  if (!S.objectives.length) return empty('Noch keine Ziele');
  return `<div class="rows">${S.objectives.map(o => {
    const p = objProgress(o);
    return `<div class="row okr-sum" data-obj="${o.id}"><span class="dot" style="background:${o.color || '#7C3AED'}"></span>
      <span class="row-title">${esc(o.title)}</span><div class="bar sm"><i style="width:${p}%;background:${progressColor(p)}"></i></div><b class="pct">${p}%</b></div>`;
  }).join('')}</div>`;
}

// Kanban (Aufgaben + Content)
function taskCardHTML(t) {
  const kr = t.kr_id ? byId('key_results', t.kr_id) : null;
  return `<div class="kcard ${t.status === 'done' ? 'done' : ''}" draggable="true" data-drag="tasks:${t.id}" data-task="${t.id}">
    <div class="kcard-title">${esc(t.title)}</div>
    <div class="kcard-meta">${prioChip(t.priority)}${dueChip(t.due_date, t.status === 'done')}
      ${t.project_id && byId('projects', t.project_id) ? `<span class="chip ghost proj-chip"><i style="background:${byId('projects', t.project_id).color || '#7C3AED'}"></i>${esc(projName(t.project_id))}</span>` : t.project ? `<span class="chip ghost">${esc(t.project)}</span>` : ''}
      ${kr ? `<span class="chip kr-chip" title="${esc(kr.title)}">${ic('target', '#7C3AED', 'ic xs')}KR</span>` : ''}</div>
  </div>`;
}
function postCardHTML(p) {
  return `<div class="kcard post" draggable="true" data-drag="posts:${p.id}" data-post="${p.id}">
    <div class="kcard-title">${ic(PLATFORM_ICON[p.platform] || 'lucide:send', '#7C3AED', 'ic sm')} ${esc(p.title)}</div>
    <div class="kcard-meta">${p.format ? `<span class="chip ghost">${esc(p.format)}</span>` : ''}
      ${p.pillar ? `<span class="chip mint">${esc(p.pillar)}</span>` : ''}
      ${p.publish_date ? `<span class="date">${fmtDate(p.publish_date)}${p.publish_time ? ' ' + esc(p.publish_time) : ''}</span>` : ''}</div>
  </div>`;
}
function kanbanHTML(items, columns, table, compact = false) {
  const cardFn = table === 'tasks' ? taskCardHTML : postCardHTML;
  const addAttr = table === 'tasks' ? 'data-add-task' : 'data-add-post';
  return `<div class="kanban ${compact ? 'compact' : ''}">${columns.map(([v, l]) => {
    const its = items.filter(i => (i.status || columns[0][0]) === v);
    return `<div class="kcol" data-drop="${table}:status:${v}">
      <div class="kcol-head"><span class="kdot st-${v}"></span><span>${esc(l)}</span><span class="count">${its.length}</span></div>
      <div class="kcol-body">${its.map(cardFn).join('')}</div>
      <button class="kadd" ${addAttr}="${v}">+ Hinzufügen</button></div>`;
  }).join('')}</div>`;
}

// Kalender
function calendarEvents() {
  const m = {}; const add = (d, e) => { if (d) (m[d] ||= []).push(e); };
  S.objectives.forEach(o => add(o.due_date, { kind: 'obj', item: o }));
  S.projects.forEach(p => add(p.due_date, { kind: 'proj', item: p }));
  S.posts.forEach(p => add(p.publish_date, { kind: 'post', item: p }));
  S.tasks.forEach(t => add(t.due_date, { kind: 'task', item: t }));
  return m;
}
function eventChipHTML(e) {
  const it = e.item;
  if (e.kind === 'task') return `<div class="ev ev-task ${it.status === 'done' ? 'done' : ''}" draggable="true" data-drag="tasks:${it.id}" data-task="${it.id}" title="${esc(it.title)}">${esc(it.title)}</div>`;
  if (e.kind === 'post') return `<div class="ev ev-post st-${it.status}" draggable="true" data-drag="posts:${it.id}" data-post="${it.id}" title="${esc(it.title)}">${ic(PLATFORM_ICON[it.platform] || 'lucide:send', '#0F766E', 'ic xs')}${it.publish_time ? esc(it.publish_time) + ' ' : ''}${esc(it.title)}</div>`;
  if (e.kind === 'proj') return `<div class="ev ev-proj" draggable="true" data-drag="projects:${it.id}" data-proj="${it.id}" title="Projekt-Deadline: ${esc(it.name)}">${ic(it.icon || 'folder', '#FFFFFF', 'ic xs')}${esc(it.name)}</div>`;
  return `<div class="ev ev-obj" draggable="true" data-drag="objectives:${it.id}" data-obj="${it.id}" title="Stichtag: ${esc(it.title)}">${ic('target', '#C2410C', 'ic xs')}${esc(it.title)}</div>`;
}
function monthGridHTML(year, month, compact = false) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Montag zuerst
  const ev = calendarEvents(); const t = today();
  const weeks = Math.ceil((startDow + new Date(year, month + 1, 0).getDate()) / 7);
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(year, month, 1 - startDow + i); const ds = iso(d);
    const items = ev[ds] || []; const max = compact ? 2 : 4;
    cells += `<div class="cal-cell ${d.getMonth() !== month ? 'other' : ''} ${ds === t ? 'today' : ''} ${d.getDay() % 6 === 0 ? 'weekend' : ''}" data-day="${ds}" data-drop="date:${ds}">
      <div class="cal-num">${d.getDate()}</div>${items.slice(0, max).map(eventChipHTML).join('')}
      ${items.length > max ? `<div class="more">+${items.length - max} weitere</div>` : ''}</div>`;
  }
  return `<div class="cal ${compact ? 'compact' : ''}"><div class="cal-dow">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(x => `<span>${x}</span>`).join('')}</div>
    <div class="cal-grid" style="grid-template-rows:repeat(${weeks},1fr)">${cells}</div></div>`;
}

// ---------- Ereignis-Delegation (Klicks & Drag-and-drop) ------------------
function bindCommon(root) {
  if (root.__bound) return; root.__bound = true;
  root.addEventListener('click', async e => {
    if (root.__suppressClick) return;
    const np = e.target.closest('[data-new-proj]');
    if (np && root.contains(np)) { const created = await editProject(); if (created) location.hash = '#/projects?id=' + created.id; return; }
    const ai = e.target.closest('[data-ai-obj],[data-ai-new],[data-ai-settings]');
    if (ai && root.contains(ai)) {
      if (ai.dataset.aiSettings !== undefined) return AI.openSettings();
      return AI.openOkrAssistant(ai.dataset.aiObj ? byId('objectives', ai.dataset.aiObj) : null);
    }
    const t = e.target.closest('[data-toggle-task],[data-kr-inc],[data-add-kr],[data-add-task],[data-add-post],[data-add-obj],[data-proj],[data-task],[data-post],[data-obj],[data-kr],[data-day]');
    if (!t || !root.contains(t)) return;
    const d = t.dataset;
    if (d.toggleTask) {
      const tk = byId('tasks', d.toggleTask);
      return DB.update('tasks', tk.id, { status: tk.status === 'done' ? 'todo' : 'done' });
    }
    if (d.krInc) {
      const kr = byId('key_results', d.krInc);
      const v = Math.round((kr.current_value + Number(d.dir) * (kr.step || 1)) * 1000) / 1000;
      return DB.update('key_results', kr.id, { current_value: v });
    }
    if (d.addKr !== undefined) return editKR({}, Number(d.addKr));
    if (d.addTask !== undefined) return editTask({}, { status: d.addTask || 'todo', project_id: Number(root.__project) || (S.projects.find(p => p.name === root.__project)?.id ?? null) });
    if (d.proj) { location.hash = '#/projects?id=' + d.proj; return; }
    if (d.addPost !== undefined) return editPost({}, { status: d.addPost || 'idee', project_id: Number(root.__project) || null });
    if (d.addObj !== undefined) return editObjective();
    if (d.task) return editTask(byId('tasks', d.task));
    if (d.post) return editPost(byId('posts', d.post));
    if (d.kr) return editKR(byId('key_results', d.kr));
    if (d.obj) return editObjective(byId('objectives', d.obj));
    if (d.day) return addOnDay(d.day);
  });
  enableDnD(root);
}

function enableDnD(root) {
  root.addEventListener('dragstart', e => {
    const c = e.target.closest?.('[data-drag]'); if (!c) return;
    e.dataTransfer.setData('text/x-planner', c.dataset.drag);
    e.dataTransfer.effectAllowed = 'move';
    c.classList.add('dragging');
    e.stopPropagation();
  });
  root.addEventListener('dragend', e => e.target.closest?.('[data-drag]')?.classList.remove('dragging'));
  root.addEventListener('dragover', e => {
    const z = e.target.closest('[data-drop]'); if (!z) return;
    if (!e.dataTransfer.types.includes('text/x-planner')) return;
    e.preventDefault(); $$('.drop-hover', root).forEach(x => x !== z && x.classList.remove('drop-hover'));
    z.classList.add('drop-hover');
  });
  root.addEventListener('dragleave', e => e.target.closest?.('[data-drop]')?.classList.remove('drop-hover'));
  root.addEventListener('drop', e => {
    const z = e.target.closest('[data-drop]'); const raw = e.dataTransfer.getData('text/x-planner');
    if (!z || !raw) return;
    e.preventDefault(); e.stopPropagation(); z.classList.remove('drop-hover');
    const [table, id] = raw.split(':'); const spec = z.dataset.drop.split(':');
    if (spec[0] === 'date') {
      const field = table === 'posts' ? 'publish_date' : 'due_date';
      return DB.update(table, Number(id), { [field]: spec[1] });
    }
    const [dTable, field, value] = spec;
    if (dTable !== table) return toast('Hier können nur ' + (dTable === 'tasks' ? 'Aufgaben' : 'Posts') + ' abgelegt werden');
    DB.update(table, Number(id), { [field]: value });
  });
}

// ---------- Ansichten -----------------------------------------------------
function pageHead(title, sub, actions = '') {
  return `<header class="page-head"><div><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div><div class="actions">${actions}</div></header>`;
}

function renderDashboard(main) {
  const t = today();
  const open = S.tasks.filter(x => x.status !== 'done');
  const due = sortTasks(open.filter(x => x.due_date && x.due_date <= t));
  const soon = sortTasks(open.filter(x => x.due_date && x.due_date > t && x.due_date <= addDays(t, 7)));
  const weekPosts = S.posts.filter(p => p.publish_date && p.publish_date >= t && p.publish_date <= addDays(t, 7));
  const avg = S.objectives.length ? Math.round(S.objectives.reduce((a, o) => a + objProgress(o), 0) / S.objectives.length) : 0;
  const hr = new Date().getHours();
  const greet = hr < 5 ? 'Hallo' : hr < 11 ? 'Guten Morgen' : hr < 18 ? 'Hallo' : 'Guten Abend';
  main.innerHTML = pageHead(greet, new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    `<button class="btn" data-add-task>+ Aufgabe</button><button class="btn" data-add-post>+ Post</button><button class="btn primary" data-add-obj>+ Ziel</button>`) +
    `<div class="stats">
      <div class="stat"><span class="stat-ic v">${ic('list-checks', '#7C3AED')}</span><div><b>${open.length}</b><small>offene Aufgaben</small></div></div>
      <div class="stat"><span class="stat-ic o">${ic('alarm-clock', '#EA580C')}</span><div><b>${due.length}</b><small>heute fällig / überfällig</small></div></div>
      <div class="stat"><span class="stat-ic m">${ic('send', '#059669')}</span><div><b>${weekPosts.length}</b><small>Posts in 7 Tagen</small></div></div>
      <div class="stat"><span class="stat-ic v">${ic('target', '#7C3AED')}</span><div><b>${avg}%</b><small>Ø Zielfortschritt</small></div></div>
    </div>
    <div class="grid-2">
      <section class="card"><h2>Heute & überfällig</h2>${taskListHTML(due)}
        ${soon.length ? `<h4 class="sub">Nächste 7 Tage</h4>${taskListHTML(soon)}` : ''}</section>
      <section class="card"><h2>Nächste Posts</h2>${upcomingPosts().length ? `<div class="rows">${upcomingPosts().slice(0, 7).map(postRowHTML).join('')}</div>` : empty('Noch keine Posts geplant')}</section>
      <section class="card span-2"><h2>Aktive Projekte <a class="link small" href="#/projects" style="float:right">Alle Projekte →</a></h2>${projectSummaryHTML()}</section>
      <section class="card span-2"><h2>Ziele</h2>${okrSummaryHTML()}</section>
    </div>`;
  bindCommon(main);
}

function renderOKR(main) {
  main.innerHTML = pageHead('Ziele & Key Results', 'Qualitatives Ziel + messbare Ergebnisse. Aufgaben und Posts lassen sich einem Key Result zuordnen.',
    `<button class="btn ghost" data-ai-settings>KI-Einstellungen</button><button class="btn ai-btn" data-ai-new>${ic('sparkles', '#7C3AED', 'ic sm')} KI-Assistent</button><button class="btn primary" data-add-obj>+ Ziel</button>`) +
    `<div class="okr-grid">${S.objectives.map(o => objectiveCardHTML(o)).join('') || empty('Noch keine Ziele – lege dein erstes Ziel an.')}</div>`;
  bindCommon(main);
}

let taskMode = 'kanban', taskProject = '';
function renderTasks(main) {
  if (taskProject && !byId('projects', taskProject)) taskProject = '';
  const list = S.tasks.filter(t => inProject(t, taskProject));
  main.innerHTML = pageHead('Aufgaben', `${list.filter(t => t.status !== 'done').length} offen · ${list.filter(t => t.status === 'done').length} erledigt`,
    `<select class="input" id="tp"><option value="">Alle Projekte</option>${S.projects.map(p => `<option value="${p.id}" ${String(p.id) === String(taskProject) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
     <div class="seg"><button data-mode="kanban" class="${taskMode === 'kanban' ? 'on' : ''}">Kanban</button><button data-mode="list" class="${taskMode === 'list' ? 'on' : ''}">Liste</button></div>
     <button class="btn primary" data-add-task>+ Aufgabe</button>`) +
    (taskMode === 'kanban' ? kanbanHTML(list, TASK_STATUS, 'tasks') : `<section class="card">${taskListHTML(sortTasks(list))}</section>`);
  main.__project = taskProject;
  $('#tp', main).onchange = e => { taskProject = e.target.value; renderTasks(main); };
  $$('[data-mode]', main).forEach(b => b.onclick = () => { taskMode = b.dataset.mode; renderTasks(main); });
  bindCommon(main);
}

let calCursor = new Date(); calCursor.setDate(1);
function renderCalendar(main) {
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  main.innerHTML = pageHead(`${MONTHS[m]} ${y}`, 'Aufgaben, Posts und Ziel-Stichtage. Einträge per Drag & Drop verschieben, Klick auf einen Tag zum Anlegen.',
    `<div class="legend"><span class="lg task">Aufgabe</span><span class="lg post">Post</span><span class="lg obj">Ziel</span></div>
     <button class="btn" data-nav="-1">‹</button><button class="btn" data-nav="0">Heute</button><button class="btn" data-nav="1">›</button>`) +
    `<section class="card cal-wrap">${monthGridHTML(y, m)}</section>`;
  $$('[data-nav]', main).forEach(b => b.onclick = () => {
    const n = Number(b.dataset.nav);
    if (n === 0) { calCursor = new Date(); calCursor.setDate(1); } else calCursor.setMonth(calCursor.getMonth() + n);
    renderCalendar(main);
  });
  bindCommon(main);
}

let contentPlatform = '', contentMode = 'pipeline';
function renderContent(main) {
  const list = S.posts.filter(p => !contentPlatform || p.platform === contentPlatform);
  const pillars = {};
  list.forEach(p => { const k = p.pillar || 'Ohne Säule'; pillars[k] = (pillars[k] || 0) + 1; });
  const t = today();
  const weekCount = list.filter(p => p.publish_date >= addDays(t, -((new Date().getDay() + 6) % 7)) && p.publish_date <= addDays(t, 6 - ((new Date().getDay() + 6) % 7))).length;
  main.innerHTML = pageHead('Content-Planung', `${list.length} Beiträge · ${weekCount} in dieser Woche`,
    `<select class="input" id="cp"><option value="">Alle Plattformen</option>${PLATFORMS.map(p => `<option ${p === contentPlatform ? 'selected' : ''}>${p}</option>`).join('')}</select>
     <div class="seg"><button data-mode="pipeline" class="${contentMode === 'pipeline' ? 'on' : ''}">Pipeline</button><button data-mode="list" class="${contentMode === 'list' ? 'on' : ''}">Liste</button></div>
     <button class="btn primary" data-add-post>+ Post</button>`) +
    `<div class="pillars">${Object.entries(pillars).map(([k, v]) => `<span class="chip mint">${esc(k)} · ${v}</span>`).join('') || '<span class="muted small">Tipp: Ordne Posts Content-Säulen zu, um die Balance im Blick zu behalten.</span>'}</div>` +
    (contentMode === 'pipeline' ? kanbanHTML(list, POST_STATUS, 'posts')
      : `<section class="card">${upcomingPosts(contentPlatform).length ? `<div class="rows">${upcomingPosts(contentPlatform).map(postRowHTML).join('')}</div>` : empty('Keine offenen Posts')}</section>`);
  $('#cp', main).onchange = e => { contentPlatform = e.target.value; renderContent(main); };
  $$('[data-mode]', main).forEach(b => b.onclick = () => { contentMode = b.dataset.mode; renderContent(main); });
  bindCommon(main);
}

// ---------- Router --------------------------------------------------------
const VIEWS = {
  dashboard: renderDashboard,
  board: main => window.Board.mount(main),
  okr: renderOKR, tasks: renderTasks, calendar: renderCalendar, content: renderContent,
  video: main => window.VideoEditor.mount(main),
  projects: main => renderProjects(main),
};
let currentView = null, cleanup = null;

function freshMain() {
  const old = $('#main'); const main = old.cloneNode(false); // entfernt alte Event-Listener
  old.replaceWith(main); return main;
}
function route() {
  const name = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
  const view = VIEWS[name] ? name : 'dashboard';
  if (cleanup) { cleanup(); cleanup = null; }
  $$('.sidebar nav a').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  const main = freshMain(); main.className = 'view-' + view; currentView = view;
  const r = VIEWS[view](main);
  if (typeof r === 'function') cleanup = r;
}
listeners.add(() => {
  if (!currentView || currentView === 'board' || currentView === 'video') return;
  const main = $('#main'); const scroll = main.scrollTop;
  VIEWS[currentView](main); main.scrollTop = scroll;
});

window.addEventListener('hashchange', route);
// Icons ohne Internet: kaputte Bild-Symbole ausblenden
document.addEventListener('error', e => { if (e.target.tagName === 'IMG' && e.target.src.includes('iconify')) e.target.style.visibility = 'hidden'; }, true);
window.addEventListener('load', async () => {
  try { await DB.load(); } catch (e) { $('#main').innerHTML = '<div class="loading">Server nicht erreichbar. Läuft app.py?</div>'; return; }
  route();
});
