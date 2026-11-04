/* 정범님 Q3 — 처음엔 읽기만 → 위젯마다 정범님이 직접 골라 켬(허락 목록 화면 · 기본 모두 꺼짐) · 설계안 H-10 */
const { open, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[쓰기 허락] 위젯마다 허락');
  const t = await open({ q: '?p=orders', settle: 2500, init: () => { const iv = setInterval(() => { if (window.U2) { U2._adminOverride = false; clearInterval(iv); } }, 1); } }); const p = t.p;
  await p.addStyleTag({ content: '.verbar{display:none!important}' });
  await p.click('#u2-mode'); await p.waitForSelector('.u2-perm');
  const st = await p.evaluate(() => ({ rows: document.querySelectorAll('.u2-perm tbody tr').length, on: [...document.querySelectorAll('.u2-perm tbody tr')].filter((r) => /켜짐/.test(r.textContent)).length, dis: [...document.querySelectorAll('.u2-perm [data-k]')].every((b) => b.disabled), chip: U2.$('#u2-mode').textContent }));
  ok(st.rows >= 10 && st.on === 0, '쓰기 허락 목록 — 기본 모두 꺼짐', st.rows + '줄 · 켜짐 ' + st.on);
  ok(st.dis && /읽기만/.test(st.chip), '관리자 기기가 아니면 볼 수만 있음 · 머리줄 🔒 읽기만', st.chip);
  await p.evaluate(() => document.querySelector('.u2-layer').remove());
  const tryWrite = (ctxKey) => p.evaluate(async (k) => { if (k) U2.setCtx(k); try { await firebase.firestore().collection('crm_orders').doc('perm1').set({ memo: 'x' }); return '통과'; } catch (e) { return e.code; } }, ctxKey);
  ok((await tryWrite('tab:orders')) === 'u2/readonly', '켜기 전: 주문 탭 위젯이 불러도 막힘');
  await p.evaluate(() => { U2._adminOverride = true; }); await p.click('#u2-mode'); await p.waitForSelector('.u2-perm');
  const btn = '.u2-perm [data-k="tab:orders"]';
  await p.click(btn); ok(/한 번 더 누르면/.test(await p.textContent(btn)), '켜기는 두 번 누르기(대상 이름 보임)', (await p.textContent(btn)).trim());
  await p.click(btn); await p.waitForTimeout(300);
  const saved = await p.evaluate(() => ({ ok: (__FS.ui2_site.main.writeOk || {})['tab:orders'], log: (__FS.ui2_site.main.writeLog || []).length, chip: U2.$('#u2-mode').textContent }));
  ok(saved.ok && saved.ok.on && saved.ok.by && saved.ok.at, '켠 기록(기기·시각)이 ui2_site/main.writeOk에 남음', JSON.stringify(saved.ok));
  ok(saved.log === 1 && /일부 허락/.test(saved.chip), '바꾼 기록 writeLog · 머리줄 🔓 일부 허락', saved.chip);
  await p.evaluate(() => document.querySelector('.u2-layer').remove());
  /* 실제로 옛 주문 탭 칸 안을 눌러서(누른 위젯 = 주문 탭) */
  const viaClick = await p.evaluate(async () => { const c = document.querySelector('.u2-cell[data-perm="tab:orders"]'); c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); try { await firebase.firestore().collection('crm_orders').doc('perm2').set({ memo: 'y' }); return '통과'; } catch (e) { return e.code; } });
  ok(viaClick === '통과', '켠 뒤: 주문 탭 칸 안을 누르고 한 쓰기는 통과');
  ok((await tryWrite('tab:home')) === 'u2/readonly', '다른 위젯(홈 탭)이 부른 쓰기는 여전히 막힘');
  ok((await p.evaluate(async () => { await new Promise((r) => setTimeout(r, (U2.CFG.ctxMs || 1500) + 200)); try { await firebase.firestore().collection('crm_orders').doc('perm3').set({ a: 1 }); return '통과'; } catch (e) { return e.code; } })) === 'u2/readonly', '누른 지 오래된(어느 위젯인지 모르는) 쓰기는 막힘(안전 쪽)');
  await p.click('#u2-mode'); await p.waitForSelector('[data-lockall]'); await p.check('[data-lockall]', { force: true }); await p.waitForTimeout(200);
  ok((await tryWrite('tab:orders')) === 'u2/readonly', "비상 '모두 막기'를 켜면 허락한 것도 막힘");
  await p.uncheck('[data-lockall]', { force: true }); await p.waitForTimeout(200);
  await p.click(btn); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('.u2-layer') && document.querySelector('.u2-layer').remove());
  ok((await tryWrite('tab:orders')) === 'u2/readonly', '끄기(한 번) → 다시 막힘');
  const w = await nonU2Writes(p); ok(w.length === 1 && /crm_orders/.test(w[0]), '가짜 Firestore에 닿은 ui2_ 밖 쓰기 = 허락한 그 한 건뿐', w.join(', '));
  await p.evaluate(() => U2.guard.flush()); await p.waitForTimeout(200);
  const bl = await p.evaluate(() => { const d = Object.values(__FS.ui2_blocked || {})[0]; return d ? { n: d.n, keys: Object.keys(d.last[0] || {}).join(','), hasData: JSON.stringify(d).includes('memo') } : null; });
  ok(bl && bl.n > 0 && !bl.hasData, '막은 쓰기 기록 ui2_blocked — 칸 이름·작업·위젯·시각만(자료 내용 없음)', JSON.stringify(bl));
  ok(t.dialogs.length === 0, '브라우저 팝업 0');
  await t.close(); done('t_perm');
})();
