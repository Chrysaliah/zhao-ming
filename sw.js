/* 拾光 Service Worker —— network-first，导航请求永远走网络，杜绝旧 HTML 缓存导致闪屏卡死 */
const CACHE = 'zhao-ming-v2';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(req.mode === 'navigate'){
    /* 页面本身永远拿网络最新版；网络失败才回退缓存 */
    e.respondWith(fetch(req).catch(function(){ return caches.match(req); }));
    return;
  }
  /* 静态资源：网络优先，成功则更新缓存，失败回退缓存 */
  e.respondWith(
    fetch(req).then(function(r){
      var c = r.clone();
      caches.open(CACHE).then(function(ca){ ca.put(req, c); });
      return r;
    }).catch(function(){ return caches.match(req); })
  );
});
