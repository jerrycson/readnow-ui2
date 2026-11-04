/* 단계 2 완료 조건(계산) — 견본 배치 30개: 겹침 0 · 폭 단계 흘리기 맞음 · 24→12→6칸 비율 · 반 칸 48 위치 · 밀어내기·위로 붙이기 · 잠금
 * 브라우저 없이 node로: node ui2/tests/t_grid_unit.js */
const G = require('../src/u2-grid.js');
const { ok, done } = { ok: (c, m, x) => { (c ? (P.n++, console.log('  ✓ ' + m + (x != null ? ' — ' + x : ''))) : (P.f++, console.log('  ✗ ' + m + (x != null ? ' — ' + x : '')))); }, done: (n) => { console.log(`\n${n}: 통과 ${P.n} · 실패 ${P.f}`); process.exitCode = P.f ? 1 : 0; } };
const P = { n: 0, f: 0 };
let seed = 7; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
console.log('[단계 2] 격자 엔진 계산');
/* 견본 30개: 무작위 크기·자리로 넣고 하나씩 resolve */
let overlaps = 0, outOf = 0, flowBad = 0, scaleBad = 0;
for (let s = 0; s < 30; s++) {
  const list = [];
  const n = 4 + rnd(20);
  for (let i = 0; i < n; i++) { const w = 1 + rnd(24), h = 1 + rnd(12); const it = { id: 'w' + i, x: rnd(24), y: rnd(40), w, h }; G.clamp(it, 24, 1); list.push(it); G.resolve(list, it.id); }
  if (G.hasOverlap(list)) overlaps++;
  if (list.some((i) => i.x < 0 || i.x + i.w > 24)) outOf++;
  for (const bp of G.BPS) {
    const d = G.derive(list, bp);
    if (G.hasOverlap(d)) (bp.cols === 4 ? flowBad++ : scaleBad++);
    if (d.some((i) => i.x < 0 || i.x + i.w > bp.cols + 1e-9)) outOf++;
    if (d.length !== list.length) flowBad++;
  }
}
ok(overlaps === 0, '견본 배치 30개 — 놓을 때마다 밀어내기 후 겹침 0', overlaps);
ok(outOf === 0, '모든 폭에서 위젯이 칸 밖으로 안 나감', outOf);
ok(scaleBad === 0, '12칸·6칸으로 줄여도 겹침 0', scaleBad);
ok(flowBad === 0, '휴대폰 4칸 흘리기 — 겹침 0 · 위젯 빠짐 0', flowBad);
/* 비율: 24칸 x=12,w=6 → 12칸 x=6,w=3 → 6칸 x=3, w=1.5→2(한 칸 단위 반올림) */
const a = [{ id: 'a', x: 12, y: 0, w: 6, h: 4 }, { id: 'b', x: 0, y: 0, w: 12, h: 4 }];
const t12 = G.scale(a, 24, 12, 1); const ta = t12.find((i) => i.id === 'a');
ok(ta.x === 6 && ta.w === 3, '24 → 12칸 비율 맞음(가로 자리 12→6 · 폭 6→3)', JSON.stringify(ta));
const back = G.scale(t12, 12, 24, 1).find((i) => i.id === 'a');
ok(back.x === 12 && back.w === 6, '12 → 24칸 되돌리면 처음과 같음', JSON.stringify(back));
const t6 = G.scale(a, 24, 6, 1).find((i) => i.id === 'b'); ok(t6.x === 0 && t6.w === 3, '24 → 6칸(폭 12→3)', JSON.stringify(t6));
/* 휴대폰 흘리기 차례: 읽는 차례(위→아래, 왼→오) */
const f = G.flow([{ id: 'r', x: 12, y: 0, w: 12, h: 3 }, { id: 'l', x: 0, y: 0, w: 12, h: 5 }, { id: 's1', x: 0, y: 5, w: 4, h: 2 }, { id: 's2', x: 4, y: 5, w: 4, h: 2 }], 24, 4);
const by = Object.fromEntries(f.map((i) => [i.id, i]));
ok(by.l.y === 0 && by.r.y === 5 && by.l.w === 4, '휴대폰: 왼쪽 위젯 먼저, 오른쪽은 그 아래(한 줄 다 씀)', JSON.stringify(f.map((i) => [i.id, i.x, i.y, i.w])));
ok(by.s1.w === 2 && by.s2.w === 2 && by.s1.y === by.s2.y && by.s2.x === 2, '휴대폰: 좁은 위젯(PC 6칸 이하)은 둘씩 한 줄');
/* 반 칸 맞춤: 0.5칸 단위 → 48 위치 */
const pos = new Set(); for (let x = 0; x <= 24; x += 0.25) { const it = G.clamp({ x, y: 0, w: 0.5, h: 1 }, 24, 0.5); pos.add(it.x); }
ok(pos.size === 48, '반 칸 맞춤을 켜면 가로 48 위치(0, 0.5, … 23.5)', pos.size);
const css = G.css({ x: 3.5, y: 2, w: 2.5, h: 3 }); ok(css.gridColumn === '8 / span 5' && css.gridRow === '3 / span 3', '반 칸 자리 → CSS 격자(열 길 48)', css.gridColumn);
const pos1 = new Set(); for (let x = 0; x <= 24; x += 0.25) pos1.add(G.clamp({ x, y: 0, w: 1, h: 1 }, 24, 1).x); ok(pos1.size === 24, '반 칸을 끄면 24 위치', pos1.size);
/* 밀어내기 · 끝없는 세로 */
const L = [{ id: 'a', x: 0, y: 0, w: 24, h: 4 }, { id: 'b', x: 0, y: 4, w: 12, h: 4 }, { id: 'c', x: 0, y: 8, w: 12, h: 4 }];
G.move(L, 'c', 0, 0, 24, 1); const m = Object.fromEntries(L.map((i) => [i.id, i.y]));
ok(m.c === 0 && m.a === 4 && m.b === 8, '맨 위로 옮기면 나머지가 차례로 아래로 밀림', JSON.stringify(m));
G.move(L, 'c', 0, 500, 24, 1); ok(L.find((i) => i.id === 'c').y === 500 && G.bottom(L) === 504, '세로는 끝없이(500줄 아래에도 놓임)', G.bottom(L));
G.compact(L); ok(G.bottom(L) === 12 && !G.hasOverlap(L), '위로 붙이기 — 빈 줄을 당김', G.bottom(L));
/* 잠금: 잠긴 위젯은 안 밀리고, 옮긴 위젯이 비켜 감 */
const K = [{ id: 'k', x: 0, y: 0, w: 24, h: 4, lock: true }, { id: 'z', x: 0, y: 10, w: 6, h: 2 }];
G.move(K, 'z', 0, 1, 24, 1); ok(K[0].y === 0 && K[1].y === 4, '잠긴 위젯은 그대로 · 옮긴 위젯이 아래로 비켜 감', JSON.stringify(K.map((i) => [i.id, i.y])));
G.move(K, 'k', 0, 10, 24, 1); ok(K[0].y === 0, '잠긴 위젯은 옮겨지지 않음');
/* 겹쳐 놓기(float) */
const F = [{ id: 'f', x: 0, y: 0, w: 4, h: 4, float: true }, { id: 'g', x: 0, y: 0, w: 8, h: 4 }]; G.resolve(F, 'g'); ok(F[0].y === 0 && F[1].y === 0, '겹쳐 놓기 허락 위젯은 밀어내지도 밀리지도 않음');
/* 크기 바꾸기 · 최소 크기 */
const R = [{ id: 't', x: 20, y: 0, w: 4, h: 4 }]; G.resize(R, 't', 10, 1, 24, 1, { minW: 4, minH: 4 }); ok(R[0].w === 10 && R[0].x === 14 && R[0].h === 4, '크기 바꿈 — 오른쪽 끝을 넘으면 안으로 · 최소 높이 지킴', JSON.stringify(R[0]));
/* 빈 곳 찾기 */
const S = [{ id: 'a', x: 0, y: 0, w: 12, h: 4 }]; const sp = G.findSpace(S, 12, 4, 24, 1); ok(sp.x === 12 && sp.y === 0, '빈 곳 찾기(위→아래, 왼→오)', JSON.stringify(sp));
/* Q6: 휴대폰 = PC에서 흘림 + 따로 고친 위젯만 덮어쓰기 */
const pc6 = [{ id: 'a', x: 0, y: 0, w: 12, h: 4 }, { id: 'b', x: 12, y: 0, w: 12, h: 4 }, { id: 'c', x: 0, y: 4, w: 24, h: 3 }];
const ov = [{ id: 'c', x: 0, y: 0, w: 4, h: 3 }];
let ph = G.overlay(pc6, 'phone', ov); let m6 = Object.fromEntries(ph.map((i) => [i.id, i.y]));
ok(m6.c === 0 && m6.a >= 3 && m6.b > m6.a && !G.hasOverlap(ph), '휴대폰에서 따로 고친 위젯(c 맨 위)은 그 자리 · 나머지는 흘려서 아래로', JSON.stringify(m6));
pc6[0].x = 12; pc6[1].x = 0; /* PC에서 a·b 자리를 바꿈 */
ph = G.overlay(pc6, 'phone', ov); m6 = Object.fromEntries(ph.map((i) => [i.id, i.y]));
ok(m6.c === 0 && m6.b < m6.a && !G.hasOverlap(ph), 'PC를 바꾸면 따로 고치지 않은 위젯(a·b)만 다시 흘림 · 고친 위젯(c)은 그대로', JSON.stringify(m6));
/* 폭 단계 */
ok(G.bpOf(1400).cols === 24 && G.bpOf(1000).cols === 12 && G.bpOf(700).cols === 6 && G.bpOf(360).cols === 4, '화면 폭에 따라 24 / 12 / 6 / 4칸');
done('t_grid_unit');
