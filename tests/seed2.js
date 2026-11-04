/* 시험용 가짜 자료(지금 웹앱 pw/seedBig.js 모양을 본뜸 · 개인 정보 없음 — 손님A…·010-0000-0000)
 * 페이지 안에서 S(지금 웹앱 상태)에 바로 넣음 · 늘 같은 값(고정 씨앗) → 지금 웹앱과 새 웹앱에 같은 자료 */
module.exports = (n) => { n = n || {}; let seed = 20261105; const R = (k) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
  const day = 864e5, now = new Date(); now.setHours(12, 0, 0, 0); const D = (d) => new Date(now.getTime() - d * day).toISOString();
  const NP = n.p || 3000, NO = n.o || 900, NC = n.c || 400, NS = n.s || 300;
  for (let i = 0; i < NP; i++) { const uc = 'U3' + String(1000000 + i); const bid = 'bk' + i; const sold = i % 9 === 0;
    S.plist.set('aladin_' + uc, { id: 'aladin_' + uc, usedCode: uc, listingId: String(404935000 + i), title: '시험 책 ' + i + ' ' + ['역사', '소설', '경제', '과학', '여행'][i % 5], author: '저자' + (i % 90), isbn13: '97889' + String(10000000 + i), price: 3000 + (i % 40) * 500, qty: sold ? 0 : 1, grade: ['최상', '상', '중'][i % 3], status: sold ? '판매완료' : i % 37 === 0 ? '일시판매중지' : '판매중', active: !sold, sku: ['PNK', 'BLK', 'YLW', 'GRN'][i % 4] + '_' + ['ms', 'hd'][i % 2], registeredAt: D(R(300)), publisher: '출판사' + (i % 40), bookId: bid, priceList: 15000 + (i % 30) * 1000 });
    S.pbooks.set(bid, { id: bid, aladinItemId: String(300000000 + i), title: '시험 책 ' + i, isbn13: '97889' + String(10000000 + i), author: '저자' + (i % 90), publisher: '출판사' + (i % 40), priceList: 15000 + (i % 30) * 1000, categoryName: ['국내도서>소설', '국내도서>경제경영', '국내도서>역사', '국내도서>과학'][i % 4] }); }
  const P = (rt, k) => ({ '최근 6개월': { rating: rt, count: k, good: Math.round(k * rt), soso: 3, bad: 2 }, '전체 기간': { rating: 0.98, count: k * 5 } });
  S.sellers.set('sc_996008', { id: 'sc_996008', sc: '996008', name: '북스킹', aladinGrade: '전문셀러', isPro: true, cancel3m: 0.0125, shopPeriods: P(0.987, 820), shopAt: D(1) });
  for (let i = 0; i < NS; i++) S.sellers.set('sc_' + (1000 + i), { id: 'sc_' + (1000 + i), sc: String(1000 + i), name: '판매자' + i, cancel3m: (i % 50) / 1000, shopPeriods: P(0.9 + (i % 10) / 100, 10 + (i % 2000)), shopAt: D(i % 60), aladinGrade: i % 5 ? '일반' : '전문셀러' });
  for (let c = 0; c < NC; c++) { const id = 'c' + c; S.customers.set(id, { customerId: id, name: '손님' + c, names: ['손님' + c], phones: ['010-0000-0000'], lastOrderAt: D(c % 200), firstOrderAt: D(200 + (c % 200)), _sk: '손님' + c }); }
  for (let o = 0; o < NO; o++) { const i = R(NP); const l = S.plist.get('aladin_U3' + String(1000000 + i)); const id = 'ord' + o;
    S.orders.set(id, { id, orderNo: String(900000000 + o), orderedAt: D(o % 120 + (o % 7) / 10), customerId: 'c' + (o % NC), kind: 'sale', platform: o % 6 ? 'aladin' : 'yes24', status: ['배송완료', '구매확정', '주문확인요청', '발송완료'][o % 4], buyer: { name: '손님' + (o % NC) }, items: [{ title: l.title, isbn13: l.isbn13, sku: l.sku, price: l.price, qty: 1, usedCode: l.usedCode, listingId: l.listingId }], total: l.price, _sk: '' }); }
  S.prodLoaded = true; S.pmatchLoaded = true; S.ordersLoaded = true; S.sellersLoaded = true; S.pmLoaded = true; S.custLoaded = true;
  try { S._cashIdx = null; S._saleIdx = null; } catch (e) {} if (!n.nobump) { try { if (typeof bump === 'function') bump(); } catch (e) {} try { S.ver++; } catch (e) {} }
  return { p: S.plist.size, s: S.sellers.size, o: S.orders.size, c: S.customers.size }; };
