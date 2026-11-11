/* H-11 돈 숫자 같음 — 같은 가짜 자료(tests/seed2.js · 고정 씨앗)를 넣고 지금 웹앱 화면 숫자 = 새 웹앱 숫자
 * ① 탭 전체 위젯(홈·주문·경영·상품·매입) ② 섹션 위젯(경영 ②매출 페이스·③수익성·재고 등) ③ 계산식 별칭(주문.전체수·상품.전체수…)
 * 숫자 = 화면 글에서 '…원·건·권·명·%'가 붙은 수(시각·몇 초 전은 뺌) — 차례 상관없이 같은 수 모음인지 */
const { scrollThrough, open, openClassic, seed, ok, done, chromium } = require('./lib');
const TABS = ['home', 'orders', 'biz', 'products', 'purchase', 'sellers'];
const SECS = [['bz_pace', 'biz'], ['bz_margin', 'biz'], ['bz_inv', 'biz'], ['bz_cust', 'biz'], ['o_bb', 'orders'], ['bz_supsales', 'biz']];
const nums = (t) => (String(t || '').match(/[-−]?[\d,]+(\.\d+)?\s?(원|건|권|명|%)/g) || []).map((x) => x.replace(/\s/g, '').replace('−', '-')).sort();
const same = (a, b) => { const B = new Map(); b.forEach((x) => B.set(x, (B.get(x) || 0) + 1)); let k = 0; a.forEach((x) => { const n = B.get(x); if (n) { k++; B.set(x, n - 1); } }); return { k, n: Math.max(a.length, b.length) }; };
const settle = async (p, get) => { let a = null; for (let i = 0; i < 6; i++) { const b = await p.evaluate(get); if (b === a) return b; a = b; await p.waitForTimeout(1000); } return a; }; /* 두 번 연달아 같을 때까지(늦게 오는 계산 기다림) */
const ready = (p) => p.waitForFunction(() => S.pur && S.pur.loaded && S.ordersLoaded, null, { timeout: 20000 }).catch(() => {});
const scrollAll = (pg) => scrollThrough(pg); /* (0.4.7) 건너뛰지 않고 끝까지 — lib.js scrollThrough */
(async () => {
  console.log('[H-11] 돈 숫자 같음');
  const b = await chromium.launch();
  const c = await openClassic({ browser: b, settle: 4000 }); const sc = await seed(c.p); await ready(c.p); await c.p.waitForTimeout(3000);
  const C = {}; for (const tab of TABS) { await c.p.evaluate((t) => { S.tab = t; S.limit = 30; S._userAt = Date.now(); renderTabs(); renderMain(); }, tab); await c.p.waitForTimeout(1500); await scrollAll(c.p); C[tab] = await settle(c.p, () => document.getElementById('main').textContent); }
  const CS = {}; for (const [id, tab] of SECS) { await c.p.evaluate(([t, id]) => { S.sec[id] = true; S.tab = t; S._userAt = Date.now(); renderMain(); }, [tab, id]); await c.p.waitForTimeout(1200); await c.p.evaluate((id) => { const d = document.querySelector(`#main details.sec[data-sec="${id}"]`); if (d && !d.open) d.querySelector('summary').click(); }, id); await c.p.waitForTimeout(1200); CS[id] = await settle(c.p, `(() => { const d = document.querySelector('#main details.sec[data-sec="${id}"]'); return d ? d.textContent : null; })()`); }
  const CA = await c.p.evaluate(() => ({ o: S.orders.size, p: S.plist.size, c: S.customers.size, s: S.sellers.size }));
  /* 지금 웹앱이 처음 열 때 한 번 하는 '옮기기·요약' 쓰기(app_settings 등)를 새 웹앱은 읽기만이라 못 함 → 실제 Firebase에는 이미 있는 문서이므로 그 결과를 새 웹앱 가짜 Firestore에 미리 넣음 */
  const wrote = await c.p.evaluate(() => { const o = {}; [...new Set((window.__FSW || []).map((w) => w.n.split('/')[0]))].forEach((k) => { if (!/^perf_logs$/.test(k)) o[k] = JSON.parse(JSON.stringify(window.__FS[k] || {})); }); return o; });
  await c.close();
  const t = await open({ browser: b, q: '?p=home', settle: 3000, seed: wrote }); const p = t.p; const su = await seed(p); await ready(p); await p.waitForTimeout(3000);
  ok(JSON.stringify(sc) === JSON.stringify(su), '두 웹앱에 같은 가짜 자료', JSON.stringify(su) + ' · 지금 웹앱이 처음 쓴 문서를 미리 넣음: ' + Object.keys(wrote).join(','));
  const rows = [];
  for (const tab of TABS) { await p.evaluate((t) => U2.go(t), tab); await p.waitForTimeout(1500); await scrollAll(p); const txt = await settle(p, () => (document.querySelector('.u2-cell #main') || {}).textContent || ''); const a = nums(C[tab]), bb = nums(txt); const r = same(a, bb); rows.push([tab, r.k, a.length, bb.length]); if (process.env.U2_DIFF === tab) { const A = nums(C[tab]), B2 = nums(txt); console.log('지금만:', A.filter((x) => !B2.includes(x)).slice(0, 20).join(' ')); console.log('새만:', B2.filter((x) => !A.includes(x)).slice(0, 20).join(' ')); } }
  const bad = rows.filter(([, k, n]) => n && k / n < 0.98); /* 지금 웹앱 화면의 숫자가 새 웹앱에 모두 있나(홈 칸은 보일 때 채워져 새 웹앱이 더 많을 수 있음) */
  ok(bad.length === 0, '탭 전체 위젯: 지금 웹앱 화면의 돈·건수·권수·% 숫자가 새 웹앱에 그대로(98% 넘게)', rows.map(([tab, k, n, m]) => `${tab} ${k}/${n}${m > n ? '(새 웹앱 +' + (m - n) + ')' : ''}`).join(' · '));
  const srows = [];
  for (const [id, tab] of SECS) { await p.evaluate(([id, tab]) => { U2.pages.mny = { id: 'mny', title: '돈', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'legacy.sec', props: { ref: id, tab } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 24, h: 20 }] } }; return U2.go('mny'); }, [id, tab]); await p.waitForTimeout(900); await p.evaluate(() => U2.render({ reset: true })); await p.waitForTimeout(900); const txt = await settle(p, () => { const d = U2.view.cell('s'); return d ? d.textContent : ''; }); if (CS[id] == null) { srows.push([id, '지금 웹앱 화면에 없음']); continue; } if (process.env.U2_DIFF === id) { const A = nums(CS[id]), B2 = nums(txt); console.log('지금만:', A.filter((x) => !B2.includes(x)).join(' ')); console.log('새만:', B2.filter((x) => !A.includes(x)).join(' ')); } const a = nums(CS[id]), bb = nums(txt); const r = same(a, bb); srows.push([id, r.k + '/' + r.n, r.n ? r.k / r.n : 1]); }
  const sbad = srows.filter((x) => typeof x[2] === 'number' && x[2] < 0.98);
  ok(sbad.length === 0 && srows.some((x) => typeof x[2] === 'number' && x[1] !== '0/0'), '섹션 위젯: 그 섹션의 숫자가 지금 웹앱 탭 안 같은 섹션과 같음', srows.map((x) => x[0] + ' ' + x[1]).join(' · '));
  const al = await p.evaluate(() => ({ o: U2.data.eval('주문.전체수').v, p: U2.data.eval('상품.전체수').v, c: U2.data.eval('고객.수').v, s: U2.data.eval('판매자.수').v }));
  ok(JSON.stringify(al) === JSON.stringify(CA), '계산식 별칭(주문.전체수·상품.전체수·고객.수·판매자.수) = 지금 웹앱 상태', JSON.stringify(al));
  await t.close(); await b.close(); done('t_money');
})();
