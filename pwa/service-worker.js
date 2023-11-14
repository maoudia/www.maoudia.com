import * as googleAnalytics from "workbox-google-analytics";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { cacheNames, clientsClaim, setCacheNameDetails } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { matchPrecache, precacheAndRoute } from "workbox-precaching";
import {
  registerRoute,
  setCatchHandler,
  setDefaultHandler,
} from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

const VERSION = 1.0;

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async function () {
      const userCacheNames = await caches.keys();
      await Promise.all(
        userCacheNames.map(async (cacheName) => {
          if (!Object.values(cacheNames).includes(cacheName)) {
            return await caches.delete(cacheName);
          }
          return await Promise.resolve();
        })
      );
    })()
  );
});

clientsClaim();

setCacheNameDetails({
  prefix: "maoudia",
  suffix: `v${VERSION}`,
  precache: "precache",
  runtime: "runtime",
  googleAnalytics: "ga",
});

googleAnalytics.initialize({
  parameterOverrides: {
    cd1: "offline",
  },
});

precacheAndRoute(self.__WB_MANIFEST);

setDefaultHandler(new StaleWhileRevalidate());

setCatchHandler(async ({ event }) => {
  switch (event.request.destination) {
    case "document":
      const offlinePage = "/offline/index.html";
      if (event.request.url.indexOf("/fr/") !== -1) {
        return matchPrecache(`/fr${offlinePage}`);
      }
      return matchPrecache(`${offlinePage}`);

    case "image":
      return matchPrecache(
        "/images/offline/image-not-found.svg"
      );

    default:
      return Response.error();
  }
});

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    networkTimeoutSeconds: 5,
    cacheName: `maoudia-pages-cache-v${VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  ({ request }) =>
    (request.destination === "style" && request.url.indexOf(".woff") === -1) ||
    request.destination === "script" ||
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: `maoudia-static-cache-v${VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: `maoudia-image-cache-v${VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 182 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ request }) =>
    (request.destination === "style" && request.url.indexOf(".woff") !== -1) ||
    request.destination === "font",
  new CacheFirst({
    cacheName: `maoudia-font-cache-v${VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ request }) =>
    request.url.startsWith(
      "https://github-readme-streak-stats.herokuapp.com"
    ) || request.url.startsWith("https://github-readme-stats.vercel.app")
      || request.url.startsWith("https://github-profile-trophy.vercel.app"),
  new StaleWhileRevalidate({
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  "https://giscus.app/client.js",
  new StaleWhileRevalidate({
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  "https://webmention.io",
  new StaleWhileRevalidate({
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
