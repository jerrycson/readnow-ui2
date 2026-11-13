/* 리드나우 2 0.4.15 — 지금 웹앱 1.78.523~566 따라 들임(rv4 · 11/13)
 *  ① 📥 맡긴 일 줄(1.78.499·501 공용 줄 · 1.78.562~567 🟦 예스24 쓰기 되돌림·기다림): 🛒 판매처 상황판 아래 줄 '📥 맡긴 일 줄 n'(🟦·🟩 판매처별 · ⏸ 만료 빨강)
 *     · 누르면 지금 웹앱 🧾 통합 장부 › 🛠 처리할 일(맨 위 '맡긴 일 줄(공용)' 줄과 같은 숫자) · 📥 받은편지함 줄 · 별칭 맡긴일.기다림·예스24·네이버·만료
 *  ② 🚚 주소 옮기기(1.78.559 priv1): 옛 주소(jerrycson.github.io/readnow-ui2/)에서 연 리드나우 2 안에서는 지금 웹앱 노란 띠(→ readnow.kr/app/)를 빼고
 *     리드나우 2 자기 띠(→ readnow.kr/ui2/)를 보임 · 누르면 새 탭에 이 기기 rn 칸이 그대로 옮겨지고(rn2-move는 빼고) 새 주소 리드나우 2가 다시 열림 · 새 주소에선 띠가 없음
 *  쓰기 0(ui2_* 밖) · 브라우저 팝업 0 · 인터넷의 지금 웹앱·Firebase는 받지 않음(시험 사본·가짜) */
