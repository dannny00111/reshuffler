// Enhanced Background Processing Manager - Fixed Minimized Processing
class BackgroundProcessingManager {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.notificationPermission = 'default';
    this.isProcessingInBackground = false;
    this.processingCallbacks = new Map();
    this.keepAliveInterval = null;
    this.messageChannel = null;
    this.wakeLock = null;
    
    this.init();
  }

  async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');
        
        // Create message channel for reliable communication
        this.messageChannel = new MessageChannel();
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
        // Handle service worker updates
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
        });
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }

    // Request notification permission
    await this.requestNotificationPermission();
    
    // Enhanced visibility change handling
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Prevent page unload during processing
    window.addEventListener('beforeunload', (event) => {
      if (this.isProcessingInBackground) {
        event.preventDefault();
        event.returnValue = 'Video processing is still running. Are you sure you want to leave?';
        return event.returnValue;
      }
    });

    // Handle page focus/blur for better background management
    window.addEventListener('focus', () => {
      if (this.isProcessingInBackground) {
        console.log('📱 App focused during processing');
        this.optimizeForForeground();
      }
    });

    window.addEventListener('blur', () => {
      if (this.isProcessingInBackground) {
        console.log('📱 App blurred during processing');
        this.optimizeForBackground();
      }
    });
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', this.notificationPermission);
      
      if (this.notificationPermission === 'granted') {
        this.showWelcomeNotification();
      }
    }
  }

  showWelcomeNotification() {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.showNotification('🎬 AyoRecuts Ready', {
        body: 'Ultra-fast background processing enabled! Multitask while videos process.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'welcome',
        silent: true,
        actions: [
          {
            action: 'dismiss',
            title: 'Got it'
          }
        ]
      });
    }
  }

  async startBackgroundProcessing(videoFile, platform, optimizationLevel, callbacks) {
    this.isProcessingInBackground = true;
    this.processingCallbacks.set('current', callbacks);
    
    // Request wake lock to prevent sleep during processing
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('🔒 Wake lock acquired');
      }
    } catch (error) {
      console.log('⚠️ Wake lock not available:', error);
    }
    
    // Update page title to show processing status
    this.updatePageTitle(`⚡ AyoRecuts - Processing ${platform}...`);
    
    // Start aggressive keep-alive mechanisms
    this.startKeepAlive();
    
    // Register background sync with service worker
    if (this.serviceWorkerRegistration && 'sync' in this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.sync.register('video-processing');
        console.log('📡 Background sync registered');
      } catch (error) {
        console.log('⚠️ Background sync not available:', error);
      }
    }
    
    // Notify service worker about processing start
    this.sendToServiceWorker('REGISTER_PROCESSING', {
      platform,
      optimizationLevel,
      startTime: Date.now()
    });
    
    // Show initial notification
    this.sendToServiceWorker('PROCESSING_UPDATE', {
      step: 'Starting ultra-fast processing...',
      progress: 0,
      platform
    });

    console.log('🚀 Enhanced background processing started for', platform);
  }

  startKeepAlive() {
    // Multiple keep-alive strategies for maximum reliability
    
    // 1. Interval-based keep-alive (most important)
    this.keepAliveInterval = setInterval(() => {
      if (this.isProcessingInBackground) {
        console.log('💓 Keep-alive ping');
        
        // Send keep-alive to service worker
        this.sendToServiceWorker('KEEP_ALIVE', { timestamp: Date.now() });
        
        // Update page metadata to maintain activity
        document.title = `🎬 ${Math.floor(Math.random() * 100)}% - Processing...`;
        
        // Trigger micro-activity to prevent throttling
        this.triggerMicroActivity();
      }
    }, 15000); // Every 15 seconds
    
    // 2. Service worker timer
    this.sendToServiceWorker('START_BACKGROUND_TIMER', {});
    
    // 3. Visibility API handling
    if (document.hidden) {
      this.optimizeForBackground();
    }
  }

  triggerMicroActivity() {
    // Create minimal DOM activity to prevent tab throttling
    const hidden = document.createElement('div');
    hidden.style.display = 'none';
    hidden.textContent = Date.now().toString();
    document.body.appendChild(hidden);
    
    // Remove immediately to keep DOM clean
    setTimeout(() => {
      if (hidden.parentNode) {
        hidden.parentNode.removeChild(hidden);
      }
    }, 10);
  }

  optimizeForBackground() {
    console.log('📱 Optimizing for background processing');
    
    // Send message to service worker to maintain processing
    this.sendToServiceWorker('PROCESSING_UPDATE', {
      step: 'Processing continues in background...',
      progress: 50,
      platform: 'background'
    });
    
    // Reduce update frequency to conserve resources
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = setInterval(() => {
        if (this.isProcessingInBackground) {
          console.log('💓 Background keep-alive');
          this.sendToServiceWorker('KEEP_ALIVE', { timestamp: Date.now() });
        }
      }, 20000); // Slightly longer intervals in background
    }
  }

  optimizeForForeground() {
    console.log('📱 Optimizing for foreground processing');
    
    // Restore normal update frequency
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.startKeepAlive();
    }
  }

  updateProgress(step, progress, platform) {
    // Update page title with progress
    this.updatePageTitle(`🎬 ${Math.round(progress)}% - ${platform} video`);
    
    // Send progress to service worker for notifications
    this.sendToServiceWorker('PROCESSING_UPDATE', {
      step,
      progress: Math.round(progress),
      platform
    });

    // Update favicon with progress
    this.updateFavicon(progress);
    
    // Enhanced Dynamic Island update
    this.updateDynamicIslandStatus(step, progress, platform);
  }

  completeProcessing(data) {
    this.isProcessingInBackground = false;
    
    // Clear all keep-alive mechanisms
    this.stopKeepAlive();
    
    // Release wake lock
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
      console.log('🔓 Wake lock released');
    }
    
    // Reset page title
    this.updatePageTitle('✅ Video Ready - AyoRecuts');
    
    // Send completion notification
    this.sendToServiceWorker('PROCESSING_COMPLETE', data);
    
    // Reset favicon
    this.updateFavicon(100);
    
    // Focus window if user is away
    if (document.hidden) {
      window.focus();
    }

    console.log('✅ Enhanced background processing completed');
  }

  errorProcessing(error, platform) {
    this.isProcessingInBackground = false;
    
    // Clear all keep-alive mechanisms
    this.stopKeepAlive();
    
    // Release wake lock
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
    
    // Update page title
    this.updatePageTitle('❌ Processing Failed - AyoRecuts');
    
    // Send error notification
    this.sendToServiceWorker('PROCESSING_ERROR', {
      error: error.message || error,
      platform
    });
    
    // Reset favicon
    this.updateFavicon(0);

    console.error('❌ Enhanced background processing failed:', error);
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    
    // Stop service worker timer
    this.sendToServiceWorker('STOP_BACKGROUND_TIMER', {});
  }

  sendToServiceWorker(type, data) {
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type,
        data
      });
    }
  }

  updatePageTitle(title) {
    document.title = title;
  }

  updateFavicon(progress) {
    // Enhanced favicon with better progress indication
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 32, 32);
    
    if (progress > 0 && progress < 100) {
      // Draw progress circle
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(16, 16, 12, -Math.PI/2, (-Math.PI/2) + (2 * Math.PI * progress / 100));
      ctx.stroke();
      
      // Draw center dot
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw progress text
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(progress), 16, 20);
    } else if (progress === 100) {
      // Draw checkmark
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(14, 22);
      ctx.lineTo(24, 10);
      ctx.stroke();
    }
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  handleVisibilityChange() {
    if (document.hidden && this.isProcessingInBackground) {
      console.log('📱 App minimized, maintaining background processing...');
      this.optimizeForBackground();
      
      // Show notification that processing continues
      if (this.notificationPermission === 'granted') {
        this.sendToServiceWorker('PROCESSING_UPDATE', {
          step: 'Processing continues in background...',
          progress: 50,
          platform: 'background'
        });
      }
    } else if (!document.hidden && this.isProcessingInBackground) {
      console.log('📱 App restored, optimizing for foreground...');
      this.optimizeForForeground();
    }
  }

  handleServiceWorkerMessage(message) {
    const { type, action, data } = message;
    
    if (type === 'NOTIFICATION_ACTION') {
      const callbacks = this.processingCallbacks.get('current');
      
      switch (action) {
        case 'view':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'download':
          if (callbacks?.onDownload) {
            callbacks.onDownload();
          }
          break;
        case 'retry':
          if (callbacks?.onRetry) {
            callbacks.onRetry();
          }
          break;
      }
    } else if (type === 'BACKGROUND_KEEPALIVE') {
      // Respond to service worker keep-alive
      console.log('💓 Service worker keep-alive received');
    }
  }

  // Enhanced Dynamic Island support for iPhone
  supportsDynamicIsland() {
    return /iPhone/.test(navigator.userAgent) && 
           window.DeviceMotionEvent !== undefined &&
           window.screen.height >= 852; // iPhone 14 Pro and later
  }

  updateDynamicIslandStatus(step, progress, platform) {
    if (this.supportsDynamicIsland()) {
      // Enhanced Dynamic Island metadata
      const metaTags = {
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'apple-mobile-web-app-title': `${Math.round(progress)}% ${platform}`,
        'theme-color': progress < 100 ? '#8b5cf6' : '#10b981',
        'apple-mobile-web-app-capable': 'yes'
      };
      
      Object.entries(metaTags).forEach(([name, content]) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      });
      
      // Update title for Dynamic Island
      document.title = `🎬 ${Math.round(progress)}% - ${step}`;
    }
  }
}

export default BackgroundProcessingManager;