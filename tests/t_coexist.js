/* 조화 시험 H-06 떠 있는 것 겹침 · H-07 두 웹앱 함께 · H-08 단축키 · H-12 휴대폰 얇은 모드 — 설계안 8-2 */
const { open, openClassic, routeAll, seed, ok, done, nonU2Writes, chromium } = require('./lib');
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const fixedRects = () => [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.width < innerWidth * 0.9 && r.height < innerHeight * 0.9; }).map((e) => { const r = e.getBoundingClientRect(); return { n: (e.id || e.dataset.fake || e.className || e.tagName).toString().slice(0, 30), x: r.left, y: r.top, w: r.width, h: r.height, u2: !!e.closest('.u2-root') || /^u2-/.test(e.id) }; });
(async () => {
  console.log('[조화 H-06·H-07·H-08·H-12]');
  /* H-06 — 책방 친구(지금 웹앱 캐릭터)·토스트·떠 있는 단추가 서로 가리지 않음 */
  for (const vp of [{ width: 1400, height: 900 }, { width: 390, height: 800 }]) {
    const t = await open({ q: '?p=fl', vp, settle: 3500, init: () => { try { localStorage.setItem('rn-msc-inapp', '1'); } catch (e) {} } }); const p = t.p;
    await p.evaluate(() => { /* 지금 웹앱 떠 있는 것들을 그 CSS 그대로 띄움(가짜 자료에서는 저절로 안 뜨는 것: 책방 친구 캐릭터·말풍선 자리, 맨 위로, 그래프 스위치, 아래 띠) */
      document.body.insertAdjacentHTML('beforeend', '<button id="vzToggle">◐</button><button class="rn-top" style="opacity:1">↑</button><div class="slimbar" style="display:block">띠</div>'
        + '<div data-fake="친구" style="position:fixed;right:12px;bottom:calc(128px + env(safe-area-inset-bottom,0px));width:40px;height:40px"></div><div data-fake="친구2" style="position:fixed;right:18px;bottom:calc(92px + env(safe-area-inset-bottom,0px));width:28px;height:28px"></div><div data-fake="친구 말풍선" style="position:fixed;right:56px;bottom:calc(92px + env(safe-area-inset-bottom,0px));width:220px;height:60px"></div>'); });
    await p.evaluate(() => { U2.pages.fl = { id: 'fl', title: '떠 있는 것', grid: { rowH: 16 }, rev: 0, widgets: { f: { type: 'fab', props: { icon: '➕', label: '빠른 일' } } }, layouts: { pc: [{ id: 'f', x: 0, y: 0, w: 2, h: 3, float: true }] } }; U2.render({ reset: true }); U2.toast('시험 알림'); });
    await p.waitForTimeout(1500);
    const R = await p.evaluate(fixedRects); const fab = R.find((r) => /u2-fab/.test(r.n)); const others = R.filter((r) => r !== fab && !/u2-toast|u2-bar|u2-edtop/.test(r.n));
    const hit = fab ? others.filter((o) => fab.x < o.x + o.w && o.x < fab.x + fab.w && fab.y < o.y + o.h && o.y < fab.y + fab.h) : [];
    const toast = R.find((r) => r.n === 'u2-toast'); const thit = toast && fab ? (toast.x < fab.x + fab.w && fab.x < toast.x + toast.w && toast.y < fab.y + fab.h && fab.y < toast.y + toast.h) : false;
    ok(fab && hit.length === 0 && !thit, `H-06 ${vp.width}px: 떠 있는 단추가 책방 친구·지금 웹앱 떠 있는 것·토스트와 안 겹침`, hit.length ? '겹침: ' + hit.map((h) => h.n).join(', ') : '떠 있는 것 ' + R.length + '개(' + R.map((r) => r.n.split(' ')[0]).slice(0, 8).join(', ') + ')');
    await t.close();
  }
  /* H-07 — 같은 주소 공간(jerrycson.github.io)에서 지금 웹앱 탭과 새 웹앱 탭을 함께 */
  {
    const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' }); await routeAll(ctx);
    const c = await ctx.newPage(); await c.addInitScript(() => { window.__ck = []; const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (this === window.localStorage) window.__ck.push(k); return o.apply(this, arguments); }; }); await c.goto('https://jerrycson.github.io/readnow-scripts/app/index.html'); await c.waitForTimeout(4000);
    const keys0 = await c.evaluate(() => Object.keys(localStorage).sort());
    const u = await ctx.newPage(); const uerr = []; u.on('pageerror', (e) => uerr.push(e.message));
    await u.goto('https://jerrycson.github.io/readnow-ui2/index.html?p=home'); await u.waitForFunction(() => window.U2 && U2.legacy.ready && U2.legacy.shellDone, null, { timeout: 60000 }).catch(() => {}); await u.waitForTimeout(2500);
    const us = await u.evaluate(() => ({ both: !document.getElementById('u2-both').hidden, ready: U2.legacy.ready, main: !!document.querySelector('.u2-cell #main'), newKeys: U2.guard.stats.newKeys, writes: (window.__FSW || []).filter((w) => !/^ui2_/.test(w.n)).length }));
    const cs = await c.evaluate(() => ({ ok: !!document.getElementById('main') && !!S.user, tab: S.tab }));
    const keys1 = await c.evaluate(() => Object.keys(localStorage).sort()); const byClassic = await c.evaluate(() => window.__ck); const added = keys1.filter((k) => !keys0.includes(k) && !byClassic.includes(k));
    ok(us.ready && us.main && cs.ok, 'H-07 같은 기기·같은 주소 공간에서 두 웹앱이 함께 열림(둘 다 정상)', JSON.stringify({ 새: us.main, 지금: cs.ok }));
    ok(us.both, "H-07 새 웹앱 머리줄에 '다른 리드나우 탭도 열려 있음(메모리 2배)' 알림(지금 웹앱 대표 탭 잠금으로 앎)");
    ok(added.every((k) => /^rn2-/.test(k) || us.newKeys.includes(k)), "H-07 새 웹앱이 더한 기기 저장 열쇠는 rn2- 머리 · 그 밖은 새 웹앱 탭 안에서 옛 기능이 쓴 것(감시기가 적음)", '새 열쇠 ' + added.length + '개 · rn2- 밖 ' + added.filter((k) => !/^rn2-/.test(k)).join(', '));
    ok(us.writes === 0 && uerr.length === 0, 'H-07 새 웹앱 탭: ui2_ 밖 쓰기 0 · 오류 0', uerr.slice(0, 2).join(' / '));
    await b.close();
  }
  /* H-08 — 단축키가 초점에 따라 갈림 */
  {
    const t = await open({ q: '?p=kb', settle: 2500, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); } }); const p = t.p;
    await p.evaluate(() => { window.__probe = []; document.addEventListener('keydown', (e) => window.__probe.push('문서:' + (e.ctrlKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + e.key)); window.addEventListener('keydown', (e) => window.__probe.push('창:' + e.key)); });
    await p.keyboard.press('Control+z'); await p.keyboard.press('Alt+g');
    const view = await p.evaluate(() => ({ probe: window.__probe.slice(), edit: !!U2.edit }));
    ok(!view.edit && view.probe.some((x) => /Ctrl\+z/.test(x)) && view.probe.some((x) => /Alt\+g/i.test(x)), 'H-08 보기 모드: Ctrl+Z·Alt+G는 지금 웹앱 몫으로 그대로 감(새 웹앱이 가로채지 않음)', view.probe.join(' '));
    await p.evaluate(() => { U2.openEditor('pub'); U2.edit.add('kpi'); window.__probe = []; }); await p.click('.u2-grid', { position: { x: 3, y: 3 } }).catch(() => {});
    const n0 = await p.evaluate(() => Object.keys(U2.edit.draft.widgets).length);
    await p.keyboard.press('Control+z'); const ed = await p.evaluate(() => ({ probe: window.__probe.slice(), n: Object.keys(U2.edit.draft.widgets).length }));
    ok(ed.n === n0 - 1 && !ed.probe.some((x) => /z$/i.test(x)), 'H-08 편집 모드: Ctrl+Z는 편집기 되돌리기만(지금 웹앱에는 안 감)', JSON.stringify(ed));
    await p.focus('#u2-edq'); await p.keyboard.press('Control+z'); ok(await p.evaluate(() => Object.keys(U2.edit.draft.widgets).length) === n0 - 1, 'H-08 편집 모드라도 글 칸 안 Ctrl+Z는 그 칸 몫(편집기 되돌리기 안 함)');
    await t.close();
  }
  /* H-12 — 휴대폰 얇은 모드: 큰 자료를 지금 웹앱 휴대폰과 똑같이 안 받음 · 4칸 · 가로 스크롤 없음 */
  {
    const b = await chromium.launch(); const ui = await open({ browser: b, q: '?p=home', vp: { width: 390, height: 800 }, ua: IPHONE, touch: true, settle: 6000 });
    const u = await ui.p.evaluate(() => ({ thin: typeof PHONE_THIN !== 'undefined' && PHONE_THIN, prod: S.prodLoaded, plist: S.plist.size, sel: S.sellersLoaded, cols: +U2.view.el.dataset.cols, sw: document.documentElement.scrollWidth }));
    const cl = await openClassic({ browser: b, vp: { width: 390, height: 800 }, ua: IPHONE, settle: 6000 }); const c = await cl.p.evaluate(() => ({ thin: PHONE_THIN, prod: S.prodLoaded, plist: S.plist.size, sel: S.sellersLoaded }));
    ok(u.thin && u.cols === 4 && u.sw <= 390, 'H-12 휴대폰: 얇은 모드 그대로 · 4칸 · 가로 스크롤 없음', JSON.stringify({ cols: u.cols, sw: u.sw }));
    ok(u.prod === c.prod && u.sel === c.sel && u.plist === c.plist, 'H-12 휴대폰 홈: 받는 큰 자료(상품·판매자)가 지금 웹앱 휴대폰과 같음', JSON.stringify({ 새: [u.prod, u.sel, u.plist], 지금: [c.prod, c.sel, c.plist] }));
    await ui.p.evaluate(() => { U2.pages.ph = { id: 'ph', title: '폰', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'legacy.sec', props: { ref: 'bz_pace', tab: 'biz' } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 24, h: 12 }] } }; return U2.go('ph'); }); await ui.p.waitForTimeout(1500);
    const s2 = await ui.p.evaluate(() => ({ shown: !!U2.view.cell('s').querySelector('details.sec, .u2-seccards') || U2.view.cell('s').textContent.length > 20, prod: S.prodLoaded }));
    ok(s2.shown && s2.prod === c.prod, "H-12 휴대폰에 '매출 페이스' 섹션 위젯(받는 자료 0MB) — 그려지고 상품 자료를 더 받지 않음", JSON.stringify(s2));
    await ui.close(); await cl.close(); await b.close();
  }
  done('t_coexist');
})();
