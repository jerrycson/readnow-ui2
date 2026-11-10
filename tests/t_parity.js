/* 지금 웹앱 ↔ 리드나우 2 빠짐 대조 (정범님 11/10 '리드나우2로 옮길 때 기능·정보가 빠지면 곤란해')
 * 지금 웹앱에 새 탭·칸·홈 칸·화면·휴대폰 섹션이 생겼는데 새 웹앱 서랍(위젯 목록)에 없으면 실패 — 목록을 손으로 고치지 않아도 되게 '지금 웹앱 화면에서' 뽑아 견줌
 * ① 탭: 지금 웹앱 아래 탭 단추 = 새 웹앱 탭 위젯
 * ② 탭 첫 화면 칸: 탭마다(고객·상품·판매자·주문·매입·경영·시장·프로젝트) 지금 웹앱 ✎ 첫 화면 편집 목록(tobBlocks)의 줄 하나하나가
 *    새 웹앱 위젯 하나로 실제로 그려지는지(섹션 위젯을 하나씩 그려 나온 칸 = 덮은 칸) — 상품 탭 📥 등록 줄 포함
 * ③ 홈 칸(WIDGETS) · 상세 화면(PG_SCR) · 휴대폰 섹션 고르기(THIN_SEC·PT_SECS) · 🔍 기능 찾기(FEAT) 하나도 빠짐없이 목록에
 * ④ 새로 생긴 칸(시험용으로 끼워 넣음)도 탭을 한 번 그리면 저절로 서랍에 들어가고 그 칸 위젯이 그 칸을 그림 */
