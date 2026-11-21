'use strict';
/* =========================================================================
   Projekte: bündeln Aufgaben, Beiträge, Whiteboards und Videos
   ========================================================================= */
const PROJECT_STATUS = [['geplant', 'Geplant'], ['aktiv', 'Aktiv'], ['pausiert', 'Pausiert'], ['abgeschlossen', 'Abgeschlossen']];
const PROJECT_ICONS = ['folder', 'rocket', 'camera', 'video', 'megaphone', 'lightbulb', 'target', 'calendar', 'heart', 'star', 'users', 'shopping-bag', 'graduation-cap', 'palette', 'mic', 'book-open'];

function projectStats(p) {
  const tasks = S.tasks.filter(t => t.project_id === p.id);
  const done = tasks.filter(t => t.status === 'done').length;
  const posts = S.posts.filter(x => x.project_id === p.id);
  const boards = S.boards.filter(b => b.project_id === p.id);
  const videos = S.videos.filter(v => v.project_id === p.id);
  const next = sortTasks(tasks.filter(t => t.status !== 'done' && t.due_date))[0];
  return { tasks, done, posts, boards, videos, next, pct: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}
const projStatusChip = s => `<span class="chip pst-${s || 'aktiv'}">${esc(label(PROJECT_STATUS, s || 'aktiv'))}</span>`;

async function editProject(p = {}) {
  const isNew = !p.id;
  const v = await openForm({
    title: isNew ? 'Neues Projekt' : 'Projekt bearbeiten',
    values: { color: '#7C3AED', icon: 'folder', status: 'aktiv', start_date: today(), ...p },
    onDelete: isNew ? null : async () => { await DB.remove('projects', p.id); if (location.hash.includes('projects?id=')) location.hash = '#/projects'; },
    extra: isNew ? '<p class="muted small" style="margin:-6px 0 12px">Ein Projekt bündelt Aufgaben, Beiträge, Whiteboards und Videos – z. B. „Account-Aufbau“, „Kooperation mit Marke X“ oder „Launch Online-Kurs“.</p>' : '',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUS, half: true },
      { key: 'color', label: 'Farbe', type: 'color', half: true },
      { key: 'start_date', label: 'Start', type: 'date', half: true },
      { key: 'due_date', label: 'Deadline', type: 'date', half: true },
      { key: 'icon', label: 'Icon (z. B. rocket, camera, megaphone)', half: true, list: PROJECT_ICONS },
      { key: 'objective_id', label: 'Zahlt ein auf Ziel (OKR)', type: 'select', numeric: true, half: true, options: [['', '– keines –'], ...S.objectives.map(o => [o.id, o.title])] },
      { key: 'description', label: 'Beschreibung / Ziel des Projekts', type: 'textarea' },
    ],
  });
  if (!v) return null;
  return isNew ? DB.create('projects', v) : DB.update('projects', p.id, v);
}

function projectCardHTML(p) {
  const st = projectStats(p); const overdue = p.due_date && p.due_date < today() && p.status !== 'abgeschlossen';
  return `<div class="proj-card" data-proj="${p.id}" style="--pc:${p.color || '#7C3AED'}">
    <div class="proj-top"><span class="proj-ic">${ic(p.icon || 'folder', '#FFFFFF', 'ic')}</span>
      <div class="proj-titles"><b>${esc(p.name)}</b>${projStatusChip(p.status)}</div></div>
    ${p.description ? `<p class="proj-desc">${esc(p.description)}</p>` : ''}
    <div class="proj-prog"><div class="bar"><i style="width:${st.pct}%;background:var(--pc)"></i></div><span>${st.pct}%</span></div>
    <div class="proj-meta">
      <span title="Aufgaben">${ic('list-checks', '#8A85A0', 'ic xs')} ${st.done}/${st.tasks.length}</span>
      <span title="Beiträge">${ic('send', '#8A85A0', 'ic xs')} ${st.posts.length}</span>
      <span title="Whiteboards">${ic('presentation', '#8A85A0', 'ic xs')} ${st.boards.length}</span>
      <span title="Videos">${ic('film', '#8A85A0', 'ic xs')} ${st.videos.length}</span>
      ${p.due_date ? `<span class="${overdue ? 'overdue' : ''}" title="Deadline">${ic('flag', overdue ? '#EF4444' : '#8A85A0', 'ic xs')} ${fmtDate(p.due_date)}</span>` : ''}
    </div>
    ${st.next ? `<div class="proj-next">Nächste Aufgabe: <b>${esc(st.next.title)}</b> · ${dueChip(st.next.due_date)}</div>` : ''}
  </div>`;
}

