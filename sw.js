// 昭明工作台 · Service Worker（仅用于「添加到主屏幕」可安装 + 离线打开 app shell）
const CACHE = "longming-v93";
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
    e.respondWith(fetch(e.request,{cache:"no-store"}).catch(() => caches.match("./index.html")));
    return;
  }
  // 其余静态资源：缓存优先
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// ===== Push 通知 =====
self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data.json(); } catch (_) { data = { body: e.data ? e.data.text() : "" }; }
  const title = data.title || "拾光提醒";
  const options = {
    body: data.body || "去看看今天的打卡",
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { url: data.url || "https://chrysaliah.github.io/zhao-ming/" },
    tag: "sichen-reminder",
    requireInteraction: false,
    vibrate: [100, 50, 100]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = e.notification.data && e.notification.data.url || "https://chrysaliah.github.io/zhao-ming/";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const cl of clientList) {
        if (cl.url.includes("chrysaliah.github.io") && "focus" in cl) return cl.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
