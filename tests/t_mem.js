/* 설계안 8-1 기준값 — 틀만의 메모리 더함(지금 웹앱 홈 대비 PC +30MB · 휴대폰 +20MB 안) · 첫 화면 · 긴 멈춤
 * 같은 가짜 자료(빈 가짜 Firestore)에서 ① 지금 웹앱을 그대로 연 것 ② 새 웹앱 홈(지금 웹앱 그대로 배치)을 열고, 쓰레기 치우기 뒤 JS 힙을 견줌 */
const fs = require('fs'), path = require('path');
const { chromium, ok, done, OUT, PORT } = require('./lib');
const STUB = fs.readFileSync(path.join(__dirname, 'fbstub2.js'), 'utf8');
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
async function measure(b, url, phone) {
  const ctx = await b.newContext({ viewport: phone ? { width: 390, height: 800 } : { width: 1400, height: 900 }, serviceWorkers: 'block', ...(phone ? { userAgent: IPHONE, isMobile: true, hasTouch: true } : {}) });
  const p = await ctx.newPage();
  await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 404, body: '' }));
  await ctx.route(/gstatic\.com\/firebasejs\//, (r) => r.fulfill({ body: /firebase-app-compat\.js/.test(r.request().url()) ? STUB : '', contentType: 'application/javascript' }));
  await ctx.route(/^https:\/\/jerrycson\.github\.io\/readnow-scripts\//, (r) => { const rel = new URL(r.request().url()).pathname.replace(/^\/readnow-scripts\//, ''); const f = path.join(OUT, rel); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' }); r.fulfill({ body: fs.readFileSync(f), contentType: /\.html$/.test(f) ? 'text/html; charset=utf-8' : 'application/javascript' }); });
  await p.addInitScript(() => { window.__lt = 0; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.duration >= 200) window.__lt++; })).observe({ entryTypes: ['longtask'] }); } catch (e) {} });
  const t0 = Date.now(); await p.goto(url); await p.waitForTimeout(10000);
  const cdp = await ctx.newCDPSession(p); await cdp.send('HeapProfiler.enable'); for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage');
  const h = await cdp.send('Runtime.getHeapUsage'); const m = await p.evaluate(() => ({ lt: window.__lt, dom: document.getElementsByTagName('*').length, first: window.U2 && U2._firstMs, ui2: !!window.U2 }));
  await ctx.close(); return { mb: Math.round((h.usedSize / 1048576) * 10) / 10, ...m, ms: Date.now() - t0 };
}
(async () => {
  console.log('[메모리 예산] 설계안 8-1');
  const b = await chromium.launch();
  for (const phone of [false, true]) {
    const classic = await measure(b, 'https://jerrycson.github.io/readnow-scripts/app/index.html', phone);
    const ui2 = await measure(b, 'http://localhost:' + PORT + (process.env.U2_PATH || '/ui2/') + 'index.html?p=home', phone);
    const d = Math.round((ui2.mb - classic.mb) * 10) / 10; const lim = phone ? 20 : 30; const nm = phone ? '휴대폰' : 'PC';
    ok(d <= lim, `${nm}: 새 웹앱 틀만의 메모리 더함 ${lim}MB 안`, `지금 웹앱 ${classic.mb}MB → 새 웹앱 ${ui2.mb}MB (더함 ${d}MB) · DOM ${classic.dom} → ${ui2.dom}`);
    ok(ui2.lt <= (phone ? 5 : 3), `${nm}: 첫 10초 긴 멈춤(200ms 넘음) ${phone ? 5 : 3}번 안`, `지금 웹앱 ${classic.lt}번 · 새 웹앱 ${ui2.lt}번`);
    ok(ui2.first != null && ui2.first < (phone ? 2500 : 1500), `${nm}: 새 웹앱 첫 화면(기본 배치 칸) ${phone ? 2.5 : 1.5}초 안`, ui2.first + 'ms(지금 웹앱 기능은 그 뒤 불러옴)');
  }
  await b.close(); done('t_mem');
})();
