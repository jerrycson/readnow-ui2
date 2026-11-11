/* 단계 6 완료 조건 — 어댑터·자동 목록 (설계안 11-2 단계 6 · H-01 기능 위젯 · H-05)
 * 목록이 지금 웹앱에서 저절로(탭·섹션·홈 칸·화면·기능 찾기) · 분류 12 · ≈MB · 🆕 · 섹션 위젯 하나씩 전부 · 같은 탭 섹션은 한 번 그려 나눠 줌
 * · 화면 열기 위젯 전부 열고 닫기 · 계약 검사(깨지면 그 종류만 안전 모드) · 같은 옛 위젯 두 개 막힘 · ui2_ 밖 쓰기 0 */
const { open, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[단계 6] 어댑터·자동 목록');
  const t = await open({ q: '?p=ad', settle: 3000, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = true; clearInterval(iv); } }, 1); } }); const p = t.p;
  await p.addStyleTag({ content: '.verbar{display:none!important}' });
  await p.waitForFunction(() => U2.adapters && U2.adapters.bad, null, { timeout: 10000 }).catch(() => {});
  const bad = await p.evaluate(() => U2.adapters.bad);
  ok(Array.isArray(bad) && bad.length === 0, '계약 검사: 새 웹앱이 기대는 옛 함수·값·화면 뼈대가 모두 살아 있음', JSON.stringify(bad));
  const cnt = await p.evaluate(() => ({ c: U2.catalog.count(), cats: [...new Set(U2.catalog.get().map((i) => i.cat))].length, sup: (U2.catalog.get().find((i) => i.key === 'bz_sup') || {}).mem, pace: (U2.catalog.get().find((i) => i.key === 'bz_pace') || {}).mem, feat: typeof FEAT !== 'undefined' ? FEAT.length : 0, words: (U2.catalog.get().find((i) => i.key === 'bz_vat') || {}).words || '' }));
  const nT = await p.evaluate(() => Math.max(9, U2.legacyTabs().length) + 1); /* (0.4.7) 탭 위젯 = 지금 웹앱 탭 + ⚙ 설정 */
  ok(cnt.c.tab === nT && cnt.c.sec >= 60 && cnt.c.home >= 15 && cnt.c.screen >= 80 && cnt.c.feat >= 50, '위젯 목록을 지금 웹앱에서 저절로', JSON.stringify(cnt.c) + ' (기능 찾기 원본 ' + cnt.feat + '개 중 섹션·화면을 가리키는 것은 그 위젯 별칭으로 묶음)');
  ok(cnt.cats >= 10, '분류 12가지 중 쓰인 것', cnt.cats + '가지');
  ok(cnt.sup && cnt.sup.mb === 64 && cnt.pace && cnt.pace.mb >= 0, "메모리 값표: '🏪 매입처'는 켜면 상품 자료 ≈64MB(지금 웹앱 휴대폰 고르기 값 그대로)", JSON.stringify(cnt.sup));
  ok(cnt.words.length > 20, '기능 찾기 낱말이 같은 섹션 위젯의 찾을 낱말로 묶임(bz_vat)', cnt.words.slice(0, 60));
  const nw = await p.evaluate(() => { FEAT.push({ t: '시험용 새 기능 '+Date.now(), w: '시험', k: '시험', go: { fn: () => {} } }); S._featIx = null; U2.catalog.at = 0; const it = U2.catalog.build().filter((i) => i.isNew); FEAT.pop(); S._featIx = null; return it.map((i) => i.title); });
  ok(nw.length === 1 && /시험용 새 기능/.test(nw[0]), '지금 웹앱에 새 기능이 생기면 서랍에 🆕로', nw.join(','));
  /* 섹션 위젯 하나씩 전부 */
  const secs = await p.evaluate(() => U2.catalog.get().filter((i) => i.kind === 'sec').map((i) => [i.key, i.tab]));
  const r = await p.evaluate(async (secs) => {
    const out = { shown: 0, empty: 0, err: [], none: [] }; const e0 = (window.__u2err = window.__u2err || []).length;
    for (const [id, tab] of secs) {
      U2.pages.ad = { id: 'ad', title: '섹션', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'legacy.sec', props: { ref: id, tab } } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 24, h: 16 }] } };
      U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 30));
      const c = U2.view.cell('s'); if (!c) { out.err.push(id + ':칸 없음'); continue; }
      const b = c.querySelector('.u2-lg'); if (c.querySelector(`details.sec[data-sec="${id}"]`) || c.querySelector('.u2-seccards') || (b && b.firstElementChild && !b.querySelector(':scope > .u2-empty') && b.textContent.trim().length > 10)) out.shown++;
      else if (/비어 있거나/.test(c.textContent)) { out.empty++; out.none.push(id + '(' + tab + ')'); }
      else out.err.push(id + ':' + c.textContent.slice(0, 60));
    }
    return out;
  }, secs);
  ok(r.err.length === 0, `섹션 위젯 ${secs.length}개를 하나씩 놓아 그림 — 오류 0`, `보임 ${r.shown} · 이 기기에서 비어 있음 ${r.empty}${r.err.length ? ' · 오류 ' + r.err.slice(0, 5).join(' / ') : ''}`);
  ok(r.shown >= secs.length * 0.8, '섹션 위젯 대부분이 그 섹션만 보여 줌(가짜 빈 자료에서)', r.shown + '/' + secs.length + (r.none.length ? ' · 빈 것: ' + r.none.slice(0, 12).join(' ') : ''));
  /* 같은 탭 섹션 셋 → 한 번 그림 · 옛 코드가 다시 그리라고 하면 모아서 */
  const g = await p.evaluate(async () => {
    const ids = ['bz_pace', 'bz_margin', 'bz_inv']; const W0 = {}; const L0 = []; ids.forEach((id, i) => { W0['s' + i] = { type: 'legacy.sec', props: { ref: id, tab: 'biz' } }; L0.push({ id: 's' + i, x: i * 8, y: 0, w: 8, h: 16 }); });
    U2.pages.ad = { id: 'ad', title: '셋', grid: { rowH: 16 }, rev: 0, widgets: W0, layouts: { pc: L0 } }; const r0 = U2.adapters.renders; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 50));
    const once = U2.adapters.renders - r0; const shown = ids.filter((id, i) => U2.view.cell('s' + i).querySelector(`details.sec[data-sec="${id}"]`)).length;
    const r1 = U2.adapters.renders; renderMain(); renderMain(); renderMain(); for (let k = 0; k < 40 && U2.adapters.renders === r1; k++) await new Promise((r) => setTimeout(r, 100)); await new Promise((r) => setTimeout(r, 900)); const again = U2.adapters.renders - r1; /* (0.4.9) 기계가 바쁘면 0.7초 모음이 1초를 넘김 — 다시 그릴 때까지(4초 안) 기다린 뒤 0.9초 더 보고 셈 */
    const r2 = U2.adapters.renders; await new Promise((r) => setTimeout(r, 3000)); const idle = U2.adapters.renders - r2;
    return { once, shown, again, idle, dup: U2.guard.dupIds(), tab: S.tab };
  });
  ok(g.once === 1 && g.shown === 3, '같은 탭(경영) 섹션 위젯 셋 = 탭 그리기 1번으로 나눠 줌', JSON.stringify({ once: g.once, shown: g.shown }));
  ok(g.again === 1, '옛 코드가 다시 그리라고 세 번 불러도 0.7초 모아 한 번', '다시 그림 ' + g.again + '번');
  ok(g.idle <= 1, '가만히 두면 다시 그리지 않음(헛돌기 없음)', '3초 동안 ' + g.idle + '번');
  ok(g.dup.length === 0 && g.tab !== 'biz', '중복 id 0 · 그린 뒤 옛 S.tab은 되돌림', JSON.stringify(g.dup) + ' · S.tab=' + g.tab);
  /* 같은 옛 위젯 두 개 · 같은 탭 전체와 함께 → 막힘/경고 */
  const one = await p.evaluate(() => { U2.openEditor('pub'); const E = U2.edit; E.add('legacy.sec', { ref: 'bz_pace', tab: 'biz' }); const n = Object.values(E.draft.widgets).filter((w) => w.type === 'legacy.sec' && w.props.ref === 'bz_pace').length; E.add('legacy.tab', { ref: 'biz' }); const h = E.health(); E.close(true); return { n, h }; });
  ok(one.n === 1, '같은 섹션 위젯을 한 페이지에 두 번은 막힘');
  ok(one.h.some((x) => /같은 탭 전체 위젯과 함께/.test(x)), '같은 탭의 탭 전체 위젯과 섹션 위젯을 함께 두면 배치 검사가 알림', one.h.filter((x) => /같은 탭/.test(x)).join(' / '));
  /* 서랍: 분류별 · ≈MB · 찾기 낱말 */
  const dr = await p.evaluate(() => { U2.openEditor('pub'); const cats = document.querySelectorAll('#u2-eddrawer .u2-drcat').length; const q = document.getElementById('u2-edq'); q.value = '부가세'; q.oninput(); const hit = [...document.querySelectorAll('#u2-eddrawer .u2-dri')].filter((b) => !b.hidden).map((b) => b.textContent.trim().slice(0, 30)); const mb = [...document.querySelectorAll('#u2-eddrawer .u2-dri small')].some((s) => /≈64MB/.test(s.textContent)); const st = document.getElementById('u2-edst').textContent; U2.edit.close(true); return { cats, hit, mb, st }; });
  ok(dr.cats >= 10 && dr.mb, '위젯 서랍: 리드나우 기능을 분류별로 · 받는 자료 ≈MB 표시', dr.cats + '분류');
  ok(dr.hit.some((h) => /부가세|매출 맞춰/.test(h)), "서랍 찾기가 🔍 기능 찾기 낱말을 씀('부가세')", dr.hit.slice(0, 4).join(' / '));
  ok(/받는 자료 ≈\d+MB/.test(dr.st), '편집 중 머리에 메모리 예산(받는 자료 ≈MB)', dr.st.match(/받는 자료[^·]*/)[0]);
  /* 화면 열기 위젯 전부 열고 닫기(H-05) */
  const sc = await p.evaluate(() => U2.catalog.get().filter((i) => i.kind === 'screen' && !i.needsArg).map((i) => i.key));
  const so = { open: 0, err: [], stuck: [] };
  for (const k of sc) {
    const e0 = t.errs.length;
    await p.evaluate((k) => U2.legacy.screen(k), k); await p.waitForTimeout(250);
    const on = await p.evaluate(() => document.getElementById('sheet').classList.contains('on'));
    if (on) { so.open++; await p.goBack(); await p.waitForTimeout(250); if (await p.evaluate(() => document.getElementById('sheet').classList.contains('on'))) { so.stuck.push(k); await p.keyboard.press('Escape'); await p.waitForTimeout(150); } }
    if (t.errs.length > e0) so.err.push(k + ': ' + t.errs.slice(e0).join(' ').slice(0, 80));
  }
  ok(so.err.length === 0, `화면 열기 위젯 ${sc.length}개를 차례로 열기 — 오류 0`, so.err.slice(0, 4).join(' / ') || '열림 ' + so.open + '개(나머지는 자료가 없거나 다른 층으로 열림)');
  ok(so.stuck.length === 0 && (await p.evaluate(() => U2.cur)) === 'ad', '열린 화면은 모두 뒤로 가기로 닫히고 새 웹앱 페이지는 그대로', so.stuck.join(','));
  /* 계약이 깨지면 그 종류만 안전 모드 */
  const cb = await p.evaluate(async () => { const keep = window.renderBiz; window.renderBiz = undefined; const b = await U2.adapters.check(); U2.pages.ad = { id: 'ad', title: '깨짐', grid: { rowH: 16 }, rev: 0, widgets: { s: { type: 'legacy.sec', props: { ref: 'bz_pace', tab: 'biz' } }, k: { type: 'kpi', props: {} } }, layouts: { pc: [{ id: 's', x: 0, y: 0, w: 12, h: 8 }, { id: 'k', x: 12, y: 0, w: 6, h: 5 }] } }; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 50)); const r = { bad: b.map((x) => x.n + ' ' + x.why), safe: /지금 웹앱에서 열기/.test(U2.view.cell('s').textContent), kpi: !!U2.view.cell('k').querySelector('.u2-kpi') }; window.renderBiz = keep; await U2.adapters.check(); return r; });
  ok(cb.bad.length === 1 && cb.safe && cb.kpi, "옛 함수가 없어지면(가짜로 renderBiz 지움) 섹션 위젯만 '지금 웹앱에서 열기' · 다른 위젯은 그대로", cb.bad.join(','));
  ok((await nonU2Writes(p)).length === 0, '어댑터 시험 동안 ui2_ 밖 쓰기 0', (await nonU2Writes(p)).slice(0, 5).join(','));
  ok(t.dialogs.length === 0, '브라우저 팝업 0');
  const errs = t.errs.filter((e) => !/js-profiling/.test(e)); ok(errs.length === 0, '화면 오류 0', errs.slice(0, 3).join(' / '));
  await t.close(); done('t_adapters');
})();
