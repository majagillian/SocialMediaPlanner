'use strict';
/* =========================================================================
   KI-Unterstützung (Claude API über den lokalen Server) + Offline-OKR-Assistent
   ========================================================================= */
window.AI = (() => {
  let status = null;

  async function getStatus(force) {
    if (!status || force) status = await api('GET', '/api/ai/status').catch(() => ({ configured: false }));
    return status;
  }

  function openSettings() {
    return new Promise(async resolve => {
      const st = await getStatus(true);
      const v = await openForm({
        title: 'KI-Einstellungen',
        extra: `<p class="muted small" style="margin:-6px 0 14px">Die KI-Funktionen nutzen die Claude API von Anthropic. Einen API-Schlüssel erhältst du unter
          <b>console.anthropic.com</b> (Abrechnung nach Nutzung, OKR-Vorschläge kosten wenige Cent). Der Schlüssel wird nur lokal in <code>config.json</code> gespeichert.
          Status: <b style="color:${st.configured ? 'var(--mint-d)' : 'var(--orange-d)'}">${st.configured ? 'verbunden' : 'nicht eingerichtet'}</b></p>`,
        values: { model: st.model },
        fields: [
          { key: 'api_key', label: st.configured ? 'Neuer API-Schlüssel (leer lassen = unverändert)' : 'API-Schlüssel', type: 'password' },
          { key: 'model', label: 'Modell', list: ['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-haiku-5-5'] },
        ],
      });
      if (!v) return resolve(false);
      const body = { model: v.model };
      if (v.api_key) body.api_key = v.api_key;
      status = await api('POST', '/api/ai/config', body);
      toast(status.configured ? 'KI ist eingerichtet' : 'Kein Schlüssel hinterlegt');
      resolve(status.configured);
    });
  }

  /** Ruft die KI auf. Fragt nach dem Schlüssel, falls keiner hinterlegt ist. */
  async function generate(mode, prompt) {
    const st = await getStatus();
    if (!st.configured) { const ok = await openSettings(); if (!ok) return null; }
    try { return await api('POST', '/api/ai/generate', { mode, prompt }); }
    catch (e) { return null; } // api() zeigt die Fehlermeldung als Toast
  }

  // ---------- Regelbasierter OKR-Check (funktioniert immer, ohne KI) --------
  const ACTIVITY = /\b(posten|erstellen|machen|schreiben|drehen|produzieren|veröffentlichen|planen|anlegen|recherchieren)\b/i;
  function checkOKR(obj, krs) {
    const out = [];
    const ok = (good, text) => out.push({ good, text });
    const words = (obj.title || '').trim().split(/\s+/).filter(Boolean).length;
    ok(!/\d/.test(obj.title || ''), 'Objective ist qualitativ (ohne Zahlen) – Zahlen gehören in die Key Results.');
    ok(words > 0 && words <= 12, `Objective ist kurz und einprägsam (${words} Wörter, ideal ≤ 10).`);
    ok(krs.length >= 2 && krs.length <= 5, `2–5 Key Results pro Objective (aktuell ${krs.length}).`);
    krs.forEach(k => {
      const t = k.title || 'Key Result';
      if (Number(k.target_value) === Number(k.start_value)) ok(false, `„${t}“: Start- und Zielwert sind gleich.`);
      if (!k.unit) ok(false, `„${t}“: Eine Einheit (z. B. Follower, %, Posts) macht es messbar.`);
      if (ACTIVITY.test(t)) ok(false, `„${t}“ klingt nach einer Aufgabe. Besser ein Ergebnis messen (z. B. Reichweite statt „Posts erstellen“).`);
    });
    if (krs.length && krs.every(k => !ACTIVITY.test(k.title || '') && k.unit && k.target_value !== k.start_value)) ok(true, 'Alle Key Results sind messbare Ergebnisse.');
    return out;
  }
  const checkHTML = list => `<div class="okr-check">${list.map(c => `<div class="${c.good ? 'good' : 'bad'}">${c.good ? '✓' : '!'} ${esc(c.text)}</div>`).join('')}</div>`;

  // ---------- Bausteine für den Offline-Assistenten -------------------------
  const OBJ_TEMPLATES = [
    'Eine engagierte Community rund um mein Thema aufbauen',
    'Als vertrauenswürdige Stimme in meiner Nische wahrgenommen werden',
    'Mit regelmäßigem, hochwertigem Content sichtbar werden',
    'Meinen Account als Grundlage für ein eigenes Angebot etablieren',
    'Einen nachhaltigen Content-Workflow etablieren, der mir Spaß macht',
  ];
  const KR_TEMPLATES = [
    ['Follower gewinnen', 0, 1000, 'Follower', 10],
    ['Durchschnittliche Engagement-Rate erreichen', 0, 5, '%', 0.5],
    ['Monatliche Reichweite steigern', 0, 50000, 'Konten', 1000],
    ['Gespeicherte Beiträge pro Post erreichen', 0, 30, 'Saves', 1],
    ['Profilaufrufe pro Monat', 0, 3000, 'Aufrufe', 100],
    ['Direktnachrichten von Interessierten', 0, 20, 'DMs', 1],
    ['Newsletter-Anmeldungen über den Link in Bio', 0, 100, 'Anmeldungen', 5],
    ['Beiträge im geplanten Rhythmus veröffentlichen', 0, 36, 'Posts', 1],
  ];

  // ---------- Assistent-Dialog ----------------------------------------------
  /** objective: vorhandenes Ziel zum Prüfen (optional) */
  async function openOkrAssistant(objective) {
    const st = await getStatus();
    const review = !!objective;
    const krs = review ? krsOf(objective) : [];
    const el = h(`<div class="modal-backdrop"><div class="modal ai-modal">
      <h3>${ic('sparkles', '#7C3AED', 'ic')} ${review ? 'OKR prüfen & verbessern' : 'OKR-Assistent'}</h3>
      ${review ? `<div class="ai-current"><b>${esc(objective.title)}</b>${krs.map(k => `<div class="small">• ${esc(k.title)}: ${fmtNum(k.start_value)} → ${fmtNum(k.target_value)} ${esc(k.unit || '')}</div>`).join('')}</div>
        <h4 class="sub">Schnell-Check</h4>${checkHTML(checkOKR(objective, krs))}` : `
        <div class="fields">
          <label class="field"><span>Was möchtest du erreichen? (in eigenen Worten, gern unperfekt)</span><textarea data-k="idea" rows="3" placeholder="z. B. Ich will mit meinem Fitness-Account bekannter werden und irgendwann Coachings verkaufen"></textarea></label>
          <label class="field half"><span>Thema / Nische</span><input data-k="niche" placeholder="z. B. Fitness für Berufstätige"></label>
          <label class="field half"><span>Zeitraum</span><select data-k="period"><option>1 Monat</option><option selected>3 Monate</option><option>6 Monate</option><option>12 Monate</option></select></label>
          <label class="field half"><span>Aktueller Stand</span><input data-k="now" placeholder="z. B. 80 Follower, 1 Post/Woche"></label>
          <label class="field half"><span>Plattform(en)</span><input data-k="platforms" value="Instagram"></label>
        </div>`}
      <div class="ai-actions">
        <button class="btn primary" data-a="go">${ic('sparkles', '#FFFFFF', 'ic sm')} ${review ? 'Mit KI verbessern' : 'Vorschläge mit KI erstellen'}</button>
        <button class="btn ghost" data-a="settings">KI-Einstellungen</button>
        <span class="muted small">${st.configured ? 'KI verbunden' : 'KI noch nicht eingerichtet – der Offline-Baukasten funktioniert trotzdem.'}</span>
      </div>
      <div class="ai-result"></div>
      ${review ? '' : `<details class="offline"><summary>Offline-Baukasten (ohne KI)</summary>
        <div class="fields" style="margin-top:12px">
          <label class="field"><span>Objective-Vorlage</span><select data-k="otpl">${OBJ_TEMPLATES.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>
        </div>
        <div class="kr-pick">${KR_TEMPLATES.map((k, i) => `<label class="kr-opt"><input type="checkbox" data-kr="${i}" ${i < 3 ? 'checked' : ''}>
          <span>${esc(k[0])}</span><input type="number" step="any" value="${k[2]}" data-target="${i}" class="input sm"><span class="muted small">${esc(k[3])}</span></label>`).join('')}</div>
        <button class="btn" data-a="offline">Als Ziel anlegen</button></details>`}
      <div class="modal-actions"><span class="grow"></span><button class="btn ghost" data-a="close">Schließen</button></div>
    </div></div>`);
    const close = () => el.remove();
    el.addEventListener('mousedown', e => { if (e.target === el) close(); });
    $('[data-a=close]', el).onclick = close;
    $('[data-a=settings]', el).onclick = async () => { await openSettings(); };
    const val = k => $(`[data-k=${k}]`, el)?.value?.trim() || '';

    $('[data-a=go]', el).onclick = async () => {
      let prompt;
      if (review) {
        prompt = `Prüfe und verbessere dieses OKR. Gib in "feedback" eine ehrliche Einschätzung und liefere genau ein verbessertes Objective mit 2–4 Key Results.\n` +
          `Objective: ${objective.title}\nBeschreibung: ${objective.description || '-'}\nZeitraum: ${objective.period || '-'}\n` +
          `Key Results:\n${krs.map(k => `- ${k.title}: Start ${k.start_value}, Ziel ${k.target_value} ${k.unit || ''}, aktuell ${k.current_value}`).join('\n') || '- (keine)'}`;
      } else {
        if (!val('idea')) return toast('Beschreibe kurz, was du erreichen möchtest');
        prompt = `Formuliere 2 alternative Objectives mit je 3 Key Results.\nIdee: ${val('idea')}\nNische: ${val('niche') || '-'}\n` +
          `Zeitraum: ${val('period')}\nAktueller Stand: ${val('now') || '-'}\nPlattformen: ${val('platforms') || '-'}\n` +
          `Bestehende Ziele (nicht doppeln): ${S.objectives.map(o => o.title).join('; ') || '-'}`;
      }
      const res = $('.ai-result', el);
      res.innerHTML = `<div class="ai-loading"><span class="spinner"></span> Die KI formuliert Vorschläge …</div>`;
      const r = await generate('okr', prompt);
      if (!r) { res.innerHTML = ''; return; }
      renderSuggestions(res, r, review ? objective : null, val('period'));
    };

    $('[data-a=offline]', el)?.addEventListener('click', async () => {
      const obj = await DB.create('objectives', { title: val('otpl'), period: val('period') || '3 Monate', color: '#7C3AED' }, true);
      for (const cb of $$('[data-kr]:checked', el)) {
        const k = KR_TEMPLATES[cb.dataset.kr]; const target = Number($(`[data-target="${cb.dataset.kr}"]`, el).value) || k[2];
        await DB.create('key_results', { objective_id: obj.id, title: k[0], start_value: k[1], target_value: target, current_value: k[1], unit: k[3], step: k[4] }, true);
      }
      emit(); close(); toast('Ziel angelegt – passe die Formulierung gern noch an');
    });
    $('#modal-root').appendChild(el);
  }

  function renderSuggestions(res, r, objective, period) {
    const objs = Array.isArray(r.objectives) ? r.objectives : [];
    res.innerHTML = `${r.feedback ? `<div class="ai-feedback">${esc(r.feedback)}</div>` : ''}
      ${objs.map((o, i) => `<div class="ai-sugg" data-i="${i}">
        <label class="ai-obj"><input type="checkbox" class="pick-obj" ${i === 0 ? 'checked' : ''}><input class="input obj-title" value="${esc(o.title)}"></label>
        ${o.description ? `<div class="muted small" style="margin:4px 0 6px 28px">${esc(o.description)}</div>` : ''}
        ${(o.key_results || []).map((k, j) => `<div class="ai-kr" data-j="${j}"><input type="checkbox" class="pick-kr" checked>
          <input class="input kr-title" value="${esc(k.title)}"><input class="input sm kr-start" type="number" step="any" value="${Number(k.start_value) || 0}" title="Start">
          <span>→</span><input class="input sm kr-target" type="number" step="any" value="${Number(k.target_value) || 0}" title="Ziel"><input class="input sm kr-unit" value="${esc(k.unit || '')}" title="Einheit"></div>`).join('')}
        ${checkHTML(checkOKR(o, o.key_results || []).filter(c => !c.good))}
      </div>`).join('')}
      ${(r.tips || []).length ? `<div class="ai-tips"><b>Tipps</b>${r.tips.map(t => `<div>• ${esc(t)}</div>`).join('')}</div>` : ''}
      <div class="ai-actions"><button class="btn primary" data-a="apply">${objective ? 'Übernehmen (Titel ersetzen, KRs ergänzen)' : 'Ausgewählte als Ziele anlegen'}</button>
      ${objective ? '<button class="btn" data-a="apply-new">Als neues Ziel anlegen</button>' : ''}</div>`;
    const apply = async asNew => {
      let count = 0;
      for (const box of $$('.ai-sugg', res)) {
        if (!$('.pick-obj', box).checked) continue;
        const o = objs[box.dataset.i]; const title = $('.obj-title', box).value.trim() || o.title;
        let objId;
        if (objective && !asNew) { await DB.update('objectives', objective.id, { title, description: o.description || objective.description }, true); objId = objective.id; }
        else objId = (await DB.create('objectives', { title, description: o.description || '', period: o.period || period || '', color: '#7C3AED' }, true)).id;
        for (const row of $$('.ai-kr', box)) {
          if (!$('.pick-kr', row).checked) continue;
          const k = o.key_results[row.dataset.j]; const start = Number($('.kr-start', row).value) || 0;
          await DB.create('key_results', { objective_id: objId, title: $('.kr-title', row).value.trim() || k.title, start_value: start,
            target_value: Number($('.kr-target', row).value) || 0, current_value: start, unit: $('.kr-unit', row).value.trim(), step: Number(k.step) || 1 }, true);
        }
        count++;
      }
      if (!count) return toast('Bitte mindestens einen Vorschlag auswählen');
      emit(); res.closest('.modal-backdrop').remove(); toast('Übernommen');
    };
    $('[data-a=apply]', res).onclick = () => apply(false);
    $('[data-a=apply-new]', res)?.addEventListener('click', () => apply(true));
  }

  return { generate, openSettings, openOkrAssistant, getStatus, checkOKR };
})();
