/* 리드나우 2 — 단계 9 새 기능(성공 사례 견줌 '이어서' · 0.4.5) · 단계 11 최적화 하나
 *  ① 🔔 알림 한 자리(왼쪽 아래 · 쌓임 3 · 같은 글 한 줄 · 되돌리기 단추 · 떠 있는 단추와 안 겹침)
 *  ⑬ 오류 글 사람 말(영어 원문 → 한국어 + 원문 괄호)
 *  ② ⚡ 빠른 작업(지금 웹앱 머리줄이 없는 페이지에서만 · 숫자 = 지금 웹앱 셈 · 누르면 그 화면)
 *  ⑤ 🔎 어디서나 찾기(Ctrl+K · 범위 칩 · 초성 · ↑↓ Enter Esc · 자료 찾기 = 지금 웹앱 검색 그대로 · 옛 화면이 열려 있으면 지금 웹앱 몫)
 *  최적화: 같은 탭 덩어리(🧱)와 '탭 전체에서 떼어 낼 섹션'을 탭 한 번 그리기로
 *  + 단계 9 정범님 손 확인('받은편지함·스캔 검수 직접 써 보기')을 사람처럼 눌러 보는 시험으로(11/10 정범님 '손 체크리스트 없이 시험으로') */
const { open, ok, done, nonU2Writes, seed } = require('./lib');
(async () => {
  console.log('[단계 9 새 기능 · 0.4.5]');
  let t = await open({ q: '?p=inbox', settle: 2500 }); let p = t.p;
  await seed(p, {});
  /* ① 알림 한 자리 */
  const n1 = await p.evaluate(async () => {
    U2.toast('하나'); U2.toast('둘'); U2.toast('셋'); U2.toast('넷'); U2.toast('넷');
    const t = document.getElementById('u2-toast'); const r = t.getBoundingClientRect();
    const notes = [...t.querySelectorAll('.u2-note')].map((n) => n.textContent);
    let undone = 0; const n = U2.toast('지움', 0, 0, { act: { label: '되돌리기', fn: () => { undone++; } } }); n.querySelector('.u2-nact').click();
    return { notes, left: Math.round(r.left), bottomGap: Math.round(innerHeight - r.bottom), want: U2.notesBottom(), undone, gone: !n.isConnected };
  });
  ok(n1.notes.length === 3 && /넷 ×2/.test(n1.notes[2]) && n1.left <= 20 && Math.abs(n1.bottomGap - n1.want) <= 4, '🔔 알림 한 자리: 왼쪽 아래 — 지금 웹앱 알림 자리(⬇ 받는 중 띠 등) 바로 위에 쌓임(최대 3 · 오래된 것부터 사라짐) · 같은 글이 잇달아 오면 한 줄 + ×횟수', JSON.stringify(n1));
  ok(n1.undone === 1 && n1.gone, "알림의 '되돌리기' 단추 = 그 일만 되돌리고 알림 닫음", JSON.stringify({ undone: n1.undone }));
  const e1 = await p.evaluate(() => { U2.toast('저장 실패: Failed to fetch', 1); U2.toast('⚠ 읽기 실패: Missing or insufficient permissions.', 1); const a = [...document.querySelectorAll('#u2-toast .u2-note.err')].map((n) => n.textContent); return { a, k: U2.errKo(new SyntaxError("Unexpected end of JSON input")), keep: U2.koMsg('화면을 열 수 없음: ship') }; });
  ok(/저장 실패: 연결이 끊김.*\(Failed to fetch\)/.test(e1.a.join('|')) && /읽기 실패: 권한 없음/.test(e1.a.join('|')) && /응답이 비었거나 잘/.test(e1.k) && e1.keep === '화면을 열 수 없음: ship', '⑬ 오류 알림의 영어 원문 → 무엇을 할지 한국어(원문은 괄호) · 앞 설명과 낱말 하나(ship)는 그대로', JSON.stringify(e1).slice(0, 300));
  const fabHit = await p.evaluate(async () => { U2.pages.fl = { id: 'fl', title: '떠 있는 것', grid: { rowH: 16 }, rev: 0, widgets: { f: { type: 'fab', props: { icon: '➕', label: '빠른 일' } } }, layouts: { pc: [{ id: 'f', x: 0, y: 0, w: 2, h: 3, float: true }] } }; await U2.go('fl'); await new Promise((r) => setTimeout(r, 300)); U2.toast('하나 더'); U2.toast('하나 더 둘'); U2.toast('하나 더 셋'); const a = document.querySelector('.u2-fab').getBoundingClientRect(); const b = document.getElementById('u2-toast').getBoundingClientRect(); return { hit: a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom, a: [a.left, a.top, a.right, a.bottom].map(Math.round), b: [b.left, b.top, b.right, b.bottom].map(Math.round) }; });
  ok(!fabHit.hit, '왼쪽 떠 있는 단추(위젯)가 있으면 알림은 그 옆으로 — 안 겹침', JSON.stringify(fabHit));
  /* ② 빠른 작업 */
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(800);
  const qa = await p.evaluate(() => { const b = document.getElementById('u2-qa'); return { shown: !!b && !b.hidden && b.offsetParent !== null, btns: b ? [...b.querySelectorAll('[data-u2qa]')].map((x) => x.textContent) : [] }; });
  ok(qa.shown && qa.btns.length === 3, '⚡ 빠른 작업: 지금 웹앱 머리줄이 없는 📥 할 일 페이지 머리줄에 📥 등록 · 🚚 오늘 출고 · ＋ 매입', JSON.stringify(qa));
  await p.click('#u2-qa [data-u2qa="reg"]'); await p.waitForTimeout(1500);
  const reg = await p.evaluate(() => ({ on: document.getElementById('sheet').classList.contains('on'), reg: !!(S.detail && S.detail.reg), cnt: U2.find.qaCounts() }));
  ok(reg.on && reg.reg, '📥 등록 단추 → 지금 웹앱 상품 등록 화면이 열림(지금 웹앱 openRegister 그대로)', JSON.stringify(reg));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600); await p.evaluate(() => { try { if (document.getElementById('sheet').classList.contains('on')) closeDetail(); } catch (e) {} });
  await p.evaluate(() => U2.go('home')); await p.waitForTimeout(2500);
  const qh = await p.evaluate(() => { const b = document.getElementById('u2-qa'); const lq = document.getElementById('ux2qa'); const lb = lq ? [...lq.querySelectorAll('[data-ux2qa] b')].map((x) => x.textContent) : null; const mine = U2.find.qaCounts(); return { hidden: !b || b.hidden, legacy: !!(lq && lq.offsetParent), lb, mine }; });
  ok(qh.legacy ? qh.hidden : !qh.hidden, '지금 웹앱 머리줄(빠른 작업 든)이 있는 🏠 홈에서는 새 웹앱 쪽을 숨김 — 두 벌 안 보임', JSON.stringify(qh));
  ok(!qh.lb || (String(qh.lb[0] || '') === (qh.mine.reg ? String(qh.mine.reg) : '') && String(qh.lb[1] || '') === (qh.mine.ship ? String(qh.mine.ship) : '')), '빠른 작업 숫자 = 지금 웹앱 머리 칸 숫자와 같은 셈', JSON.stringify(qh));
  /* ⑤ 어디서나 찾기 */
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(600);
  await p.keyboard.press('Control+k'); await p.waitForTimeout(300);
  const f0 = await p.evaluate(() => ({ open: !!document.getElementById('u2-find'), focus: document.activeElement && document.activeElement.closest && !!document.activeElement.closest('#u2-find'), chips: [...document.querySelectorAll('#u2-find [data-sc]')].map((b) => b.textContent) }));
  ok(f0.open && f0.focus && f0.chips.length === 7, '🔎 Ctrl+K → 어디서나 찾기(찾을 글 칸에 바로) · 범위 칩 7(전체·페이지·기능·⚙ 설정·화면·위젯·자료)', JSON.stringify(f0));
  await p.keyboard.type('오늘 출고'); await p.waitForTimeout(250);
  const f1 = await p.evaluate(() => [...document.querySelectorAll('#u2-find .u2-findrow')].map((b) => b.textContent.slice(0, 40)));
  ok(/자료에서 찾기/.test(f1[0] || '') && f1.some((x) => /🔧.*오늘 출고/.test(x)) && f1.some((x) => /🪟.*오늘 출고/.test(x)), "'오늘 출고' → 맨 위 자료 찾기 · 🔧 기능(지금 웹앱 🔍 기능 찾기) · 🪟 화면이 함께", f1.slice(0, 6).join(' | '));
  await p.fill('#u2-find input', 'ㅇㄴㅊㄱ'); await p.waitForTimeout(250);
  const f2 = await p.evaluate(() => [...document.querySelectorAll('#u2-find .u2-findrow')].map((b) => b.textContent.slice(0, 30)));
  ok(f2.some((x) => /오늘 출고/.test(x)), "초성 'ㅇㄴㅊㄱ' → 오늘 출고", f2.slice(0, 4).join(' | '));
  await p.click('#u2-find [data-sc="page"]'); await p.fill('#u2-find input', '매입'); await p.waitForTimeout(250);
  const f3 = await p.evaluate(() => ({ rows: [...document.querySelectorAll('#u2-find .u2-findrow')].map((b) => b.textContent.slice(0, 20)), saved: U2.ls.get('findScope') }));
  ok(f3.rows.length >= 1 && f3.rows.every((x) => !/자료에서 찾기/.test(x)) && f3.saved === 'page', '📄 페이지 칩 → 페이지만 · 고른 찾는 곳은 이 기기에 기억', JSON.stringify(f3));
  await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
  const f4 = await p.evaluate(() => ({ cur: U2.cur, open: !!document.getElementById('u2-find') }));
  ok(f4.cur === 'purchase' && !f4.open, 'Enter → 그 페이지로 가고 찾기 창 닫힘', JSON.stringify(f4));
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(500);
  await p.keyboard.press('Control+k'); await p.waitForTimeout(200); await p.click('#u2-find [data-sc="feat"]'); await p.fill('#u2-find input', '없는기능글자ㅋㅋ'); await p.waitForTimeout(200);
  const f5 = await p.evaluate(() => ({ empty: /여기엔 없음/.test(document.querySelector('#u2-find .u2-findres').textContent), all: !!document.querySelector('#u2-find [data-allsc]') }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  const f5b = await p.evaluate(() => !document.getElementById('u2-find'));
  ok(f5.empty && f5.all && f5b, "없으면 '여기엔 없음 · 🌐 전체에서 찾기' · Esc로 닫힘", JSON.stringify(f5));
  /* (0.4.8 · 견줌 ⑧ 설정 찾기) 섹션 이름(지금 웹앱 🔍 기능 찾기의 SECS)도 찾힘 · ⚙ 설정 범위 = 설정 탭 칸만 · Enter = 설정 탭에서 그 칸을 펼침 */
  await p.keyboard.press('Control+k'); await p.waitForTimeout(200); await p.click('#u2-find [data-sc="set"]'); await p.fill('#u2-find input', '번외 수집기'); await p.waitForTimeout(250);
  const g1 = await p.evaluate(() => ({ rows: [...document.querySelectorAll('#u2-find .u2-findrow')].map((b) => b.textContent.replace(/\s+/g, ' ').slice(0, 50)), allSet: U2.find.search('', 'set').every((r) => r.set), nSet: U2.find.search('', 'set').length, nFeat: U2.find.sources().filter((r) => r.kind === 'feat').length, nOld: (U2.legacy.list('FEAT') || []).length }));
  ok(g1.rows.some((t) => /번외 수집기 설정/.test(t)) && g1.allSet && g1.nSet >= 20 && g1.nFeat > g1.nOld, "⚙ 설정 범위 — '번외 수집기'로 🧪 번외 수집기 설정 칸이 찾힘 · 설정 탭 칸만 · 기능 목록 = 지금 웹앱 기능 찾기 전체(FEAT보다 많음)", JSON.stringify({ r: g1.rows.slice(0, 3), nSet: g1.nSet, nFeat: g1.nFeat, nOld: g1.nOld }));
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  const g2 = await p.evaluate(() => ({ cur: U2.cur, tab: S.tab, open: !!S.sec.set_col2, find: !!document.getElementById('u2-find'), el: !!document.querySelector('details.sec[data-sec="set_col2"][open]') }));
  ok(g2.tab === 'settings' && g2.cur === ((await p.evaluate(() => (U2.pageForTab && U2.pageForTab('settings')) || U2.cur))) && g2.open && !g2.find, 'Enter → ⚙ 설정 페이지로 가서 그 칸을 펼침(지금 웹앱 기능 찾기와 같은 길)', JSON.stringify(g2));
  await p.evaluate(() => U2.ls.set('findScope', 'all'));
  await p.keyboard.press('Control+k'); await p.waitForTimeout(200); await p.fill('#u2-find input', '손님A'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
  const f6 = await p.evaluate(() => { const q = document.getElementById('q'); return { cur: U2.cur, q: q && q.value, sq: S.q }; });
  ok(f6.q === '손님A' && f6.sq === '손님A', "자료 찾기(맨 위 줄) = 지금 웹앱 검색창에 그 글을 넣어 지금 웹앱 검색 그대로", JSON.stringify(f6));
  await p.evaluate(() => { const q = document.getElementById('q'); if (q) { q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); } });
  await p.evaluate(() => { try { openRegister(); } catch (e) {} }); await p.waitForTimeout(1200);
  await p.keyboard.press('Control+k'); await p.waitForTimeout(250);
  const f7 = await p.evaluate(() => ({ sheet: document.getElementById('sheet').classList.contains('on'), find: !!document.getElementById('u2-find') }));
  ok(f7.sheet && !f7.find, '등록·출고 같은 옛 화면이 열려 있으면 Ctrl+K는 지금 웹앱 몫(새 찾기 창 안 띄움 — 등록 손 습관 그대로)', JSON.stringify(f7));
  await p.evaluate(() => { try { if (document.getElementById('sheet').classList.contains('on')) closeDetail(); } catch (e) {} }); await p.waitForTimeout(400);
  /* 최적화: 같은 탭 덩어리 + 탭 전체에서 떼어 낼 섹션 = 한 번 그리기 */
  const sh = await p.evaluate(async () => {
    const A = U2.adapters; const tabs = ['settings', 'products', 'orders', 'purchase', 'biz', 'market', 'sellers'];
    for (const tab of tabs) {
      const box = document.createElement('div'); box.style.cssText = 'position:absolute;left:-99999px;top:0;width:1200px;visibility:hidden'; document.body.appendChild(box);
      const keep = S.tab; S.tab = tab; try { A.RENDER[tab](box); } catch (e) {} S.tab = keep;
      const B = (typeof tobBlocks === 'function' ? tobBlocks(box) : []); const secs = [...box.querySelectorAll('details.sec[data-sec]')].map((d) => d.dataset.sec); box.remove();
      const blk = B.find((b) => b.els.every((el) => !el.matches('details.sec') && !el.querySelector('details.sec'))); if (!blk || !secs.length) continue;
      const onlyMiss = secs.filter((id) => !A.renderSecs(tab, [id], 'only')[id]); if (!onlyMiss.length) continue;
      const sec = onlyMiss[0]; const W0 = { a: { type: 'legacy.sec', props: { ref: sec, tab } }, b: { type: 'legacy.sec', props: { ref: blk.k, tab } } };
      U2.pages.shr = { id: 'shr', title: '나눔', grid: { rowH: 16 }, rev: 0, widgets: W0, layouts: { pc: [{ id: 'a', x: 0, y: 0, w: 12, h: 16 }, { id: 'b', x: 12, y: 0, w: 12, h: 16 }] } };
      await U2.go('shr'); const r0 = A.renders, s0 = A.shared || 0; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 200));
      const a = U2.view.cell('a'), b = U2.view.cell('b');
      return { tab, sec, blk: blk.k, renders: A.renders - r0, shared: (A.shared || 0) - s0, secOk: !!(a && a.querySelector(`details.sec[data-sec="${sec}"]`)), blkOk: !!(b && b.querySelector('.u2-seccards') && b.textContent.trim().length > 0) };
    }
    return { none: true };
  });
  if (sh.none) ok(true, '최적화: 시험 자료에 덩어리+탭 전체 섹션이 함께 있는 탭이 없음 — 건너뜀');
  else ok(sh.secOk && sh.blkOk && sh.shared >= 1 && sh.renders <= 2, `최적화: 같은 탭(${sh.tab}) 🧱 덩어리 + 탭 전체에서 떼어 낼 섹션 = 탭 그리기 ${sh.renders}번(예전 3번 — 고른 것만·섹션용 전체·덩어리용 전체)`, JSON.stringify(sh));
  /* 단계 9 손 확인 대신: 받은편지함·스캔 검수를 사람처럼 */
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(1200);
  const ib = await p.evaluate(() => { const rows = [...document.querySelectorAll('.u2-inbox [data-i], .u2-inbox button, .u2-inbox a')]; return { n: rows.length, txt: (document.querySelector('.u2-inbox') || {}).textContent || '' }; });
  ok(ib.n >= 7 && /등록 진행 중/.test(ib.txt) && /오늘 출고 남은 일/.test(ib.txt), '📥 받은편지함: 📥 등록 진행 · 🚚 오늘 출고 남은 일 줄(0.4.5) 포함 7줄 모두 눌러지는 단추', ib.n + '줄');
  const ib2 = []; for (let i = 0; i < Math.min(ib.n, 8); i++) { await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(700); const r = await p.evaluate((i) => { const b = [...document.querySelectorAll('.u2-inbox [data-i], .u2-inbox button, .u2-inbox a')][i]; if (!b) return null; const name = (b.closest('.u2-ibr') || b).textContent.trim().slice(0, 24); const sig = () => location.search + '|' + document.getElementById('sheet').classList.contains('on') + '|' + document.querySelectorAll('.u2-layer, .u2-modal, #modal.on').length; const before = sig(); window.__sig = sig; b.click(); return { name, before }; }, i); if (!r) continue; await p.waitForTimeout(1200); const after = await p.evaluate(() => window.__sig()); ib2.push({ name: r.name, moved: after !== r.before }); await p.evaluate(() => { document.querySelectorAll('.u2-layer, .u2-modal').forEach((x) => x.remove()); try { if (typeof closeModal === 'function') closeModal(); } catch (e) {} try { if (document.getElementById('sheet').classList.contains('on')) closeDetail(); } catch (e) {} }); }
  ok(ib2.length >= 7 && ib2.every((x) => x.moved), '받은편지함 줄을 하나씩 누르면 모두 그 화면·페이지로 감', ib2.map((x) => (x.moved ? '✓' : '✗') + x.name).join(' · '));
  const sc = await p.evaluate(async () => {
    U2.pages.sc9 = { id: 'sc9', title: '검수', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'scan', props: { list: '9788900000001 | 시험 책 하나\n9788900000002 | 시험 책 둘' } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 12, h: 12 }] } };
    await U2.go('sc9'); for (let i = 0; i < 40 && !document.querySelector('.u2-cell .u2-scan input'); i++) await new Promise((r) => setTimeout(r, 100));
    const inp = () => document.querySelector('.u2-cell .u2-scan input'); const msg = () => (document.querySelector('.u2-cell .u2-scanmsg') || {}).textContent || '';
    const scan = async (code) => { const i = inp(); i.focus(); i.value = code; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await new Promise((r) => setTimeout(r, 120)); return msg(); };
    const a = await scan('978-8900000001'); const b = await scan('9788900000009'); const c = await scan('9788900000002'); const d = await scan('9788900000001');
    const focus = document.activeElement === inp(); const saved = U2.ls.get('scan-s', []);
    return { a, b, c, d, focus, saved };
  });
  ok(/✓/.test(sc.a) && /✕/.test(sc.b) && /✓/.test(sc.c) && sc.focus && (sc.saved || []).length === 2, '🔎 스캔 검수를 스캐너처럼(번호 치고 Enter): 맞음 ✓ · 목록 밖 ✕ · 줄표가 섞여도 맞음 · 칸에 계속 포커스 · 확인한 것 이 기기에 기억', JSON.stringify(sc).slice(0, 260));
  await p.reload(); await p.waitForFunction(() => window.U2 && U2.legacy && U2.legacy.shellDone, null, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(1200);
  const sc2 = await p.evaluate(async () => { U2.pages.sc9 = { id: 'sc9', title: '검수', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'scan', props: { list: '9788900000001 | 시험 책 하나\n9788900000002 | 시험 책 둘' } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 12, h: 12 }] } }; await U2.go('sc9'); for (let i = 0; i < 40 && !document.querySelector('.u2-cell .u2-scan'); i++) await new Promise((r) => setTimeout(r, 100)); return (document.querySelector('.u2-cell .u2-scan') || {}).textContent || ''; });
  ok(/2 \/ 2/.test(sc2), '새로 고침 뒤에도 스캔 검수 확인 수(2/2) 그대로', sc2.slice(0, 120));
  ok((await nonU2Writes(p)).length === 0, '이번 새 기능은 자료 쓰기 없음(ui2_ 밖 쓰기 0)');
  ok(t.dialogs.length === 0, '브라우저 팝업 0'); const errs = t.errs.filter((e) => !/js-profiling/.test(e) && !/시범 중 — 읽기만/.test(e)); ok(errs.length === 0, '화면 오류 0(시범 막이가 막은 쓰기 알림은 뺌 — 막는 것이 맞음)', errs.slice(0, 3).join(' / '));
  await t.close();
  /* 휴대폰: 빠른 작업·찾기 단추가 머리줄을 넘치지 않음 */
  t = await open({ q: '?p=inbox', vp: { width: 390, height: 844 }, touch: true, settle: 2500 }); p = t.p;
  const ph = await p.evaluate(() => { const bar = document.getElementById('u2-bar'); const fb = document.getElementById('u2-findbtn'); fb.click(); const L = document.getElementById('u2-find'); const r = L && L.querySelector('.u2-findbox').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth, w: innerWidth, barH: Math.round(bar.getBoundingClientRect().height), box: r ? [Math.round(r.left), Math.round(r.right)] : null }; });
  ok(ph.sw <= ph.w + 1 && ph.box && ph.box[0] >= 0 && ph.box[1] <= ph.w, '휴대폰 390: 가로로 넘치지 않음 · 🔎 단추로 찾기 창이 화면 안에', JSON.stringify(ph));
  await t.close();
  done('t_bench');
})().catch((e) => { console.error(e); process.exit(1); });
