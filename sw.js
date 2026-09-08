/* 오프라인 캐시. 데이터나 사진을 바꾸면 아래 VERSION 숫자를 올리세요. */
const VERSION = "osaka-v15";

const CORE = [
  "./", "./index.html", "./data.js", "./manifest.json",
  "./icon-180.png", "./icon-512.png"
];

/* 초기 목록 사진 — 첫 실행 때 앱이 받아 폰 안에 저장하지만,
   설정 > 초기 목록 복원을 오프라인에서 눌러도 되도록 함께 캐시해 둡니다. */
const SEED_IMAGES = [
  "./img/biore-clay.jpg",
  "./img/attack-zero.jpg",
  "./img/tsururi.jpg",
  "./img/merit-dry.jpg",
  "./img/gaban-pepper.jpg",
  "./img/center-in.jpg",
  "./img/clean-dental.jpg",
  "./img/wonjungyo-pack.jpg",
  "./img/ora2-me.jpg",
  "./img/arinamin-night.jpg",
  "./img/kyoleopin.jpg",
  "./img/breath-care.jpg",
  "./img/yunker.jpg",
  "./img/meme-tear.jpg",
  "./img/smile-whiteye.jpg",
  "./img/digi-eye.jpg",
  "./img/sarasaty.jpg",
  "./img/shamoji.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) =>
        /* CORE는 하나라도 실패하면 설치를 중단, 사진은 실패해도 넘어갑니다 */
        c.addAll(CORE).then(() =>
          Promise.all(SEED_IMAGES.map((u) => c.add(u).catch(() => null)))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
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
