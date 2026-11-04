/* 리드나우 2 — 쓰기 막이 + 충돌 감시기 (설계안 3-3 · 8-3 · E12)
 * 시범 동안 새 웹앱이 실제 자료(주문·상품·가격…)를 바꾸지 못하게 Firestore·Storage 쓰기 길목을 감쌈.
 *  - 칸 이름이 ui2_ 로 시작하면 늘 통과(새 웹앱 배치·기록)
 *  - 아니면 막음. 단 정범님이 '쓰기 허락' 화면에서 직접 켠 위젯(ui2_site/main.writeOk)이 방금(U2.CFG.ctxMs 안) 부른 쓰기는 통과
 *  - '어느 위젯이 불렀나' 모르면 막음(안전 쪽)
 *  - 막은 쓰기는 기억해 두었다가 ui2_blocked/<기기>_<날짜> 한 문서에 모아 씀(무엇을·어느 위젯·언제 — 자료 내용은 적지 않음 = 개인 정보 없음)
 * 감싸는 곳: DocumentReference.set/update/delete · CollectionReference.add · WriteBatch.set/update/delete/commit · Transaction.set/update/delete
 *            · Storage Reference.put/putString/delete (있으면) — 모두 원형(prototype)에서 한 번만 */
(function () {
  'use strict';
  const U2 = (window.U2 = window.U2 || {});
  const G = (U2.guard = U2.guard || { installed: false, blocked: [], passed: 0, allowed: 0, lockAll: false, writeOk: {}, stats: { newKeys: [], intervals: 0, longTasks: 0 } });
  const colOf = (path) => String(path || '').split('/')[0];
  const isMine = (path) => /^ui2_/.test(colOf(path));
  G.ctx = null; G.ctxAt = 0;
  /* 위젯이 무엇을 누르면 그 위젯 종류를 잠깐 둠 */
  U2.setCtx = (k) => { G.ctx = k; G.ctxAt = Date.now(); };
  G.decide = (path, op) => {
    if (isMine(path)) { G.passed++; return true; }
    const k = G.ctx && Date.now() - G.ctxAt < ((U2.CFG && U2.CFG.ctxMs) || 1500) ? G.ctx : null;
    if (!G.lockAll && k && G.writeOk[k] && G.writeOk[k].on) { G.allowed++; return true; }
    G.blocked.push({ at: Date.now(), col: colOf(path), op, by: k || '' }); if (G.blocked.length > 500) G.blocked.splice(0, G.blocked.length - 500);
    G._dirty = true;
    /* 사람이 방금 누른 것일 때만 알림(웹앱이 뒤에서 하는 쓰기마다 알리면 시끄러움) */
    if (Date.now() - (G.userAt || 0) < 2000 && Date.now() - (G.toastAt || 0) > 3000) { G.toastAt = Date.now(); try { U2.toast('🔒 시범 중 — 이 일은 지금 웹앱에서 해 주세요 (' + colOf(path) + ')', true, 3500); } catch (e) {} }
    try { U2.emit && U2.emit('blocked', G.blocked[G.blocked.length - 1]); } catch (e) {}
    return false;
  };
  const err = (path) => { const e = new Error('🔒 리드나우 2 시범 중 — 읽기만 (' + colOf(path) + ')'); e.code = 'u2/readonly'; return e; };
  document.addEventListener('pointerdown', () => { G.userAt = Date.now(); }, true);
  document.addEventListener('keydown', () => { G.userAt = Date.now(); }, true);

  function wrapP(proto, name, pathOf, kind) {
    if (!proto || typeof proto[name] !== 'function' || proto[name].__u2) return false;
    const orig = proto[name];
    const f = function () {
      const p = pathOf(this, arguments);
      if (G.decide(p, name)) return orig.apply(this, arguments);
      if (kind === 'sync') throw err(p);
      if (kind === 'batch') { this.__u2bad = (this.__u2bad || 0) + 1; return this; }
      return Promise.reject(err(p));
    };
    f.__u2 = true; f.__u2orig = orig; proto[name] = f; return true;
  }
  G.install = function () {
    const fb = window.firebase; if (!fb || !fb.firestore) return false;
    const F = fb.firestore; let n = 0;
    if (F.DocumentReference) ['set', 'update', 'delete'].forEach((m) => { n += wrapP(F.DocumentReference.prototype, m, (t) => t.path, 'async'); });
    if (F.CollectionReference) n += wrapP(F.CollectionReference.prototype, 'add', (t) => t.path + '/(새 문서)', 'async');
    if (F.WriteBatch) {
      ['set', 'update', 'delete'].forEach((m) => { n += wrapP(F.WriteBatch.prototype, m, (t, a) => a[0] && a[0].path, 'batch'); });
      const P = F.WriteBatch.prototype; if (P.commit && !P.commit.__u2) { const oc = P.commit; P.commit = function () { if (this.__u2bad) return Promise.reject(err('(묶음 쓰기)')); return oc.apply(this, arguments); }; P.commit.__u2 = true; n++; }
    }
    if (F.Transaction) ['set', 'update', 'delete'].forEach((m) => { n += wrapP(F.Transaction.prototype, m, (t, a) => a[0] && a[0].path, 'sync'); });
    try { if (fb.storage && fb.storage.Reference) ['put', 'putString', 'delete'].forEach((m) => { n += wrapP(fb.storage.Reference.prototype, m, (t) => 'storage:' + (t.fullPath || ''), m === 'delete' ? 'async' : 'sync'); }); } catch (e) {}
    G.installed = G.installed || n > 0; G.wrapped = (G.wrapped || 0) + n;
    return G.installed;
  };
  /* 감싸지 못했으면(모르는 SDK 모양) 기능 위젯을 쓰지 않게 — 안전 쪽 */
  G.ok = () => G.installed;

  /* 막은 쓰기 기록 — 하루 기기당 한 문서에 덮어 씀(쓰기 적음) */
  G.flush = async () => {
    if (!G._dirty || !U2.store) return; G._dirty = false;
    const id = (U2.dev() + '_' + U2.today()).replace(/[\/\s]/g, '-');
    const list = G.blocked.slice(-200).map((b) => ({ at: b.at, col: b.col, op: b.op, by: b.by }));
    try { await U2.store.set('ui2_blocked', id, { dev: U2.dev(), day: U2.today(), n: G.blocked.length, last: list, at: U2.now() }); } catch (e) {}
  };

  /* ── 충돌 감시기(가벼움): 남은 반복 타이머 수 · rn2- 밖 새 기기 저장 열쇠 · 긴 멈춤 · 중복 id ── */
  (function () {
    try {
      const si = window.setInterval, ci = window.clearInterval, live = new Set();
      window.setInterval = function () { const h = si.apply(this, arguments); live.add(h); G.stats.intervals = live.size; return h; };
      window.clearInterval = function (h) { live.delete(h); G.stats.intervals = live.size; return ci.apply(this, arguments); };
    } catch (e) {}
    try {
      const known = new Set(); for (let i = 0; i < localStorage.length; i++) known.add(localStorage.key(i));
      const os = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { try { if (this === window.localStorage && !known.has(k)) { known.add(k); if (!/^rn2-/.test(k)) G.stats.newKeys.push(k); } } catch (e) {} return os.apply(this, arguments); };
    } catch (e) {}
    try { new PerformanceObserver((l) => { l.getEntries().forEach((e) => { if (e.duration >= 200) G.stats.longTasks++; }); }).observe({ entryTypes: ['longtask'] }); } catch (e) {}
  })();
  G.dupIds = () => { const seen = new Map(); document.querySelectorAll('[id]').forEach((el) => seen.set(el.id, (seen.get(el.id) || 0) + 1)); return [...seen].filter(([, n]) => n > 1).map(([k]) => k); };
  G.report = () => ({ dev: U2.dev(), day: U2.today(), at: U2.now(), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, longTasks: G.stats.longTasks, intervals: G.stats.intervals, dupIds: G.dupIds().length, blockedWrites: G.blocked.length, newKeys: G.stats.newKeys.slice(-20), ui2: U2.ver, app: typeof APP_VER !== 'undefined' ? APP_VER : null });
  G.perfSave = async () => { try { await U2.store.set('ui2_perf', (U2.dev() + '_' + U2.today()).replace(/[\/\s]/g, '-'), G.report()); } catch (e) {} };
  G.startTimers = () => {
    if (G._timers) return; G._timers = true;
    setInterval(G.flush, 60e3); setInterval(G.perfSave, ((U2.CFG && U2.CFG.perfMin) || 5) * 60e3);
    addEventListener('pagehide', () => { G.flush(); });
  };
})();
