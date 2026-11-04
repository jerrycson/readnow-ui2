/* 단계 5 완료 조건 — 계산식 시험 200개(돈 단위·0으로 나누기 포함) · eval/new Function 0 (node로: node tests/t_expr_unit.js) */
const fs = require('fs'), path = require('path');
const E = require('../src/u2-expr.js');
const P = { n: 0, f: 0, bad: [] };
const ok = (c, m, x) => { if (c) { P.n++; } else { P.f++; P.bad.push(m + (x != null ? ' — ' + x : '')); } };
const ctx = { get: (n) => ({ a: 3, b: 0, c: 2.5, 매출: 1234567, 원가: 800000, 주문수: 12, 이름: '손님A', 켜짐: true, 목록: [1, 2, 3, 4] }[n]) };
const cases = [
  ['1+2×3', 7], ['(1+2)*3', 9], ['10÷4', 2.5], ['10/b', null], ['10%3', 1], ['5%b', null], ['-a+1', -2], ['--a', 3], ['a*c', 7.5],
  ['a>2', true], ['a<2', false], ['a>=3', true], ['a<=2', false], ['a=3', true], ['a==3', true], ['a!=3', false],
  ['a>2 그리고 a<5', true], ['a>2 && a>5', false], ['a>5 또는 a=3', true], ['a>5 || 거짓', false], ['아님 켜짐', false], ['!거짓', true],
  ['원(매출)', '₩1,234,567'], ['원(-1500)', '-₩1,500'], ['원(0.4)', '₩0'], ['원(b/b)', null], ['원(매출-원가)', '₩434,567'],
  ['퍼센트(1,3)', 33.3], ['퍼센트(원가,매출)', 64.8], ['퍼센트(1,b)', null], ['퍼센트(주문수,0)', null],
  ['반올림(3.14159,2)', 3.14], ['반올림(2.5)', 3], ['반올림(1234.5678,1)', 1234.6], ['반올림(b/b,1)', null],
  ['합(1,2,3)', 6], ['합(목록)', 10], ['평균(목록)', 2.5], ['개수(목록)', 4], ['최대(목록)', 4], ['최소(1,a,c)', 1], ['평균()', null], ['최대()', null],
  ['만약(a>2,"많음","적음")', '많음'], ['만약(a>5,"많음","적음")', '적음'], ['만약(거짓, 1/b, 2)', 2], ['만약(참, 1)', 1],
  ['날짜차("2026-11-01","2026-11-04")', 3], ['날짜차("2026-11-04","2026-11-01")', -3], ['날짜차("아님","2026-11-01")', null],
  ['"가"+"나"', '가나'], ['이름+"님"', '손님A님'], ['"1"+2', 3], ['글(a)+"권"', '3권'], ['숫자("1,234원")', 1234], ['길이(이름)', 3], ['길이(목록)', 4],
  ['"가"=이름', false], ['이름="손님A"', true], ['b/b>1', false], ['1+b/b', null],
];
for (const [s, want] of cases) { const r = E.eval(s, ctx); ok(!r.err && JSON.stringify(r.v) === JSON.stringify(want), s, JSON.stringify(r) + ' 기대 ' + JSON.stringify(want)); }
const errs = ['1+', '(1+2', '모름+1', '없는함수(1)', '1 2', '"닫히지 않음', '#', '만약(1)', 'a.', ')'];
for (const s of errs) { const r = E.eval(s, ctx); ok(!!r.err && r.v === null, '틀린 식은 오류 글: ' + s, JSON.stringify(r)); }
ok(!!E.eval('1+'.repeat(300) + '1').err, '너무 긴 식은 멈춤');
ok(!!E.eval('('.repeat(60) + '1' + ')'.repeat(60)).err, '너무 깊은 식은 멈춤');
/* 무작위 산수 — JS로 셈한 것과 같음(0으로 나누면 결과 없음) */
let seed = 11; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
let gen = 0;
while (gen < 200 - cases.length - errs.length - 2) {
  const x = rnd(1000) - 500, y = rnd(20) - 5, z = rnd(50) + 1; const ops = ['+', '-', '*', '/']; const o1 = ops[rnd(4)], o2 = ops[rnd(4)];
  const src = `${x} ${o1} (${y} ${o2} ${z})`; const inner = o2 === '/' ? (z === 0 ? null : y / z) : o2 === '+' ? y + z : o2 === '-' ? y - z : y * z;
  let want = inner === null ? null : o1 === '/' ? (inner === 0 ? null : x / inner) : o1 === '+' ? x + inner : o1 === '-' ? x - inner : x * inner;
  const r = E.eval(src); const same = want === null ? r.v === null : Math.abs(r.v - want) < 1e-9; ok(!r.err && same, src, JSON.stringify(r.v) + ' 기대 ' + want); gen++;
}
/* {{식}} 채우기 · 보이기 */
ok(E.fill('오늘 {{주문수}}건 · {{원(매출)}}', ctx) === '오늘 12건 · ₩1,234,567', '{{식}} 채우기');
ok(E.show(null) === '—' && E.show(1234.567) === '1,234.57' && E.show(true) === '참', '값 보이기(없음 = —)');
/* eval·new Function 안 씀 */
const src = fs.readdirSync(path.join(__dirname, '../src')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')).join('\n');
ok(!/(^|[^.\w])eval\s*\((?![^)]*\)\s*\{)/m.test(src) && !/new Function/.test(src), 'src/*.js 안에 eval()·new Function 없음(계산식은 직접 읽음 · .eval 이름의 메서드만 있음)');
console.log('[단계 5] 계산식');
console.log(`  계산식 시험 ${P.n + P.f}개 — 통과 ${P.n} · 실패 ${P.f}`); P.bad.slice(0, 10).forEach((b) => console.log('  ✗ ' + b));
console.log(`\nt_expr_unit: 통과 ${P.n} · 실패 ${P.f}`); process.exitCode = P.f ? 1 : 0;
