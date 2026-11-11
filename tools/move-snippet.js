/* 리드나우 2 이전(단계 13 · 정범님 ㉮) — 지금 웹앱 쪽에 넣을 짧은 글 (리드가 넣음 · 새 웹앱 저장소에는 견본으로만 둠)
 * 넣을 곳: 지금 웹앱 src/app.html <head> 맨 앞 <script> 한 개(무거운 본문·Firebase보다 먼저) — 수집기 머리와는 상관없음
 * 하는 일: 이 기기 저장 rn2-move(새 웹앱이 씀)가 'on'이면 곧바로 새 웹앱으로 넘김(?·# 그대로 + from=old)
 *  - ?old=1 로 열면(옛 화면 주소) 넘기지 않고, 그 탭은 닫을 때까지 옛 화면(sessionStorage rn2-old)
 *  - 새 웹앱 안에서 이 틀을 불러올 때(window.U2 있음)·다른 창 안(iframe)에서는 아무것도 안 함
 *  - 'back'(되돌림)·'off'·글이 없으면 아무것도 안 함 → 되돌리기는 새 웹앱이 rn2-move를 고치는 것만으로 끝남
 * 아래 RN2_MOVE_SYNC는 Firebase 로그인 뒤 한 번(이 기기에서 새 웹앱을 한 번도 안 연 경우 — 옮긴 날 첫 열기) — 문서 1개 읽기 */
(function () {
  try {
    if (window.U2 || window.top !== window) return;
    var q = new URLSearchParams(location.search);
    if (q.get('old') === '1') { try { sessionStorage.setItem('rn2-old', '1'); } catch (e) {} return; }
    try { if (sessionStorage.getItem('rn2-old') === '1') return; } catch (e) {}
    var m = JSON.parse(localStorage.getItem('rn2-move') || 'null');
    if (!m || m.state !== 'on' || !m.to) return;
    window.RN2_MOVING = true; q.set('from', 'old');
    location.replace(m.to + '?' + q.toString() + location.hash);
  } catch (e) {}
})();
/* 로그인 뒤(지금 웹앱 Firebase 준비 끝난 자리에서 RN2_MOVE_SYNC(firebase.firestore()) 한 줄) — 읽기만 · rn2-move는 쓰지 않음(새 웹앱만 씀) */
window.RN2_MOVE_SYNC = function (db) {
  try {
    if (window.U2 || window.RN2_MOVING || window.top !== window) return;
    var q = new URLSearchParams(location.search); if (q.get('old') === '1') return; try { if (sessionStorage.getItem('rn2-old') === '1') return; } catch (e) {}
    db.collection('ui2_site').doc('main').get().then(function (d) {
      var m = d && d.exists ? (d.data() || {}).move : null; if (!m || m.state !== 'on' || !m.to) return;
      q.set('from', 'old'); location.replace(m.to + '?' + q.toString() + location.hash);
    }).catch(function () {});
  } catch (e) {}
};
