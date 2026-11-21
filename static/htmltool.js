'use strict';
/* =========================================================================
   HTML-Visualisierungstool: eigene HTML/CSS/JS-Visualisierungen im Board.
   Läuft isoliert in einem sandboxed iframe (kein Zugriff auf die App-Daten).
   ========================================================================= */
window.HtmlTool = (() => {
  const BASE_CSS = `<style>html,body{margin:0;height:100%;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#1F1B2E;background:#fff}</style>`;
  const TEMPLATES = {
    bars: {
      label: 'Animiertes Balkendiagramm',
      html: `<!DOCTYPE html><html><head>${BASE_CSS}<style>
#c{display:flex;align-items:flex-end;gap:4%;height:calc(100% - 70px);padding:20px 24px 0}
.b{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
.bar{width:100%;border-radius:10px 10px 3px 3px;background:#7C3AED;height:0;transition:height 1s cubic-bezier(.2,.8,.2,1)}
.bar.last{background:#34D399}.v{font-weight:700;font-size:13px;color:#7C3AED;margin-bottom:4px}.l{font-size:12px;color:#8A85A0;margin-top:6px}
h3{margin:0;padding:16px 24px 0;font-size:17px}</style></head><body>
<h3>Follower-Wachstum</h3><div id="c"></div>
<script>
const data = [["Jan",120],["Feb",260],["Mär",410],["Apr",690],["Mai",980],["Jun",1350]];
const max = Math.max(...data.map(d=>d[1]));
const c = document.getElementById('c');
data.forEach(([l,v],i)=>{ c.insertAdjacentHTML('beforeend','<div class="b"><div class="v">'+v+'</div><div class="bar'+(i===data.length-1?' last':'')+'" data-h="'+(v/max*100)+'"></div><div class="l">'+l+'</div></div>'); });
requestAnimationFrame(()=>setTimeout(()=>document.querySelectorAll('.bar').forEach((b,i)=>{b.style.transitionDelay=(i*0.08)+'s';b.style.height=b.dataset.h+'%';}),50));
</script></body></html>`,
    },
    counter: {
      label: 'Hochzählende Kennzahlen',
      html: `<!DOCTYPE html><html><head>${BASE_CSS}<style>
body{display:flex;gap:16px;padding:20px;box-sizing:border-box;align-items:stretch}
.k{flex:1;border-radius:16px;padding:18px;display:flex;flex-direction:column;justify-content:center}
.k:nth-child(1){background:#EDE9FE}.k:nth-child(2){background:#D1FAE5}.k:nth-child(3){background:#FFEDD5}
.n{font-size:clamp(24px,6vw,48px);font-weight:800}.k:nth-child(1) .n{color:#7C3AED}.k:nth-child(2) .n{color:#059669}.k:nth-child(3) .n{color:#EA580C}
.t{font-size:13px;font-weight:600;color:#4B4563}</style></head><body>
<div class="k"><div class="t">Follower</div><div class="n" data-to="1250">0</div></div>
<div class="k"><div class="t">Reichweite</div><div class="n" data-to="48300">0</div></div>
<div class="k"><div class="t">Engagement %</div><div class="n" data-to="6.2" data-dec="1">0</div></div>
<script>
document.querySelectorAll('.n').forEach(el=>{const to=+el.dataset.to,dec=+(el.dataset.dec||0),t0=performance.now();
(function f(t){const p=Math.min(1,(t-t0)/1600),e=1-Math.pow(1-p,3);el.textContent=(to*e).toLocaleString('de-DE',{minimumFractionDigits:dec,maximumFractionDigits:dec});if(p<1)requestAnimationFrame(f);})(t0);});
</script></body></html>`,
    },
    donut: {
      label: 'Content-Mix (Donut)',
      html: `<!DOCTYPE html><html><head>${BASE_CSS}<style>
body{display:flex;align-items:center;justify-content:center;gap:28px;padding:16px;box-sizing:border-box}
svg{height:90%;max-height:320px}.lg div{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:14px}.lg i{width:12px;height:12px;border-radius:4px}
</style></head><body><svg viewBox="0 0 200 200" id="s"></svg><div class="lg" id="lg"></div>
<script>
const data=[["Wissen",40,"#7C3AED"],["Persönlich",25,"#34D399"],["Behind the Scenes",20,"#FB923C"],["Community",15,"#C4B5FD"]];
const total=data.reduce((a,d)=>a+d[1],0),r=70,C=2*Math.PI*r;let off=0;const s=document.getElementById('s');
data.forEach(([l,v,c])=>{const len=v/total*C;s.insertAdjacentHTML('beforeend','<circle cx="100" cy="100" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="34" stroke-dasharray="0 '+C+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 100 100)" style="transition:stroke-dasharray 1s ease"><title>'+l+'</title></circle>');off+=len;
document.getElementById('lg').insertAdjacentHTML('beforeend','<div><i style="background:'+c+'"></i>'+l+' <b>'+v+'%</b></div>');});
setTimeout(()=>{let i=0;s.querySelectorAll('circle').forEach(el=>{const len=data[i++][1]/total*C;el.setAttribute('stroke-dasharray',len+' '+C);});},80);
</script></body></html>`,
    },
    chartjs: {
      label: 'Liniendiagramm (Chart.js)',
      html: `<!DOCTYPE html><html><head>${BASE_CSS}<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>body{padding:14px;box-sizing:border-box}</style></head><body><canvas id="c"></canvas>
<script>
new Chart(document.getElementById('c'),{type:'line',data:{labels:['KW1','KW2','KW3','KW4','KW5','KW6'],
datasets:[{label:'Reichweite',data:[800,1200,1100,1900,2600,3400],borderColor:'#7C3AED',backgroundColor:'rgba(124,58,237,.12)',fill:true,tension:.35},
{label:'Interaktionen',data:[60,95,120,180,240,330],borderColor:'#34D399',tension:.35,yAxisID:'y1'}]},
options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true},y1:{position:'right',beginAtZero:true,grid:{display:false}}}}});
document.body.style.height='100%';document.getElementById('c').parentElement.style.height='100%';
</script></body></html>`,
    },
    heatmap: {
      label: 'Posting-Heatmap',
      html: `<!DOCTYPE html><html><head>${BASE_CSS}<style>
body{padding:16px;box-sizing:border-box}h3{margin:0 0 10px;font-size:16px}
.g{display:grid;grid-template-columns:40px repeat(8,1fr);gap:4px;height:calc(100% - 40px)}
.c{border-radius:5px}.h{font-size:11px;color:#8A85A0;display:flex;align-items:center;justify-content:center}</style></head><body>
<h3>Beste Posting-Zeiten (Interaktion)</h3><div class="g" id="g"></div>
<script>
const days=['Mo','Di','Mi','Do','Fr','Sa','So'],hours=['7','9','11','13','15','17','19','21'];const g=document.getElementById('g');
g.insertAdjacentHTML('beforeend','<div></div>'+hours.map(h=>'<div class="h">'+h+' Uhr</div>').join(''));
days.forEach((d,i)=>{g.insertAdjacentHTML('beforeend','<div class="h">'+d+'</div>');hours.forEach((h,j)=>{const v=Math.max(0.08,Math.min(1,(Math.sin(i*1.3+j*.9)+1)/2*(j>4?1:.7)));
g.insertAdjacentHTML('beforeend','<div class="c" title="'+d+' '+h+' Uhr: '+Math.round(v*100)+'%" style="background:rgba(124,58,237,'+v.toFixed(2)+')"></div>');});});
</script></body></html>`,
    },
    blank: { label: 'Leer', html: `<!DOCTYPE html><html><head>${BASE_CSS}</head><body>\n  <h1 style="color:#7C3AED;padding:20px">Hallo Whiteboard</h1>\n</body></html>` },
  };

  /** Öffnet den Editor. Ergebnis: {title, html} oder null */
  function openEditor(item = {}) {
    return new Promise(resolve => {
      const el = h(`<div class="modal-backdrop"><div class="modal html-modal">
        <h3>HTML-Visualisierung</h3>
        <div class="html-bar">
          <input class="input" data-k="title" placeholder="Titel" value="${esc(item.title || 'Visualisierung')}">
          <select class="input" data-k="tpl"><option value="">Vorlage laden …</option>${Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${esc(t.label)}</option>`).join('')}</select>
        </div>
        <div class="html-ai">
          <input class="input" data-k="prompt" placeholder="Mit KI erzeugen: z. B. „Animierter Funnel mit 4 Stufen und Prozentwerten“">
          <button class="btn" data-a="ai">${ic('sparkles', '#7C3AED', 'ic sm')} Erzeugen</button>
        </div>
        <div class="html-split">
          <textarea data-k="code" spellcheck="false"></textarea>
          <iframe sandbox="allow-scripts" title="Vorschau"></iframe>
        </div>
        <div class="modal-actions"><span class="muted small">Läuft isoliert (Sandbox). Externe Bibliotheken z. B. über cdn.jsdelivr.net.</span><span class="grow"></span>
          <button class="btn ghost" data-a="cancel">Abbrechen</button><button class="btn primary" data-a="save">Ins Board übernehmen</button></div>
      </div></div>`);
      const code = $('[data-k=code]', el), frame = $('iframe', el);
      code.value = item.html || TEMPLATES.bars.html;
      let t; const preview = () => { clearTimeout(t); t = setTimeout(() => { frame.srcdoc = code.value; }, 350); };
      code.addEventListener('input', preview);
      code.addEventListener('keydown', e => { // Tab einrücken
        if (e.key === 'Tab') { e.preventDefault(); const s = code.selectionStart; code.setRangeText('  ', s, code.selectionEnd, 'end'); preview(); }
        e.stopPropagation();
      });
      $('[data-k=tpl]', el).onchange = e => { const tp = TEMPLATES[e.target.value]; if (tp) { code.value = tp.html; frame.srcdoc = tp.html; } e.target.value = ''; };
      const close = v => { el.remove(); resolve(v); };
      $('[data-a=cancel]', el).onclick = () => close(null);
      $('[data-a=save]', el).onclick = () => close({ title: $('[data-k=title]', el).value || 'Visualisierung', html: code.value });
      $('[data-a=ai]', el).onclick = async () => {
        const prompt = $('[data-k=prompt]', el).value.trim(); if (!prompt) return toast('Beschreibe kurz, was visualisiert werden soll');
        const btn = $('[data-a=ai]', el); btn.disabled = true; btn.textContent = 'KI arbeitet …';
        try {
          const r = await AI.generate('html', `Erstelle diese Visualisierung: ${prompt}\n\nAktueller Code als Ausgangspunkt (darf komplett ersetzt werden):\n${code.value.slice(0, 6000)}`);
          if (r) { code.value = r.html; frame.srcdoc = r.html; }
        } finally { btn.disabled = false; btn.innerHTML = `${ic('sparkles', '#7C3AED', 'ic sm')} Erzeugen`; }
      };
      $('#modal-root').appendChild(el); frame.srcdoc = code.value;
    });
  }
  return { openEditor, TEMPLATES };
})();
