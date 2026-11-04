# 리드나우 2 (꾸밈 웹앱 · 시범)

지금 웹앱(`readnow-scripts/app/`)을 **한 글자도 바꾸지 않고** 그대로 불러온 뒤, 그 위에 격자·편집기·위젯을 얹은 새 화면입니다.
설계안: readnow-chats `reports/2026-11-04_custom_app_plan.md` (단계 0~13).

## 지금 자리
- 별도 저장소 `jerrycson/readnow-ui2`(정범님 Q1 B)를 만들 권한이 이 작업 환경에 없어, 우선 `readnow-scripts`의 **이 `ui2/` 폴더 하나에만** 만듭니다.
- 이 폴더 안 경로는 모두 **상대 경로**입니다. 저장소를 만들면 이 폴더를 통째로 옮기면 됩니다(바꿀 것은 없음).
- 지금 웹앱을 불러올 곳은 [`u2-config.js`](u2-config.js)의 한 줄 `U2_BASE` 뿐입니다.

## 정범님이 고른 답(설계안 0장)
| 물음 | 답 | 이 폴더에서 |
|---|---|---|
| Q1 시범 주소 | B 별도 저장소 | 지금은 `ui2/` 폴더로 대신 |
| Q2 기능 다시 쓰기 | ③ 섞기 | 틀·기본 위젯은 새로, 기능은 지금 웹앱 함수 그대로(어댑터) |
| Q3 실제 자료 쓰기 | ① 읽기만 → ② 위젯마다 정범님이 직접 켬 | `src/u2-guard.js` 쓰기 막이 · ☰ → 🔒 쓰기 허락(기본 모두 꺼짐) |
| Q4 배치 저장 | ① 공용 + 기기마다 개인 | 한 편집기 위 '🌐 모든 기기 공용 / 📱 이 기기만' 단추 |
| Q5 누가 편집 | ① 공용은 관리자 기기만 | 지금 웹앱 `isAdminDevice()` 그대로 |
| Q6 휴대폰 배치 | ① PC 배치에서 저절로 + 따로 고침 | `U2Grid.flow` · 폭마다 '따로 고친 배치' |
| Q7 격자 | 가로 24칸(반 칸 맞춤 = 48 위치) · 세로 끝없이(칸 높이 16px) · 좁으면 12/6/4칸 | `src/u2-grid.js` |
| Q8 기본 모습 | ① 지금 웹앱과 똑같이 + ② 견본 | 편집기 '견본 배치 불러오기' |
| Q11 옛 화면 | 지우지 않고 계속 둠 | 지금 웹앱 주소는 그대로 |
| Q12 Firebase 규칙 | 0단계 시험 쓰기로 확인 | 이 환경에선 실제 Firebase 쓰기 금지 — 시험은 가짜 Firestore. 실제 확인은 정범님 허락 뒤 |