const { open, seed, ok, done, nonU2Writes } = require('./lib');
const TABS = ['search', 'products', 'sellers', 'orders', 'purchase', 'biz', 'market', 'projects'];
(async () => {
  console.log('[빠짐 대조] 지금 웹앱 ↔ 리드나우 2');
  const t = await open({ settle: 3000, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); } }); const p = t.p;
  await seed(p); await p.waitForFunction(() => S.pur && S.pur.loaded && S.ordersLoaded, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2500);
  /* ① 탭 */
  const tabs = await p.evaluate(() => { const legacy = [...document.querySelectorAll('#tabs [data-tab]')].map((b) => b.dataset.tab); const have = Object.keys(U2W.TABS); return { legacy, miss: legacy.filter((k) => !have.includes(k)) }; });
  ok(tabs.legacy.length >= 9 && !tabs.miss.length, '① 지금 웹앱 탭 단추가 모두 새 웹앱 탭 위젯으로', tabs.legacy.length + '개 · 빠짐 ' + JSON.stringify(tabs.miss));
  /* 탭마다 새 웹앱 페이지로 가서 옛 탭을 한 번 그림(서랍이 화면의 칸을 기억) */
  for (const tab of TABS) { await p.evaluate((tab) => U2.go(U2.pageForTab(tab) || tab), tab); await p.waitForTimeout(2600); }
  /* ② 탭 첫 화면 칸 */
  const r = await p.evaluate(async (TABS) => { const A = U2.adapters; U2.catalog.at = 0; U2.catalog.build(); const out = {};
    const keysOf = (n) => { if (!n) return []; if (n.matches && n.matches('details.sec[data-sec]')) return ['sec:' + n.dataset.sec]; const w = document.createElement('div'); w.style.cssText = 'position:absolute;left:-99999px;top:0;width:1200px;visibility:hidden'; document.body.appendChild(w); if (n.classList.contains('u2-seccards')) [...n.children].forEach((c) => w.appendChild(c.cloneNode(true))); else w.appendChild(n.cloneNode(true)); const ks = tobBlocks(w).map((b) => b.k); w.remove(); return ks; }; /* 화면에 붙여야 함(떨어진 노드는 모두 '숨은 것'으로 보여 앞 칸에 붙음) */
    for (const tab of TABS) {
      const box = document.createElement('div'); box.style.cssText = 'position:absolute;left:-99999px;top:0;width:1200px;visibility:hidden'; document.body.appendChild(box); const keep = { tab: S.tab, a: S.secOnly, b: S.ptOnly, c: S.mkOnly };
      S.tab = tab; S.secOnly = null; S.ptOnly = null; S.mkOnly = null; try { A.RENDER[tab](box); } catch (e) {} S.tab = keep.tab; S.secOnly = keep.a; S.ptOnly = keep.b; S.mkOnly = keep.c;
      const full = tobBlocks(box).filter((b) => !/^w:/.test(b.k) && !/#\d+$/.test(b.k)).map((b) => [b.k, tobLabel(b.el)]); box.remove();
      const items = U2.catalog.get().filter((i) => i.kind === 'sec' && i.tab === tab); const cov = {};
      for (const it of items) { const g = A.resolve(tab, [it.key]); keysOf(g[it.key]).forEach((k) => (cov[k] = cov[k] || []).push(it.key)); }
      out[tab] = { n: full.length, miss: full.filter(([k]) => !cov[k]).map(([k, l]) => k + ' ' + l.slice(0, 30)), blk: items.filter((i) => i.blk).length };
    }
    return out; }, TABS);
  for (const tab of TABS) ok(r[tab].n > 0 && !r[tab].miss.length, `② ${tab} 탭 첫 화면 칸 ${r[tab].n}줄이 모두 새 웹앱 위젯으로 그려짐`, '🧱 칸 위젯 ' + r[tab].blk + ' · 빠짐 ' + JSON.stringify(r[tab].miss));
  const reg = await p.evaluate(() => { const it = U2.catalog.get().find((i) => i.kind === 'sec' && i.tab === 'products' && /등록/.test(i.title) && /^(pt_reg|#p_reg)$/.test(i.key)); if (!it) return null; const g = U2.adapters.resolve('products', [it.key]); const n = g[it.key]; return { key: it.key, ok: !!n && !!n.querySelector('#reg_open') }; });
  ok(reg && reg.ok, '② 상품 탭 📥 등록 줄이 새 웹앱 위젯으로 있고 등록 단추(#reg_open)가 그려짐', JSON.stringify(reg));
  /* (11/10) 상품 탭 가격 감시 칸 — 지금 웹앱 예전 열쇠는 제목에 엔진 상태 글(판정 중·A단계/판정 쉼/전체 정지)이 섞여 바뀜 → 새 웹앱은 고정 열쇠 #p_watch 하나로 · 예전 열쇠로 넣은 🧱 칸도 그려짐 */
  const pw = await p.evaluate(() => { const A = U2.adapters; const ks = ['b:가격감시판정엔진판정중A단계', 'b:가격감시판정엔진엔진판정쉼확', 'b:가격감시판정엔진전체정지판정', '#p_watch'].map(A.blkKey);
    const its = U2.catalog.get().filter((i) => i.kind === 'sec' && i.tab === 'products' && A.blkKey(i.key) === '#p_watch'); const old = A.resolve('products', ['b:가격감시판정엔진엔진판정쉼확'])['b:가격감시판정엔진엔진판정쉼확'];
    const sec = U2.catalog.get().some((i) => i.kind === 'sec' && i.tab === 'products' && i.key === 'pt_price'); /* 섹션 위젯(pt_price)이 그 칸을 그리면 🧱는 겹쳐 넣지 않음 */
    return { same: ks.every((k) => k === '#p_watch'), n: its.length, key: its[0] && its[0].key, sec, old: !!old && /가격 감시/.test(old.textContent) }; });
  ok(pw.same && (pw.n === 1 ? pw.key === '#p_watch' : pw.n === 0 && pw.sec) && pw.old, '② 상품 탭 가격 감시 칸 = 서랍에 하나(#p_watch 또는 섹션 위젯 · 엔진 상태가 바뀌어도 겹쳐 쌓이지 않음) · 예전 열쇠로 넣은 칸도 그려짐', JSON.stringify(pw));
  /* ③ 홈 칸·화면·휴대폰 섹션·기능 찾기 */
  const st = await p.evaluate(() => { const C = U2.catalog.get(); const has = (kind, key) => C.some((i) => i.kind === kind && i.key === key);
    const home = Object.keys(WIDGETS).filter((k) => !has('home', k)); const scr = PG_SCR.filter((r) => typeof window[r[3]] === 'function' && !has('screen', r[0])).map((r) => r[0]);
    const secs = [].concat(...Object.entries(THIN_SEC).map(([tab, T]) => (T.secs || []).map((x) => x[0]))).concat(PT_SECS.map((x) => x[0])).filter((id) => id !== 'all' && !has('sec', id));
    const words = C.map((i) => (i.title + ' ' + (i.words || ''))).join(' '); const feat = (typeof featIndex === 'function' ? featIndex() : FEAT).filter((f) => !words.includes(String(f.t).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 20))).map((f) => f.t).slice(0, 10);
    return { home, scr, secs, feat, nH: Object.keys(WIDGETS).length, nS: PG_SCR.length, nF: (typeof featIndex === 'function' ? featIndex() : FEAT).length }; });
  ok(!st.home.length, '③ 홈 칸 ' + st.nH + '개 모두 새 웹앱 홈 칸 위젯으로', JSON.stringify(st.home));
  ok(!st.scr.length, '③ 상세 화면 ' + st.nS + '개 모두 새 웹앱 화면 위젯으로', JSON.stringify(st.scr));
  ok(!st.secs.length, '③ 휴대폰 섹션 고르기 항목 모두 새 웹앱 섹션 위젯으로', JSON.stringify(st.secs));
  ok(!st.feat.length, '③ 🔍 기능 찾기 ' + st.nF + '개 모두 새 웹앱 서랍에서 찾힘(위젯 이름·찾을 낱말)', JSON.stringify(st.feat));
  /* ④ 새로 생긴 칸 — 지금 웹앱 상품 탭에 시험용 카드를 끼워 넣고 그 탭을 한 번 그리면 서랍에 🧱로 · 그 위젯이 그 카드를 그림 */
  const nw = await p.evaluate(async () => { const o = window.renderProducts; window.renderProducts = function (m) { const r = o.apply(this, arguments); try { m.insertAdjacentHTML('beforeend', '<div class="card" id="zz_newcard"><h3>시험용 새 카드</h3><span>진행 중 <b>3</b>개</span></div>'); } catch (e) {} return r; };
    try { await U2.go('home'); await new Promise((r) => setTimeout(r, 400)); await U2.go(U2.pageForTab('products') || 'products'); await new Promise((r) => setTimeout(r, 2600)); U2.catalog.at = 0; const it = U2.catalog.build().find((i) => i.kind === 'sec' && i.key === '#zz_newcard'); const g = it ? U2.adapters.resolve('products', [it.key]) : {}; return { it: it ? it.title + ' ' + it.icon : null, drawn: !!(g['#zz_newcard'] && g['#zz_newcard'].querySelector('#zz_newcard')) }; }
    finally { window.renderProducts = o; } });
  ok(nw.it && nw.drawn, '④ 지금 웹앱에 새 칸이 생기면 서랍에 저절로 들어가고 그 위젯이 그 칸을 그림', JSON.stringify(nw));
  const w = await nonU2Writes(p); ok(!w.length, 'ui2_ 밖 쓰기 0', JSON.stringify(w.slice(0, 5)));
  const errs = t.errs.filter((e) => !/js-profiling|리드나우 2 시범 중 — 읽기만/.test(e)); /* 옛 코드 뒤쪽 쓰기를 쓰기 막이가 막은 것은 정상(읽기만) */  ok(!errs.length, '오류 없음', JSON.stringify(errs.slice(0, 5)));
  await t.close(); done('t_parity');
})();
