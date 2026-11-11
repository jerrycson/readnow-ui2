# 리드나우 2 (꾸밈 웹앱 · 시범)

지금 웹앱(`readnow-scripts/app/`)을 **한 글자도 바꾸지 않고** 그대로 불러온 뒤, 그 위에 격자·편집기·위젯을 얹은 새 화면입니다.
설계안: readnow-chats `reports/2026-11-04_custom_app_plan.md` (단계 0~13).

## 지금 자리
- 별도 저장소 `jerrycson/readnow-ui2` · 시범 주소 **https://jerrycson.github.io/readnow-ui2/** (11/05부터 · 처음엔 `readnow-scripts/ui2/` 폴더에서 만들어 통째로 옮김).
- 이 저장소 안 경로는 모두 **상대 경로**입니다. 지금 웹앱을 불러올 곳은 [`u2-config.js`](u2-config.js)의 한 줄 `U2_BASE` 뿐입니다.
- **단계 12 시범 운행 — 정범님 체크리스트는 화면 안에서: https://jerrycson.github.io/readnow-ui2/?check=1** (맨 위 띠 '✅ 체크리스트 열기' · ☰ 메뉴 '✅ 시범 체크리스트') · 같은 표·정할 것: [`STEP12.md`](STEP12.md) · 단계 13 이전 준비: [`MOVE.md`](MOVE.md)

