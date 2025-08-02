const CACHE_NAME = 'sakhi-wellness-v3';
const STATIC_CACHE = 'sakhi-static-v3';
const DYNAMIC_CACHE = 'sakhi-dynamic-v3';
const RUNTIME_CACHE = 'sakhi-runtime-v3';

// Static assets that should always be cached
const staticAssets = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/app-icon.svg',
  '/icon-192.svg'
];

// Routes that should be cached
const cacheableRoutes = [
  '/',
  '/dashboard',
  '/signin',
  '/signup'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(staticAssets);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim()
    ])
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }

          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // Return offline page for navigation requests when offline
              return caches.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }

  // Handle API requests and assets
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses for assets
            if (response.status === 200 && (
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'font' ||
              request.destination === 'image' ||
              url.pathname.includes('.js') ||
              url.pathname.includes('.css') ||
              url.pathname.includes('.svg') ||
              url.pathname.includes('.png') ||
              url.pathname.includes('.jpg')
            )) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // For failed requests, try to serve a generic offline response
            if (request.destination === 'image') {
              return caches.match('/placeholder.svg');
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-wellness-data') {
    event.waitUntil(syncWellnessData());
  }
});

// Sync wellness data when back online
async function syncWellnessData() {
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      for (const data of offlineData) {
        await syncDataToServer(data);
      }
      await clearOfflineData();
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // Implementation would use IndexedDB to get stored offline data
  return [];
}

// Sync data to server
async function syncDataToServer(data) {
  // Implementation would send data to server
  return Promise.resolve();
}

// Clear offline data after successful sync
async function clearOfflineData() {
  // Implementation would clear IndexedDB offline data
  return Promise.resolve();
}

// Push notifications for medicine reminders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your medicine reminder!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'taken',
        title: 'Taken',
        icon: '/placeholder.svg'
      },
      {
        action: 'snooze',
        title: 'Snooze 10min',
        icon: '/placeholder.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sakhi - Medicine Reminder', options)
  );
});

// Handle notification actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'taken') {
    // Handle medicine taken
    event.waitUntil(
      clients.openWindow('/?reminder=taken')
    );
  } else if (event.action === 'snooze') {
    // Schedule another notification in 10 minutes
    event.waitUntil(
      scheduleReminder(10 * 60 * 1000) // 10 minutes
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Schedule medicine reminder
async function scheduleReminder(delay) {
  // Implementation would schedule another notification
  setTimeout(() => {
    self.registration.showNotification('Sakhi - Medicine Reminder (Snoozed)', {
      body: 'Don\'t forget your medicine!',
      icon: '/placeholder.svg',
      vibrate: [100, 50, 100]
    });
  }, delay);
}
