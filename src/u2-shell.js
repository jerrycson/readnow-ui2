/* 리드나우 2 — 틀(머리줄·페이지·주소 길·메뉴·쓰기 허락·게시 기록·견본 배치·내보내기)
 * 배치 저장(정범님 Q4 ①·Q5 ①): 모든 기기 공용 배치 ui2_pages/<페이지>(관리자 기기만 게시) + 기기마다 개인 배치 ui2_prefs/<기기>(누구나)
 * 처음 모습(Q8 ①): 지금 웹앱과 똑같이 보이는 배치(탭 9개 = 페이지 9개 · 각 페이지 = 옛 머리줄 + 옛 탭 전체) · ②는 '견본 배치'로 고름
 * 주소 길: ?p=<페이지> · 뒤로 가기 상태 {u2:1} — 옛 화면(상세 층)의 뒤로 가기와 섞이지 않게 */
(function () {
  'use strict';
  const U2 = (window.U2 = window.U2 || {});
  const G = window.U2Grid, W = window.U2W, esc = (s) => U2.esc(s);
  const TABS = W.TABS;
  /* ── 기본 배치(Q8 ①) ── */
  U2.defaultSite = () => ({ ver: 1, rev: 0, nav: Object.entries(TABS).map(([id, [icon, title]]) => ({ id, title, icon })), theme: {}, writeOk: {}, lockAll: false });
  U2.defaultPage = (id) => {
    const t = TABS[id];
    if (t) return { id, title: t[1], icon: t[0], grid: { rowH: 16, half: false, compact: false }, rev: 0,
      widgets: { hdr: { type: 'legacy.header', props: {} }, main: { type: 'legacy.tab', props: { ref: id } } },
      layouts: { pc: [{ id: 'hdr', x: 0, y: 0, w: 24, h: 8 }, { id: 'main', x: 0, y: 8, w: 24, h: 40 }], tab: null, sm: null, phone: null } };
    return { id, title: id, icon: '📄', grid: { rowH: 16, half: false, compact: false }, rev: 0, widgets: {}, layouts: { pc: [], tab: null, sm: null, phone: null } };
  };
  /* ── 견본 배치(Q8 ② · 설계안 5-7 빈 페이지 견본) — 시험 자료는 '손님A'처럼 개인 정보 없음 ── */
  U2.TEMPLATES = {
    same: { name: '지금 웹앱과 똑같이(기본)', make: (id) => U2.defaultPage(id) },
    dash: { name: '대시보드형 견본', make: (id) => { const p = U2.defaultPage(id); const w = (k, type, props, x, y, ww, h) => { p.widgets[k] = { type, props: Object.assign(W.defaults(type), props) }; p.layouts.pc.push({ id: k, x, y, w: ww, h }); };
      p.widgets = {}; p.layouts = { pc: [], tab: null, sm: null, phone: null };
      w('t', 'heading', { text: '오늘 한눈에', size: 'xl' }, 0, 0, 16, 3); w('c', 'clock', { until: '14:00', label: '출고 마감까지' }, 16, 0, 8, 4);
      w('k1', 'kpi', { label: '오늘 주문', value: '12', prev: '9', unit: '건' }, 0, 4, 6, 5); w('k2', 'kpi', { label: '사람이 볼 것', value: '2', unit: '건', warnOver: '0', s_accent: 'red' }, 6, 4, 6, 5); w('k3', 'kpi', { label: '이번 달 매출', value: '3,450,000', unit: '원' }, 12, 4, 6, 5); w('k4', 'progress', { label: '오늘 출고', value: 5, max: 12 }, 18, 4, 6, 5);
      w('ch', 'chart', { kind: 'bar', data: '월:3, 화:5, 수:2, 목:6, 금:4', s_title: '이번 주 주문' }, 0, 9, 12, 12); w('tb', 'table', { data: '손님,권수,금액\n손님A,3,12000\n손님B,1,4500\n손님C,2,9000', s_title: '최근 주문(견본)' }, 12, 9, 12, 12);
      w('b1', 'cardbtn', { icon: '🚚', label: '오늘 출고', sub: '지금 웹앱 화면', act: 'screen', arg: 'ship' }, 0, 21, 6, 6); w('b2', 'cardbtn', { icon: '🧾', label: '주문·매출', act: 'page', arg: 'orders' }, 6, 21, 6, 6); w('b3', 'cardbtn', { icon: '📚', label: '상품', act: 'page', arg: 'products' }, 12, 21, 6, 6); w('m', 'memo', {}, 18, 21, 6, 6);
      return p; } },
    blank: { name: '빈 페이지', make: (id) => { const p = U2.defaultPage(id); p.widgets = {}; p.layouts = { pc: [], tab: null, sm: null, phone: null }; return p; } },
  };

  /* ── 상태 ── */
  U2.site = U2.ls.get('c:ui2_site/main', null) || U2.defaultSite();
  U2.pages = {}; U2.prefs = null; U2.cur = null; U2.view = null; U2.edit = null;
  U2.pageForTab = (tab) => { const n = (U2.site.nav || []).find((x) => x.id === tab); if (n) return n.id; for (const [id, p] of Object.entries(U2.pages)) if (Object.values(p.widgets || {}).some((w) => w.type === 'legacy.tab' && w.props && w.props.ref === tab)) return id; return null; };
  U2.permKey = (w) => { if (!w) return ''; const p = w.props || {}; if (w.type === 'legacy.tab') return 'tab:' + p.ref; if (w.type === 'legacy.feat') return 'feat:' + p.feat; if (w.type === 'legacy.screen') return 'screen:' + p.scr; if (w.type === 'legacy.homecard') return 'home:' + p.ref; if (w.type === 'legacy.header') return 'header'; return ''; };
  /* 개인 배치가 있으면 그것을(Q4 ①) */
  U2.effective = (id) => { const pub = U2.pages[id] || U2.defaultPage(id); const mine = U2.prefs && U2.prefs.pages && U2.prefs.pages[id]; return mine ? Object.assign({}, pub, { layouts: mine.layouts, widgets: mine.widgets, grid: mine.grid || pub.grid, _mine: true, _basedOn: mine.basedOn }) : pub; };
  U2.layoutFor = (pg, bp) => {
    const L0 = pg.layouts || {}; let list = bp.k === 'pc' ? U2.clone(L0.pc || []) : G.overlay((L0.pc || []).filter((i) => !(((pg.widgets || {})[i.id] || {}).hide || {})[bp.k]), bp, L0[bp.k]); /* 좁은 폭 = PC에서 흘림 + 따로 고친 위젯 덮어쓰기(Q6) */
    const ids = new Set(list.map((i) => i.id));
    Object.keys(pg.widgets || {}).forEach((id) => { if (ids.has(id)) return; const d = W.defs[pg.widgets[id].type] || {}; const w = Math.min(bp.cols, Math.max(1, Math.round((d.w || 6) * bp.cols / 24))); const sp = G.findSpace(list, w, d.h || 4, bp.cols); list.push({ id, x: sp.x, y: sp.y, w, h: d.h || 4 }); });
    list = list.filter((i) => pg.widgets[i.id] && !((pg.widgets[i.id].hide || {})[bp.k]));
    return list;
  };

  /* ── 위젯 칸 그리기 ── */
  const frameStyle = (p) => { const s = []; if (p.s_bg === 'none') s.push('background:transparent;box-shadow:none;border-color:transparent'); else if (p.s_bg) s.push('background:var(--' + p.s_bg + ')'); if (p.s_accent) s.push('border-left:4px solid var(--' + p.s_accent + ')'); if (p.s_radius !== '' && p.s_radius != null) s.push('border-radius:' + (+p.s_radius || 0) + 'px'); if (p.s_shadow !== '' && p.s_shadow != null) s.push('box-shadow:' + (+p.s_shadow ? 'var(--u2-sh' + p.s_shadow + ')' : 'none')); if (p.s_pad !== '' && p.s_pad != null) s.push('--u2-pad:' + (+p.s_pad || 0) + 'px'); return s.join(';'); };
  U2.mountCell = (c, wid, pg, edit) => {
    if (c._u2off) { try { c._u2off(); } catch (e) {} c._u2off = null; }
    const w = pg.widgets[wid]; const d = W.defs[w && w.type];
    const p0 = Object.assign(W.defaults(w && w.type), (w && w.props) || {}); const R = edit ? { p: p0, dyn: false } : U2.data.resolve(p0); const p = R.p; c._dyn = R.dyn; /* '=식'·{{식}} 풀기(단계 5) */
    c.innerHTML = ''; const f = document.createElement('div'); f.className = 'u2-wf' + (d && d.legacy ? ' u2-wf-lg' : ''); f.style.cssText = frameStyle(p);
    if (p.s_pat && p.s_pat !== 'none') { const bg = document.createElement('div'); bg.className = 'u2-wpat'; bg.style.background = U2.theme.pattern(p.s_pat); f.appendChild(bg); }
    if (p.s_title) { const t = document.createElement('div'); t.className = 'u2-wt'; t.textContent = p.s_title; f.appendChild(t); }
    const b = document.createElement('div'); b.className = d && d.legacy ? 'u2-lg' : 'u2-b'; f.appendChild(b); c.appendChild(f);
    c.dataset.type = (w && w.type) || ''; const pk = U2.permKey(w); if (pk) c.dataset.perm = pk; else delete c.dataset.perm;
    if (!d) { b.innerHTML = '<div class="u2-empty">모르는 위젯: ' + esc(w && w.type) + '</div>'; return; }
    if (p.guide && !edit) { const gb = document.createElement('button'); gb.type = 'button'; gb.className = 'u2-guide-btn'; gb.textContent = 'ⓘ'; gb.setAttribute('aria-label', '이 위젯 설명'); gb.onclick = () => { let g = f.querySelector('.u2-guide'); if (g) return g.remove(); g = document.createElement('div'); g.className = 'u2-guide'; g.textContent = p.guide; f.appendChild(g); }; f.appendChild(gb); } /* 📖 위젯마다 설명(E7) — 누를 때만(톡 누르기 툴팁 아님) */
    try { const off = d.render(b, p, { wid, page: pg.id, edit: !!edit, cell: c }); if (typeof off === 'function') c._u2off = off; else if (off && off.dyn) c._dyn = true; } catch (e) { b.innerHTML = '<div class="u2-empty">⚠ 위젯 오류: ' + esc(e.message) + '</div>'; console.error('[u2] 위젯', wid, e); }
  };
  /* 옛 기능 위젯을 누르면 그 위젯 종류를 쓰기 막이에 알림(허락 목록과 견줌) */
  document.addEventListener('pointerdown', (e) => { const c = e.target.closest && e.target.closest('.u2-cell[data-perm]'); if (c) U2.setCtx(c.dataset.perm); }, true);
  document.addEventListener('keydown', (e) => { const c = e.target.closest && e.target.closest('.u2-cell[data-perm]'); if (c) U2.setCtx(c.dataset.perm); }, true);

  /* ── 페이지 그리기 ── */
  U2.render = (opt) => {
    opt = opt || {}; const host = U2.$('#u2-page'); if (!host) return;
    if (U2.edit && !opt.fromEditor) return U2.edit.refresh();
    const pg = U2.effective(U2.cur); const bp = G.bpOf(host.clientWidth || innerWidth);
    if (!U2.view || opt.reset || U2.view._pg !== pg.id || U2.view._edit) { if (U2.view) U2.view.destroy(); U2.view = new G.View(host, { onNew: (c, it) => U2.mountCell(c, it.id, U2.effective(U2.cur), false), onGone: (c) => { if (c._u2off) try { c._u2off(); } catch (e) {} if (c._ro) c._ro.disconnect(); } }); U2.view._pg = pg.id; }
    const v = U2.view; v.setup(bp.cols, (pg.grid && pg.grid.rowH) || G.ROW_H, pg.grid && pg.grid.half); v._bp = bp.k;
    let items = U2.layoutFor(pg, bp).filter((i) => U2.data.visible(pg.widgets[i.id])); /* 보이기 조건(단계 5) */ if (pg.grid && pg.grid.compact) G.compact(items); v._items = items;
    v.place(items, 0); autoH(v, pg);
    document.title = (pg.title || '') + ' · 리드나우 2';
    U2.$$('.u2-nav [data-pg]').forEach((x) => x.classList.toggle('on', x.dataset.pg === U2.cur));
    const mine = U2.$('#u2-mine'); if (mine) mine.hidden = !pg._mine;
    if (U2._firstMs == null) U2._firstMs = Math.round(performance.now()); /* 첫 화면 시각(설계안 8-1) */
    U2.emit('rendered', { page: pg.id, bp: bp.k, n: items.length });
  };
  U2.curPage = () => (U2.cur ? U2.effective(U2.cur) : null);
  /* 다른 페이지를 화면 안 층(모달·서랍)에 — 행동 '모달로 열기'(Wix 라이트박스) */
  U2.miniPage = async (id, cls) => {
    const pg = U2.pages[id] || (U2.pages[id] = await U2.loadPage(id)); const eff = U2.effective(id);
    const L = W.layer(cls || 'u2-modal', (eff.icon || '') + ' ' + (eff.title || id), ''); const body = L.querySelector('.u2-lbody'); body.classList.remove('u2-txt');
    const v = new G.View(body, { onNew: (c, it) => U2.mountCell(c, it.id, eff, false), onGone: (c) => { if (c._u2off) try { c._u2off(); } catch (e) {} } });
    const bp = G.bpOf(body.clientWidth || 600); v.setup(bp.cols, (eff.grid && eff.grid.rowH) || G.ROW_H, eff.grid && eff.grid.half);
    v.place(U2.layoutFor(eff, bp).filter((i) => !(W.defs[(eff.widgets[i.id] || {}).type] || {}).legacy && U2.data.visible(eff.widgets[i.id])), 0);
    const mo = new MutationObserver(() => { if (!L.isConnected) { v.destroy(); mo.disconnect(); } }); mo.observe(L.parentNode || document.body, { childList: true });
    return L;
  };
  /* 내용 길이에 맞춰 늘어나는 위젯(옛 탭 전체 등) — 보기 모드에서만 높이를 맞추고 아래 위젯을 밂(저장 안 함) */
  function autoH(v, pg) {
    for (const it of v._items) {
      const w = pg.widgets[it.id]; const d = W.defs[w && w.type]; if (!d || !d.autoH) continue; const c = v.cell(it.id); if (!c || c._ro) continue;
      const fit = () => { if (U2.view !== v || !c.isConnected) return; const f = c.firstChild; if (!f) return; const need = Math.max(2, Math.ceil((f.scrollHeight + 2) / v.rowH)); const cur = v._items.find((i) => i.id === it.id); if (!cur || cur.h === need) return; cur.h = need; G.resolve(v._items, it.id); v.place(v._items, 0); };
      c.classList.add('u2-autoh'); try { c._ro = new ResizeObserver(() => { cancelAnimationFrame(c._raf); c._raf = requestAnimationFrame(fit); }); c._ro.observe(c.firstChild); } catch (e) {} fit();
    }
  }
  let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if (U2.edit) return U2.edit.refresh(); const host = U2.$('#u2-page'); if (U2.view && G.bpOf(host.clientWidth).k !== U2.view._bp) U2.render(); }, 150); });

  /* ── 페이지 오가기 ── */
  U2.go = async (id, o) => {
    o = o || {}; if (!id) return; if (U2.edit && !o.force) { U2.toast('편집 중 — 먼저 ◀ 보기로'); return; }
    U2.cur = id; if (!U2.pages[id]) { const pg = await U2.loadPage(id); if (U2.cur !== id) return; U2.pages[id] = pg; }
    const url = '?p=' + encodeURIComponent(id) + location.hash;
    try { if (o.replace) history.replaceState({ u2: 1, p: id }, '', url); else if (!o.pop) history.pushState({ u2: 1, p: id }, '', url); } catch (e) {}
    const r = (U2.ls.get('recent', []) || []).filter((x) => x !== id); r.unshift(id); U2.ls.set('recent', r.slice(0, 12));
    U2.render({ reset: true }); try { window.scrollTo(0, 0); } catch (e) {}
  };
  addEventListener('popstate', (e) => { const st = e.state; if (st && st.u2 && st.p && st.p !== U2.cur) { const sh = document.getElementById('sheet'); if (sh && sh.classList.contains('on')) return; U2.go(st.p, { pop: true, force: true }); } });

  /* ── 불러오기(읽기: 전체 설정 1 + 페이지 1 + 이 기기 1 = 3문서) ── */
  U2.loadPage = async (id) => (await U2.store.get('ui2_pages', id)) || U2.defaultPage(id);
  U2.loadAll = async () => {
    const s = await U2.store.get('ui2_site', 'main'); if (s) U2.site = Object.assign(U2.defaultSite(), s);
    U2.guard.writeOk = U2.site.writeOk || {}; U2.guard.lockAll = !!U2.site.lockAll;
    U2.prefs = (await U2.store.get('ui2_prefs', U2.devKey())) || null;
    const id = U2.cur || 'home'; U2.pages[id] = await U2.loadPage(id);
    U2.theme.init(U2.site); U2.drawBar(); if (!U2.edit) U2.render({ reset: true });
  };
  U2.devKey = () => U2.dev().replace(/[\/\s]/g, '-');

  /* ── 머리줄 ── */
  U2.drawBar = () => {
    const bar = U2.$('#u2-bar'); if (!bar) return;
    const mode = U2.guard.lockAll ? '🔒 모두 막음' : Object.values(U2.guard.writeOk || {}).some((x) => x && x.on) ? '🔓 일부 허락' : '🔒 읽기만';
    bar.innerHTML = `<div class="u2-barrow"><a class="u2-brand" href="?p=home" data-pg="home">리드나우 2 <small>시범 ${esc(U2.ver)}</small></a>
      <span class="u2-chip" id="u2-mine" hidden title="이 기기 개인 배치를 쓰는 중">📱 이 기기 배치</span>
      <button type="button" class="u2-chip" id="u2-mode" title="쓰기 허락 보기">${mode}</button><span class="u2-chip u2-warnchip" id="u2-both" hidden>⚠ 다른 리드나우 탭도 열려 있음(메모리 2배 — 하나만 여세요)</span>
      <span class="u2-sp"></span><button type="button" class="u2-btn" id="u2-editbtn">✏ 꾸미기</button><button type="button" class="u2-btn" id="u2-menubtn" aria-label="메뉴">☰</button></div>
      <nav class="u2-nav" aria-label="페이지">${(U2.site.nav || []).filter((n) => !n.hide).map((n) => `<a href="?p=${encodeURIComponent(n.id)}" data-pg="${esc(n.id)}" class="${n.id === U2.cur ? 'on' : ''}">${esc(n.icon || '')} ${esc(n.title)}</a>`).join('')}</nav>`;
    bar.querySelectorAll('[data-pg]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); U2.go(a.dataset.pg); }));
    U2.$('#u2-editbtn').onclick = () => U2.openEditor && U2.openEditor();
    U2.$('#u2-menubtn').onclick = () => U2.menu();
    U2.$('#u2-mode').onclick = () => U2.permScreen();
    if (U2._both) U2.$('#u2-both').hidden = false;
    const pg = U2.cur && U2.effective(U2.cur); U2.$('#u2-mine').hidden = !(pg && pg._mine);
  };
  U2.banner = (id, html, tone) => { let b = document.getElementById(id); if (!html) { if (b) b.remove(); return; } if (!b) { b = document.createElement('div'); b.id = id; b.className = 'u2-banner ' + (tone || ''); U2.$('#u2-banners').appendChild(b); } b.innerHTML = html; return b; };

  /* ── 화면 안 판(층) ── */
  U2.panel = (title, html, cls) => { const L = W.layer('u2-modal u2-panel ' + (cls || ''), title, ''); L.querySelector('.u2-lbody').classList.remove('u2-txt'); L.querySelector('.u2-lbody').innerHTML = html; return L; };
  U2.menu = () => {
    const adm = U2.isAdmin(); const pg = U2.effective(U2.cur);
    const L = U2.panel('메뉴', `<div class="u2-col">
      <div class="u2-sec"><b>테마(이 기기)</b><div class="u2-row">${Object.entries(U2.theme.THEMES).map(([k, t]) => `<button type="button" class="u2-btn ${U2.theme.cur === k ? 'u2-pri' : ''}" data-th="${k}">${esc(t.name)}</button>`).join('')}</div></div>
      ${adm ? `<div class="u2-sec"><b>공용 모양(관리자 · 모든 기기 기본)</b><div class="u2-row">
        <label class="u2-lab">강조 색 <input type="color" class="u2-in" data-st="--cloth" value="${esc((U2.site.theme.tokens || {})['--cloth'] || U2.theme.LIGHT['--cloth'])}"></label>
        <label class="u2-lab">둥근 정도(px) <input type="number" class="u2-in" data-sh="--u2-radius" min="0" max="24" value="${parseInt((U2.site.theme.shape || {})['--u2-radius'] || '10', 10)}"></label>
        <label class="u2-lab">글꼴 <select class="u2-in" data-font>${Object.entries(U2.theme.FONTS).map(([k, f]) => `<option value="${k}" ${U2.site.theme.font === k ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
        <label class="u2-lab">기본 테마 <select class="u2-in" data-def>${Object.entries(U2.theme.THEMES).map(([k, t]) => `<option value="${k}" ${U2.site.theme.def === k ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label></div>
        <button type="button" class="u2-btn u2-pri" data-m="savetheme">공용 모양 저장</button> <span class="u2-hint" data-contrast></span></div>` : ''}
      <div class="u2-sec"><b>⭐ 저장한 보기</b><div class="u2-row">${U2.data.views().map((v) => `<button type="button" class="u2-btn" data-view="${esc(v.name)}">${esc(v.name)} <small class="u2-sub">${esc(v.scope)}</small></button>`).join('') || '<span class="u2-sub">없음</span>'}</div>
        <div class="u2-row"><input class="u2-in" style="width:160px" data-vname placeholder="지금 보기 이름" aria-label="지금 보기 이름"><button type="button" class="u2-btn" data-m="vsave">이 기기에 저장</button>${adm ? '<button type="button" class="u2-btn" data-m="vsavepub">공용으로 저장</button>' : ''}</div></div>
      <button type="button" class="u2-btn" data-m="perm">🔒 쓰기 허락 (위젯마다 · 기본 모두 꺼짐)</button>
      <button type="button" class="u2-btn" data-m="mine">📱 이 기기 화면 꾸미기 (개인 배치)</button>
      ${pg._mine ? '<button type="button" class="u2-btn" data-m="unmine">↩ 이 페이지 개인 배치 끄고 공용으로</button>' : ''}
      <button type="button" class="u2-btn" data-m="export">⬇ 배치 내보내기(JSON 파일)</button>
      <label class="u2-btn u2-file">⬆ 배치 가져오기 <input type="file" accept="application/json" data-m="import" hidden></label>
      <button type="button" class="u2-btn" data-m="watch">🩺 충돌 감시 보기</button>
      <button type="button" class="u2-btn" data-m="track">🔁 따라잡기 표</button>
      <a class="u2-btn" href="${esc(U2.base)}">↩ 지금 웹앱으로 가기</a>
      <p class="u2-hint">이 기기: <b>${esc(U2.dev())}</b> · ${adm ? '관리자 기기(공용 배치 게시 가능)' : '관리자 기기 아님(개인 배치만)'} · 지금 웹앱 ${esc(U2.legacy.appVer || '불러오지 못함')} · 새 웹앱 ${esc(U2.ver)}</p></div>`);
    L.querySelectorAll('[data-th]').forEach((b) => (b.onclick = () => { U2.theme.choose(b.dataset.th); L.remove(); U2.render({ reset: true }); }));
    const m = (k, f) => { const b = L.querySelector('[data-m="' + k + '"]'); if (b) b[k === 'import' ? 'onchange' : 'onclick'] = (e) => { f(e); }; };
    const readT = () => { const th = U2.clone(U2.site.theme || {}); const c = L.querySelector('[data-st]'); if (!c) return th; th.tokens = Object.assign({}, th.tokens, { '--cloth': c.value }); th.shape = Object.assign({}, th.shape, { '--u2-radius': (+L.querySelector('[data-sh]').value || 0) + 'px' }); th.font = L.querySelector('[data-font]').value; th.def = L.querySelector('[data-def]').value; return th; };
    const prev = () => { const th = readT(); U2.theme.site = th; U2.theme.apply(U2.theme.cur); const r = U2.theme.contrast(th.tokens['--cloth'], U2.theme.LIGHT['--paper']); const o = L.querySelector('[data-contrast]'); if (o) o.textContent = '강조 색·흰 바탕 대비 ' + r.toFixed(2) + ':1' + (r < 4.5 ? ' ⚠ 4.5 아래 — 글자가 잘 안 보일 수 있음' : ' ✓'); };
    L.querySelectorAll('[data-st],[data-sh],[data-font],[data-def]').forEach((x) => x.addEventListener('input', prev));
    m('savetheme', (e) => U2.twice(e.currentTarget, '모든 기기 기본 모양 바꿈', async () => { U2.site.theme = readT(); await U2.store.set('ui2_site', 'main', { theme: U2.site.theme }, true); U2.toast('공용 모양 저장'); }));
    L.querySelectorAll('[data-view]').forEach((b) => (b.onclick = () => { L.remove(); U2.data.openView(b.dataset.view).catch((e) => U2.toast(e.message, 1)); }));
    const vs = (pub) => () => U2.data.saveView(L.querySelector('[data-vname]').value, pub).then((v) => { U2.toast('보기 저장: ' + v.name); L.remove(); }).catch((e) => U2.toast(e.message, 1));
    m('vsave', vs(false)); m('vsavepub', vs(true));
    m('perm', () => { L.remove(); U2.permScreen(); }); m('mine', () => { L.remove(); U2.openEditor('mine'); });
    m('unmine', (e) => U2.twice(e.currentTarget, '개인 배치 끔(공용 배치로)', async () => { delete U2.prefs.pages[U2.cur]; await U2.savePrefs(); L.remove(); U2.render({ reset: true }); U2.toast('공용 배치로 돌아감'); }));
    m('export', () => U2.exportJson()); m('import', (e) => { const f = e.target.files[0]; if (f) U2.importJson(f).then(() => L.remove()); });
    m('watch', () => { L.remove(); U2.watchScreen(); }); m('track', () => { L.remove(); U2.trackScreen(); });
  };
  U2.savePrefs = async () => { U2.prefs = U2.prefs || { pages: {} }; U2.prefs.at = U2.now(); U2.prefs.dev = U2.dev(); await U2.store.set('ui2_prefs', U2.devKey(), U2.prefs); };

  /* ── 쓰기 허락 화면(정범님 Q3: 처음엔 읽기만 → 위젯마다 정범님이 직접 골라 켬 · 기본 모두 꺼짐) ── */
  U2.permKeys = () => {
    const ks = new Map(); ks.set('header', '지금 웹앱 머리줄(찾기·설정 단추)');
    Object.entries(TABS).forEach(([k, v]) => ks.set('tab:' + k, '지금 웹앱 탭 — ' + v.join(' ')));
    Object.values(U2.pages).forEach((p) => Object.values(p.widgets || {}).forEach((w) => { const k = U2.permKey(w); if (k && !ks.has(k)) ks.set(k, (W.defs[w.type] || {}).name + ' — ' + k.split(':').slice(1).join(':')); }));
    Object.keys(U2.site.writeOk || {}).forEach((k) => { if (!ks.has(k)) ks.set(k, k); });
    return ks;
  };
  U2.permScreen = () => {
    const adm = U2.isAdmin(); const ok = U2.site.writeOk || {};
    const rows = [...U2.permKeys()].map(([k, name]) => { const o = ok[k]; return `<tr><td>${esc(name)}</td><td>${o && o.on ? `<b class="u2-t-red">켜짐</b><br><small>${esc(o.by || '')} · ${esc((o.at || '').slice(0, 16).replace('T', ' '))}</small>` : '<span class="u2-sub">꺼짐</span>'}</td><td><button type="button" class="u2-btn ${o && o.on ? '' : 'u2-pri'}" data-k="${esc(k)}" ${adm ? '' : 'disabled'}>${o && o.on ? '끄기' : '켜기'}</button></td></tr>`; }).join('');
    const L = U2.panel('🔒 쓰기 허락', `<p class="u2-hint">시범 동안 새 웹앱은 <b>읽기만</b> 합니다 — 주문·상품·가격을 바꾸는 단추는 막히고 '지금 웹앱에서' 안내가 나옵니다. 정범님이 아래에서 <b>위젯마다 직접 켠 것만</b> 실제 자료를 바꿀 수 있습니다(켠 기기·시각이 남고 언제든 끔). 새 웹앱 자기 배치(ui2_ 칸)는 늘 저장됩니다.</p>
      ${adm ? '' : '<p class="u2-banner u2-warn">이 기기는 관리자 기기가 아니라 볼 수만 있습니다.</p>'}
      <label class="u2-sw"><input type="checkbox" data-lockall ${U2.site.lockAll ? 'checked' : ''} ${adm ? '' : 'disabled'}><span></span>비상: 허락한 것까지 모두 막기</label>
      <div class="u2-tblw"><table class="u2-tbl u2-perm"><thead><tr><th>위젯</th><th>지금</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="u2-hint">막은 쓰기: 이 기기에서 ${U2.guard.blocked.length}번(내용 없이 칸 이름만 ui2_blocked에 기록)</p>`);
    L.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { const k = b.dataset.k; const on = !(ok[k] && ok[k].on); const run = async () => { const v = { on, by: U2.dev(), at: U2.now() }; U2.site.writeOk = Object.assign({}, U2.site.writeOk, { [k]: v }); U2.site.writeLog = (U2.site.writeLog || []).concat([Object.assign({ k }, v)]).slice(-50); U2.guard.writeOk = U2.site.writeOk; await U2.store.set('ui2_site', 'main', { writeOk: U2.site.writeOk, writeLog: U2.site.writeLog }, true); L.remove(); U2.drawBar(); U2.permScreen(); U2.toast(on ? '쓰기 켬: ' + k : '쓰기 끔: ' + k); }; if (on) U2.twice(b, '쓰기 켬 (' + k + ')', run); else run(); }));
    const la = L.querySelector('[data-lockall]'); if (la) la.onchange = async () => { U2.site.lockAll = la.checked; U2.guard.lockAll = la.checked; await U2.store.set('ui2_site', 'main', { lockAll: la.checked }, true); U2.drawBar(); U2.toast(la.checked ? '모두 막음' : '허락한 것은 다시 통과'); };
  };
  U2.watchScreen = () => { const r = U2.guard.report(); U2.panel('🩺 충돌 감시', `<div class="u2-tblw"><table class="u2-tbl"><tbody>${[['쓰는 기억(힙)', r.heapMB == null ? '이 브라우저는 못 잼' : r.heapMB + 'MB'], ['긴 멈춤(200ms 넘음)', r.longTasks], ['살아 있는 반복 타이머', r.intervals], ['겹친 id', r.dupIds], ['막은 쓰기', r.blockedWrites], ['rn2- 밖 새 기기 저장 열쇠', (r.newKeys || []).join(', ') || '없음'], ['불러오기 걸린 시간', (U2.legacy.loadMs || '-') + 'ms'], ['배치 읽은 문서', U2.stat.reads]].map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div><p class="u2-hint">5분마다 ui2_perf/기기_날짜 한 문서에 덮어 씀</p>`); };
  U2.trackScreen = async () => { let t = ''; try { const r = await fetch('TRACK.md', { cache: 'no-cache' }); t = r.ok ? await r.text() : ''; } catch (e) {} U2.panel('🔁 따라잡기 표', `<p class="u2-hint">지금 웹앱 판마다 새 웹앱에 반영할 것 — 7단계에서 저절로 채움</p><pre class="u2-pre">${esc(t || '표를 받지 못함')}</pre>`); };
  /* ── 내보내기/가져오기(E5 ★) — 브라우저 팝업 없이 내려받기 링크 ── */
  U2.exportJson = () => { const data = { kind: 'readnow-ui2-layout', ver: U2.ver, at: U2.now(), dev: U2.dev(), site: { nav: U2.site.nav, theme: U2.site.theme }, pages: U2.pages, prefs: U2.prefs }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })); a.download = 'readnow2-배치-' + U2.today() + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); U2.toast('배치 파일을 내려받음'); };
  U2.importJson = async (file) => { try { const d = JSON.parse(await file.text()); if (d.kind !== 'readnow-ui2-layout' || !d.pages) throw new Error('리드나우 2 배치 파일이 아님'); const id = U2.cur; const pg = d.pages[id]; if (!pg) throw new Error('이 페이지(' + id + ') 배치가 파일에 없음'); U2.openEditor(U2.isAdmin() ? 'pub' : 'mine', { load: pg, note: '가져온 파일' }); U2.toast('가져온 배치를 편집기에 열었습니다 — 게시해야 반영'); } catch (e) { U2.toast('가져오기 실패: ' + e.message, 1); } };

  /* ── 시작 ── */
  U2.boot = () => {
    document.body.classList.add('u2-body');
    const root = document.createElement('div'); root.className = 'u2-root'; root.id = 'u2';
    root.innerHTML = '<div class="u2-bar" id="u2-bar" role="banner"></div><div id="u2-banners"></div><div id="u2-page" class="u2-page" role="main"></div>';
    document.body.insertBefore(root, document.body.firstChild);
    U2.theme.init(U2.site);
    const q = new URLSearchParams(location.search); U2.cur = q.get('p') || 'home';
    U2.drawBar(); U2.pages[U2.cur] = U2.ls.get('c:ui2_pages/' + U2.cur, null) || U2.defaultPage(U2.cur);
    U2.prefs = U2.ls.get('c:ui2_prefs/' + U2.devKey(), null);
    try { history.replaceState({ u2: 1, p: U2.cur }, '', location.href); } catch (e) {}
    U2.render({ reset: true });
    U2.banner('u2-loading', '⏳ 지금 웹앱 기능을 불러오는 중…', 'u2-info');
    U2.on('safe', (s) => { U2.banner('u2-loading', ''); U2.banner('u2-safe', `⚠ <b>안전 모드</b> — 지금 웹앱 기능을 불러오지 못했습니다: ${esc(s.why)}<br>꾸미기 위젯은 그대로 쓰고, 기능은 <a href="${esc(U2.base)}">지금 웹앱에서 열기 ›</a>`, 'u2-warn'); U2.render({ reset: true }); });
    U2.on('legacyLoaded', () => { U2.banner('u2-loading', ''); U2.render({ reset: true }); setInterval(() => U2.legacy.checkNew(), U2.CFG.verCheckMin * 60e3); document.addEventListener('visibilitychange', () => { if (!document.hidden) U2.legacy.checkNew(); }); });
    U2.on('legacyShell', () => U2.render({ reset: true }));
    U2.on('auth', (u) => { if (u) U2.loadAll(); });
    U2.on('newVer', (v) => { const b = U2.banner('u2-newver', `🆕 ${v.app ? '지금 웹앱 새 판 ' + esc(v.app) : ''}${v.app && v.u2 ? ' · ' : ''}${v.u2 ? '새 웹앱 새 판 ' + esc(v.u2) : ''} — <button type="button" class="u2-btn u2-pri" data-re>눌러서 다시 열기</button>`, 'u2-info'); b.querySelector('[data-re]').onclick = () => location.reload(); });
    /* 두 웹앱을 함께 열면 알림(R3 ★) — 지금 웹앱은 손대지 않으므로, 새 웹앱끼리 + 지금 웹앱 서비스 워커 저장본 이름표로 짐작 */
    try { const bc = new BroadcastChannel('rn2-tabs'); bc.onmessage = (e) => { if (e.data && e.data.hi) { U2._tabs = (U2._tabs || 0) + 1; if (e.data.hi === 'ping') bc.postMessage({ hi: 'pong' }); } }; bc.postMessage({ hi: 'ping' }); } catch (e) {}
    U2.checkClassicOpen();
    try { if (navigator.serviceWorker && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {} /* 새 웹앱 전용 저장본(rn2-ui-v*) — 지금 웹앱 본문도 같은 sw.js를 부름 */
    U2.legacy.run();
  };
  /* 지금 웹앱 탭이 같은 기기에서 열려 있나: 지금 웹앱은 자기 서비스 워커를 쓰므로 그 워커에 매인 창(clients)을 알 수 없음 → navigator.locks 이름(지금 웹앱 대표 탭 정하기)이 있으면 그것으로 */
  U2.checkClassicOpen = async () => { try { if (!navigator.locks || !navigator.locks.query) return; const q = await navigator.locks.query(); const names = (q.held || []).concat(q.pending || []).map((l) => l.name); if (names.indexOf('rn-app-leader') >= 0) { U2._both = true; const b = U2.$('#u2-both'); if (b) b.hidden = false; } } catch (e) {} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', U2.boot); else U2.boot();
})();
