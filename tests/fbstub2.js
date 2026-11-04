/* 시험용 가짜 Firebase(실제 compat SDK처럼 class로 — firebase.firestore.DocumentReference 등이 있음)
 * 실제 Firebase에는 아무것도 쓰지 않음. 쓴 것은 window.__FSW 에 기록(칸 이름·문서 id) → 시험이 '막이를 뚫은 쓰기'를 셈
 * 저장소의 pw/fbstub.js(지금 웹앱 시험용)를 본떠 class 모양으로 바꿈 */
(function () {
  const store = (window.__FS = window.__FS || {}); const subs = [];
  try { const seed = window.__FS_SEED; if (seed) for (const [c, docs] of Object.entries(seed)) store[c] = Object.assign(store[c] || {}, docs); } catch (e) {}
  const TS = { fromMillis: (m) => ({ valueOf: () => m, toMillis: () => m, toDate: () => new Date(m), seconds: Math.floor(m / 1000) }), now: () => TS.fromMillis(Date.now()), fromDate: (d) => TS.fromMillis(+d) };
  const FV = { serverTimestamp: () => TS.now(), arrayUnion: (...a) => ({ __au: a }), arrayRemove: (...a) => ({ __ar: a }), increment: (n) => ({ __inc: n }), delete: () => ({ __del: 1 }) };
  const isPO = (x) => x && typeof x === 'object' && !Array.isArray(x) && x.__del === undefined && x.__au === undefined && x.__inc === undefined && !x.toMillis && Object.getPrototypeOf(x) === Object.prototype;
  const applyDeep = (cur, v) => { const o = { ...(cur || {}) }; for (const [k, x] of Object.entries(v || {})) { if (x && x.__del) delete o[k]; else if (x && x.__au) o[k] = [...(o[k] || []), ...x.__au]; else if (x && x.__inc != null) o[k] = (+o[k] || 0) + x.__inc; else if (isPO(x) && isPO(o[k])) o[k] = applyDeep(o[k], x); else o[k] = isPO(x) ? applyDeep({}, x) : x; } return o; };
  const col = (n) => (store[n] = store[n] || {});
  const rec = (n, id, op) => { window.__FSW = (window.__FSW || []).concat([{ n, id, op, at: Date.now() }]); };
  const fire = () => subs.forEach((s) => { try { s(); } catch (e) {} });
  class DocumentSnapshot { constructor(n, id) { const d = col(n)[id]; this.id = id; this.metadata = { fromCache: false, hasPendingWrites: false }; this.exists = d != null; this._d = d; this.ref = new DocumentReference(n, id); } data() { return this._d == null ? undefined : JSON.parse(JSON.stringify(this._d)); } get(k) { return (this._d || {})[k]; } }
  class DocumentReference {
    constructor(n, id) { this._n = n; this.id = id || Math.random().toString(36).slice(2, 12); this.path = n + '/' + this.id; }
    get parent() { return new CollectionReference(this._n); }
    async get() { return new DocumentSnapshot(this._n, this.id); }
    async set(v, o) { col(this._n)[this.id] = o && o.merge ? applyDeep(col(this._n)[this.id], v) : applyDeep({}, v); rec(this._n, this.id, 'set'); setTimeout(fire); }
    async update(v) { col(this._n)[this.id] = applyDeep(col(this._n)[this.id], v); rec(this._n, this.id, 'update'); setTimeout(fire); }
    async delete() { delete col(this._n)[this.id]; rec(this._n, this.id, 'delete'); setTimeout(fire); }
    onSnapshot(a, b) { const cb = typeof a === 'function' ? a : b; const f = () => cb(new DocumentSnapshot(this._n, this.id)); subs.push(f); setTimeout(f); return () => {}; }
    collection(c) { return new CollectionReference(this.path + '/' + c); }
  }
  class Query {
    constructor(n, flt) { this._n = n; this._f = flt || []; }
    where(f, op, v) { return new Query(this._n, this._f.concat([[f, op, v]])); }
    orderBy() { return this; } limit() { return this; } limitToLast() { return this; } startAfter() { return this; } startAt() { return this; } endAt() { return this; } endBefore() { return this; } select() { return this; }
    _snap() { const ids = Object.keys(col(this._n)).filter((id) => this._f.every(([f, op, v]) => { const x = String(f).includes('.') ? String(f).split('.').reduce((a, k) => (a == null ? a : a[k]), col(this._n)[id]) : col(this._n)[id][f]; return op === '==' ? x === v : op === '>=' ? x >= v : op === '>' ? x > v : op === '<=' ? x <= v : op === '<' ? x < v : op === 'in' ? v.includes(x) : op === 'array-contains' ? (x || []).includes(v) : true; })); const docs = ids.map((id) => new DocumentSnapshot(this._n, id)); return { metadata: { fromCache: false, hasPendingWrites: false }, docs, size: docs.length, empty: !docs.length, forEach: (f) => docs.forEach(f), docChanges: () => docs.map((d) => ({ type: 'added', doc: d })) }; }
    async get() { return this._snap(); }
    onSnapshot(a, b) { const cb = typeof a === 'function' ? a : b; let prev = new Map(); const f = () => { const sn = this._snap(); const cur = new Map(sn.docs.map((d) => [d.id, JSON.stringify(d.data())])); const ch = []; sn.docs.forEach((d) => { if (!prev.has(d.id)) ch.push({ type: 'added', doc: d }); else if (prev.get(d.id) !== cur.get(d.id)) ch.push({ type: 'modified', doc: d }); }); const first = !prev.size; prev = cur; if (ch.length || first) cb({ ...sn, docChanges: () => ch }); }; subs.push(f); setTimeout(f); return () => {}; }
  }
  class CollectionReference extends Query {
    constructor(n) { super(n); this.path = n; this.id = n.split('/').pop(); }
    doc(id) { return new DocumentReference(this._n, id); }
    async add(v) { const r = new DocumentReference(this._n); await DocumentReference.prototype.set.call(r, v); return r; }
  }
  class WriteBatch { constructor() { this._ops = []; } set(r, v, o) { this._ops.push(() => r.set(v, o)); return this; } update(r, v) { this._ops.push(() => r.update(v)); return this; } delete(r) { this._ops.push(() => r.delete()); return this; } async commit() { for (const o of this._ops) await o(); } }
  class Transaction { get(r) { return r.get(); } set(r, v, o) { r.set(v, o); return this; } update(r, v) { r.update(v); return this; } delete(r) { r.delete(); return this; } }
  const user = { email: 'tester@example.com', uid: 'u1', displayName: '시험', getIdToken: async () => 't' };
  const auth = { currentUser: user, onAuthStateChanged: (cb) => { setTimeout(() => cb(user)); return () => {}; }, signInWithPopup: async () => ({ user }), signInWithRedirect: async () => {}, getRedirectResult: async () => ({}), signOut: async () => {}, setPersistence: async () => {} };
  const db = { collection: (n) => new CollectionReference(n), doc: (p) => { const a = p.split('/'); return new DocumentReference(a.slice(0, -1).join('/'), a[a.length - 1]); }, runTransaction: async (fn) => fn(new Transaction()), batch: () => new WriteBatch(), enablePersistence: async () => {}, enableMultiTabIndexedDbPersistence: async () => {}, settings: () => {}, waitForPendingWrites: async () => {}, enableNetwork: async () => {}, disableNetwork: async () => {}, clearPersistence: async () => {}, terminate: async () => {} };
  class Reference { constructor(p) { this.fullPath = p || ''; } child(c) { return new Reference(this.fullPath + '/' + c); } put() { rec('storage', this.fullPath, 'put'); return Promise.resolve({ ref: this }); } putString() { rec('storage', this.fullPath, 'put'); return Promise.resolve({ ref: this }); } async delete() { rec('storage', this.fullPath, 'delete'); } async getDownloadURL() { return 'https://x/y.jpg'; } async listAll() { return { items: [], prefixes: [] }; } }
  const storage = { ref: (p) => new Reference(p) };
  const app = { auth: () => auth, firestore: () => db, storage: () => storage, name: '[DEFAULT]', options: {} };
  const fb = { apps: [], initializeApp: () => { fb.apps.push(app); return app; }, app: () => app, auth: Object.assign(() => auth, { GoogleAuthProvider: function () { this.setCustomParameters = () => {}; this.addScope = () => {}; }, Auth: { Persistence: { LOCAL: 'local', NONE: 'none', SESSION: 'session' } } }),
    firestore: Object.assign(() => db, { FieldValue: FV, Timestamp: TS, FieldPath: Object.assign(function (...a) { this.a = a; }, { documentId: () => '__id' }), CACHE_SIZE_UNLIMITED: -1, DocumentReference, CollectionReference, Query, WriteBatch, Transaction, DocumentSnapshot }),
    storage: Object.assign(() => storage, { Reference }) };
  window.firebase = fb;
})();
