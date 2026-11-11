/* 리드나우 2 이전(단계 13 · 정범님 ㉮) — 지금 웹앱 쪽 짧은 글의 견본 (지금 웹앱 src/app.html <head> 맨 앞 <script>와 같은 글 · 0.4.7에서 그 판에 맞춤)
 * 리드가 readnow-scripts 가지 work/u2move-1111에 넣음(시험 src/tests/tU2MOVE1111.js) · 이 견본은 t_move가 짧은 글이 아직 없는 지금 웹앱 판을 흉내 낼 때만 씀
 * 로그인 뒤 한 줄: RN2_MOVE_SYNC(db) (지금 웹앱 onAuthStateChanged 안 S.user = u 바로 뒤) */
/* (리드나우 2 이전 · 단계 13 · 정범님 ㉮) 이 기기 저장 rn2-move(새 웹앱만 씀)가 'on'이면 본문을 받기 전에 새 웹앱으로 넘김(?·# 그대로 + from=old) · 글이 없거나 'off'·'back'이면 아무 일 없음
 *  ?old=1(옛 화면 주소)로 연 탭은 닫을 때까지 옛 화면(sessionStorage rn2-old) + 머리 띠 '옛 화면 — ○일 뒤 닫힘 · 리드나우 2로 ›' · 새 웹앱 안(window.U2)·다른 창 안(iframe)에서는 아무것도 안 함
 *  RN2_MOVE_SYNC(db) = 로그인 뒤 한 번 ui2_site/main 문서 1개 읽기(새 웹앱을 한 번도 안 연 기기) · 견본 readnow-ui2 tools/move-snippet.js · 시험 tU2MOVE1111 */
(function () {
  try {
    if (window.U2 || window.top !== window) return;
    var q = new URLSearchParams(location.search), old = false;
    if (q.get('old') === '1') { old = true; try { sessionStorage.setItem('rn2-old', '1'); } catch (e) {} }
    else { try { old = sessionStorage.getItem('rn2-old') === '1'; } catch (e) {} }
    var m = null; try { m = JSON.parse(localStorage.getItem('rn2-move') || 'null'); } catch (e) {}
    if (old) {
      if (!m || m.state !== 'on' || !m.to) return;
      window.RN2_OLD_BAND = function () { try { if (document.getElementById('rn2oldband')) return; try { if (sessionStorage.getItem('rn2-old-hide') === '1') return; } catch (e) {}
        var d = m.until ? Math.max(0, Math.ceil((new Date(m.until) - Date.now()) / 864e5)) : null; var b = document.createElement('div'); b.id = 'rn2oldband';
        b.style.cssText = 'position:fixed;left:8px;right:8px;top:56px;z-index:9997;background:#FFF4E5;color:#7A4A10;border:1px solid #E8B062;border-radius:8px;padding:6px 10px;font-size:12.5px;box-shadow:0 2px 8px rgba(0,0,0,.15);display:flex;gap:8px;align-items:center';
        var t = document.createElement('span'); t.style.flex = '1'; t.textContent = '↩ 옛 화면' + (d == null ? '' : d > 0 ? ' — ' + d + '일 뒤 닫힘' : ' — 30일이 지났습니다');
        var a = document.createElement('a'); a.id = 'rn2oldgo'; a.textContent = '리드나우 2로 ›'; a.style.cssText = 'color:#1F5FAF;font-weight:700;cursor:pointer;text-decoration:none';
        var p = new URLSearchParams(location.search); p.delete('old'); p.set('from', 'old'); a.href = m.to + '?' + p.toString() + location.hash;
        a.onclick = function () { try { sessionStorage.removeItem('rn2-old'); } catch (e) {} };
        var x = document.createElement('span'); x.textContent = '×'; x.title = '이 탭에서 띠 닫기'; x.style.cssText = 'cursor:pointer;font-size:16px;padding:0 4px'; x.onclick = function () { try { sessionStorage.setItem('rn2-old-hide', '1'); } catch (e) {} b.remove(); };
        b.appendChild(t); b.appendChild(a); b.appendChild(x); document.body.appendChild(b); } catch (e) {} };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.RN2_OLD_BAND); else window.RN2_OLD_BAND();
      return;
    }
    if (!m || m.state !== 'on' || !m.to) return;
    window.RN2_MOVING = true; q.set('from', 'old');
    location.replace(m.to + '?' + q.toString() + location.hash);
  } catch (e) {}
})();
window.RN2_MOVE_SYNC = function (db) {
  try {
    if (window.U2 || window.RN2_MOVING || window.top !== window || window.RN2_MOVE_DONE) return; window.RN2_MOVE_DONE = 1;
    var q = new URLSearchParams(location.search); if (q.get('old') === '1') return; try { if (sessionStorage.getItem('rn2-old') === '1') return; } catch (e) {}
    db.collection('ui2_site').doc('main').get().then(function (d) {
      var m = d && d.exists ? (d.data() || {}).move : null; window.RN2_MOVE_LAST = { at: Date.now(), state: (m && m.state) || 'none' }; if (!m || m.state !== 'on' || !m.to) return;
      window.RN2_MOVING = true; q.set('from', 'old'); location.replace(m.to + '?' + q.toString() + location.hash);
    }).catch(function (e) { window.RN2_MOVE_LAST = { at: Date.now(), err: String((e && (e.code || e.message)) || e) }; });
  } catch (e) {}
};
