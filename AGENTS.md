# 리드나우 2 (ui2) — 어느 AI든(Claude·ChatGPT·Codex) 이 저장소로 일을 시작할 때

규칙은 같은 자리의 `CLAUDE.md`와 `jerrycson/readnow-scripts`의 `AGENTS.md` 그대로입니다(이름표 ui2).

1. 먼저 협업 문서를 읽습니다 — ChatGPT·Codex는 비공개 `jerrycson/readnow-collab`의 `STATE.md` → `AGENTS.md` → `AI_COLLAB/PROTOCOL.md` · Claude는 원본 장부.
2. **이 저장소는 공개입니다** — 대화 내용·비밀값·손님 개인 정보·주문 번호를 넣지 않습니다. 정범님이 보는 글은 모두 한국어 · 호칭은 '정범님'.
3. 지금 웹앱 파일(`src/`·`app/`·`cloud/`·`readnow-*.js`·`manual/`)은 고치지 않습니다 · Firestore 쓰기는 `ui2_*` 칸만 · 기기 저장 열쇠는 `rn2-` · 브라우저 팝업 금지.
4. ChatGPT·Codex는 `codex/<일 이름>` 가지 + PR까지만(main 직접 push 금지 · 판 번호 `U2_VER`는 Claude가 합칠 때 맞춤). 고친 뒤 `tests/` 시험을 모두 돌리고 결과를 PR 본문에 적습니다.
5. 일을 마치면 readnow-collab `coord/from_gpt/`에 쪽지 한 장(PR · 저절로 합쳐짐). 협업 사본에 쪽지를 못 쓰는 환경이면 **PR 본문 끝에 `## 바통 쪽지`**(한 일 · 확인한 것 · 안 해 본 것 · 다음 첫 걸음) — GitHub에서 PR을 직접 합치지 않습니다.
6. 협업 사본을 못 읽는 Codex 환경이면 이 파일·`CLAUDE.md`·`README.md`의 규칙만으로 **정범님이 그 자리에서 준 범위가 분명한 일**만 하고 그 사실을 PR 본문에 적습니다(지난 결정·지금 상태를 짐작으로 채우지 않음). 정범님이 「멈춤」을 걸어 두신 동안에는 새 고침을 시작하지 않습니다.
