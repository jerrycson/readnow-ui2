# 리드나우 2 (ui2) — 이 폴더(나중엔 저장소 readnow-ui2)를 고치는 Claude 세션

- 규칙은 readnow-scripts `CLAUDE.md` 그대로(🇰🇷 한국어만 · 개인 정보 금지 · 비밀값 금지 · 수집기 머리 안 바꿈). 이름표 **ui2**.
- 지금 웹앱 파일(`src/`·`app/`·`cloud/`·`readnow-*.js`·`manual/`)은 고치지 않습니다 — 새 웹앱은 `U2_BASE`에서 '그대로 불러오기'만.
- Firestore 쓰기는 `ui2_*` 칸만 · 기기 저장 열쇠는 `rn2-` · 브라우저 팝업 금지(U2.ask · U2.toast · U2.twice).
- 판 번호는 `u2-config.js`의 `U2_VER`(지금 웹앱 `APP_VER`과 따로).
- 고친 뒤 `tests/` 시험을 모두 돌립니다(README '시험 돌리기').
