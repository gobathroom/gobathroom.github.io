const CACHE_NAME = "gobathroom-v32";

// pon aquí los archivos que siempre quieres que carguen
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/style.css",
  "/js/script.js",
  "/assets/svg/logo-pin.svg"
  // agrega más si tienes (por ejemplo tu background)
  // "/background.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // si está en cache lo da, si no, va a la red
      return response || fetch(event.request);
    })
  );
});
