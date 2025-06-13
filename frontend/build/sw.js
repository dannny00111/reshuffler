/* eslint-env serviceworker */
/* global clients, self */

// Enhanced Service Worker for AyoRecuts - Better Background Processing
const CACHE_NAME = 'ayorecuts-v1';

self.addEventListener('install', (event) => {
  console.log('AyoRecuts Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('AyoRecuts Service Worker activated');
  event.waitUntil(clients.claim());
});

// Background Sync for video processing continuation
self.addEventListener('sync', (event) => {
  if (event.tag === 'video-processing') {
    console.log('AyoRecuts: Background sync triggered');
    event.waitUntil(handleBackgroundProcessing());
  }
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
    case 'KEEP_ALIVE':
      // Respond to keep-alive pings to prevent throttling
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ status: 'alive', timestamp: Date.now() });
      }
      break;
    case 'REGISTER_PROCESSING':
      // Register background sync for processing
      event.waitUntil(
        self.registration.sync.register('video-processing')
          .then(() => console.log('AyoRecuts: Background sync registered'))
          .catch(err => console.log('AyoRecuts: Background sync registration failed:', err))
      );
      break;
  }
});

function handleProcessingUpdate(data) {
  const { step, progress, platform } = data;
  
  // More frequent updates for better UX
  if (progress % 10 === 0 || progress >= 90 || progress === 0) {
    self.registration.showNotification(`🎬 AyoRecuts - ${progress}%`, {
      body: `${step} - ${platform} video`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'video-processing',
      renotify: true,
      silent: progress < 100,
      data: {
        type: 'processing_update',
        progress,
        platform,
        step
      },
      actions: [
        {
          action: 'view',
          title: '👀 View Progress'
        }
      ]
    });
  }
}

function handleProcessingComplete(data) {
  const { platform, algorithmScore, duration } = data;
  
  // Clear processing notification first
  self.registration.getNotifications({ tag: 'video-processing' })
    .then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  
  // Show completion notification with vibration pattern
  self.registration.showNotification('✅ AyoRecuts Complete!', {
    body: `${platform} video ready! Score: ${algorithmScore}/100 🚀`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'video-complete',
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200], // Success vibration pattern
    actions: [
      {
        action: 'download',
        title: '📥 Download Now'
      },
      {
        action: 'view',
        title: '👀 View Results'
      }
    ],
    data: {
      type: 'processing_complete',
      platform,
      algorithmScore,
      duration
    }
  });
}

function handleProcessingError(data) {
  const { error, platform } = data;
  
  // Clear processing notification
  self.registration.getNotifications({ tag: 'video-processing' })
    .then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  
  self.registration.showNotification('❌ AyoRecuts Failed', {
    body: `${platform} processing failed. Tap to retry.`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'video-error',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300], // Error vibration pattern
    actions: [
      {
        action: 'retry',
        title: '🔄 Retry Processing'
      },
      {
        action: 'view',
        title: '👀 View Error'
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
  
  // Always focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        client.focus();
        
        // Send action to main thread
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: action || 'view',
          data
        });
      } else {
        // Open new window if no clients exist
        clients.openWindow('/');
      }
    })
  );
});

// Keep processing alive during background
async function handleBackgroundProcessing() {
  console.log('AyoRecuts: Handling background processing keepalive');
  
  // Send keep-alive signals to all clients
  const clientList = await clients.matchAll();
  clientList.forEach(client => {
    client.postMessage({
      type: 'BACKGROUND_KEEPALIVE',
      timestamp: Date.now()
    });
  });
  
  // Schedule next keepalive
  setTimeout(() => {
    self.registration.sync.register('video-processing').catch(() => {});
  }, 30000); // Every 30 seconds
}

// Periodic background processing maintenance
let backgroundTimer = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'START_BACKGROUND_TIMER') {
    if (backgroundTimer) clearInterval(backgroundTimer);
    
    backgroundTimer = setInterval(() => {
      console.log('AyoRecuts: Background processing heartbeat');
      handleBackgroundProcessing();
    }, 25000); // Every 25 seconds to stay under browser limits
  }
  
  if (event.data.type === 'STOP_BACKGROUND_TIMER') {
    if (backgroundTimer) {
      clearInterval(backgroundTimer);
      backgroundTimer = null;
    }
  }
});