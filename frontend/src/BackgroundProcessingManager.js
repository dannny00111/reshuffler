// Background Processing Manager
class BackgroundProcessingManager {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.notificationPermission = 'default';
    this.isProcessingInBackground = false;
    this.processingCallbacks = new Map();
    
    this.init();
  }

  async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }

    // Request notification permission
    await this.requestNotificationPermission();
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Listen for beforeunload to warn about ongoing processing
    window.addEventListener('beforeunload', (event) => {
      if (this.isProcessingInBackground) {
        event.preventDefault();
        event.returnValue = 'Video processing is still running. Are you sure you want to leave?';
        return event.returnValue;
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
      this.serviceWorkerRegistration.showNotification('🎬 Viral Reshuffler Ready', {
        body: 'Background processing enabled! You can multitask while videos process.',
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

  startBackgroundProcessing(videoFile, platform, optimizationLevel, callbacks) {
    this.isProcessingInBackground = true;
    this.processingCallbacks.set('current', callbacks);
    
    // Update page title to show processing status
    this.updatePageTitle(`⚡ AyoRecuts - Processing ${platform}...`);
    
    // Show initial notification
    this.sendNotification('PROCESSING_UPDATE', {
      step: 'Starting ultra-fast processing...',
      progress: 0,
      platform
    });

    console.log('🚀 Background processing started for', platform);
    
    // Keep page alive during processing
    if (typeof window !== 'undefined') {
      this.keepAlive = setInterval(() => {
        // Ping to keep background processing active
        console.log('📱 Background processing active...');
      }, 5000);
    }
  }

  updateProgress(step, progress, platform) {
    // Update page title with progress
    this.updatePageTitle(`🎬 ${Math.round(progress)}% - ${platform} video`);
    
    // Send progress to service worker for notifications
    this.sendNotification('PROCESSING_UPDATE', {
      step,
      progress: Math.round(progress),
      platform
    });

    // Update favicon with progress (simple indicator)
    this.updateFavicon(progress);
  }

  completeProcessing(data) {
    this.isProcessingInBackground = false;
    
    // Clear keep alive
    if (this.keepAlive) {
      clearInterval(this.keepAlive);
      this.keepAlive = null;
    }
    
    // Reset page title
    this.updatePageTitle('✅ Video Ready - AyoRecuts');
    
    // Send completion notification
    this.sendNotification('PROCESSING_COMPLETE', data);
    
    // Reset favicon
    this.updateFavicon(100);
    
    // Focus window if user is away
    if (document.hidden) {
      window.focus();
    }

    console.log('✅ Background processing completed');
  }

  errorProcessing(error, platform) {
    this.isProcessingInBackground = false;
    
    // Clear keep alive
    if (this.keepAlive) {
      clearInterval(this.keepAlive);
      this.keepAlive = null;
    }
    
    // Update page title
    this.updatePageTitle('❌ Processing Failed - AyoRecuts');
    
    // Send error notification
    this.sendNotification('PROCESSING_ERROR', {
      error: error.message || error,
      platform
    });
    
    // Reset favicon
    this.updateFavicon(0);

    console.error('❌ Background processing failed:', error);
  }

  sendNotification(type, data) {
    if (this.serviceWorkerRegistration && this.notificationPermission === 'granted') {
      this.serviceWorkerRegistration.active?.postMessage({
        type,
        data
      });
    }
  }

  updatePageTitle(title) {
    document.title = title;
  }

  updateFavicon(progress) {
    // Create a simple progress indicator in favicon
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 32, 32);
    
    if (progress > 0 && progress < 100) {
      // Draw progress circle
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, 16, 12, -Math.PI/2, (-Math.PI/2) + (2 * Math.PI * progress / 100));
      ctx.stroke();
      
      // Draw center dot
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else if (progress === 100) {
      // Draw checkmark
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
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
      console.log('📱 App moved to background, processing continues...');
      
      // Show notification that processing continues
      if (this.notificationPermission === 'granted') {
        this.sendNotification('PROCESSING_UPDATE', {
          step: 'Processing continues in background...',
          progress: 50, // Approximate progress
          platform: 'current'
        });
      }
    } else if (!document.hidden && this.isProcessingInBackground) {
      console.log('📱 App returned to foreground');
    }
  }

  handleServiceWorkerMessage(message) {
    const { type, action, data } = message;
    
    if (type === 'NOTIFICATION_ACTION') {
      const callbacks = this.processingCallbacks.get('current');
      
      switch (action) {
        case 'view':
          // Scroll to results or show current progress
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
    }
  }

  // Check if device supports Dynamic Island (iOS 16+)
  supportsDynamicIsland() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent) && 
           window.DeviceMotionEvent !== undefined;
  }

  // Enhanced status for Dynamic Island
  updateDynamicIslandStatus(step, progress, platform) {
    if (this.supportsDynamicIsland()) {
      // Update page metadata for iOS Dynamic Island
      const metaTags = {
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'apple-mobile-web-app-title': `${Math.round(progress)}% ${platform}`,
        'theme-color': progress < 100 ? '#8b5cf6' : '#10b981'
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
    }
  }
}

export default BackgroundProcessingManager;