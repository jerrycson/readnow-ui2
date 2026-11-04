/* 리드나우 2 — 바탕(U2): 작은 도구·알림·확인·기기·저장소(ui2_* 칸과 기기 저장 rn2-)
 * 규칙: 브라우저 팝업(alert/confirm/prompt/window.open) 쓰지 않음 — 화면 안 알림(U2.toast)·확인(U2.ask)·두 번 누르기(U2.twice)
 *       기기 저장 열쇠는 모두 'rn2-' 머리 · 기기 이름(rn-device)만 지금 웹앱과 일부러 함께 씀 */
(function () {
  'use strict';
  const U2 = (window.U2 = window.U2 || {});
  U2.ver = window.U2_VER || '0.0.0';
  U2.base = window.U2_BASE || '../app/';
  /* 근거 없는 기준값은 모두 여기(설정으로 바꿈) */
  U2.CFG = {
    ctxMs: 1500, /* 위젯이 부른 쓰기로 칠 시간(누른 뒤 ms) — 근거: 없음, 설정으로 바꿈 (설계안은 0.5초 — 느린 기기 여유) */
    lockMin: 10, /* 편집 잠금 유효 시간(분) — 설계안 5-2 */
    undoMax: 100, /* 되돌리기 걸음 — 설계안 5-2 */
    verCheckMin: 10, /* 새 판 확인 간격(분) — 근거: 없음, 설정으로 바꿈 */
    perfMin: 5, /* 충돌 감시 요약 저장 간격(분) — 설계안 8-3 */
    iframeOk: ['https://jerrycson.github.io/'], /* 바깥 페이지 보기 위젯이 열 수 있는 주소 머리 */
  };
  U2.$ = (s, r) => (r || document).querySelector(s);
  U2.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  U2.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U2.uid = (p) => (p || 'w') + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6);
  U2.clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
  U2.now = () => new Date().toISOString();
  U2.today = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };

  /* ── 사건 줄(버스) ── */
  const H = {};
  U2.on = (k, f) => { (H[k] = H[k] || []).push(f); return () => { H[k] = (H[k] || []).filter((x) => x !== f); }; };
  U2.emit = (k, v) => { (H[k] || []).slice().forEach((f) => { try { f(v); } catch (e) { console.error('[u2]', k, e); } }); };

  /* ── 기기 저장(rn2-) — 실패해도 멈추지 않음 ── */
  U2.ls = {
    get(k, d) { try { const v = localStorage.getItem('rn2-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rn2-' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem('rn2-' + k); } catch (e) {} },
  };

  /* ── 기기 이름·관리자 ── 지금 웹앱이 불러와졌으면 그 판정을 그대로(isAdminDevice) · 아니면(안전 모드) 관리자 아님 */
  U2.dev = () => { try { if (typeof deviceName === 'function') return String(deviceName() || '').trim() || '이름 없는 기기'; } catch (e) {} try { return (localStorage.getItem('rn-device') || '').trim() || '이름 없는 기기'; } catch (e) { return '이름 없는 기기'; } };
  U2.isAdmin = () => { if (U2._adminOverride != null) return !!U2._adminOverride; try { if (typeof isAdminDevice === 'function') return !!isAdminDevice(); } catch (e) {} return false; };

  /* ── 화면 안 알림 ── */
  U2.toast = (m, err, ms) => {
    let t = document.getElementById('u2-toast');
    if (!t) { t = document.createElement('div'); t.id = 'u2-toast'; t.className = 'u2-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = m; t.classList.toggle('err', !!err); t.classList.add('on'); clearTimeout(U2.toast._h); U2.toast._h = setTimeout(() => t.classList.remove('on'), ms || 2400);
  };
  /* ── 화면 안 확인(브라우저 confirm 대신) — 대상 이름을 꼭 보임 ── */
  U2.ask = (msg, opt) => new Promise((res) => {
    opt = opt || {}; const old = document.getElementById('u2-ask'); if (old) old.remove();
    const b = document.createElement('div'); b.id = 'u2-ask'; b.className = 'u2-ask'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-modal', 'true');
    b.innerHTML = `<div class="u2-askbox"><div class="u2-askm"></div><div class="u2-askb"><button type="button" class="u2-btn u2-pri" data-ok>${U2.esc(opt.ok || '확인')}</button><button type="button" class="u2-btn" data-no>${U2.esc(opt.no || '그만두기')}</button></div></div>`;
    b.querySelector('.u2-askm').textContent = msg; document.body.appendChild(b);
    const done = (v) => { b.remove(); document.removeEventListener('keydown', kd, true); res(v); };
    const kd = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    document.addEventListener('keydown', kd, true);
    b.querySelector('[data-ok]').onclick = () => done(true); b.querySelector('[data-no]').onclick = () => done(false);
    b.addEventListener('click', (e) => { if (e.target === b) done(false); });
    setTimeout(() => b.querySelector('[data-ok]').focus(), 0);
  });
  /* ── 두 번 누르기 확인: 첫 번째 = 단추 글이 '한 번 더 누르면 …'으로 바뀜 (4초 안에 다시) ── */
  U2.twice = (btn, label, fn) => {
    if (btn._u2arm && Date.now() - btn._u2arm < 4000) { btn._u2arm = 0; btn.classList.remove('u2-armed'); if (btn._u2txt != null) btn.innerHTML = btn._u2txt; return fn(); }
    btn._u2txt = btn.innerHTML; btn._u2arm = Date.now(); btn.classList.add('u2-armed'); btn.textContent = '한 번 더 누르면 ' + label;
    clearTimeout(btn._u2h); btn._u2h = setTimeout(() => { btn._u2arm = 0; btn.classList.remove('u2-armed'); if (btn._u2txt != null) btn.innerHTML = btn._u2txt; }, 4000);
  };

  /* ── 저장소: Firestore(지금 웹앱이 연 것 · 칸 이름 ui2_*만) — 못 쓰면 기기에만(rn2-c:) ──
   * 읽기 수를 세어 둠(설계안 8-1: 배치 불러오기 3문서 안) */
  U2.stat = { reads: 0, writes: 0 };
  U2.store = {
    fs() { try { if (window.firebase && firebase.apps && firebase.apps.length && firebase.firestore) return firebase.firestore(); } catch (e) {} return null; },
    _lk: (col, id) => 'c:' + col + '/' + id,
    async get(col, id) {
      if (!/^ui2_/.test(col)) throw new Error('ui2_ 칸만 씀');
      const db = this.fs();
      if (db && U2.authed) { try { const s = await db.collection(col).doc(id).get(); U2.stat.reads++; const v = s.exists ? s.data() : null; if (v) U2.ls.set(this._lk(col, id), v); return v; } catch (e) { U2.emit('storeErr', e); } }
      return U2.ls.get(this._lk(col, id), null);
    },
    async set(col, id, v, merge) {
      if (!/^ui2_/.test(col)) throw new Error('ui2_ 칸만 씀');
      const cur = merge ? Object.assign({}, U2.ls.get(this._lk(col, id), {}) || {}, v) : v;
      U2.ls.set(this._lk(col, id), cur);
      const db = this.fs();
      if (db && U2.authed) { try { await db.collection(col).doc(id).set(v, merge ? { merge: true } : undefined); U2.stat.writes++; return true; } catch (e) { U2.emit('storeErr', e); return false; } }
      return true;
    },
    async where(col, f, val) {
      const db = this.fs(); const out = [];
      if (db && U2.authed) { try { const q = await db.collection(col).where(f, '==', val).get(); U2.stat.reads += Math.max(1, q.size || 0); q.forEach((d) => out.push(Object.assign({ _id: d.id }, d.data()))); return out; } catch (e) { U2.emit('storeErr', e); } }
      /* 기기에만: 머리로 찾음 */
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('rn2-c:' + col + '/') === 0) { const v = JSON.parse(localStorage.getItem(k)); if (v && v[f] === val) out.push(Object.assign({ _id: k.split('/').pop() }, v)); } } } catch (e) {}
      return out;
    },
  };
})();
