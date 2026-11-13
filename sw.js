// Service worker: guarda la app para poder jugar sin internet.

const CACHE_APP = 'powerpick-app';
const CACHE_FOTOS = 'powerpick-fotos';

const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/estilos.css',
  'js/datos.js',
  'js/carta.js',
  'js/masmenos.js',
  'js/draft.js',
  'js/tarjeta.js',
  'js/app.js',
  'data/heroes.json',
  'icons/icono.svg',
  'icons/icono-192.png',
  'icons/icono-512.png',
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(CACHE_APP).then(cache => cache.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', evento => {
  evento.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evento => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);

  // Fotos de personajes: una vez vistas, se sirven siempre desde la caché.
  if (url.hostname === 'cdn.jsdelivr.net') {
    evento.respondWith(caches.open(CACHE_FOTOS).then(async cache => {
      const guardada = await cache.match(peticion);
      if (guardada) return guardada;
      const respuesta = await fetch(peticion);
      if (respuesta.ok) cache.put(peticion, respuesta.clone());
      return respuesta;
    }));
    return;
  }

  // Archivos de la app: se responde al momento con lo guardado y, si hay
  // internet, se actualiza la copia para la próxima visita.
  if (url.origin === self.location.origin) {
    evento.respondWith(caches.open(CACHE_APP).then(async cache => {
      const guardada = await cache.match(peticion);
      const deLaRed = fetch(peticion).then(respuesta => {
        if (respuesta.ok) cache.put(peticion, respuesta.clone());
        return respuesta;
      });
      if (!guardada) return deLaRed;
      evento.waitUntil(deLaRed.catch(() => {}));
      return guardada;
    }));
  }
});
