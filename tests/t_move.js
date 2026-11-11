/* 단계 13 이전 장치(11/11 · 정범님 '옮기기 ㉮') — 이전 전 점검 · 이전 시작 · 지금 웹앱 주소에서 넘어감 · 옛 화면 주소(?old=1) · 한 번에 되돌리기 · 돌고 도는 일 없음
 * 지금 웹앱 쪽 짧은 글(tools/move-snippet.js)은 아직 지금 웹앱에 없음 → 시험에서는 지금 웹앱 틀(app/index.html) <head> 맨 앞에 끼워 넣어 흉내 냄(리드가 넣을 그 글 그대로) */
const fs = require('fs'); const path = require('path');
const { routeAll, chromium, ok, done, nonU2Writes, OUT } = require('./lib');
const SNIP = fs.readFileSync(path.join(__dirname, '..', 'tools', 'move-snippet.js'), 'utf8');
const TPL0 = fs.readFileSync(path.join(OUT, 'app', 'index.html'), 'utf8'); const HAS = /RN2_MOVE_SYNC/.test(TPL0); /* (0.4.7) 지금 웹앱에 짧은 글이 들어간 판(리드 · readnow-scripts tU2MOVE1111)이면 그대로 · 아니면 견본을 끼워 흉내 */
const TPL = HAS ? TPL0 : TPL0.replace('<head>', '<head><script>' + SNIP + '</script>');
const CLASSIC = 'https://jerrycson.github.io/readnow-scripts/app/index.html'; const UI2 = 'https://jerrycson.github.io/readnow-ui2/';
(async () => {
  console.log('[단계 13 이전 장치]');
  const ref = { fn: (rel) => (rel === 'app/index.html' || rel === 'app/' ? { body: TPL, contentType: 'text/html; charset=utf-8' } : null) };
  /* 같은 주소 공간(jerrycson.github.io) — 실제처럼 두 웹앱이 기기 저장을 함께 봄 */
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' }); await routeAll(ctx, { override: ref.fn });
  const dialogs = []; const p = await ctx.newPage(); p.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  await p.addInitScript(() => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); });
  await p.goto(UI2 + 'index.html?p=home'); await p.waitForFunction(() => window.U2 && U2.legacy.ready && U2.legacy.shellDone, null, { timeout: 90000 }).catch(() => {}); await p.waitForTimeout(2500);
  const t = { ctx, dialogs, close: () => b.close() };
  ok(await p.evaluate(() => !!(window.U2 && U2.move && U2.legacy.shellDone && /readnow-ui2/.test(location.pathname))), '새 웹앱 안에서 지금 웹앱 틀(짧은 글 들어 있음)을 불러도 넘어가지 않음');
  /* ① 이전 전 점검 */
  await p.evaluate(() => { U2.CFG.trialEnd = '2099-01-01'; U2.menu(); }); await p.click('[data-m="move"]'); await p.waitForSelector('.u2-mvchk'); await p.evaluate(() => U2.move._fill);
  const r1 = await p.evaluate(() => ({ rows: U2.move.last.rows, go: document.querySelector('[data-mvgo]').disabled, back: document.querySelector('[data-mvback]').disabled }));
  ok(r1.rows.length >= 10 && r1.rows.find((r) => r.k === 'trial' && !r.ok && r.hard), '이전 전 점검표 — 시범 14일이 안 끝나면 ✗ 막힘', r1.rows.length + '줄');
  ok(r1.go && r1.back, "막히는 줄이 있으면 '이전 시작'이 눌리지 않음 · 옮기기 전엔 되돌리기도 꺼짐");
  await p.evaluate(() => { U2.CFG.trialEnd = '2000-01-01'; }); await p.click('[data-mvre]'); await p.evaluate(() => U2.move._fill); await p.waitForTimeout(200);
  const r2 = await p.evaluate(() => ({ bad: U2.move.last.rows.filter((r) => r.hard && !r.ok).map((r) => r.k + ':' + r.note), go: document.querySelector('[data-mvgo]').disabled, n: document.querySelectorAll('.u2-mvchk tbody tr').length }));
  ok(!r2.bad.length && !r2.go, '막히는 줄이 없으면 이전 시작 단추가 켜짐(지금 웹앱 불러옴·쓰기 막이·계약·따라잡기·칸까지 허락·관리자·옛 주소)', r2.bad.join(' | ') || r2.n + '줄');
  await p.evaluate(() => { U2._adminOverride = false; }); await p.click('[data-mvre]'); await p.evaluate(() => U2.move._fill); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelector('[data-mvgo]').disabled), '관리자 기기가 아니면 이전 시작 못 함');
  await p.evaluate(() => { U2._adminOverride = true; }); await p.click('[data-mvre]'); await p.evaluate(() => U2.move._fill); await p.waitForTimeout(100);
  await p.fill('[data-mvplan]', '2026-11-22T20:00'); await p.click('[data-mvsave]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => (__FS.ui2_site.main.move || {}).plan === '2026-11-22T20:00'), '정범님이 정한 이전 날짜·시각을 저장(ui2_site/main.move.plan)');
  /* ② 이전 시작 = 두 번 누르기 */
  const go = '[data-mvgo]'; await p.click(go); ok(/한 번 더 누르면/.test(await p.textContent(go)), '이전 시작은 두 번 누르기(대상 보임)', (await p.textContent(go)).trim());
  await p.click(go); await p.waitForTimeout(500);
  const st = await p.evaluate(() => ({ fs: __FS.ui2_site.main.move, log: (__FS.ui2_site.main.moveLog || []).length, ls: JSON.parse(localStorage.getItem('rn2-move') || 'null') }));
  ok(st.fs && st.fs.state === 'on' && st.fs.by && st.fs.until && st.fs.to && /old=1/.test(st.fs.old) && st.log === 1, '이전 상태가 ui2_site/main.move에(누가·언제·30일 끝·새 주소·옛 주소) + 바꾼 기록', JSON.stringify(st.fs).slice(0, 220));
  const days = Math.round((new Date(st.fs.until) - new Date(st.fs.at)) / 864e5);
  ok(days === 30 && st.ls && st.ls.state === 'on' && st.ls.to === st.fs.to, '옛 화면 30일 · 기기 저장 rn2-move(지금 웹앱 틀이 읽는 것)도 on', days + '일 · ' + (st.ls && st.ls.to));
  ok((await nonU2Writes(p)).length === 0, '이전 장치는 ui2_ 칸에만 씀');
  await p.evaluate(() => { document.querySelectorAll('.u2-layer').forEach((x) => x.remove()); U2.menu(); });
  const link = await p.evaluate(() => { const a = document.querySelector('[data-oldlink]'); return a ? a.href + ' · ' + a.textContent : ''; });
  ok(/readnow-scripts\/app\/\?old=1/.test(link) && /30일 남음/.test(link), "☰ 메뉴 '↩ 옛 화면' 길은 옛 화면 주소(?old=1 — 다시 넘어오지 않음)", link);
  await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((x) => x.remove()));
  /* ③ 지금 웹앱 주소를 열면 새 웹앱으로(다른 탭 = 같은 기기) */
  const seedOn = await p.evaluate(() => ({ ui2_site: { main: JSON.parse(JSON.stringify(__FS.ui2_site.main)) } }));
  const tab = async (url, seedDoc, wait) => { const q = await t.ctx.newPage(); if (seedDoc) await q.addInitScript((s) => { window.__FS_SEED = s; }, seedDoc); const errs = []; q.on('pageerror', (e) => errs.push(e.message)); await q.goto(url).catch(() => {}); await q.waitForTimeout(wait || 4000); return { q, errs }; };
  const nav1 = []; const tab1 = await t.ctx.newPage(); await tab1.addInitScript((s) => { window.__FS_SEED = s; }, seedOn); tab1.on('framenavigated', (f) => { if (f === tab1.mainFrame()) nav1.push(f.url()); });
  await tab1.goto(CLASSIC + '?go=deliv#c=1').catch(() => {}); await tab1.waitForTimeout(6000); let a = { q: tab1 };
  const u1 = nav1.find((u) => /readnow-ui2/.test(u)) || a.q.url();
  ok(/^https:\/\/jerrycson\.github\.io\/readnow-ui2\/\?/.test(u1) && /from=old/.test(u1) && /go=deliv/.test(u1) && /#c=1$/.test(u1), '지금 웹앱 주소 → 곧바로 새 웹앱(주소 뒤 ?go=·# 그대로 + from=old)', u1);
  ok(await a.q.evaluate(() => !!(window.U2 && U2.legacy && U2.legacy.ready) && /readnow-ui2/.test(location.pathname)), '넘어온 새 웹앱이 서고 그대로 머묾(지금 웹앱 틀을 다시 불러도 또 넘어가지 않음)');
  await a.q.close();
  a = await tab(CLASSIC + '?old=1', seedOn, 3000);
  ok(/readnow-scripts\/app\/index\.html\?old=1/.test(a.q.url()), '옛 화면 주소(?old=1)는 넘어가지 않음', a.q.url());
  await a.q.goto(CLASSIC).catch(() => {}); await a.q.waitForTimeout(2500);
  ok(/readnow-scripts\/app\/index\.html$/.test(a.q.url()), '옛 화면으로 연 탭은 닫을 때까지 옛 화면(새로고침·주소 바꿔도)', a.q.url());
  await a.q.close();
  /* ③-2 이 기기에서 새 웹앱을 한 번도 안 연 기기(기기 저장 없음) — 지금 웹앱이 로그인 뒤 RN2_MOVE_SYNC로 문서 하나 읽고 넘어감 */
  a = { q: await t.ctx.newPage() }; await a.q.addInitScript((s) => { window.__FS_SEED = s; try { localStorage.removeItem('rn2-move'); } catch (e) {} }, seedOn); await a.q.goto(CLASSIC).catch(() => {}); await a.q.waitForTimeout(3500);
  const still = /readnow-scripts/.test(a.q.url()); await a.q.evaluate(() => { RN2_MOVE_SYNC(firebase.firestore()); }).catch(() => {}); await a.q.waitForTimeout(3000);
  ok((HAS ? !still : still) && /readnow-ui2\/?/.test(a.q.url()), '기기 저장이 없는 기기: 로그인 뒤 RN2_MOVE_SYNC(문서 1개 읽기)로 새 웹앱으로 넘어감' + (HAS ? '(지금 웹앱이 로그인 뒤 저절로 부름)' : '(견본 — 시험이 부름)'), a.q.url()); await a.q.close();
  await p.evaluate((m) => { localStorage.setItem('rn2-move', JSON.stringify(m)); }, await p.evaluate(() => Object.assign({}, U2.move.cur())));
  /* ④ 한 번에 되돌리기 */
  await p.evaluate(() => U2.moveScreen()); await p.waitForSelector('[data-mvback]:not([disabled])');
  await p.click('[data-mvback]'); await p.click('[data-mvback]'); await p.waitForTimeout(500);
  const bk = await p.evaluate(() => ({ fs: __FS.ui2_site.main.move.state, lock: __FS.ui2_site.main.lockAll, g: U2.guard.lockAll, ls: JSON.parse(localStorage.getItem('rn2-move')).state, log: __FS.ui2_site.main.moveLog.length }));
  ok(bk.fs === 'back' && bk.lock === true && bk.g === true && bk.ls === 'back' && bk.log === 2, "되돌리기(두 번 누르기) = move 'back' + 새 웹앱 모두 막기(읽기만) + 기기 저장도 back", JSON.stringify(bk));
  const seedBack = await p.evaluate(() => ({ ui2_site: { main: JSON.parse(JSON.stringify(__FS.ui2_site.main)) } }));
  a = await tab(CLASSIC, seedBack, 3000);
  ok(/readnow-scripts\/app\/index\.html$/.test(a.q.url()), '되돌린 뒤 지금 웹앱 주소 = 지금 웹앱 그대로', a.q.url()); await a.q.close();
  /* ⑤ 'on'을 기억한 다른 기기(되돌린 것을 아직 모름)가 넘어와도 → 새 웹앱이 'back'을 읽고 곧바로 돌려보냄 · 한 번만 */
  await p.evaluate(() => { const m = JSON.parse(localStorage.getItem('rn2-move')); m.state = 'on'; localStorage.setItem('rn2-move', JSON.stringify(m)); });
  const nav = []; a = { q: await t.ctx.newPage() }; await a.q.addInitScript((s) => { window.__FS_SEED = s; }, seedBack); a.q.on('framenavigated', (f) => { if (f === a.q.mainFrame()) nav.push(f.url()); });
  await a.q.goto(CLASSIC + '?go=deliv').catch(() => {}); await a.q.waitForTimeout(9000);
  const fin = a.q.url(); const ls2 = await a.q.evaluate(() => JSON.parse(localStorage.getItem('rn2-move') || 'null'));
  const blk = nav.map((u) => (/readnow-ui2/.test(u) ? 'U' : 'A')).join('').replace(/(.)\1+/g, '$1');
  ok(/readnow-scripts\/app\//.test(fin) && blk === 'AUA' && nav.some((u) => /readnow-scripts\/app\/\?go=deliv$/.test(u)), "옛 기억으로 넘어와도 새 웹앱이 되돌림을 읽고 지금 웹앱으로 한 번만 돌려보냄(돌고 돌지 않음 · ?go= 그대로)", nav.map((u) => u.replace(/^https?:\/\//, '').slice(0, 60)).join(' → '));
  ok(ls2 && ls2.state === 'back', '그 기기 저장도 back으로 고쳐짐(다음부터 넘어가지 않음)');
  await a.q.close();
  /* (0.4.6 · 견줌 ⑪) 개인 배치를 끈 알림의 '↶ 되돌리기' — 10초 안에 되살림 */
  await p.evaluate(async () => { U2.prefs = { pages: { home: U2.clone(U2.effective('home')) } }; U2.prefs.pages.home.layouts.pc = U2.prefs.pages.home.layouts.pc.slice(0, 1); await U2.savePrefs(); U2.render({ reset: true }); document.querySelectorAll('.u2-layer').forEach((x) => x.remove()); U2.menu(); });
  await p.click('[data-m="unmine"]'); await p.click('[data-m="unmine"]'); await p.waitForTimeout(400);
  const um = await p.evaluate(() => ({ gone: !(U2.prefs.pages || {}).home, btn: [...document.querySelectorAll('#u2-toast .u2-nact')].map((b) => b.textContent).join() }));
  ok(um.gone && /되돌리기/.test(um.btn), "개인 배치 끄면 알림에 '↶ 되돌리기' 단추", JSON.stringify(um));
  await p.click('#u2-toast .u2-note:has(.u2-nact) .u2-nact'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !!(U2.prefs.pages || {}).home && U2.prefs.pages.home.layouts.pc.length === 1 && !!(__FS.ui2_prefs && Object.values(__FS.ui2_prefs)[0].pages.home)), "알림 '되돌리기' → 이 기기 개인 배치가 되살아남(ui2_prefs에도)");
  ok(t.dialogs.length === 0, '브라우저 팝업 0');
  await t.close(); done('t_move');
})();
