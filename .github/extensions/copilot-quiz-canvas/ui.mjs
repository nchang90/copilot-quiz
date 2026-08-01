export function renderHtml() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Quiz Producer Contract</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:16px;background:#0d0d0d;color:#ddd;font:13px/1.4 system-ui,sans-serif}
h1{margin:0 0 12px;color:#ffd700;font-size:16px}.bar,.card{border:1px solid #262626;border-radius:8px;background:#141414;padding:12px}
.bar{margin-bottom:12px;color:#888}.value{color:#ffd700;font-weight:700}.controls{display:flex;gap:8px;margin-bottom:12px}
button{border:1px solid #444;border-radius:5px;background:#222;color:#ddd;padding:6px 10px;cursor:pointer}button:hover{background:#303030}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.title{margin-bottom:8px;color:#777;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #222}.row:last-child{border-bottom:0}.pass{color:#4ade80}.fail{color:#f87171}
pre{max-height:180px;overflow:auto;margin:0;color:#aaa;font-size:10px;white-space:pre-wrap}
@media(max-width:640px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>Quiz Producer Contract</h1>
<div class="bar">Status: <span id="status" class="value">ready</span></div>
<div class="controls"><button onclick="loadModel()">Validate contract</button><button onclick="refreshEvents()">Refresh service events</button></div>
<div class="grid">
<section class="card"><div class="title">Producer contract</div><div id="contract"></div></section>
<section class="card"><div class="title">Validation</div><div id="checks">Not run yet</div></section>
<section class="card"><div class="title">Recent service events</div><pre id="events">No events loaded</pre></section>
</div>
<script>
async function loadModel(){await fetch('/validate').then(r=>r.json());const m=await fetch('/model').then(r=>r.json());render(m)}
async function refreshEvents(){await fetch('/refresh').then(r=>r.json());await loadModel()}
function render(m){
 document.getElementById('status').textContent=m.status;
 document.getElementById('contract').innerHTML='<div class="row"><span>POST endpoint</span><code>'+m.contract.endpoint+'</code></div>'+
 '<div class="row"><span>Allowed types</span><code>'+m.contract.eventTypes.join(', ')+'</code></div>';
 document.getElementById('checks').innerHTML=m.checks.length?m.checks.map(c=>'<div class="row"><span>'+c.name+'</span><span class="'+(c.pass?'pass':'fail')+'">'+(c.pass?'PASS':'FAIL')+'</span></div>').join(''):'Not run yet';
 document.getElementById('events').textContent=m.events.length?JSON.stringify(m.events,null,2):'No events loaded';
}
loadModel();
</script>
</body>
</html>`;
}
