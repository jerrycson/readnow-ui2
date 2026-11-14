# 리드나우 2 (ui2) — 어느 AI든(Claude·ChatGPT·Codex) 이 저장소로 일을 시작할 때

규칙은 같은 자리의 `CLAUDE.md`와 `jerrycson/readnow-scripts`의 `AGENTS.md` 그대로입니다(이름표 ui2).

1. 먼저 협업 문서를 읽습니다 — ChatGPT·Codex는 비공개 `jerrycson/readnow-collab`의 `STATE.md` → `AGENTS.md` → `AI_COLLAB/PROTOCOL.md` · Claude는 원본 장부.
2. **이 저장소는 공개입니다** — 대화 내용·비밀값·손님 개인 정보·주문 번호를 넣지 않습니다. 정범님이 보는 글은 모두 한국어 · 호칭은 '정범님'.
3. 지금 웹앱 파일(`src/`·`app/`·`cloud/`·`readnow-*.js`·`manual/`)은 고치지 않습니다 · Firestore 쓰기는 `ui2_*` 칸만 · 기기 저장 열쇠는 `rn2-` · 브라우저 팝업 금지.
4. ChatGPT·Codex는 `codex/<일 이름>` 가지 + PR까지만(main 직접 push 금지 · 판 번호 `U2_VER`는 Claude가 합칠 때 맞춤). 고친 뒤 `tests/` 시험을 모두 돌리고 결과를 PR 본문에 적습니다.
5. 일을 마치면 readnow-collab `coord/from_gpt/`에 쪽지 한 장(PR · 저절로 합쳐짐).
