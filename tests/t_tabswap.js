/* 섹션 위젯이 S.tab을 잠깐 바꾸는 동안·뒤에 옛 코드가 비동기로 읽는 경우 (단계 9 '확인 못 한 것')
 * ① 그리는 중 예약된 옛 코드(setTimeout·Promise)는 되돌린 S.tab을 봄 — 그 값으로 '그 탭일 때만 다시 그림'을 건너뛰는지
 * ② 그래도 자료가 나중에 오면 섹션 위젯이 저절로 다시 그려지는지(받은 자료 표시 감시 · '받는 중' 다시 시도)
 * ③ 섹션 위젯을 그리는 동안 옛 코드가 부른 renderMain이 다른 페이지로 데려가지 않음 · 옛 S.tab은 페이지 탭 그대로 */
const { open, seed, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[S.tab 잠깐 바꾸기] 섹션 위젯');
  const t = await open({ q: '?p=home', settle: 3000 }); const p = t.p;
  /* ① 그리는 동안 비동기로 S.tab 읽기 */
  const r1 = await p.evaluate(async () => {
    const seen = []; const o = window.renderBiz; window.renderBiz = function (m) { setTimeout(() => seen.push('setTimeout:' + S.tab), 0); Promise.resolve().then(() => seen.push('Promise:' + S.tab)); seen.push('그리는 중:' + S.tab); return o.apply(this, arguments); };
    U2.pages.ts = { id: 'ts', title: 'ts', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'legacy.sec', props: { ref: 'bz_margin', tab: 'biz' } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 24, h: 20 }] } };
    await U2.go('ts'); await new Promise((r) => setTimeout(r, 300)); window.renderBiz = o; return { seen, cur: U2.cur, tab: S.tab };
  });
  ok(r1.seen.includes('그리는 중:biz'), '그리는 동안은 S.tab = biz(그 탭 함수가 제 탭으로 믿음)', r1.seen.join(' · '));
  ok(r1.seen.some((x) => /^(setTimeout|Promise):/.test(x) && !/biz$/.test(x)), '그리기가 끝난 뒤 실행되는 옛 코드(setTimeout·Promise)는 되돌린 S.tab을 봄 — 그래서 옛 코드의 \'그 탭일 때만 다시 그림\'(지금 웹앱 50곳)은 섹션 위젯을 다시 그리지 않음', r1.seen.filter((x) => !/그리는/.test(x)).join(' · '));
  ok(r1.cur === 'ts' && r1.tab !== 'biz', '섹션 위젯을 그린 뒤 새 웹앱 페이지·옛 S.tab은 그대로', r1.cur + ' · S.tab=' + r1.tab);
  /* ② 자료가 나중에 와도 섹션이 다시 그려짐(옛 renderMain을 부르지 않는 경우) */
  const before = await p.evaluate(() => U2.view.cell('s').textContent.replace(/\s+/g, ' ').slice(0, 2000));
  await p.evaluate(() => { const o = window.renderMain; window.__rmSkip = 0; window.renderMain = function () { window.__rmSkip++; }; window.__rmKeep = o; }); /* 옛 다시 그리기를 막아 '탭 검사로 건너뛴' 상황을 흉내 */
  const r0 = await p.evaluate(() => U2.adapters.renders);
  await seed(p, { nobump: true });
  await p.waitForFunction((r0) => U2.adapters.renders > r0, r0, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(800);
  const after = await p.evaluate(() => U2.view.cell('s').textContent.replace(/\s+/g, ' ').slice(0, 2000));
  await p.evaluate(() => { window.renderMain = window.__rmKeep; });
  ok(before !== after && /원/.test(after), '옛 코드가 다시 그리라고 하지 않아도, 받은 자료 표시가 바뀌면 2초 안팎에 섹션 위젯을 다시 그림', '그리기 ' + (await p.evaluate((r0) => U2.adapters.renders - r0, r0)) + '번');
  /* ③ '받는 중'이면 다시 시도 */
  const r3 = await p.evaluate(async () => { const it = [...U2.adapters.secs][0]; const keep = it.redraw; let n = 0; it.redraw = () => { n++; }; it.b.insertAdjacentHTML('beforeend', '<div>상품 기록을 받는 중</div>'); U2.adapters.retry(it); await new Promise((r) => setTimeout(r, 1800)); it.redraw = keep; return n; });
  ok(r3 >= 1, "그린 섹션에 '받는 중'이 남아 있으면 1.5초 뒤 다시(최대 5번 · 1.5·3·6·12·24초)", r3 + '번');
  ok((await nonU2Writes(p)).length === 0, 'ui2_ 밖 쓰기 0');
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close(); done('t_tabswap');
})();
