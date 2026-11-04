/* 단계 1 완료 조건 — 틀과 불러오기 (설계안 11-2 단계 1 · 8-2 H-05·H-10·H-13 일부)
 * ① 새 주소에서 지금 웹앱이 열림(로그인된 채) ② 옛 상세 화면이 뜨고 뒤로 가기로 닫힘(페이지 그대로) ③ 읽기만: ui2_ 밖 쓰기 0
 * ④ 쓰기 길목마다 막힘(문서·묶음·거래·추가·Storage) · ui2_는 통과 ⑤ 옛 탭 바꿈 → 새 웹앱 페이지로 ⑥ 새 판 띠 ⑦ 안전 모드 ⑧ 배치 읽기 3문서 안 */
const { open, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[단계 1] 틀과 불러오기');
  let t = await open({ settle: 3000 }); let p = t.p;
  const s = await p.evaluate(() => ({ ready: U2.legacy.ready, shell: U2.legacy.shellDone, guard: U2.guard.installed, wrapped: U2.guard.wrapped, inCell: !!document.querySelector('.u2-cell #main'), hdr: !!document.querySelector('.u2-cell header.top'), main: (document.getElementById('main') || {}).textContent.length, ms: U2.legacy.loadMs, app: U2.legacy.appVer, reads: U2.stat.reads, user: (typeof S !== 'undefined' && S.user && S.user.email) || '' }));
  ok(s.ready && s.shell, '지금 웹앱 본문을 불러와 화면 틀까지 만듦', '불러오기 ' + s.ms + 'ms · 판 ' + s.app);
  ok(!!s.user, '로그인된 채로 열림(가짜 Firebase 사용자)');
  ok(s.guard && s.wrapped >= 10, '쓰기 막이를 걸었음', '감싼 길목 ' + s.wrapped);
  ok(s.inCell && s.main > 200, '옛 홈 탭이 새 웹앱 위젯 칸 안에 그려짐', '글자 ' + s.main);
  ok(s.hdr, '옛 머리줄(찾기 칸·설정 단추)이 위젯 칸 안에');
  ok(s.reads <= 3, '배치 불러오기 Firestore 읽기 3문서 안', s.reads + '문서');
  /* ② 옛 상세 화면 */
  await p.evaluate(() => U2.legacy.screen('ship')); await p.waitForTimeout(1200);
  const sh = await p.evaluate(() => ({ on: document.getElementById('sheet').classList.contains('on'), cur: U2.cur }));
  ok(sh.on, "옛 상세 화면 '📦 오늘 출고'(openShip)가 새 웹앱 위에 뜸");
  await p.goBack(); await p.waitForTimeout(800);
  const sh2 = await p.evaluate(() => ({ on: document.getElementById('sheet').classList.contains('on'), cur: U2.cur }));
  ok(!sh2.on && sh2.cur === 'home', '뒤로 가기 → 상세 화면만 닫히고 새 웹앱 페이지는 그대로', JSON.stringify(sh2));
  /* ③ 9페이지를 모두 돌며 읽기만 */
  const pages = await p.evaluate(() => U2.site.nav.map((n) => n.id));
  for (const id of pages) { await p.evaluate((i) => U2.go(i), id); await p.waitForTimeout(700); }
  const tabOk = await p.evaluate(() => U2.cur === 'projects' && document.querySelector('.u2-cell #main') && S.tab === 'projects');
  ok(tabOk, '탭 9개 페이지를 차례로 열면 옛 탭도 따라 바뀜(마지막 프로젝트)');
  await p.goBack(); await p.waitForTimeout(700);
  ok(await p.evaluate(() => U2.cur === 'market'), '페이지 사이 뒤로 가기(?p= 주소 길)');
  const w1 = await nonU2Writes(p); const bl = await p.evaluate(() => U2.guard.blocked.length);
  ok(w1.length === 0, '읽기만 — 지금 웹앱이 뒤에서 하려던 쓰기도 ui2_ 밖은 0건 통과', '막은 것 ' + bl + '건' + (w1.length ? ' 통과한 것: ' + w1.join(', ') : ''));
  /* ④ 길목마다 */
  const g = await p.evaluate(async () => {
    const db = firebase.firestore(); const r = {};
    const cat = async (k, f) => { try { await f(); r[k] = '통과'; } catch (e) { r[k] = e.code || e.message; } };
    await cat('set', () => db.collection('crm_orders').doc('t1').set({ a: 1 }));
    await cat('update', () => db.collection('prd_listings').doc('t1').update({ a: 1 }));
    await cat('delete', () => db.doc('sellers/t1').delete());
    await cat('add', () => db.collection('shp_cmds').add({ a: 1 }));
    await cat('batch', () => { const b = db.batch(); b.set(db.collection('crm_orders').doc('t2'), { a: 1 }); return b.commit(); });
    await cat('tx', () => db.runTransaction(async (tx) => { tx.update(db.collection('crm_orders').doc('t3'), { a: 1 }); }));
    await cat('storage', () => firebase.storage().ref('photos/x.jpg').put(new Blob(['x'])));
    await cat('ui2', () => db.collection('ui2_test').doc('t').set({ a: 1 }));
    return r;
  });
  ok(['set', 'update', 'delete', 'add', 'batch', 'tx', 'storage'].every((k) => g[k] === 'u2/readonly'), '쓰기 길목 7곳(문서 set·update·delete·추가·묶음·거래·Storage) 모두 막힘', JSON.stringify(g));
  ok(g.ui2 === '통과', 'ui2_ 칸은 통과');
  ok((await nonU2Writes(p)).length === 0, '가짜 Firestore에 닿은 ui2_ 밖 쓰기 0건');
  /* ⑤ 옛 코드가 탭을 바꾸면(기능 찾기 등) 그 탭 페이지로 */
  await p.evaluate(() => U2.go('home')); await p.waitForTimeout(600);
  await p.evaluate(() => { S.tab = 'orders'; renderMain(); }); await p.waitForTimeout(800);
  ok(await p.evaluate(() => U2.cur === 'orders' && new URLSearchParams(location.search).get('p') === 'orders'), "옛 코드가 탭을 '주문'으로 바꾸면 새 웹앱도 '주문' 페이지로");
  ok(t.dialogs.length === 0, '브라우저 팝업(alert/confirm/prompt) 0', t.dialogs.join(' / '));
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close();
  /* ⑥ 새 판 띠 — 지금 웹앱 판을 가짜로 올림 */
  let bump = false;
  t = await open({ settle: 2000, override: (rel) => { if (bump && rel === 'app/index.html') { const fs = require('fs'); const s0 = fs.readFileSync(require('./lib').OUT + '/app/index.html', 'utf8').replace(/const APP_VER = '([^']+)'/, "const APP_VER = '9.9.9'"); return { body: s0, contentType: 'text/html; charset=utf-8' }; } } }); p = t.p;
  bump = true; const nv = await p.evaluate(() => U2.legacy.checkNew()); await p.waitForTimeout(300);
  ok(nv.app === '9.9.9' && (await p.isVisible('#u2-newver')), "지금 웹앱 새 판이 나오면 '새 판' 띠", JSON.stringify(nv));
  await t.close();
  /* ⑦ 안전 모드 — 지금 웹앱 틀을 못 받음 */
  t = await open({ override: (rel) => (rel === 'app/index.html' ? { status: 404, body: '' } : null) }); p = t.p;
  const sf = await p.evaluate(() => ({ safe: U2.safe && U2.safe.why, banner: !!document.getElementById('u2-safe'), link: !!document.querySelector('.u2-cell a.u2-link'), body: typeof shell }));
  ok(sf.safe && sf.banner, '틀을 못 받으면 안전 모드 띠', sf.safe);
  ok(sf.link && sf.body === 'undefined', "기능 위젯 자리에 '지금 웹앱에서 열기 ›' · 본문은 안 불러옴");
  await t.close();
  /* ⑦-2 쓰기 막이를 못 걸면 본문을 안 불러옴 */
  t = await open({ init: () => { Object.defineProperty(window, '__noGuard', { value: 1 }); const iv = setInterval(() => { if (window.U2 && U2.guard) { U2.guard.install = () => false; clearInterval(iv); } }, 1); } }); p = t.p;
  const ng = await p.evaluate(() => ({ safe: U2.safe && U2.safe.why, body: typeof shell }));
  ok(ng.safe && /쓰기 막이/.test(ng.safe) && ng.body === 'undefined', '쓰기 막이를 못 걸면 본문을 불러오지 않고 안전 모드', ng.safe);
  await t.close();
  done('t_load');
})();
