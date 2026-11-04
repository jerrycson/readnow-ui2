/* 기능 단추(T5) 전부 하나씩 실행 (단계 9 '확인 못 한 것' · H-01 기능 위젯 · H-10 쓰기 막이)
 * 가짜 자료를 넣고 🔍 기능 찾기 항목마다 기능 단추 위젯을 누른 것처럼(U2.legacy.feat) 실행 → 오류 0 · 실제 자료를 바꾸는 쓰기는 모두 막이에서 막힘(ui2_ 밖 쓰기 0)
 * 실행 뒤 열린 상세 층·모달·새 웹앱 층은 닫고, 다른 페이지로 갔으면 돌아옴 · 웹앱을 떠나는(주소가 바뀌는) 기능이 있으면 적음 */
const { open, seed, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[기능 단추 전부] 하나씩 실행');
  let t = await open({ q: '?p=fx', settle: 3000 }); let p = t.p; await seed(p); await p.waitForTimeout(2000);
  const feats = await p.evaluate(() => U2.catalog.get().filter((i) => i.kind === 'feat').map((i) => i.props.feat));
  const res = { ok: 0, err: [], left: [], sheet: 0, page: 0, blocked: 0 }; let navs = 0, lastUrl = ''; const hook = (pg) => pg.on('load', () => { navs++; lastUrl = pg.url(); }); /* 문서를 새로 연 것만(pushState로 바뀐 주소는 세지 않음) */ hook(p);
  for (let i = 0; i < feats.length; i++) {
    const f = feats[i]; const e0 = t.errs.length; const n0 = navs; const b0 = await p.evaluate(() => U2.guard.blocked.length).catch(() => 0);
    await p.evaluate((f) => { U2.setCtx('feat:' + f); try { const r = U2.legacy.feat(f); if (r && r.catch) r.catch((e) => console.error('기능 오류 ' + e.message)); } catch (e) { console.error('기능 오류 ' + e.message); } }, f).catch(() => {});
    await p.waitForTimeout(450);
    if (navs > n0) { res.left.push(f.slice(0, 30) + ' → ' + lastUrl.replace(/^https?:\/\/[^/]+/, '')); await t.close(); t = await open({ q: '?p=fx', settle: 2500 }); p = t.p; hook(p); await seed(p); await p.waitForTimeout(1500); navs = 0; continue; }
    const st = await p.evaluate(() => ({ sheet: document.getElementById('sheet').classList.contains('on'), modal: (document.getElementById('modal') || {}).classList && document.getElementById('modal').classList.contains('on'), cur: U2.cur, bl: U2.guard.blocked.length })).catch(() => ({}));
    if (st.sheet) { res.sheet++; await p.goBack().catch(() => {}); await p.waitForTimeout(250); if (await p.evaluate(() => document.getElementById('sheet').classList.contains('on'))) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); } }
    if (st.modal) await p.evaluate(() => { const b = document.getElementById('mclose'); if (b) b.click(); });
    await p.evaluate(() => { document.querySelectorAll('.u2-layer, .askbox').forEach((x) => x.remove()); });
    if (st.cur && st.cur !== 'fx') { res.page++; await p.evaluate(() => U2.go('fx', { force: true })); await p.waitForTimeout(200); }
    res.blocked += Math.max(0, (st.bl || 0) - b0);
    const all = t.errs.slice(e0).filter((e) => !/js-profiling/.test(e)); const ne = all.filter((e) => !/리드나우 2 시범 중 — 읽기만/.test(e)); if (all.length > ne.length) res.blockedLog = (res.blockedLog || 0) + 1; /* 막이에 막힌 쓰기를 옛 코드가 콘솔에 적은 것은 오류가 아님(막힘) */ if (ne.length) res.err.push(f.slice(0, 36) + ' → ' + ne[0].slice(0, 90)); else res.ok++;
  }
  ok(feats.length >= 100, '기능 단추 수', feats.length + '개');
  ok(res.err.length === 0, `기능 단추 ${feats.length}개 하나씩 실행 — 오류 0`, res.err.length ? res.err.slice(0, 6).join(' / ') : `문제없음 ${res.ok} · 상세 층을 연 것 ${res.sheet} · 다른 페이지로 간 것 ${res.page}`);
  ok(res.left.length === 0, '새 웹앱 문서를 새로 여는(다시 불러오는) 기능 없음', res.left.join(' / ') || '없음');
  ok(true, '막이에 막혀 옛 코드가 콘솔에 \'읽기만\'을 적은 기능', (res.blockedLog || 0) + '개');
  const w = await nonU2Writes(p); ok(w.length === 0, `실행하며 하려던 쓰기 ${res.blocked}건 모두 막힘 — 가짜 Firestore에 닿은 ui2_ 밖 쓰기 0`, w.slice(0, 5).join(','));
  ok(t.dialogs.length === 0, '브라우저 팝업 0', t.dialogs.slice(0, 3).join(' / '));
  ok(await p.evaluate(() => U2.cur === 'fx' && !document.getElementById('sheet').classList.contains('on')), '끝나고 새 웹앱은 처음 페이지 그대로');
  await t.close(); done('t_feats');
})();
