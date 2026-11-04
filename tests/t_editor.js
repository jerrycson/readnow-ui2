/* 단계 2(그리기)·3(편집기) 완료 조건 — 설계안 11-2
 * 끌기 기준값(1초 60장면 중 50 이상) · 겹침 밀어내기 · 손잡이 크기 · 키보드 · 되돌리기 100걸음 왕복 같음 · 게시 → ui2_pages+ui2_versions · 게시 기록 되돌리기
 * · 편집 잠금 · 개인 배치(관리자 아님) · 휴대폰 폭 따로 고침 · 휴대폰 길게 눌러 끌기 */
const { open, ok, done, nonU2Writes } = require('./lib');
const snapOf = (p) => p.evaluate(() => U2.edit.snap());
const items = (p) => p.evaluate(() => U2.edit.items().map((i) => ({ id: i.id, x: i.x, y: i.y, w: i.w, h: i.h })));
const box = async (p, id) => p.locator(`.u2-cell[data-wid="${id}"]`).boundingBox();
(async () => {
  console.log('[단계 2·3] 격자 그리기와 편집기');
  let t = await open({ q: '?p=lab', settle: 2000, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); } }); let p = t.p;
  await p.addStyleTag({ content: '.verbar{display:none!important}' });
  await p.click('#u2-editbtn'); await p.waitForSelector('#u2-edtop');
  ok(await p.evaluate(() => U2.edit.scope === 'pub' && !!document.querySelector('#u2-eddrawer .u2-dri') && !!document.querySelector('#u2-edprops')), '편집 모드: 머리 도구줄 · 위젯 서랍 · 속성판(관리자 기기 = 공용 배치)');
  const nBasic = await p.evaluate(() => document.querySelectorAll('#u2-eddrawer .u2-dri[data-type]:not([data-type^="legacy"])').length);
  ok(nBasic >= 45, '서랍의 기본 UI 위젯', nBasic + '종');
  const nLegacy = await p.evaluate(() => document.querySelectorAll('#u2-eddrawer .u2-dri[data-type^="legacy"]').length);
  ok(nLegacy > 100, '서랍의 리드나우 기능(지금 웹앱 목록에서 저절로 — 탭·화면·홈 칸·기능 찾기)', nLegacy + '개');
  for (const ty of ['kpi', 'text', 'chart']) await p.click(`#u2-eddrawer .u2-dri[data-type="${ty}"]`);
  await p.waitForTimeout(200);
  let its = await items(p); ok(its.length === 3, '서랍에서 눌러 3개 넣음', JSON.stringify(its));
  const [A, B, C] = its.map((i) => i.id);
  /* 끌어 옮기기 + 장면 수 */
  const ba = await box(p, A); const colW = (await p.evaluate(() => U2.view.el.getBoundingClientRect().width)) / 24;
  await p.mouse.move(ba.x + 20, ba.y + 20); await p.mouse.down();
  const fps = await p.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); window.__fpsDone = res; }).then((n) => n));
  /* 위 evaluate는 1초를 셈 — 그동안 마우스를 움직이지 못하므로, 실제 끌기 중 장면 수는 아래에서 다시 잼 */
  const t0 = Date.now(); const steps = 60;
  const fpsP = p.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); }));
  for (let i = 1; i <= steps; i++) await p.mouse.move(ba.x + 20 + (colW * 10 * i) / steps, ba.y + 20 + (16 * 12 * i) / steps);
  await p.mouse.up(); const dragFps = await fpsP; const dragMs = Date.now() - t0;
  its = await items(p); const a1 = its.find((i) => i.id === A);
  ok(a1.x >= 9 && a1.x <= 11 && a1.y >= 11, '마우스로 끌어 옮김(오른쪽 10칸 · 아래 12줄)', JSON.stringify(a1));
  ok(dragFps >= 50, '끌기 중 1초 장면 수(기준 50 이상)', dragFps + '장면 · 쉴 때 ' + fps + '장면 · 움직임 ' + steps + '번 ' + dragMs + 'ms');
  ok(await p.evaluate(() => !U2Grid.hasOverlap(U2.edit.items())), '겹침 0');
  /* 겹치게 놓으면 밀어냄: B를 A 자리로 */
  const bb = await box(p, B); const ba2 = await box(p, A);
  await p.mouse.move(bb.x + 10, bb.y + 10); await p.mouse.down(); for (let i = 1; i <= 10; i++) await p.mouse.move(bb.x + 10 + ((ba2.x - bb.x) * i) / 10, bb.y + 10 + ((ba2.y - bb.y) * i) / 10); await p.mouse.up();
  its = await items(p); const a2 = its.find((i) => i.id === A), b2 = its.find((i) => i.id === B);
  ok(Math.abs(b2.x - a1.x) <= 1 && a2.y >= b2.y + b2.h && !(await p.evaluate(() => U2Grid.hasOverlap(U2.edit.items()))), '다른 위젯 위에 놓으면 그 위젯이 아래로 밀림', JSON.stringify({ a2, b2 }));
  /* 손잡이로 크기 */
  await p.click(`.u2-cell[data-wid="${C}"]`); const c0 = (await items(p)).find((i) => i.id === C);
  const hd = await p.locator(`.u2-cell[data-wid="${C}"] .u2-hd-se`).boundingBox();
  await p.mouse.move(hd.x + 5, hd.y + 5); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(hd.x + 5 + (colW * 4 * i) / 8, hd.y + 5 + (16 * 3 * i) / 8); await p.mouse.up();
  const c1 = (await items(p)).find((i) => i.id === C);
  ok(c1.w === c0.w + 4 && c1.h === c0.h + 3, '오른쪽 아래 손잡이로 크기 바꿈(폭 +4 · 높이 +3)', `${c0.w}×${c0.h} → ${c1.w}×${c1.h}`);
  const hw = await p.locator(`.u2-cell[data-wid="${C}"] .u2-hd-w`).boundingBox();
  await p.mouse.move(hw.x + 5, hw.y + 5); await p.mouse.down(); for (let i = 1; i <= 4; i++) await p.mouse.move(hw.x + 5 + (colW * 2 * i) / 4, hw.y + 5); await p.mouse.up();
  let c2 = (await items(p)).find((i) => i.id === C); ok(c2.x === c1.x + 2 && c2.w === c1.w - 2, '왼쪽 손잡이: 왼쪽 끝만 움직임(오른쪽 끝 그대로)', `${c1.x}/${c1.w} → ${c2.x}/${c2.w}`);
  /* 속성판 숫자 칸으로 자리 */
  await p.click(`.u2-cell[data-wid="${C}"]`); await p.fill('#u2-edprops [data-pos="x"]', '2'); await p.press('#u2-edprops [data-pos="x"]', 'Enter'); await p.waitForTimeout(100);
  ok((await items(p)).find((i) => i.id === C).x === 2, '속성판 숫자 칸(가로 자리)으로 옮김');
  const c2b = (await items(p)).find((i) => i.id === C); Object.assign(c2, c2b);
  /* 키보드 */
  await p.focus(`.u2-cell[data-wid="${C}"]`);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('Shift+ArrowDown'); await p.keyboard.press('Control+ArrowRight'); await p.keyboard.press('Control+ArrowDown');
  const c3 = (await items(p)).find((i) => i.id === C);
  ok(c3.x === c2.x + 1 && c3.y === c2.y + 4 && c3.w === c2.w + 1 && c3.h === c2.h + 1, '키보드: → 1칸 · Shift+↓ 4줄 · Ctrl+→ 폭 · Ctrl+↓ 높이', JSON.stringify(c3));
  /* 되돌리기 100걸음 왕복 */
  const s0 = await snapOf(p);
  for (let i = 0; i < 100; i++) await p.keyboard.press(i % 2 ? 'ArrowDown' : 'ArrowRight');
  const s100 = await snapOf(p);
  for (let i = 0; i < 100; i++) await p.keyboard.press('Control+z');
  const sU = await snapOf(p);
  ok(sU === s0 && s100 !== s0, 'Ctrl+Z 100걸음 → 처음과 똑같음');
  for (let i = 0; i < 100; i++) await p.keyboard.press('Control+Shift+Z');
  ok((await snapOf(p)) === s100, 'Ctrl+Shift+Z 100걸음 → 100걸음 뒤와 똑같음');
  ok(await p.evaluate(() => U2.edit.hist.length <= 100), '되돌리기 기록은 100걸음까지만 둠', await p.evaluate(() => U2.edit.hist.length));
  /* 지우기·되돌림·복사 */
  await p.focus(`.u2-cell[data-wid="${C}"]`); await p.keyboard.press('Delete'); ok((await items(p)).length === 2, 'Delete로 지움');
  await p.keyboard.press('Control+z'); ok((await items(p)).length === 3, 'Ctrl+Z로 지운 위젯이 돌아옴');
  await p.click(`.u2-cell[data-wid="${A}"]`); await p.keyboard.press('Control+c'); await p.keyboard.press('Control+v'); ok((await items(p)).length === 4, 'Ctrl+C / Ctrl+V 복사');
  /* / 빠른 넣기 */
  await p.click('.u2-grid', { position: { x: 5, y: 2 } }).catch(() => {}); await p.keyboard.press('Escape');
  await p.keyboard.press('/'); ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'u2-edq'), '/ 누르면 위젯 찾기 칸으로');
  await p.keyboard.type('표'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => Object.values(U2.edit.draft.widgets).some((w) => w.type === 'table')), "찾기 '표' + Enter → 표 위젯 넣음");
  /* 속성 바꾸기(글 칸) — 치는 동안 한 걸음 */
  const kid = await p.evaluate(() => Object.entries(U2.edit.draft.widgets).find(([, w]) => w.type === 'kpi')[0]);
  await p.click(`.u2-cell[data-wid="${kid}"]`); const h0 = await p.evaluate(() => U2.edit.nPush);
  await p.fill('#u2-edprops [data-k="label"]', '오늘 출고 수'); await p.waitForTimeout(100);
  ok(await p.evaluate((k) => U2.view.cell(k).textContent.includes('오늘 출고 수'), kid), '속성판에서 글을 바꾸면 위젯에 바로 보임');
  await p.type('#u2-edprops [data-k="label"]', ' 더'); const h1 = await p.evaluate(() => U2.edit.nPush);
  ok(h1 - h0 === 1, '글자를 치는 동안은 되돌리기 한 걸음으로 묶음', '늘어난 걸음 ' + (h1 - h0));
  await p.click('.u2-grid', { position: { x: 3, y: 3 } }).catch(() => {});
  /* 옛 기능 위젯은 한 페이지에 하나 */
  await p.click('#u2-eddrawer .u2-dri[data-type="legacy.header"]'); await p.click('#u2-eddrawer .u2-dri[data-type="legacy.header"]');
  ok(await p.evaluate(() => Object.values(U2.edit.draft.widgets).filter((w) => w.type === 'legacy.header').length === 1), "같은 옛 기능 위젯 두 번째는 막힘('한 페이지에 하나')");
  /* 휴대폰 폭: PC 배치에서 저절로 → 고치면 따로 */
  const pc0 = await p.evaluate(() => JSON.stringify(U2.edit.draft.layouts.pc));
  await p.click('#u2-edtop [data-bp="phone"]'); await p.waitForTimeout(200);
  const ph = await p.evaluate(() => ({ w: U2.$('#u2-page').getBoundingClientRect().width, cols: +U2.view.el.dataset.cols, own: U2.edit.own(), maxX: Math.max(...U2.edit.items().map((i) => i.x + i.w)) }));
  ok(ph.cols === 4 && ph.w <= 362 && !ph.own && ph.maxX <= 4, '휴대폰 폭(360px · 4칸) — PC 배치에서 저절로 흘려 만듦', JSON.stringify(ph));
  await p.focus(`.u2-cell[data-wid="${A}"]`); await p.keyboard.press('ArrowDown');
  ok(await p.evaluate((pc) => U2.edit.own() && JSON.stringify(U2.edit.draft.layouts.pc) === pc, pc0), '휴대폰에서 고치면 휴대폰 배치만 따로 저장(PC 배치는 그대로)');
  const ovA = await p.evaluate((a) => ({ ov: (U2.edit.draft.layouts.phone || []).map((i) => i.id), y: U2.edit.items().find((i) => i.id === a).y }), A);
  ok(ovA.ov.length === 1 && ovA.ov[0] === A, '휴대폰 배치에는 고친 위젯 하나만 덮어쓰기로 기억', JSON.stringify(ovA.ov));
  await p.click('#u2-edtop [data-bp="pc"]'); await p.waitForTimeout(150);
  /* PC에서 다른 위젯을 맨 위로 → 휴대폰에서 그 위젯은 다시 흘러 맨 위 근처로, A는 따로 고친 자리 그대로 */
  const tb = await p.evaluate(() => Object.entries(U2.edit.draft.widgets).find(([, w]) => w.type === 'table')[0]);
  await p.evaluate((id) => { const E = U2.edit; E.sel = new Set([id]); E.change(() => { const l = E.items(); U2Grid.move(l, id, 0, 0, 24, 1); E.setItems(l, [id]); }); }, tb);
  await p.click('#u2-edtop [data-bp="phone"]'); await p.waitForTimeout(150);
  const re = await p.evaluate(([a, tb, ay]) => { const it = U2.edit.items(); return { a: it.find((i) => i.id === a).y, tb: it.find((i) => i.id === tb).y, ay, ov: U2Grid.hasOverlap(it) }; }, [A, tb, ovA.y]);
  ok(re.a === re.ay && re.tb === 0 && !re.ov, 'PC를 바꾸면 휴대폰에서 따로 고치지 않은 위젯만 다시 흘림(고친 위젯 자리는 그대로)', JSON.stringify(re));
  await p.click(`.u2-cell[data-wid="${A}"]`); await p.click('#u2-edprops [data-a="follow"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !(U2.edit.draft.layouts.phone || []).length), "'↩ 이 위젯은 PC를 따름' → 덮어쓰기 지움");
  await p.click('#u2-edtop [data-bp="pc"]'); await p.waitForTimeout(150);
  /* 게시 */
  const pub = '#u2-edtop [data-e="pub"]';
  await p.click(pub); const armed = await p.textContent(pub);
  ok(/한 번 더 누르면/.test(armed) && /위젯 \+\d/.test(armed), '게시 첫 누름 = 바뀐 것 목록을 보이며 한 번 더', armed.trim());
  await p.click(pub); await p.waitForTimeout(400);
  const r1 = await p.evaluate(() => ({ rev: U2.pages.lab && U2.pages.lab.rev, doc: !!(__FS.ui2_pages || {}).lab, ver: !!(__FS.ui2_versions || {}).lab_1, dirty: U2.edit.dirty() }));
  ok(r1.rev === 1 && r1.doc && r1.ver && !r1.dirty, '게시 → ui2_pages/lab(판 1) + ui2_versions/lab_1', JSON.stringify(r1));
  const w1 = await p.evaluate(() => Object.keys(U2.edit.draft.widgets).length);
  await p.click('#u2-eddrawer .u2-dri[data-type="clock"]'); await p.click(pub); await p.click(pub); await p.waitForTimeout(300);
  ok(await p.evaluate(() => U2.pages.lab.rev === 2), '두 번째 게시 → 판 2');
  await p.click('#u2-edtop [data-e="hist"]'); await p.waitForSelector('.u2-panel [data-rev]');
  ok((await p.locator('.u2-panel [data-rev]').count()) === 2, '게시 기록에 판 2개');
  await p.click('.u2-panel [data-rev="1"]'); await p.click('.u2-panel [data-rev="1"]'); await p.waitForTimeout(500);
  const r3 = await p.evaluate(() => ({ rev: U2.pages.lab.rev, n: Object.keys(U2.pages.lab.widgets).length, note: (__FS.ui2_versions.lab_3 || {}).note }));
  ok(r3.rev === 3 && r3.n === w1 && /판 1로 되돌림/.test(r3.note || ''), '게시 기록에서 판 1로 되돌림 → 판 3으로 남음(지우지 않음)', JSON.stringify(r3));
  await p.click('#u2-edtop [data-e="exit"]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !U2.edit && document.querySelectorAll('#u2-page .u2-cell').length === Object.keys(U2.pages.lab.widgets).length), '◀ 보기로 → 게시한 배치가 보기 모드로 그려짐');
  /* 편집 잠금 */
  await p.evaluate(() => { __FS.ui2_locks = __FS.ui2_locks || {}; __FS.ui2_locks.lab = { dev: '다른기기', at: new Date().toISOString() }; });
  await p.click('#u2-editbtn'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => U2.edit.lockedBy === '다른기기' && /다른기기가 편집 중/.test(U2.$('#u2-edst').textContent)), "다른 기기가 편집 중이면 '○○가 편집 중 — 게시 막힘'");
  await p.click('#u2-eddrawer .u2-dri[data-type="badge"]'); await p.click(pub); await p.waitForTimeout(200);
  ok(await p.evaluate(() => U2.pages.lab.rev === 3), '잠겨 있으면 게시가 안 됨');
  await p.click('#u2-edtop [data-e="exit"]'); await p.waitForTimeout(300);
  /* 관리자 아님 → 이 기기만 */
  await p.evaluate(() => { U2._adminOverride = false; });
  await p.click('#u2-editbtn'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => U2.edit.scope === 'mine' && U2.$('#u2-edtop [data-scope="pub"]').disabled), '관리자 기기가 아니면 공용 배치 단추가 꺼지고 이 기기 배치로');
  await p.click('#u2-eddrawer .u2-dri[data-type="memo"]'); await p.click(pub); await p.click(pub); await p.waitForTimeout(300);
  const pr = await p.evaluate(() => { const k = Object.keys(__FS.ui2_prefs || {})[0]; return { k, has: !!(k && __FS.ui2_prefs[k].pages.lab), pubRev: U2.pages.lab.rev }; });
  ok(pr.has && pr.pubRev === 3, '이 기기 저장 → ui2_prefs/<기기>에만(공용 배치 판 그대로)', JSON.stringify(pr));
  await p.click('#u2-edtop [data-e="exit"]'); await p.waitForTimeout(300);
  ok(await p.isVisible('#u2-mine'), "보기 모드 머리줄에 '📱 이 기기 배치' 표시");
  ok((await nonU2Writes(p)).length === 0, '편집·게시 동안 ui2_ 밖 쓰기 0');
  ok(t.dialogs.length === 0, '브라우저 팝업 0');
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close();
  /* 휴대폰: 360px · 길게 눌러 끌기 */
  t = await open({ q: '?p=lab2', vp: { width: 360, height: 760 }, touch: true, settle: 1500 }); p = t.p;
  await p.addStyleTag({ content: '.verbar{display:none!important}' });
  const nv = await p.evaluate(() => ({ cols: U2.view && +U2.view.el.dataset.cols, sw: document.documentElement.scrollWidth }));
  ok(nv.cols === 4 && nv.sw <= 360, '휴대폰 360px: 4칸 · 가로 스크롤 없음', JSON.stringify(nv));
  await p.evaluate(() => U2.openEditor('mine')); await p.waitForTimeout(200);
  await p.evaluate(() => U2.edit.add('kpi')); await p.evaluate(() => U2.edit.add('text')); await p.waitForTimeout(150);
  const lp = await p.evaluate(async () => {
    const E = U2.edit; const id = E.items()[0].id; const c = U2.view.cell(id); const r = c.getBoundingClientRect(); const y0 = E.items()[0].y;
    const ev = (t, x, y) => U2.view.el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerType: 'touch', pointerId: 7, clientX: x, clientY: y, button: 0 }));
    c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 7, clientX: r.left + 10, clientY: r.top + 10, button: 0 }));
    await new Promise((s) => setTimeout(s, 450));
    for (let i = 1; i <= 10; i++) { ev('pointermove', r.left + 10, r.top + 10 + i * 20); await new Promise((s) => requestAnimationFrame(s)); }
    ev('pointerup', r.left + 10, r.top + 210); await new Promise((s) => setTimeout(s, 50));
    const y1 = E.items().find((i) => i.id === id).y; return { y0, y1 };
  });
  ok(lp.y1 > lp.y0 + 5, '휴대폰: 길게 누른 뒤 끌면 옮겨짐', JSON.stringify(lp));
  const sc = await p.evaluate(async () => { const E = U2.edit; const id = E.items()[0].id; const c = U2.view.cell(id); const r = c.getBoundingClientRect(); const y0 = E.items()[0].y; const ev = (t, x, y) => U2.view.el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerType: 'touch', pointerId: 8, clientX: x, clientY: y })); c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 8, clientX: r.left + 10, clientY: r.top + 10 })); ev('pointermove', r.left + 10, r.top + 60); ev('pointerup', r.left + 10, r.top + 60); await new Promise((s) => setTimeout(s, 50)); return { y0, y1: E.items().find((i) => i.id === id).y }; });
  ok(sc.y1 === sc.y0, '휴대폰: 길게 누르지 않고 밀면 화면 넘김(위젯은 안 움직임)', JSON.stringify(sc));
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 360), '휴대폰 편집 중에도 가로 스크롤 없음');
  await t.close();
  done('t_editor');
})();