## 정범님이 고른 답(설계안 0장)
| 물음 | 답 | 이 폴더에서 |
|---|---|---|
| Q1 시범 주소 | B 별도 저장소 | 지금은 `ui2/` 폴더로 대신 |
| Q2 기능 다시 쓰기 | ③ 섞기 | 틀·기본 위젯은 새로, 기능은 지금 웹앱 함수 그대로(어댑터) |
| Q3 실제 자료 쓰기 | ① 읽기만 → ② 위젯마다 정범님이 직접 켬 | `src/u2-guard.js` 쓰기 막이 · ☰ → 🔒 쓰기 허락(기본 모두 꺼짐 · 0.4.6부터 위젯마다 쓸 칸(컬렉션)까지 고름) |
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
| `src/u2-editor.js` | (첫 화면 뒤 쉬는 때 받음 · ✏ 꾸미기를 먼저 누르면 그때)  편집기(서랍·속성판·층 나무·끌기·손잡이 8·키보드·Ctrl+Z 100걸음·초안·게시·게시 기록·편집 잠금) |
| `src/u2-expr.js` | 계산식(eval 없음 · 한국어 함수 합·평균·원·퍼센트·만약 …) |
| `src/u2-data.js` | 자료 연결 — 지금 웹앱 상태 한국어 별칭(읽기만) · 변수 · =식/{{식}} · 보이기 조건 · 저장한 보기 · Firestore 질의 예산 |
| `src/u2-actions.js` | 행동 16가지 · 차례 실행 · 두 번 누르기 · 단축키(옛 단축키와 겹침 막음) |
| `src/u2-dock.js` | 옛 화면(등록·출고 등 #sheet)과 새 웹앱 페이지 함께 쓰기 — 오른쪽 나란히 창(폭 끌기·기억)·전체(휴대폰은 페이지를 바꾸면 접힘)·🪟 옛 화면 자리 위젯(페이지로 박기) · 설정 '페이지 바꿀 때 두기(기본)/닫기' · 한 번에 하나(지금 웹앱 한계) |
| `src/u2-catalog.js` | 위젯 목록을 지금 웹앱에서 실행 중에 뽑음(탭·섹션·홈 칸·화면·기능 찾기) · 분류 12 · ≈MB · 🆕 · 메모리 예산 |
| `src/u2-adapters.js` | 섹션 위젯(T2 — 같은 탭은 한 번 그려 나눠 줌) · 🧱 칸 위젯(탭 첫 화면 칸 하나 — 지금 웹앱 tobBlocks로 떼어 냄 · 11/10) · 계약 검사 |
| `u2-contract.json` | 새 웹앱이 기대는 옛 함수·값·화면 id(계약 목록) |
| `src/u2-widgets.js` | 기본 UI 위젯 58종(계산 카드·질의·저장한 보기·📥 할 일·🔎 스캔 검수 포함 · 0.4.9 🚦 처리할 주문 숫자 줄 · 0.4.10 📋 목록 보기 탭 — 지금 웹앱 큰 목록 탭 + ⭐ 저장한 거르기 rn2-listViews) + 리드나우 기능 위젯 6종(탭·섹션·머리줄·홈 칸·화면·기능) |
| `src/u2-widgets-extra.js` | 덜 쓰는 무거운 위젯 10종(카드 목록·보드·달력·타임라인·차트·바깥 페이지·변수 바·반복·질의·스캔 검수) — 첫 화면 뒤 쉬는 때·처음 놓일 때 받음 |
| `src/u2-theme.js` | 색 토큰·밝음/어두움/높은 대비·모양·무늬 6·글꼴·아이콘 |
| `src/u2-check.js` | ✅ 단계 12 시범 체크리스트(STEP12.md 표와 같은 줄 · 줄마다 그 자리로 가는 단추 · 통과/안 됨/메모 → 기기 rn2-check12 + ui2_checks/<기기>) · 맨 위 시범 띠 '🔒 리드나우 2 시범 중 — 읽기만 · ✅ 체크리스트 열기' · 주소 ?check=1 |
| `src/u2-move.js` | 🚚 단계 13 이전 장치(정범님 ㉮) — 이전 전 점검표(✗면 시작 못 함) · 이전 시작/한 번에 되돌리기(두 번 누르기) · 옛 화면 `<지금 웹앱>?old=1` 30일 · `ui2_site/main.move` + 기기 저장 `rn2-move` · 되돌린 뒤 넘어오면 한 번만 돌려보냄 |
| `tools/move-snippet.js` | 지금 웹앱 쪽에 넣을 짧은 글 견본(리드가 `src/app.html` `<head>` 맨 앞에) — `rn2-move`가 on이면 새 웹앱으로 · `?old=1`은 옛 화면 · 로그인 뒤 `RN2_MOVE_SYNC` |
| `src/u2-blocks.js` | 🧩 바깥 블록 받는 자리(0.4.9 · 약속 53) — 우리숍(`shop/`) 화면 조각을 파일 그대로 받아 격자 위젯으로(`U2.blocks.add`) · 설정 틀(SCHEMA)이 속성판에 그대로(묶음 머리·여럿 고르기) · CSS는 `@scope`로 블록 칸 안에만 · 기기 저장 `rn2-blk-` · 첫 블록 📚 서가 책장(`BQShelf.mount` · 우리숍 파일 주소 `U2_SHOP_BASE`, 없으면 지금 웹앱 옆 `shop/`) · ☰ 견본 '🛍 우리숍 책장 견본' |
| `src/u2-find.js` | (0.4.11 ⚙ 설정 범위를 빈 칸으로 열면 갈래 목차 — 지금 웹앱 ⑧ 설정 묶음 + 🧩 리드나우 2) ⚡ 머리줄 빠른 작업 · 🔎 어디서나 찾기 Ctrl+K(페이지·기능·⚙ 설정·화면·위젯·자료 · 📌 고정 · ⚡ 명령) · 📷 스캔이 첫 동작(0.4.10 — 입력 칸 밖에서 바코드를 찍으면 찾기가 그 ISBN으로 · 맨 위 📥 등록에 넣기 · 등록 화면이 열려 있으면 지금 웹앱 그대로) |
| `src/u2-shell.js` | 머리줄·페이지·주소 길·메뉴·쓰기 허락·견본·내보내기/가져오기 |
| `src/u2.css` | 모양(모두 `.u2-` 머리) |
| `PLAN.json` | 🗓 전체 일정(설계안 단계 0~13 · 예상·실제 시간·상태 끝/진행 중/정범님 필요) — 손으로 고침 → `node tools/track.js --plan`이 TRACK.json `plan`·TRACK.md 맨 위 '전체 일정 요약'으로 · 새 웹앱 ☰ 메뉴·🧪 프로젝트 페이지 '🗓 새 웹앱 일정'에서 막대로 |
| `STEP12.md` | 12단계 시범 운행 — 정범님이 정할 것(맨 위) · 체크리스트(어느 주소·무엇을 눌러·무엇이 보이면 통과) |
| `MOVE.md` | 13단계 이전 — 장치(0.4.6)·이전 전 점검·지금 웹앱 쪽에 필요한 변경(리드)·정범님이 정할 것·이전 날 차례·되돌리기 — 실제 이전은 정범님이 누름 |
| `TRACK.md` · `TRACK.json` | 지금 웹앱 따라잡기 표 — `node tools/track.js --repo ../readnow-scripts`(읽기만) · 손으로 반영 표시 `--mark <커밋> ✅ "메모"` |
| `tools/track.js` | 따라잡기 자동 검사(판마다 새 탭·섹션·화면·기능·홈 칸 · 계약 · CHANGELOG·날짜) |
| `tools/ship-check2.sh` | 올리기 전 검사(문법·JSON·판 번호·팝업·개인 정보·따라잡기 ❌) · `install`로 push 전에 저절로 |
| `.github/workflows/ui2-track.yml` | 30분마다 따라잡기 표 → 이 저장소 `track` 가지 · 계약이 깨지면 이슈 |
| `tests/` | Playwright 시험 |

## 조화 시험(설계안 8-2) — 어느 시험이 맡나
| 번호 | 무엇 | 시험 |
|---|---|---|
| H-01 | 위젯 하나씩(기본 58 · 섹션 122 · 화면 115 · 기능 128) | t_widgets · t_adapters · t_feats |
| H-02 | 둘씩 짝(기본 모든 짝 1,596 · 기능 대표 짝 190) | t_pairs |
| H-03 | 분류마다 한 페이지 몽땅 | t_pairs |
| H-04 | 무작위 배치 200 × 폭 4단계 | t_pairs · t_grid_unit |
| H-05 | 옛 상세 층·뒤로 가기·Esc | t_load · t_adapters · t_actions |
| H-06 | 떠 있는 것 겹침(책방 친구·맨 위로·그래프 스위치·알림) | t_coexist |
| H-07 | 두 웹앱 함께(같은 주소 공간) | t_coexist |
| H-08 | 단축키가 초점에 따라 갈림 | t_coexist · t_actions |
| H-09 | CSS 새어 나감(양쪽) | t_widgets |
| H-10 | 쓰기 막이(읽기만·위젯 허락) | t_load · t_perm · t_feats |
| H-11 | 돈 숫자 같음(시험 자료 tests/seed2.js) | t_money |
| H-12 | 휴대폰 얇은 모드·4칸·길게 눌러 끌기 | t_coexist · t_editor |
| H-13 | 판 바뀜·계약 깨짐 | t_load · t_adapters · t_track |
| H-14 | 오래 쓰기(줄인 판 150초 · U2_SOAK_SEC) | t_soak |
| H-15 | 느린 망·끊김·초안 | t_soak |
| H-16 | 개인 정보 | tools/ship-check2.sh |

## Firebase 칸(새 웹앱만 씀)
`ui2_site/main`(전체 설정·메뉴·쓰기 허락) · `ui2_pages/<페이지>`(공용 배치) · `ui2_versions/<페이지>_<판>`(게시 기록) · `ui2_prefs/<기기>`(개인 배치) · `ui2_locks/<페이지>`(편집 잠금) · `ui2_blocked/<기기>_<날짜>`(막은 쓰기 — 칸 이름만) · `ui2_perf/<기기>_<날짜>`(충돌 감시 요약) · `ui2_checks/<기기>`(단계 12 체크리스트 결과 — kind 'step12' · 줄마다 통과/안 됨/메모) · `ui2_site/main.move`·`moveLog`(단계 13 이전 상태 · 0.4.6) · 기기 저장 `rn2-move`(지금 웹앱 틀이 읽음)

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
NODE_PATH=... node tests/t_new.js        # 단계 9 설치 아이콘·내보내기/가져오기·스캔 검수
NODE_PATH=... node tests/t_money.js      # H-11 돈 숫자
NODE_PATH=... node tests/t_feats.js      # 기능 단추 전부
NODE_PATH=... node tests/t_tabswap.js    # 섹션 위젯 S.tab 잠깐 바꾸기
NODE_PATH=... node tests/t_pairs.js      # H-02·03·04
NODE_PATH=... node tests/t_coexist.js    # H-06·07·08·12
NODE_PATH=... node tests/t_soak.js       # H-14·15
NODE_PATH=... node tests/t_perf.js       # 단계 11 숫자(U2_PERF_OUT·U2_PERF_BEFORE로 전/후)
NODE_PATH=... node tests/t_dual.js       # 동시에 쓰기(11/05) — 나란히 창·폭 끌기·접기·뒤로 가기·설정 두기/닫기/전체·휴대폰·🪟 옛 화면 자리 위젯 (U2_SHOT_DIR=사진 폴더)
NODE_PATH=... node tests/t_real.js       # 실화면 점검(단계 12 준비) — 모든 페이지·모든 위젯·옛 화면 전부 × PC·휴대폰(U2_SHOT_DIR=사진 폴더 → 사람이 눈으로)
NODE_PATH=... node tests/t_check.js      # ✅ 단계 12 시범 체크리스트(11/10) — 띠·메뉴·?check=1 · 통과/안 됨/메모 저장 · STEP12.md와 같은 줄 · 휴대폰
NODE_PATH=... node tests/t_parity.js     # 빠짐 대조(11/10) — 지금 웹앱 탭·첫 화면 칸(✎ 첫 화면 편집 줄)·홈 칸·화면·휴대폰 섹션·기능 찾기가 새 웹앱 서랍에 하나도 빠짐없이 · 새 칸은 저절로 🧱
NODE_PATH=... node tests/t_sync.js       # 페이지 맞춤(11/05) — 옛 등록 화면·옛 자리 되살리기 막음 · 페이지마다 다른 화면 · 옛 상세 층이 머리 아래 · 휴대폰 · 🗓 전체 일정
NODE_PATH=... node tests/t_bench.js      # 단계 9 새 기능(0.4.5 · 성공 사례 견줌 '이어서') — 🔔 알림 한 자리 · 오류 글 한국어 · ⚡ 빠른 작업 · 🔎 어디서나 찾기 Ctrl+K(0.4.8 ⚙ 설정 범위) · 받은편지함·스캔 검수를 사람처럼 · 같은 탭 한 번 그리기
NODE_PATH=... node tests/t_dev5.js       # 단계 10 기기 5가지 모양(PC 1920·1400·노트북 1280·태블릿 820·휴대폰 390) × STEP12 1·2·4·9·10번
NODE_PATH=... node tests/t_move.js       # 단계 13 이전 장치(0.4.6) — 이전 전 점검 · 시작/되돌리기 · 지금 웹앱 주소에서 넘어감(짧은 글이 든 판이면 그대로 · 없으면 견본을 끼워 흉내 · 0.4.7) · ?old=1 · 돌고 돌지 않음 · 개인 배치 되돌리기 알림
NODE_PATH=... node tests/t_blocks.js     # 🧩 우리숍 블록(0.4.9) — 📚 서가 책장: 파일 없을 때 알림 · 그려짐 · CSS 안 샘 · 속성판 = 우리숍 설정 틀 · rn2- 열쇠 · 휴대폰 (서가 파일: U2_SHELF_DIR, 기본 <U2_TEST_OUT>/shop-shelf)
NODE_PATH=... node tests/t_scanlist.js   # 성공 사례 견줌 리드나우 2 빈 곳(0.4.10) — 더블클릭 두 번째 무시·↶ 되돌리기 · 📷 스캔(ISBN) 첫 동작 → 📥 등록에 넣기 · 📋 목록 보기 탭(⭐ 저장한 거르기) · 휴대폰
NODE_PATH=... node tests/t_chips.js     # 성공 사례 견줌 리드나우 2 빈 곳 다음 차례(0.4.11) — 📋 목록 보기 탭 거르기 칩(× 풀기·＋ 거르기) · 🔎 ⚙ 설정 갈래 목차 · ☰ 메뉴 할 일 갈래·저장한 보기 한 곳 · 휴대폰
NODE_PATH=... node tests/t_nav.js        # 메뉴 틀 맞춤(0.4.6) — 지금 웹앱 탭 차례·새 탭(nav1 🛒 판매처·🔬 연구 흉내)이 메뉴에 저절로 · 저장 안 함
```
- 인터넷의 지금 웹앱은 받지 않습니다 — `U2_BASE`로 가는 요청을 기기 안 배포본 사본(`U2_TEST_OUT`, 기본 `/home/user/w/out`)에서 돌려줍니다.
- Firebase는 가짜(`tests/fbstub2.js`)입니다.

### 마지막 결과 (11/12 · 새 웹앱 0.4.11 · 지금 웹앱 1.78.489 main 배포본 — 우리숍 서가 4차(휴대폰 모양) 들어 있음)
시험 31묶음 모두 통과 — t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 49 · t_widgets 29 · t_perm 24 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 18 · t_new 9 · t_feats 8 · t_tabswap 7 · t_pairs 9 · t_coexist 12 · t_soak 8 · t_perf 4 · t_dual 45 · t_real 17 · t_check 17 · t_parity 21 · t_sync 26 · t_bench 32 · t_dev5 37 · t_move 27 · t_nav 13 · t_default 13 · t_money 4 · t_blocks 23(+2 휴대폰 아래 줄·시트) · t_scanlist 20 · **t_chips 25(새)**.
- 우리숍 서가 4차가 지금 웹앱 1.78.489에 들어오며 휴대폰 아래 고정 줄(정렬·표지·찜·장바구니)이 블록 칸 밖 화면 맨 아래(다른 위젯 위)에 떠 있었음 → 블록 칸 아래에 붙임(u2.css · 우리숍 파일은 안 고침).

#### 지난 결과 (11/12 · 새 웹앱 0.4.10 · 지금 웹앱 1.78.487 main 배포본 — 우리숍 서가 파일 shop/ 들어 있음)
시험 30묶음 모두 통과 — t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 49 · t_widgets 29 · t_perm 24 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 18 · t_new 9 · t_feats 8 · t_tabswap 7 · t_pairs 9 · t_coexist 12 · t_soak 8 · t_perf 4 · t_dual 45 · t_real 17 · t_check 17 · t_parity 21 · t_sync 26 · t_bench 32 · t_dev5 37 · t_move 27 · t_nav 13 · t_default 13 · t_money 4 · t_blocks 21 · **t_scanlist 20(새)**.
- 시험용 지금 웹앱 = readnow-scripts origin/main(3f16061 · 1.78.487)을 `git archive`로 푼 사본(app·shop·공용 파일) → `U2_TEST_OUT`.
- t_blocks: 서가 파일이 main에 들어와 배포본 사본의 `shop/`을 그대로 씀(U2_SHELF_DIR 기본) · '파일 없을 때' 줄은 shop/shelf* 요청을 404로 흉내.
- 첫 전체 실행에서 t_real 휴대폰 1줄(📋 목록 보기 탭 기본 높이 5칸에서 안내 글이 넘침 18px) → 기본 높이 6 · 안내 한 줄 말줄임 · t_default는 브라우저 끊김(Target closed) 한 번 → 둘 다 다시 돌려 통과.

#### 지난 결과 (11/11 밤 · 새 웹앱 0.4.9 · 지금 웹앱 1.78.485 main 배포본)
시험 29묶음 모두 통과(두 번 돌림) — t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 49 · t_widgets 29 · t_perm 24 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 18 · t_new 9 · t_feats 8 · t_tabswap 7 · t_pairs 9 · t_coexist 12 · t_soak 8 · t_perf 4 · t_dual 45 · t_real 17 · t_check 17 · t_parity 21 · t_sync 26 · t_bench 32 · t_dev5 37 · t_move 27 · t_nav 13 · t_default 13 · t_money 4 · **t_blocks 21(새)**.
- 우리숍 서가 파일(shop/shelf-core.js·shelf.js·shelf.css)은 아직 main에 없어(가지 work/shelf1-1111) t_blocks는 그 가지 사본을 `U2_SHELF_DIR`로 돌려줌 · main 그대로면 블록 칸에 '파일을 아직 받을 수 없습니다' 알림(시험 줄 있음).
- 시험 흔들림 고침: t_soak(안전 모드에서 편집기를 그때 받는 동안 기다림) · t_adapters ① 0.7초 모음이 바쁜 기계에서 1초를 넘김 ② '가만히 두면 다시 그리지 않음'이 0.4.8 코드로도 실패 — 지금 웹앱 1.78.485는 가짜 자료를 다 받기까지 ~10초(S.ver 9→20)라 3초 창이 자료 받는 중에 걸림 → 자료 받기가 2.5초 멈춘 뒤 셈(실제 헛돌기 0).
- 시험 웹 서버는 오래 켜 두는 것으로(백그라운드 작업 30분 제한에 꺼지면 시험이 'Target closed'로 끊김).

#### 지난 결과 (11/11 · 새 웹앱 0.4.8 · 지금 웹앱 1.78.483 rel2 작업본으로 만든 배포본 — 이전 짧은 글 들어 있음)
- 통과: t_parity 21/21(새 탭 셋·🟩 네이버·🧪 번외 수집기·🔀 번외로 넘기기 설정 칸·🧰 예스24 운영 화면까지 빠짐 0) · t_expr_unit 203 · t_grid_unit 23 · ship-check2 · t_move의 새 ?go= 줄(deliv·reg·batch·qna — 따로 돌려 모두 통과) · t_bench의 새 ⚙ 설정 찾기 2줄.
- **이번엔 28묶음을 다 돌리지 못함** — 이 기계가 다른 일꾼 시험으로 몹시 바쁨(부하 60~120 · 주인 없이 남은 크롬 240여 개 · 남은 메모리 1GB 안팎)이라 브라우저가 중간에 죽음(Page crashed). 시험 틀(lib.js)은 페이지 열기 기다림만 2분으로 늘림(U2_NAV_MS). 기계가 한가할 때 28묶음 다시.
- 고친 것: ① ?go= 바로 가기(설치 앱·알림)로 옛 화면을 여는 7가지가 새 웹앱 안에서 곧바로 닫히던 것(u2-loader 여는 동안 닫기 막이) ② 🔎 어디서나 찾기 ⚙ 설정 범위·기능 목록 564(섹션·홈 칸까지) ③ 자료 찾기 글이 페이지 바꾼 직후 지워지던 것(두 번까지 다시 넣음).

#### 지난 결과 (11/11 · 새 웹앱 0.4.7 · 지금 웹앱 1.78.481 배포본 + 이전 짧은 글(readnow-scripts work/u2move-1111))
시험 28묶음 모두 통과 — t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 49 · t_widgets 29 · t_perm 22 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 18 · t_new 9 · t_feats 8 · t_tabswap 7 · t_pairs 9 · t_coexist 12 · t_soak 8 · t_perf 4 · t_dual 45 · t_real 17 · t_check 17 · t_parity 21 · t_sync 26 · t_bench 25 · t_dev5 37 · t_move 23 · t_nav 13 · t_default 9 · t_money 4.
- t_default·t_money 홈 흔들림(85%·45/61)의 원인: 옛 홈 칸은 화면에 실제로 보일 때 채워짐(IntersectionObserver · body가 굴림 상자라 rootMargin 600px이 먹지 않음 — 지금 웹앱 그대로 열어도 같음). 시험이 1500·3000·6000으로 건너뛰어 굴려 '매출 페이스' 칸이 한 번도 안 보이고 지나감 → 기간 단추 7줄이 빠짐(85.4%). 칸 위치가 경고 칸 높이에 따라 ±200px 흔들려 판마다 통과·실패가 갈림. → 두 시험 모두 lib.js `scrollThrough`(400px씩 끝까지)로 — 홈 100%(48줄) · 돈 숫자 74/74. 실제 사용자는 이어서 굴리므로 화면 고침은 없음.
- nav1(지금 웹앱 1.78.481 · 탭 12개 = 🧾 통합 장부·🛒 판매처·🔬 연구 더함)을 따라: t_nav·t_parity가 실제 NAV_TABS로 · 🧾 통합 장부(누르면 화면을 여는 탭) 페이지 = 머리줄 + 통합 장부 단추가 든 옛 화면 자리(U2.SCREEN_TABS) · 판매처·연구 그리기 길(A.RENDER navTabPage) · 옆 메뉴 기본 높이 29→38 · 탭 수를 세던 t_load·t_adapters·t_sync는 지금 웹앱 탭 수를 따라감 · t_track 7일 커밋 407개 > 표 400줄 상한은 상한까지로 셈 · t_pairs 남은 타이머는 위젯이 만든 것만(지금 웹앱 뒤 받기 syncColl 타이머는 뺌).
- t_move: 지금 웹앱에 짧은 글이 든 판이면 견본을 끼우지 않고 그대로 시험(로그인 뒤 RN2_MOVE_SYNC를 지금 웹앱이 저절로 부름).

#### 지난 결과 (11/11 · 새 웹앱 0.4.6 · 지금 웹앱 1.78.480 배포본)
시험 28묶음 — 26 통과 · 2 홈 탭만 흔들림: t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 49 · t_widgets 29 · t_perm 22 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 18 · t_new 9 · t_feats 8 · t_tabswap 7 · t_pairs 9 · t_coexist 12 · t_soak 8 · t_perf 4 · t_dual 45 · t_real 17 · t_check 17 · t_parity 18 · t_sync 26 · t_bench 25 · t_dev5 37 · t_move 23(새) · t_nav 10(새) · t_default 8/9 · t_money 3/4.
- t_default·t_money: 🏠 홈 탭 숫자·줄만 지금 웹앱과 85%·45/61(다른 탭 모두 100%) — **지난 판 0.4.5를 그대로 돌려도 똑같이 실패**(이번 고침 탓 아님 · 지금 웹앱 1.78.479 배포본으로도 같음) → 홈 칸이 시각·날짜에 따라 달리 채워지는 것으로 보임(지금 웹앱만: 239건·247명·900건 / 새 웹앱만: % 숫자) · 다음 회차에 홈 칸 차례를 맞춰 볼 것.

#### 지난 결과 (0.4.5)
시험 26묶음 모두 통과 — t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 46 · t_widgets 29 · t_perm 14 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 18 · t_default 9 · t_new 9 · t_money 4 · t_feats 8 · t_tabswap 7 · t_pairs 9 · t_coexist 12 · t_soak 8 · t_perf 4 · t_dual 45 · t_real 17 · t_check 17 · t_parity 18 · t_sync 26 · t_bench 25(새) · t_dev5 37(새).
- t_perm(1.78.47x 배포본에서 새로 실패): 허락한 위젯을 누른 1.5초 사이 지금 웹앱이 뒤에서 하는 쓰기(홈 요약 app_summary · 예스24 연결 · 가격 묶음 등)가 그 위젯 몫으로 통과 → 막이: 사람이 실제로 누른 지 1.5초 안 + 뒤에서 도는 함수·문서(G.BG·G.BG_DOCS)는 위젯 몫이 아님. 남은 위험: 이름 없는 새 뒤쪽 쓰기 — 다음 회차 '칸까지 허락'으로 근본 해결.
- t_parity(1.78.470 배포본에서 새로 실패): 지금 웹앱이 칸에 고정 이름표(data-blk)를 달아 열쇠가 'b:…' → '#c_plat' 같은 것으로 바뀜 — 새 웹앱은 이미 tobAlias로 맞추고 있었고 시험 셈만 맞춤(빠짐 0).
- t_default·t_sync: 여러 시험을 한꺼번에 돌릴 때 홈 칸이 늦게 채워져 한 번 85%(혼자 돌리면 100%) · 단계표에 🙋 단계가 없어져 기대 글 바꿈.
- t_real: 📥 받은편지함 줄이 5 → 7이라 기본 높이 19 → 28.

### 그 전 결과 (11/10 · 새 웹앱 0.4.4 · 지금 웹앱 1.78.466 배포본)
시험 24묶음 모두 통과 — t_actions 25 · t_adapters 23 · t_check 17 · t_coexist 12 · t_default 9 · t_dual 45 · t_editor 46 · t_expr_unit 203 · t_feats 8 · t_grid_unit 23 · t_load 21 · t_mem 6 · t_money 4 · t_new 9 · t_pairs 9 · t_parity 18 · t_perf 4 · t_perm 14 · t_real 17 · t_soak 8 · t_sync 26 · t_tabswap 7 · t_track 18 · t_widgets 29.
- t_dual 7개 실패의 원인: 지금 웹앱 1.78.4xx 등록 화면에 딸린 떠 있는 판(👁 살핀 상품 · 💰 매입가 기입 `#seenp` — body에 바로 붙음)이 💰 구획으로 커져 오른쪽 점검 점을 덮음(시험이 'SUMMARY'로 봄 — 옛 화면 위라 사람에겐 맞는 모습). → `U2.dock.FLOATS`(떠 있는 판 목록 · 계약 `floats`와 같음)를 옛 화면 몫으로 봄 · 모르는 떠 있는 것은 그 id로 보여 줌 · 🪟 옛 화면 자리 위젯 칸에 열면 그 판도 칸 안(오른쪽 아래)으로(새 시험 2줄).
- t_real 2개(1.78.463 배포본에서 새로): '오늘 출고' 기능 단추가 목록 앞에 새로 생긴 '🔎 오늘 출고 검색창 — …'으로 잡혀 긴 이름이 칸 밖으로 → 기능 이름 일부로 찾기 = 같은 이름 → 그림 글자 뗀 이름 → 가장 짧은 이름 · 단추 글 넘침 막음(t_feats 1줄 더함).
- 앞으로 덜 깨지게: 떠 있는 판 이름이 바뀌면 따라잡기(t_track·tools/track.js)가 '❌ #seenp 떠 있는 판 없음'으로 알림 · 🧱 칸 열쇠는 지금 웹앱 tobAlias + 같은 규칙(A.BLK_ALIAS)으로 맞춤(가격 감시 칸 b:가격감시판정엔진… → #p_watch).

### 그 전 결과 (11/10 · 새 웹앱 0.4.3 · 지금 웹앱 1.78.458 배포본)
t_parity 17/17(새) · t_actions 25 · t_adapters 23 · t_check 17 · t_coexist 12 · t_default 9 · t_editor 46 · t_expr_unit 203 · t_feats 7 · t_grid_unit 23 · t_load 21 · t_mem 6 · t_money 4 · t_new 9 · t_pairs 9 · t_perf 4 · t_perm 14 · t_real 17 · t_soak 8 · t_sync 26 · t_tabswap 7 · t_track 16 · t_widgets 29 모두 통과.
- t_dual 36/43 — 0.4.2 코드에서도 1.78.458 배포본이면 똑같이 7개 실패(1.78.424 배포본에서는 0.4.2·0.4.3 모두 43/43) → 지금 웹앱 1.78.425~458 사이 등록 화면 바뀜(오른쪽 창이 'SUMMARY'로 잡힘)을 따라잡을 일 · 이번 고침과 무관.

### 그 전 결과 (11/10 · 새 웹앱 0.4.2 · 지금 웹앱 1.78.453 배포본)
시험 23묶음 모두 통과 — t_grid_unit 23 · t_expr_unit 203 · t_load 21 · t_editor 46 · t_widgets 29 · t_perm 14 · t_mem 6 · t_actions 25 · t_adapters 23 · t_track 16 · t_default 9 · t_new 9 · t_money 4 · t_feats 7 · t_tabswap 7 · t_coexist 12 · t_dual 43 · t_sync 26 · t_real 17 · t_pairs 9 · t_soak 8 · t_perf 4 · t_check 17.
- 0.4.1에서 남았던 t_default 8/9(홈 '매출 페이스' 칸)는 1.78.453 배포본에서 9/9.
- t_sync: 맨 위 시범 띠(0.4.2)를 새 웹앱 자리로 봄 · t_real: 지금 웹앱 1.78.453 새 '💰 매입가' 떠 있는 단추(#buyp_fab · 휴대폰 왼쪽 아래)는 지금 웹앱에서도 같은 자리라 '옛 떠 있는 것 몫'(H-06)으로 뺌.
- t_adapters '가만히 두면 다시 그리지 않음'은 시험 둘을 함께 돌렸을 때 한 번 2번(흔들림) — 혼자 돌리면 세 번 다 통과.

## 지킬 것
한국어 화면 글 · 브라우저 팝업 금지(화면 안 확인·두 번 누르기) · 손님 개인 정보 금지(견본은 '손님A') · 외부 라이브러리 없음(격자·차트 직접) · 기기 저장 열쇠 `rn2-` · Firestore 쓰기 `ui2_*`만
