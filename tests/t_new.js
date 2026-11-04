/* 단계 9 — 새 기능 ★ 묶음 + ① 하나 (설계안 7장 · 5-10)
 * ★ N3 할 일 받은편지함(t_default) · N12 저장한 보기(t_actions) · N22 페이지마다 설치 아이콘 · E1 메모리 예산(t_adapters) · E2 배치 검사(t_editor·t_actions) · E5 내보내기/가져오기
 * ① N8 스캔 검수: 맞으면 ✓ · 틀리면 ✕ · 이 기기에 기억 · 자료 쓰기 없음 */
const fs = require('fs'), path = require('path');
const { open, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[단계 9] 새 기능');
  const keys = ['home', 'search', 'products', 'sellers', 'orders', 'purchase', 'biz', 'market', 'projects', 'settings', 'inbox', 'pending'];
  const mf = keys.map((k) => { try { const j = JSON.parse(fs.readFileSync(path.join(__dirname, '../m', k + '.webmanifest'), 'utf8')); return j.start_url === '../index.html?p=' + k && fs.existsSync(path.join(__dirname, '../m', j.icons[0].src)) ? null : k; } catch (e) { return k; } }).filter(Boolean);
  ok(mf.length === 0, 'N22 페이지마다 휴대폰 앱 설치 파일(시작 화면 = 그 페이지 · 아이콘·색)', keys.length + '개' + (mf.length ? ' 틀림 ' + mf.join(',') : ''));
  let t = await open({ q: '?p=orders', settle: 1500 }); let p = t.p;
  ok(await p.evaluate(() => /m\/orders\.webmanifest$/.test(document.getElementById('u2-manifest').href)), '?p=orders로 열면 주문 페이지 설치 파일을 씀');
  /* E5 내보내기 → 가져오기 */
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => { U2.pages.orders = U2.TEMPLATES.dash.make('orders'); U2.exportJson(); })]);
  const f = await dl.path(); const J = JSON.parse(fs.readFileSync(f, 'utf8'));
  ok(J.kind === 'readnow-ui2-layout' && J.pages.orders && Object.keys(J.pages.orders.widgets).length === 12, 'E5 배치 내보내기(JSON 파일) — 브라우저 팝업 없이 내려받기', dl.suggestedFilename());
  await p.evaluate(() => { U2._adminOverride = true; U2.pages.orders = U2.defaultPage('orders'); });
  await p.evaluate(() => U2.menu()); await p.setInputFiles('.u2-layer input[type=file]', f); await p.waitForTimeout(500);
  ok(await p.evaluate(() => U2.edit && Object.keys(U2.edit.draft.widgets).length === 12 && U2.edit.dirty()), '가져오기 → 편집기에 열림(게시해야 반영)');
  await p.evaluate(() => U2.edit.close(true)); await t.close();
  /* N8 스캔 검수 */
  t = await open({ q: '?p=scan', settle: 1500 }); p = t.p;
  await p.evaluate(() => { U2.pages.scan = { id: 'scan', title: '검수', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'scan', props: { list: '9788900000001 | 시험 책 하나\n9788900000002 | 시험 책 둘', sound: false } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 12, h: 16 }] } }; U2.render({ reset: true }); });
  const inp = '.u2-cell[data-wid="s"] input';
  await p.fill(inp, '9788900000001'); await p.press(inp, 'Enter'); await p.waitForTimeout(100);
  const r1 = await p.evaluate(() => U2.view.cell('s').querySelector('.u2-scanmsg').textContent);
  await p.fill(inp, '9780000000000'); await p.press(inp, 'Enter'); await p.waitForTimeout(100);
  const r2 = await p.evaluate(() => ({ m: U2.view.cell('s').querySelector('.u2-scanmsg').className + ' ' + U2.view.cell('s').querySelector('.u2-scanmsg').textContent, n: U2.view.cell('s').querySelector('.u2-sub').textContent, saved: localStorage.getItem('rn2-scan-s') }));
  ok(/✓ 맞음: 시험 책 하나/.test(r1), 'N8 스캔 검수: 목록에 있는 바코드 → ✓ 맞음', r1);
  ok(/u2-bad/.test(r2.m) && /✕ 목록에 없는/.test(r2.m) && /1 \/ 2/.test(r2.n) && /9788900000001/.test(r2.saved || ''), '틀린 바코드 → ✕ (빨강) · 확인 수 1/2 · 이 기기(rn2-)에 기억', r2.n);
  ok((await nonU2Writes(p)).length === 0, '스캔 검수는 자료 쓰기 없음(읽기만이라 시범 중에도 씀)');
  ok(t.dialogs.length === 0, '브라우저 팝업 0'); const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close(); done('t_new');
})();
