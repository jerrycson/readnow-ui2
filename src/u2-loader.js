/* 리드나우 2 — 지금 웹앱 불러오기 + 옛 기능 잇기(어댑터 첫 묶음) (설계안 3-5 · 4-2)
 * 차례: ① 지금 웹앱 틀(U2_BASE/index.html)을 읽음 → ② 그 안 CSS를 '@layer legacy'로 감싸 붙임(새 웹앱 CSS가 늘 이김 · 옛 화면 모양은 그대로)
 *       → ③ <script>를 적힌 차례대로 하나씩(Firebase → 공용 파일 → 틀 안 작은 스크립트 → 본문) · 공용 파일 주소는 U2_BASE 기준 절대 주소로
 *       → Firebase가 들어온 바로 뒤 쓰기 막이(u2-guard)를 걺 — 막이를 못 걸면 본문을 불러오지 않음(안전 모드)
 *       → ④ 본문이 끝나면 shell·renderMain을 새 웹앱 쪽으로 이어 걺
 * 실패하면 '안전 모드': 새 꾸미기 위젯만 쓰고, 기능 위젯 자리에는 '지금 웹앱에서 열기 ›' */
(function () {
  'use strict';
  const U2 = (window.U2 = window.U2 || {});
  const L = (U2.legacy = { ready: false, shellDone: false, lastTab: null, tabMounted: 0, cards: new Set(), errs: [], appVer: null });
  const SKIP = [/webmanifest/]; /* 빼는 틀 안 스크립트: 휴대폰 설치 파일 고르기(새 웹앱은 자기 설치 파일) */
  const loadScript = (src, text) => new Promise((res, rej) => {
    const s = document.createElement('script');
    if (text != null) { s.textContent = text; document.body.appendChild(s); return res(); }
    s.src = src; s.async = false; let to = setTimeout(() => rej(new Error('시간 넘김: ' + src)), 120e3);
    s.onload = () => { clearTimeout(to); res(); }; s.onerror = () => { clearTimeout(to); rej(new Error('파일을 못 받음: ' + src)); };
    document.body.appendChild(s);
  });
  L.safe = (why) => { L.ready = false; U2.safe = { why: String(why && why.message || why) }; L.errs.push(U2.safe.why); try { U2.ls.set('lastErr', { at: U2.now(), why: U2.safe.why }); } catch (e) {} U2.emit('safe', U2.safe); };

  L.run = async function () {
    const base = U2.base; const t0 = performance.now();
    let html;
    try { const r = await fetch(new URL('index.html', base).href, { cache: 'no-cache' }); if (!r.ok) throw new Error('지금 웹앱 틀을 받지 못함 (' + r.status + ')'); html = await r.text(); } catch (e) { return L.safe(e); }
    let doc; try { doc = new DOMParser().parseFromString(html, 'text/html'); } catch (e) { return L.safe('틀을 읽지 못함'); }
    const scripts = Array.from(doc.querySelectorAll('script'));
    if (!scripts.some((s) => /readnow-webapp\.js/.test(s.getAttribute('src') || ''))) return L.safe('틀 모양이 바뀜 — 본문(readnow-webapp.js) 줄을 찾지 못함');
    /* ② 옛 CSS */
    const css = Array.from(doc.querySelectorAll('style')).map((s) => s.textContent).join('\n');
    if (css) { const st = document.createElement('style'); st.id = 'u2-legacy-css'; st.textContent = '@layer legacy{\n' + css + '\n}'; document.head.insertBefore(st, document.head.firstChild); }
    const tc = doc.querySelector('meta[name="theme-color"]'); if (tc) { /* 새 웹앱 띠 색은 그대로 둠 */ }
    /* ③ 스크립트 차례대로 */
    try {
      for (const s of scripts) {
        const src = s.getAttribute('src');
        if (!src) { const t = s.textContent || ''; if (SKIP.some((re) => re.test(t))) continue; await loadScript(null, t); continue; }
        const url = new URL(src, base).href; const isBody = /readnow-webapp\.js/.test(src);
        if (isBody) {
          if (!(U2.guard && U2.guard.install())) throw new Error('쓰기 막이를 걸 수 없음(Firebase 모양이 다름) — 안전하게 본문을 불러오지 않음');
          U2.emit('loadStep', '본문');
        }
        await loadScript(url);
        if (U2.guard && !U2.guard.installed && window.firebase && window.firebase.firestore) U2.guard.install();
        if (isBody) L.attach();
      }
    } catch (e) { return L.safe(e); }
    L.loadMs = Math.round(performance.now() - t0);
    try { L.appVer = typeof APP_VER !== 'undefined' ? APP_VER : null; } catch (e) {}
    U2.guard.startTimers();
    U2.emit('legacyLoaded', L);
  };

  /* ④ 잇기 */
  L.attach = function () {
    const miss = ['shell', 'renderMain'].filter((n) => typeof window[n] !== 'function');
    if (miss.length) throw new Error('계약 함수가 없음: ' + miss.join(', '));
    const oShell = window.shell; L.oRender = window.renderMain;
    window.shell = function () { const r = oShell.apply(this, arguments); L.shellDone = true; try { L.lastTab = S.tab; } catch (e) {} /* 여는 순간의 옛 탭은 따라가지 않음(옛 코드가 '그 자리 되살리기'로 탭을 정해도 새 웹앱 페이지는 주소 ?p= 그대로) */ document.body.classList.add('u2-legacy-on'); U2.emit('legacyShell'); return r; };
    window.renderMain = function () {
      if (U2.adapters && U2.adapters.rendering) return; /* 섹션 위젯을 그리는 동안 옛 코드가 부른 다시 그리기는 무시(탭을 잠깐 바꿔 두었으므로) */
      let tab = null; try { tab = S.tab; } catch (e) {}
      if (L.shellDone && tab && tab !== L.lastTab) { L.lastTab = tab; const pid = U2.pageForTab && U2.pageForTab(tab); if (pid && pid !== U2.cur) { U2.go(pid); return; } }
      L.refreshCards(); if (U2.data) U2.data.bump(); if (U2.adapters) U2.adapters.refresh(); /* 식이 든 위젯도 0.7초 모아 */
      if (!L.tabMounted) { L.dirty = true; return; } /* 이 페이지에 옛 탭이 없으면 그리지 않음(가벼움) */
      return L.oRender.apply(this, arguments);
    };
    L.ready = true;
    setTimeout(() => { try { U2.adapters && U2.adapters.check(); } catch (e) {} }, 0); /* 계약 검사 */
    try { firebase.auth().onAuthStateChanged((u) => { U2.authed = !!u; U2.emit('auth', u); }); } catch (e) {}
  };
  const home = () => document.getElementById('app');
  /* T1 탭 위젯: 옛 #main을 이 칸으로 옮기고 그 탭을 그림(한 페이지에 하나) */
  L.mountTab = function (b, ref) {
    b.classList.add('u2-lg');
    const put = () => {
      const main = document.getElementById('main'); if (!main) { b.innerHTML = '<div class="u2-empty">⏳ 지금 웹앱을 여는 중…</div>'; return false; }
      b.innerHTML = ''; b.appendChild(main); L.tabMounted++;
      try { S.tab = ref; S.limit = 30; S._userAt = Date.now(); } catch (e) {} L.lastTab = ref; /* 사람이 페이지를 바꾼 것 = 옛 화면도 미루지 않고 바로 그림 */
      try { L.oRender(); } catch (e) { console.error('[u2] 옛 탭 그리기', e); }
      try { U2.catalog && setTimeout(() => U2.catalog.learn(main, ref), 1500); } catch (e) {} /* 화면에 나온 섹션을 목록에 더함 */
      return true;
    };
    let ok = put(), off = null, dead = false;
    if (!ok) off = U2.on('legacyShell', () => { if (!ok && !dead) ok = put(); });
    return () => { dead = true; if (off) off(); const main = document.getElementById('main'); if (ok && main && b.contains(main)) { L.tabMounted--; const a = home(); if (a) a.appendChild(main); } };
  };
  L.mountHeader = function (b) {
    b.classList.add('u2-lg');
    const put = () => { const h = document.querySelector('header.top'); if (!h) { b.innerHTML = '<div class="u2-empty">⏳ 여는 중…</div>'; return false; } b.innerHTML = ''; b.appendChild(h); return true; };
    let ok = put(), off = null, dead = false; if (!ok) off = U2.on('legacyShell', () => { if (!ok && !dead) ok = put(); });
    return () => { dead = true; if (off) off(); const h = document.querySelector('header.top'); if (ok && h && b.contains(h)) { const a = home(); if (a) a.insertBefore(h, a.firstChild); } };
  };
  /* T3 홈 칸(보기 전용) — 옛 코드가 자료가 바뀌었다고 하면(renderMain) 0.7초 모아 다시 그림 */
  L.mountHomeCard = function (b, ref) {
    b.classList.add('u2-lg');
    const draw = () => { let W0 = null; try { W0 = typeof WIDGETS !== 'undefined' ? WIDGETS[ref] : null; } catch (e) {} if (!W0) { b.innerHTML = '<div class="u2-empty">홈 칸을 찾지 못함: ' + U2.esc(ref) + '</div>'; return; } let h = ''; try { h = W0[1](); } catch (e) { h = '<div class="u2-empty">아직 자료가 없음</div>'; } b.innerHTML = '<div class="u2-hc"><b>' + U2.esc(W0[0]) + '</b><div>' + h + '</div></div>'; };
    const it = { draw }; L.cards.add(it); draw();
    return () => L.cards.delete(it);
  };
  L.refreshCards = function () { if (!L.cards.size) return; clearTimeout(L._ch); L._ch = setTimeout(() => L.cards.forEach((c) => { try { c.draw(); } catch (e) {} }), 700); };
  /* 지금 웹앱 전역 목록(const라 window에 없음 — 이름마다 typeof로 읽음 · eval 안 씀) */
  const GL = { FEAT: () => (typeof FEAT !== 'undefined' ? FEAT : null), PG_SCR: () => (typeof PG_SCR !== 'undefined' ? PG_SCR : null), WIDGETS: () => (typeof WIDGETS !== 'undefined' ? WIDGETS : null), W_DESC: () => (typeof W_DESC !== 'undefined' ? W_DESC : null) };
  L.list = (n) => { try { return GL[n] ? GL[n]() : null; } catch (e) { return null; } };
  L.findFeat = (q) => { const F = L.list('FEAT'); if (!F || !q) return null; return F.find((f) => f.t === q) || F.find((f) => String(f.t).indexOf(q) >= 0) || null; };
  L.feat = (q) => { const f = L.findFeat(q); if (!f) return U2.toast('기능을 찾지 못함: ' + q, 1); U2.setCtx('feat:' + q); try { return typeof featGo === 'function' ? featGo(f) : f.go && f.go.fn && f.go.fn(); } catch (e) { U2.toast('기능 실행 중 오류: ' + e.message, 1); } };
  L.findScreen = (k) => { const P = L.list('PG_SCR'); if (!P) return null; return P.find((r) => r[0] === k) || null; };
  L.screen = (k) => { const r = L.findScreen(k); const fn = r && window[r[3]]; if (typeof fn !== 'function') return U2.toast('화면을 열 수 없음: ' + k, 1); U2.setCtx('screen:' + k); try { return fn(); } catch (e) { U2.toast('화면을 여는 중 오류: ' + e.message, 1); } };
  /* 서랍에 보일 옛 기능 목록 — 실행 중에 지금 웹앱 목록에서 저절로(설계안 6-3 첫 단계) */
  L.catalog = () => {
    const out = { screens: [], feats: [], home: [] };
    const P = L.list('PG_SCR'); if (P) P.forEach((r) => { if (typeof window[r[3]] === 'function' && window[r[3]].length === 0) out.screens.push({ k: r[0], t: r[1] }); });
    const F = L.list('FEAT'); if (F) F.forEach((f) => out.feats.push({ t: f.t, k: f.k || '' }));
    const Wd = L.list('WIDGETS'), D = L.list('W_DESC') || {}; if (Wd) Object.keys(Wd).forEach((k) => out.home.push({ k, t: Wd[k][0], d: D[k] || '' }));
    return out;
  };
  /* 새 판 확인(설계안 3-2): 불러온 지금 웹앱 판(APP_VER) · 새 웹앱 판(U2_VER)이 바뀌면 띠 */
  L.checkNew = async function () {
    const out = {};
    try { const t = await (await fetch(new URL('index.html', U2.base).href, { cache: 'no-cache' })).text(); const m = /const APP_VER = '([^']+)'/.exec(t); if (m && L.appVer && m[1] !== L.appVer) out.app = m[1]; } catch (e) {}
    try { const t = await (await fetch('u2-config.js', { cache: 'no-cache' })).text(); const m = /U2_VER = '([^']+)'/.exec(t); if (m && m[1] !== U2.ver) out.u2 = m[1]; } catch (e) {}
    if (out.app || out.u2) U2.emit('newVer', out);
    return out;
  };
})();
