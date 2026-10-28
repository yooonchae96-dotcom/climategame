// ============================================================
// 공유 저장소
//   - 아티팩트 안: claude.use("db")  (같은 계정의 여러 탭·기기 간 실시간 공유)
//   - 그 밖(내 컴퓨터에서 index.html 열기): 같은 브라우저의 탭끼리 공유 (BroadcastChannel)
//   - 배포 후: Supabase 백엔드를 같은 인터페이스로 추가 예정
//
// 앱이 쓰는 인터페이스 (Firestore 비슷한 최소 집합)
//   db.doc(path).get() / .set(obj) / .update(obj) / .onSnapshot(fn)
//   db.collection(path).get() / .onSnapshot(fn) / .doc(id)
// ============================================================
(function (root) {
  // ---------- 로컬 백엔드 ----------
  function LocalDB() {
    const KEY = "climate-game-db";
    const chan = ("BroadcastChannel" in root) ? new BroadcastChannel("climate-game-db") : null;
    const listeners = new Set();
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } };
    const write = all => { localStorage.setItem(KEY, JSON.stringify(all)); notify(); if (chan) chan.postMessage("changed"); };
    const notify = () => listeners.forEach(fn => { try { fn(); } catch (e) {} });
    if (chan) chan.onmessage = notify;
    root.addEventListener("storage", e => { if (e.key === KEY) notify(); });
    const snap = (id, data) => ({ id, exists: data !== undefined, data: () => data, metadata: { fromCache: false, hasPendingWrites: false } });
    const subscribe = fn => { listeners.add(fn); fn(); return () => listeners.delete(fn); };
    const docRef = path => ({
      id: path.split("/").pop(), path,
      async get() { return snap(path.split("/").pop(), read()[path]); },
      async set(data) { const all = read(); all[path] = JSON.parse(JSON.stringify(data)); write(all); },
      async update(data) { const all = read(); if (!all[path]) throw { code: "invalid_argument", message: "no doc" }; Object.assign(all[path], JSON.parse(JSON.stringify(data))); write(all); },
      async delete() { const all = read(); delete all[path]; write(all); },
      onSnapshot(fn) { let last; return subscribe(() => { const d = read()[path]; const s = JSON.stringify(d); if (s !== last) { last = s; fn(snap(path.split("/").pop(), d)); } }); },
      collection(sub) { return colRef(path + "/" + sub); },
    });
    const colRef = path => {
      const list = () => { const all = read(); const depth = path.split("/").length + 1; return Object.keys(all).filter(k => k.startsWith(path + "/") && k.split("/").length === depth).sort().map(k => snap(k.split("/").pop(), all[k])); };
      return {
        path,
        doc(id) { return docRef(path + "/" + (id || Math.random().toString(36).slice(2, 10))); },
        async get() { const docs = list(); return { docs, size: docs.length, empty: !docs.length }; },
        onSnapshot(fn) { let last; return subscribe(() => { const docs = list(); const s = JSON.stringify(docs.map(d => [d.id, d.data()])); if (s !== last) { last = s; fn({ docs, size: docs.length, empty: !docs.length }); } }); },
      };
    };
    return { doc: docRef, collection: colRef };
  }

  // ---------- Supabase 백엔드 (배포용) ----------
  //   테이블 하나(docs): path(text, 기본키), data(jsonb), updated_at
  //   실시간: Supabase Realtime(postgres_changes) 구독 + 3초마다 보조 폴링
  function SupabaseDB(url, key, table) {
    const base = `${url}/rest/v1/${table}`;
    const H = { "Content-Type": "application/json", apikey: key, Authorization: "Bearer " + key };
    const listeners = new Set();
    const notify = () => listeners.forEach(fn => { try { fn(); } catch (e) {} });
    // 실시간 구독 (supabase-js가 로드돼 있으면 사용, 아니면 폴링만)
    try {
      if (root.supabase && root.supabase.createClient) {
        const client = root.supabase.createClient(url, key);
        client.channel("docs-changes").on("postgres_changes", { event: "*", schema: "public", table }, () => notify()).subscribe();
      }
    } catch (e) {}
    setInterval(notify, 3000);
    const snap = (id, data) => ({ id, exists: data !== undefined, data: () => data, metadata: { fromCache: false, hasPendingWrites: false } });
    const idOf = path => path.split("/").pop();
    async function getRow(path) {
      const r = await fetch(`${base}?select=data&path=eq.${encodeURIComponent(path)}`, { headers: H });
      if (!r.ok) throw { code: "unavailable", message: "Supabase " + r.status };
      const rows = await r.json(); return rows[0] ? rows[0].data : undefined;
    }
    async function putRow(path, data) {
      const r = await fetch(base, { method: "POST", headers: Object.assign({}, H, { Prefer: "resolution=merge-duplicates,return=minimal" }), body: JSON.stringify({ path, data, updated_at: new Date().toISOString() }) });
      if (!r.ok) throw { code: "unavailable", message: "Supabase " + r.status };
      notify();
    }
    async function listRows(prefix, depth) {
      const r = await fetch(`${base}?select=path,data&path=like.${encodeURIComponent(prefix + "/%")}`, { headers: H });
      if (!r.ok) throw { code: "unavailable", message: "Supabase " + r.status };
      const rows = await r.json();
      return rows.filter(x => x.path.split("/").length === depth).sort((a, b) => a.path.localeCompare(b.path)).map(x => snap(idOf(x.path), x.data));
    }
    const subscribe = fn => { listeners.add(fn); fn(); return () => listeners.delete(fn); };
    const docRef = path => ({
      id: idOf(path), path,
      async get() { return snap(idOf(path), await getRow(path)); },
      async set(data) { await putRow(path, JSON.parse(JSON.stringify(data))); },
      async update(data) { const cur = await getRow(path); if (cur === undefined) throw { code: "invalid_argument", message: "no doc" }; await putRow(path, Object.assign({}, cur, JSON.parse(JSON.stringify(data)))); },
      async delete() { await fetch(`${base}?path=eq.${encodeURIComponent(path)}`, { method: "DELETE", headers: H }); notify(); },
      onSnapshot(fn) { let last; return subscribe(async () => { try { const d = await getRow(path); const s = JSON.stringify(d); if (s !== last) { last = s; fn(snap(idOf(path), d)); } } catch (e) {} }); },
      collection(sub) { return colRef(path + "/" + sub); },
    });
    const colRef = path => ({
      path,
      doc(id) { return docRef(path + "/" + (id || Math.random().toString(36).slice(2, 10))); },
      async get() { const docs = await listRows(path, path.split("/").length + 1); return { docs, size: docs.length, empty: !docs.length }; },
      onSnapshot(fn) { let last; return subscribe(async () => { try { const docs = await listRows(path, path.split("/").length + 1); const s = JSON.stringify(docs.map(d => [d.id, d.data()])); if (s !== last) { last = s; fn({ docs, size: docs.length, empty: !docs.length }); } } catch (e) {} }); },
    });
    return { doc: docRef, collection: colRef };
  }

  // ---------- Firebase 실시간 데이터베이스 백엔드 (모든 기기 실시간 공유) ----------
  function FirebaseRTDB(baseUrl) {
    const rootUrl = baseUrl.replace(/\/$/, "");
    const listeners = new Set();
    const notify = () => listeners.forEach(fn => { try { fn(); } catch (e) {} });

    // 실시간 빠른 폴링 (1.5초)
    setInterval(notify, 1500);

    const snap = (id, data) => ({
      id,
      exists: data !== null && data !== undefined,
      data: () => data,
      metadata: { fromCache: false, hasPendingWrites: false }
    });
    const idOf = path => path.split("/").pop();

    async function getVal(path) {
      try {
        const r = await fetch(`${rootUrl}/${path}.json?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) return undefined;
        const data = await r.json();
        return data === null ? undefined : data;
      } catch (e) {
        return undefined;
      }
    }

    async function setVal(path, data) {
      try {
        await fetch(`${rootUrl}/${path}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        notify();
      } catch (e) {}
    }

    async function updateVal(path, data) {
      try {
        await fetch(`${rootUrl}/${path}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        notify();
      } catch (e) {}
    }

    async function deleteVal(path) {
      try {
        await fetch(`${rootUrl}/${path}.json`, { method: "DELETE" });
        notify();
      } catch (e) {}
    }

    async function listDocs(colPath) {
      try {
        const r = await fetch(`${rootUrl}/${colPath}.json?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) return [];
        const obj = await r.json();
        if (!obj || typeof obj !== "object") return [];
        return Object.keys(obj).sort().map(k => snap(k, obj[k]));
      } catch (e) {
        return [];
      }
    }

    const subscribe = fn => {
      listeners.add(fn);
      fn();
      return () => listeners.delete(fn);
    };

    const docRef = path => ({
      id: idOf(path),
      path,
      async get() { return snap(idOf(path), await getVal(path)); },
      async set(data) { await setVal(path, JSON.parse(JSON.stringify(data))); },
      async update(data) { await updateVal(path, JSON.parse(JSON.stringify(data))); },
      async delete() { await deleteVal(path); },
      onSnapshot(fn) {
        let last;
        return subscribe(async () => {
          try {
            const d = await getVal(path);
            const s = JSON.stringify(d);
            if (s !== last) {
              last = s;
              fn(snap(idOf(path), d));
            }
          } catch (e) {}
        });
      },
      collection(sub) { return colRef(path + "/" + sub); }
    });

    const colRef = path => ({
      path,
      doc(id) { return docRef(path + "/" + (id || Math.random().toString(36).slice(2, 10))); },
      async get() {
        const docs = await listDocs(path);
        return { docs, size: docs.length, empty: !docs.length };
      },
      onSnapshot(fn) {
        let last;
        return subscribe(async () => {
          try {
            const docs = await listDocs(path);
            const s = JSON.stringify(docs.map(d => [d.id, d.data()]));
            if (s !== last) {
              last = s;
              fn({ docs, size: docs.length, empty: !docs.length });
            }
          } catch (e) {}
        });
      }
    });

    return { doc: docRef, collection: colRef };
  }

  // ---------- 연결 ----------
  //   우선순위: Supabase 설정 -> claude db -> 기본 클라우드 실시간 저장소(RTDB) -> 로컬
  async function connectStore() {
    const CFG = root.CONFIG || {};
    if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
      return { db: SupabaseDB(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, CFG.SUPABASE_TABLE || "docs"), mode: "supabase", label: "Supabase 실시간 저장소" };
    }
    let db = null;
    try { if (root.claude && root.claude.use) db = await root.claude.use("db"); } catch (e) { db = null; }
    if (db) return { db, mode: "db", label: "실시간 공유 저장소" };

    // 클라우드 실시간 저장소 (모든 기기 실시간 공유)
    try {
      const cloudUrl = CFG.FIREBASE_DB_URL || "https://amugana-df341-default-rtdb.firebaseio.com/climate_game";
      return { db: FirebaseRTDB(cloudUrl), mode: "cloud", label: "실시간 클라우드 저장소 (모든 기기 참여 가능)" };
    } catch (e) {}

    return { db: LocalDB(), mode: "local", label: "이 브라우저의 탭끼리만 공유(테스트 모드)" };
  }

  root.connectStore = connectStore;
})(window);
