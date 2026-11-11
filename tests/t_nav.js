/* 메뉴 틀을 지금 웹앱 탭과 맞춤(11/11 · nav1 새 탭 묶음 🛒 판매처·🔬 연구 · 탭 차례 = 일의 흐름) — 저장하지 않고 보이는 메뉴만
 * (0.4.7) nav1이 main에 들어옴(지금 웹앱 1.78.481 · 🧾 통합 장부 탭도) → 지금 웹앱의 실제 NAV_TABS로 시험 · 그 전 판(NAV_TABS 없음)이면 nav1 표를 흉내 냄 */
const { open, ok, done, nonU2Writes } = require('./lib');
const NAV1 = [['home', '홈'], ['purchase', '매입'], ['products', '상품'], ['channels', '판매처'], ['orders', '주문·매출'], ['search', '고객'], ['biz', '경영'], ['research', '연구'], ['market', '시장조사'], ['sellers', '판매자'], ['projects', '프로젝트']];
(async () => {
  console.log('[메뉴 틀 맞춤]');
  const t = await open({ q: '?p=home', settle: 2500 }); const p = t.p;
  const r0 = await p.evaluate(() => ({ lt: U2.legacyTabs().map((x) => x[0]), nav: U2.site.nav.map((n) => n.id), w: (window.__FSW || []).length, base: U2.BASE_TABS.slice() }));
  ok(r0.lt.length >= 9 && r0.lt.every((k, i) => r0.nav[i] === k), '지금 웹앱(main) 탭 차례 = 새 웹앱 메뉴 차례', r0.lt.join(','));
  ok(r0.nav.slice(-2).join() === 'settings,inbox', '⚙ 설정·📥 할 일은 메뉴 뒤에 그대로', r0.nav.slice(-3).join());
  /* 실제 NAV_TABS(1.78.481~) — 없으면 nav1 판 흉내(새 탭 둘 · 차례 바뀜) */
  const REAL = await p.evaluate(() => (typeof NAV_TABS !== 'undefined' && NAV_TABS && NAV_TABS.some((x) => x[0] === 'channels') ? NAV_TABS.map((x) => [x[0], x[1]]) : null));
  const T1 = REAL || NAV1; const NEW = T1.map((x) => x[0]).filter((k) => !r0.base.includes(k)); console.log('  · 탭 표: ' + (REAL ? '지금 웹앱 실제 NAV_TABS ' : 'nav1 흉내 ') + T1.map((x) => x[0]).join(',') + ' · 새 탭 ' + NEW.join(','));
  ok(!REAL || (NEW.includes('channels') && NEW.includes('research') && NEW.includes('ledger')), '지금 웹앱 1.78.481 nav1 새 탭(판매처·연구·통합 장부)을 실제 탭 표에서 읽음', NEW.join(','));
  const r1 = await p.evaluate((T) => { if (!(typeof NAV_TABS !== 'undefined' && NAV_TABS && NAV_TABS.some((x) => x[0] === 'channels'))) window.NAV_TABS = T; U2.site._navAuto = true; const ch = U2.syncNav(); U2.drawBar(); return { ch, nav: U2.site.nav.map((n) => n.id), tabs: [U2W.TABS.channels, U2W.TABS.research, U2W.TABS.ledger || null], links: [...document.querySelectorAll('.u2-nav a[data-pg]')].map((a) => a.dataset.pg), page: U2.defaultPage('research').widgets.main.props.ref, led: U2W.TABS.ledger ? U2.defaultPage('ledger').widgets.main : null, cat: U2.catalog ? 1 : 0 }; }, T1);
  ok(r1.nav.join() === T1.map((x) => x[0]).concat(['settings', 'inbox']).join(), '메뉴를 저장한 적 없으면 지금 웹앱 새 차례 그대로(' + T1.map((x) => x[1]).join('·') + ' + 설정·할 일)', r1.nav.join(','));
  if (REAL) ok(r1.tabs[2] && r1.tabs[2][0] === '🧾' && r1.led && r1.led.type === 'legacy.dock' && r1.led.props.scrs === 'ledger', "🧾 통합 장부(누르면 화면이 열리는 탭) 페이지 = 머리줄 + '통합 장부' 단추가 든 옛 화면 자리", JSON.stringify(r1.led));
  ok(r1.tabs[0] && r1.tabs[0][0] === '🛒' && r1.tabs[0][1] === '판매처' && r1.tabs[1][0] === '🔬' && r1.tabs[1][1] === '연구', '새 탭은 아이콘·이름과 함께 저절로(🛒 판매처 · 🔬 연구)', JSON.stringify(r1.tabs));
  ok(r1.links.includes('channels') && r1.links.includes('research') && r1.page === 'research', "머리줄 페이지 줄에 새 탭 페이지 · 그 페이지 기본 = '탭 전체' 위젯", r1.links.join(','));
  /* 관리자가 고쳐 저장한 메뉴는 차례를 안 바꾸고 새 탭만 옆 탭 뒤에 끼움 */
  const r2 = await p.evaluate((T) => { U2.site.nav = [{ id: 'orders', title: '주문', icon: '🧾' }, { id: 'home', title: '홈', icon: '🏠' }, { id: 'products', title: '상품', icon: '📚' }, { id: 'biz', title: '경영', icon: '💹' }, { id: 'mine1', title: '내 페이지', icon: '⭐' }]; U2.site._navAuto = false; U2.syncNav(); return U2.site.nav.map((n) => n.id + (n.auto ? '*' : '')); }, T1);
  ok(r2.join() === (REAL ? 'orders,home,products,ledger*,channels*,biz,research*,mine1' : 'orders,home,products,channels*,biz,research*,mine1'), '저장한 메뉴: 있던 차례 그대로 · 새로 생긴 탭만 앞 탭 뒤에 끼움 · 일부러 뺀 예전 탭은 안 넣음 · 내 페이지 그대로', r2.join(','));
  const again = await p.evaluate(() => { const a = U2.site.nav.length; U2.syncNav(); return U2.site.nav.length === a; }); ok(again, '여러 번 맞춰도 겹치지 않음');
  await p.evaluate(() => U2.go('channels')); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => U2.cur === 'channels' && !!document.querySelector('.u2-cell')), '새 탭 페이지로 가면 그려짐(지금 main 판엔 그 탭이 없어도 깨지지 않음)');
  if (REAL) { await p.evaluate(() => U2.go('ledger')); await p.waitForTimeout(1500);
    const lg = await p.evaluate(() => { const b = document.querySelector('.u2-dockcell [data-scr="ledger"]'); return { cur: U2.cur, btn: b ? b.textContent : null }; });
    ok(lg.cur === 'ledger' && /통합 장부/.test(lg.btn || ''), "🧾 통합 장부 페이지에 '통합 장부' 화면 단추(옛 화면 자리 — 누르면 이 칸 안에 열림)", JSON.stringify(lg)); }
  const w = await p.evaluate((n) => (window.__FSW || []).slice(n).filter((x) => /^ui2_site/.test(x.n)).length, r0.w);
  ok(w === 0 && (await nonU2Writes(p)).length === 0, '메뉴 맞추기는 아무것도 저장하지 않음(보이는 메뉴만)');
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '오류 0', errs.slice(0, 2).join(' / '));
  await t.close(); done('t_nav');
})();
