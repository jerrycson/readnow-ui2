#!/usr/bin/env bash
# 리드나우 2 — 올리기 전 검사 (설계안 3-4 · 지금 웹앱 ship-check.sh ⑥을 본뜸)
# ① 문법(node --check) ② JSON ③ 판 번호 모양(U2_VER) ④ 브라우저 팝업 금지(alert·confirm·prompt·window.open) ⑤ 개인 정보(손님 이름 낱말 목록·휴대전화 번호) ⑥ 따라잡기 표 ❌
# 쓰는 법: bash tools/ship-check2.sh            · 낱말 목록: PII_WORDS=<경로>(기본 ../readnow-chats/secure/pii-words.txt — 없으면 번호만)
#          bash tools/ship-check2.sh install    · git push 전에 저절로(.git/hooks/pre-push)
set -u; cd "$(dirname "$0")/.."
if [ "${1:-}" = install ]; then printf '#!/usr/bin/env bash\nexec bash "$(git rev-parse --show-toplevel)/tools/ship-check2.sh"\n' > .git/hooks/pre-push && chmod +x .git/hooks/pre-push && echo "설치함: git push 전에 검사"; exit 0; fi
bad=0; say() { echo "$1"; }; fail() { echo "❌ $1"; bad=1; }
for f in u2-config.js sw.js src/*.js tools/*.js tests/*.js; do node --check "$f" 2>/dev/null || fail "문법 오류: $f"; done; say "① 문법 검사 끝"
for f in u2-contract.json TRACK.json PLAN.json m/*.webmanifest; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null || fail "JSON 오류: $f"; done; say "② JSON 검사 끝"
grep -qE "U2_VER = '[0-9]+\.[0-9]+\.[0-9]+'" u2-config.js || fail "U2_VER 모양이 틀림"; say "③ 판 번호 $(grep -oE "U2_VER = '[^']+'" u2-config.js)"
pop=$(node -e "const fs=require('fs');const out=[];for(const f of fs.readdirSync('src').filter(x=>x.endsWith('.js'))){const t=fs.readFileSync('src/'+f,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');for(const m of t.matchAll(/(?<![.\w])(alert|confirm|prompt)\s*\(|window\.open\s*\(/g))out.push(f+': '+m[0])}console.log(out.join('\n'))")
[ -n "$pop" ] && fail "브라우저 팝업을 부름:\n$pop"; say "④ 팝업 검사 끝"
W="${PII_WORDS:-../readnow-chats/secure/pii-words.txt}"; files=$(git ls-files | grep -vE '\.(png|jpg|svg|webmanifest)$')
if [ -f "$W" ]; then hit=$(grep -v '^\s*#' "$W" | sed '/^\s*$/d' | grep -nFf - $files 2>/dev/null | head -5); [ -n "$hit" ] && fail "손님 이름 낱말이 들어 있음(내용은 안 보임): $(echo "$hit" | cut -d: -f1 | sort -u | tr '\n' ' ')"; else say "  (낱말 목록 $W 없음 — 번호만 검사)"; fi
ph=$(grep -nE '01[016789][- ]?[0-9]{3,4}[- ]?[0-9]{4}' $files 2>/dev/null | grep -v '010-0000-0000' | cut -d: -f1,2 | head -5); [ -n "$ph" ] && fail "휴대전화 번호 꼴이 있음: $ph"; say "⑤ 개인 정보 검사 끝"
nb=$(node -e "try{const J=require('./TRACK.json');console.log((J.rows||[]).filter(r=>r.state==='❌').length)}catch(e){console.log(0)}"); [ "$nb" != 0 ] && echo "⚠ 따라잡기 표에 ❌ $nb줄 — 어댑터를 고쳐야 함(이전 2주 전부터는 막음)"; say "⑥ 따라잡기 표 ❌ $nb"
[ $bad = 0 ] && echo "✓ 리드나우 2 올리기 전 검사 모두 통과" || echo "검사 실패 — 고친 뒤 다시"; exit $bad
