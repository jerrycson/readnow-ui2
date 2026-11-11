/* 🧩 바깥 블록 받는 자리(0.4.9 · 약속 53) — 우리숍 📚 서가 책장 블록
 *  ① 우리숍 파일(shop/shelf-core.js·shelf.js·shelf.css)이 있으면 책장이 칸 안에 그려짐(견본 책) ② 없으면 알림 글(오류 0)
 *  ③ 블록 CSS가 칸 밖(지금 웹앱 화면)으로 새지 않음(@scope) ④ 편집기 속성판 = 우리숍 설정 틀 그대로(묶음 머리·여럿 고르기) · 고치면 다시 그림
 *  ⑤ 블록 안 '#/…' 링크가 새 웹앱 주소를 바꾸지 않음 ⑥ 기기 저장 열쇠 rn2- 만 · ui2_ 밖 쓰기 0 ⑦ 휴대폰 가로 스크롤 없음 · 지우면 남는 것 없음
 *  우리숍 서가 파일은 아직 지금 웹앱 main에 없을 수 있어 U2_SHELF_DIR(기본 <U2_TEST_OUT>/shop-shelf)에서 돌려줌 */
const fs = require('fs'); const path = require('path');
const { open, ok, done, nonU2Writes, OUT } = require('./lib');
const SHELF = process.env.U2_SHELF_DIR || path.join(OUT, 'shop-shelf');
const E = (t) => t.errs.filter((e) => !/js-profiling/.test(e)); /* 지금 웹앱 쪽 경고(다른 시험과 같이 뺌) */
const SHOT = process.env.U2_SHOT_DIR || '';
const have = ['shelf-core.js', 'shelf.js', 'shelf.css'].every((f) => fs.existsSync(path.join(SHELF, f)));
const serve = (rel) => { const m = /^shop\/(shelf(?:-core)?\.(?:js|css))$/.exec(rel); if (!m || !have) return null; return { body: fs.readFileSync(path.join(SHELF, m[1])), contentType: m[1].endsWith('.css') ? 'text/css' : 'application/javascript' }; };
const PG = (props, h) => ({ id: 'bk', title: '블록 시험', icon: '🧩', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'shop.shelf', props: Object.assign({ b_n: 120, fontsOn: false }, props || {}) } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 24, h: h || 40 }] } });
const put = (p, pg) => p.evaluate(async (pg) => { U2.pages.bk = pg; U2.render({ reset: true }); for (let i = 0; i < 80; i++) { await new Promise((r) => setTimeout(r, 100)); const c = U2.view.cell('s'); if (c && (c.querySelector('.bqs .sp') || /받을 수 없습니다|그리지 못함/.test(c.textContent))) break; } }, pg);
(async () => {
  console.log('[0.4.9] 🧩 우리숍 블록 받는 자리 — 📚 서가 책장' + (have ? '' : ' (우리숍 서가 파일 없음: ' + SHELF + ' — 파일 있는 줄은 건너뜀)'));
  /* ② 파일이 없을 때(지금 main 그대로) */
  let t = await open({ q: '?p=bk', settle: 1200 }); let p = t.p;
  const def = await p.evaluate(() => { const d = U2W.defs['shop.shelf']; return d && { g: d.group, block: d.block, one: d.one, inGroups: U2W.GROUPS.includes(d.group) }; });
  ok(def && def.g === '우리숍 블록' && def.block && def.one && def.inGroups, "위젯 목록에 '📚 서가 책장(우리숍)' — 묶음 '우리숍 블록' · 한 페이지에 하나", JSON.stringify(def));
  await put(p, PG());
  const miss = await p.evaluate(() => U2.view.cell('s').textContent);
  ok(/파일을 아직 받을 수 없습니다/.test(miss), '우리숍 파일이 없으면 칸 안 알림(빈 칸·오류 아님)', miss.slice(0, 90));
  ok(E(t).length === 0, '오류 0(파일 없음)', E(t).join(' | ').slice(0, 300));
  await t.close();
  if (!have) return done('t_blocks');

  /* ① 파일이 있을 때 */
  t = await open({ q: '?p=bk', settle: 1200, override: serve }); p = t.p;
  const ls0 = await p.evaluate(() => Object.keys(localStorage));
  await put(p, PG());
  const r1 = await p.evaluate(() => { const c = U2.view.cell('s'); const s = c.querySelector('.bqs'); return { has: !!s, n: c.querySelectorAll('.sp').length, h: (c.querySelector('.bqs-h') || {}).textContent || '', scoped: [...document.querySelectorAll('style[data-u2blk]')].map((x) => /@scope \(\.u2-blk-shelf\)/.test(x.textContent)), cart: s ? getComputedStyle(s.querySelector('.bqs-cart')).display : '' }; });
  ok(r1.has && r1.n > 50, '책장이 칸 안에 그려짐(견본 책 120권 중 지금 책장)', '책등 ' + r1.n + ' · ' + r1.h.trim());
  ok(r1.scoped.length === 1 && r1.scoped[0], '우리숍 CSS는 한 번만·@scope로 블록 칸 안에만', JSON.stringify(r1.scoped));
  ok(r1.cart === 'none', '🛒 떠 있는 장바구니는 숨김(오른쪽 아래 옛 떠 있는 단추 자리 덮지 않음)', r1.cart);
  /* ③ 칸 밖으로 안 샘 — 같은 이름(.sp·.lab·.au)을 칸 밖에 만들어 견줌 */
  const leak = await p.evaluate(() => { const box = document.createElement('div'); box.innerHTML = '<button class="sp">가</button><div class="lab">나</div><span class="au">다</span>'; document.getElementById('app').appendChild(box); const out = [...box.children].map((e) => { const s = getComputedStyle(e); return [s.position, s.writingMode, s.backgroundImage === 'none' ? '' : 'bg'].join('/'); }); const inn = getComputedStyle(U2.view.cell('s').querySelector('.sp')); box.remove(); return { out, inPos: inn.position }; });
  ok(leak.out.every((x) => /^(static|relative)\/horizontal-tb\/$/.test(x)) && leak.inPos !== 'static', '블록 CSS가 칸 밖 같은 이름(.sp·.lab·.au)을 바꾸지 않음 · 칸 안은 책장 모양', leak.out.join(' ') + ' · 안 ' + leak.inPos);
  /* ⑤ '#/…' 링크 */
  const nav = await p.evaluate(async () => { const before = location.href; const a = U2.view.cell('s').querySelector('a.bqs-wl'); a.click(); await new Promise((r) => setTimeout(r, 200)); return { same: location.href === before, cur: U2.cur }; });
  ok(nav.same && nav.cur === 'bk', "블록 안 '♡ 찜' 링크(#/wish)가 새 웹앱 주소·페이지를 바꾸지 않음", JSON.stringify(nav));
  /* 정렬 바꾸기(손님 화면 동작이 그대로) */
  const so = await p.evaluate(async () => { const c = U2.view.cell('s'); const sel = c.querySelector('.bqs-sort'); sel.value = 'title'; sel.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((r) => setTimeout(r, 600)); return { n: c.querySelectorAll('.sp').length, v: sel.value }; });
  ok(so.n > 50 && so.v === 'title', '정렬 바꾸기(상품명) — 책장이 다시 꽂힘', '책등 ' + so.n);
  /* 관리 줄(관리자 기기): 우리숍 미리 보기 주소 = 우리숍 관리 화면과 같은 꼴(#/shelf?cfg=기본값과 다른 칸) · 일반 기기엔 없음 */
  const bar0 = await p.evaluate(() => !!U2.view.cell('s').querySelector('.u2-blkbar'));
  await p.evaluate(() => { U2._adminOverride = true; }); await put(p, PG({ wood: 'cherry', seed: 7 }));
  const bar1 = await p.evaluate(() => { const a = U2.view.cell('s').querySelector('.u2-blkbar a'); if (!a) return null; const u = new URL(a.href); const arg = decodeURIComponent(u.hash.split('cfg=')[1] || ''); return { host: u.host, tgt: a.target, cfg: BQS.previewCfg(arg) }; });
  ok(!bar0 && bar1 && bar1.host === 'booksqueen.com' && bar1.tgt === '_blank' && bar1.cfg.wood === 'cherry' && bar1.cfg.seed === 7 && bar1.cfg.fontsOn === false, "관리 줄 — 관리자 기기에만 '🔗 이 설정으로 우리숍 미리 보기'(우리숍 #/shelf?cfg= · 새 탭 · 저장 없음)", JSON.stringify({ bar0, bar1 }));
  await p.evaluate(() => { U2._adminOverride = false; }); await put(p, PG());
  /* ⑥ 저장 열쇠 */
  const ls1 = await p.evaluate(() => Object.keys(localStorage));
  const newKeys = ls1.filter((k) => !ls0.includes(k));
  ok(newKeys.every((k) => /^rn2-/.test(k)), '블록이 기기에 남긴 열쇠는 rn2- 만', newKeys.join(', ') || '(없음)');
  if (SHOT) { fs.mkdirSync(SHOT, { recursive: true }); await p.screenshot({ path: path.join(SHOT, 'u2night_shelf_pc.png') }); }
  /* ④ 편집기 속성판 = 우리숍 설정 틀 */
  await p.evaluate(() => U2.openEditor('mine')); await p.waitForFunction(() => U2.edit && U2.view && U2.view.cell('s'), null, { timeout: 20000 });
  await p.evaluate(async () => { for (let i = 0; i < 60 && !U2W.defs['shop.shelf']._full; i++) await new Promise((r) => setTimeout(r, 100)); const E = U2.edit; E.sel.clear(); E.sel.add('s'); E.markSel(); E.drawProps(); });
  const pr = await p.evaluate(() => { const P = document.getElementById('u2-edprops'); const skip = (U2.blocks.specs['shop.shelf'].skip || []); const schema = ((window.BQS && BQS.SCHEMA) || []).filter((f) => !skip.includes(f.k)); /* 우리숍 메뉴 칸(on)은 새 웹앱에 뜻이 없어 뺌 */ return { n: schema.length, fields: schema.filter((f) => P.querySelector(`[data-k="${f.k}"],[data-mk="${f.k}"]`)).length, heads: [...P.querySelectorAll('.u2-pgh')].map((h) => h.textContent), multi: P.querySelectorAll('.u2-multi').length, onShown: !!P.querySelector('[data-k="on"]') }; });
  ok(pr.n > 20 && pr.fields === pr.n && !pr.onShown, '속성판에 우리숍 설정 틀 칸이 모두(같은 이름·같은 꼴 · 우리숍 메뉴 칸만 뺌)', pr.fields + '/' + pr.n);
  ok(pr.heads.length >= 5 && pr.heads.includes('책장') && pr.heads.includes('블록'), '속성판 묶음 머리(블록·책장·정렬·책등·글꼴·움직임·확대)', pr.heads.join(' · '));
  ok(pr.multi >= 2, '여럿 고르기 칸(정렬 고르기·책등 디자인·글꼴)', pr.multi);
  const ch = await p.evaluate(async () => { const P = document.getElementById('u2-edprops'); const s = P.querySelector('[data-k="wood"]'); s.value = 'walnut'; s.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((r) => setTimeout(r, 900));
    const m = [...P.querySelectorAll('[data-mk="sorts"]')]; m.forEach((x) => { if (x.value === 'sales' || x.value === 'rec') { x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); } }); await new Promise((r) => setTimeout(r, 900));
    const c = U2.view.cell('s'); const b = c.querySelector('.bqs'); return { wood: b && b.className, sorts: (U2.edit.draft.widgets.s.props || {}).sorts, opts: [...c.querySelectorAll('.bqs-sort option')].map((o) => o.value) }; });
  ok(/wood-walnut/.test(ch.wood || ''), '속성판에서 나무 색 → 호두나무: 블록이 바로 다시 그려짐', ch.wood);
  ok(Array.isArray(ch.sorts) && !ch.sorts.includes('sales') && ch.opts.length === ch.sorts.length, '여럿 고르기(손님이 고를 정렬)에서 둘을 빼면 정렬 칸에도 빠짐', JSON.stringify(ch.sorts) + ' → ' + ch.opts.join(','));
  if (SHOT) await p.screenshot({ path: path.join(SHOT, 'u2night_shelf_edit.png') });
  await p.evaluate(() => { try { U2.edit.close ? U2.edit.close() : null; } catch (e) {} });
  /* 지우면 남는 것 없음 */
  const gone = await p.evaluate(async () => { if (U2.edit && U2.edit.exit) { try { U2.edit.exit(); } catch (e) {} } U2.pages.bk = { id: 'bk', title: 't', grid: { rowH: 16 }, rev: 0, widgets: {}, layouts: { pc: [] } }; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 200)); return { bqs: document.querySelectorAll('.bqs, .bqs-tip, .bqs-pop').length, dup: (() => { const m = {}; document.querySelectorAll('[id]').forEach((e) => (m[e.id] = (m[e.id] || 0) + 1)); return Object.keys(m).filter((k) => m[k] > 1); })() }; });
  ok(gone.bqs === 0 && gone.dup.length === 0, '블록을 지우면 책장·툴팁 남지 않음 · 중복 id 0', JSON.stringify(gone));
  ok((await nonU2Writes(p)).length === 0, 'ui2_ 밖 쓰기 0');
  ok(E(t).length === 0 && t.dialogs.length === 0, '오류 0 · 브라우저 팝업 0', E(t).join(' | ').slice(0, 300));
  await t.close();
  /* ⑦ 휴대폰 */
  t = await open({ q: '?p=bk', settle: 1200, override: serve, vp: { width: 390, height: 844 }, touch: true }); p = t.p;
  await put(p, PG({}, 50));
  const ph = await p.evaluate(() => { const c = U2.view.cell('s'); return { n: c.querySelectorAll('.sp').length, sx: document.documentElement.scrollWidth - innerWidth, bw: Math.round(c.getBoundingClientRect().width) }; });
  ok(ph.n > 10 && ph.sx <= 1, '휴대폰 390: 책장이 그려지고 가로 스크롤 없음', JSON.stringify(ph));
  if (SHOT) await p.screenshot({ path: path.join(SHOT, 'u2night_shelf_phone.png') });
  ok(E(t).length === 0, '오류 0(휴대폰)', E(t).join(' | ').slice(0, 300));
  await t.close();
  done('t_blocks');
})().catch((e) => { console.error(e); process.exitCode = 1; });
