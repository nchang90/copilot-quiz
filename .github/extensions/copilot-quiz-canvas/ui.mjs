export function renderHtml() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Quiz Producer Contract</title>
<style>
:root {
 --bg: #0b1220;
 --bg-strong: #101a2a;
 --bg-soft: #111d2f;
 --panel: rgba(16, 23, 35, 0.84);
 --panel-strong: rgba(18, 27, 40, 0.96);
 --card: rgba(18, 26, 40, 0.82);
 --card-alt: rgba(11, 18, 32, 0.96);
 --border: rgba(128, 149, 187, 0.18);
 --border-strong: rgba(112, 137, 190, 0.32);
 --text: #edf4ff;
 --muted: #a9bad9;
 --soft: #d2defd;
 --blue: #7aa2ff;
 --blue-soft: rgba(122, 162, 255, 0.12);
 --indigo: #8d92ff;
 --peach: #ffb48a;
 --gold: #f6d36d;
 --green: #6fe8b0;
 --soft-green: rgba(111, 232, 176, 0.12);
 --red: #ff8d8d;
 --soft-red: rgba(255, 141, 141, 0.12);
 --shadow: 0 22px 52px rgba(2, 6, 23, 0.38), inset 0 1px 0 rgba(255,255,255,0.06);
}
*{box-sizing:border-box}html,body{margin:0;min-height:100%}body{
 font: 14px/1.5 Inter, "Segoe UI", sans-serif;
 background:
   radial-gradient(circle at 18% 12%, rgba(122,162,255,0.2), transparent 26%),
   radial-gradient(circle at 82% 82%, rgba(246,211,109,0.1), transparent 18%),
   linear-gradient(180deg, var(--bg) 0%, var(--bg-strong) 100%);
 color: var(--text);
 padding: 20px;
}
.app{max-width:1200px;margin:0 auto}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 0 20px}
.brand{display:flex;align-items:center;gap:12px}
.brand-mark{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg, #7aa2ff 0%, #9ae2ff 40%, #f6d36d 100%);box-shadow:0 16px 28px rgba(122,162,255,0.35), inset 0 1px 0 rgba(255,255,255,0.5)}
.brand h1{margin:0;font-size:clamp(24px,2.6vw,40px);letter-spacing:-.06em;color:var(--text)}
.status-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;border:1px solid rgba(111,232,176,0.16);background:rgba(17,28,39,0.86);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--green);box-shadow:inset 0 1px 0 rgba(255,255,255,0.06)}
.status-pill::before{content:"";display:block;width:8px;height:8px;border-radius:50%;background:currentColor;box-shadow:0 0 0 5px rgba(111,232,176,0.08)}
.status-pill.valid{color:var(--green);background:var(--soft-green);border-color:rgba(111,232,176,0.22)}
.status-pill.ready{color:var(--gold);background:rgba(246,211,109,0.1);border-color:rgba(246,211,109,0.2)}
.status-pill.refreshed{color:var(--blue);background:var(--blue-soft);border-color:rgba(122,162,255,0.24)}
.status-pill.invalid{color:var(--red);background:var(--soft-red);border-color:rgba(255,141,141,0.22)}
.hero{display:grid;grid-template-columns:1.5fr .9fr;gap:18px;align-items:stretch;margin-bottom:18px}
.card{background:linear-gradient(180deg, rgba(18,27,40,0.9), rgba(13,19,30,0.94));border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow);overflow:hidden;backdrop-filter: blur(10px)}
.hero-copy{padding:28px 26px 22px;position:relative}
.hero-copy::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg, rgba(122,162,255,0.85), rgba(246,211,109,0.8), rgba(122,162,255,0.3));}
.kicker{color:var(--blue);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}
.hero-copy h2{margin:0 0 12px;font-size:clamp(29px,3vw,48px);letter-spacing:-.07em;line-height:1.02}
.hero-copy p{margin:0;color:var(--muted);font-size:15px;max-width:62ch}
.hero-panel{padding:20px}
.metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}
.metric{padding:12px 12px 10px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(180deg, rgba(19,30,46,0.92), rgba(13,20,31,0.88));}
.metric-label{display:block;color:var(--soft);font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
.metric-value{font-size:13px;font-weight:700;color:var(--text);word-break:break-word}
.metric-value code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(122,162,255,0.09);padding:5px 7px;border-radius:8px;border:1px solid rgba(122,162,255,0.16)}
.content{display:grid;grid-template-columns:1.12fr .88fr;gap:18px}
.panel{padding:18px}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.section-head h3{margin:0;font-size:11px;letter-spacing:.14em;color:var(--soft);text-transform:uppercase}
.inline-badge{padding:5px 10px;border-radius:999px;border:1px solid rgba(122,162,255,0.2);background:rgba(122,162,255,0.08);font-size:11px;color:var(--soft);font-weight:700}
.list{display:grid;gap:10px}
.rule{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid var(--border);border-radius:16px;background:rgba(12,18,30,0.8)}
.rule-index{min-width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg, rgba(122,162,255,0.18), rgba(122,162,255,0.06));border:1px solid rgba(122,162,255,0.2);color:var(--blue);font-size:11px;font-weight:800}
.rule strong{display:block;font-size:15px;margin-bottom:2px;color:var(--text)}
.rule span{color:var(--muted);font-size:13px}
.validation-list{display:grid;gap:10px}
.check{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:14px;background:rgba(12,18,30,0.8)}
.check-label{font-size:13px;color:var(--muted)}
.check-status{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 8px;border-radius:999px;border:1px solid transparent}
.check-status.pass{color:var(--green);background:var(--soft-green);border-color:rgba(111,232,176,0.2)}
.check-status.fail{color:var(--red);background:var(--soft-red);border-color:rgba(255,141,141,0.2)}
.callout{margin-top:16px;padding:14px;border:1px solid rgba(122,162,255,0.18);border-radius:16px;background:linear-gradient(180deg, rgba(122,162,255,0.08), rgba(255,255,255,0.02));color:var(--muted)}
.callout strong{display:block;color:var(--text);margin-bottom:4px}
.demo{display:grid;gap:10px;margin-top:14px}
.demo-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:14px;border:1px solid var(--border);background:rgba(12,18,30,0.76)}
.demo-item small{display:block;color:var(--soft);letter-spacing:.12em;text-transform:uppercase}
.demo-item strong{display:block;font-size:15px;margin-top:2px;color:var(--text)}
.demo-item .token{font-size:12px;padding:5px 8px;border-radius:999px;background:rgba(122,162,255,0.08);border:1px solid rgba(122,162,255,0.14);color:var(--blue)}
.event-list{display:grid;gap:10px;max-height:300px;overflow:auto;padding-right:4px}
.event-item{padding:12px;border:1px solid var(--border);border-radius:16px;background:rgba(12,18,30,0.8)}
.event-item header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px}
.event-item .name{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;border:1px solid rgba(246,211,109,0.22);background:rgba(246,211,109,0.08);color:var(--gold);font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
.event-item time{color:var(--soft);font-size:11px}
.event-item pre{margin:0;white-space:pre-wrap;word-break:break-word;color:#dfe8ff;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(2,6,23,0.36);border-radius:10px;padding:8px;border:1px solid rgba(128,149,187,0.12)}
.empty{color:var(--muted);padding:12px;border:1px dashed var(--border);border-radius:12px;background:rgba(12,18,30,0.5)}
button{appearance:none;border:1px solid rgba(122,162,255,0.2);background:linear-gradient(180deg, rgba(122,162,255,0.18), rgba(122,162,255,0.07));color:var(--text);padding:11px 16px;border-radius:12px;font-weight:700;cursor:pointer;transition:.2s ease;box-shadow:0 12px 24px rgba(122,162,255,0.1)}
button:hover{transform:translateY(-1px);box-shadow:0 16px 28px rgba(122,162,255,0.14)}
.controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
@media(max-width:900px){ .hero,.content{grid-template-columns:1fr}.metric-grid{grid-template-columns:1fr}.topbar{flex-direction:column;align-items:flex-start}}
</style>
</head>
<body>
<div class="app">
 <header class="topbar">
   <div class="brand">
     <div class="brand-mark"></div>
     <div>
       <h1>Quiz Producer Contract</h1>
     </div>
   </div>
   <div id="statusPill" class="status-pill ready">Ready</div>
 </header>

 <section class="hero">
   <div class="card hero-copy">
     <div class="kicker">Copilot demo</div>
     <h2>Live validation for the quiz event producer</h2>
     <p>Keep the user experience frictionless while emitting only the supported event contract to the local service.</p>
     <div class="controls">
       <button onclick="loadModel()">Validate contract</button>
       <button onclick="refreshEvents()">Refresh service</button>
     </div>
   </div>

   <div class="card hero-panel">
     <div class="section-head"><h3>System snapshot</h3><span class="inline-badge" id="updatedAt">—</span></div>
     <div class="metric-grid">
       <div class="metric">
         <span class="metric-label">Endpoint</span>
         <div class="metric-value"><code id="endpointValue">—</code></div>
       </div>
       <div class="metric">
         <span class="metric-label">Types</span>
         <div class="metric-value" id="typesValue">—</div>
       </div>
       <div class="metric">
         <span class="metric-label">Mode</span>
         <div class="metric-value" id="modeValue">Fire-and-forget</div>
       </div>
     </div>
     <div class="demo">
       <div class="demo-item">
         <div>
           <small>Interactive</small>
           <strong>Live refinement</strong>
         </div>
         <span class="token">human feedback</span>
       </div>
       <div class="demo-item">
         <div>
           <small>Plan</small>
           <strong>Contract first</strong>
         </div>
         <span class="token">safe sequence</span>
       </div>
       <div class="demo-item">
         <div>
           <small>Autopilot</small>
           <strong>Validate end-to-end</strong>
         </div>
         <span class="token">service check</span>
       </div>
     </div>
   </div>
 </section>

 <section class="content">
   <div class="card panel">
     <div class="section-head">
       <h3>Contract rules</h3>
       <span class="inline-badge">2 event types</span>
     </div>
     <div id="contractRules" class="list"></div>
   </div>

   <div class="card panel">
     <div class="section-head">
       <h3>Validation</h3>
       <span class="inline-badge" id="validationSummary">Pending</span>
     </div>
     <div id="checks" class="validation-list"></div>
     <div class="callout">
       <strong>Why this matters</strong>
       The front-end must stay responsive while still sending the right event shape to the local service. Failures are swallowed so gameplay never blocks.
     </div>
   </div>
 </section>

 <section class="card panel" style="margin-top:18px;">
   <div class="section-head">
     <h3>Recent service events</h3>
     <span class="inline-badge">Live stream</span>
   </div>
   <div id="events" class="event-list"></div>
 </section>
</div>

<script>
async function loadModel(){
 await fetch('/validate').then(r => r.json());
 const m = await fetch('/model').then(r => r.json());
 render(m);
}

async function refreshEvents(){
 const result = await fetch('/refresh').then(r => r.json());
 const model = await fetch('/model').then(r => r.json());
 render(model);
}

function render(m) {
 const status = (m.status || 'ready').toLowerCase();
 const pill = document.getElementById('statusPill');
 pill.textContent = status === 'valid' ? 'Validated' : status === 'refreshed' ? 'Live' : status === 'invalid' ? 'Invalid' : 'Ready';
 pill.className = 'status-pill ' + status;

 const endpoint = m.contract?.endpoint || 'http://localhost:3001/event';
 const types = (m.contract?.eventTypes || []).join(' • ');

 document.getElementById('endpointValue').textContent = endpoint;
 document.getElementById('typesValue').textContent = types;
 document.getElementById('modeValue').textContent = 'Fire-and-forget';
 document.getElementById('updatedAt').textContent = m.refreshedAt ? new Date(m.refreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Fresh';

 const rules = [
   { title: 'scoreUpdated', body: 'Persistent score changes, deltas, and level context.' },
   { title: 'achievementCandidate', body: 'Milestone and progression events without blocking the quiz loop.' },
   { title: 'Fire-and-forget', body: 'Network errors are swallowed so interactivity never stalls.' }
 ];

 document.getElementById('contractRules').innerHTML = rules.map((rule, index) => `
   <div class="rule">
     <div class="rule-index">${index + 1}</div>
     <div>
       <strong>${rule.title}</strong>
       <span>${rule.body}</span>
     </div>
   </div>
 `).join('');

 const checks = Array.isArray(m.checks) && m.checks.length ? m.checks : [];
 const allPass = checks.length ? checks.every(c => c.pass) : false;
 document.getElementById('validationSummary').textContent = checks.length ? (allPass ? 'PASS' : 'Review') : 'Pending';

 const checksEl = document.getElementById('checks');
 checksEl.replaceChildren();
 if (checks.length) {
   checks.forEach((check) => {
     const item = document.createElement('div');
     item.className = 'check';

     const label = document.createElement('span');
     label.className = 'check-label';
     label.textContent = check.name || 'Unnamed check';

     const statusEl = document.createElement('span');
     statusEl.className = `check-status ${check.pass ? 'pass' : 'fail'}`;
     statusEl.textContent = check.pass ? 'PASS' : 'FAIL';

     item.append(label, statusEl);
     checksEl.appendChild(item);
   });
 } else {
   const empty = document.createElement('div');
   empty.className = 'empty';
   empty.textContent = 'No checks have run yet.';
   checksEl.appendChild(empty);
 }

 const events = Array.isArray(m.events) && m.events.length ? m.events : [];
 const eventsEl = document.getElementById('events');
 eventsEl.replaceChildren();
 if (events.length) {
   events.forEach((event) => {
     const item = document.createElement('article');
     item.className = 'event-item';

     const header = document.createElement('header');

     const name = document.createElement('span');
     name.className = 'name';
     name.textContent = event.type || 'event';

     const time = document.createElement('time');
     time.textContent = event.timestamp
       ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
       : 'now';

     header.append(name, time);

     const payload = document.createElement('pre');
     payload.textContent = JSON.stringify(event.payload || event, null, 2);

     item.append(header, payload);
     eventsEl.appendChild(item);
   });
 } else {
   const empty = document.createElement('div');
   empty.className = 'empty';
   empty.textContent = 'No events received yet. Refresh the service stream to inspect the latest payloads.';
   eventsEl.appendChild(empty);
 }
}

loadModel();
</script>
</body>
</html>`;
}
