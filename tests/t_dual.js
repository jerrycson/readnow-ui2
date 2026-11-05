/* 동시에 쓰기 시험(정범님 11/05 15시 '페이지를 바꿀 때 옛 등록·출고 화면을 늘 닫을지: 동시에 사용할 수는 없어?')
 * ① 기본(두기 · 오른쪽 나란히): 등록 화면을 연 채 페이지를 바꿔도 등록 화면이 그대로(내용·친 글자·S.detail) · 왼쪽은 새 페이지 · 오른쪽은 옛 화면
 * ② 함께 쓰는 동안 페이지의 옛 탭이 미루지 않고 그려짐 ③ 손잡이로 폭 끌기 · 기기에 기억(다시 열어도) · 키보드 ←→
 * ④ 접기·펼치기·✕ 닫기 ⑤ 뒤로 가기 = 먼저 옛 화면을 닫고 페이지·주소는 그대로 ⑥ 설정 '닫기' = 0.3.1 모습 ⑦ 설정 '전체' = 페이지를 바꾸면 접힘
 * ⑧ 휴대폰 폭 ⑨ 🪟 옛 화면 자리 위젯(페이지로 박기) ⑩ 한 번에 하나(지금 웹앱 한계 그대로) · 팝업 0 · 오류 0 · ui2_ 밖 쓰기 0
 * 화면 사진: U2_SHOT_DIR(기본 저장 안 함)에 저장 — 사람이 눈으로 확인 */
