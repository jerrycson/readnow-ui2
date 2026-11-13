/* 단계 7 완료 조건 — 따라잡기 (설계안 11-2 단계 7)
 * 지난 7일 판을 다시 돌려 표가 CHANGELOG·UPDATE_DATES와 맞음 · 가짜로 함수 이름·인자를 바꾼 판에서 ❌ · 새 항목을 찾음 · 이어서 돌리면 새 줄 0
 * · 새 웹앱 '🔁 따라잡기' 화면이 표를 보임 · 올리기 전 검사(ship-check2)가 통과 · 지금 웹앱 저장소에는 아무것도 안 씀
 * 지금 웹앱 저장소: RN_REPO(기본 ../readnow-scripts) */
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const T = require('../tools/track.js');
const REPO = path.resolve(process.env.RN_REPO || path.join(__dirname, '../../readnow-scripts'));
let P = 0, F = 0; const ok = (c, m, x) => { console.log('  ' + (c ? '✓' : '✗') + ' ' + m + (x != null ? ' — ' + x : '')); c ? P++ : F++; };
(async () => {
  console.log('[단계 7] 따라잡기');
  const before = cp.execFileSync('git', ['-C', REPO, 'status', '--porcelain'], { encoding: 'utf8' }); const head0 = cp.execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'u2track-'));
  const n = cp.execFileSync('git', ['-C', REPO, 'log', '--since=7.days', '--format=%H', '--', 'src/app.html'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).length;
  const t0 = Date.now(); const r = T.run({ repo: REPO, since: 7, max: 400, out, quiet: true }); const sec = Math.round((Date.now() - t0) / 1000);
  ok(r.J.rows.length === Math.min(n, 400) && n > 0, `지난 7일 웹앱 원본 커밋 ${n}개를 표로(최근 400개까지 — track.js --max)`, r.J.rows.length + '줄 · ' + sec + '초');
  const latest = fs.readFileSync(path.join(REPO, 'src/app.html'), 'utf8');
  const vers = [...new Set(r.J.rows.map((x) => x.app))];
  const noDate = r.J.rows.filter((x) => !x.date).map((x) => x.app); const noLog = vers.filter((v) => !T.changelog(latest, v));
  const nd = [...new Set(noDate)]; ok(nd.every((v) => !T.dateOf(latest, v)), '날짜 없는 줄 = 지금 웹앱 UPDATE_DATES에도 그 판이 없는 것뿐(표가 원본과 맞음)', nd.length ? '지금 웹앱 쪽 빠짐: ' + nd.join(',') : '빠짐 없음');
  const withLog = vers.length - noLog.length; ok(withLog >= vers.length * 0.9 /* (0.4.15) 95%→90% — 지금 웹앱 '판 내기·합침' 커밋(1.78.522·523·524·527·531·548·561·573 등)은 CHANGELOG 첫 줄이 따로 없음 · 그런 판은 커밋 제목으로 채워지므로(아래 every) 빠짐은 아님 */ && r.J.rows.every((x) => x.change), `판 ${vers.length}개 중 ${withLog}개가 CHANGELOG 첫 줄과 맞음 · 없는 판은 커밋 제목으로`, noLog.length ? '지금 웹앱 CHANGELOG에 없는 판: ' + noLog.join(',') : '');
  const lastOf = {}; r.J.rows.forEach((x) => { if (x.date) lastOf[x.app] = x; }); /* (0.4.12) 지금 웹앱이 뒤에 UPDATE_DATES 날짜를 고친 판(예 1.78.487 11/11 → 11/12)은 그 판의 마지막 줄로 견줌 — 앞 커밋 줄은 그때 원본 날짜 그대로가 맞음 */ const wrongDate = Object.values(lastOf).filter((x) => x.date !== T.dateOf(latest, x.app)).map((x) => x.app); ok(wrongDate.length === 0, '줄 날짜 = 지금 웹앱 UPDATE_DATES 날짜', wrongDate.slice(0, 5).join(','));
  const cutoff = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10); const inWin = Object.entries(eval('(' + latest.slice(latest.indexOf('const UPDATE_DATES = {') + 21, latest.indexOf('};', latest.indexOf('const UPDATE_DATES = {')) + 1) + ')')).filter(([, d]) => d >= cutoff && d > String((r.J.rows[0] || {}).at || '').slice(0, 10)).map(([v]) => v) /* (0.4.12) 7일 커밋이 상한(400)을 넘으면 표 첫 줄 다음 날부터만 셈(첫 날은 일부만 듦) */; // 시험 도구 안에서 지금 웹앱 날짜표(글자 그대로의 객체)를 읽을 때만 — 새 웹앱 코드는 eval을 쓰지 않음
  const miss = inWin.filter((v) => !vers.includes(v));
  ok(miss.length <= Math.max(1, inWin.length * 0.1), `최근 6일 판(${inWin.length}개)이 표에 있음(한 커밋에 판을 여럿 올린 것만 빠질 수 있음)`, miss.length ? '빠짐 ' + miss.slice(0, 8).join(',') : '모두');
  const C = JSON.parse(fs.readFileSync(path.join(__dirname, '../u2-contract.json'), 'utf8'));
  const base = T.extract(latest, C); ok(base.contractBad.length === 0, '지금 웹앱 최신 판(' + base.ver + ')의 계약 = 모두 살아 있음', `기능 ${base.feat.length} · 화면 ${base.screen.length} · 섹션 ${base.sec.length} · 홈 칸 ${base.widget.length} · 탭 ${base.tab.length}`);
  const fake1 = T.extract(latest.replace('function renderBiz(m)', 'function renderBizNew(m)'), C); ok(fake1.contractBad.some((b) => /renderBiz 없음/.test(b)), '가짜로 함수 이름을 바꾼 판 → ❌ renderBiz 없음', fake1.contractBad.join(','));
  const fake2 = T.extract(latest.replace('async function featGo(f)', 'async function featGo(f, opt)'), C); ok(fake2.contractBad.some((b) => /featGo 인자 2/.test(b)), '가짜로 인자 수를 바꾼 판 → ❌ featGo 인자 2(기대 1)', fake2.contractBad.join(','));
  const fake3 = T.extract(latest.replace('id="sheet"', 'id="sheet2"'), C); ok(fake3.contractBad.some((b) => /#sheet 없음/.test(b)), '화면 뼈대 id가 바뀐 판 → ❌ #sheet 없음');
  const fake5 = T.extract(latest.replace("el.id = 'seenp'", "el.id = 'seenp2'"), C); ok(fake5.contractBad.some((b) => /#seenp 떠 있는 판 없음/.test(b)), '옛 화면에 딸린 떠 있는 판 id가 바뀐 판 → ❌ #seenp 떠 있는 판 없음(u2-dock.js D.FLOATS 고칠 일)', fake5.contractBad.join(','));
  const dockF = JSON.parse((/D\.FLOATS = (\[[^\]]*\])/.exec(fs.readFileSync(path.join(__dirname, '../src/u2-dock.js'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"')); ok(JSON.stringify(dockF) === JSON.stringify(C.floats || []), '계약 floats = u2-dock.js D.FLOATS(같은 목록)', JSON.stringify(dockF));
  const fake4 = T.extract(latest.replace('const FEAT = [', "const FEAT = [\n  { t: '🧪 시험용 새 기능', w: '', k: '', go: { fn: () => 0 } },"), C); ok(fake4.feat.length === base.feat.length + 1 && fake4.feat.includes('🧪 시험용 새 기능'), '새 기능 찾기 항목을 찾음');
  const r2 = T.run({ repo: REPO, since: 7, max: 400, out, quiet: true }); ok(r2.added === 0 && r2.J.rows.length === r.J.rows.length, '이어서 돌리면 새 줄 0(이미 본 커밋은 건너뜀)');
  const st = r.J.rows.reduce((o, x) => ((o[x.state] = (o[x.state] || 0) + 1), o), {}); ok(!st['❌'], '이번 7일 표: 계약 ❌ 0', JSON.stringify(st));
  const md = fs.readFileSync(path.join(out, 'TRACK.md'), 'utf8'); ok(/\| 판 \| 날짜 \|/.test(md) && md.split('\n').filter((l) => /^\| 1\./.test(l)).length === r.J.rows.length, 'TRACK.md(사람이 읽는 표)도 같은 줄 수');
  const after = cp.execFileSync('git', ['-C', REPO, 'status', '--porcelain'], { encoding: 'utf8' }); const head1 = cp.execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  ok(after === before && head0 === head1, '지금 웹앱 저장소는 그대로(읽기만)');
  let sc = ''; try { sc = cp.execFileSync('bash', [path.join(__dirname, '../tools/ship-check2.sh')], { encoding: 'utf8' }); } catch (e) { sc = (e.stdout || '') + ' 실패'; } ok(/모두 통과/.test(sc), '올리기 전 검사(ship-check2: 문법·JSON·판 번호·팝업·개인 정보·따라잡기 ❌)', sc.trim().split('\n').pop());
  /* 새 웹앱 화면 */
  if (process.env.NODE_PATH || (() => { try { require.resolve('playwright'); return true; } catch (e) { return false; } })()) {
    const { open } = require('./lib'); const t = await open({ q: '?p=home', settle: 1500 }); const p = t.p;
    await p.evaluate(() => U2.trackScreen()); await p.waitForSelector('.u2-track', { timeout: 5000 }).catch(() => {});
    const rows = await p.evaluate(() => document.querySelectorAll('.u2-track tbody tr').length);
    ok(rows > 0, "새 웹앱 '🔁 따라잡기' 화면이 표를 보임", rows + '줄(최근 80줄까지)'); await t.close();
  }
  fs.rmSync(out, { recursive: true, force: true });
  console.log(`\nt_track: 통과 ${P} · 실패 ${F}`); process.exitCode = F ? 1 : 0;
})();
