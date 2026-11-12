/* 리드나우 2 0.4.13 — 지금 웹앱 1.78.491~522 따라 들임
 *  ① 🔁 사후 확인(1.78.512): 🛒 판매처 상황판 아래 줄 '🔁 사후 확인 어긋남 n'(판매처별) · 누르면 지금 웹앱 🧾 통합 장부 › 🔁 사후 확인 · 📥 받은편지함 줄 · 별칭 사후확인.어긋남
 *  ② 🔍 실사 목록(1.78.504): 상황판 아래 줄 '🔍 실사 필요 n' · 별칭 실사.수
 *  ③ 🔕 출고 시간 방해 금지(1.78.497)·🛡 출고 보호: 새 판 띠에 '끝난 뒤 누르세요' 한 줄(리드나우 2는 처음부터 저절로 다시 열지 않음)
 *  ④ 행동 '지금 웹앱 통합 장부 보기' · 쓰기 0(ui2_* 밖) · 팝업 0
 *  지금 웹앱 셈(rcRows·rcBad·ledAuditNow·sqDecide·sgHere)은 그대로 — 시험은 지금 웹앱 상태(S.rc.m · S.sq.cfg)에 시험 줄만 넣음 */
const { open, ok, done, nonU2Writes, seed } = require('./lib');
const SHOT = process.env.U2_SHOT_DIR || '';
(async () => {
  console.log('[0.4.13 지금 웹앱 1.78.491~522 따라 들임 — 사후 확인 · 실사 · 출고 시간 방해 금지]');
  const t = await open({ q: '?p=channels', settle: 2500 }); const p = t.p;
  await seed(p, {});
  await p.waitForFunction(() => { try { return S.prodLoaded && typeof ledNow === 'function'; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {});
  const has = await p.evaluate(() => ({ rcBad: typeof rcBad === 'function', aud: typeof ledAuditNow === 'function', sq: typeof sqNow === 'function', sg: typeof sgHere === 'function' }));
  ok(has.rcBad && has.aud && has.sq && has.sg, '지금 웹앱에 따라 들일 함수 넷이 있음(rcBad · ledAuditNow · sqNow · sgHere)', JSON.stringify(has));
  /* 시험 줄: 사후 확인 어긋남 2건(알라딘 1 · 예스24 1) + 끝난 것 1건 */
  await p.evaluate(() => { const d1 = new Date(Date.now() - 2 * 864e5).toISOString(); const d0 = new Date(Date.now() - 864e5).toISOString();
    S.rc.m = { a1: { ch: 'aladin', key: 'K1', id: '111', k: 'down', to: 0, t: '시험 책 하나', at: d1, r: { 1: { v: 'bad', at: d0, m: '판매중으로 남음' } } },
      y1: { ch: 'yes24', key: 'K2', no: '222', k: 'qty', to: 1, t: '시험 책 둘', at: d1, r: { 1: { v: 'bad', at: d0, m: '수량 3' } } },
      ok1: { ch: 'aladin', key: 'K3', id: '333', k: 'down', to: 0, t: '시험 책 셋', at: d1, r: { 1: { v: 'ok', at: d0, m: '' } } } };
    S.rc.at = Date.now(); U2.data && U2.data.bump && U2.data.bump(); U2.render(); });
  await p.waitForTimeout(1500);
  const cb = await p.evaluate(() => { const c = U2.view.cell('cb') || document.querySelector('.u2-cell[data-type="chboard"]'); const f = c && c.querySelector('.u2-cbf'); return { f: !!f, txt: f ? f.textContent.replace(/\s+/g, ' ').trim() : '', rc: f && f.querySelector('[data-cb="rc"] b') ? f.querySelector('[data-cb="rc"] b').textContent : null, aud: !!(f && f.querySelector('[data-cb="aud"]')), hot: !!(f && f.querySelector('[data-cb="rc"].u2-hot')), bad: rcBad().length }; });
  ok(cb.f && cb.rc === '2' && cb.bad === 2 && cb.hot, "🛒 판매처 상황판 아래 줄 '🔁 사후 확인 어긋남 2'(지금 웹앱 rcBad와 같음 · 빨강)", JSON.stringify(cb));
  ok(/🟥1/.test(cb.txt) && /🟦1/.test(cb.txt), '판매처별 숫자(🟥 알라딘 1 · 🟦 예스24 1)', cb.txt);
  ok(cb.aud, "같은 줄에 '🔍 실사 필요'(지금 웹앱 ledAuditNow)");
  /* 누르면 지금 웹앱 통합 장부 › 🔁 사후 확인 */
  await p.evaluate(() => { const c = U2.view.cell('cb') || document.querySelector('.u2-cell[data-type="chboard"]'); c.querySelector('[data-cb="rc"]').click(); });
  await p.waitForTimeout(1800);
  const led = await p.evaluate(() => ({ v: S._ledView, big: S.detail && S.detail.bigTable, on: !!document.querySelector('#sheet [data-ledview="rc"].on') }));
  ok(led.v === 'rc' && led.big === 'ledger' && led.on, "누르면 지금 웹앱 🧾 통합 장부 › '🔁 사후 확인' 보기가 그대로 열림", JSON.stringify(led));
  await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(600);
  await p.evaluate(() => { const c = U2.view.cell('cb') || document.querySelector('.u2-cell[data-type="chboard"]'); c.querySelector('[data-cb="aud"]').click(); });
  await p.waitForTimeout(1500);
  const la = await p.evaluate(() => ({ v: S._ledView, big: S.detail && S.detail.bigTable }));
  ok(la.v === 'aud' && la.big === 'ledger', "'🔍 실사 필요'를 누르면 🧾 통합 장부 › 🔍 실사 목록", JSON.stringify(la));
  await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(600);
  /* 별칭 · 받은편지함 · 행동 */
  const al = await p.evaluate(() => ({ rc: U2.data.eval('사후확인.어긋남').v, aud: U2.data.eval('실사.수').v, audN: ledAuditNow().length }));
  ok(al.rc === 2 && typeof al.aud === 'number' && al.aud === al.audN, '별칭 사후확인.어긋남 = 2 · 실사.수 = 지금 웹앱 실사 목록 수', JSON.stringify(al));
  await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(1500);
  const ib = await p.evaluate(() => { const c = document.querySelector('.u2-cell[data-type="inbox"]'); if (!c) return null; const r = [...c.querySelectorAll('.u2-ibr')].find((x) => /사후 확인/.test(x.textContent)); return r ? { txt: r.textContent.replace(/\s+/g, ' ').trim(), on: r.classList.contains('u2-ibon'), btn: !!r.querySelector('[data-i]') } : { none: true, all: c.textContent.slice(0, 200) }; });
  ok(ib && ib.on && /2/.test(ib.txt) && ib.btn, "📥 받은편지함에 '🔁 사후 확인 어긋남 2' 줄 · 열기 ›", JSON.stringify(ib));
  if (ib && ib.btn) { await p.evaluate(() => { const c = document.querySelector('.u2-cell[data-type="inbox"]'); [...c.querySelectorAll('.u2-ibr')].find((x) => /사후 확인/.test(x.textContent)).querySelector('[data-i]').click(); }); await p.waitForTimeout(1500);
    const v2 = await p.evaluate(() => ({ v: S._ledView, big: S.detail && S.detail.bigTable })); ok(v2.v === 'rc' && v2.big === 'ledger', "받은편지함 '열기 ›' → 🧾 통합 장부 › 🔁 사후 확인", JSON.stringify(v2));
    await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(500); }
  /* ③ 출고 시간 방해 금지 · 출고 보호 → 새 판 띠 한 줄 */
  const q0 = await p.evaluate(() => U2.shipQuiet());
  ok(q0 === '', '평소(방해 금지 꺼짐 · 출고 없음)엔 띠 한 줄 없음', JSON.stringify(q0));
  await p.evaluate(() => { const k = new Date(Date.now() + 9 * 3600e3); const hh = (h) => String((k.getUTCHours() + h + 24) % 24).padStart(2, '0') + ':00'; S.sq.cfg = { on: true, from: hh(-1), to: hh(1) }; U2.emit('newVer', { app: '9.9.9' }); });
  await p.waitForTimeout(400);
  const q1 = await p.evaluate(() => { const b = document.getElementById('u2-newver'); return { q: U2.shipQuiet(), b: b ? b.textContent.replace(/\s+/g, ' ').trim() : '', btn: !!(b && b.querySelector('[data-re]')) }; });
  ok(/🔕 출고 시간 방해 금지/.test(q1.q) && /뒤에 누르세요/.test(q1.b) && q1.btn, "🔕 방해 금지 시간대엔 새 판 띠에 '○시 뒤에 누르세요'(단추는 그대로 — 사람이 누르면 됨)", JSON.stringify(q1));
  await p.evaluate(() => { S.sq.cfg = { on: false }; });
  if (SHOT) await p.screenshot({ path: SHOT + '/follow_newver.png' }).catch(() => {});
  /* ④ 휴대폰 · 쓰기 · 팝업 */
  await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => U2.go('channels')); await p.waitForTimeout(1800);
  const ph = await p.evaluate(() => { const c = document.querySelector('.u2-cell[data-type="chboard"]'); const f = c && c.querySelector('.u2-cbf'); return { f: !!f, sw: document.documentElement.scrollWidth, over: f ? f.scrollWidth - f.clientWidth : -1 }; });
  ok(ph.f && ph.sw <= 392 && ph.over <= 2, '휴대폰 390: 아래 줄이 보이고 가로 밀림 없음', JSON.stringify(ph));
  if (SHOT) await p.screenshot({ path: SHOT + '/follow_phone.png' }).catch(() => {});
  const w = await nonU2Writes(p);
  ok(w.length === 0, '지금 웹앱 칸(ui2_* 밖)에 쓰기 0', JSON.stringify(w.slice(0, 5)));
  ok(t.dialogs.length === 0, '브라우저 팝업 0', JSON.stringify(t.dialogs));
  ok(!t.errs.filter((e) => /u2-|U2\./.test(e)).length, '새 웹앱 오류 0', JSON.stringify(t.errs.slice(0, 3)));
  await t.close(); done('t_follow');
})();