const path = require('path');
const { open, ok, done, chromium, nonU2Writes } = require('./lib');
const DIR = process.env.U2_SHOT_DIR || '';
const shot = async (p, n) => { if (DIR) await p.screenshot({ path: path.join(DIR, 'dual_' + n + '.png') }); };
const NOVER = () => { try { localStorage.setItem('rn-lastver', '1.78.384'); } catch (e) {} };
const st = (p) => p.evaluate(() => {
  const sh = document.getElementById('sheet'); const r = sh.getBoundingClientRect(); const pg = document.getElementById('u2-page').getBoundingClientRect();
  const at = (x, y) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('#sheet') ? 'sheet' : e.closest('#u2-page') ? 'page' : e.closest('#u2-bar') ? 'bar' : e.closest('#u2-dockui') ? 'ui' : e.id || e.tagName) : null; };
  const midY = Math.round((r.top + innerHeight) / 2);
  let det = null, tab = null; try { det = S.detail ? Object.keys(S.detail)[0] : null; tab = S.tab; } catch (e) {}
  const ui = document.getElementById('u2-dockui');
  return { on: sh.classList.contains('on'), det, tab, cur: U2.cur, url: location.search, len: sh.innerHTML.length, L: Math.round(r.left), W: Math.round(r.width), T: Math.round(r.top), pgW: Math.round(pg.width), left: at(40, midY), right: at(innerWidth - 40, midY), cls: ['u2-dside', 'u2-dfull', 'u2-dcell', 'u2-dfold', 'u2-dual'].filter((c) => document.body.classList.contains(c)).join(' '), vis: getComputedStyle(sh).visibility, ui: ui ? ui.dataset.m + (ui.classList.contains('fold') ? '+fold' : '') : null, tt: ui ? ui.querySelector('.u2-docktt').textContent : '', parent: sh.parentNode && (sh.parentNode.id || sh.parentNode.className), cfg: U2.dock.cfg() };
});
(async () => {
  const b = await chromium.launch();
  console.log('[동시에 쓰기] PC 1400×900 · 기본 설정');
  let t = await open({ browser: b, init: NOVER, settle: 2500 }); let p = t.p;
  let s = await st(p);
  ok(s.cfg.keep === 'keep' && s.cfg.pos === 'side', '기본 설정 = 페이지 바꿀 때 옛 화면 두기 · 오른쪽 나란히', JSON.stringify(s.cfg));
  await p.click('.u2-nav [data-pg="products"]'); await p.waitForTimeout(900);
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1500);
  s = await st(p);
  ok(s.on && s.cls.includes('u2-dside') && s.L > 500 && s.L + s.W >= 1398 && s.pgW <= s.L + 2, '① 등록 화면이 오른쪽 나란히 창으로 열림 · 페이지는 왼쪽(겹치지 않음)', `층 ${s.L}~${s.L + s.W} · 페이지 폭 ${s.pgW}`);
  ok(s.left === 'page' && s.right === 'sheet', '  왼쪽 = 새 웹앱 페이지 · 오른쪽 = 등록 화면', s.left + ' / ' + s.right);
  ok(/상품 등록/.test(s.tt), '  작은 단추 줄에 지금 옛 화면 이름', s.tt);
  await shot(p, '1_reg_products');
  /* 등록 화면 안 글칸에 글을 침 */
  const typed = await p.evaluate(() => { const i = [...document.querySelectorAll('#sheet input[type=text], #sheet input:not([type]), #sheet textarea')].find((x) => x.offsetParent); if (!i) return null; i.focus(); i.value = '시험 글 123'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dataset.u2t = '1'; return i.id || i.name || i.placeholder || 'input'; });
  const len0 = s.len;
  for (const id of ['orders', 'biz', 'home']) {
    await p.click('.u2-nav [data-pg="' + id + '"]'); await p.waitForTimeout(1200);
    s = await st(p);
    ok(s.on && s.det === 'reg' && s.cur === id && s.tab === id && s.len > len0 * 0.6 && s.left === 'page' && s.right === 'sheet', '① 페이지 → ' + id + ': 등록 화면 그대로(내용 ' + s.len + '자 · S.detail reg) · 왼쪽은 그 페이지·옛 탭', JSON.stringify({ on: s.on, det: s.det, cur: s.cur, tab: s.tab, left: s.left, right: s.right }));
  }
  ok(s.url === '?p=home', '  주소는 지금 페이지(?p=home)', s.url);
  const tv = await p.evaluate(() => { const i = document.querySelector('#sheet [data-u2t]'); return i ? i.value : null; });
  ok(typed == null || tv === '시험 글 123', '  등록 화면에 친 글자가 페이지를 바꿔도 남음', typed ? (typed + ' = ' + tv) : '글칸 없음');
  await shot(p, '2_reg_home');
  /* ② 옛 탭 미루기 */
  const def = await p.evaluate(() => { S._userAt = 0; S._qDirty = false; renderMain(); const q = S._qDirty; const u = S._userAt; return { q, u }; });
  ok(def.q === false && def.u === 0, '② 함께 쓰는 동안 페이지의 옛 탭은 미루지 않고 그려짐(지금 웹앱 S._qDirty 안 걸림) · S._userAt는 그대로 되돌림', JSON.stringify(def));
  /* ③ 손잡이 끌기 */
  const hb = await p.evaluate(() => { const h = document.querySelector('.u2-dockh'); const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 200, vis: getComputedStyle(h).display !== 'none' }; });
  ok(hb.vis, '③ 가운데 손잡이가 보임');
  await p.mouse.move(hb.x, hb.y); await p.mouse.down(); await p.mouse.move(800, hb.y, { steps: 6 }); await p.mouse.move(900, hb.y, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(400);
  s = await st(p);
  ok(Math.abs(s.L - 900) <= 4 && Math.abs(s.cfg.w - 500 / 1400) < 0.01, '  끌어서 폭 바꿈(옛 화면 왼쪽 끝 900px · 기기에 ' + Math.round(s.cfg.w * 100) + '% 기억)', 'L=' + s.L);
  await p.focus('.u2-dockh'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300); const sk = await st(p);
  ok(sk.L < s.L - 40, '  키보드 ← 로 옛 화면을 넓힘', s.L + ' → ' + sk.L);
  await p.evaluate(() => U2.dock.set({ w: 500 / 1400 }));
  /* ④ 접기·펼치기 */
  await p.click('#u2-dockui [data-dk="fold"]'); await p.waitForTimeout(400); s = await st(p);
  ok(s.on && s.cls.includes('u2-dfold') && s.vis === 'hidden' && s.right === 'page' && s.pgW > 1300, '④ ◂ 접기: 옛 화면은 살아 있고(on) 숨음 · 페이지가 넓게', JSON.stringify({ cls: s.cls, vis: s.vis, pgW: s.pgW }));
  await shot(p, '3_fold');
  await p.click('#u2-dockui [data-dk="fold"]'); await p.waitForTimeout(400); s = await st(p);
  ok(s.cls.includes('u2-dside') && s.right === 'sheet' && s.det === 'reg', '  ▸ 펼치기: 그대로 다시', s.cls);
  /* ⑤ 뒤로 가기 */
  await p.click('.u2-nav [data-pg="orders"]'); await p.waitForTimeout(1000);
  await p.goBack(); await p.waitForTimeout(900); s = await st(p);
  ok(!s.on && s.cur === 'orders' && s.url === '?p=orders', '⑤ 뒤로 가기 = 먼저 옛 화면을 닫음 · 페이지·주소는 그대로(주문·매출)', JSON.stringify({ on: s.on, cur: s.cur, url: s.url }));
  ok(s.cls === '' && s.ui === null && s.pgW > 1300, '  닫히면 나란히 자리·단추 줄도 없어지고 페이지가 넓게', JSON.stringify({ cls: s.cls, ui: s.ui, pgW: s.pgW }));
  await p.goBack(); await p.waitForTimeout(900); s = await st(p);
  ok(s.cur === 'home' && !s.on, '  한 번 더 뒤로 → 앞 페이지(홈)', s.cur);
  /* ✕ 닫기 · 한 번에 하나 */
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1000);
  await p.evaluate(() => openShip()); await p.waitForTimeout(1300); s = await st(p);
  ok(s.on && s.det === 'ship' && /출고/.test(s.tt), '⑩ 한 번에 하나: 등록 화면을 연 채 출고를 열면 그 자리가 출고로(지금 웹앱과 같음 · 뒤로 가기로 등록 화면)', s.det + ' · ' + s.tt);
  await p.click('#u2-dockui [data-dk="close"]'); await p.waitForTimeout(500); s = await st(p);
  ok(!s.on && s.det == null && s.ui === null, '④ ✕ 닫기 = 지금 웹앱 닫기(S.detail 비움)', JSON.stringify({ on: s.on, det: s.det }));
  /* ⑦ 설정 '전체' — 메뉴에서 */
  await p.click('#u2-menubtn'); await p.waitForTimeout(400);
  const msec = await p.evaluate(() => { const x = document.querySelector('.u2-layer [data-dksec]'); return x ? x.innerText.replace(/\s+/g, ' ').slice(0, 160) : null; });
  ok(!!msec && /페이지 바꿀 때/.test(msec) && /한 번에 하나/.test(msec), '☰ 메뉴에 🪟 옛 화면 설정(페이지 바꿀 때 두기/닫기 · 자리 · 한계 설명)', msec);
  await p.click('.u2-layer [data-dkset="pos:full"]'); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((l) => l.remove()));
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1000); s = await st(p);
  ok(s.cls.includes('u2-dfull') && s.L === 0 && s.W >= 1398 && s.right === 'sheet' && s.left === 'sheet', "⑦ '전체': 머리 아래를 모두 덮음", JSON.stringify({ cls: s.cls, L: s.L, W: s.W }));
  await p.click('.u2-nav [data-pg="purchase"]'); await p.waitForTimeout(1100); s = await st(p);
  ok(s.on && s.det === 'reg' && s.cls.includes('u2-dfold') && s.left === 'page' && s.cur === 'purchase' && /펼치기/.test(await p.textContent('#u2-dockui [data-dk="fold"]')), "  페이지를 바꾸면 접혀 새 페이지가 보임 · '▸ 펼치기' 단추", JSON.stringify({ cls: s.cls, left: s.left, ui: s.ui }));
  await shot(p, '4_full_folded');
  await p.click('#u2-dockui [data-dk="fold"]'); await p.waitForTimeout(400); s = await st(p);
  ok(s.cls.includes('u2-dfull') && s.left === 'sheet', '  펼치면 등록 화면이 다시 덮음', s.cls);
  await p.click('#u2-dockui [data-dk="pos"]'); await p.waitForTimeout(500); s = await st(p);
  ok(s.cls.includes('u2-dside') && s.cfg.pos === 'side', '  ◫ 나란히 단추로 바로 바꿈', s.cls);
  /* ⑥ 설정 '닫기' */
  await p.click('#u2-menubtn'); await p.waitForTimeout(400); await p.click('.u2-layer [data-dkset="keep:close"]'); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((l) => l.remove()));
  s = await st(p);
  ok(s.cfg.keep === 'close' && s.on && s.cls === '' && s.L === 0, "⑥ 설정 '닫기' = 0.3.1 모습(전체로 덮고 나란히 안 함)", JSON.stringify({ keep: s.cfg.keep, cls: s.cls, L: s.L }));
  await p.click('.u2-nav [data-pg="sellers"]'); await p.waitForTimeout(1000); s = await st(p);
  ok(!s.on && s.cur === 'sellers', "  '닫기'면 페이지를 바꿀 때 옛 화면을 닫음", JSON.stringify({ on: s.on, cur: s.cur }));
  await p.evaluate(() => U2.dock.set({ keep: 'keep', pos: 'side' }));
  ok(t.dialogs.length === 0, '브라우저 팝업 0', t.dialogs.join(' | '));
  ok(t.errs.filter((e) => /PAGEERR/.test(e)).length === 0, '페이지 오류 0', t.errs.filter((e) => /PAGEERR/.test(e)).slice(0, 3).join(' | '));
  ok((await nonU2Writes(p)).length === 0, 'ui2_ 밖 쓰기 0');
  await t.close();
  /* ③ 다시 열어도 폭 기억 · ⑨ 위젯 */
  console.log('[동시에 쓰기] 다시 엶 · 🪟 옛 화면 자리 위젯');
  t = await open({ browser: b, init: () => { try { localStorage.setItem('rn-lastver', '1.78.384'); localStorage.setItem('rn2-dock', JSON.stringify({ keep: 'keep', pos: 'side', w: 0.4 })); } catch (e) {} }, settle: 2500 }); p = t.p;
  await p.click('.u2-nav [data-pg="orders"]'); await p.waitForTimeout(900); /* 사람이 누르기 전 12초는 옛 화면 저절로 되살리기를 막으므로(0.3.1) 먼저 한 번 누름 */
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1200); s = await st(p);
  ok(Math.abs(s.W - 560) <= 3, '③ 다시 열어도 기억한 폭(40% = 560px)', 'W=' + s.W);
  await p.evaluate(() => closeDetail());
  await p.evaluate(() => { U2.pages.dk = { id: 'dk', title: '옛 화면 칸', grid: { rowH: 16 }, rev: 0, widgets: { t: { type: 'legacy.tab', props: { ref: 'orders' } }, d: { type: 'legacy.dock', props: { title: '등록 자리', scrs: 'register,ship' } } }, layouts: { pc: [{ id: 't', x: 0, y: 0, w: 14, h: 40 }, { id: 'd', x: 14, y: 0, w: 10, h: 44 }] } }; U2.go('dk'); });
  await p.waitForTimeout(1500);
  const ph = await p.evaluate(() => { const c = document.querySelector('.u2-dockcell'); return c ? { txt: c.innerText.replace(/\s+/g, ' ').slice(0, 120), btn: c.querySelectorAll('[data-scr]').length } : null; });
  ok(ph && ph.btn === 2 && /등록 자리/.test(ph.txt), '⑨ 🪟 옛 화면 자리 위젯: 빈 칸엔 이름·설명·화면 단추 2개', JSON.stringify(ph));
  await p.click('.u2-dockcell [data-scr="register"]'); await p.waitForTimeout(1500);
  const inC = await p.evaluate(() => { const sh = document.getElementById('sheet'); const c = document.querySelector('.u2-dockcell'); const a = sh.getBoundingClientRect(), r = c.getBoundingClientRect(); return { inside: c.contains(sh), fit: a.left >= r.left - 1 && a.right <= r.right + 1 && a.top >= r.top - 1, on: sh.classList.contains('on'), cls: document.body.className, ui: !!document.getElementById('u2-dockui'), leftIs: (() => { const e = document.elementFromPoint(r.left - 60, r.top + 100); return e && e.closest('#u2-page') && !e.closest('.u2-dockcell') ? 'page' : e && (e.id || e.className); })() }; });
  ok(inC.on && inC.inside && inC.fit && /u2-dcell/.test(inC.cls) && !inC.ui, '  화면 단추 → 등록 화면이 그 칸 안에 열림(칸 밖으로 안 나옴 · 나란히 단추 줄 없음)', JSON.stringify(inC));
  ok(inC.leftIs === 'page', '  칸 왼쪽의 옛 탭(주문·매출)은 그대로 보임', inC.leftIs);
  await shot(p, '5_cell');
  await p.click('.u2-nav [data-pg="biz"]'); await p.waitForTimeout(1200); s = await st(p);
  ok(s.on && s.det === 'reg' && s.parent === 'app' && s.cls.includes('u2-dside') && s.right === 'sheet', '  위젯이 없는 페이지로 가면 등록 화면은 본래 자리로 돌아와 오른쪽 나란히', JSON.stringify({ parent: s.parent, cls: s.cls }));
  await p.evaluate(() => U2.go('dk')); await p.waitForTimeout(1300);
  const back = await p.evaluate(() => { const sh = document.getElementById('sheet'); return { inside: !!sh.closest('.u2-dockcell'), on: sh.classList.contains('on'), len: sh.innerHTML.length }; });
  ok(back.inside && back.on && back.len > 3000, '  다시 그 페이지로 오면 칸 안으로(내용 그대로)', JSON.stringify(back));
  ok(t.errs.filter((e) => /PAGEERR/.test(e)).length === 0, '페이지 오류 0', t.errs.filter((e) => /PAGEERR/.test(e)).slice(0, 3).join(' | '));
  await t.close();
  /* ⑧ 휴대폰 */
  console.log('[동시에 쓰기] 휴대폰 390×844');
  t = await open({ browser: b, init: NOVER, settle: 2500, vp: { width: 390, height: 844 }, touch: true, ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36' }); p = t.p;
  await p.tap('.u2-nav [data-pg="products"]'); await p.waitForTimeout(900);
  await p.evaluate(() => openRegister()); await p.waitForTimeout(1200); s = await st(p);
  ok(s.on && s.cls.includes('u2-dfull') && s.W >= 388, '⑧ 📱 휴대폰은 나란히 자리가 없어 전체(머리 아래)', JSON.stringify({ cls: s.cls, W: s.W }));
  await p.tap('.u2-nav [data-pg="orders"]'); await p.waitForTimeout(1200); s = await st(p);
  ok(s.on && s.det === 'reg' && s.cls.includes('u2-dfold') && s.left === 'page' && s.cur === 'orders', '  📱 페이지를 바꾸면 등록 화면은 접혀 남고 새 페이지가 보임', JSON.stringify({ cls: s.cls, left: s.left, cur: s.cur }));
  await shot(p, '6_phone_folded');
  const pill = await p.evaluate(() => { const x = document.querySelector('.u2-dockpill'); const r = x.getBoundingClientRect(); return { L: r.left, R: r.right, B: r.bottom, vis: r.width > 0 }; });
  ok(pill.vis && pill.L >= 0 && pill.R <= 390 && pill.B <= 844, '  📱 작은 단추 줄이 화면 안에', JSON.stringify(pill));
  await p.tap('#u2-dockui [data-dk="fold"]'); await p.waitForTimeout(500); s = await st(p);
  ok(s.cls.includes('u2-dfull') && s.left === 'sheet', '  📱 ▸ 펼치기 → 등록 화면 그대로', s.cls);
  await p.tap('#u2-dockui [data-dk="pos"]'); await p.waitForTimeout(400); s = await st(p);
  ok(s.cfg.pos === 'side' && s.cls.includes('u2-dfull'), "  📱 '◫ 나란히'를 눌러도 좁은 화면이라 바꾸지 않고 알림", JSON.stringify({ pos: s.cfg.pos, cls: s.cls }));
  ok(t.errs.filter((e) => /PAGEERR/.test(e)).length === 0, '📱 페이지 오류 0', t.errs.filter((e) => /PAGEERR/.test(e)).slice(0, 3).join(' | '));
  await t.close(); await b.close();
  done('동시에 쓰기');
})().catch((e) => { console.error(e); process.exitCode = 1; });
