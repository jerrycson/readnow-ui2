#!/usr/bin/env node
/* weigh2.js — 🪶 리드나우 2 무게 재기 (11/12 perf9 · 정범님 '리드나우 2·우리숍을 지속적으로 최적화하는 엔진')
 *  판마다(ship-check2 ⑦이 push 때 저절로): 프로그램 파일(src/*.js·css + index.html + u2-config.js) KB · 파일 수 · 가장 큰 파일 · 되풀이 타이머(setInterval) 수 · 실시간 듣기(onSnapshot) 수를 재
 *  tools/weigh2.json의 앞 판(기준선)과 견줌 — 프로그램 +5% 또는 타이머·듣기 +3개면 ⚠ + 까닭 후보(기준선 커밋 뒤 src/를 고친 커밋 · 더한 줄 많은 순)
 *  쓰임: node tools/weigh2.js [--save]   · 지금 웹앱 쪽 같은 도구: readnow-scripts src/tools/weigh.js(웹앱 ⚙ 설정 › 🪶 웹앱 무게)
 *  메모리·첫 화면은 tests/t_mem.js(설계안 8-1 기준값)가 잼 — 판을 낼 때 함께 돌림 */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const R = path.join(__dirname, '..'); const OUT = path.join(__dirname, 'weigh2.json'); const save = process.argv.includes('--save');
const kb = (f) => { try { return Math.round(fs.statSync(f).size / 1024); } catch (e) { return 0; } };
const git = (c) => { try { return cp.execSync(`git -C "${R}" ${c}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } };
const F = fs.readdirSync(path.join(R, 'src')).filter((f) => /\.(js|css)$/.test(f)); let t = kb(path.join(R, 'index.html')) + kb(path.join(R, 'u2-config.js')), big = ['', 0], iv = 0, snap = 0;
for (const f of F) { const p = path.join(R, 'src', f); const k = kb(p); t += k; if (k > big[1]) big = [f, k]; const s = fs.readFileSync(p, 'utf8'); iv += (s.match(/setInterval\(/g) || []).length; snap += (s.match(/\.onSnapshot\(/g) || []).length; }
const ver = (fs.readFileSync(path.join(R, 'u2-config.js'), 'utf8').match(/U2_VER = '([\d.]+)'/) || [])[1] || null;
const now = { ver, at: new Date().toISOString(), commit: git('rev-parse --short HEAD') || null, kb: t, files: F.length, big, iv, snap };
let H = { v: [] }; try { H = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {} if (!Array.isArray(H.v)) H.v = [];
const base = [...H.v].reverse().find((x) => x.ver !== ver) || null; const W = [];
if (base) { if (now.kb > base.kb * 1.05) W.push(`프로그램 ${base.kb}→${now.kb}KB (+${Math.round(((now.kb - base.kb) / base.kb) * 1000) / 10}%)`); if (now.iv - base.iv >= 3) W.push(`되풀이 타이머 ${base.iv}→${now.iv}`); if (now.snap - base.snap >= 3) W.push(`실시간 듣기 ${base.snap}→${now.snap}`); }
console.log(`${W.length ? '⚠' : '✓'} 🪶 리드나우 2 ${ver} 무게: 프로그램 ${now.kb}KB(${now.files}개 · 가장 큰 ${big[0]} ${big[1]}KB) · 타이머 ${iv} · 듣기 ${snap}${base ? ` — 기준 ${base.ver} ${base.kb}KB` : ' — 첫 기준선'}${W.length ? ' · 나빠짐: ' + W.join(' · ') : ''}`);
if (W.length && base && base.commit) { const L = git(`log --format=%h\\ %s --shortstat ${base.commit}..HEAD -- src`).split('\n').filter(Boolean); if (L.length) console.log('   까닭 후보(기준선 뒤 src/ 커밋): ' + L.slice(0, 6).join(' | ').slice(0, 400)); }
if (save || !H.v.some((x) => x.ver === ver)) { H.v = H.v.filter((x) => x.ver !== ver).concat([now]).slice(-60); H.note = '🪶 리드나우 2 판마다 무게(tools/weigh2.js · ship-check2 ⑦이 새 판마다 저절로 더함)'; fs.writeFileSync(OUT, JSON.stringify(H, null, 1) + '\n'); }
