/* 조화 시험 H-14 오래 쓰기(줄인 판: U2_SOAK_SEC초 · 기본 150초) · H-15 느린 망·끊김 — 설계안 8-1 · 8-2
 * H-14: 페이지 오가기·변수 바꾸기·옛 다시 그리기·실시간 수신 흉내를 되풀이 → 쓰레기 치운 뒤 힙 +10% 안 · DOM 수·반복 타이머 늘지 않음
 * H-15: 느린 망(3G 흉내)에서 첫 화면·기능 열림 시각 · 망이 끊기면 기기 저장본 배치로 열림 + 안전 모드 · 초안은 잃지 않음 */
const { open, seed, ok, done, nonU2Writes } = require('./lib');
const SEC = +(process.env.U2_SOAK_SEC || 150);
(async () => {
  console.log('[조화 H-14·H-15]');
  let t = await open({ q: '?p=home', settle: 3000 }); let p = t.p; await seed(p); await p.waitForTimeout(3000);
  const cdp = await p.context().newCDPSession(p); await cdp.send('HeapProfiler.enable');
  /* 힙 = 쓰레기 치운 뒤 사진(스냅숏)에서 '코드'(V8이 자주 쓰는 함수를 빠르게 다시 번역한 것 — 쓸수록 늘다 멈춤)를 뺀 자료 크기 */
  const dataMB = async () => { const chunks = []; const h = (e) => chunks.push(e.chunk); cdp.on('HeapProfiler.addHeapSnapshotChunk', h); await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false }); cdp.off('HeapProfiler.addHeapSnapshotChunk', h); const S0 = JSON.parse(chunks.join('')); const f = S0.snapshot.meta.node_fields, nf = f.length, iS = f.indexOf('self_size'), iT = f.indexOf('type'); const types = S0.snapshot.meta.node_types[0]; let all = 0, code = 0; for (let i = 0; i < S0.nodes.length; i += nf) { const sz = S0.nodes[i + iS]; all += sz; if (types[S0.nodes[i + iT]] === 'code') code += sz; } return { all: Math.round(all / 104857.6) / 10, data: Math.round((all - code) / 104857.6) / 10 }; };
  const snap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); const h = await cdp.send('Runtime.getHeapUsage'); const dm = await dataMB(); const m = await p.evaluate(() => ({ dom: document.getElementsByTagName('*').length, iv: U2.guard.stats.intervals, cells: document.querySelectorAll('#u2-page .u2-cell').length })); return { mb: Math.round(h.usedSize / 1048576 * 10) / 10, data: dm.data, ...m }; };
  /* 한 바퀴 돌려 자리 잡은 뒤 잼 */
  const loop = async (n) => { const pages = ['home', 'orders', 'biz', 'inbox', 'products', 'home']; for (let i = 0; i < n; i++) { await p.evaluate(async (pg) => { await U2.go(pg); U2.data.setVar('수', Math.random()); renderMain(); try { S.ver++; } catch (e) {} }, pages[i % pages.length]); await p.waitForTimeout(700); } };
  await loop(30); await p.evaluate(() => U2.go('home')); await p.waitForTimeout(1500); const a = await snap(); /* 처음 30번은 자리 잡기(옛 코드 캐시·글꼴·계산식 캐시가 차는 몫) */
  const t0 = Date.now(); let rounds = 0; while (Date.now() - t0 < SEC * 1000) { await loop(6); rounds++; }
  await p.evaluate(() => U2.go('home')); await p.waitForTimeout(1500); const b = await snap();
  const grow = Math.round(((b.data - a.data) / a.data) * 1000) / 10; const growAll = Math.round(((b.mb - a.mb) / a.mb) * 1000) / 10;
  ok(grow <= 10, `H-14 ${SEC}초 동안 ${rounds * 6}번 페이지 오가기·변수·옛 다시 그리기 — 힙(자료) 늘어남 10% 안`, `자료 ${a.data}MB → ${b.data}MB (${grow}%) · 코드 포함 전체 ${a.mb}MB → ${b.mb}MB (${growAll}% — 늘어난 몫은 V8 번역 코드)`);
  ok(b.dom <= a.dom * 1.1 + 50 && b.iv <= a.iv + 2, 'H-14 DOM 수·반복 타이머 늘지 않음', `DOM ${a.dom} → ${b.dom} · 타이머 ${a.iv} → ${b.iv}`);
  ok((await nonU2Writes(p)).length === 0, 'H-14 ui2_ 밖 쓰기 0'); const e1 = t.errs.filter((e) => !/js-profiling|리드나우 2 시범 중/.test(e)); ok(e1.length === 0, 'H-14 오류 0', e1.slice(0, 2).join(' / '));
  /* 초안을 남겨 둠(H-15 끊김 뒤 확인) */
  await t.close();
  /* H-15 ① 느린 망 */
  t = await open({ q: '?p=home', wait: false, slowKbps: 4000 }); p = t.p; /* 지금 웹앱 파일을 4Mbps·150ms로(휴대폰 3G~4G 사이) */
  const s0 = Date.now(); await p.reload(); await p.waitForFunction(() => window.U2 && U2._firstMs != null, null, { timeout: 30000 }).catch(() => {}); const first = Date.now() - s0;
  await p.waitForFunction(() => U2.legacy.ready && U2.legacy.shellDone, null, { timeout: 120000 }).catch(() => {}); const full = Date.now() - s0;
  ok(first < 5000, 'H-15 느린 망(4Mbps·150ms): 새 웹앱 첫 화면(배치 칸·머리줄)', (first / 1000).toFixed(1) + '초');
  ok(full < 60000 && (await p.evaluate(() => U2.legacy.ready)), 'H-15 느린 망: 지금 웹앱 기능까지 열림(본문 8.9MB)', (full / 1000).toFixed(1) + '초 — 실제 기기는 저장본이 있으면 훨씬 빠름');
  await t.close();
  /* H-15 ② 끊김: 지금 웹앱도 Firebase도 못 받음 → 기기 저장본 배치 + 안전 모드 · 초안 살아 있음 */
  const ovRef = { fn: null }; t = await open({ q: '?p=dr', settle: 2500, ovRef, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); } }); p = t.p;
  await p.evaluate(() => { U2.pages.dr = U2.TEMPLATES.dash.make('dr'); U2.openEditor('pub'); U2.edit.add('badge', { text: '초안 표시' }); }); await p.waitForTimeout(900); /* 편집 중 초안 */
  ovRef.fn = () => ({ status: 503, body: '' }); await p.reload(); await p.waitForFunction(() => window.U2 && U2.safe, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(800); /* 망 끊김 */
  const off = await p.evaluate(() => ({ safe: !!U2.safe, cells: document.querySelectorAll('#u2-page .u2-cell').length, banner: !!document.getElementById('u2-safe') }));
  ok(off.safe && off.banner, 'H-15 망이 끊겨 지금 웹앱을 못 받으면 안전 모드 띠', JSON.stringify(off));
  await p.evaluate(async () => { U2._adminOverride = true; U2.pages.dr = U2.TEMPLATES.dash.make('dr'); if (!U2.edit) await U2.openEditor('pub'); });
  await p.waitForFunction(() => window.U2 && U2.edit, null, { timeout: 20000 }).catch(() => {}); /* (0.4.9) 안전 모드에서는 편집기 파일을 그때 받음 — 설 때까지 기다림(시험 쪽 경쟁) */
  const dr = await p.evaluate(() => ({ from: !!U2.edit.fromDraft, badge: Object.values(U2.edit.draft.widgets).some((w) => w.type === 'badge' && w.props.text === '초안 표시') }));
  ok(dr.from && dr.badge, 'H-15 끊긴 뒤에도 편집 중이던 초안을 잃지 않음(이 기기 rn2-draft)', JSON.stringify(dr));
  await t.close(); done('t_soak');
})();