## 파일
| 파일 | 하는 일 |
|---|---|
| `index.html` | 틀(얇음) — 지금 웹앱 본문이 그리는 `#app`·`#toast` 자리 포함 |
| `u2-config.js` | `U2_VER`(새 웹앱 판) · `U2_BASE`(지금 웹앱 주소) |
| `sw.js` | 새 웹앱 저장본 `rn2-ui-v*` — `rn2-` 밖 저장본은 절대 안 지움 |
| `src/u2-core.js` | 작은 도구 · 화면 안 알림/확인/두 번 누르기 · 저장소(ui2_* 칸 · 기기 rn2-) |
| `src/u2-guard.js` | 쓰기 막이 · 충돌 감시기(타이머·새 기기 열쇠·긴 멈춤·중복 id) |
| `src/u2-loader.js` | 지금 웹앱 틀 읽기 → CSS(@layer legacy) → 스크립트 차례대로 → 잇기 · 안전 모드 · 새 판 확인 · 옛 기능 어댑터 첫 묶음 |
| `src/u2-grid.js` | 격자 계산(밀어내기·위로 붙이기·비율 바꿈·휴대폰 흘리기)과 그리기 |
| `src/u2-editor.js` | 편집기(서랍·속성판·층 나무·끌기·손잡이 8·키보드·Ctrl+Z 100걸음·초안·게시·게시 기록·편집 잠금) |
| `src/u2-expr.js` | 계산식(eval 없음 · 한국어 함수 합·평균·원·퍼센트·만약 …) |
| `src/u2-data.js` | 자료 연결 — 지금 웹앱 상태 한국어 별칭(읽기만) · 변수 · =식/{{식}} · 보이기 조건 · 저장한 보기 · Firestore 질의 예산 |
| `src/u2-actions.js` | 행동 16가지 · 차례 실행 · 두 번 누르기 · 단축키(옛 단축키와 겹침 막음) |
| `src/u2-catalog.js` | 위젯 목록을 지금 웹앱에서 실행 중에 뽑음(탭·섹션·홈 칸·화면·기능 찾기) · 분류 12 · ≈MB · 🆕 · 메모리 예산 |
| `src/u2-adapters.js` | 섹션 위젯(T2 — 같은 탭은 한 번 그려 나눠 줌) · 계약 검사 |
| `u2-contract.json` | 새 웹앱이 기대는 옛 함수·값·화면 id(계약 목록) |
| `src/u2-widgets.js` | 기본 UI 위젯 53종 + 리드나우 기능 위젯 5종 |
| `src/u2-theme.js` | 색 토큰·밝음/어두움/높은 대비·모양·무늬 6·글꼴·아이콘 |
| `src/u2-shell.js` | 머리줄·페이지·주소 길·메뉴·쓰기 허락·견본·내보내기/가져오기 |
| `src/u2.css` | 모양(모두 `.u2-` 머리) |
| `TRACK.md` · `TRACK.json` | 지금 웹앱 따라잡기 표 — `node tools/track.js --repo ../readnow-scripts`(읽기만) · 손으로 반영 표시 `--mark <커밋> ✅ "메모"` |
| `tools/track.js` | 따라잡기 자동 검사(판마다 새 탭·섹션·화면·기능·홈 칸 · 계약 · CHANGELOG·날짜) |
| `tools/ship-check2.sh` | 올리기 전 검사(문법·JSON·판 번호·팝업·개인 정보·따라잡기 ❌) · `install`로 push 전에 저절로 |
| `.github/workflows/ui2-track.yml` | 30분마다 따라잡기 표 → 이 저장소 `track` 가지 · 계약이 깨지면 이슈 |
| `tests/` | Playwright 시험 |

## Firebase 칸(새 웹앱만 씀)
`ui2_site/main`(전체 설정·메뉴·쓰기 허락) · `ui2_pages/<페이지>`(공용 배치) · `ui2_versions/<페이지>_<판>`(게시 기록) · `ui2_prefs/<기기>`(개인 배치) · `ui2_locks/<페이지>`(편집 잠금) · `ui2_blocked/<기기>_<날짜>`(막은 쓰기 — 칸 이름만) · `ui2_perf/<기기>_<날짜>`(충돌 감시 요약)

## 시험 돌리기
```
cd <저장소>  &&  python3 -m http.server 8810        # 따로 켜 둠
NODE_PATH=<playwright가 있는 node_modules> node tests/t_grid_unit.js
NODE_PATH=... node tests/t_load.js      # 단계 1
NODE_PATH=... node tests/t_editor.js    # 단계 2·3
NODE_PATH=... node tests/t_widgets.js   # 단계 4
NODE_PATH=... node tests/t_perm.js      # 쓰기 허락(Q3)
NODE_PATH=... node tests/t_mem.js       # 메모리 예산(설계안 8-1)
node tests/t_expr_unit.js                 # 단계 5 계산식 200
NODE_PATH=... node tests/t_actions.js    # 단계 5 행동·자료
NODE_PATH=... node tests/t_adapters.js   # 단계 6 어댑터·자동 목록
NODE_PATH=... node tests/t_track.js      # 단계 7 따라잡기(RN_REPO=지금 웹앱 저장소)
NODE_PATH=... node tests/t_default.js    # 단계 8 기본 배치(지금 웹앱과 같은가)·견본·📥 할 일
```
- 인터넷의 지금 웹앱은 받지 않습니다 — `U2_BASE`로 가는 요청을 기기 안 배포본 사본(`U2_TEST_OUT`, 기본 `/home/user/w/out`)에서 돌려줍니다.
- Firebase는 가짜(`tests/fbstub2.js`)입니다.

## 지킬 것
한국어 화면 글 · 브라우저 팝업 금지(화면 안 확인·두 번 누르기) · 손님 개인 정보 금지(견본은 '손님A') · 외부 라이브러리 없음(격자·차트 직접) · 기기 저장 열쇠 `rn2-` · Firestore 쓰기 `ui2_*`만
