/* 리드나우 2 — ⚡ 빠른 작업 · 🔎 어디서나 찾기(Ctrl+K) (0.4.5 · 단계 9 새 기능 — 성공 사례 견줌 '이어서')
 *  ② 빠른 작업: 지금 웹앱 1.78.467 머리 칸 「📥 등록 · 🚚 오늘 출고 · ＋ 매입」을 새 웹앱 머리줄에도 — 지금 웹앱 머리줄 위젯이 없는 페이지(📥 할 일·새로 만든 페이지)에서만 보임(두 벌 안 보임)
 *     숫자 셈·여는 함수는 지금 웹앱 것 그대로(ux2QaPaint와 같은 셈) · 지금 웹앱 ⚙ 🧩 화면 고침에서 '빠른 작업'을 끄면 여기도 꺼짐
 *  ⑤ 어디서나 찾기: Shopify 관리자 Ctrl/⌘+K처럼 한 칸에서 페이지·기능(🔍 기능 찾기 524)·옛 화면·이 웹앱 위젯·자료(고객·상품·주문)를 함께 찾고 범위 칩으로 좁힘
 *     자료 찾기는 지금 웹앱 검색창(#q)에 그 글을 넣어 지금 웹앱 검색 그대로(범위 칩도 그대로) · 등록·출고 같은 옛 화면이 열려 있으면 Ctrl+K는 지금 웹앱 몫(그대로)
 *  읽기만: 여기서 하는 일은 화면 열기·페이지 옮기기뿐 — 자료를 쓰지 않음 */
