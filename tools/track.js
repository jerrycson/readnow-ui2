#!/usr/bin/env node
/* 리드나우 2 — 지금 웹앱 따라잡기 표 만들기 (설계안 9장 · 단계 7)
 * 지금 웹앱 저장소(readnow-scripts)를 '읽기만' 함 — git log·git show만 씀(아무것도 쓰지 않음)
 * src/app.html 커밋마다 그 판 원본을 꺼내 → 판 번호·🔍 기능 찾기(FEAT)·상세 화면(PG_SCR)·섹션(sec)·홈 칸(WIDGETS)·탭 줄을 뽑고 앞 판과 견줌
 *   + 계약 목록(u2-contract.json — 새 웹앱이 부르는 옛 함수·값·화면 id)이 살아 있나·인자 수가 같은가
 *   + 그 판 바뀐 것(CHANGELOG 첫 줄)과 날짜(UPDATE_DATES)
 * → TRACK.json(기계) · TRACK.md(사람) · 새 항목이나 ❌가 있으면 끝 코드 1
 * 쓰는 법: node tools/track.js [--repo ../readnow-scripts] [--since 7] [--max 400] [--out .] [--quiet]
 *   이미 표에 있는 커밋은 건너뜀(이어서) · ✅로 고친 줄은 그대로 둠 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.join(__dirname, '..');
const between = (t, a, b, from) => { const i = t.indexOf(a, from || 0); if (i < 0) return ''; const j = t.indexOf(b, i + a.length); return j < 0 ? '' : t.slice(i, j); };
const uniq = (a) => [...new Set(a)];
/* ── 한 판 원본에서 목록·계약 뽑기(release-guard.js와 같은 '글로 읽기' 방식) ── */
function extract(t, contract) {
  const o = {};
  o.ver = (/const APP_VER = '([^']+)'/.exec(t) || [])[1] || null;
  o.feat = uniq([...between(t, 'const FEAT = [', '\n];').matchAll(/\{ t: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'")));
  o.screen = uniq([...between(t, 'const PG_SCR = [', '\n];').matchAll(/\['(\w+)', '(?:[^'\\]|\\.)*', (?:\([^)]*\) => [^,]+|null), '(\w+)'\]/g)].map((m) => m[1]));
  o.sec = uniq([...t.matchAll(/\bsec\('([a-z]+_[A-Za-z0-9_]*)'/g)].map((m) => m[1]).concat([...between(t, 'const THIN_SEC = {', '\nconst THIN_X').matchAll(/\['([a-z]+_[A-Za-z0-9_]+)', '/g)].map((m) => m[1])));
  o.widget = uniq([...between(t, 'const WIDGETS = {', '\n};').matchAll(/\n {2}(\w+): \[/g)].map((m) => m[1]));
  o.tab = [...between(between(t, 'function renderTabs() {', '\n}'), 'const t = [', '];').matchAll(/\['(\w+)', '([^']*)', ICON\./g)].map((m) => m[1]);
  /* 계약 */
  const bad = [];
  const arity = (name) => {
    let m = new RegExp('(?:^|[\\s;}])(?:async\\s+)?function\\s+' + name + '\\s*\\(([^)]*)\\)').exec(t);
    if (!m) m = new RegExp('(?:^|[\\s;])(?:const|let|var)?\\s*' + name + '\\s*=\\s*(?:async\\s*)?\\(([^)]*)\\)\\s*=>').exec(t);
    if (!m) m = new RegExp('(?:^|[\\s;])(?:const|let|var)?\\s*' + name + '\\s*=\\s*(?:async\\s+)?function\\s*\\(([^)]*)\\)').exec(t);
    if (!m) return null; const ps = m[1].trim(); if (!ps) return 0;
    let n = 0; for (const p of ps.split(',')) { if (/=/.test(p) || /^\s*\.\.\./.test(p)) break; n++; } return n; /* 기본값·나머지 인자 앞까지 = 함수.length와 같음 */
  };
  (contract.fns || []).forEach(([n, a]) => { const r = arity(n); if (r === null) bad.push(n + ' 없음'); else if (a != null && r !== a) bad.push(n + ' 인자 ' + r + '(기대 ' + a + ')'); });
  (contract.vals || []).forEach(([n]) => { if (!new RegExp('(?:const|let|var)\\s+' + n + '\\s*=').test(t)) bad.push(n + ' 없음'); });
  (contract.ids || []).forEach((id) => { if (t.indexOf('id="' + id + '"') < 0) bad.push('#' + id + ' 없음'); });
  (contract.floats || []).forEach((id) => { if (t.indexOf("id = '" + id + "'") < 0 && t.indexOf('id="' + id + '"') < 0) bad.push('#' + id + ' 떠 있는 판 없음'); });
  o.contractBad = bad;
  return JSON.parse(JSON.stringify(o)); /* 큰 원본 글(1.5MB)의 조각을 붙잡지 않게 새 글로 복사 — 안 하면 판 수백 개에서 메모리가 넘침 */
}
const changelog = (t, ver) => { if (!ver) return ''; const b = between(t, "  '" + ver + "': [", '],\n'); const m = /\["((?:[^"\\]|\\.)*)"/.exec(b + ']') || /\['((?:[^'\\]|\\.)*)'/.exec(b + ']'); return m ? m[1].replace(/\\"/g, '"').slice(0, 160) : ''; };
const dateOf = (t, ver) => (new RegExp("'" + String(ver).replace(/\./g, '\\.') + "': '(\\d{4}-\\d{2}-\\d{2})'").exec(between(t, 'const UPDATE_DATES = {', '};')) || [])[1] || '';
const cmpVer = (a, b) => { const x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };
const diff = (a, b) => ({ add: b.filter((x) => !a.includes(x)), del: a.filter((x) => !b.includes(x)) });
/* ── 전체 일정(PLAN.json · 단계 0~13) — TRACK.json plan · TRACK.md 맨 위 '전체 일정 요약' ── */
const ST = { done: '✅ 끝', doing: '⏳ 진행 중', boss: '🙋 정범님 필요', todo: '⬜ 아직' };
function readPlan() { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'PLAN.json'), 'utf8')); } catch (e) { return null; } }
/* 단계 진행도(%): 끝·정범님 필요(코드는 끝, 정범님 확인만 남음) 100 · 진행 중 = 적은 pct 또는 달력 날수(지난 날 ÷ days) · 아직 0 */
function stagePct(s, now) { if (s.state === 'done' || s.state === 'boss') return 100; if (s.state === 'todo') return 0; if (s.pct != null) return Math.max(0, Math.min(100, +s.pct)); if (s.days && s.start) return Math.max(0, Math.min(99, Math.round(((now - Date.parse(s.start)) / 864e5 / s.days) * 100))); return 0; }
function planSum(P, now) {
  now = now || Date.now(); const S = (P && P.stages) || []; const est = S.reduce((a, s) => a + (+s.estH || 0), 0);
  const doneH = S.reduce((a, s) => a + (+s.estH || 0) * stagePct(s, now) / 100, 0);
  const groups = {}; S.forEach((s) => { if (s.group && s.start && s.end) groups[s.group] = Math.round((Date.parse(s.end) - Date.parse(s.start)) / 6e4); });
  const actMin = S.reduce((a, s) => a + (s.group ? 0 : +s.actMin || 0), 0) + Object.values(groups).reduce((a, b) => a + b, 0);
  return { est, doneH: Math.round(doneH * 10) / 10, pct: est ? Math.round((doneH / est) * 100) : 0, actMin, groups, n: S.length, cnt: Object.fromEntries(Object.keys(ST).map((k) => [k, S.filter((s) => s.state === k).length])) };
}
const bar = (pct, n) => { n = n || 20; const f = Math.round((pct / 100) * n); return '█'.repeat(f) + '░'.repeat(n - f); };
const hm = (m) => (m == null ? '—' : m >= 60 ? Math.floor(m / 60) + '시간 ' + (m % 60) + '분' : m + '분');
/* 회차 기록(PLAN.json round — 손으로 고침): 이번 회차에 끝낸 것 · 남은 단계 · 다음 회차 할 일 · 이전 가능 시점 어림 */
function roundMd(R) {
  if (!R) return ''; const li = (a) => (a || []).map((x) => '- ' + x).join('\n');
  return `## 🔜 회차 기록 (마지막 ${R.at || ''} · 새 웹앱 ${R.ver || ''})

**이번 회차에 끝낸 것**
${li(R.done)}

**남은 단계**
${li(R.left)}

**다음 회차 할 일**
${li(R.next)}

**이전 가능 시점(어림)** ${R.moveEta || '—'}

`;
}
function planMd(P, now) {
  if (!P || !P.stages) return '';
  now = now || Date.now(); const T = planSum(P, now); const esc = (s) => String(s || '').replace(/\|/g, '／').replace(/\n/g, ' ');
  const kst = (iso) => (iso ? new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(5, 16).replace('T', ' ') : '');
  const seenG = new Set();
  const act = (s) => { if (s.group) { if (seenG.has(s.group)) return '↑'; seenG.add(s.group); return hm(T.groups[s.group]) + '(' + s.group + ' 합)'; } if (s.state === 'doing' && s.days && s.start) return Math.floor((now - Date.parse(s.start)) / 864e5) + '일째 / ' + s.days + '일'; return hm(s.actMin); };
  return `## 🗓 전체 일정 요약 (설계안 단계 0~13)

만들기(코드) **${T.pct}%** \`${bar(T.pct, 30)}\` · 어림 ${T.est}시간 중 ${T.doneH}시간어치 · 실제 걸린 시간 합 ${hm(T.actMin)} · **정범님 확인까지 끝난 단계 ${T.cnt.done}/${T.n}** · ✅ 끝 ${T.cnt.done} · 🙋 정범님 필요 ${T.cnt.boss} · ⏳ 진행 중 ${T.cnt.doing} · ⬜ 아직 ${T.cnt.todo}
(손으로 고치는 \`PLAN.json\` → 이 표 · 새 웹앱 ☰ 메뉴·🧪 프로젝트 페이지 '🗓 전체 일정'에서 막대로 · 🙋 = 코드는 끝, 정범님 확인이 남음)

| 단계 | 이름 | 상태 | 진행 | 예상 | 실제 | 시작~끝(한국 시각) | 정범님 할 일 |
|---|---|---|---|---|---|---|---|
${P.stages.map((s) => { const pc = stagePct(s, now); return `| ${s.n} | ${esc(s.name)} | ${ST[s.state] || s.state} | \`${bar(pc, 10)}\` ${pc}% | ${s.estH}시간 | ${act(s)} | ${kst(s.start)}${s.end ? ' ~ ' + kst(s.end) : s.start ? ' ~' : ''} | ${esc(s.boss || '')} |`; }).join('\n')}

${roundMd(P.round)}`;
}
function writePlan(out) { const jf = path.join(out, 'TRACK.json'); const J = JSON.parse(fs.readFileSync(jf, 'utf8')); J.plan = readPlan(); fs.writeFileSync(jf, JSON.stringify(J, null, 1) + '\n'); fs.writeFileSync(path.join(out, 'TRACK.md'), md(J)); return J; }
function run(opt) {
  const repo = path.resolve(opt.repo); const git = (args) => cp.execFileSync('git', ['-C', repo].concat(args), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'u2-contract.json'), 'utf8'));
  const jf = path.join(opt.out, 'TRACK.json'); let J = { kind: 'readnow-ui2-track', rows: [] }; try { J = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) {}
  J.plan = readPlan(); /* 전체 일정 — 늘 이 판의 PLAN.json으로 */
  J.rows = (J.rows || []).filter((r) => r.sha); const have = new Set(J.rows.map((r) => r.sha.slice(0, 9)));
  const log = git(['log', '--since=' + opt.since + '.days', '--format=%H|%cI|%s', '--reverse', '--', 'src/app.html']).trim().split('\n').filter(Boolean).slice(-opt.max);
  if (!log.length) { fs.writeFileSync(jf, JSON.stringify(J, null, 1) + '\n'); fs.writeFileSync(path.join(opt.out, 'TRACK.md'), md(J)); if (!opt.quiet) console.log('바뀐 판 없음'); return { J, added: 0, todo: 0, bad: 0 }; }
  /* 앞 판 = 그 커밋의 첫 부모(가지가 섞인 log 차례로 견주면 판이 오락가락함) */
  const memo = new Map(); const ex = (sha) => { if (memo.has(sha)) return memo.get(sha); let v = null; try { v = extract(git(['show', sha + ':src/app.html']), contract); } catch (e) {} memo.set(sha, v); if (memo.size > 40) memo.delete(memo.keys().next().value); return v; };
  let added = 0; const t0 = Date.now();
  for (const line of log) {
    const [sha, at, subj] = line.split('|');
    if (have.has(sha.slice(0, 9))) continue;
    const text = git(['show', sha + ':src/app.html']); const cur = extract(text, contract); memo.set(sha, cur);
    let prev = null; try { prev = ex(git(['rev-parse', sha + '^']).trim()); } catch (e) {}
    {
      const nw = {}, gone = {}; ['tab', 'feat', 'screen', 'sec', 'widget'].forEach((k) => { const d = prev ? diff(prev[k], cur[k]) : { add: [], del: [] }; if (d.add.length) nw[k] = d.add; if (d.del.length) gone[k] = d.del; });
      const any = Object.keys(nw).length || Object.keys(gone).length; const bad = cur.contractBad;
      J.rows.push({ sha: sha.slice(0, 9), at: at.slice(0, 16), app: cur.ver, date: dateOf(text, cur.ver), change: JSON.parse(JSON.stringify(changelog(text, cur.ver) || subj.slice(0, 160))), newItems: nw, gone, contract: bad.length ? bad : 'ok', state: contract.baseline && cmpVer(cur.ver, contract.baseline) < 0 ? '➖' : bad.length ? '❌' : any ? '⬜' : '➖', ...(contract.baseline && cmpVer(cur.ver, contract.baseline) < 0 ? { note: '새 웹앱 시작 판(' + contract.baseline + ') 전' } : {}), by: 'track.js' });
      added++;
    }
  }
  J.lastSha = log[log.length - 1].split('|')[0].slice(0, 9); J.at = new Date().toISOString(); J.contract = contract.fns.map((f) => f[0]).concat(contract.vals.map((v) => v[0]), contract.ids.map((i) => '#' + i));
  J.rows.sort((a, b) => (a.at < b.at ? -1 : 1));
  fs.writeFileSync(jf, JSON.stringify(J, null, 1) + '\n');
  fs.writeFileSync(path.join(opt.out, 'TRACK.md'), md(J));
  const todo = J.rows.filter((r) => r.state === '⬜').length, bad = J.rows.filter((r) => r.state === '❌').length;
  if (!opt.quiet) console.log(`따라잡기 표: 새 줄 ${added} · 전체 ${J.rows.length} · ⬜ 할 일 ${todo} · ❌ 계약 깨짐 ${bad} · ${Math.round((Date.now() - t0) / 100) / 10}초`);
  return { J, added, todo, bad };
}
const NM = { tab: '탭', feat: '기능', screen: '화면', sec: '섹션', widget: '홈 칸' };
function md(J) {
  const esc = (s) => String(s || '').replace(/\|/g, '／').replace(/\n/g, ' ');
  const items = (o) => Object.entries(o || {}).map(([k, v]) => `${NM[k]} ${v.length}(${esc(v.slice(0, 3).join(', '))}${v.length > 3 ? ' …' : ''})`).join(' · ') || '—';
  const rows = J.rows.slice().reverse();
  return `# 🔁 따라잡기 표 (지금 웹앱 판 → 새 웹앱 반영)

${planMd(J.plan)}## 판마다 따라잡기

\`tools/track.js\`가 저절로 채웁니다(지금 웹앱 저장소를 읽기만 함). 마지막: ${J.at || ''} · 마지막 커밋 ${J.lastSha || ''}
읽는 법: ⬜ 할 일(새 탭·섹션·화면·기능이 생김 — 분류·설명·기본 자리 확인) · ⏳ 하는 중 · ✅ 반영 · ➖ 반영할 것 없음(내부만 바뀜) · ❌ 계약(새 웹앱이 부르는 옛 함수) 깨짐 — 어댑터를 고쳐야 함

| 판 | 날짜 | 커밋 | 바뀐 것 | 새로 생김 | 없어짐 | 계약 | 반영 |
|---|---|---|---|---|---|---|---|
${rows.map((r) => `| ${esc(r.app)} | ${esc(r.date || r.at)} | ${esc(r.sha)} | ${esc(r.change)} | ${items(r.newItems)} | ${items(r.gone)} | ${r.contract === 'ok' ? '✅' : '❌ ' + esc([].concat(r.contract).join(', '))} | ${r.state}${r.ui2 ? ' ' + esc(r.ui2) : ''}${r.note ? ' ' + esc(r.note) : ''} |`).join('\n')}

## 계약 목록(새 웹앱이 부르는 옛 함수·값·화면 뼈대 — u2-contract.json)
${(J.contract || []).map((c) => '`' + c + '`').join(' · ')}
`;
}
module.exports = { cmpVer, extract, changelog, dateOf, run, md, readPlan, planSum, planMd, stagePct, writePlan };
/* 손으로 반영 표시: node tools/track.js --mark <커밋 앞 9자리|전부⬜> <✅|⏳|➖|⬜> "<메모(새 웹앱 판 등)>" */
function mark(out, who, st, note) { const jf = path.join(out, 'TRACK.json'); const J = JSON.parse(fs.readFileSync(jf, 'utf8')); let n = 0; J.rows.forEach((r) => { if (r.sha === who || (who === '전부⬜' && r.state === '⬜')) { r.state = st; r.ui2 = note || ''; r.by = 'ui2 세션'; r.markedAt = new Date().toISOString(); n++; } }); fs.writeFileSync(jf, JSON.stringify(J, null, 1) + '\n'); fs.writeFileSync(path.join(out, 'TRACK.md'), md(J)); return n; }
module.exports.mark = mark;
if (require.main === module && process.argv.includes('--plan')) { const J = writePlan(path.resolve(arg('out', ROOT))); const T = planSum(J.plan); console.log('전체 일정: ' + T.pct + '% · 단계 ' + T.n + ' · 어림 ' + T.est + '시간'); } /* node tools/track.js --plan — PLAN.json만 표에 옮김(git 안 읽음) */
else if (require.main === module && process.argv.includes('--mark')) { const i = process.argv.indexOf('--mark'); const n = mark(path.resolve(arg('out', ROOT)), process.argv[i + 1], process.argv[i + 2], process.argv[i + 3]); console.log('표시함 ' + n + '줄'); }
else if (require.main === module) {
  const r = run({ repo: arg('repo', path.join(ROOT, '..', 'readnow-scripts')), since: +arg('since', 7), max: +arg('max', 400), out: path.resolve(arg('out', ROOT)), quiet: process.argv.includes('--quiet') });
  process.exitCode = r.bad || r.added && r.todo ? 1 : 0;
}
