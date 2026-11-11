/* 조화 시험 H-02 둘씩 짝 · H-03 한 페이지 몽땅 · H-04 흔들기(무작위 배치 200) — 설계안 8-2
 * 기준: 오류 0 · 중복 id 0 · 겹침 0 · 남은 반복 타이머 0 · 한 페이지 몽땅은 긴 멈춤(200ms 넘음)·힙도 적음 */
const { open, seed, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[조화 H-02·H-03·H-04]');
  const t = await open({ q: '?p=hx', settle: 3000 }); const p = t.p; await seed(p); await p.waitForTimeout(2000);
  /* H-02 ① 기본 위젯 모든 짝 */
  const r1 = await p.evaluate(async () => {
    const T = U2W.order.filter((k) => !U2W.defs[k].legacy && k !== 'query'); const out = { n: 0, err: [], dup: 0 }; /* (0.4.7) 남은 타이머는 새 웹앱 위젯이 만든 것만 셈 — 지금 웹앱이 뒤에서 시작한 받기(상품·지표 syncColl 등 1.78.481)는 위젯 짝과 무관 */
    const live = new Map(), si = window.setInterval, ci = window.clearInterval; window.setInterval = function () { const h = si.apply(this, arguments); if (!/readnow-(webapp|[a-z-]+-core)\.js|readnow-registry/.test(new Error().stack || '')) live.set(h, 1); return h; }; window.clearInterval = function (h) { live.delete(h); return ci.apply(this, arguments); };
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      U2.pages.hx = { id: 'hx', title: 'hx', grid: { rowH: 16 }, rev: 0, widgets: { a: { type: T[i], props: {} }, b: { type: T[j], props: {} } }, layouts: { pc: [{ id: 'a', x: 0, y: 0, w: 12, h: 8 }, { id: 'b', x: 12, y: 0, w: 12, h: 8 }] } };
      U2.render({ reset: true }); out.n++;
      for (const k of ['a', 'b']) { const c = U2.view.cell(k); if (!c || /위젯 오류|모르는 위젯/.test(c.textContent)) out.err.push(T[i] + '+' + T[j]); }
      if (U2.guard.dupIds().length) out.dup++;
      if (out.n % 200 === 0) await new Promise((r) => setTimeout(r, 0));
    }
    U2.pages.hx = { id: 'hx', title: 'hx', grid: { rowH: 16 }, rev: 0, widgets: {}, layouts: { pc: [] } }; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 50));
    out.ivLeft = live.size; window.setInterval = si; window.clearInterval = ci; out.T = T.length; return out;
  });
  ok(r1.err.length === 0 && r1.dup === 0 && r1.ivLeft <= 0, `H-02 기본 위젯 ${r1.T}종 모든 짝 ${r1.n}쌍 — 오류 0 · 중복 id 0 · 남은 타이머 0`, r1.err.slice(0, 5).join(', ') + (r1.dup ? ' 중복 id ' + r1.dup : '') + ' 남은 타이머 ' + r1.ivLeft);
  /* H-02 ② 리드나우 기능 위젯 짝 — 탭마다 섹션 하나 + 홈 칸 + 화면 단추 + 기능 단추 (다른 묶음끼리는 대표만 · 짝 시험표 방식) */
  const r2 = await p.evaluate(async () => {
    const C = U2.catalog.get(); const pick = []; const seenTab = new Set();
    C.filter((i) => i.kind === 'sec').forEach((i) => { if (!seenTab.has(i.tab)) { seenTab.add(i.tab); pick.push(i); } });
    pick.push(...C.filter((i) => i.kind === 'home').slice(0, 6), ...C.filter((i) => i.kind === 'screen' && !i.needsArg).slice(0, 3), ...C.filter((i) => i.kind === 'feat').slice(0, 3));
    const out = { n: 0, err: [], dup: [], k: pick.length };
    for (let i = 0; i < pick.length; i++) for (let j = i + 1; j < pick.length; j++) {
      const A = pick[i], B = pick[j]; if (A.kind === 'sec' && B.kind === 'sec' && A.tab === B.tab) continue;
      U2.pages.hx = { id: 'hx', title: 'hx', grid: { rowH: 16 }, rev: 0, widgets: { a: { type: A.type, props: A.props }, b: { type: B.type, props: B.props } }, layouts: { pc: [{ id: 'a', x: 0, y: 0, w: 12, h: 12 }, { id: 'b', x: 12, y: 0, w: 12, h: 12 }] } };
      U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 30)); out.n++;
      for (const k of ['a', 'b']) { const c = U2.view.cell(k); if (!c || /위젯 오류|그리지 못함/.test(c.textContent)) out.err.push(A.key + '+' + B.key); }
      const d = U2.guard.dupIds(); if (d.length) out.dup.push(A.key + '+' + B.key + ':' + d.slice(0, 3).join(','));
    }
    return out;
  });
  ok(r2.err.length === 0, `H-02 리드나우 기능 위젯 대표 ${r2.k}개 짝 ${r2.n}쌍 — 오류 0`, r2.err.slice(0, 5).join(', '));
  ok(r2.dup.length === 0, 'H-02 기능 위젯 짝 — 중복 id 0', r2.dup.slice(0, 6).join(' / '));
  /* H-03 한 페이지 몽땅(분류마다 섹션·홈 칸 전부) */
  const r3 = [];
  for (let ci = 0; ci < 12; ci++) {
    const r = await p.evaluate(async (ci) => {
      const items = U2.catalog.get().filter((i) => i.cat === ci && (i.kind === 'sec' || i.kind === 'home' || i.kind === 'screen' && !i.needsArg || i.kind === 'feat')).slice(0, 40);
      const W0 = {}, L0 = []; items.forEach((it, k) => { W0['w' + k] = { type: it.type, props: it.props }; L0.push({ id: 'w' + k, x: (k % 3) * 8, y: Math.floor(k / 3) * 10, w: 8, h: 10 }); });
      const lt0 = U2.guard.stats.longTasks; const t0 = performance.now();
      U2.pages.hx = { id: 'hx', title: '몽땅', grid: { rowH: 16 }, rev: 0, widgets: W0, layouts: { pc: L0 } }; U2.render({ reset: true });
      await new Promise((r) => setTimeout(r, 400));
      const errN = [...document.querySelectorAll('#u2-page .u2-cell')].filter((c) => /위젯 오류|그리지 못함/.test(c.textContent)).length;
      return { ci, n: items.length, ms: Math.round(performance.now() - t0), lt: U2.guard.stats.longTasks - lt0, err: errN, dup: U2.guard.dupIds(), heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, ov: !!U2Grid.hasOverlap(U2.view._items) };
    }, ci);
    r3.push(r);
  }
  const cats = await p.evaluate(() => U2.catalog.CATS);
  ok(r3.every((r) => r.err === 0 && !r.ov), 'H-03 분류 12가지마다 그 분류 위젯을 한 페이지에 몽땅(최대 40) — 오류 0 · 겹침 0', r3.map((r) => cats[r.ci].split(' ')[0] + r.n).join(' '));
  const dupCats = r3.filter((r) => r.dup.length); ok(dupCats.length === 0, 'H-03 한 페이지 몽땅 — 중복 id 0', dupCats.map((r) => cats[r.ci] + ': ' + r.dup.slice(0, 4).join(',')).join(' / '));
  ok(r3.every((r) => r.lt <= 3), 'H-03 긴 멈춤(200ms 넘음) 분류마다 3번 안', r3.map((r) => r.lt + '번/' + r.ms + 'ms').join(' · '));
  /* H-04 흔들기: 무작위 배치 200 · 폭 4단계 */
  const r4 = await p.evaluate(async () => {
    let seed = 99; const R = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    const T = U2W.order.filter((k) => !U2W.defs[k].legacy && k !== 'query' && k !== 'iframe'); const out = { n: 0, ov: 0, err: 0, out: 0 };
    for (let s = 0; s < 200; s++) {
      const W0 = {}, L0 = []; const n = 3 + R(14);
      for (let i = 0; i < n; i++) { const id = 'z' + i; W0[id] = { type: T[R(T.length)], props: {} }; const it = { id, x: R(24), y: R(30), w: 1 + R(12), h: 1 + R(10) }; if (R(10) === 0) it.lock = true; if (R(12) === 0) it.float = true; U2Grid.clamp(it, 24, 1); L0.push(it); U2Grid.resolve(L0, id); }
      const pg = { id: 'hx', title: 'fz', grid: { rowH: 16, half: !!R(2), compact: !R(3) }, rev: 0, widgets: W0, layouts: { pc: L0, phone: R(3) ? null : [{ id: 'z0', x: 0, y: 0, w: 4, h: 3 }] } };
      for (const bp of U2Grid.BPS) { const items = U2.layoutFor(pg, bp); if (pg.grid.compact) U2Grid.compact(items); if (U2Grid.hasOverlap(items)) out.ov++; if (items.some((i) => i.x < 0 || i.x + i.w > bp.cols + 1e-9)) out.out++; }
      U2.pages.hx = pg; U2.render({ reset: true }); out.n++; if ([...document.querySelectorAll('#u2-page .u2-cell')].some((c) => /위젯 오류/.test(c.textContent))) out.err++;
      if (s % 20 === 0) await new Promise((r) => setTimeout(r, 0));
    }
    return out;
  });
  ok(r4.ov === 0 && r4.out === 0 && r4.err === 0, `H-04 무작위 배치 ${r4.n}개 × 폭 4단계(잠금·겹쳐 놓기·반 칸·위로 붙이기·휴대폰 따로) — 겹침 0 · 칸 밖 0 · 오류 0`, JSON.stringify(r4));
  ok((await nonU2Writes(p)).length === 0, 'ui2_ 밖 쓰기 0');
  const errs = t.errs.filter((e) => !/js-profiling|리드나우 2 시범 중/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close(); done('t_pairs');
})();
