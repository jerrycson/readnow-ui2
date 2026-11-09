/* 실화면 점검(단계 12 시범 운행 준비 · 11/05) — 정범님이 실제로 쓰다 깨지는 것을 미리 찾음
 * 지금 웹앱 배포본(U2_TEST_OUT · 기본 /home/user/w/out) 위에서 새 웹앱의
 *   A. 모든 페이지(머리의 페이지 전부) × PC 1400·휴대폰 390: 빈 화면 · 칸 겹침 · 가려짐(칸 가운데를 다른 것이 덮음) · 옛 화면 새어 나옴(옛 머리줄·탭 줄·#main이 칸 밖에 보임)
 *      · 옛 상세 층·점수 창이 저절로 뜸 · 가로 스크롤 · 위젯 오류 글 · 콘솔 오류
 *   B. 모든 위젯(기본·덜 쓰는 것 전부 + 리드나우 기능 위젯 종류마다) 한 페이지에 × PC·휴대폰: 빈 칸 · 오류 · 칸 밖으로 넘침 · 겹침
 *   C. 옛 화면(대상 없이 열리는 것 전부)을 오른쪽 나란히 창으로: 창 밖으로 안 나옴 · 오류 0 · 페이지가 그대로 보임
 * 화면 사진: U2_SHOT_DIR(기본 저장 안 함) — 사람이 눈으로 봄 · 사진 묶음(contact sheet)은 tools 없이 시험 밖에서 */
