/* 리드나우 2 — 어댑터 T2(섹션 위젯)와 계약 검사 (설계안 4-2 · 단계 6)
 * T1 탭 전체·T3 홈 칸·T4 화면 열기·T5 기능 단추는 u2-loader.js · 여기는 T2: 탭 안 섹션 하나만 위젯으로
 *  - 지금 웹앱이 휴대폰 '섹션 고르기'에 쓰는 길을 그대로: S.secOnly(섹션)·S.ptOnly(상품 카드)·S.mkOnly(시장 카드)에 고른 것만 두고 그 탭 그리기 함수를 부름
 *  - 같은 탭 섹션 위젯이 한 페이지에 여럿이면 '한 번 그려 나눠 줌'(그리기 1번 — 단추에 걸린 동작이 노드와 함께 따라감)
 *  - 옛 코드가 자료가 바뀌었다고 하면(renderMain) 0.7초 모아 다시 그림 · 그리는 동안 S.tab을 잠깐 그 탭으로 했다가 되돌림
 * 계약 검사: u2-contract.json에 적은 옛 함수·값이 살아 있나(이름·인자 수) — 깨진 것은 그 종류 위젯만 안전 모드 */
(function () {
  'use strict';
  const U2 = (window.U2 = window.U2 || {});
  const A = (U2.adapters = { secs: new Set(), q: [], renders: 0 });
  const fnOf = (n) => (typeof window[n] === 'function' ? window[n] : null);
  A.RENDER = {
    home: (m) => fnOf('renderHome') && renderHome(m), orders: (m) => fnOf('renderOrders') && renderOrders(m), products: (m) => fnOf('renderProducts') && renderProducts(m),
    sellers: (m) => fnOf('renderSellers') && renderSellers(m), purchase: (m) => fnOf('renderPurchase') && renderPurchase(m), biz: (m) => fnOf('renderBiz') && renderBiz(m),
    market: (m) => fnOf('renderMarket') && renderMarket(m), projects: (m) => fnOf('renderProjects') && renderProjects(m),
    settings: (m) => { if (!fnOf('renderSettings')) return; try { if (fnOf('setUiEnter')) setUiEnter(); } catch (e) {} renderSettings(m); try { if (fnOf('setUiBind')) setUiBind(m); } catch (e) {} },
  };
  const ptIds = () => { try { return new Set(PT_SECS.map((x) => x[0])); } catch (e) { return new Set(); } };
  const mkIds = () => { try { return new Set(THIN_SEC.market.secs.map((x) => x[0])); } catch (e) { return new Set(); } };
  /* 한 탭을 '고른 섹션만'으로 그림 → 그 섹션 노드들을 돌려줌 */
  A.renderSecs = (tab, ids, mode) => {
    /* mode: 'only'(고른 것만 — 휴대폰 길) · 'full'(탭 전체를 그려 섹션만 떼어 냄) · 'whole'(고른 것만 그린 것 전부 = 휴대폰 화면 그대로) */
    const box = document.createElement('div'); box.className = 'u2-secbox'; box.style.display = 'none'; (document.getElementById('app') || document.body).appendChild(box);
    const keep = { tab: S.tab, secOnly: S.secOnly, ptOnly: S.ptOnly, mkOnly: S.mkOnly, limit: S.limit };
    const pt = ptIds(), mk = mkIds(); const set = new Set(ids); const full = mode === 'full'; let err = null;
    A.rendering = true;
    try { S.tab = tab; S.secOnly = full ? null : set; S.ptOnly = !full && tab === 'products' ? new Set(ids.filter((i) => pt.has(i))) : null; S.mkOnly = !full && tab === 'market' ? new Set(ids.filter((i) => mk.has(i))) : null; A.renders++; (A.RENDER[tab] || (() => { throw new Error('그리기 함수가 없는 탭: ' + tab); }))(box); }
    catch (e) { err = e; }
    finally { A.rendering = false; S.tab = keep.tab; S.secOnly = keep.secOnly; S.ptOnly = keep.ptOnly; S.mkOnly = keep.mkOnly; S.limit = keep.limit; }
    const out = {};
    if (mode === 'whole') { if (box.children.length && !err) { const w = document.createElement('div'); w.className = 'u2-seccards'; while (box.firstChild) w.appendChild(box.firstChild); out[ids[0]] = w; } box.remove(); return out; }
    ids.forEach((id) => { out[id] = box.querySelector(`details.sec[data-sec="${CSS.escape(id)}"]`); });
    /* 섹션 밖 카드(바로가기 등 — 지금 웹앱 THIN_X 고르기 표 그대로) */
    try { const X = typeof THIN_X !== 'undefined' ? THIN_X[tab] || [] : []; ids.forEach((id) => { if (out[id]) return; const q = (X.find((x) => x[0] === id) || [])[1]; if (!q) return; const c = [...box.children].find((n) => n.matches(q) || n.querySelector(q)); if (c) out[id] = c; }); } catch (e) {}
    box.remove(); return out;
  };
  /* 모아서 그림: 같은 틱에 놓인 섹션 위젯을 탭마다 한 번에 */
  const flush = () => {
    const q = A.q; A.q = []; A._pend = false; const byTab = new Map();
    q.forEach((it) => { if (!it.b.isConnected || it.dead) return; (byTab.get(it.tab) || byTab.set(it.tab, []).get(it.tab)).push(it); });
    byTab.forEach((items, tab) => {
      const ids = [...new Set(items.map((i) => i.id))]; const got = A.renderSecs(tab, ids, 'only');
      let miss = ids.filter((id) => !got[id]); if (miss.length) { const f = A.renderSecs(tab, miss, 'full'); miss.forEach((id) => { if (f[id]) got[id] = f[id]; }); } /* 고른 것만 그리기가 안 되는 탭(설정 등)은 탭 전체에서 떼어 냄 */
      miss = ids.filter((id) => !got[id]); miss.forEach((id) => { const w = A.renderSecs(tab, [id], 'whole'); if (w[id]) got[id] = w[id]; }); /* 카드형(매입·상품) — 휴대폰 화면 그대로 */
      items.forEach((it) => { const n = got[it.id]; if (n) { if (n.tagName === 'DETAILS') n.open = true; it.b.replaceChildren(n); got[it.id] = null; A.retry(it); } else it.b.innerHTML = `<div class="u2-empty">이 섹션은 지금 비어 있거나 이 기기에서 보이지 않음 (${U2.esc(it.id)})</div>`; });
    });
  };
  A.mountSec = (b, tab, id) => {
    b.classList.add('u2-lg'); b.innerHTML = '<div class="u2-empty">⏳ 그리는 중…</div>';
    const it = { b, tab, id, dead: false }; A.secs.add(it);
    const go = () => { A.q.push(it); if (!A._pend) { A._pend = true; queueMicrotask(flush); } };
    if (U2.legacy.shellDone) go(); else it.off = U2.on('legacyShell', () => !it.dead && go());
    it.redraw = go; return () => { it.dead = true; clearTimeout(it.rt); if (it.off) it.off(); A.secs.delete(it); };
  };
  /* 옛 코드가 다시 그리라고 하면(renderMain) — 0.7초 모아서, 화면에 있는 섹션 위젯만 */
  A.refresh = () => { if (!A.secs.size) return; clearTimeout(A._rt); A._rt = setTimeout(() => A.secs.forEach((it) => { if (!it.dead && it.b.isConnected && !it.b.contains(document.activeElement)) it.redraw(); }), 700); };
  /* 옛 코드는 자료를 다 받으면 'S.tab이 그 탭일 때만' 다시 그림(지금 웹앱 50곳) — 섹션 위젯은 다른 탭 페이지에 있으므로 못 받음
   * → ① 받은 자료 표시(주문·상품·판매자·매입·시장 지표·고객)가 바뀌면 섹션 위젯을 다시 그림(2초마다 값만 봄 · 가벼움)
   *   ② 그린 섹션에 '받는 중' 표시가 남아 있으면 1.5·3·6·12·24초 뒤 다시(5번까지) */
  const FLAGS = () => { try { return [S.ordersLoaded, S.prodLoaded, S.sellersLoaded, S.pmLoaded, S.pmatchLoaded, S.custLoaded, S.pur && S.pur.loaded, S.qnaAll && S.qnaAll.length, S.ver].join('|'); } catch (e) { return ''; } };
  let flag0 = null; setInterval(() => { if (!A.secs.size || document.hidden) return; const f = FLAGS(); if (flag0 !== null && f !== flag0) A.refresh(); flag0 = f; }, 2000);
  const LOADING = /받는 중|불러오는 중|기다리는 중/;
  A.retry = (it) => { if (it.dead || !it.b.isConnected) return; const busy = LOADING.test(it.b.textContent) || it.b.querySelector('.ldg, .wload'); if (!busy) { it.tries = 0; return; } it.tries = (it.tries || 0) + 1; if (it.tries > 5) return; clearTimeout(it.rt); it.rt = setTimeout(() => !it.dead && it.redraw(), 1500 * Math.pow(2, it.tries - 1)); };
  /* ── 계약 검사 ── */
  A.contract = null;
  A.check = async () => {
    let C = A.contract; if (!C) { try { C = A.contract = await (await fetch('u2-contract.json', { cache: 'no-cache' })).json(); } catch (e) { return (A.bad = ['계약 목록(u2-contract.json)을 받지 못함']); } }
    const bad = []; const look = (n) => { try { switch (n) { case 'S': return typeof S !== 'undefined' ? S : undefined; case 'FEAT': return typeof FEAT !== 'undefined' ? FEAT : undefined; case 'PG_SCR': return typeof PG_SCR !== 'undefined' ? PG_SCR : undefined; case 'WIDGETS': return typeof WIDGETS !== 'undefined' ? WIDGETS : undefined; case 'W_DESC': return typeof W_DESC !== 'undefined' ? W_DESC : undefined; case 'THIN_SEC': return typeof THIN_SEC !== 'undefined' ? THIN_SEC : undefined; case 'PT_SECS': return typeof PT_SECS !== 'undefined' ? PT_SECS : undefined; case 'THIN_DS': return typeof THIN_DS !== 'undefined' ? THIN_DS : undefined; case 'APP_VER': return typeof APP_VER !== 'undefined' ? APP_VER : undefined; case 'thinNeedOf': return typeof thinNeedOf !== 'undefined' ? thinNeedOf : undefined; case 'thinMB': return typeof thinMB !== 'undefined' ? thinMB : undefined; case 'deviceName': return typeof deviceName !== 'undefined' ? deviceName : undefined; case 'isAdminDevice': return typeof isAdminDevice !== 'undefined' ? isAdminDevice : undefined; case 'featIndex': return typeof featIndex !== 'undefined' ? featIndex : undefined; default: return window[n]; } } catch (e) { return undefined; } };
    (C.fns || []).forEach(([n, arity, kinds]) => { const f = look(n); if (typeof f !== 'function') bad.push({ n, why: '없음', kinds }); else if (arity != null && f.length !== arity) bad.push({ n, why: '인자 수 ' + f.length + '(기대 ' + arity + ')', kinds }); });
    (C.vals || []).forEach(([n, kinds]) => { if (look(n) === undefined) bad.push({ n, why: '없음', kinds }); });
    (C.ids || []).forEach((id) => { if (!document.getElementById(id) && !(id === 'main' && document.querySelector('.u2-cell #main'))) bad.push({ n: '#' + id, why: '화면 뼈대에 없음', kinds: ['legacy.tab'] }); });
    A.bad = bad; A.badKinds = new Set([].concat(...bad.map((b) => b.kinds || []))); if (bad.length) U2.emit('contractBad', bad); return bad;
  };
  A.kindOk = (type) => !(A.badKinds && A.badKinds.has(type));
})();
