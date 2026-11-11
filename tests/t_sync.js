/* 페이지 맞춤 시험(정범님 11/05 '어느 페이지를 골라도 같은 등록 화면 · 맨 위가 가려짐')
 * 지금 웹앱과 같은 주소 공간이라 기기 저장소에 '하던 등록 화면(rn-reg-ui)'·'새로고침 전 자리(rn-place)'가 남은 채로 엶
 * ① 여는 동안 옛 등록 화면·옛 자리를 되살리지 않음(주소 ?p= 페이지가 보임)
 * ② 페이지 11개를 머리의 단추로 차례로 누르면 페이지마다 다른 화면(옛 탭 · 화면 그림 비교) · 옛 상세 층이 덮지 않음
 * ③ 사람이 연 등록 화면은 새 웹앱 머리 아래에서 시작(맨 위가 가려지지 않음) · 페이지를 누르면 닫히고 그 페이지로 · 뒤로 가기에 닫힌 층이 남지 않음
 * ④ 옛 코드가 탭을 바꿔 따라온 것은 연 층을 그대로 ⑤ 화면 폭이 바뀌어도 · 휴대폰 폭에서도 머리 아래 */
const crypto = require('crypto');
const { open, ok, done, chromium } = require('./lib');
const SEED = () => { try { localStorage.setItem('rn-reg-ui', JSON.stringify({ open: true, T: 'sel', sub: {}, y: 0, at: Date.now() })); localStorage.setItem('rn-lastver', '9.9.9'); localStorage.setItem('rn2-dock', JSON.stringify({ keep: 'close' })); /* 0.3.1 모습(페이지 바꾸면 옛 화면 닫기) 시험 — 기본 '두기'는 t_dual */ sessionStorage.setItem('rn-place', JSON.stringify({ at: Date.now(), ver: 'x', ui: { tab: 'purchase' }, y: 0, route: { n: 'openShip', a: [] }, stack: [], sy: 0 })); } catch (e) {} };
const state = (p) => p.evaluate(() => { const sh = document.getElementById('sheet'); const bar = document.getElementById('u2-bar'); const bb = bar.getBoundingClientRect().bottom; const x = Math.round(innerWidth / 2); const below = document.elementFromPoint(x, Math.min(innerHeight - 2, bb + 30)); let tab = null; try { tab = S.tab; } catch (e) {} return { on: !!(sh && sh.classList.contains('on')), cur: U2.cur, tab, want: U2.legacy.tabFor(U2.cur), barB: Math.round(bb), shTop: sh ? Math.round(sh.getBoundingClientRect().top) : null, belowIn: below ? (below.closest('#sheet') ? 'sheet' : below.closest('#u2-page, #u2-banners') ? 'page' /* 맨 위 시범 띠(0.4.2)도 새 웹앱 자리 */ : below.closest('#u2-bar') ? 'bar' : (below.id || below.tagName)) : null, sup: U2.legacy.suppressed.map((s) => s.n), mainIn: !!document.querySelector('.u2-cell #main'), txt: (document.getElementById('u2-page') || {}).innerText.slice(0, 400) }; });
const shot = async (p) => { const bb = await p.evaluate(() => Math.ceil(document.getElementById('u2-bar').getBoundingClientRect().bottom)); const vp = p.viewportSize(); const h = Math.max(50, Math.min(500, vp.height - bb - 10)); const buf = await p.screenshot({ clip: { x: 0, y: bb + 2, width: vp.width, height: h } }); return crypto.createHash('md5').update(buf).digest('hex'); };
(async () => {
  console.log('[페이지 맞춤] 옛 화면 기억이 남은 기기');
  const b = await chromium.launch();
  let t = await open({ browser: b, init: SEED, settle: 2500 }); let p = t.p;
  await p.waitForTimeout(2500); /* 옛 '하던 등록 다시 엶'은 화면 틀 0.9초 뒤 · 자리 되살리기는 기록을 읽은 뒤 */
  let s = await state(p);
  ok(!s.on && s.cur === 'home' && s.tab === 'home', '① 여는 동안 옛 등록 화면·옛 자리(매입 탭·출고 화면)를 되살리지 않음 — 주소 ?p=home 그대로', JSON.stringify({ on: s.on, cur: s.cur, tab: s.tab }));
  ok(s.sup.includes('openRegister') && s.sup.includes('placeRead'), '  되살리기를 건너뛴 기록이 남음', s.sup.join(','));
  ok(s.belowIn === 'page', '  머리 바로 아래는 새 웹앱 페이지(옛 층이 덮지 않음)', s.belowIn);
  const vb = await p.evaluate(() => { const v = document.querySelector('body > .verbar'); if (!v) return null; window.scrollTo(0, 600); const bar = document.getElementById('u2-bar'); const r = bar.getBoundingClientRect(); const e = document.elementFromPoint(20, r.top + 5); window.scrollTo(0, 0); return { pos: getComputedStyle(v).position, barTop: Math.round(r.top), onBar: !!(e && e.closest('#u2-bar')) }; });
  ok(vb && vb.pos !== 'sticky' && vb.onBar, "  지금 웹앱 '새 판으로 바뀜' 띠가 새 웹앱 머리를 덮지 않음(내리면 머리가 맨 위)", JSON.stringify(vb));
  /* ② 페이지 11개 */
  const ids = await p.evaluate(() => U2.site.nav.filter((n) => !n.hide).map((n) => n.id));
  const sig = {}, hashes = {}; let allOk = true; const bad = [];
  for (const id of ids) {
    await p.click('.u2-nav [data-pg="' + id + '"]'); await p.waitForTimeout(1100);
    s = await state(p); const good = !s.on && s.cur === id && (!s.want || s.tab === s.want) && s.belowIn === 'page';
    if (!good) { allOk = false; bad.push(id + ':' + JSON.stringify({ on: s.on, cur: s.cur, tab: s.tab, want: s.want, below: s.belowIn })); }
    sig[id] = (s.tab || '-') + '|' + s.txt.replace(/\d+/g, '#').slice(0, 200); hashes[id] = await shot(p);
  }
  ok(ids.length === 11, '  머리에 페이지 11개(홈·고객·상품·판매자·주문-매출·매입·경영·시장조사·프로젝트·설정·할 일)', ids.join(' '));
  ok(allOk, '② 페이지 단추마다 그 페이지 + 맞춤표의 옛 탭이 보이고 옛 층이 덮지 않음', bad.join(' / ') || '11개 모두');
  const nSig = new Set(Object.values(sig)).size, nPix = new Set(Object.values(hashes)).size;
  ok(nSig === ids.length, '  페이지마다 보이는 글이 다름', nSig + '/' + ids.length);
  ok(nPix === ids.length, '  페이지마다 화면 그림이 다름(머리 아래 화면을 찍어 비교)', nPix + '/' + ids.length);
  /* ③ 사람이 연 등록 화면 */
  await p.click('.u2-nav [data-pg="products"]'); await p.waitForTimeout(900);
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1200);
  s = await state(p);
  ok(s.on, '③ 사람이 누른 뒤에는 등록 화면이 그대로 열림');
  ok(s.shTop >= s.barB - 1 && s.belowIn === 'sheet', '  등록 화면 맨 위가 새 웹앱 머리 아래에서 시작(가려지지 않음)', '머리 아래 ' + s.barB + 'px · 층 위 ' + s.shTop + 'px');
  const topVis = await p.evaluate(() => { const sh = document.getElementById('sheet'); const f = sh.querySelector('*'); if (!f) return false; const r = f.getBoundingClientRect(); const e = document.elementFromPoint(Math.max(5, r.left + 5), Math.max(r.top + 2, 0)); return !!(e && sh.contains(e)); });
  ok(topVis, '  등록 화면 첫 줄을 누를 수 있음(머리가 덮지 않음)');
  await p.click('.u2-nav [data-pg="orders"]'); await p.waitForTimeout(1100);
  s = await state(p);
  ok(!s.on && s.cur === 'orders' && s.tab === 'orders' && s.belowIn === 'page', '  페이지 단추를 누르면 등록 화면을 닫고 그 페이지(주문·매출)로', JSON.stringify({ on: s.on, cur: s.cur, tab: s.tab }));
  await p.goBack(); await p.waitForTimeout(900); s = await state(p);
  ok(!s.on && s.cur === 'products', '  뒤로 가기 → 앞 페이지(상품) · 닫힌 등록 화면이 다시 나오지 않음', JSON.stringify({ on: s.on, cur: s.cur }));
  /* ④ 옛 코드가 탭을 바꿔 따라온 것 */
  await p.evaluate(() => { openRegister(); }); await p.waitForTimeout(700);
  await p.evaluate(() => { S.tab = 'sellers'; renderMain(); }); await p.waitForTimeout(1000); s = await state(p);
  ok(s.cur === 'sellers' && s.on, '④ 옛 코드가 탭을 바꾸면 새 웹앱 페이지가 따라가고, 옛 코드가 연 층은 그대로', JSON.stringify({ on: s.on, cur: s.cur }));
  /* ⑤ 화면 폭이 바뀜 */
  for (const w of [900, 600]) { await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(700); s = await state(p); ok(s.on && s.shTop >= s.barB - 1 && s.belowIn === 'sheet', '⑤ 폭 ' + w + 'px로 바꿔도 등록 화면은 머리 아래', '머리 ' + s.barB + ' · 층 ' + s.shTop); }
  /* ⑥ 🗓 전체 일정·진행 */
  await p.setViewportSize({ width: 1400, height: 900 }); await p.click('.u2-nav [data-pg="projects"]'); await p.waitForTimeout(1500);
  const mini = await p.evaluate(() => { const c = document.querySelector('.u2-cell[data-type="u2plan"]'); return c ? c.innerText : null; });
  ok(mini && /새 웹앱 일정 \d+%/.test(mini), '⑥ 🧪 프로젝트 페이지 맨 위에 🗓 새 웹앱 일정 한 줄(옛 탭은 그 아래 그대로)', (mini || '없음').replace(/\n/g, ' ').slice(0, 90));
  await p.click('.u2-cell[data-type="u2plan"] [data-plan]'); await p.waitForTimeout(800);
  const pl = await p.evaluate(() => { const rows = [...document.querySelectorAll('.u2-pl-tbl tbody tr')]; return { n: rows.length, ids: rows.map((r) => r.dataset.stage).join(','), bars: document.querySelectorAll('.u2-pl-tbl .u2-pl-bar > i').length, st: rows.map((r) => (r.querySelector('.u2-pl-st') || {}).textContent || '').join('|'), big: !!document.querySelector('.u2-pl-big > i') }; });
  ok(pl.n === 14 && pl.ids === '0,1,2,3,4,5,6,7,8,9,10,11,12,13' && pl.bars === 14 && pl.big, '  누르면 단계 0~13마다 진행 막대·예상·실제 시간 + 전체 막대', pl.n + '줄 · 막대 ' + pl.bars);
  ok(/끝/.test(pl.st) && /진행 중/.test(pl.st) && !/정범님 필요/.test(pl.st), '  단계 상태(끝·진행 중)가 보임 — 0.4.5부터 정범님 필요 단계 없음 · 0.4.6부터 단계 13도 진행 중(이전 장치 끝)', pl.st);
  await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((l) => l.remove()));
  await p.click('#u2-menubtn'); await p.waitForTimeout(400); await p.click('.u2-layer [data-m="plan"]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelectorAll('.u2-pl-tbl tbody tr').length === 14), '  ☰ 메뉴 → 🗓 전체 일정·진행에서도 열림');
  await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((l) => l.remove()));
  ok(t.dialogs.length === 0, '브라우저 팝업 0', t.dialogs.join(' | '));
  ok(t.errs.filter((e) => /PAGEERR/.test(e)).length === 0, '페이지 오류 0', t.errs.filter((e) => /PAGEERR/.test(e)).slice(0, 3).join(' | '));
  await t.close();
  /* 휴대폰 폭 */
  t = await open({ browser: b, init: SEED, settle: 2500, vp: { width: 390, height: 844 }, touch: true, ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36' }); p = t.p;
  await p.waitForTimeout(2500); s = await state(p);
  ok(!s.on && s.cur === 'home', '📱 휴대폰: 여는 동안 옛 등록 화면을 되살리지 않음', JSON.stringify({ on: s.on, cur: s.cur }));
  await p.tap('.u2-nav [data-pg="purchase"]'); await p.waitForTimeout(1100); s = await state(p);
  ok(!s.on && s.cur === 'purchase' && s.tab === 'purchase', '📱 휴대폰: 페이지 단추 → 그 페이지·옛 탭', JSON.stringify({ cur: s.cur, tab: s.tab }));
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1000); s = await state(p);
  ok(s.on && s.shTop >= s.barB - 1 && s.belowIn === 'sheet', '📱 휴대폰: 등록 화면이 머리 아래에서 시작', '머리 ' + s.barB + ' · 층 ' + s.shTop);
  await p.evaluate(() => document.querySelector('.u2-nav [data-pg="biz"]').scrollIntoView({ inline: 'center' }));
  await p.tap('.u2-nav [data-pg="biz"]'); await p.waitForTimeout(1100); s = await state(p);
  ok(!s.on && s.cur === 'biz' && s.tab === 'biz', '📱 휴대폰: 페이지 단추 → 등록 화면 닫고 경영', JSON.stringify({ on: s.on, cur: s.cur, tab: s.tab }));
  await t.close(); await b.close();
  done('페이지 맞춤');
})().catch((e) => { console.error(e); process.exitCode = 1; });
