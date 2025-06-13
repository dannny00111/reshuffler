// Advanced Animation and Haptics System for AyoRecuts
import * as anime from 'animejs';
import { gsap } from 'gsap';

class AyoAnimations {
  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.supportsHaptics = 'vibrate' in navigator;
    this.initGSAP();
  }

  initGSAP() {
    // Set GSAP defaults for smooth animations
    gsap.defaults({
      duration: 0.6,
      ease: "power2.out"
    });
  }

  // Haptic feedback system
  haptic(type = 'light') {
    if (!this.supportsHaptics || this.isReducedMotion) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [100, 50, 100],
      selection: [5],
      impact: [25],
      notification: [10, 50, 10, 50, 10]
    };
    
    navigator.vibrate(patterns[type] || patterns.light);
  }

  // Glassmorphism element creation
  createGlassCard(element, options = {}) {
    const defaults = {
      blur: 'blur(16px)',
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
      shadow: '0 8px 32px 0 rgba(139, 90, 60, 0.37)'
    };
    
    const config = { ...defaults, ...options };
    
    gsap.set(element, {
      backdropFilter: config.blur,
      background: config.background,
      border: config.border,
      boxShadow: config.shadow,
      borderRadius: '16px'
    });
  }

  // Floating animation for hero elements
  floatingAnimation(element, options = {}) {
    if (this.isReducedMotion) return;
    
    const defaults = {
      y: 20,
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    };
    
    const config = { ...defaults, ...options };
    
    return gsap.to(element, config);
  }

  // Shimmer loading effect
  shimmerEffect(element) {
    if (this.isReducedMotion) return;
    
    // Create shimmer overlay
    const shimmer = document.createElement('div');
    shimmer.className = 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer overflow-hidden';
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(shimmer);
    
    return shimmer;
  }

  // Magnetic hover effect
  magneticHover(element, strength = 0.3) {
    if (this.isReducedMotion) return;
    
    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale: 1 + strength * 0.1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  }

  // Stagger animation for lists
  staggerIn(elements, options = {}) {
    if (this.isReducedMotion) {
      gsap.set(elements, { opacity: 1, y: 0 });
      return;
    }
    
    const defaults = {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    };
    
    const config = { ...defaults, ...options };
    
    gsap.fromTo(elements, 
      { opacity: 0, y: config.y },
      { 
        opacity: 1, 
        y: 0, 
        duration: config.duration,
        stagger: config.stagger,
        ease: config.ease
      }
    );
  }

  // Morphing button animation
  morphButton(button, newText, callback) {
    if (this.isReducedMotion) {
      button.textContent = newText;
      if (callback) callback();
      return;
    }
    
    const tl = gsap.timeline();
    
    tl.to(button, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(button, {
      rotationY: 90,
      duration: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        button.textContent = newText;
        this.haptic('selection');
      }
    })
    .to(button, {
      rotationY: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
      onComplete: callback
    });
    
    return tl;
  }

  // Progress circle animation
  animateProgress(element, percentage, options = {}) {
    const defaults = {
      duration: 1.5,
      ease: "power2.out",
      onUpdate: null
    };
    
    const config = { ...defaults, ...options };
    
    return gsap.to({ value: 0 }, {
      value: percentage,
      duration: config.duration,
      ease: config.ease,
      onUpdate: function() {
        const currentValue = Math.round(this.targets()[0].value);
        element.style.setProperty('--progress', `${currentValue}%`);
        if (config.onUpdate) config.onUpdate(currentValue);
      }
    });
  }

  // Pulsing glow effect
  pulseGlow(element, color = 'rgba(245, 158, 11, 0.6)') {
    if (this.isReducedMotion) return;
    
    return gsap.to(element, {
      boxShadow: `0 0 30px ${color}`,
      duration: 1.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
  }

  // Text reveal animation
  textReveal(element, options = {}) {
    if (this.isReducedMotion) {
      element.style.opacity = '1';
      return;
    }
    
    const defaults = {
      duration: 0.8,
      ease: "power2.out",
      delay: 0
    };
    
    const config = { ...defaults, ...options };
    
    // Split text into words
    const words = element.textContent.split(' ');
    element.innerHTML = words.map(word => 
      `<span class="inline-block overflow-hidden">
        <span class="inline-block transform translate-y-full">${word}</span>
      </span>`
    ).join(' ');
    
    const wordElements = element.querySelectorAll('span span');
    
    return gsap.to(wordElements, {
      y: 0,
      duration: config.duration,
      ease: config.ease,
      stagger: 0.05,
      delay: config.delay
    });
  }

  // Particle explosion effect
  createParticleExplosion(x, y, options = {}) {
    if (this.isReducedMotion) return;
    
    const defaults = {
      count: 20,
      colors: ['#f59e0b', '#ac7e5a', '#4ade80', '#a69176'],
      size: { min: 2, max: 6 },
      duration: 1.5
    };
    
    const config = { ...defaults, ...options };
    
    for (let i = 0; i < config.count; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: ${Math.random() * (config.size.max - config.size.min) + config.size.min}px;
        height: ${Math.random() * (config.size.max - config.size.min) + config.size.min}px;
        background: ${config.colors[Math.floor(Math.random() * config.colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${x}px;
        top: ${y}px;
      `;
      
      document.body.appendChild(particle);
      
      const angle = (Math.PI * 2 * i) / config.count;
      const velocity = Math.random() * 100 + 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      gsap.to(particle, {
        x: vx,
        y: vy,
        opacity: 0,
        scale: 0,
        duration: config.duration,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
    }
  }

  // Liquid button hover effect
  liquidHover(button) {
    if (this.isReducedMotion) return;
    
    const liquid = document.createElement('div');
    liquid.className = 'absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 rounded-lg';
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(liquid);
    
    button.addEventListener('mouseenter', () => {
      gsap.to(liquid, {
        opacity: 0.2,
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
      });
      this.haptic('selection');
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(liquid, {
        opacity: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  }

  // Screen shake effect
  screenShake(intensity = 10, duration = 0.5) {
    if (this.isReducedMotion) return;
    
    const tl = gsap.timeline();
    
    for (let i = 0; i < 10; i++) {
      tl.to(document.body, {
        x: Math.random() * intensity - intensity / 2,
        y: Math.random() * intensity - intensity / 2,
        duration: duration / 10,
        ease: "power2.inOut"
      });
    }
    
    tl.to(document.body, {
      x: 0,
      y: 0,
      duration: 0.1,
      ease: "power2.out"
    });
    
    this.haptic('impact');
    return tl;
  }

  // Breathing animation for loading states
  breathingAnimation(element) {
    if (this.isReducedMotion) return;
    
    return gsap.to(element, {
      scale: 1.05,
      opacity: 0.8,
      duration: 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
  }

  // Cleanup method
  cleanup() {
    gsap.killTweensOf("*");
    anime.remove("*");
  }
}

export default AyoAnimations;