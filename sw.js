// 昭明工作台 · Service Worker（仅用于「添加到主屏幕」可安装 + 离线打开 app shell）
const CACHE = "longming-v39";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./supabase-config.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // 云端数据与第三方库不缓存，始终走网络（保证聊天实时）
  if (url.hostname.includes("supabase.co") || url.hostname.includes("jsdelivr.net")) {
    return;
  }
  // 页面导航：网络优先，离线再回退缓存（确保前端更新能即时生效）
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }
  // 其余静态资源：缓存优先
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
