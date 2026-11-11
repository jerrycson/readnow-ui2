/* 단계 11 — 최적화 전/후 숫자(설계안 8-4 · 11-2 단계 11) · 기준값(8-1)도 다시 봄
 * ① 새 웹앱 자기 파일(받는 양) ② 첫 화면 ③ 위젯 80개 긴 페이지: 그리기 시간·DOM 수 ④ 위젯 80개 페이지에서 끌기: 장면 수·자리 바꾸기 1번 시간 ⑤ 편집기 여는 시간
 * U2_PERF_OUT=파일 이면 숫자를 JSON으로 남김(전/후 견줌) */
const fs = require('fs');
const { open, ok, done } = require('./lib');
(async () => {
  console.log('[단계 11] 숫자');
  const M = {};
  const t = await open({ q: '?p=pf', settle: 2500, wait: true, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); } }); const p = t.p;
  const res = await p.evaluate(() => performance.getEntriesByType('resource').filter((r) => /localhost:\d+\/(src|u2-config|sw)/.test(r.name) && r.responseEnd <= (U2._firstMs || 1e9) + 5) /* 첫 화면 전에 받은 것만(쉬는 때 미리 받는 편집기 등은 뺌) */.map((r) => [r.name.replace(/^.*localhost:\d+\//, ''), r.encodedBodySize || r.transferSize || r.decodedBodySize]));
  M.files = res.length; M.kb = Math.round(res.reduce((s, r) => s + (r[1] || 0), 0) / 1024);
  M.first = await p.evaluate(() => U2._firstMs);
  const big = await p.evaluate(async () => {
    const T = U2W.order.filter((k) => !U2W.defs[k].legacy && !U2W.defs[k].block && !['query', 'iframe', 'fab', 'scan'].includes(k)); const W0 = {}, L0 = [];
    for (let i = 0; i < 80; i++) { const ty = T[i % T.length]; W0['b' + i] = { type: ty, props: {} }; L0.push({ id: 'b' + i, x: (i % 4) * 6, y: Math.floor(i / 4) * 8, w: 6, h: 8 }); }
    U2.pages.pf = { id: 'pf', title: '긴 페이지', grid: { rowH: 16 }, rev: 0, widgets: W0, layouts: { pc: L0 } };
    const ts = []; for (let k = 0; k < 7; k++) { const t0 = performance.now(); U2.render({ reset: true }); ts.push(performance.now() - t0); await new Promise((r) => setTimeout(r, 120)); } ts.sort((a, b) => a - b); const ms = ts[3]; /* 7번 중 가운데 값 */ await new Promise((r) => setTimeout(r, 300));
    return { ms: Math.round(ms), dom: document.querySelectorAll('#u2-page *').length, mounted: [...document.querySelectorAll('#u2-page .u2-cell')].filter((c) => c.querySelector('.u2-b, .u2-lg')).length };
  });
  Object.assign(M, { bigMs: big.ms, bigDom: big.dom, bigMounted: big.mounted });
  /* 늦게 받기·보이는 것만 그리기가 실제로 도는지 */
  const lz = await p.evaluate(async () => { const firstScripts = performance.getEntriesByType('resource').filter((r) => r.responseEnd <= U2._firstMs + 5).map((r) => r.name); const far = U2.view.cell('b79'); const before = !!far.querySelector('.u2-b'); document.body.scrollTop = 1e6; document.documentElement.scrollTop = 1e6; far.scrollIntoView(); await new Promise((r) => setTimeout(r, 400)); const after = !!far.querySelector('.u2-b'); document.body.scrollTop = 0; document.documentElement.scrollTop = 0; window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); const gone = !far.querySelector('.u2-b'); return { edFirst: firstScripts.some((n) => /u2-editor/.test(n)), exFirst: firstScripts.some((n) => /widgets-extra/.test(n)), edNow: !!U2.Editor, before, after, gone }; });
  ok(!lz.edFirst && !lz.exFirst && lz.edNow, '편집기·덜 쓰는 위젯 파일은 첫 화면 뒤 쉬는 때 받음', JSON.stringify({ 첫화면에편집기: lz.edFirst, 첫화면에추가위젯: lz.exFirst, 지금편집기: lz.edNow }));
  ok(!lz.before && lz.after && lz.gone, '화면에서 먼 위젯은 다가올 때 그리고, 멀어지면 비움', JSON.stringify({ 처음: lz.before, 내려간뒤: lz.after, 올라간뒤비움: lz.gone }));
  const e0 = Date.now(); await p.evaluate(() => U2.openEditor('pub')); await p.waitForSelector('#u2-edtop'); M.editorMs = Date.now() - e0;
  await p.waitForTimeout(300);
  const c0 = await p.locator('.u2-cell[data-wid="b0"]').boundingBox();
  await p.mouse.move(c0.x + 10, c0.y + 10); await p.mouse.down();
  const fpsP = p.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); }));
  for (let i = 1; i <= 60; i++) await p.mouse.move(c0.x + 10 + i * 6, c0.y + 10 + i * 5);
  M.dragFps = await fpsP; await p.mouse.up();
  M.placeMs = await p.evaluate(() => { const v = U2.view; const its = U2.edit.items(); const t0 = performance.now(); for (let i = 0; i < 50; i++) { its[0].y = (its[0].y + 1) % 40; v.place(its, 12); } return Math.round(((performance.now() - t0) / 50) * 100) / 100; });
  await p.evaluate(() => U2.edit.close(true));
  console.log('  숫자: ' + JSON.stringify(M));
  if (process.env.U2_PERF_OUT) fs.writeFileSync(process.env.U2_PERF_OUT, JSON.stringify(M));
  if (process.env.U2_PERF_BEFORE) { const B = JSON.parse(fs.readFileSync(process.env.U2_PERF_BEFORE, 'utf8')); const row = (k, nm, unit, better) => { const d = M[k] - B[k]; console.log(`  ${nm}: ${B[k]}${unit} → ${M[k]}${unit} (${d > 0 ? '+' : ''}${Math.round(d * 100) / 100})`); return better === 'less' ? M[k] <= B[k] * 1.05 + 1 : M[k] >= B[k] * 0.95 - 1; };
    ok(row('kb', '처음 받는 새 웹앱 파일', 'KB', 'less') && row('first', '첫 화면', 'ms', 'less'), '최적화 뒤 받는 양·첫 화면이 줄거나 같음');
    ok(row('bigDom', '위젯 80개 페이지 DOM 수', '', 'less') && row('bigMs', '위젯 80개 그리기', 'ms', 'less'), '최적화 뒤 긴 페이지 DOM·그리기 시간이 줄거나 같음');
    ok(row('placeMs', '자리 바꾸기 1번', 'ms', 'less') && row('dragFps', '끌기 장면', '/초', 'more'), '최적화 뒤 끌기가 빠르거나 같음'); }
  ok(M.first < 1500 && M.dragFps >= 50 && M.bigMs < 1000, '기준값(8-1): 첫 화면 1.5초 안 · 끌기 50장면 이상 · 위젯 80개 1초 안', JSON.stringify({ first: M.first, fps: M.dragFps, bigMs: M.bigMs }));
  const errs = t.errs.filter((e) => !/js-profiling|리드나우 2 시범 중/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close(); done('t_perf');
})();
