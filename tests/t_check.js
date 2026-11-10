/* ✅ 단계 12 시범 체크리스트(11/10 정범님 — '체크리스트가 어디 있나 · 누를 곳을 안내해 달라')
 * 맨 위 시범 띠 단추 · ☰ 메뉴 · ?check=1 로 열림 · 줄마다 통과/안 됨/메모 → 기기(rn2-check12) + ui2_checks/<기기> · STEP12.md 표와 같은 줄 */
const fs = require('fs'); const path = require('path');
const { open, ok, done, nonU2Writes } = require('./lib');
(async () => {
  console.log('[체크리스트] 단계 12 시범 체크리스트');
  /* STEP12.md 체크리스트 표와 화면 안 줄이 같은가(한쪽만 고치면 깨짐) */
  const md = fs.readFileSync(path.join(__dirname, '..', 'STEP12.md'), 'utf8');
  const mdRows = md.split('## ✅ 체크리스트')[1].split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|').map((x) => x.trim()));
  const t = await open({ q: '?p=home', settle: 2000 }); const p = t.p;
  const js = await p.evaluate(() => U2.CHECK12.map((r) => ({ n: r.n, where: r.where })));
  ok(js.length === mdRows.length && js.every((r, i) => +mdRows[i][1] === r.n && mdRows[i][2] === r.where), 'STEP12.md 표와 화면 안 줄이 같음(번호·어디서)', js.length + '줄 · md ' + mdRows.length + '줄');
  const ver = await p.evaluate(() => U2.ver); ok(md.includes('새 웹앱 ' + ver), 'STEP12.md 제목이 지금 판(' + ver + ')');
  /* 맨 위 시범 띠 */
  const bar = await p.evaluate(() => { const b = document.getElementById('u2-pilot'); return b ? { txt: b.textContent, first: b.parentNode.firstChild === b, btn: !!b.querySelector('[data-ck-open]') } : null; });
  ok(bar && /시범 중 — 읽기만/.test(bar.txt) && bar.btn && bar.first, "맨 위 띠 '🔒 리드나우 2 시범 중 — 읽기만' + '✅ 체크리스트 열기'", bar && bar.txt);
  await p.click('#u2-pilot [data-ck-open]'); await p.waitForSelector('.u2-ck');
  const n = await p.evaluate(() => document.querySelectorAll('.u2-ck [data-ck]').length); ok(n === js.length, '띠 단추로 체크리스트가 열림 · 줄 ' + n);
  /* 통과 · 안 됨 + 메모 */
  await p.click('.u2-ck [data-ck="1"] [data-ck-s="ok"]');
  await p.click('.u2-ck [data-ck="3"] [data-ck-s="no"]'); await p.fill('.u2-ck [data-ck="3"] [data-ck-m]', '매출 페이스가 받는 중에 머묾');
  await p.waitForTimeout(2200);
  const st = await p.evaluate(() => ({ ls: JSON.parse(localStorage.getItem('rn2-check12') || 'null'), fs: Object.values((window.__FS || {}).ui2_checks || {})[0] || null, sum: document.querySelector('.u2-ck [data-ck-sum]').textContent, cls: document.querySelector('.u2-ck [data-ck="3"]').className }));
  ok(st.ls && st.ls.rows[1].s === 'ok' && st.ls.rows[3].s === 'no' && /받는 중/.test(st.ls.rows[3].m), '기기에 저장(rn2-check12)', JSON.stringify(st.ls && st.ls.rows));
  ok(st.fs && st.fs.kind === 'step12' && st.fs.ok === 1 && st.fs.no === 1 && st.fs.rows[3].m && st.fs.ver, 'Firestore ui2_checks/<기기>에 올라감(리드가 봄)', st.fs && JSON.stringify({ ok: st.fs.ok, no: st.fs.no, dev: st.fs.dev, ver: st.fs.ver }));
  ok(/✓ 1 · ✕ 1/.test(st.sum) && /u2-ck-no/.test(st.cls), '위 합계·줄 색이 바로 바뀜', st.sum);
  /* 같은 단추를 다시 누르면 지움 */
  await p.click('.u2-ck [data-ck="1"] [data-ck-s="ok"]'); ok(await p.evaluate(() => !(U2.check.st.rows[1] && U2.check.st.rows[1].s)), '통과를 다시 누르면 지움');
  await p.click('.u2-ck [data-ck="1"] [data-ck-s="ok"]');
  /* 모든 기기 결과 */
  await p.click('.u2-ck [data-ck-all]'); await p.waitForTimeout(400);
  ok(/✕|안 된 줄/.test(await p.textContent('.u2-ck [data-ck-allout]')) && /3번/.test(await p.textContent('.u2-ck [data-ck-allout]')), "'다른 기기 결과 보기' 표에 안 된 줄(3번 + 메모)");
  /* 줄의 '가기' 단추 → 그 페이지로 · 띠에 '지금 n번' */
  await p.click('.u2-ck [data-ck="8"] [data-ck-go="8:0"]'); await p.waitForTimeout(800);
  const gone = await p.evaluate(() => ({ cur: U2.cur, url: location.search, layer: !!document.querySelector('.u2-ck'), bar: document.getElementById('u2-pilot').textContent }));
  ok(gone.cur === 'inbox' && /p=inbox/.test(gone.url) && !gone.layer && /지금 8번/.test(gone.bar) && /1\/11 통과/.test(gone.bar), "8번 '📥 할 일로' → 그 페이지 · 띠에 진행·'지금 8번'", JSON.stringify(gone));
  await p.click('#u2-pilot [data-ck-open]'); await p.waitForSelector('.u2-ck-focus');
  ok(await p.evaluate(() => document.querySelector('.u2-ck-focus').dataset.ck === '8'), '띠로 다시 열면 하던 줄(8번)에 맞춤');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  /* ☰ 메뉴 맨 위 */
  await p.click('#u2-menubtn'); await p.waitForSelector('[data-m="check"]');
  const mt = await p.textContent('[data-m="check"]'); ok(/✅ 시범 체크리스트/.test(mt) && /1\/11/.test(mt), "☰ 메뉴 '✅ 시범 체크리스트'(진행 숫자)", mt);
  await p.click('[data-m="check"]'); ok(await p.isVisible('.u2-ck'), '메뉴에서 열림');
  if (process.env.U2_SHOT_DIR) await p.screenshot({ path: path.join(process.env.U2_SHOT_DIR, 'check_pc.png') });
  const w = await nonU2Writes(p); ok(w.length === 0, 'ui2_ 밖 쓰기 0', w.join(','));
  const es = t.errs.filter((e) => !/js-profiling/.test(e)); ok(t.dialogs.length === 0 && !es.length, '브라우저 팝업·오류 0(지금 웹앱의 js-profiling 알림은 뺌)', es.join(' / '));
  await t.close();
  /* ?check=1 → 바로 열림 · 새로 열어도 기기 저장이 남음 */
  const t2 = await open({ q: '?check=1', settle: 2500, init: () => { try { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('rn2-check12', JSON.stringify({ rows: { 2: { s: 'ok', m: '', at: '2026-11-10T01:00:00Z' } } })); } } catch (e) {} } });
  const auto = await t2.p.evaluate(() => ({ open: !!document.querySelector('.u2-ck'), ok2: /u2-ck-ok/.test((document.querySelector('.u2-ck [data-ck="2"]') || {}).className || '') }));
  ok(auto.open && auto.ok2, '주소 ?check=1 로 열면 체크리스트가 바로 · 기기에 저장한 줄이 그대로', JSON.stringify(auto));
  await t2.close();
  /* 휴대폰 폭에서도 띠·줄이 화면 밖으로 안 나감 */
  const t3 = await open({ q: '?check=1', settle: 2500, vp: { width: 390, height: 800 }, touch: true }); const p3 = t3.p;
  const ph = await p3.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, open: !!document.querySelector('.u2-ck'), rowW: Math.round(document.querySelector('.u2-ck [data-ck="1"]').getBoundingClientRect().right) }));
  ok(ph.open && ph.sw <= ph.iw + 1 && ph.rowW <= ph.iw, '휴대폰(390px) — 가로로 넘치지 않음', JSON.stringify(ph));
  if (process.env.U2_SHOT_DIR) { await p3.screenshot({ path: path.join(process.env.U2_SHOT_DIR, 'check_phone.png') }); }
  await t3.close();
  done('t_check');
})();
