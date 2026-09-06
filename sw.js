/* 오프라인 캐시. 데이터나 사진을 바꾸면 아래 VERSION 숫자를 올리세요. */
const VERSION = "osaka-v2";
const CORE = ["./", "./index.html", "./data.js", "./manifest.json", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 페이지가 보내온 사진 목록을 미리 통째로 받아둡니다 (온라인일 때 1회). */
self.addEventListener("message", (e) => {
  const list = e.data && e.data.precache;
  if (!Array.isArray(list) || !list.length) return;
  e.waitUntil(
    caches.open(VERSION).then((c) =>
      Promise.all(list.map((u) => c.match(u).then((hit) => (hit ? null : c.add(u).catch(() => null)))))
    )
  );
});

/* 캐시 우선 — 없으면 네트워크에서 받아 캐시에 넣음 */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match("./index.html"))
    )
  );
});
