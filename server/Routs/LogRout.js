/* ===== LogRout.js ===== */

const express = require('express');
const router = express.Router();
const { getRecent } = require('../utils/logger');

router.get('/recent', (req, res) => {
    const limit  = Math.min(parseInt(req.query.limit||'200',10), 1000);
    const level  = req.query.level;      // INFO / WARN / ERROR / DEBUG
    const cat    = req.query.cat;        // SENSOR / AUTH / DB / ESP / HTTP ...
    res.json({ items: getRecent(limit, { level, cat }) });
});

// דף קטן שמרענן לבד (client pull) — פשוט וצנוע
router.get('/', (req, res) => {
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end(`<!doctype html>
<html><head><meta charset="utf-8"/>
<title>HydroBuddy Logs</title>
<style>
body{font:13px ui-monospace,monospace;background:#0b0f14;color:#cde; margin:0;padding:0}
#top{position:sticky;top:0;background:#0b0f14;border-bottom:1px solid #223;padding:8px}
#logs{white-space:pre-wrap;padding:8px}
select,input{background:#0e131a;color:#cde;border:1px solid #334;padding:4px;border-radius:6px;margin-right:6px}
button{background:#1a2230;color:#cde;border:1px solid #375;padding:6px 10px;border-radius:6px;cursor:pointer}
button:hover{filter:brightness(1.1)}
</style>
</head><body>
<div id="top">
  <label>Level:
    <select id="level"><option value="">ALL</option><option>ERROR</option><option>WARN</option><option>INFO</option><option>DEBUG</option></select>
  </label>
  <label>Cat:
    <input id="cat" placeholder="SENSOR / AUTH / ESP / DB / HTTP"/>
  </label>
  <label>Limit:
    <input id="limit" type="number" value="200" min="20" max="1000" style="width:80px"/>
  </label>
  <button id="refresh">Refresh</button>
  <span id="status" style="opacity:.7;margin-left:8px"></span>
</div>
<pre id="logs"></pre>
<script>
async function load() {
  const limit = document.getElementById('limit').value || 200;
  const level = document.getElementById('level').value || '';
  const cat   = document.getElementById('cat').value || '';
  const qs = new URLSearchParams({ limit, ...(level && {level}), ...(cat && {cat}) });
  const t0 = performance.now();
  const res = await fetch('/logs/recent?'+qs.toString(), { cache:'no-store' });
  const json = await res.json();
  const dt = (performance.now()-t0).toFixed(1);
  document.getElementById('status').textContent = 'loaded '+json.items.length+' items in '+dt+'ms';
  const lines = json.items.map(e => \`[\${e.ts}] [\${e.level}] [\${e.cat}]\${e.reqId?' [req:'+e.reqId+']':''} \${e.msg}\${e.data?' '+JSON.stringify(e.data):''}\`);
  document.getElementById('logs').textContent = lines.join('\\n');
}
document.getElementById('refresh').onclick = load;
setInterval(load, 3000);
load();
</script>
</body></html>`);
});

module.exports = router;
