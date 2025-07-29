import { defineConfig } from 'serwist';

export default defineConfig({
  // Настройки для разработки
  mode: 'development',

  // Выходной файл Service Worker
  sw: 'public/sw.js',

  // Стратегии кэширования
  strategies: {
    // Кэш-первый для статических ресурсов
    cacheFirst: {
      cacheName: 'vibe-static-v1',
      match: [
        // CSS файлы
        ({ url }) => url.pathname.includes('/_next/static/css/'),
        ({ url }) => url.pathname.endsWith('.css'),
        // JavaScript файлы
        ({ url }) => url.pathname.includes('/_next/static/js/'),
        ({ url }) => url.pathname.includes('/_next/static/chunks/'),
        ({ url }) => url.pathname.endsWith('.js'),
        // Изображения
        ({ url }) => url.pathname.includes('/icons/'),
        ({ url }) => url.pathname.includes('/images/'),
        ({ url }) => /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname),
        // Иконки PWA
        ({ url }) => url.pathname.includes('/manifest.json'),
      ],
      options: {
        cacheName: 'vibe-static-v1',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
        },
      },
    },

    // Сеть-первый для API
    networkFirst: {
      cacheName: 'vibe-api-v1',
      match: [({ url }) => url.pathname.startsWith('/api/')],
      options: {
        cacheName: 'vibe-api-v1',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 день
        },
        networkTimeoutSeconds: 3,
      },
    },

    // Сеть-первый для страниц
    networkFirstPages: {
      cacheName: 'vibe-pages-v1',
      match: [
        ({ request }) => request.mode === 'navigate',
        ({ request }) => request.destination === 'document',
      ],
      options: {
        cacheName: 'vibe-pages-v1',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 1 день
        },
        networkTimeoutSeconds: 3,
      },
    },
  },

  // Предварительное кэширование
  precache: [
    '/',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon.svg',
  ],

  // Настройки для push-уведомлений
  push: {
    // Обработчик push-событий
    onPush: (event) => {
      if (event.data) {
        const data = event.data.json();
        const options = {
          body: data.body,
          icon: data.icon || '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: '1',
            url: data.url || '/',
          },
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/icons/icon-72x72.png',
            },
            {
              action: 'close',
              title: 'Close',
              icon: '/icons/icon-72x72.png',
            },
          ],
          requireInteraction: true,
          tag: 'vibe-notification',
        };

        event.waitUntil(self.registration.showNotification(data.title, options));
      }
    },

    // Обработчик кликов по уведомлениям
    onNotificationClick: (event) => {
      console.log('Notification click received.');

      event.notification.close();

      if (event.action === 'close') {
        return;
      }

      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          // Проверяем, открыто ли уже приложение
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }

          // Открываем новое окно, если приложение не открыто
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data?.url || '/');
          }
        }),
      );
    },
  },

  // Настройки для background sync
  backgroundSync: {
    onSync: (event) => {
      if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
      }
    },
  },
});

// Функция для background sync
async function doBackgroundSync() {
  try {
    console.log('Background sync triggered');
    // Добавьте здесь логику background sync
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
