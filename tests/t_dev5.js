/* 리드나우 2 — 단계 10 '실제 기기 5대 체크 목록'을 기기 5가지 모양으로 (0.4.5 · 11/10 정범님 '손 체크리스트 없이 시험으로')
 *  관리자 PC 큰 화면 · 등록 PC · 노트북 · 태블릿(손가락) · 휴대폰(손가락) 마다 STEP12 체크리스트 1·2·4·9·10번을 사람처럼:
 *  시범 띠 · ☰ 메뉴 맨 아래 기기 줄(지금 웹앱 판 = 불러온 판) · 페이지 11개가 저마다 다른 화면 · 뒤로 가기 · 가로 넘침 없음 · 🔎 찾기 · ⚡ 빠른 작업 · 쓰기 0 · 오류·팝업 0 */
const { open, ok, done, nonU2Writes, chromium } = require('./lib');
const DEV = [
  ['관리자 PC 큰 화면', { width: 1920, height: 1080 }, false],
  ['등록 PC', { width: 1400, height: 900 }, false],
  ['노트북', { width: 1280, height: 720 }, false],
  ['태블릿(손가락)', { width: 820, height: 1180 }, true],
  ['휴대폰(손가락)', { width: 390, height: 844 }, true],
];
(async () => {
  console.log('[단계 10] 기기 5가지');
  const b = await chromium.launch();
  for (const [name, vp, touch] of DEV) {
    const t = await open({ browser: b, q: '?check=1', vp, touch, settle: 2500 }); const p = t.p;
    const a = await p.evaluate(() => ({ pilot: ((document.getElementById('u2-pilot') || {}).textContent || ''), ck: !!document.querySelector('.u2-ck'), safe: !!U2.safe, ver: U2.ver, app: U2.legacy && U2.legacy.appVer }));
    ok(/시범 중 — 읽기만/.test(a.pilot) && a.ck && !a.safe, `${name}: 1번 시범 띠 · ?check=1로 체크리스트가 바로 · 안전 모드 아님`, JSON.stringify({ ck: a.ck, safe: a.safe }));
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.evaluate(() => document.querySelectorAll('.u2-ck').forEach((x) => (x.closest('.u2-layer') || x).remove()));
    await p.click('#u2-menubtn'); await p.waitForTimeout(300);
    const m = await p.evaluate(() => { const L = [...document.querySelectorAll('.u2-layer, .u2-modal')].pop(); const t = L ? L.textContent : ''; if (L) L.remove(); return t; });
    ok(new RegExp('지금 웹앱 ' + a.app.replace(/\./g, '\\.')).test(m) && new RegExp('새 웹앱 ' + a.ver.replace(/\./g, '\\.')).test(m), `${name}: 2번 ☰ 메뉴 기기 줄 — 지금 웹앱 ${a.app} · 새 웹앱 ${a.ver}`);
    const pages = await p.evaluate(() => (U2.site.nav || []).filter((n) => !n.hide).map((n) => n.id));
    const seen = []; let bad = [];
    for (const id of pages) {
      await p.evaluate((id) => U2.go(id), id); await p.waitForTimeout(id === 'home' ? 1500 : 900);
      const r = await p.evaluate(() => { const pg = document.getElementById('u2-page'); const sw = document.documentElement.scrollWidth; const sheet = document.getElementById('sheet'); return { url: location.search, sig: (pg.textContent || '').replace(/\s+/g, '').slice(0, 400), over: sw > innerWidth + 1, sw, cover: !!(sheet && sheet.classList.contains('on')) }; });
      if (!new RegExp('p=' + id).test(r.url) || r.over || r.cover) bad.push(id + (r.over ? ' 넘침' + r.sw : '') + (r.cover ? ' 옛화면덮음' : ''));
      seen.push(r.sig);
    }
    const uniq = new Set(seen).size;
    ok(pages.length >= 11 && uniq === pages.length && !bad.length, `${name}: 4번 페이지 ${pages.length}개 — 저마다 다른 화면 · 주소 ?p= · 가로 넘침 없음 · 옛 등록 화면이 덮지 않음`, bad.join(', ') || uniq + '/' + pages.length);
    await p.goBack(); await p.waitForTimeout(800);
    const back = await p.evaluate(() => U2.cur); ok(back === pages[pages.length - 2], `${name}: 뒤로 가기 → 앞 페이지(${pages[pages.length - 2]})`, back);
    await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(700);
    const q = await p.evaluate(() => { const box = document.getElementById('u2-qa'); const fb = document.getElementById('u2-findbtn'); const r = fb.getBoundingClientRect(); fb.click(); const L = document.getElementById('u2-find'); const br = L && L.querySelector('.u2-findbox').getBoundingClientRect(); const o = { qa: !!box && !box.hidden, fb: r.right <= innerWidth && r.width > 0, find: !!(br && br.left >= 0 && br.right <= innerWidth) }; if (L && L._close) L._close(); return o; });
    ok(q.qa && q.fb && q.find, `${name}: ⚡ 빠른 작업 · 🔎 찾기 단추가 화면 안 · 찾기 창이 화면 안`, JSON.stringify(q));
    if (touch) {
      await p.evaluate(() => U2.go('products')); await p.waitForTimeout(1200);
      const reg = await p.evaluate(async () => { try { openRegister(); } catch (e) { return 'err ' + e.message; } await new Promise((r) => setTimeout(r, 1200)); const sh = document.getElementById('sheet'); const on = sh.classList.contains('on'); await U2.go('home'); await new Promise((r) => setTimeout(r, 900)); const still = document.getElementById('sheet').classList.contains('on'); const dk = document.querySelector('.u2-dock, #u2-dock, [data-u2dock]'); return { on, still, cur: U2.cur, dock: !!dk }; });
      ok(reg.on && reg.cur === 'home', `${name}: 9번 📥 등록을 열고 페이지를 바꿔도 페이지가 바뀜(옛 화면은 기기 설정대로 남음)`, JSON.stringify(reg));
      await p.evaluate(() => { try { if (document.getElementById('sheet').classList.contains('on')) closeDetail(); } catch (e) {} });
    }
    const w = await nonU2Writes(p); ok(w.length === 0, `${name}: ui2_ 밖 쓰기 0`, w.slice(0, 3).join(','));
    const errs = t.errs.filter((e) => !/js-profiling/.test(e) && !/시범 중 — 읽기만/.test(e)); ok(errs.length === 0 && t.dialogs.length === 0, `${name}: 화면 오류·브라우저 팝업 0`, errs.slice(0, 2).join(' / '));
    await t.close();
  }
  await b.close();
  done('t_dev5');
})().catch((e) => { console.error(e); process.exit(1); });
