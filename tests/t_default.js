/* 단계 8 완료 조건 — 기본 배치(정범님 Q8 ①: 지금 웹앱과 똑같이 보임 + ② 견본) · 설계안 11-2 단계 8
 * 탭 10개(9 + ⚙ 설정)마다 지금 웹앱을 그대로 연 것과 새 웹앱 기본 페이지의 옛 화면 글(#main)을 견줌 · 머리줄 ⚙ 단추 → 설정 페이지
 * · 견본 배치 6가지 겹침 0·오류 0 · 📥 할 일 받은편지함(N3 ★) · 옛 기능 위젯 📖 설명(E7) */
const fs = require('fs'), path = require('path');
const { scrollThrough, open, ok, done, chromium, OUT } = require('./lib');
const STUB = fs.readFileSync(path.join(__dirname, 'fbstub2.js'), 'utf8');
const TABS = ['home', 'search', 'products', 'sellers', 'orders', 'purchase', 'biz', 'market', 'projects', 'settings'];
const ready = (pg) => pg.waitForFunction(() => typeof S !== 'undefined' && S.ordersLoaded && S.prodLoaded && S.sellersLoaded, null, { timeout: 30000 }).catch(() => {});
const scrollAll = (pg) => scrollThrough(pg); /* (0.4.7) 건너뛰지 않고 끝까지 — lib.js scrollThrough */
const norm = (t) => String(t || '').split('\n').filter(Boolean);
const sim = (a, b) => { if (!a.length) return 100; /* 지금 웹앱에 있는 줄이 새 웹앱에 몇 % 있나(홈 칸은 화면에 보일 때 채워져 새 웹앱이 더 많을 수 있음) */ const B = new Map(); b.forEach((l) => B.set(l, (B.get(l) || 0) + 1)); let same = 0; a.forEach((l) => { const n = B.get(l); if (n) { same++; B.set(l, n - 1); } }); return Math.round((same / a.length) * 1000) / 10; };
(async () => {
  console.log('[단계 8] 기본 배치');
  /* ① 지금 웹앱 그대로 */
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' }); const c = await ctx.newPage();
  await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 404, body: '' }));
  await ctx.route(/gstatic\.com\/firebasejs\//, (r) => r.fulfill({ body: /firebase-app-compat\.js/.test(r.request().url()) ? STUB : '', contentType: 'application/javascript' }));
  await ctx.route(/^https:\/\/jerrycson\.github\.io\/readnow-scripts\//, (r) => { const rel = new URL(r.request().url()).pathname.replace(/^\/readnow-scripts\//, ''); const f = path.join(OUT, rel); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' }); r.fulfill({ body: fs.readFileSync(f), contentType: /\.html$/.test(f) ? 'text/html; charset=utf-8' : 'application/javascript' }); });
  await c.goto('https://jerrycson.github.io/readnow-scripts/app/index.html'); await c.waitForTimeout(3000); await ready(c); await c.waitForTimeout(1500);
  const classic = {}; for (const tab of TABS) { await c.evaluate((t) => { S.tab = t; S.limit = 30; S._userAt = Date.now(); renderTabs(); renderMain(); }, tab); await c.waitForTimeout(1500); await scrollAll(c); classic[tab] = await c.evaluate(() => (() => { const m = document.querySelector('.u2-cell #main') || document.getElementById('main'); return [...m.querySelectorAll('[id^="wc_"], details.sec, details.sec > summary, h3, .ptabs button, .homebar button')].map((e) => e.tagName + '#' + (e.id || e.dataset.sec || '') + ':' + (/^(SUMMARY|H3|BUTTON)$/.test(e.tagName) ? e.textContent : '').replace(/[0-9][0-9,.]*/g, '0').replace(/\s+/g, ' ').trim().slice(0, 60)).join('\n'); })()); }
  await b.close();
  /* ② 새 웹앱 */
  const t = await open({ q: '?p=home', settle: 3000 }); const p = t.p; await ready(p); await p.waitForTimeout(1500);
  const nav = await p.evaluate(() => U2.site.nav.map((n) => n.id));
  ok(TABS.every((x) => nav.includes(x)), '기본 메뉴 = 지금 웹앱 탭 9 + ⚙ 설정(+ 📥 할 일)', nav.join(' · '));
  const res = []; for (const tab of TABS) { await p.evaluate((t) => U2.go(t), tab); await p.waitForTimeout(1500); await scrollAll(p); const txt = await p.evaluate(() => (() => { const m = document.querySelector('.u2-cell #main') || document.getElementById('main'); return [...m.querySelectorAll('[id^="wc_"], details.sec, details.sec > summary, h3, .ptabs button, .homebar button')].map((e) => e.tagName + '#' + (e.id || e.dataset.sec || '') + ':' + (/^(SUMMARY|H3|BUTTON)$/.test(e.tagName) ? e.textContent : '').replace(/[0-9][0-9,.]*/g, '0').replace(/\s+/g, ' ').trim().slice(0, 60)).join('\n'); })()); res.push([tab, sim(norm(classic[tab]), norm(txt)), norm(classic[tab]).length]); if (process.env.U2_DIFF === tab) { const A = norm(classic[tab]), B = norm(txt); console.log('지금 웹앱에만:', A.filter((l) => !B.includes(l)).slice(0, 25)); console.log('새 웹앱에만:', B.filter((l) => !A.includes(l)).slice(0, 25)); } }
  const low = res.filter(([, s0]) => s0 < 95);
  ok(low.length === 0, '탭 10개마다 옛 화면 모양(홈 칸·섹션·제목·탭 단추 차례)이 지금 웹앱을 그대로 연 것과 같음(지금 웹앱 줄의 95% 넘게가 새 웹앱에도)', res.map(([k, s0, n]) => `${k} ${s0}%(${n}줄)`).join(' · '));
  await p.evaluate(() => U2.go('home')); await p.waitForTimeout(800);
  await p.click('.u2-cell header.top #hset').catch(() => {}); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => U2.cur === 'settings' && S.tab === 'settings'), "옛 머리줄의 ⚙ 설정 단추 → 새 웹앱 '설정' 페이지로", await p.evaluate(() => U2.cur));
  /* 견본 */
  const tp = await p.evaluate(async () => { const out = []; for (const [k, T] of Object.entries(U2.TEMPLATES)) { const pg = T.make('tpl'); U2.pages.tpl = pg; await U2.go('tpl', { replace: true }); await new Promise((r) => setTimeout(r, 120)); const cells = [...document.querySelectorAll('#u2-page .u2-cell')]; const err = cells.filter((c) => /위젯 오류|모르는 위젯/.test(c.textContent)).length; out.push({ k, n: Object.keys(pg.widgets).length, cells: cells.length, ov: !!U2Grid.hasOverlap(U2.view._items), err }); } return out; });
  ok(tp.length >= 6 && tp.every((x) => !x.ov && !x.err && (x.k === 'blank' || x.k === 'same' || x.cells > 0)), '견본 배치 ' + tp.length + '가지(지금 웹앱 그대로·대시보드·목록+상세·처리 흐름·설정·빈 페이지) — 겹침 0 · 오류 0', tp.map((x) => x.k + ' ' + x.cells).join(' · '));
  /* 📥 할 일 */
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(1500);
  const ib = await p.evaluate(() => { const c = U2.view.cell('ib'); return { rows: c ? c.querySelectorAll('.u2-ibr').length : 0, total: c ? c.querySelector('.u2-ibh b').textContent : '', card: !!(U2.view.cell('al') && U2.view.cell('al').textContent.length > 5) }; });
  ok(ib.rows >= 5 && ib.card, "📥 할 일 받은편지함 페이지: 처리할 것 줄 5 + 지금 웹앱 '오늘 확인할 것' 홈 칸", JSON.stringify(ib));
  await p.evaluate(() => [...U2.view.cell('ib').querySelectorAll('.u2-ibr')].find((r) => /연결 확정/.test(r.textContent)).querySelector('button').click()); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => U2.cur === 'pending' && S.tab === 'pending' && !!document.querySelector('.u2-cell #main')), "받은편지함 '연결 확정 › 열기' → 지금 웹앱 연결 확정 탭 페이지");
  /* 📖 옛 기능 위젯 설명 */
  const gd = await p.evaluate(async () => { U2.pages.g = { id: 'g', title: 'g', grid: { rowH: 16 }, rev: 0, widgets: { a: { type: 'legacy.homecard', props: { ref: 'pace' } }, b: { type: 'legacy.sec', props: { ref: 'bz_sup', tab: 'biz' } } }, layouts: { pc: [{ id: 'a', x: 0, y: 0, w: 8, h: 8 }, { id: 'b', x: 8, y: 0, w: 12, h: 8 }] } }; U2.catalog.get(); await U2.go('g'); await new Promise((r) => setTimeout(r, 200)); const r = {}; for (const k of ['a', 'b']) { const btn = U2.view.cell(k).querySelector('.u2-guide-btn'); if (btn) { btn.click(); r[k] = (U2.view.cell(k).querySelector('.u2-guide') || {}).textContent; } } return r; });
  ok(gd.a && gd.b && /MB/.test(gd.b), '옛 기능 위젯마다 📖 ⓘ — 지금 웹앱 설명(W_DESC·기능 찾기 설명) 그대로 · 받는 자료', JSON.stringify(gd).slice(0, 160));
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  ok(t.dialogs.length === 0, '브라우저 팝업 0');
  await t.close(); done('t_default');
})();
