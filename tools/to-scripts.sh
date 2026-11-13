#!/usr/bin/env bash
# 🧩 리드나우 2 결과물을 readnow-scripts 저장소 ui2/ 에 사본으로 넣기 (0.4.14 priv1 11/13 · 저장소 비공개 준비)
#  까닭: 저장소를 비공개로 바꾸면 GitHub Pages(…github.io/readnow-ui2/)가 꺼짐 → readnow.kr/ui2/(Firebase Hosting)에서 엶.
#        Hosting은 readnow-scripts의 '결과물 함께 내기' 작업이 올리므로, 그 저장소 ui2/ 폴더에 이 저장소 결과물을 그대로 둠(바뀐 파일만 올라감).
#  쓰임: 리드나우 2 판을 낸 뒤 bash tools/to-scripts.sh <readnow-scripts 경로>  → 그 저장소에서 ui2/만 커밋해 main에 올림(판 번호 안 올림 · 순서표 안에서)
#  담는 것: 첫 화면(index.html·u2-config.js·sw.js)·src/·m/·PLAN.json·TRACK.json·u2-contract.json — 설명 글(.md)·시험·도구는 안 담음
set -euo pipefail
S=$(cd "$(dirname "$0")/.." && pwd); R=${1:?readnow-scripts 경로}
[ -f "$R/readnow-collector.user.js" ] || { echo "readnow-scripts 저장소 뿌리가 아님: $R"; exit 1; }
O="$R/ui2"; rm -rf "$O"; mkdir -p "$O"
for f in index.html u2-config.js sw.js PLAN.json TRACK.json u2-contract.json; do [ -f "$S/$f" ] && cp "$S/$f" "$O/$f"; done
cp -r "$S/src" "$S/m" "$O/"
V=$(grep -oP "U2_VER = '\K[0-9.]+" "$S/u2-config.js"); C=$(git -C "$S" rev-parse --short HEAD 2>/dev/null || echo '?')
printf '{"ver":"%s","commit":"%s"}\n' "$V" "$C" > "$O/ui2-stamp.json"
echo "✓ 리드나우 2 $V ($C) → $O ($(find "$O" -type f | wc -l)개 · $(du -sh "$O" | cut -f1))"