const path = require('path');
const { open, ok, done, chromium, nonU2Writes, OUT } = require('./lib');
const DIR = process.env.U2_SHOT_DIR || '';
const APPV = (/const APP_VER = '([^']+)'/.exec(require('fs').readFileSync(path.join(OUT, 'app/index.html'), 'utf8')) || [])[1] || '0';
const NOVER = `(() => { try { localStorage.setItem('rn-lastver', ${JSON.stringify(APPV)}); } catch (e) {} })()`; /* 지금 웹앱 '새 판으로 바뀜' 띠는 따로(아래 V) 봄 — 페이지 사진은 띠 없이 */
const PHONE = { vp: { width: 390, height: 844 }, touch: true, ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36' };
/* 한 화면 살피기(페이지 안에서) */
const inspect = () => {
  const out = { probs: [] }; const add = (k, v) => out.probs.push(k + (v ? ': ' + v : ''));
  const vis = (e) => { if (!e || !e.isConnected) return false; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05; };
  const host = document.getElementById('u2-page'); const cells = [...host.querySelectorAll('.u2-grid > .u2-cell')];
  out.cells = cells.length; out.txt = (host.innerText || '').replace(/\s+/g, ' ').trim().length;
  if (!cells.length || out.txt < 40) add('빈 화면', '칸 ' + cells.length + ' · 글 ' + out.txt);
  const rs = cells.map((c) => ({ c, r: c.getBoundingClientRect(), f: c.classList.contains('u2-float') })).filter((x) => x.r.width > 1 && x.r.height > 1);
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i], b = rs[j]; if (a.f || b.f) continue; const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top); if (w > 3 && h > 3) add('칸 겹침', a.c.dataset.wid + '×' + b.c.dataset.wid + ' ' + Math.round(w) + '×' + Math.round(h)); }
  /* 가려짐: 화면 안에 보이는 칸 가운데(그리고 위 1/4)를 무엇이 덮나 — 칸 자신·그 안이 아니면 덮은 것 */
  const cover = new Map();
  rs.forEach(({ c, r }) => { [[0.5, 0.5], [0.5, 0.2], [0.15, 0.5], [0.85, 0.5]].forEach(([fx, fy]) => { const x = r.left + r.width * fx, y = r.top + Math.min(r.height * fy, 300); if (y < 0 || y > innerHeight - 2 || x < 0 || x > innerWidth - 2) return; const e = document.elementFromPoint(x, y); if (!e || c.contains(e)) return; const k = e.closest('#u2-bar') || e.closest('#dlp') || e.closest('.rnfab, .rnfab-m, .rnfab-bg') ? null : /* .rnfab = 지금 웹앱 1.78.37x부터 휴대폰 '☰ 떠 있는 단추 모음'(맨 위로·그래프 스위치 등을 한 단추로 · 오른쪽 아래 · 지금 웹앱에서도 같은 자리 · 설계안 H-06 그 자리는 옛 떠 있는 것 몫) */ /* #dlp = 지금 웹앱 '받는 중' 띠(다 받으면 5초 뒤 저절로 사라짐 · 지금 웹앱에서도 같음) */ (e.closest('[id]') || e).id || String(e.className).split(' ')[0] || e.tagName; if (k) cover.set(k, (cover.get(k) || 0) + 1); }); });
  out.cover = [...cover.entries()].map(([k, n]) => k + '×' + n);
  /* 옛 화면 새어 나옴 */
  ['header.top', '#main', '#tabs', '#rank', '#app > .tabs'].forEach((s) => { const e = document.querySelector(s); if (e && vis(e) && !e.closest('.u2-cell')) add('옛 화면 새어 나옴', s); });
  const sh = document.getElementById('sheet'); if (sh && sh.classList.contains('on')) add('옛 상세 층이 떠 있음', (typeof S !== 'undefined' && S.detail) ? Object.keys(S.detail)[0] : '');
  const md = document.getElementById('modal'); if (md && md.classList.contains('on')) add('점수 창이 떠 있음');
  if (document.documentElement.scrollWidth > innerWidth + 1) { const wide = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0 && getComputedStyle(e).position !== 'fixed' && !e.closest('.u2-nav') && vis(e); }).slice(0, 3).map((e) => (e.id || String(e.className).split(' ')[0] || e.tagName) + '→' + Math.round(e.getBoundingClientRect().right)); add('가로 스크롤', document.documentElement.scrollWidth + 'px > ' + innerWidth + ' ' + wide.join(',')); }
  if (/위젯 오류|모르는 위젯/.test(host.innerText)) add('위젯 오류 글');
  /* 칸 안 기본 위젯이 칸 밖으로 넘침(글·단추가 잘려 안 보임) */
  rs.forEach(({ c, r }) => { const b = c.querySelector(':scope > .u2-wf > .u2-b'); if (!b || c.classList.contains('u2-autoh')) return; const ov = b.scrollHeight - b.clientHeight; const cs = getComputedStyle(b); if (ov > 24 && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') add('칸 안 넘침(잘림)', c.dataset.wid + ' ' + (c.dataset.type || '') + ' +' + ov + 'px'); });
  /* 옛 기능 칸(겉 틀이 overflow:visible)의 내용이 칸 밖으로 흘러 아래 칸과 겹침 */
  rs.forEach(({ c, r }) => { const f = c.firstElementChild; if (!f || c.classList.contains('u2-autoh')) return; const cs = getComputedStyle(f); if (cs.overflowY === 'visible' && f.scrollHeight > c.clientHeight + 6) add('칸 밖으로 흘러넘침', (c.dataset.type || c.dataset.wid) + ' +' + (f.scrollHeight - c.clientHeight) + 'px'); });
  return out;
};
(async () => {
  const b = await chromium.launch();
  const report = { pages: {}, widgets: {}, screens: {} };
  for (const [dev, o] of [['pc', { vp: { width: 1400, height: 900 } }], ['phone', PHONE]]) {
    console.log('[실화면 점검] A. 모든 페이지 — ' + (dev === 'pc' ? 'PC 1400×900' : '휴대폰 390×844'));
    const t = await open(Object.assign({ browser: b, init: NOVER, settle: 2500 }, o)); const p = t.p;
    const ids = await p.evaluate(() => U2.site.nav.filter((n) => !n.hide).map((n) => n.id).concat(Object.keys(U2.EXTRA_TABS || {})));
    let nBad = 0; const lines = [];
    for (const id of ids) {
      const e0 = t.errs.length;
      await p.evaluate((id) => U2.go(id), id); await p.waitForTimeout(1600);
      const r = await p.evaluate(inspect); r.errs = t.errs.slice(e0).filter((e) => !/js-profiling/.test(e));
      if (DIR) await p.screenshot({ path: path.join(DIR, `real_A_${dev}_${id}.png`) });
      report.pages[dev + ':' + id] = r;
      const bad = r.probs.length || r.errs.length; if (bad) { nBad++; lines.push(id + ' — ' + r.probs.concat(r.errs).join(' / ')); }
      if (r.cover.length) lines.push(id + ' (덮인 자리: ' + r.cover.join(', ') + ')');
    }
    ok(nBad === 0, `A ${dev}: 페이지 ${ids.length}개 — 빈 화면·겹침·옛 화면 새어 나옴·저절로 뜬 층·가로 스크롤·위젯 오류·콘솔 오류 0`, lines.join(' | ') || '모두 깨끗');
    const covered = Object.entries(report.pages).filter(([k, r]) => k.startsWith(dev + ':') && r.cover.length).map(([k, r]) => k.split(':')[1] + ' ' + r.cover.join(','));
    ok(covered.length === 0, `  ${dev}: 칸 가운데를 다른 것이 덮지 않음`, covered.join(' | ') || '0');
    /* B. 모든 위젯 */
    console.log('[실화면 점검] B. 모든 위젯 — ' + dev);
    await p.evaluate(() => U2W.lazyLoad && U2W.lazyLoad()).catch(() => {}); await p.waitForTimeout(800);
    const types = await p.evaluate(() => U2W.order.filter((k) => !U2W.defs[k].legacy));
    const chunk = dev === 'pc' ? 20 : 12; let wBad = []; let k = 0;
    for (let i = 0; i < types.length; i += chunk, k++) {
      const part = types.slice(i, i + chunk); const e0 = t.errs.length;
      await p.evaluate((part) => { const pg = { id: 'rw', title: '위젯 점검', grid: { rowH: 16 }, rev: 0, widgets: {}, layouts: { pc: [] } }; let x = 0, y = 0, rowH = 0; part.forEach((ty, j) => { const d = U2W.defs[ty]; const w = Math.min(24, d.w || 6), h = d.h || 4; if (x + w > 24) { x = 0; y += rowH; rowH = 0; } pg.widgets['w' + j] = { type: ty, props: U2W.defaults(ty) }; pg.layouts.pc.push({ id: 'w' + j, x, y, w, h }); x += w; rowH = Math.max(rowH, h); }); U2.pages.rw = pg; U2.go('rw', { force: true }); }, part);
      await p.waitForTimeout(1500);
      const r = await p.evaluate(inspect); r.errs = t.errs.slice(e0).filter((e) => !/js-profiling/.test(e));
      const empty = await p.evaluate(() => [...document.querySelectorAll('#u2-page .u2-cell')].filter((c) => { const t0 = (c.innerText || '').trim(); return t0.length < 1 && !['spacer', 'pattern'].includes(c.dataset.type) && !c.querySelector('canvas,svg,img,input,textarea,iframe,hr') && !c.classList.contains('u2-lazy'); }).map((c) => c.dataset.type || c.dataset.wid));
      if (DIR) await p.screenshot({ path: path.join(DIR, `real_B_${dev}_${k}.png`), fullPage: true });
      report.widgets[dev + ':' + k] = { part, r, empty };
      if (r.probs.length || r.errs.length) wBad.push('묶음' + k + ' ' + r.probs.concat(r.errs).join(' / '));
      if (empty.length) wBad.push('묶음' + k + ' 빈 칸 ' + empty.join(','));
      const tight = await p.evaluate(() => [...document.querySelectorAll('#u2-page .u2-cell')].map((c) => { const b0 = c.querySelector(':scope > .u2-wf > .u2-b'); return b0 && b0.scrollHeight - b0.clientHeight > 2 ? (c.dataset.type || c.dataset.wid) + '+' + (b0.scrollHeight - b0.clientHeight) : null; }).filter(Boolean));
      if (tight.length) wBad.push('묶음' + k + ' 기본 크기에서 내용이 잘리거나 굴림 막대 ' + tight.join(','));
    }
    ok(wBad.length === 0, `B ${dev}: 기본 위젯 ${types.length}종 — 빈 칸·오류·넘침·겹침 0`, wBad.join(' | ') || '모두 깨끗');
    /* 리드나우 기능 위젯 종류마다 */
    const e1 = t.errs.length;
    await p.evaluate(() => { const pg = { id: 'rl', title: '기능 위젯 점검', grid: { rowH: 16 }, rev: 0, widgets: { h: { type: 'legacy.header', props: {} }, c1: { type: 'legacy.homecard', props: { ref: 'pace' } }, c2: { type: 'legacy.homecard', props: { ref: Object.keys(U2.legacy.list('WIDGETS') || {})[1] || 'pace' } }, f: { type: 'legacy.feat', props: { feat: '오늘 출고', label: '' } }, s: { type: 'legacy.screen', props: { scr: 'ship', label: '' } }, d: { type: 'legacy.dock', props: { title: '옛 화면 자리', scrs: 'register,ship' } }, x: { type: 'legacy.sec', props: { ref: 'bz_pace', tab: 'biz' } } }, layouts: { pc: [{ id: 'h', x: 0, y: 0, w: 24, h: 8 }, { id: 'c1', x: 0, y: 8, w: 8, h: 10 }, { id: 'c2', x: 8, y: 8, w: 8, h: 10 }, { id: 'f', x: 16, y: 8, w: 4, h: 4 }, { id: 's', x: 20, y: 8, w: 4, h: 4 }, { id: 'x', x: 0, y: 18, w: 12, h: 16 }, { id: 'd', x: 12, y: 18, w: 12, h: 30 }] } }; U2.pages.rl = pg; U2.go('rl', { force: true }); });
    await p.waitForTimeout(2200);
    const rl = await p.evaluate(inspect); rl.errs = t.errs.slice(e1).filter((e) => !/js-profiling/.test(e));
    if (DIR) await p.screenshot({ path: path.join(DIR, `real_B_${dev}_legacy.png`), fullPage: true });
    ok(!rl.probs.length && !rl.errs.length, `  ${dev}: 리드나우 기능 위젯 7종(머리줄·홈 칸·기능 단추·화면 단추·섹션·🪟 옛 화면 자리) 한 페이지 — 문제 0`, rl.probs.concat(rl.errs).join(' / ') || '깨끗');
    /* C. 옛 화면을 나란히(PC)·전체(휴대폰)로 */
    console.log('[실화면 점검] C. 옛 화면 — ' + dev);
    await p.evaluate(() => U2.go('orders')); await p.waitForTimeout(1200);
    const scrAll = await p.evaluate(() => (U2.legacy.list('PG_SCR') || []).filter((r) => typeof window[r[3]] === 'function').map((r) => [r[0], U2.legacy.needsArg(r[0])]));
    const scr = scrAll.filter((x) => !x[1]).map((x) => x[0]), argS = scrAll.filter((x) => x[1]).map((x) => x[0]);
    const argR = await p.evaluate(async (ks) => { const o = []; for (const k of ks) { const before = document.getElementById('sheet').classList.contains('on'); U2.legacy.screen(k); const t0 = (document.getElementById('u2-toast') || {}).textContent || ''; o.push({ k, opened: !before && document.getElementById('sheet').classList.contains('on'), msg: /대상/.test(t0) }); } return o; }, argS);
    ok(argR.every((x) => !x.opened && x.msg) && argS.length >= 8, `  ${dev}: 대상이 있어야 열리는 화면 ${argS.length}개는 열지 않고 '대상이 있어야 열림' 안내(전엔 오류 글)`, argR.filter((x) => x.opened || !x.msg).map((x) => x.k).join(',') || argS.join(','));
    const cBad = []; let shotN = 0;
    for (const k2 of scr) {
      const e2 = t.errs.length;
      await p.evaluate(() => { if (!U2.toast._rec) { const o = U2.toast; U2.toast = function (m, err) { if (err) (window.__u2err = window.__u2err || []).push(String(m)); return o.apply(this, arguments); }; U2.toast._rec = 1; } window.__u2err = []; });
      await p.evaluate((k) => { try { U2.legacy.screen(k); } catch (e) { console.error('화면 오류 ' + k + ' ' + e.message); } }, k2); await p.waitForTimeout(450);
      const r = await p.evaluate(() => { const sh = document.getElementById('sheet'); const a = sh.getBoundingClientRect(); const on = sh.classList.contains('on'); const pg = document.getElementById('u2-page').getBoundingClientRect(); const fx = [...sh.querySelectorAll('*')].filter((e) => { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.right > 0 && r.left < innerWidth && (r.left < a.left - 2 || r.right > a.right + 2); /* 화면 밖에 숨겨 둔 서랍(설명서 목차 등)은 뺌 */ }).map((e) => String(e.className).split(' ')[0] || e.tagName).slice(0, 3); const md = document.getElementById('modal'); return { on, cls: document.body.className, L: Math.round(a.left), pgR: Math.round(pg.right), fx, modal: !!(md && md.classList.contains('on')) }; });
      const errs = t.errs.slice(e2).filter((e) => !/js-profiling/.test(e));
      const terr = await p.evaluate(() => window.__u2err || []); if (terr.length) errs.push('오류 알림 ' + terr.join(','));
      const side = r.cls.includes('u2-dside');
      if (r.on && (dev === 'pc' ? !side || r.pgR > r.L + 2 : !r.cls.includes('u2-dfull'))) cBad.push(k2 + ' 자리 ' + r.cls);
      if (r.fx.length) cBad.push(k2 + ' 창 밖으로 나온 고정 칸 ' + r.fx.join(','));
      if (errs.length) cBad.push(k2 + ' ' + errs.join(' / '));
      if (DIR && r.on && shotN < 8 && ['register', 'ship', 'prodAll', 'priceQueue', 'purForm', 'shipDay', 'chaseEngine', 'batch'].includes(k2)) { shotN++; await p.screenshot({ path: path.join(DIR, `real_C_${dev}_${k2}.png`) }); }
      report.screens[dev + ':' + k2] = { on: r.on, cls: r.cls, errs };
      await p.evaluate(() => { try { if (document.getElementById('modal').classList.contains('on')) closeModal(); } catch (e) {} try { closeDetail(); } catch (e) {} });
    }
    const opened = Object.entries(report.screens).filter(([kk, v]) => kk.startsWith(dev + ':') && v.on).length;
    ok(cBad.length === 0, `C ${dev}: 옛 화면 ${scr.length}개(열린 것 ${opened}) — ${dev === 'pc' ? '오른쪽 나란히 창 안에' : '머리 아래 전체로'} · 창 밖 고정 칸 0 · 오류 0`, cBad.slice(0, 12).join(' | ') || '모두 깨끗');
    ok(t.dialogs.length === 0, `  ${dev}: 브라우저 팝업 0`, t.dialogs.join(' | '));
    ok((await nonU2Writes(p)).length === 0, `  ${dev}: ui2_ 밖 쓰기 0`);
    await t.close();
  }
  /* V. 지금 웹앱 '새 판으로 바뀜' 띠(판이 바뀐 뒤 처음 열 때) — 휴대폰 첫 화면을 다 덮지 않음 */
  { const t = await open(Object.assign({ browser: b, init: () => { try { localStorage.setItem('rn-lastver', '1.0.0'); } catch (e) {} }, settle: 2500 }, PHONE)); const p = t.p;
    const v = await p.evaluate(() => { const e = document.querySelector('body > .verbar:not(.mini)'); if (!e) return null; const r = e.getBoundingClientRect(); const bar = document.getElementById('u2-bar').getBoundingClientRect(); return { h: Math.round(r.height), barTop: Math.round(bar.top), sh: e.scrollHeight }; });
    if (DIR) await p.screenshot({ path: path.join(DIR, 'real_V_phone_verbar.png') });
    ok(v && v.h <= 844 * 0.3 + 1 && v.barTop < 844 * 0.45, "V 휴대폰: '새 판으로 바뀜' 띠는 화면 30%까지 · 새 웹앱 머리줄이 첫 화면에 보임", JSON.stringify(v));
    await t.close(); }
  if (DIR) require('fs').writeFileSync(path.join(DIR, 'real_report.json'), JSON.stringify(report, null, 1));
  await b.close();
  done('실화면 점검');
})().catch((e) => { console.error(e); process.exitCode = 1; });
