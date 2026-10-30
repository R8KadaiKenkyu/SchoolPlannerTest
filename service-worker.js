const CACHE_NAME = "school-planner-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./js/storage.js",
  "./js/data.js",
  "./js/timetable.js",
  "./js/calendar.js",
  "./js/home.js",
  "./js/guide.js",
  "./js/settings.js",
  "./js/memo.js",
  "./js/app.js"
];

// インストール時にアプリのファイルをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// 古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) =>
              key.startsWith("school-planner-") &&
              key !== CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// オフライン時はキャッシュを利用
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 外部サイトへの通信はそのままにする
  if (url.origin !== self.location.origin) return;

  // ページを開くときは、通信を優先して失敗時にキャッシュを利用
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request)
          ) || (
            await caches.match("./index.html")
          );
        })
    );
    return;
  }

  // CSS・JavaScript・画像などはキャッシュを優先
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
  );
});
