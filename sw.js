// Service Worker for ResumeSmartBuild
// Provides offline functionality and performance caching

const CACHE_NAME = 'resumesmartbuild-v1.0';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/ats.html',
    '/premium.html',
    '/autocomplete_demo.html',
    '/styles/style.css',
    '/scripts/script.js',
    '/scripts/autocomplete.js',
    '/scripts/resumetemplates.js',
    '/scripts/articles.js',
    '/articles/index.html',
    '/privacy-policy.html',
    '/terms-of-service.html',
    '/cookie-policy.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/scrollreveal@4.0.9/dist/scrollreveal.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
        !event.request.url.startsWith('https://unpkg.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        // Don't cache non-GET requests or error responses
                        if (event.request.method !== 'GET' || !fetchResponse.ok) {
                            return fetchResponse;
                        }

                        // Clone the response for caching
                        const responseToCache = fetchResponse.clone();
                        
                        // Cache successful responses
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(error => {
                        console.log('Service Worker: Fetch failed', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/offline.html') || 
                                   new Response('Offline - Please check your connection', {
                                       status: 200,
                                       headers: { 'Content-Type': 'text/html' }
                                   });
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle offline form submissions
    try {
        const submissions = await getStoredSubmissions();
        for (const submission of submissions) {
            await submitForm(submission);
            await removeStoredSubmission(submission.id);
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Notification closed
    } else {
        // Default action
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper functions for offline storage
async function getStoredSubmissions() {
    // Implementation would use IndexedDB to store offline submissions
    return [];
}

async function submitForm(submission) {
    // Implementation would submit stored form data
    return fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(submission),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

async function removeStoredSubmission(id) {
    // Implementation would remove submitted data from storage
    return true;
}

console.log('Service Worker: Loaded');