function projectSummaryHTML() {
  const act = S.projects.filter(p => p.status === 'aktiv');
  if (!act.length) return `<div class="empty">Keine aktiven Projekte. <button class="link" data-new-proj>Projekt anlegen</button></div>`;
  return `<div class="rows">${act.map(p => { const st = projectStats(p); return `<div class="row" data-proj="${p.id}">
    <span class="dot" style="background:${p.color || '#7C3AED'}"></span><span class="row-title">${esc(p.name)}</span>
    <span class="muted small">${st.done}/${st.tasks.length} Aufgaben</span><div class="bar sm" style="width:140px"><i style="width:${st.pct}%;background:${p.color || '#7C3AED'}"></i></div>
    <b class="pct">${st.pct}%</b>${p.due_date ? dueChip(p.due_date) : ''}</div>`; }).join('')}</div>`;
}

let projFilter = 'offen';
function renderProjects(main) {
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  if (qs.get('id') && byId('projects', qs.get('id'))) return renderProjectDetail(main, byId('projects', qs.get('id')));
  const list = S.projects.filter(p => projFilter === 'alle' || (projFilter === 'offen' ? p.status !== 'abgeschlossen' : p.status === 'abgeschlossen'))
    .sort((a, b) => (a.status === 'abgeschlossen') - (b.status === 'abgeschlossen') || (a.due_date || '9999').localeCompare(b.due_date || '9999'));
  main.innerHTML = pageHead('Projekte', 'Jedes Projekt bündelt Aufgaben, Beiträge, Whiteboards und Videos.',
    `<div class="seg">${[['offen', 'Offen'], ['abgeschlossen', 'Abgeschlossen'], ['alle', 'Alle']].map(([k, l]) => `<button data-pf="${k}" class="${projFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div>
     <button class="btn primary" data-new-proj>+ Projekt</button>`) +
    `<div class="proj-grid">${list.map(projectCardHTML).join('') || empty('Noch keine Projekte. Lege dein erstes Projekt an.')}</div>`;
  $$('[data-pf]', main).forEach(b => b.onclick = () => { projFilter = b.dataset.pf; renderProjects(main); });
  bindProjectActions(main);
  bindCommon(main);
}

function renderProjectDetail(main, p) {
  const st = projectStats(p); const obj = p.objective_id ? byId('objectives', p.objective_id) : null;
  const timeline = [...st.tasks.filter(t => t.status !== 'done' && t.due_date).map(t => ({ d: t.due_date, html: taskRowHTML(t) })),
    ...st.posts.filter(x => x.publish_date && x.status !== 'veroeffentlicht').map(x => ({ d: x.publish_date, html: postRowHTML(x) }))]
    .sort((a, b) => a.d.localeCompare(b.d)).slice(0, 8);
  main.innerHTML = `
    <div class="proj-head" style="--pc:${p.color || '#7C3AED'}">
      <a class="link small" href="#/projects">‹ Alle Projekte</a>
      <div class="proj-head-row">
        <span class="proj-ic lg">${ic(p.icon || 'folder', '#FFFFFF', 'ic')}</span>
        <div class="grow"><h1>${esc(p.name)}</h1>
          <div class="proj-sub">${projStatusChip(p.status)}${p.start_date || p.due_date ? `<span class="muted small">${p.start_date ? fmtDate(p.start_date) : '…'} – ${p.due_date ? fmtDate(p.due_date) : 'offen'}</span>` : ''}
          ${obj ? `<span class="chip kr-chip" data-obj="${obj.id}">${ic('target', '#7C3AED', 'ic xs')} ${esc(obj.title)} · ${objProgress(obj)}%</span>` : ''}</div></div>
        ${ringHTML(st.pct, 64)}
        <button class="btn" data-edit-proj="${p.id}">Bearbeiten</button>
      </div>
      ${p.description ? `<p class="muted">${esc(p.description)}</p>` : ''}
    </div>
    <div class="proj-sections">
      <section class="card span-2"><div class="sec-head"><h2>Aufgaben <span class="muted small">${st.done}/${st.tasks.length} erledigt</span></h2><button class="btn sm" data-add-task="todo">+ Aufgabe</button></div>
        ${kanbanHTML(st.tasks, TASK_STATUS, 'tasks')}</section>
      <section class="card"><div class="sec-head"><h2>Als Nächstes</h2></div>${timeline.length ? `<div class="rows">${timeline.map(x => x.html).join('')}</div>` : empty('Keine anstehenden Termine')}</section>
      <section class="card"><div class="sec-head"><h2>Beiträge</h2><button class="btn sm" data-add-post="idee">+ Beitrag</button></div>
        ${st.posts.length ? `<div class="rows">${st.posts.map(postRowHTML).join('')}</div>` : empty('Noch keine Beiträge in diesem Projekt')}</section>
      <section class="card"><div class="sec-head"><h2>Whiteboards</h2><span><button class="btn sm ghost" data-assign="boards">Zuordnen</button><button class="btn sm" data-new-board>+ Board</button></span></div>
        ${st.boards.length ? `<div class="rows">${st.boards.map(b => `<div class="row" data-open-board="${b.id}">${ic('presentation', '#7C3AED')}<span class="row-title">${esc(b.name)}</span><span class="muted small">öffnen →</span></div>`).join('')}</div>` : empty('Noch kein Board zugeordnet')}</section>
      <section class="card"><div class="sec-head"><h2>Videos</h2><span><button class="btn sm ghost" data-assign="videos">Zuordnen</button><button class="btn sm" data-new-video>+ Video</button></span></div>
        ${st.videos.length ? `<div class="rows">${st.videos.map(v => `<div class="row" data-open-video="${v.id}">${ic('film', '#7C3AED')}<span class="row-title">${esc(v.name)}</span><span class="muted small">${esc(v.aspect || '')} · öffnen →</span></div>`).join('')}</div>` : empty('Noch kein Video in diesem Projekt')}</section>
      ${p.notes || true ? `<section class="card span-2"><div class="sec-head"><h2>Notizen</h2></div><textarea class="proj-notes" placeholder="Ideen, Absprachen, Links …">${esc(p.notes || '')}</textarea></section>` : ''}
    </div>`;
  main.__project = p.id;
  const notes = $('.proj-notes', main); let nt;
  notes.oninput = () => { clearTimeout(nt); nt = setTimeout(() => DB.update('projects', p.id, { notes: notes.value }, true), 600); };
  bindProjectActions(main, p);
  bindCommon(main);
}

function bindProjectActions(main, p) {
  if (main.__projBound) { main.__projCurrent = p; return; }
  main.__projBound = true; main.__projCurrent = p;
  main.addEventListener('click', async e => {
    const b = e.target.closest('[data-edit-proj],[data-new-board],[data-open-board],[data-new-video],[data-open-video],[data-assign]'); if (!b) return;
    e.stopPropagation();
    const proj = main.__projCurrent; const d = b.dataset;
    if (d.editProj) return editProject(byId('projects', d.editProj));
    if (d.openBoard) { try { localStorage.setItem('vp-board', d.openBoard); } catch { /* egal */ } location.hash = '#/board'; return; }
    if (d.openVideo) { location.hash = '#/video?id=' + d.openVideo; return; }
    if (d.newBoard !== undefined) {
      const v = await openForm({ title: 'Neues Board im Projekt', values: { name: `${proj.name} – Board` }, fields: [{ key: 'name', label: 'Name', required: true }], submitLabel: 'Anlegen' });
      if (!v) return;
      const nb = await DB.create('boards', { name: v.name, project_id: proj.id, data: JSON.stringify({ items: [], connectors: [], view: { x: 80, y: 60, z: 1 } }) }, true);
      try { localStorage.setItem('vp-board', nb.id); } catch { /* egal */ } location.hash = '#/board'; return;
    }
    if (d.newVideo !== undefined) return VideoEditor.newProjectDialog({ project_id: proj.id, name: `${proj.name} – Video` });
    if (d.assign) {
      const table = d.assign; const items = S[table].filter(x => x.project_id !== proj.id);
      if (!items.length) return toast(table === 'boards' ? 'Alle Boards sind schon zugeordnet' : 'Keine weiteren Videos vorhanden');
      const v = await openForm({ title: table === 'boards' ? 'Board zuordnen' : 'Video zuordnen', submitLabel: 'Zuordnen',
        fields: [{ key: 'id', label: table === 'boards' ? 'Board' : 'Video', type: 'select', options: items.map(x => [x.id, x.name + (x.project_id ? ` (jetzt: ${projName(x.project_id)})` : '')]) }] });
      if (v) await DB.update(table, Number(v.id), { project_id: proj.id });
    }
  });
}