(function () {
  'use strict';
  const U2 = (window.U2 = window.U2 || {});
  const F = (U2.find = {});
  const esc = (s) => U2.esc(s);
  /* ── ⚡ 빠른 작업 ── */
  F.QA = [['reg', '📥 등록', '📥 상품 등록 화면 열기 — 숫자 = 진행 중(조회·선택·결정 대기·보류)', 'register'], ['ship', '🚚 오늘 출고', '🚚 오늘 출고 화면 열기 — 숫자 = 남은 일(확인할 주문·출고 준비·송장 인쇄됨·보내는 중) · 열기만(원스톱은 시작하지 않음)', 'ship'], ['pur', '＋ 매입', '＋ 새 매입 기록(매입 탭 「＋ 새 매입 기록」과 같음)', 'purForm']];
  F.qaOn = () => { try { if (typeof ux2On === 'function') return !!ux2On('quick'); } catch (e) {} return true; };
  F.qaCounts = () => {
    const o = { reg: null, ship: null };
    try { if (typeof S !== 'undefined' && S.regItems) { let n = 0; for (const x of S.regItems.values()) if (['q', 'sel', 'pick', 'hold'].includes(x.stage)) n++; o.reg = n; } } catch (e) {}
    try { if (typeof S !== 'undefined' && (S.ship || S.shipC) && typeof shipCnt === 'function') { const c = shipCnt().all || {}; o.ship = ['confirm', 'deliv', 'printed', 'sending'].reduce((a, k) => a + (c[k] || 0), 0); } } catch (e) {}
    return o;
  };
  F.QA_FN = { reg: () => openRegister(), ship: () => openShipHome(), pur: () => { if (typeof S !== 'undefined' && S.pur && !S.pur.loaded && typeof loadPur === 'function') loadPur(); openPurForm(null); } };
  F.qaGo = (k) => {
    const L = U2.legacy; if (!L || !L.ready || U2.safe) return U2.toast('지금 웹앱을 아직 불러오지 못함 — 잠시 뒤 다시', 1);
    const q = F.QA.find((x) => x[0] === k); L.userAt = performance.now(); U2.setCtx('screen:' + (q ? q[3] : k)); /* 쓰기 허락은 그 화면 위젯과 같은 열쇠(screen:register 등) */
    try { F.QA_FN[k](); } catch (e) { U2.toast('열지 못함: ' + U2.errKo(e), 1); }
  };
  /* 지금 웹앱 머리줄(빠른 작업이 든)이 이 페이지에 보이면 새 웹앱 쪽은 숨김 */
  F.legacyQaVisible = () => { const w = document.getElementById('ux2qa'); return !!(w && w.isConnected && w.offsetParent !== null); };
  F.paintQa = () => {
    const box = document.getElementById('u2-qa'); if (!box) return;
    const show = F.qaOn() && !U2.edit && !F.legacyQaVisible(); if (box.hidden === show) box.hidden = !show; if (!show) return;
    const c = F.qaCounts(); box.querySelectorAll('[data-u2qa] b').forEach((b) => { const n = c[b.parentNode.dataset.u2qa]; const t = n ? String(n) : ''; if (b.textContent !== t) b.textContent = t; });
  };
  F.barHtml = () => `<span class="u2-qa" id="u2-qa" role="group" aria-label="빠른 작업" hidden>${F.QA.map(([k, l, tip]) => `<button type="button" class="u2-btn" data-u2qa="${k}" title="${esc(tip)}">${esc(l)}<b></b></button>`).join('')}</span><button type="button" class="u2-btn" id="u2-findbtn" title="🔎 어디서나 찾기 — 페이지·기능·화면·위젯·자료(고객·상품·주문) · Ctrl+K" aria-label="어디서나 찾기">🔎 <span class="u2-findk">찾기 <kbd>Ctrl K</kbd></span></button>`;
  F.bindBar = (bar) => {
    bar.querySelectorAll('[data-u2qa]').forEach((b) => (b.onclick = () => F.qaGo(b.dataset.u2qa)));
    const fb = bar.querySelector('#u2-findbtn'); if (fb) fb.onclick = () => F.open();
    F.paintQa(); clearInterval(F._qt); F._qt = setInterval(() => { if (!document.hidden) F.paintQa(); }, 3000); /* 값만 견줌 · 가벼움 */
  };

  /* ── 🔎 어디서나 찾기 ── */
  F.SCOPES = [['all', '🌐 전체'], ['page', '📄 페이지'], ['feat', '🔧 기능'], ['set', '⚙ 설정'], ['scr', '🪟 화면'], ['wid', '🧱 위젯'], ['data', '👥 자료(고객·상품·주문)']];
  const norm = (s) => String(s || '').toLowerCase().replace(/[\s·・,.()\[\]『』「」|:/_-]+/g, '').replace(/[^0-9a-z가-힣ㄱ-ㅎ]/g, '');
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const cho = (s) => [...String(s || '')].map((ch) => { const c = ch.charCodeAt(0) - 0xac00; return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch; }).join('');
  /* 맞춤 점수: 앞에서 맞음 3 · 낱말 앞 2 · 품음 1 · 초성(ㅇㄴㅊㄱ = 오늘 출고) 1 · 없음 0 */
  F.score = (q, title, extra) => {
    const nq = norm(q); if (!nq) return 1; const nt = norm(title); const ne = norm(extra);
    if (nt.startsWith(nq)) return 3; if (String(title).split(/[\s·(]+/).some((w) => norm(w).startsWith(nq))) return 2.5; if (nt.includes(nq)) return 2; if (ne.includes(nq)) return 1.2;
    if (/^[ㄱ-ㅎ]+$/.test(nq) && norm(cho(title)).includes(nq)) return 1; return 0;
  };
  F.sources = () => {
    const out = []; const L = U2.legacy || {}; const W = window.U2W || { defs: {} };
    (U2.site && U2.site.nav || []).forEach((n) => out.push({ kind: 'page', icon: n.icon || '📄', title: n.title, sub: '페이지', go: () => U2.go(n.id) }));
    Object.values(U2.pages || {}).forEach((p) => { if (!(U2.site.nav || []).some((n) => n.id === p.id) && p.title) out.push({ kind: 'page', icon: p.icon || '📄', title: p.title, sub: '페이지(메뉴 밖)', go: () => U2.go(p.id) }); });
    /* (0.4.8 · 성공 사례 견줌 ⑧ 설정 찾기 — Shopify 관리자 검색이 설정 안까지 찾듯) 지금 웹앱 🔍 기능 찾기 전체(FEAT + 섹션 + 홈 칸)를 씀 · 설정 탭 칸은 '⚙ 설정' 범위로도
     *  예전엔 FEAT만(357) 봐서 섹션 이름(🧪 번외 수집기 설정·🔀 번외로 넘기기 등 200여 칸)이 안 찾혔음 · 연 것은 지금 웹앱 featGo 그대로(이름으로 다시 찾지 않음) */
    try { const ix = (L.list && (L.list('FEATIX') || L.list('FEAT'))) || []; const seen = new Set();
      ix.forEach((f) => { if (!f || !f.t) return; const g = f.go || {}; const k = f.t + '|' + (g.tab || '') + '|' + (g.sec || g.sel || ''); if (seen.has(k)) return; seen.add(k); const set = g.tab === 'settings' || /^⚙\s*설정/.test(f.w || ''); out.push({ kind: 'feat', set, icon: set ? '⚙' : '🔧', title: f.t, sub: f.w || '', extra: f.k || '', go: () => (L.featGo ? L.featGo(f) : L.feat(f.t)) }); }); } catch (e) {}
    try { (L.list && L.list('PG_SCR') || []).forEach((r) => { if (L.needsArg && L.needsArg(r[0])) return; out.push({ kind: 'scr', icon: '🪟', title: String(r[1]), sub: '지금 웹앱 화면', extra: r[0], go: () => L.screen(r[0]) }); }); } catch (e) {}
    Object.values(U2.pages || {}).forEach((p) => Object.entries(p.widgets || {}).forEach(([wid, w]) => { const d = W.defs[w.type] || {}; const pr = w.props || {}; const t = pr.s_title || pr.title || pr.label || pr.text || ''; if (!t || /^legacy\.(tab|header)$/.test(w.type)) return; out.push({ kind: 'wid', icon: d.icon || '🧱', title: String(t).split('\n')[0].slice(0, 80), sub: (p.icon || '') + ' ' + (p.title || p.id) + ' 페이지 › ' + (d.name || w.type), go: () => F.goWidget(p.id, wid) }); }));
    return out;
  };
  F.goWidget = async (pg, wid) => { await U2.go(pg); setTimeout(() => { const c = U2.view && U2.view.cell && U2.view.cell(wid); if (!c) return; c.scrollIntoView({ block: 'center', behavior: 'smooth' }); c.classList.add('u2-flash'); setTimeout(() => c.classList.remove('u2-flash'), 1600); }, 120); };
  /* 자료 찾기 = 지금 웹앱 검색 그대로: 지금 웹앱 머리줄이 있는 페이지(없으면 🏠 홈)로 가서 검색창에 넣음 */
  F.dataGo = async (q) => {
    const hasQ = () => { const qi = document.getElementById('q'); return qi && qi.isConnected && qi.offsetParent !== null ? qi : null; };
    if (!hasQ()) await U2.go('home');
    let qi = null; for (let i = 0; i < 30 && !(qi = hasQ()); i++) await new Promise((r) => setTimeout(r, 100));
    if (!qi) return U2.toast('지금 웹앱 검색창을 찾지 못함 — 🏠 홈 페이지에서 검색창을 쓰세요', 1);
    /* (0.4.8) 페이지를 막 바꾼 뒤엔 지금 웹앱이 머리줄(검색창)을 한 번 더 그려 넣은 글이 지워질 수 있음(설정 탭 → 홈 등) → 들어갔는지 보고 두 번까지 다시 넣음 */
    for (let i = 0; i < 3; i++) { U2.legacy.userAt = performance.now(); qi.focus(); qi.value = q; qi.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 250)); const q2 = hasQ(); let sq = q; try { sq = S.q; } catch (e) {} if (q2 && q2.value === q && sq === q) return; qi = q2 || qi; }
  };
  F.search = (q, scope) => {
    scope = scope || 'all'; const rows = [];
    if (String(q || '').trim() && (scope === 'all' || scope === 'data')) rows.push({ kind: 'data', icon: '👥', title: `‘${String(q).trim()}’ 자료에서 찾기`, sub: '고객·전화 · 주문번호 · 책 제목·ISBN — 지금 웹앱 검색 그대로(결과 위 범위 칩)', s: 9, go: () => F.dataGo(String(q).trim()) });
    if (scope === 'data') return rows;
    const per = { page: 6, feat: 10, scr: 6, wid: 6 }; const by = {};
    F.sources().forEach((r) => { if (scope === 'set' ? !r.set : scope !== 'all' && r.kind !== scope) return; const s = F.score(q, r.title, (r.sub || '') + ' ' + (r.extra || '')); if (!s) return; r.s = s; (by[r.kind] = by[r.kind] || []).push(r); });
    ['page', 'feat', 'scr', 'wid'].forEach((k) => { const a = (by[k] || []).sort((x, y) => y.s - x.s || String(x.title).length - String(y.title).length); rows.push(...a.slice(0, scope === 'all' ? per[k] : 60)); });
    return rows;
  };
  F.open = (q0) => {
    if (document.getElementById('u2-find')) { const i = document.querySelector('#u2-find input'); if (i) i.focus(); return; }
    const L = document.createElement('div'); L.id = 'u2-find'; L.className = 'u2-find'; L.setAttribute('role', 'dialog'); L.setAttribute('aria-modal', 'true'); L.setAttribute('aria-label', '어디서나 찾기');
    let scope = U2.ls.get('findScope', 'all') || 'all'; if (!F.SCOPES.some((s) => s[0] === scope)) scope = 'all'; let sel = 0; let rows = [];
    L.innerHTML = `<div class="u2-findbox"><div class="u2-findtop"><input class="u2-in" type="search" placeholder="페이지·기능·화면·위젯·고객·책·주문번호 찾기" aria-label="찾을 글" autocomplete="off"><button type="button" class="u2-btn" data-x aria-label="닫기">✕</button></div>
      <div class="u2-findsc" role="group" aria-label="찾는 곳">${F.SCOPES.map(([k, l]) => `<button type="button" class="u2-chip" data-sc="${k}" aria-pressed="${k === scope}">${esc(l)}</button>`).join('')}</div>
      <div class="u2-findres" role="listbox"></div><div class="u2-sub u2-findhelp">↑↓ 고르기 · Enter 열기 · Esc 닫기 · 초성도 됨(ㅇㄴㅊㄱ = 오늘 출고) · 찾는 곳은 이 기기에 기억</div></div>`;
    document.body.appendChild(L); const inp = L.querySelector('input'); const res = L.querySelector('.u2-findres');
    const close = () => { L.remove(); document.removeEventListener('keydown', kd, true); }; L._close = close;
    const run = (r) => { if (!r) return; close(); U2.ls.set('findRecent', [r.title].concat((U2.ls.get('findRecent', []) || []).filter((x) => x !== r.title)).slice(0, 8)); try { r.go(); } catch (e) { U2.toast('열지 못함: ' + U2.errKo(e), 1); } };
    const draw = () => {
      const q = inp.value; rows = F.search(q, scope);
      if (!q.trim()) { const rec = U2.ls.get('findRecent', []) || []; const all = F.sources(); const rr = rec.map((t) => all.find((x) => x.title === t)).filter(Boolean); rows = rr.length ? rr : rows.slice(0, 12); }
      sel = Math.min(sel, Math.max(0, rows.length - 1)); let lastK = '';
      const KN = { data: '👥 자료', page: '📄 페이지', feat: '🔧 기능(지금 웹앱 🔍 기능 찾기)', scr: '🪟 지금 웹앱 화면', wid: '🧱 이 웹앱 위젯' };
      res.innerHTML = rows.length ? rows.map((r, i) => { const h = r.kind !== lastK ? `<div class="u2-findk2">${esc(!q.trim() && (U2.ls.get('findRecent', []) || []).length ? '최근 연 것' : KN[r.kind])}</div>` : ''; lastK = !q.trim() ? lastK || r.kind : r.kind; return h + `<button type="button" class="u2-findrow ${i === sel ? 'on' : ''}" role="option" aria-selected="${i === sel}" data-i="${i}"><span class="u2-findi">${esc(r.icon)}</span><span class="u2-findt">${esc(r.title)}<small class="u2-sub">${esc(r.sub || '')}</small></span></button>`; }).join('')
        : `<div class="u2-empty">‘${esc(q)}’ — 여기엔 없음${scope !== 'all' ? ' · <button type="button" class="u2-btn" data-allsc>🌐 전체에서 찾기</button>' : ''}</div>`;
      res.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => run(rows[+b.dataset.i])));
      const a = res.querySelector('[data-allsc]'); if (a) a.onclick = () => setScope('all');
      const on = res.querySelector('.u2-findrow.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    };
    const setScope = (k) => { scope = k; U2.ls.set('findScope', k); L.querySelectorAll('[data-sc]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sc === k))); sel = 0; draw(); inp.focus(); };
    L.querySelectorAll('[data-sc]').forEach((b) => (b.onclick = () => setScope(b.dataset.sc)));
    L.querySelector('[data-x]').onclick = close; L.addEventListener('click', (e) => { if (e.target === L) close(); });
    inp.addEventListener('input', () => { sel = 0; draw(); });
    const kd = (e) => { if (e.isComposing) return; if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!rows.length) return; sel = (sel + (e.key === 'ArrowDown' ? 1 : rows.length - 1)) % rows.length; draw(); } else if (e.key === 'Enter' && document.activeElement === inp) { e.preventDefault(); run(rows[sel]); } };
    document.addEventListener('keydown', kd, true);
    if (q0) inp.value = q0; draw(); setTimeout(() => inp.focus(), 0); return L;
  };
  /* Ctrl/⌘+K — 옛 화면(등록·출고 등)이 열려 있거나 편집 중이면 손대지 않음(지금 웹앱 규칙 그대로) */
  window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || !(e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) return;
    if (U2.edit) return; const sh = document.getElementById('sheet'); if (sh && sh.classList.contains('on')) return;
    e.preventDefault(); e.stopImmediatePropagation(); const cur = document.getElementById('u2-find'); if (cur) (cur._close || (() => cur.remove()))(); else F.open();
  }, true);
})();
