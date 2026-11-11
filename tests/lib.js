/* 리드나우 2 시험 도구 — Playwright
 * 돌리는 법: (1) cd <저장소> && python3 -m http.server 8810  (2) NODE_PATH=<playwright가 있는 node_modules> node ui2/tests/t_load.js
 * 인터넷에 있는 지금 웹앱은 받지 않음: U2_BASE(https://jerrycson.github.io/readnow-scripts/app/)로 가는 요청을 기기 안 배포본 사본(U2_TEST_OUT · 기본 /home/user/w/out)에서 돌려줌
 * Firebase는 가짜(tests/fbstub2.js) — 실제 Firebase에는 아무것도 쓰지 않음 */
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const PORT = process.env.U2_PORT || 8810;
const OUT = process.env.U2_TEST_OUT || '/home/user/w/out';
const STUB = fs.readFileSync(path.join(__dirname, 'fbstub2.js'), 'utf8');
const TYPES = { js: 'application/javascript', html: 'text/html; charset=utf-8', css: 'text/css', json: 'application/json', jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', webmanifest: 'application/manifest+json' };
let fails = 0, passes = 0; const log = [];
const ok = (cond, msg, extra) => { if (cond) { passes++; console.log('  ✓ ' + msg + (extra != null ? ' — ' + extra : '')); } else { fails++; console.log('  ✗ ' + msg + (extra != null ? ' — ' + extra : '')); } log.push([!!cond, msg]); return !!cond; };
async function open(opt) {
  opt = opt || {};
  const b = opt.browser || (await chromium.launch());
  const ctx = await b.newContext({ viewport: opt.vp || { width: 1400, height: 900 }, serviceWorkers: 'block', ...(opt.touch ? { hasTouch: true, isMobile: true } : {}), ...(opt.ua ? { userAgent: opt.ua } : {}) });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_TUNNEL|net::ERR/.test(m.text())) errs.push('CONSOLE ' + m.text().slice(0, 200)); });
  const dialogs = []; p.on('dialog', (d) => { dialogs.push(d.type() + ': ' + d.message()); d.dismiss().catch(() => {}); });
  await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 404, body: '' }));
  await ctx.route(/gstatic\.com\/firebasejs\//, (r) => r.fulfill({ body: /firebase-app-compat\.js/.test(r.request().url()) ? STUB : '/* 가짜 */', contentType: 'application/javascript' }));
  await ctx.route(/^https:\/\/jerrycson\.github\.io\/readnow-scripts\//, (r) => {
    const u = new URL(r.request().url()); const rel = u.pathname.replace(/^\/readnow-scripts\//, '');
    const ov = (opt.override && opt.override(rel)) || (opt.ovRef && opt.ovRef.fn && opt.ovRef.fn(rel)); if (ov) return r.fulfill(ov);
    const f = path.join(OUT, rel); if (!f.startsWith(OUT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' });
    const body = fs.readFileSync(f); const go = () => r.fulfill({ body, contentType: TYPES[path.extname(f).slice(1)] || 'application/octet-stream' }).catch(() => {});
    if (opt.slowKbps) setTimeout(go, 150 + (body.length * 8) / opt.slowKbps); else go(); /* 느린 망 흉내(가로챈 응답은 브라우저 망 흉내가 안 걸려 직접 늦춤) */
  });
  if (opt.init) await p.addInitScript(opt.init);
  if (opt.seed) await p.addInitScript((s) => { window.__FS_SEED = s; }, opt.seed);
  const url = 'http://localhost:' + PORT + (process.env.U2_PATH || '/') + 'index.html' + (opt.q || ''); /* 저장소 맨 위에 놓으면 U2_PATH=/ */
  await p.goto(url);
  if (opt.wait !== false) { await p.waitForFunction(() => window.U2 && (window.U2.legacy.ready && window.U2.legacy.shellDone || window.U2.safe), null, { timeout: 90000 }).catch(() => {}); await p.waitForTimeout(opt.settle || 1500); }
  return { b, ctx, p, errs, dialogs, close: async () => { if (!opt.browser) await b.close(); else await ctx.close(); } };
}
function done(name) { console.log(`\n${name}: 통과 ${passes} · 실패 ${fails}`); process.exitCode = fails ? 1 : 0; }
const nonU2Writes = (p) => p.evaluate(() => (window.__FSW || []).filter((w) => !/^ui2_/.test(String(w.n).split('/')[0])).map((w) => w.n + ':' + w.op));
/* 지금 웹앱을 그대로 엶(견줄 때) — 같은 가짜 Firebase·같은 배포본 사본 */
async function openClassic(opt) {
  opt = opt || {}; const b = opt.browser || (await chromium.launch());
  const ctx = opt.ctx || (await b.newContext({ viewport: opt.vp || { width: 1400, height: 900 }, serviceWorkers: 'block', ...(opt.ua ? { userAgent: opt.ua, isMobile: true, hasTouch: true } : {}) }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  if (!opt.ctx) await routeAll(ctx, opt);
  await p.goto('https://jerrycson.github.io/readnow-scripts/app/index.html'); await p.waitForTimeout(opt.settle || 4000);
  return { b, ctx, p, errs, close: async () => { if (!opt.browser) await b.close(); else if (!opt.ctx) await ctx.close(); else await p.close(); } };
}
/* 시험용 길 묶음: 바깥 막음 · 가짜 Firebase · 지금 웹앱 사본 · (U2_ORIGIN을 쓰면) 새 웹앱도 같은 주소 공간(jerrycson.github.io/readnow-ui2/)으로 */
async function routeAll(ctx, opt) {
  opt = opt || {};
  await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 404, body: '' }));
  await ctx.route(/gstatic\.com\/firebasejs\//, (r) => r.fulfill({ body: /firebase-app-compat\.js/.test(r.request().url()) ? STUB : '/* 가짜 */', contentType: 'application/javascript' }));
  await ctx.route(/^https:\/\/jerrycson\.github\.io\/readnow-scripts\//, (r) => { const rel = new URL(r.request().url()).pathname.replace(/^\/readnow-scripts\//, ''); const ov = opt.override && opt.override(rel); if (ov) return r.fulfill(ov); const f = path.join(OUT, rel); if (!f.startsWith(OUT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' }); r.fulfill({ body: fs.readFileSync(f), contentType: TYPES[path.extname(f).slice(1)] || 'application/octet-stream' }); });
  const ROOT = path.join(__dirname, '..');
  await ctx.route(/^https:\/\/jerrycson\.github\.io\/readnow-ui2\//, (r) => { const rel = new URL(r.request().url()).pathname.replace(/^\/readnow-ui2\//, '') || 'index.html'; const f = path.join(ROOT, rel); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' }); r.fulfill({ body: fs.readFileSync(f), contentType: TYPES[path.extname(f).slice(1)] || 'application/octet-stream' }); });
}
const seedFn = require('./seed2.js');
const seed = (p, n) => p.evaluate(`(${seedFn.toString()})(${JSON.stringify(n || {})})`);
/* (0.4.7) 끝까지 천천히 굴리기 — 옛 홈 칸은 화면에 실제로 보일 때 채워짐(지금 웹앱 IntersectionObserver · body가 굴림 상자라 rootMargin 600px이 먹지 않음)
 *  예전 시험은 1500·3000·6000으로 건너뛰어 그 사이(예: 매출 페이스 칸)가 한 번도 안 보이고 지나가 '주문 기록을 받는 중'에 머묾 → 탭마다 % 흔들림(85%·45/61)
 *  화면 높이보다 짧게(400px) 내려 모든 칸이 한 번은 보이게 · 두 시험(지금 웹앱 그대로·새 웹앱)이 같은 함수 */
async function scrollThrough(p, step, ms) { step = step || 400; ms = ms || 120;
  const H = await p.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  for (let y = 0; y <= H + step; y += step) { await p.evaluate((y) => { document.body.scrollTop = y; document.documentElement.scrollTop = y; }, y); await p.waitForTimeout(ms); }
  await p.evaluate(() => { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }); await p.waitForTimeout(ms * 2); }
module.exports = { scrollThrough, open, openClassic, routeAll, seed, ok, done, nonU2Writes, chromium, OUT, PORT, STUB };
