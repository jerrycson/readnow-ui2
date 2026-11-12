/* 리드나우 2 0.4.10 — 성공 사례 견줌(리드나우 2 빈 곳 차례대로)
 *  ① 확인 방식 하나로: 두 번 누르기 단추를 '더블클릭'하면 두 번째 누름은 무시(손 미끄러짐) · 천천히 두 번이면 실행 · 한 뒤 '↶ 되돌리기'(공용 모양·견본·PC 배치 따름)
 *  ② 스캔(ISBN)이 첫 동작: 입력 칸 밖에서 바코드 스캐너로 찍으면 🔎 찾기가 그 ISBN으로 열리고 맨 위 = 📥 등록에 넣기 → 등록 「넣고 조회」 칸에 넣어 둠(조회는 사람이 Enter)
 *     손으로 천천히 친 숫자·입력 칸 안·등록 화면이 열린 때는 손대지 않음
 *  ③ 한 목록 + 보기 탭: 📋 목록 보기 탭 위젯 — 지금 웹앱 큰 목록 탭 · 연 목록의 거르기·검색어를 ⭐ 보기로 저장(이 기기 rn2-) · 누르면 그 거르기로 다시 엶 · 지우기 되돌리기 */
const { open, ok, done, nonU2Writes, seed } = require('./lib');
const ISBN = '9788937460449';
(async () => {
  console.log('[0.4.10 성공 사례 견줌 — 확인 방식 · 스캔 첫 동작 · 목록 보기 탭]');
  const t = await open({ q: '?p=inbox', settle: 2500 }); const p = t.p;
  await seed(p, {});
  /* ① 두 번 누르기 */
  await p.evaluate(async () => { U2.pages.tw = { id: 'tw', title: '두 번', grid: { rowH: 16 }, rev: 0, widgets: { b: { type: 'button', props: { label: '두 번', act: 'toast', arg: '실행함', confirm: true } } }, layouts: { pc: [{ id: 'b', x: 0, y: 0, w: 6, h: 3 }] } }; await U2.go('tw'); });
  await p.waitForTimeout(500);
  const btn = '.u2-cell[data-id="b"] button, [data-wid="b"] button';
  const sel = await p.evaluate(() => { const c = U2.view.cell('b'); const b = c && c.querySelector('button'); if (b) b.id = 'tw_btn'; return !!b; });
  ok(sel, '시험 단추가 놓임', btn);
  await p.dblclick('#tw_btn'); await p.waitForTimeout(150);
  const d1 = await p.evaluate(() => ({ txt: document.getElementById('tw_btn').textContent, ran: /실행함/.test((document.getElementById('u2-toast') || {}).textContent || '') }));
  ok(/한 번 더 누르면/.test(d1.txt) && !d1.ran, '더블클릭 = 두 번째 누름은 무시 — 무장(한 번 더 누르면 …)만 되고 실행 안 됨', JSON.stringify(d1));
  await p.waitForTimeout(450); await p.click('#tw_btn'); await p.waitForTimeout(200);
  const d2 = await p.evaluate(() => /실행함/.test((document.getElementById('u2-toast') || {}).textContent || ''));
  ok(d2, '조금 뒤 한 번 더 누르면 실행(두 번 누르기 그대로)', d2);
  const d3 = await p.evaluate(async () => { const b = document.createElement('button'); document.body.appendChild(b); let n = 0, undone = 0; b.click(); U2.twice(b, '시험', () => { n++; }, { done: '시험 함', undo: () => { undone++; } }); b.click(); U2.twice(b, '시험', () => { n++; }, { done: '시험 함', undo: () => { undone++; } });
    const note = [...document.querySelectorAll('#u2-toast .u2-note')].pop(); const act = note && note.querySelector('.u2-nact'); const lbl = act ? act.textContent : ''; if (act) act.click(); b.remove(); return { n, undone, lbl, txt: note ? note.textContent : '' }; });
  ok(d3.n === 1 && d3.undone === 1 && /되돌리기/.test(d3.lbl) && /시험 함/.test(d3.txt), "opt.undo — 한 뒤 알림에 '↶ 되돌리기'(누르면 그 일만 되돌림) · 키보드·스크립트 누름(더블클릭 아님)은 그대로", JSON.stringify(d3));
  /* 편집기 견본 바꾸기 → 되돌리기 */
  await p.evaluate(() => U2.openEditor('mine')); await p.waitForFunction(() => U2.edit && U2.edit.draft, null, { timeout: 20000 });
  const e1 = await p.evaluate(async () => { const E = U2.edit; const before = Object.keys(E.draft.widgets).join(','); E.sel.clear(); E.drawProps(); const pr = document.getElementById('u2-edprops'); const b = pr && pr.querySelector('[data-tpl="flow"]'); if (!b) return { miss: true };
    b.click(); await new Promise((r) => setTimeout(r, 450)); b.click(); await new Promise((r) => setTimeout(r, 200)); const mid = Object.keys(E.draft.widgets).join(',');
    const note = [...document.querySelectorAll('#u2-toast .u2-note')].pop(); const act = note && note.querySelector('.u2-nact'); if (act) act.click(); await new Promise((r) => setTimeout(r, 200)); return { before, mid, after: Object.keys(E.draft.widgets).join(','), act: !!act }; });
  ok(!e1.miss && e1.mid !== e1.before && e1.act && e1.after === e1.before, "편집기 '견본으로 바꿈'(두 번 누르기) 뒤 알림 '↶ 되돌리기' = 예전 배치로", JSON.stringify(e1).slice(0, 200));
  await p.evaluate(() => { try { U2.edit.close(); } catch (e) {} }); await p.waitForTimeout(400);
  /* ② 스캔이 첫 동작 */
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(800);
  await p.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  await p.keyboard.type(ISBN, { delay: 8 }); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  const s1 = await p.evaluate(() => { const f = document.getElementById('u2-find'); const rows = f ? [...f.querySelectorAll('.u2-findrow')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()) : []; return { open: !!f, val: f ? f.querySelector('input').value : '', rows: rows.slice(0, 3), sec: f ? (f.querySelector('.u2-findk2') || {}).textContent : '' }; });
  ok(s1.open && s1.val === ISBN && /등록에 넣기/.test(s1.rows[0] || '') && /자료에서 찾기/.test(s1.rows[1] || ''), '스캐너로 찍음(입력 칸 밖) → 🔎 찾기가 그 ISBN으로 · 맨 위 📥 등록에 넣기 · 다음 우리 자료에서 찾기', JSON.stringify(s1).slice(0, 260));
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  const s2 = await p.evaluate(() => { const i = document.getElementById('rg_in'); return { sheet: document.getElementById('sheet').classList.contains('on'), reg: !!(S.detail && S.detail.reg), val: i ? i.value : null, focus: document.activeElement === i, items: S.regItems ? S.regItems.size : 0 }; });
  ok(s2.sheet && s2.reg && s2.val === ISBN && s2.focus, 'Enter = 등록 화면이 열리고 「넣고 조회」 칸에 ISBN · 커서도 그 칸(조회는 사람이 Enter)', JSON.stringify(s2));
  /* 등록 화면이 열린 동안 = 지금 웹앱 몫(찾기가 안 열림) */
  await p.evaluate(() => { const i = document.getElementById('rg_in'); if (i) { i.value = ''; i.blur(); } });
  await p.keyboard.type('9788937460456', { delay: 8 }); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => !!document.getElementById('u2-find'))), '등록 화면이 열려 있으면 손대지 않음(지금 웹앱 등록의 스캐너 처리 그대로)');
  await p.evaluate(() => { try { if (document.getElementById('sheet').classList.contains('on')) closeDetail(); } catch (e) {} if (typeof S !== 'undefined') S._regDraft = ''; }); await p.waitForTimeout(600);
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(600); await p.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  await p.keyboard.type(ISBN, { delay: 140 }); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok(!(await p.evaluate(() => !!document.getElementById('u2-find'))), '손으로 천천히 친 숫자(글자 사이 0.14초)는 스캔으로 보지 않음');
  const s4 = await p.evaluate(async () => { const i = document.createElement('input'); document.body.appendChild(i); i.focus(); return true; });
  await p.keyboard.type(ISBN, { delay: 8 }); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const s5 = await p.evaluate(() => { const f = !!document.getElementById('u2-find'); const i = document.querySelector('body > input:last-of-type'); const v = i ? i.value : ''; if (i) i.remove(); return { f, v }; });
  ok(s4 && !s5.f && s5.v === ISBN, '입력 칸 안에서 찍은 것은 그 칸 몫(찾기가 안 열림)', JSON.stringify(s5));
  const s6 = await p.evaluate(() => ({ a: U2.find.isbn('978-89-374-6044-9'), b: U2.find.isbn('89374604X'.padStart(10, '0')), c: U2.find.isbn('홍길동'), d: U2.find.isbn('12345'), e: U2.find.search('8937460440', 'all')[0].kind }));
  ok(s6.a === ISBN && s6.c === null && s6.d === null && s6.e === 'isbn', 'ISBN 알아보기 = 지금 웹앱 공용 규칙(줄표 뗌 · 10/13자리) · 이름·짧은 숫자는 아님 · 손으로 친 ISBN도 맨 위 📥', JSON.stringify(s6));
  /* ③ 목록 보기 탭 */
  await p.evaluate(() => { try { localStorage.removeItem('rn2-listViews'); } catch (e) {} });
  await p.evaluate(async () => { U2.pages.lv = { id: 'lv', title: '목록', grid: { rowH: 16 }, rev: 0, widgets: { l: { type: 'listtabs', props: {} } }, layouts: { pc: [{ id: 'l', x: 0, y: 0, w: 24, h: 6 }] } }; await U2.go('lv'); });
  await p.waitForTimeout(600);
  const l1 = await p.evaluate(() => { const c = U2.view.cell('l'); return { tabs: [...c.querySelectorAll('[data-lvb]')].map((b) => b.textContent.trim()), hint: (c.querySelector('.u2-lvsave') || {}).textContent || '' }; });
  ok(l1.tabs.length >= 3 && l1.tabs.some((x) => /상품 전체/.test(x)) && l1.tabs.some((x) => /주문 전체/.test(x)) && /＋ 지금 보기 저장/.test(l1.hint), '📋 목록 보기 탭 — 지금 웹앱 큰 목록(상품 전체·주문 전체·…)을 한 줄 탭으로 · 저장 안내', JSON.stringify(l1).slice(0, 240));
  await p.waitForFunction(() => { try { return S.prodLoaded; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => { const b = U2.view.cell('l').querySelector('[data-lvb="prodAll"]'); b.click(); }); await p.waitForTimeout(1200);
  const l2 = await p.evaluate(() => ({ on: document.getElementById('sheet').classList.contains('on'), bt: S.detail && S.detail.bigTable, sel: (U2.view.cell('l').querySelector('[data-lvb="prodAll"]') || {}).getAttribute && U2.view.cell('l').querySelector('[data-lvb="prodAll"]').getAttribute('aria-selected') }));
  ok(l2.on && l2.bt === 'prod' && l2.sel === 'true', '탭 📚 상품 전체 → 지금 웹앱 상품 전체 목록이 열림(목록 엔진 그대로) · 그 탭이 고른 탭', JSON.stringify(l2));
  /* 거르기·검색어를 바꾼 뒤 저장 */
  await p.fill('#bt_q', '책'); await p.waitForTimeout(700);
  const fk = await p.evaluate(() => { const b = document.querySelector('#sheet [data-btf]:not(.on)'); if (!b) return null; b.click(); return b.dataset.btf; }); await p.waitForTimeout(400);
  const l3 = await p.evaluate(async () => { const c = U2.view.cell('l'); for (let i = 0; i < 30 && !c.querySelector('[data-lvs]'); i++) await new Promise((r) => setTimeout(r, 100)); const inp = c.querySelector('[data-lvn]'); if (!inp) return { miss: true }; inp.value = '책 보기'; c.querySelector('[data-lvs]').click(); await new Promise((r) => setTimeout(r, 100));
    return { ls: JSON.parse(localStorage.getItem('rn2-listViews') || '[]'), tabs: [...c.querySelectorAll('[data-lvv]')].map((b) => b.textContent.trim()) }; });
  const v0 = (l3.ls || [])[0] || {};
  ok(!l3.miss && v0.name === '책 보기' && v0.scr === 'prodAll' && v0.bt === 'prod' && v0.q === '책' && (!fk || Object.keys(v0.f || {}).length >= 1) && l3.tabs.some((x) => /⭐ 책 보기/.test(x)), "목록을 연 채 '＋ 지금 보기 저장' → ⭐ 탭(검색어·거르기 · 이 기기 rn2-listViews)", JSON.stringify({ v0, fk, tabs: l3.tabs }).slice(0, 300));
  await p.evaluate(() => { try { closeDetail(); } catch (e) {} S._bt_prod.q = ''; S._bt_prod.f = {}; }); await p.waitForTimeout(500);
  await p.evaluate(() => U2.view.cell('l').querySelector('[data-lvv]').click()); await p.waitForTimeout(1000);
  const l4 = await p.evaluate(() => ({ on: document.getElementById('sheet').classList.contains('on'), q: S._bt_prod.q, f: S._bt_prod.f, inp: (document.getElementById('bt_q') || {}).value }));
  ok(l4.on && l4.q === '책' && l4.inp === '책' && (!fk || Object.keys(l4.f || {}).length >= 1), '⭐ 탭을 누르면 그 검색어·거르기로 목록이 다시 열림', JSON.stringify(l4));
  await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(400);
  const l5 = await p.evaluate(async () => { const c = U2.view.cell('l'); c.querySelector('[data-lvx]').click(); await new Promise((r) => setTimeout(r, 100)); const gone = !c.querySelector('[data-lvv]'); const note = [...document.querySelectorAll('#u2-toast .u2-note')].pop(); const a = note && note.querySelector('.u2-nact'); if (a) a.click(); await new Promise((r) => setTimeout(r, 150)); return { gone, back: !!c.querySelector('[data-lvv]'), n: JSON.parse(localStorage.getItem('rn2-listViews') || '[]').length }; });
  ok(l5.gone && l5.back && l5.n === 1, "보기 × 지우기 → 알림 '↶ 되돌리기'로 되살림", JSON.stringify(l5));
  const keys = await p.evaluate(() => Object.keys(localStorage).filter((k) => /listView|listTab|findPins/.test(k)));
  ok(keys.every((k) => /^rn2-/.test(k)), '기기 저장 열쇠는 rn2- 만', keys.join(', '));
  ok((await nonU2Writes(p)).length === 0, 'ui2_ 밖 쓰기 0(등록 칸에 넣기·목록 보기 저장 모두 쓰기 없음)', (await nonU2Writes(p)).join(', '));
  const E = t.errs.filter((e) => !/js-profiling/.test(e) && !/🔒 리드나우 2 시범 중 — 읽기만/.test(e)); /* (0.4.13) 쓰기 막이가 지금 웹앱 뒤 쓰기(등록 칸 묶음 쓰기 등)를 막아 지금 웹앱이 남긴 줄 = 막이가 제대로 일한 것 · 때에 따라 나와 흔들림 */
  ok(E.length === 0 && t.dialogs.length === 0, '오류 0 · 브라우저 팝업 0', E.join(' | ').slice(0, 300));
  await t.close();
  /* 휴대폰: 목록 보기 탭이 가로 스크롤을 만들지 않음 */
  const m = await open({ q: '?p=inbox', settle: 2000, vp: { width: 390, height: 844 }, touch: true }); const q = m.p;
  await q.evaluate(async () => { localStorage.setItem('rn2-listViews', JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ name: '긴 보기 이름 ' + i, scr: 'prodAll', bt: 'prod', title: '📚 상품 전체 보기', q: '' })))); U2.pages.lv = { id: 'lv', title: '목록', grid: { rowH: 16 }, rev: 0, widgets: { l: { type: 'listtabs', props: {} } }, layouts: { pc: [{ id: 'l', x: 0, y: 0, w: 24, h: 6 }] } }; await U2.go('lv'); });
  await q.waitForTimeout(800);
  const ph = await q.evaluate(() => ({ sx: document.documentElement.scrollWidth - innerWidth, tabs: U2.view.cell('l').querySelectorAll('[role=tab]').length }));
  ok(ph.sx <= 1 && ph.tabs >= 10, '휴대폰 390: 탭이 많아도 그 줄만 옆으로 밀림 — 화면 가로 스크롤 없음', JSON.stringify(ph));
  await m.close();
  done('t_scanlist');
})().catch((e) => { console.error(e); process.exitCode = 1; });
