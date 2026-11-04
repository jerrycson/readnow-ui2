# 🔁 따라잡기 표 (지금 웹앱 판 → 새 웹앱 반영)

7단계 `tools/track.js`가 저절로 채웁니다. 지금은 틀만 있습니다.
읽는 법: ⬜ 할 일 · ⏳ 하는 중 · ✅ 반영 · ➖ 반영할 것 없음 · ❌ 계약(새 웹앱이 기대는 옛 함수) 깨짐

| 지금 웹앱 판 | 날짜 | 바뀐 것 | 새 목록 항목 | 계약 | 새 웹앱 반영 | 근거 |
|---|---|---|---|---|---|---|
| 1.78.369 | 2026-11-04 | (시작 판 — 새 웹앱 0.1.0이 처음 맞춘 판) | — | ✅ shell · renderMain · featGo · PG_SCR · FEAT · WIDGETS | ✅ 0.1.0 | u2a 세션 |

## 계약 목록(새 웹앱이 부르는 옛 함수·값)
`shell()` · `renderMain()` · `S.tab` · `S.limit` · `featGo(f)` · `FEAT[]` · `PG_SCR[]`(4번째 칸 = 여는 함수 이름) · `WIDGETS{}` · `W_DESC{}` · `isAdminDevice()` · `deviceName()` · 화면 뼈대 id `#app #main #sheet #modal #toast` · `header.top` · `APP_VER`