const fs = require('fs'); const path = require('path');
const { open, routeAll, ok, done, nonU2Writes, seed, chromium, OUT } = require('./lib');
(async () => {
  console.log('[0.4.15 지금 웹앱 1.78.523~566 따라 들임 — 📥 맡긴 일 줄 · 🚚 새 주소 readnow.kr/ui2/]');
  /* ── ① 📥 맡긴 일 줄 ── */
  {
    const t = await open({ q: '?p=channels', settle: 2500 }); const p = t.p;
    await seed(p, {});
    await p.waitForFunction(() => { try { return S.prodLoaded && typeof ledNow === 'function'; } catch (e) { return false; } }, null, { timeout: 60000 }).catch(() => {});
    const has = await p.evaluate(() => ({ y: typeof y24PLoad === 'function' && !!S.y24p, n: typeof nvPLoad === 'function' && !!S.nvp, card: typeof ledY24PendCard === 'function' }));
    ok(has.y && has.n && has.card, '지금 웹앱에 맡긴 일 줄 셈이 있음(y24PLoad · nvPLoad · ledY24PendCard)', JSON.stringify(has));
    /* 시험 줄: 🟦 예스24 기다림 1맡김(2줄) + 만료 1맡김(1줄) + 맡은 PC가 받기 기다림 1줄 · 🟩 네이버 기다림 1 — 다시 읽기(가짜 Firebase는 비어 있음)가 덮지 않게 at을 앞날로 */
    await p.evaluate(() => { const fut = Date.now() + 864e5; const at = new Date().toISOString();
      S.y24p.L = [{ id: 'j1', k: 'w', st: 'hold', at, holdAt: at, job: { id: 'j1', rows: [{ rid: 'r1' }, { rid: 'r2' }] } }, { id: 'j2', k: 'w', st: 'expired', at, job: { id: 'j2', rows: [{ rid: 'r3' }] } }, { id: 'j3', k: 'w', st: 'new', at, job: { id: 'j3', rows: [{ rid: 'r4' }] } }]; S.y24p.at = fut;
      S.nvp.L = [{ id: 'n1', st: 'hold', led: { rid: 'n1' }, job: { k: 'stop' }, at, holdAt: at }]; S.nvp.at = fut;
      S._led = null; U2.data && U2.data.bump && U2.data.bump(); U2.render(); });
    await p.waitForTimeout(1500);
    const cb = await p.evaluate(() => { const c = U2.view.cell('cb') || document.querySelector('.u2-cell[data-type="chboard"]'); const x = c && c.querySelector('[data-cb="pend"]'); return { on: !!x, txt: x ? x.textContent.replace(/\s+/g, ' ').trim() : '', b: x && x.querySelector('b') ? x.querySelector('b').textContent : '', hot: !!(x && x.classList.contains('u2-hot')) }; });
    ok(cb.on && cb.b === '4' && cb.hot, "🛒 판매처 상황판 아래 줄 '📥 맡긴 일 줄 4'(예스24 기다림 2줄 + 받기 기다림 1줄 · 네이버 1 · ⏸ 만료가 있어 빨강)", JSON.stringify(cb));
    ok(/🟦3/.test(cb.txt) && /🟩1/.test(cb.txt) && /만료 1/.test(cb.txt), '판매처별 숫자(🟦 3 · 🟩 1) · ⏸ 만료 1', cb.txt);
    const al = await p.evaluate(() => ({ w: U2.data.eval('맡긴일.기다림').v, y: U2.data.eval('맡긴일.예스24').v, n: U2.data.eval('맡긴일.네이버').v, x: U2.data.eval('맡긴일.만료').v }));
    ok(al.w === 4 && al.y === 3 && al.n === 1 && al.x === 1, '별칭 맡긴일.기다림 4 · 예스24 3 · 네이버 1 · 만료 1', JSON.stringify(al));
    /* 지금 웹앱 '맡긴 일 줄(공용)' 줄 글과 같은 숫자인가(같은 셈) */
    const lg = await p.evaluate(() => ({ y: (ledY24PendCard() || '').replace(/<[^>]+>/g, ''), n: (ledNvPendCard() || '').replace(/<[^>]+>/g, '') }));
    ok(/기다림 2건/.test(lg.y) && /받기 기다림 1건/.test(lg.y) && /만료 1건/.test(lg.y) && /기다림 1건/.test(lg.n), '지금 웹앱 처리할 일 맨 위 줄과 같은 셈(예스24 기다림 2 · 받기 기다림 1 · 만료 1 · 네이버 기다림 1)', lg.y.slice(0, 90));
    await p.evaluate(() => { const c = U2.view.cell('cb') || document.querySelector('.u2-cell[data-type="chboard"]'); c.querySelector('[data-cb="pend"]').click(); });
    await p.waitForTimeout(1800);
    const led = await p.evaluate(() => ({ v: S._ledView, big: S.detail && S.detail.bigTable, txt: /맡긴 일 줄\(공용\)/.test((document.getElementById('sheet') || {}).textContent || '') }));
    ok(led.v === 'todo' && led.big === 'ledger' && led.txt, "누르면 지금 웹앱 🧾 통합 장부 › 🛠 처리할 일 — 맨 위 '예스24 맡긴 일 줄(공용)' 줄이 보임", JSON.stringify(led));
    await p.evaluate(() => { try { closeDetail(); } catch (e) {} }); await p.waitForTimeout(500);
    /* 받은편지함 줄 */
    await p.evaluate(() => U2.go('inbox')); await p.waitForTimeout(1500);
    const ib = await p.evaluate(() => { const t = (document.querySelector('.u2-inbox') || {}).textContent || ''; return { has: /맡긴 일 줄\(공용\)/.test(t), txt: t.replace(/\s+/g, ' ').slice(0, 400) }; });
    ok(ib.has, "📥 받은편지함에 '📥 맡긴 일 줄(공용)' 줄", ib.txt.slice(0, 120));
    /* 휴대폰 폭 — 칩이 칸 밖으로 넘치지 않음 */
    await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => U2.go('channels')); await p.waitForTimeout(1800);
    const mb = await p.evaluate(() => { const c = document.querySelector('.u2-cell[data-type="chboard"]') || (U2.view.cell('cb')); const x = c && c.querySelector('[data-cb="pend"]'); if (!x) return { on: false }; const r = x.getBoundingClientRect(), cr = c.getBoundingClientRect(); return { on: true, inside: r.right <= cr.right + 1 && r.left >= cr.left - 1, w: Math.round(r.width) }; });
    ok(mb.on && mb.inside, '휴대폰 390px: 📥 맡긴 일 줄 칩이 칸 안에', JSON.stringify(mb));
    const w = await nonU2Writes(p); ok(w.length === 0 && t.dialogs.length === 0, '쓰기 0(ui2_* 밖) · 브라우저 팝업 0', w.join(',') + t.dialogs.join(','));
    ok(t.errs.length === 0, '오류 0', t.errs.slice(0, 2).join(' / '));
    await t.close();
  }
  /* ── ② 🚚 옛 주소 → 새 주소(readnow.kr/ui2/) ── */
  {
    const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' }); await routeAll(ctx);
    const ROOT = path.join(__dirname, '..'); const T = { js: 'application/javascript', html: 'text/html; charset=utf-8', css: 'text/css', json: 'application/json', png: 'image/png', svg: 'image/svg+xml', webmanifest: 'application/manifest+json' };
    const file = (r, f, base) => { if (!f.startsWith(base) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' }); return r.fulfill({ body: fs.readFileSync(f), contentType: T[path.extname(f).slice(1)] || 'application/octet-stream' }); };
    await ctx.route(/^https:\/\/readnow\.kr\//, (r) => { const u = new URL(r.request().url()); const pth = decodeURIComponent(u.pathname);
      if (/^\/ui2\//.test(pth)) return file(r, path.join(ROOT, pth.replace(/^\/ui2\//, '') || 'index.html'), ROOT);
      return file(r, path.join(OUT, pth.replace(/^\//, '')), OUT); });
    const errs = [], dlg = []; const watch = (pg) => { pg.on('pageerror', (e) => errs.push(e.message)); pg.on('dialog', (d) => { dlg.push(d.message()); d.dismiss().catch(() => {}); }); };
    const u = await ctx.newPage(); watch(u);
    await u.addInitScript(() => { if (location.origin === 'https://jerrycson.github.io' && !sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('rn-device', '시험 기기 A'); localStorage.setItem('rn2-c:ui2_prefs/시험', '{"a":1}'); localStorage.setItem('rn2-move', '{"state":"off","to":"https://jerrycson.github.io/readnow-ui2/"}'); localStorage.setItem('zz-other', '1'); } });
    await u.goto('https://jerrycson.github.io/readnow-ui2/index.html?p=home'); await u.waitForFunction(() => window.U2 && U2.legacy.ready && U2.legacy.shellDone, null, { timeout: 90000 }).catch(() => {}); await u.waitForTimeout(2500);
    const s0 = await u.evaluate(() => { const a = document.querySelector('#u2-addr [data-addr]'); return { old: !!document.getElementById('rn-move-bar'), bar: !!document.getElementById('u2-addr'), first: (document.getElementById('u2-banners') || {}).firstElementChild === document.getElementById('u2-addr'), href: a ? a.getAttribute('href') : '', rel: a ? a.getAttribute('rel') : '', tgt: a ? a.getAttribute('target') : '', ready: U2.legacy.ready }; });
    ok(s0.ready && !s0.old, '옛 주소 리드나우 2 안에 지금 웹앱 노란 띠(→ readnow.kr/app/)가 없음(눌러도 리드나우 2가 아닌 곳으로 가지 않게)', JSON.stringify(s0));
    ok(s0.bar && s0.first && /^https:\/\/readnow\.kr\/ui2\/\?rnmove=1/.test(s0.href) && s0.rel === 'opener' && s0.tgt === '_blank', "맨 위 '🚚 리드나우 2 주소가 readnow.kr/ui2/ 로' 띠 · 단추 = 새 탭 링크(브라우저 팝업 아님)", s0.href);
    const [nw] = await Promise.all([ctx.waitForEvent('page', { timeout: 30000 }), u.click('#u2-addr [data-addr]')]); watch(nw);
    await u.waitForFunction(() => /✅/.test((document.querySelector('#u2-addr [data-addr-msg]') || {}).textContent || ''), null, { timeout: 120000 }).catch(() => {});
    const s1 = await u.evaluate(() => ({ msg: (document.querySelector('#u2-addr [data-addr-msg]') || {}).textContent || '', mark: localStorage.getItem('rn2-addrMoved') }));
    ok(/✅ \d+칸 옮김/.test(s1.msg) && !!s1.mark, "새 탭이 짐을 받으면 옛 탭 띠가 '✅ n칸 옮김 — 이제 새 탭(readnow.kr/ui2/)을 쓰고…' · 기기 저장 rn2-addrMoved", s1.msg);
    await nw.waitForURL(/readnow\.kr\/ui2\/(index\.html)?(#.*)?$/, { timeout: 60000 }).catch(() => {});
    await nw.waitForFunction(() => window.U2 && U2.legacy && U2.legacy.ready && U2.legacy.shellDone, null, { timeout: 90000 }).catch(() => {}); await nw.waitForTimeout(2000);
    const s2 = await nw.evaluate(() => ({ url: location.href, dev: localStorage.getItem('rn-device'), pref: localStorage.getItem('rn2-c:ui2_prefs/시험'), mv: localStorage.getItem('rn2-move'), other: localStorage.getItem('zz-other'), bar: !!document.getElementById('u2-addr'), old: !!document.getElementById('rn-move-bar'), ver: window.U2_VER, base: U2.base }));
    ok(s2.dev === '시험 기기 A' && s2.pref === '{"a":1}' && s2.other == null, '새 주소에 이 기기 이름(rn-)·리드나우 2 배치(rn2-)가 옮겨짐 · rn 밖 칸은 안 옮김', JSON.stringify({ dev: s2.dev, pref: s2.pref, other: s2.other }));
    ok(!s2.mv || !/github\.io/.test(s2.mv), "이전 상태(rn2-move)는 옛 주소 값을 넘기지 않음(새 주소가 다시 셈)", String(s2.mv));
    ok(!/rnmove/.test(s2.url) && !s2.bar && !s2.old && /readnow\.kr\/app\//.test(s2.base), '새 주소 리드나우 2가 다시 열림(주소에 rnmove 없음) · 띠 없음 · 지금 웹앱은 readnow.kr/app/에서 불러옴', JSON.stringify({ url: s2.url, base: s2.base, ver: s2.ver }));
    const wr = await nw.evaluate(() => (window.__FSW || []).filter((w) => !/^ui2_/.test(String(w.n).split('/')[0])).length).catch(() => -1);
    ok(wr === 0 && dlg.length === 0, '쓰기 0(ui2_* 밖) · 브라우저 팝업 0', 'w ' + wr + ' · ' + dlg.join(','));
    ok(errs.length === 0, '오류 0', errs.slice(0, 2).join(' / '));
    await b.close();
  }
  done('t_follow2');
})();
