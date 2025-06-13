/* eslint-env serviceworker */
/* global clients, self */

// Service Worker for background notifications
const CACHE_NAME = 'viral-reshuffler-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'PROCESSING_UPDATE':
      handleProcessingUpdate(data);
      break;
    case 'PROCESSING_COMPLETE':
      handleProcessingComplete(data);
      break;
    case 'PROCESSING_ERROR':
      handleProcessingError(data);
      break;
  }
});

function handleProcessingUpdate(data) {
  const { step, progress, platform } = data;
  
  // Show notification for major progress updates
  if (progress % 25 === 0 || progress >= 90) {
    self.registration.showNotification('🎬 Video Processing', {
      body: `${step} - ${progress}% complete`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'video-processing',
      renotify: true,
      silent: false,
      actions: [
        {
          action: 'view',
          title: 'View Progress'
        }
      ],
      data: {
        type: 'processing_update',
        progress,
        platform
      }
    });
  }
}

function handleProcessingComplete(data) {
  const { platform, algorithmScore, duration } = data;
  
  self.registration.showNotification('✅ Video Ready!', {
    body: `Your ${platform} video is processed! Algorithm score: ${algorithmScore}/100`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'video-complete',
    requireInteraction: true,
    actions: [
      {
        action: 'download',
        title: 'Download Video'
      },
      {
        action: 'view',
        title: 'View Results'
      }
    ],
    data: {
      type: 'processing_complete',
      platform,
      algorithmScore
    }
  });
}

function handleProcessingError(data) {
  const { error, platform } = data;
  
  self.registration.showNotification('❌ Processing Failed', {
    body: `Video processing failed: ${error}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'video-error',
    requireInteraction: true,
    actions: [
      {
        action: 'retry',
        title: 'Retry'
      },
      {
        action: 'view',
        title: 'View Error'
      }
    ],
    data: {
      type: 'processing_error',
      error,
      platform
    }
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const { action, data } = event.notification;
  
  event.notification.close();
  
  switch (action) {
    case 'view':
    case 'download':
    case 'retry':
      // Focus or open the app window
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          if (clientList.length > 0) {
            const client = clientList[0];
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_ACTION',
              action,
              data
            });
          } else {
            clients.openWindow('/');
          }
        })
      );
      break;
  }
});