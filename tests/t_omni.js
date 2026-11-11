/* 리드나우 2 0.4.12 — 🛒 통합 판매처(통합 솔루션 · 약속 50 '모든 화면 2번 누름 안')
 *  ① 🛒 판매처 상황판: 네 판매처(알라딘·예스24·네이버·우리숍) 한 줄씩 · 숫자 = 지금 웹앱 통합 장부 셈 그대로 · 어긋남은 빨강 · 칸 한 번 누름 = 그 일 화면(🛠 처리할 일 · 📋 주문 모음 그 판매처 · 🚚 오늘 출고 그 판매처 · 판매처 운영 화면)
 *  ② 🔍 상품 하나 · 모든 판매처: 찾기(제목·SKU) → 카드 = 네 판매처 값·재고·판매중/중지 · 내릴 일 빨강 · '🧾 통합 장부에서 이 책'·'열기 ›' 한 번에 · 고른 책은 rn2- 열쇠
 *  ③ 🛒 판매처 페이지 기본 = 머리줄 + 상황판 + 상품 카드 + 지금 웹앱 판매처 탭 그대로 · 🛒 통합 판매처 견본
 *  ④ 쓰기 0(ui2_* 밖) · 브라우저 팝업 0 · 휴대폰 390 가로 밀림 없음
 *  네이버·우리숍 매물은 지금 웹앱 어댑터 자리(LED_LST_AD · LED_ORD_AD)에 시험 매물·주문을 넣어 흉내 — 지금 웹앱 셈(ledBuild·mcPlan)은 그대로 */
