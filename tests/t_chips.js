/* 리드나우 2 0.4.11 — 성공 사례 견줌(리드나우 2 빈 곳 다음 차례)
 *  ① 조건은 탭이 아니라 거르기 칩: 📋 목록 보기 탭 — 열린 목록의 켜진 거르기·찾기 글이 칩(× 풀기) · ＋ 거르기 판(갈래·값 · 누르면 바로) · 저장한 ⭐ 보기에 거르기 이름 · 휴대폰
 *  ② 설정 갈래 목차 + 설정 찾기: 🔎 찾기 '⚙ 설정' 범위를 빈 칸으로 열면 갈래 목차(지금 웹앱 ⚙ 설정 갈래 + 🧩 리드나우 2) · 갈래를 누르면 그 갈래만
 *  ③ 한 일의 설정은 한 곳 · 메뉴를 할 일 갈래로: ☰ 메뉴가 갈래(모양·옛 화면·보기·배치·안전·살피기) · ⭐ 저장한 보기 두 가지(자료 보기·목록 보기)를 한 곳에서 열기·지우기
 *  ④ 우리숍 블록이 휴대폰에서도(약속 53): 📚 서가 책장 블록 390폭 — 칸 밖으로 넘침 없음 · 가로 밀림 없음 */
const { open, ok, done, nonU2Writes, seed } = require('./lib');
const SHOT = process.env.U2_SHOT_DIR || '';
(async () => {
  console.log('[0.4.11 성공 사례 견줌 — 거르기 칩 · 설정 목차 · 설정 한 곳 · 블록 휴대폰]');
  const t = await open({ q: '?p=inbox', settle: 2500 }); const p = t.p;
  await seed(p, {});
  /* ① 거르기 칩 */
  await p.evaluate(() => { try { localStorage.removeItem('rn2-listViews'); } catch (e) {} });
  await p.evaluate(async () => { U2.pages.lv = { id: 'lv', title: '목록', grid: { rowH: 16 }, rev: 0, widgets: { l: { type: 'listtabs', props: {} } }, layouts: { pc: [{ id: 'l', x: 0, y: 0, w: 24, h: 8 }] } }; await U2.go('lv'); });
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => !U2.view.cell('l').querySelector('[data-lvc]')), '목록이 닫혀 있으면 거르기 칩 줄 없음');
  await p.waitForFunction(() => { try { return S.prodLoaded; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => U2.view.cell('l').querySelector('[data-lvb="prodAll"]').click()); await p.waitForTimeout(1500);
  const c1 = await p.evaluate(() => { const c = U2.view.cell('l').querySelector('[data-lvc]'); return c ? { txt: c.textContent.replace(/\s+/g, ' ').trim(), add: !!c.querySelector('[data-lvca]'), n: c.querySelectorAll('.u2-lvc').length } : null; });
  ok(c1 && c1.add && c1.n === 0 && /없음/.test(c1.txt), "목록을 열면 칩 줄 '거르기 없음 — 전체' + ＋ 거르기", JSON.stringify(c1));
  /* ＋ 거르기 판 → 값 하나 = 2번 누름 */
  await p.evaluate(() => U2.view.cell('l').querySelector('[data-lvca]').click()); await p.waitForTimeout(300);
  const pan = await p.evaluate(() => { const L = document.querySelector('.u2-lvpanel'); if (!L) return null; const secs = [...L.querySelectorAll('.u2-sec')].map((s) => ({ b: s.querySelector('b').textContent, n: s.querySelectorAll('[data-lvp]').length })); return { secs }; });
  ok(pan && pan.secs.length >= 1 && pan.secs.every((s) => s.n >= 2), '＋ 거르기 = 지금 웹앱 목록의 거르기 갈래·값을 판으로(화면 안 · 브라우저 팝업 아님)', JSON.stringify(pan).slice(0, 240));
  const pick = await p.evaluate(() => { const L = document.querySelector('.u2-lvpanel'); const x = L.querySelector('.u2-sec [data-lvp]:not(.u2-on)'); const k = x.dataset.lvp; const lab = x.textContent.replace(/\s+\d[\d,]*$/, '').trim(); x.click(); return { k, lab }; });
  await p.waitForTimeout(900);
  const c2 = await p.evaluate((k) => { const [fid, v] = k.split('|'); const c = U2.view.cell('l').querySelector('[data-lvc]'); const on = document.querySelector('#sheet [data-btf="' + CSS.escape(k) + '"]');
    return { st: S._bt_prod.f[fid], v, panel: !!document.querySelector('.u2-lvpanel'), on: on && on.classList.contains('on'), chips: [...c.querySelectorAll('.u2-lvc')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()) }; }, pick.k);
  ok(c2.st === c2.v && c2.on && !c2.panel && c2.chips.length === 1 && c2.chips[0].indexOf(pick.lab.split(' ')[0]) >= 0, '값을 누르면 판이 닫히고 지금 웹앱 목록이 그 값으로 걸러짐(같은 단추) · 칩 하나가 켜짐', JSON.stringify({ c2, pick }).slice(0, 300));
  /* 찾기 글도 칩 */
  await p.fill('#bt_q', '책'); await p.waitForTimeout(1600);
  const c3 = await p.evaluate(() => [...U2.view.cell('l').querySelectorAll('[data-lvc] .u2-lvc')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(c3.length === 2 && c3.some((x) => /🔎 ‘책’/.test(x)) && (await p.evaluate(() => !!U2.view.cell('l').querySelector('[data-lvcall]'))), "지금 웹앱 목록에서 직접 친 찾기 글도 칩으로(🔎 ‘책’) · 2개부터 '모두 풀기'", JSON.stringify(c3));
  /* 저장 = 거르기 이름이 보기 설명에 */
  const sv = await p.evaluate(async () => { const c = U2.view.cell('l'); c.querySelector('[data-lvn]').value = '칩 보기'; c.querySelector('[data-lvs]').click(); await new Promise((r) => setTimeout(r, 150)); const v = JSON.parse(localStorage.getItem('rn2-listViews') || '[]')[0] || {}; return { fl: v.fl, desc: U2W.lvDesc(v), title: (c.querySelector('[data-lvv]') || {}).title || '' }; });
  ok(sv.fl && Object.keys(sv.fl).length === 1 && /‘책’/.test(sv.desc) && sv.desc.indexOf(Object.values(sv.fl)[0]) >= 0 && /:/.test(Object.values(sv.fl)[0]), '⭐ 보기로 저장하면 거르기 이름(갈래: 값)이 함께 — 탭 설명이 열쇠 대신 사람 말', JSON.stringify(sv).slice(0, 260));
  /* × 풀기 */
  await p.evaluate(() => { const x = [...U2.view.cell('l').querySelectorAll('[data-lvcx]')][0]; x.click(); }); await p.waitForTimeout(900);
  const c4 = await p.evaluate((k) => { const [fid] = k.split('|'); const cs = [...U2.view.cell('l').querySelectorAll('[data-lvc] .u2-lvc')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()); const first = document.querySelector('#sheet [data-btf^="' + fid + '|"]'); return { cs, st: S._bt_prod.f[fid], first: first && first.classList.contains('on'), firstK: first && first.dataset.btf }; }, pick.k);
  ok(c4.cs.length === 1 && /‘책’/.test(c4.cs[0]) && c4.first, '× = 그 갈래 첫 값(전체)으로 · 찾기 칩은 남음', JSON.stringify(c4));
  await p.evaluate(() => U2.view.cell('l').querySelector('[data-lvcq]').click()); await p.waitForTimeout(1300);
  const c5 = await p.evaluate(() => ({ q: S._bt_prod.q, inp: (document.getElementById('bt_q') || {}).value, n: U2.view.cell('l').querySelectorAll('[data-lvc] .u2-lvc').length }));
  ok(c5.q === '' && c5.inp === '' && c5.n === 0, '🔎 칩 × = 지금 웹앱 목록 찾기 칸을 비움', JSON.stringify(c5));
  ok((await nonU2Writes(p)).length === 0, '거르기 칩은 Firestore에 아무것도 쓰지 않음(지금 웹앱 칸 0)');
  await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => !U2.view.cell('l').querySelector('[data-lvc]')), '목록을 닫으면 칩 줄이 저절로 사라짐');
  const errs1 = t.errs.filter((e) => !/js-profiling/.test(e)); ok(!errs1.length && !t.dialogs.length, '오류·브라우저 팝업 0', errs1.concat(t.dialogs).join(' | ').slice(0, 200));
  /* ② ⚙ 설정 목차 */
  await p.evaluate(() => { try { localStorage.setItem('rn2-findScope', JSON.stringify('all')); } catch (e) {} U2.find.open(); }); await p.waitForTimeout(300);
  await p.click('#u2-find [data-sc="set"]'); await p.waitForTimeout(300);
  const s1 = await p.evaluate(() => { const f = document.getElementById('u2-find'); return { rows: [...f.querySelectorAll('.u2-findrow')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()), head: (f.querySelector('.u2-findk2') || {}).textContent || '', pins: f.querySelectorAll('[data-pin]').length }; });
  const want = ['리드나우 2', '이 기기', '등록', '출고', '가격', '수집', '알림', '보안'];
  ok(s1.rows.length >= 6 && /설정 목차/.test(s1.head) && want.filter((w) => s1.rows.some((r) => r.indexOf(w) >= 0)).length >= 6 && s1.rows.every((r) => /\d+칸/.test(r)) && s1.pins === 0, "🔎 찾기 '⚙ 설정'을 빈 칸으로 = 갈래 목차(지금 웹앱 설정 묶음 + 🧩 리드나우 2) · 갈래마다 칸 수", JSON.stringify(s1).slice(0, 400));
  const g = await p.evaluate(() => { const f = document.getElementById('u2-find'); const r = [...f.querySelectorAll('.u2-findrow')].find((x) => /출고/.test(x.textContent)); r.click(); return r.textContent.replace(/\s+/g, ' ').trim(); }); await p.waitForTimeout(250);
  const s2 = await p.evaluate(() => { const f = document.getElementById('u2-find'); return { open: !!f, head: (f.querySelector('.u2-findk2') || {}).textContent || '', rows: [...f.querySelectorAll('.u2-findrow')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4), n: f.querySelectorAll('.u2-findrow').length, focus: document.activeElement === f.querySelector('input') }; });
  const gn = +((/(\d+)칸/.exec(g) || [])[1] || 0);
  ok(s2.open && /출고/.test(s2.head) && /설정 목차로/.test(s2.rows[0]) && s2.n === gn + 1 && s2.focus, '갈래를 누르면 찾기 창 안에서 그 갈래 칸만(← 목차로 · 창은 그대로 · 글 칸에 커서)', JSON.stringify({ g, s2 }).slice(0, 300));
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => /설정 목차/.test((document.querySelector('#u2-find .u2-findk2') || {}).textContent || '')), 'Enter(맨 위 ← 목차로) = 목차로 돌아감');
  await p.fill('#u2-find input', '백업'); await p.waitForTimeout(250);
  const s3 = await p.evaluate(() => [...document.querySelectorAll('#u2-find .u2-findrow')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()).slice(0, 3));
  ok(s3.length >= 1 && s3.every((r) => !/칸 ·/.test(r) || /백업/.test(r)) && s3.some((r) => /백업/.test(r)), '글을 치면 목차 대신 설정 전체에서 찾기(예전 그대로)', JSON.stringify(s3).slice(0, 240));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  /* ③ ☰ 메뉴 갈래 · 저장한 보기 한 곳 */
  await p.evaluate(() => U2.menu()); await p.waitForTimeout(300);
  const m1 = await p.evaluate(() => { const L = document.querySelector('.u2-layer .u2-menu'); const G = [...L.querySelectorAll('.u2-mg')].map((g) => ({ k: g.dataset.mg, h: g.querySelector('.u2-mgh').textContent, n: g.querySelectorAll('button, a, label.u2-btn').length }));
    const all = ['perm', 'mine', 'export', 'watch', 'track', 'plan', 'move', 'settoc', 'vsave'].filter((k) => L.querySelector('[data-m="' + k + '"]')); const lv = L.querySelector('[data-mlv]'); return { G, all, lv: lv ? lv.textContent.replace(/\s+/g, ' ').trim() : null, old: !!L.querySelector('[data-oldlink]'), imp: !!L.querySelector('input[type=file][data-m="import"]') }; });
  ok(m1.G.length === 6 && m1.G.every((x) => x.n >= 1) && m1.all.length === 9 && m1.old && m1.imp, '☰ 메뉴 = 할 일 갈래 6(모양·옛 화면·보기·배치·안전·살피기) · 예전 단추 모두 그대로 + ⚙ 설정 목차', JSON.stringify(m1.G.map((x) => x.h + ':' + x.n)) + ' · ' + m1.all.join(','));
  ok(/📋 목록 보기/.test(m1.lv || '') && /⭐ 칩 보기/.test(m1.lv || ''), "⭐ 보기 갈래에 📋 목록 보기 탭의 보기도 — 저장한 보기 두 가지를 한 곳에서", m1.lv);
  await p.evaluate(() => document.querySelector('.u2-layer [data-mlvo]').click()); await p.waitForTimeout(1200);
  const m2 = await p.evaluate(() => ({ layer: !!document.querySelector('.u2-layer .u2-menu'), on: document.getElementById('sheet').classList.contains('on'), bt: S.detail && S.detail.bigTable, q: S._bt_prod && S._bt_prod.q }));
  ok(!m2.layer && m2.on && m2.bt === 'prod' && m2.q === '책', '메뉴에서 ⭐ 목록 보기를 누르면 그 거르기로 지금 웹앱 목록이 열림', JSON.stringify(m2));
  await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(500);
  await p.evaluate(() => U2.menu()); await p.waitForTimeout(250);
  const m3 = await p.evaluate(async () => { document.querySelector('.u2-layer [data-mlvx]').click(); await new Promise((r) => setTimeout(r, 200)); const n0 = JSON.parse(localStorage.getItem('rn2-listViews') || '[]').length; const tabGone = !U2.view.cell('l').querySelector('[data-lvv]');
    const note = [...document.querySelectorAll('#u2-toast .u2-note')].pop(); const a = note && note.querySelector('.u2-nact'); if (a) a.click(); await new Promise((r) => setTimeout(r, 200)); return { n0, tabGone, n1: JSON.parse(localStorage.getItem('rn2-listViews') || '[]').length, tabBack: !!U2.view.cell('l').querySelector('[data-lvv]') }; });
  ok(m3.n0 === 0 && m3.tabGone && m3.n1 === 1 && m3.tabBack, '메뉴에서 × 지우면 목록 보기 탭 위젯에서도 사라짐(한 곳) · ↶ 되돌리기로 둘 다 되살림', JSON.stringify(m3));
  await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((x) => x.remove()));
  await p.evaluate(() => U2.menu()); await p.click('.u2-layer [data-m="settoc"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('.u2-layer .u2-menu') && /설정 목차/.test((document.querySelector('#u2-find .u2-findk2') || {}).textContent || '')), "☰ '⚙ 설정 목차·찾기' = 메뉴가 닫히고 찾기 창 ⚙ 목차(누름 2번)");
  await p.keyboard.press('Escape');
  if (SHOT) { await p.evaluate(() => U2.menu()); await p.waitForTimeout(250); await p.screenshot({ path: require('path').join(SHOT, 'u2go7_menu_pc.png') }); await p.evaluate(() => document.querySelectorAll('.u2-layer').forEach((x) => x.remove())); }
  ok((await nonU2Writes(p)).length === 0, '설정 목차·메뉴는 지금 웹앱 칸에 쓰지 않음');
  const errs2 = t.errs.filter((e) => !/js-profiling/.test(e)); ok(!errs2.length && !t.dialogs.length, '오류·브라우저 팝업 0(②③)', errs2.concat(t.dialogs).join(' | ').slice(0, 200));
  await t.close();
  /* 휴대폰: 거르기 칩 줄·메뉴 · 가로 밀림 없음 */
  const m = await open({ q: '?p=inbox', settle: 2500, vp: { width: 390, height: 844 }, touch: true }); const q = m.p; await seed(q, {});
  await q.evaluate(async () => { localStorage.setItem('rn2-listViews', JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ name: '긴 보기 이름 ' + i, scr: 'prodAll', bt: 'prod', title: '📚 상품 전체 보기', q: '', f: {}, fl: { chn: '🏪 채널: 알라딘' } })))); U2.pages.lv = { id: 'lv', title: '목록', grid: { rowH: 16 }, rev: 0, widgets: { l: { type: 'listtabs', props: {} } }, layouts: { pc: [{ id: 'l', x: 0, y: 0, w: 24, h: 8 }] } }; await U2.go('lv'); });
  await q.waitForFunction(() => { try { return S.prodLoaded; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {});
  await q.evaluate(() => { S._bt_prod = { q: '책', lim: 200, sort: undefined, f: { chn: 'aladin' } }; U2W.lvOpen('prodAll', { bt: 'prod', q: '책', f: { chn: 'aladin' } }); }); await q.waitForTimeout(1800);
  const ph = await q.evaluate(() => { const c = U2.view.cell('l'); const ch = c.querySelector('[data-lvc]'); const b = c.querySelector('.u2-b') || c; return { chips: ch ? ch.querySelectorAll('.u2-lvc').length : -1, over: Math.max(0, b.scrollHeight - b.clientHeight), sx: document.documentElement.scrollWidth - innerWidth }; });
  ok(ph.chips === 2 && ph.over <= 2 && ph.sx <= 1, '휴대폰 390: 칩 줄(찾기·거르기)이 칸 안 한 줄 · 칸 넘침·가로 밀림 없음', JSON.stringify(ph));
  if (SHOT) await q.screenshot({ path: require('path').join(SHOT, 'u2go7_chips_phone.png') });
  await q.evaluate(() => { try { closeDetail(); } catch (e) {} U2.menu(); }); await q.waitForTimeout(300);
  const pm = await q.evaluate(() => { const L = document.querySelector('.u2-layer .u2-menu'); return { sx: document.documentElement.scrollWidth - innerWidth, wide: [...L.querySelectorAll('.u2-mg')].filter((g) => g.getBoundingClientRect().right > innerWidth + 1).length }; });
  ok(pm.sx <= 1 && pm.wide === 0, '휴대폰 390: ☰ 메뉴 갈래 상자가 화면 안', JSON.stringify(pm));
  if (SHOT) await q.screenshot({ path: require('path').join(SHOT, 'u2go7_menu_phone.png'), fullPage: false });
  const errs3 = m.errs.filter((e) => !/js-profiling/.test(e)); ok(!errs3.length && !m.dialogs.length, '오류·브라우저 팝업 0(휴대폰)', errs3.join(' | ').slice(0, 200));
  await m.close(); done('t_chips');
})().catch((e) => { console.error(e); process.exitCode = 1; });
