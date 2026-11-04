/* 단계 5 완료 조건 — 행동·자료·계산·페이지 (설계안 11-2 단계 5 · H-05)
 * 브라우저 팝업 0(alert/confirm/prompt/window.open 감시) · 행동 차례 실행(실패하면 멈춤/계속) · 모달·서랍 층 · 변수 → 식 위젯 다시 그림
 * · 보이기 조건 · 저장한 보기(N12) · 단축키(겹침 막음) · Firestore 질의 예산(넘으면 게시 막힘) · 뒤로 가기 */
const { open, ok, done, nonU2Writes } = require('./lib');
const watch = () => { window.__pop = []; for (const k of ['alert', 'confirm', 'prompt', 'open']) { const o = window[k]; window[k] = function () { window.__pop.push(k); return k === 'confirm' ? false : null; }; window[k].__o = o; } };
const pg = (widgets, layout) => ({ id: 'act', title: '행동', icon: '🎬', grid: { rowH: 16 }, rev: 0, widgets, layouts: { pc: layout } });
(async () => {
  console.log('[단계 5] 행동·자료·계산');
  const t = await open({ q: '?p=act', settle: 2000, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); }, seed: { ui2_pages: { a1: { title: '가' }, a2: { title: '나' }, a3: { title: '다' } } } }); const p = t.p;
  await p.evaluate(watch); await p.addStyleTag({ content: '.verbar{display:none!important}' });
  const set = (pgv) => p.evaluate(async (v) => { U2.pages.act = v; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 50)); }, pgv);
  ok(await p.evaluate(() => U2.actions.order.length >= 16), '행동 종류', await p.evaluate(() => U2.actions.order.length + '가지: ' + U2.actions.order.map((k) => U2.actions.defs[k].name).join(' · ')));
  /* 변수 → 계산 카드·숫자 카드(=식)·{{식}} */
  await set(pg({ k: { type: 'kpi', props: { label: '두 배', value: '=수 * 2', unit: '권' } }, c: { type: 'calc', props: { label: '퍼센트', expr: '퍼센트(수, 8)', unit: '%', warnIf: '값 > 50' } }, t: { type: 'text', props: { text: '지금 수는 {{수}} · {{원(수 * 1000)}}' } }, b: { type: 'button', props: { label: '계산', seq: '계산해서 변수에: 수 = 수 + 2\n짧은 알림: 수는 {{수}}' } } },
    [{ id: 'k', x: 0, y: 0, w: 6, h: 5 }, { id: 'c', x: 6, y: 0, w: 6, h: 5 }, { id: 't', x: 12, y: 0, w: 12, h: 5 }, { id: 'b', x: 0, y: 6, w: 6, h: 3 }]));
  await p.evaluate(() => U2.data.setVar('수', 3)); await p.waitForTimeout(900);
  const v1 = await p.evaluate(() => ({ k: U2.view.cell('k').textContent, c: U2.view.cell('c').textContent, warn: !!U2.view.cell('c').querySelector('.u2-warn'), t: U2.view.cell('t').textContent }));
  ok(/6/.test(v1.k) && /37\.5/.test(v1.c) && !v1.warn && /3 · ₩3,000/.test(v1.t), '변수를 바꾸면 식이 든 위젯만 0.7초 모아 다시 그림(=식 · 계산 카드 · {{식}})', JSON.stringify(v1));
  await p.click('.u2-cell[data-wid="b"] button'); await p.waitForTimeout(900);
  const v2 = await p.evaluate(() => ({ n: U2.vars['수'], c: U2.view.cell('c').textContent, warn: !!U2.view.cell('c').querySelector('.u2-warn'), toast: document.getElementById('u2-toast').textContent }));
  ok(v2.n === 5 && /62\.5/.test(v2.c) && v2.warn && /수는 5/.test(v2.toast), '차례 행동(계산 → 알림)이 차례대로 · 빨강 조건(값 > 50)', JSON.stringify(v2));
  /* 실패하면 멈춤 / 계속 */
  const seq = await p.evaluate(async () => { const a = await U2.actions.run(U2.actions.parseSeq('변수 바꾸기: x = 1\n다른 위젯 접기/펴기: 없는위젯\n변수 바꾸기: y = 2'), {}); const b = await U2.actions.run(U2.actions.parseSeq('변수 바꾸기: x = 1\ntoggle: 없는위젯\nset: z = 3'), {}, { keepGoing: true }); return { a, b, y: U2.vars.y, z: U2.vars.z }; });
  ok(seq.a.length === 1 && seq.y === undefined, '앞 행동이 실패하면 멈춤(기본)', JSON.stringify(seq.a));
  ok(seq.b.length === 2 && seq.z === '3', "'계속'을 고르면 실패를 건너뛰고 다음 행동", JSON.stringify(seq.b));
  /* 보이기 조건 */
  await set(pg({ s: { type: 'badge', props: { text: '보여요', showIf: '보기 = "켬"' } }, n: { type: 'badge', props: { text: '늘', devOnly: 'admin' } } }, [{ id: 's', x: 0, y: 0, w: 4, h: 2 }, { id: 'n', x: 4, y: 0, w: 4, h: 2 }]));
  const c0 = await p.evaluate(() => [!!U2.view.cell('s'), !!U2.view.cell('n')]);
  await p.evaluate(() => U2.data.setVar('보기', '켬')); await p.waitForTimeout(900);
  const c1 = await p.evaluate(() => !!U2.view.cell('s'));
  await p.evaluate(() => { U2._adminOverride = false; U2.render(); }); const c2 = await p.evaluate(() => !!U2.view.cell('n')); await p.evaluate(() => { U2._adminOverride = true; });
  ok(!c0[0] && c1, "보이기 조건: '보기 = 켬'일 때만 보임(변수가 바뀌면 저절로)", JSON.stringify([c0[0], c1]));
  ok(c0[1] && !c2, "'관리자 기기에서만' 위젯은 관리자 기기가 아니면 숨김");
  /* 모달·서랍·접기·탭·페이지 */
  await p.evaluate(() => { U2.pages.mini = { id: 'mini', title: '작은 페이지', icon: '🪟', grid: { rowH: 16 }, rev: 0, widgets: { h: { type: 'heading', props: { text: '라이트박스 안' } } }, layouts: { pc: [{ id: 'h', x: 0, y: 0, w: 24, h: 3 }] } }; });
  await set(pg({ m: { type: 'button', props: { label: '모달', act: 'modal', arg: 'mini' } }, d: { type: 'button', props: { label: '서랍', act: 'drawer', arg: '서랍 안 **글**' } }, tb: { type: 'tabs', props: {} }, g: { type: 'button', props: { label: '탭2', act: 'tab', arg: 'tb:2' } }, f: { type: 'button', props: { label: '접기', act: 'toggle', arg: 'tb' } }, go: { type: 'button', props: { label: '주문으로', act: 'page', arg: 'orders' } } },
    [{ id: 'm', x: 0, y: 0, w: 4, h: 3 }, { id: 'd', x: 4, y: 0, w: 4, h: 3 }, { id: 'g', x: 8, y: 0, w: 4, h: 3 }, { id: 'f', x: 12, y: 0, w: 4, h: 3 }, { id: 'go', x: 16, y: 0, w: 4, h: 3 }, { id: 'tb', x: 0, y: 3, w: 12, h: 8 }]));
  await p.click('.u2-cell[data-wid="m"] button'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const L = document.querySelector('.u2-layer.u2-modal'); return !!L && /라이트박스 안/.test(L.textContent); }), "'모달로 열기' → 다른 페이지를 화면 안 층에(라이트박스)");
  await p.keyboard.press('Escape'); await p.waitForTimeout(100); ok(await p.evaluate(() => !document.querySelector('.u2-layer')), 'Esc로 닫힘');
  await p.click('.u2-cell[data-wid="d"] button'); ok(await p.evaluate(() => { const L = document.querySelector('.u2-layer.u2-drawer'); const ok0 = !!L && !!L.querySelector('b'); if (L) L.remove(); return ok0; }), "'서랍으로 열기' → 화면 안 서랍(짧은 서식)");
  await p.click('.u2-cell[data-wid="g"] button'); ok(await p.evaluate(() => /둘째 탭/.test(U2.view.cell('tb').querySelector('.u2-tabb').textContent)), "'다른 위젯 탭 바꾸기'");
  await p.click('.u2-cell[data-wid="f"] button'); ok(await p.evaluate(() => U2.view.cell('tb').classList.contains('u2-folded')), "'다른 위젯 접기/펴기'");
  await p.click('.u2-cell[data-wid="go"] button'); await p.waitForTimeout(600); const atOrders = await p.evaluate(() => U2.cur);
  await p.goBack(); await p.waitForTimeout(600); const back = await p.evaluate(() => U2.cur);
  ok(atOrders === 'orders' && back === 'act', "'페이지로' → 주소 ?p= · 뒤로 가기로 돌아옴(H-05)", atOrders + ' → ' + back);
  /* 옛 화면 열기 행동 + 뒤로 */
  await p.evaluate(() => U2.actions.run([{ do: 'screen', arg: 'ship' }])); await p.waitForTimeout(900);
  const sh = await p.evaluate(() => document.getElementById('sheet').classList.contains('on')); await p.goBack(); await p.waitForTimeout(700);
  ok(sh && (await p.evaluate(() => !document.getElementById('sheet').classList.contains('on') && U2.cur === 'act')), "'지금 웹앱 화면 열기' 행동 → 상세 층 · 뒤로 가기로 닫고 페이지 그대로");
  /* 저장한 보기(N12) */
  await p.evaluate(() => { U2.data.setVar('판매처', '알라딘'); }); await p.evaluate(() => U2.data.saveView('알라딘만', false));
  await p.evaluate(() => U2.data.saveView('공용 보기', true));
  await p.evaluate(() => { U2.vars['판매처'] = '예스24'; }); await p.evaluate(() => U2.go('home')); await p.waitForTimeout(400);
  await p.evaluate(() => U2.data.openView('알라딘만')); await p.waitForTimeout(500);
  const vw = await p.evaluate(() => ({ cur: U2.cur, v: U2.vars['판매처'], mine: (JSON.parse(localStorage.getItem('rn2-views')) || []).length, pub: ((__FS.ui2_site || {}).main || {}).views }));
  ok(vw.cur === 'act' && vw.v === '알라딘' && vw.mine === 1, '저장한 보기: 이름 붙여 저장 → 열면 그 페이지와 거르기(변수)로', JSON.stringify({ cur: vw.cur, v: vw.v }));
  ok(Array.isArray(vw.pub) && vw.pub.length === 1, '공용 보기는 관리자 기기에서 ui2_site에(모든 기기)');
  /* 단축키 */
  await set(pg({ k: { type: 'button', props: { label: '단축', act: 'set', arg: '눌림 = 예', key: 'Alt+1' } }, bad: { type: 'button', props: { label: '겹침', act: 'set', arg: '나쁨 = 예', key: 'Ctrl+F' } } }, [{ id: 'k', x: 0, y: 0, w: 4, h: 3 }, { id: 'bad', x: 4, y: 0, w: 4, h: 3 }]));
  await p.click('#u2-page', { position: { x: 5, y: 300 } }).catch(() => {}); await p.keyboard.press('Alt+1'); await p.keyboard.press('Control+F').catch(() => {}); await p.waitForTimeout(100);
  const kk = await p.evaluate(() => ({ a: U2.vars['눌림'], b: U2.vars['나쁨'] }));
  ok(kk.a === '예' && kk.b === undefined, '단축키 Alt+1로 단추 실행 · 옛 단축키와 겹치는 Ctrl+F는 실행 안 함', JSON.stringify(kk));
  const hz = await p.evaluate(() => { U2.openEditor('pub'); const h = U2.edit.health(); U2.edit.close(true); return h; });
  ok(hz.some((x) => /단축키 bad/.test(x)), '배치 검사가 겹치는 단축키를 알림', hz.join(' / '));
  /* Firestore 질의 위젯 · 예산 */
  await set(pg({ q: { type: 'query', props: { col: 'ui2_pages', limit: 10, fields: 'title' } } }, [{ id: 'q', x: 0, y: 0, w: 12, h: 12 }]));
  await p.waitForTimeout(500);
  const qr = await p.evaluate(() => ({ rows: U2.view.cell('q').querySelectorAll('tbody tr').length, txt: U2.view.cell('q').textContent }));
  ok(qr.rows >= 3 && /가/.test(qr.txt), 'Firestore 질의 위젯(읽기만): ui2_pages 문서를 표로', qr.rows + '줄');
  const big = await p.evaluate(async () => { let r = ''; try { await U2.data.query({ col: 'ui2_pages', limit: 500 }); } catch (e) { r = e.message; } const W0 = {}; for (let i = 0; i < 6; i++) W0['q' + i] = { type: 'query', props: { col: 'ui2_pages', limit: 200 } }; U2.pages.act = { id: 'act', title: '행동', grid: { rowH: 16 }, rev: 0, widgets: W0, layouts: { pc: [] } }; U2.openEditor('pub'); const h = U2.edit.health(); const b = document.querySelector('#u2-edtop [data-e="pub"]'); U2.edit.push(); U2.edit.draft.title = '바꿈'; U2.edit.publish(b); const rev = (U2.pages.act || {}).rev; U2.edit.close(true); return { r, h: h.filter((x) => /질의 합/.test(x)), rev, toast: document.getElementById('u2-toast').textContent }; });
  ok(/200문서까지/.test(big.r), '한 질의 200문서 넘으면 막힘', big.r);
  ok(big.h.length === 1 && big.rev === 0 && /1000문서를 넘어/.test(big.toast), '페이지 질의 합 1,000문서 넘으면 배치 검사 경고 + 게시 막힘', big.h[0] + ' / ' + big.toast);
  await p.evaluate(() => { U2._adminOverride = false; }); const qna = await p.evaluate(() => { U2.openEditor('mine'); U2.edit.add('query'); const n = Object.values(U2.edit.draft.widgets).filter((w) => w.type === 'query').length; U2.edit.close(true); return n; });
  ok(qna === 6, '관리자 기기가 아니면 질의 위젯을 새로 못 넣음'); await p.evaluate(() => { U2._adminOverride = true; });
  /* 팝업 0 · 쓰기 0 */
  const pops = await p.evaluate(() => window.__pop);
  ok(pops.length === 0 && t.dialogs.length === 0, '브라우저 팝업(alert·confirm·prompt·window.open) 0번', pops.join(','));
  ok((await nonU2Writes(p)).length === 0, 'ui2_ 밖 쓰기 0');
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close(); done('t_actions');
})();