const { open, ok, done, nonU2Writes, seed } = require('./lib');
const SHOT = process.env.U2_SHOT_DIR || '';
(async () => {
  console.log('[0.4.12 🛒 통합 판매처 — 판매처 상황판 · 상품 하나 · 모든 판매처]');
  const t = await open({ q: '?p=inbox', settle: 2500 }); const p = t.p;
  await seed(p, {});
  await p.waitForFunction(() => { try { return S.prodLoaded && typeof ledNow === 'function'; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {});
  /* 시험 매물: 장부 첫 두 책 — 네이버에도 판매중(그중 하나는 네이버에서 팔림 → 알라딘·네이버 내릴 일) · 우리숍 판매중 */
  const pick = await p.evaluate(() => { S._led = null; const R = ledNow().rows.filter((r) => r.ch.aladin && r.ch.aladin.live && r.ch.aladin.id && r.title).slice(0, 2); if (R.length < 2) return null;
    const [a, b] = R; const now = new Date().toISOString();
    LED_LST_AD.push(() => [{ ch: 'naver', no: 'NV1', sku: a.sku || null, lid: a.ch.aladin.id, live: true, qty: 1, price: (a.ch.aladin.price || 10000) + 500, st: '판매중', title: a.title }, { ch: 'shop', no: 'SH1', sku: b.sku || null, lid: b.ch.aladin.id, live: true, qty: 1, price: b.ch.aladin.price || 9000, st: '판매중', title: b.title }]);
    LED_ORD_AD.push(() => [{ ch: 'naver', no: 'NVO1', at: now, amt: 12000, lines: [{ lid: a.ch.aladin.id, sku: a.sku || null, qty: 1, amt: 12000, t: a.title }], st: 'open' }]);
    S.nvVer = (S.nvVer || 0) + 1; S._led = null; S._ledO = null; return { a: { sku: a.sku, key: a.key, title: a.title, id: a.ch.aladin.id }, b: { sku: b.sku, key: b.key } }; });
  if (!pick) { ok(false, '시험 자료 없음'); done('t_omni'); process.exit(1); }
  ok(!!pick, '시험 자료: 통합 장부에 알라딘 판매중 책 2권(네이버·우리숍 시험 매물을 어댑터 자리에)', JSON.stringify(pick).slice(0, 160));
  /* ③ 판매처 페이지 기본 배치 */
  await p.evaluate(() => { try { localStorage.removeItem('rn2-prodch:channels:pc'); } catch (e) {} });
  await p.evaluate(() => U2.go('channels')); await p.waitForTimeout(1500);
  const pg = await p.evaluate(() => ({ cur: U2.cur, types: [...document.querySelectorAll('#u2-page .u2-cell')].map((c) => c.dataset.type), np: !!document.querySelector('.u2-cell #main [data-navpage="channels"]') }));
  ok(pg.cur === 'channels' && pg.types.indexOf('chboard') >= 0 && pg.types.indexOf('prodch') >= 0 && pg.types.indexOf('legacy.tab') >= 0, "🛒 판매처 페이지 기본 = 머리줄 + 🛒 상황판 + 🔍 상품 카드 + 지금 웹앱 판매처 탭(그대로)", JSON.stringify(pg));
  ok(pg.np, '지금 웹앱 판매처 탭(묶음 카드)이 그대로 함께 보임');
  /* ① 상황판 */
  const cb = await p.evaluate(() => { const c = U2.view.cell('cb'); const R = [...c.querySelectorAll('[data-ch]')].map((r) => ({ k: r.dataset.ch, n: Object.fromEntries([...r.querySelectorAll('[data-cb]')].map((x) => [x.dataset.cb, (x.querySelector('b') || {}).textContent])), txt: r.textContent.replace(/\s+/g, ' ').trim(), hot: [...r.querySelectorAll('.u2-hot')].map((x) => x.dataset.cb) }));
    const V = ledNow(); const T = ledTodoNow(); return { R, live: V.sum.aladin.live, todoAl: T.filter((x) => x.acts.some((a) => a.ch === 'aladin')).length, todoNv: T.filter((x) => x.acts.some((a) => a.ch === 'naver')).length, open: ledOrdRows().filter((o) => o.ch === 'naver' && o.st === 'open').length }; });
  ok(cb.R.map((r) => r.k).join(',') === 'aladin,yes24,naver,shop', '판매처 네 줄 — 알라딘·예스24·네이버·우리숍 차례', cb.R.map((r) => r.k).join(','));
  const al = cb.R.find((r) => r.k === 'aladin') || {}; const nv = cb.R.find((r) => r.k === 'naver') || {};
  ok(al.n && al.n.live === cb.live.toLocaleString(), '알라딘 판매중 = 지금 웹앱 장부 셈(sum.aladin.live)', al.txt + ' / ' + cb.live);
  ok(cb.todoAl >= 1 && cb.todoNv >= 1 && al.hot.indexOf('todo') >= 0 && nv.hot.indexOf('todo') >= 0, '네이버에서 팔린 책 → 알라딘·네이버 🔻 재고 어긋남이 빨강(지금 웹앱 🛠 처리할 일 셈 그대로)', JSON.stringify({ al: al.hot, nv: nv.hot, a: cb.todoAl, n: cb.todoNv }));
  ok(nv.n && nv.n.ord === '1' && cb.open === 1, '네이버 진행 주문 1 = 지금 웹앱 주문 모음 셈', nv.txt);
  if (SHOT) await p.screenshot({ path: SHOT + '/omni_pc_channels.png', fullPage: false });
  /* 한 번 누름 = 그 일 화면 */
  await p.evaluate(() => U2.view.cell('cb').querySelector('[data-ch="naver"] [data-cb="todo"]').click()); await p.waitForTimeout(1500);
  const g1 = await p.evaluate(() => ({ bt: S.detail && S.detail.bigTable, v: S._ledView, on: document.getElementById('sheet').classList.contains('on') }));
  ok(g1.on && g1.bt === 'ledger' && g1.v === 'todo', '🔻 재고 어긋남 한 번 누름 → 지금 웹앱 🧾 통합 장부 🛠 처리할 일', JSON.stringify(g1));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.evaluate(() => U2.view.cell('cb').querySelector('[data-ch="naver"] [data-cb="ord"]').click()); await p.waitForTimeout(1500);
  const g2 = await p.evaluate(() => ({ bt: S.detail && S.detail.bigTable, v: S._ledView, f: (S._bt_ledger || {}).f, rows: document.querySelectorAll('#sheet tbody tr').length, txt: (document.querySelector('#sheet') || {}).textContent.indexOf('NVO1') >= 0 }));
  ok(g2.bt === 'ledger' && g2.v === 'ord' && g2.f && g2.f.och === 'c_naver' && g2.txt, '진행 주문 한 번 누름 → 📋 주문 모음이 네이버·진행 중으로 걸러져 열림', JSON.stringify(g2));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.evaluate(() => U2.view.cell('cb').querySelector('[data-ch="yes24"] [data-cb="ch"]').click()); await p.waitForTimeout(1500);
  const g3 = await p.evaluate(() => ({ y: !!(S.detail && S.detail.y24ops) }));
  ok(g3.y, '판매처 이름 한 번 누름 → 그 판매처 운영 화면(🟦 → 🧰 예스24 운영)', JSON.stringify(g3));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  /* ② 상품 하나 · 모든 판매처 */
  const pk0 = await p.evaluate(() => [...U2.view.cell('pc').querySelectorAll('[data-pk]')].map((x) => x.dataset.pk));
  ok(pk0.indexOf(pick.a.key) >= 0, "빈 찾기 칸이면 '🔻 판매처끼리 어긋난 책' 고르기 줄(빈 칸 없음)", pk0.slice(0, 4).join(','));
  await p.fill('.u2-cell[data-wid="pc"] input[type=search]', pick.a.sku || pick.a.title); await p.waitForTimeout(700);
  await p.evaluate((k) => U2.view.cell('pc').querySelector('[data-pk="' + CSS.escape(k) + '"]').click(), pick.a.key); await p.waitForTimeout(300);
  const cd = await p.evaluate(() => { const c = U2.view.cell('pc'); const cols = [...c.querySelectorAll('.u2-pcc')].map((x) => ({ k: x.dataset.ch, live: x.classList.contains('u2-pclive'), act: x.classList.contains('u2-pcact'), none: x.classList.contains('u2-pcnone'), txt: x.textContent.replace(/\s+/g, ' ').trim() })); return { cols, pd: !!c.querySelector('.u2-pcrp'), todo: !!c.querySelector('[data-pgo="todo"]'), kept: localStorage.getItem('rn2-prodch:channels:pc') }; });
  const C = Object.fromEntries(cd.cols.map((x) => [x.k, x]));
  ok(cd.cols.length === 4 && C.aladin.live && C.naver.live && C.aladin.act && C.naver.act, '카드 = 네 판매처 칸 · 알라딘·네이버 판매중 + 🔻 내릴 일 빨강', JSON.stringify(cd.cols).slice(0, 300));
  ok(C.yes24.none && /올라 있지 않음/.test(C.yes24.txt) && /값/.test(C.aladin.txt) && /재고/.test(C.aladin.txt), "예스24는 '올라 있지 않음'(Linnworks 'Not Linked'처럼) · 칸마다 값·재고", C.yes24.txt);
  ok(cd.pd && cd.todo, "판매처마다 값이 다르면 💱 값 차이 · 어긋나면 '🛠 처리할 일에서 고치기 ›'", JSON.stringify({ pd: cd.pd, todo: cd.todo }));
  ok(JSON.parse(cd.kept || 'null') === pick.a.key, '고른 책은 이 기기에 기억(rn2-prodch:<페이지>:<위젯>)', cd.kept);
  if (SHOT) await p.evaluate(() => U2.view.cell('pc').scrollIntoView()), await p.screenshot({ path: SHOT + '/omni_pc_card.png', fullPage: false });
  await p.evaluate(() => U2.view.cell('pc').querySelector('.u2-pcf [data-pgo="all"]').click()); await p.waitForTimeout(1500);
  const g4 = await p.evaluate(() => ({ bt: S.detail && S.detail.bigTable, v: S._ledView, q: (S._bt_ledger || {}).q }));
  ok(g4.bt === 'ledger' && g4.v === 'all' && g4.q === (pick.a.sku || pick.a.key), "'🧾 통합 장부에서 이 책' 한 번 → 장부가 그 책 찾기로", JSON.stringify(g4));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.evaluate(() => U2.view.cell('pc').querySelector('.u2-pcc[data-ch="aladin"] [data-pgo]').click()); await p.waitForTimeout(1500);
  const g5 = await p.evaluate(() => ({ on: document.getElementById('sheet').classList.contains('on'), d: Object.keys(S.detail || {}).join(',') }));
  ok(g5.on && g5.d.length > 0, "알라딘 칸 '열기 ›' 한 번 → 지금 웹앱 상품 상세", JSON.stringify(g5));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  /* 편집 중엔 눌러도 이동 없음 · 견본 */
  const tp = await p.evaluate(async () => { const pg = U2.TEMPLATES.omni.make('omt'); U2.pages.omt = pg; await U2.go('omt'); await new Promise((r) => setTimeout(r, 900)); return { t: Object.values(pg.widgets).map((w) => w.type), err: [...document.querySelectorAll('#u2-page .u2-cell')].filter((c) => /위젯 오류/.test(c.textContent)).length }; });
  ok(tp.t.indexOf('chboard') >= 0 && tp.t.indexOf('prodch') >= 0 && tp.t.indexOf('shipbar') >= 0 && tp.err === 0, '✏ 꾸미기 견본 🛒 통합 판매처 — 상황판·상품 카드·처리할 주문 줄·목록 보기 탭 · 오류 0', JSON.stringify(tp));
  /* ④ 쓰기·팝업 */
  const w = await nonU2Writes(p);
  ok(w.length === 0, '지금 웹앱 자료 쓰기 0(ui2_* 밖)', w.slice(0, 5).join(' '));
  ok(t.dialogs.length === 0, '브라우저 팝업 0', t.dialogs.join(' | '));
  ok(t.errs.filter((e) => /u2-omni|chboard|prodch/.test(e)).length === 0, '새 위젯 오류 0', t.errs.slice(0, 3).join(' | '));
  await t.close();
  /* 휴대폰 */
  const m = await open({ q: '?p=channels', vp: { width: 390, height: 844 }, touch: true, settle: 2500 }); const q = m.p;
  await seed(q, {}); await q.waitForFunction(() => { try { return S.prodLoaded; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {}); await q.waitForTimeout(1500);
  await q.evaluate(() => { U2.render({ reset: true }); }); await q.waitForTimeout(800);
  const ph = await q.evaluate(() => { const c = U2.view.cell('cb'); const pc = U2.view.cell('pc'); const r = c.getBoundingClientRect(); const ov = [c, pc].map((x) => { const b = x.querySelector(':scope > .u2-wf > .u2-b'); const i = b.firstElementChild; return i ? i.scrollWidth - i.clientWidth : 0; });
    return { sw: document.documentElement.scrollWidth, w: innerWidth, cw: Math.round(r.width), rows: c.querySelectorAll('[data-ch]').length, ov }; });
  ok(ph.sw <= ph.w + 1 && ph.rows === 4 && ph.ov.every((x) => x <= 2), '휴대폰 390: 상황판 네 줄 · 가로 밀림 없음 · 칸 안 가로 넘침 없음', JSON.stringify(ph));
  if (SHOT) await q.screenshot({ path: SHOT + '/omni_phone.png', fullPage: false });
  await m.close();
  done('t_omni');
})().catch((e) => { console.error(e); process.exit(1); });
