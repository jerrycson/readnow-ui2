/* 단계 4 완료 조건 — 기본 위젯·디자인 (설계안 11-2 단계 4 · 8-2 H-01·H-09 · E14)
 * H-01: 기본 위젯 하나씩 빈 페이지에 놓고 그림·지움 → 오류·중복 id·남은 타이머 0 · 한 페이지에 모두(겹침 0)
 * 위젯 동작(표 정렬·탭·접기·서랍/모달 층·Esc·체크 목록 기기 저장·별점·페이지 단추·두 번 누르기·허락 안 한 iframe)
 * H-09: 옛 CSS가 새 위젯 모양을 바꾸지 않음(안전 모드와 견줌) · 새 CSS가 옛 화면 모양을 바꾸지 않음(지금 웹앱 그대로 연 것과 견줌)
 * 테마 3가지 대비 4.5:1 · 휴대폰 360px 가로 스크롤 없음 */
const { open, ok, done, nonU2Writes } = require('./lib');
const mk = (types) => { const p = { id: 'wt', title: '위젯 시험', icon: '🧪', grid: { rowH: 16 }, rev: 0, widgets: {}, layouts: { pc: [] } }; let y = 0; types.forEach((t, i) => { const id = 'w' + i; p.widgets[id] = { type: t, props: {} }; }); return p; };
(async () => {
  console.log('[단계 4] 기본 위젯·디자인');
  let t = await open({ q: '?p=wt', settle: 1500 }); let p = t.p;
  await p.addStyleTag({ content: '.verbar{display:none!important}' });
  const types = await p.evaluate(() => U2W.order.filter((k) => !U2W.defs[k].legacy));
  ok(types.length >= 45, '기본 UI 위젯 종류', types.length + '종 (설계안 45종)');
  const groups = await p.evaluate(() => [...new Set(U2W.order.filter((k) => !U2W.defs[k].legacy).map((k) => U2W.defs[k].group))]);
  ok(groups.length === 6, '6묶음(글·그림·단추·링크·틀·자료 보기·입력·기타)', groups.join(' · '));
  /* 하나씩 */
  const res = await p.evaluate(async (types) => {
    const out = []; const iv0 = U2.guard.stats.intervals;
    for (const ty of types) {
      const pg = { id: 'wt', title: 't', grid: { rowH: 16 }, rev: 0, widgets: { a: { type: ty, props: {} } }, layouts: { pc: [{ id: 'a', x: 0, y: 0, w: U2W.defs[ty].w || 6, h: U2W.defs[ty].h || 4 }] } };
      U2.pages.wt = pg; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 20));
      const c = U2.view.cell('a'); const txt = c ? c.innerHTML : '';
      const err = /위젯 오류|모르는 위젯/.test(txt); const ids = [...c.querySelectorAll('[id]')].map((e) => e.id);
      out.push({ ty, ok: !!c && txt.length > 20 && !err, ids: ids.length, err });
    }
    U2.pages.wt = { id: 'wt', title: 't', grid: { rowH: 16 }, rev: 0, widgets: {}, layouts: { pc: [] } }; U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 30));
    return { out, ivLeft: U2.guard.stats.intervals - iv0 };
  }, types);
  const bad = res.out.filter((r) => !r.ok); ok(bad.length === 0, '위젯마다 그려짐(오류 0)', bad.map((b) => b.ty).join(', ') || '모두 ' + res.out.length);
  ok(res.out.every((r) => r.ids === 0), '위젯 안에 id 없음(같은 위젯 여럿이어도 id 겹침 0)');
  ok(res.ivLeft <= 0, '지운 뒤 남은 반복 타이머 0(시계 위젯 등 정리)', res.ivLeft);
  /* 한 페이지에 모두 */
  const all = await p.evaluate(async (types) => { const pg = { id: 'wt', title: '모두', grid: { rowH: 16 }, rev: 0, widgets: {}, layouts: { pc: [] } }; types.forEach((ty, i) => (pg.widgets['k' + i] = { type: ty, props: {} })); U2.pages.wt = pg; const t0 = performance.now(); U2.render({ reset: true }); const ms = performance.now() - t0; await new Promise((r) => setTimeout(r, 100)); const it = U2.view._items; return { n: document.querySelectorAll('#u2-page .u2-cell').length, ov: U2Grid.hasOverlap(it), ms: Math.round(ms), dup: U2.guard.dupIds() }; }, types);
  ok(all.n === types.length && !all.ov, '한 페이지에 기본 위젯 ' + types.length + '개 모두 — 겹침 0', '그리기 ' + all.ms + 'ms');
  ok(all.dup.length === 0, '문서 전체 중복 id 0', all.dup.join(','));
  /* 동작 */
  const act = await p.evaluate(async () => {
    const r = {}; const W = (type, props, w, h) => { U2.pages.wt = { id: 'wt', title: 't', grid: { rowH: 16 }, rev: 0, widgets: { a: { type, props: Object.assign(U2W.defaults(type), props || {}) } }, layouts: { pc: [{ id: 'a', x: 0, y: 0, w: w || 12, h: h || 12 }] } }; U2.render({ reset: true }); return U2.view.cell('a'); };
    let c = W('table', { data: '책,권수\n가,3\n나,10\n다,1' }); c.querySelectorAll('th')[1].click(); r.asc = [...c.querySelectorAll('tbody tr td:nth-child(2)')].map((x) => x.textContent).join(','); c.querySelectorAll('th')[1].click(); r.desc = [...c.querySelectorAll('tbody tr td:nth-child(2)')].map((x) => x.textContent).join(',');
    c = W('tabs'); c.querySelectorAll('[data-i]')[1].click(); r.tab = c.querySelector('.u2-tabb').textContent;
    c = W('accordion'); const ds = c.querySelectorAll('details'); ds[0].open = true; await new Promise((s) => setTimeout(s, 20)); ds[1].open = true; await new Promise((s) => setTimeout(s, 20)); r.acc = [ds[0].open, ds[1].open];
    c = W('drawer', { text: '서랍 안 글' }); c.querySelector('button').click(); r.layer = !!document.querySelector('.u2-layer.u2-drawer'); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); r.layerEsc = !document.querySelector('.u2-layer');
    c = W('modal', { text: '모달 글' }); c.querySelector('button').click(); r.modal = !!document.querySelector('.u2-layer.u2-modal'); document.querySelector('.u2-layer [data-x]').click(); r.modalX = !document.querySelector('.u2-layer');
    c = W('checklist'); c.querySelector('input').click(); r.chk = JSON.stringify(U2.ls.get('chk-a', {}));
    c = W('rating'); c.querySelectorAll('[data-v]')[3].click(); r.rate = U2.ls.get('rate-a', 0);
    c = W('iframe', { url: 'https://example.com/' }); r.ifr = !c.querySelector('iframe') && /허락한 주소만/.test(c.textContent);
    c = W('link', { url: 'https://example.com/', label: '바깥', newTab: true }); const a = c.querySelector('a'); r.link = a.target === '_blank' && a.rel === 'noopener';
    c = W('button', { label: '두 번', act: 'toast', arg: '실행함', confirm: true }); const b = c.querySelector('button'); b.click(); r.arm = /한 번 더 누르면/.test(b.textContent); b.click(); r.armRun = /실행함/.test(document.getElementById('u2-toast').textContent);
    c = W('button', { label: '주문으로', act: 'page', arg: 'orders' }); c.querySelector('button').click(); await new Promise((s) => setTimeout(s, 300)); r.page = U2.cur;
    await U2.go('wt'); return r;
  });
  ok(act.asc === '1,3,10' && act.desc === '10,3,1', '표: 머리 누르면 오름차순 · 또 누르면 내림차순(숫자 기준)', act.asc + ' / ' + act.desc);
  ok(/둘째 탭/.test(act.tab), '탭 위젯: 누르면 바뀜');
  ok(act.acc[0] === false && act.acc[1] === true, '접기 위젯: 하나만 펼침');
  ok(act.layer && act.layerEsc, '서랍: 화면 안 층으로 열리고 Esc로 닫힘');
  ok(act.modal && act.modalX, '모달 블록: 화면 안 층 · 닫기');
  ok(act.chk === '{"0":true}' && act.rate === 4, '체크 목록·별점: 이 기기(rn2-)에 기억', act.chk + ' · ' + act.rate);
  ok(act.ifr, '바깥 페이지 보기: 허락하지 않은 주소는 안 엶');
  ok(act.link, "바깥 링크 '새 탭'은 <a target=_blank rel=noopener>(브라우저 작은 창 아님)");
  ok(act.arm && act.armRun, '확인이 필요한 단추: 두 번 누르기');
  ok(act.page === 'orders', "단추 '페이지로' → 그 페이지로");
  ok((await nonU2Writes(p)).length === 0, '위젯 시험 동안 ui2_ 밖 쓰기 0');
  ok(t.dialogs.length === 0, '브라우저 팝업 0');
  /* H-09 ①: 옛 CSS가 새 위젯 모양을 바꾸나 — 견본 대시보드를 그리고 계산된 모양을 뽑아 안전 모드(옛 CSS 없음)와 견줌 */
  const sig = async (pp) => pp.evaluate(async () => { U2.pages.wt = U2.TEMPLATES.dash.make('wt'); await U2.go('wt'); U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 200)); const pick = ['.u2-cell .u2-kpi b', '.u2-cell .u2-tbl th', '.u2-cell .u2-tbl td', '.u2-cell .u2-cardbtn', '.u2-cell .u2-h', '.u2-cell .u2-memo', '.u2-bar .u2-btn', '.u2-nav a', '.u2-cell .u2-wf', '.u2-cell .u2-wt']; const P = ['font-size', 'font-weight', 'padding-top', 'padding-left', 'border-top-width', 'border-radius', 'background-color', 'color', 'line-height', 'margin-top']; return pick.map((s) => { const e = document.querySelector(s); if (!e) return s + ':없음'; const cs = getComputedStyle(e); return s + '|' + P.map((k) => cs.getPropertyValue(k)).join(';'); }); });
  const withLegacy = await sig(p); const errs1 = t.errs.filter((e) => !/js-profiling/.test(e)); await t.close();
  t = await open({ q: '?p=wt', override: (rel) => (rel === 'app/index.html' ? { status: 404, body: '' } : null) }); p = t.p;
  const noLegacy = await sig(p); await t.close();
  const diff = withLegacy.filter((s, i) => s !== noLegacy[i]);
  ok(diff.length === 0, 'H-09 옛 CSS가 새 위젯 모양을 바꾸지 않음(10곳 · 10가지 모양 값)', diff.length ? diff.join('\n      ') + '\n   안전 모드: ' + noLegacy.filter((s, i) => s !== withLegacy[i]).join('\n      ') : '같음');
  /* H-09 ②: 새 CSS가 옛 화면을 바꾸나 — 지금 웹앱을 그대로 연 것과 견줌 */
  const legSig = (pp) => pp.evaluate(() => { const P = ['font-size', 'font-weight', 'padding-top', 'padding-left', 'border-top-width', 'border-radius', 'background-color', 'color', 'line-height']; const pick = ['header.top h1', '#q', '#main details.sec > summary', '#main details.sec', '#main .card', '#main button']; return pick.map((s) => { const e = document.querySelector(s); if (!e) return s + ':없음'; const cs = getComputedStyle(e); return s + '|' + P.map((k) => cs.getPropertyValue(k)).join(';'); }); });
  t = await open({ q: '?p=home', settle: 3000 }); p = t.p; const inU2 = await legSig(p); await t.close();
  { const { chromium } = require('./lib'); const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' }); const pg = await ctx.newPage();
    const fs = require('fs'), path = require('path'); const STUB = fs.readFileSync(path.join(__dirname, 'fbstub2.js'), 'utf8'); const OUT = require('./lib').OUT;
    await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 404, body: '' }));
    await ctx.route(/gstatic\.com\/firebasejs\//, (r) => r.fulfill({ body: /firebase-app-compat\.js/.test(r.request().url()) ? STUB : '', contentType: 'application/javascript' }));
    await ctx.route(/^https:\/\/jerrycson\.github\.io\/readnow-scripts\//, (r) => { const rel = new URL(r.request().url()).pathname.replace(/^\/readnow-scripts\//, ''); const f = path.join(OUT, rel); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ body: fs.readFileSync(f), contentType: /\.html$/.test(f) ? 'text/html; charset=utf-8' : 'application/javascript' }); });
    await pg.goto('https://jerrycson.github.io/readnow-scripts/app/index.html'); await pg.waitForTimeout(4500);
    const classic = await legSig(pg); await b.close();
    const d2 = classic.filter((s, i) => s !== inU2[i] && !/:없음$/.test(s) && !/:없음$/.test(inU2[i]));
    const both = classic.filter((s, i) => !/:없음$/.test(s) && !/:없음$/.test(inU2[i])).length;
    ok(d2.length === 0 && both >= 4, 'H-09 새 CSS가 옛 화면 모양을 바꾸지 않음(지금 웹앱을 그대로 연 것과 같음)', d2.length ? d2.join(' / ') + ' ← 새 웹앱: ' + inU2.filter((s, i) => s !== classic[i]).join(' / ') : both + '곳 같음');
  }
  /* 테마 */
  t = await open({ q: '?p=wt', settle: 1500 }); p = t.p;
  const ck = await p.evaluate(() => Object.keys(U2.theme.THEMES).map((k) => [k, U2.theme.check(k)]));
  ck.forEach(([k, rows]) => ok(rows.every((r) => r.r >= 4.5), `테마 '${k}' 글자·바탕 대비 4.5:1 이상`, rows.map((r) => r.a.slice(2) + '/' + r.b.slice(2) + ' ' + r.r).join(' · ')));
  const th = await p.evaluate(async () => { U2.pages.wt = U2.TEMPLATES.dash.make('wt'); U2.render({ reset: true }); U2.theme.choose('dark'); await new Promise((r) => setTimeout(r, 100)); const bg = getComputedStyle(document.querySelector('.u2-cell .u2-wf')).backgroundColor; const saved = localStorage.getItem('rn2-theme'); return { bg, saved, pats: Object.keys(U2.theme.PAT).length, icons: U2.theme.ICONS.length }; });
  ok(th.bg === 'rgb(27, 36, 33)' && th.saved === '"dark"', '어두운 테마를 고르면 위젯 바탕이 바뀌고 이 기기(rn2-theme)에 기억', th.bg);
  ok(th.pats === 6 && th.icons >= 50, '무늬 6가지(없음 포함) · 아이콘 묶음', th.pats + ' · ' + th.icons);
  await p.screenshot({ path: process.env.U2_SHOT_DIR ? process.env.U2_SHOT_DIR + '/dark.png' : '/tmp/u2-dark.png' }).catch(() => {});
  const lgLight = await p.evaluate(() => { U2.pages.wt = { id: 'wt', title: 't', grid: { rowH: 16 }, rev: 0, widgets: { m: { type: 'legacy.tab', props: { ref: 'home' } } }, layouts: { pc: [{ id: 'm', x: 0, y: 0, w: 24, h: 40 }] } }; U2.render({ reset: true }); const el = document.querySelector('.u2-cell .u2-lg'); return el ? getComputedStyle(el).getPropertyValue('--paper').trim() : null; });
  ok(lgLight === '#FFFFFF', '어두운 테마에서도 옛 기능 칸은 밝은 색 그대로(옛 화면은 어두운 바탕을 생각하지 않음)', lgLight);
  await p.evaluate(() => U2.theme.choose('light')); await t.close();
  /* 휴대폰 360px — 견본 대시보드 */
  t = await open({ q: '?p=wt', vp: { width: 360, height: 760 }, touch: true, settle: 1500 }); p = t.p;
  const ph = await p.evaluate(async () => { U2.pages.wt = U2.TEMPLATES.dash.make('wt'); U2.render({ reset: true }); await new Promise((r) => setTimeout(r, 200)); return { cols: +U2.view.el.dataset.cols, sw: document.documentElement.scrollWidth, ov: U2Grid.hasOverlap(U2.view._items), maxR: Math.max(...[...document.querySelectorAll('#u2-page .u2-cell')].map((c) => c.getBoundingClientRect().right)) }; });
  ok(ph.cols === 4 && ph.sw <= 360 && !ph.ov && ph.maxR <= 360, '휴대폰 360px: 견본 대시보드가 4칸으로 흘러 가로 스크롤 없음 · 겹침 0', JSON.stringify(ph));
  await t.close();
  ok(errs1.length === 0, '화면 오류 0', errs1.slice(0, 3).join(' / '));
  done('t_widgets');
})();
