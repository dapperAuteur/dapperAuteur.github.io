console.log(100);

var CACH_NAME = "my-site-cache-v1";
var urlsToCache = ["./assets/images/header.jpg"];

self.addEventListener("install", function(event) {
  // Perform install steps
  console.log("typeof event", typeof event);
  // console.log("self", self);
  event.waitUntil(
    caches.open(CACH_NAME).then(function(cache) {
      console.log("Opened cache");
      console.log("urlsToCache", urlsToCache);
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  console.log("event at the top of fetch", event);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      console.log("response");
      // Cache hit - return response
      if (response) {
        console.log("response in if statement", response);
        return response;
      }
      console.log("event b4 fetch(event.request)", event);
      return fetch(event.request, { credentials: "include" }).then(function(
        response
      ) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          console.log("response", response);
          return response;
        }
        /**
         * IMPORTANT: Clone the response. A response is a stream
         * and because we want the browser to consume the response
         * as well as the cache consuming the response, we need to clone it so we have two streams
         */

        var responseToCache = response.clone();

        caches.open(CACH_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener("activate", function(event) {
  var cacheWhitelist = ["pages-cache-v1", "blog-posts-cache-v1"];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
