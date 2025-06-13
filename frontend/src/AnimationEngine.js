import anime from 'animejs';

class AnimationEngine {
  constructor() {
    this.isInitialized = false;
    this.particleSystem = null;
    this.morphingBackground = null;
    this.activeAnimations = [];
  }

  // Initialize the animation engine
  init() {
    if (this.isInitialized) return;
    
    this.createParticleSystem();
    this.createMorphingBackground();
    this.setupScrollAnimations();
    this.setupHoverAnimations();
    
    this.isInitialized = true;
    console.log('🎨 Advanced Animation Engine Initialized');
  }

  // Create floating particle system
  createParticleSystem() {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: ${this.getRandomBrownColor()};
        border-radius: 50%;
        opacity: ${Math.random() * 0.6 + 0.2};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
        z-index: 1;
      `;
      document.body.appendChild(particle);
      particles.push(particle);
    }

    // Animate particles
    particles.forEach((particle, index) => {
      anime({
        targets: particle,
        translateX: () => Math.random() * 200 - 100,
        translateY: () => Math.random() * 200 - 100,
        scale: [0.5, 1.5, 0.5],
        opacity: [0.2, 0.8, 0.2],
        duration: 8000 + Math.random() * 4000,
        delay: index * 100,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });
    });

    this.particleSystem = particles;
  }

  // Create morphing geometric background
  createMorphingBackground() {
    const background = document.createElement('div');
    background.className = 'morphing-background';
    background.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    // Create morphing shapes
    for (let i = 0; i < 5; i++) {
      const shape = document.createElement('div');
      shape.style.cssText = `
        position: absolute;
        background: linear-gradient(45deg, 
          ${this.getRandomBrownColor(0.1)}, 
          ${this.getRandomBrownColor(0.2)});
        border-radius: 50%;
        filter: blur(2px);
      `;
      background.appendChild(shape);

      // Animate morphing shapes
      anime({
        targets: shape,
        width: [50, 200, 100],
        height: [50, 200, 100],
        left: ['10%', '80%', '20%'],
        top: ['20%', '70%', '30%'],
        borderRadius: ['50%', '20%', '50%'],
        duration: 15000 + Math.random() * 10000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutQuart'
      });
    }

    document.body.insertBefore(background, document.body.firstChild);
    this.morphingBackground = background;
  }

  // Setup scroll-based animations
  setupScrollAnimations() {
    const animateOnScroll = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(animateOnScroll, {
      threshold: 0.1
    });

    // Observe elements for scroll animations
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
    }, 1000);
  }

  // Setup advanced hover animations
  setupHoverAnimations() {
    // Button hover animations
    const setupButtonHover = (button) => {
      button.addEventListener('mouseenter', () => {
        anime({
          targets: button,
          scale: 1.05,
          rotateY: 5,
          boxShadow: '0 20px 40px rgba(139, 69, 19, 0.4)',
          duration: 300,
          easing: 'easeOutCubic'
        });

        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 215, 0, 0.6);
          transform: scale(0);
          animation: ripple 600ms linear;
          pointer-events: none;
        `;
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });

      button.addEventListener('mouseleave', () => {
        anime({
          targets: button,
          scale: 1,
          rotateY: 0,
          boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)',
          duration: 300,
          easing: 'easeOutCubic'
        });
      });
    };

    // Apply to all buttons
    setTimeout(() => {
      document.querySelectorAll('button, .btn').forEach(setupButtonHover);
    }, 1000);
  }

  // Animate individual elements
  animateElement(element) {
    const animations = [
      {
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
        easing: 'easeOutBack'
      },
      {
        rotateX: [90, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo'
      },
      {
        scale: [0, 1],
        rotate: [180, 0],
        opacity: [0, 1],
        duration: 700,
        easing: 'easeOutElastic(1, .8)'
      }
    ];

    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    anime({
      targets: element,
      ...randomAnimation
    });
  }

  // Text typing animation
  animateText(element, text, speed = 50) {
    element.textContent = '';
    const chars = text.split('');
    
    chars.forEach((char, index) => {
      setTimeout(() => {
        element.textContent += char;
        
        // Add glitch effect occasionally
        if (Math.random() < 0.1) {
          element.style.textShadow = '2px 0 #D2B48C, -2px 0 #8B4513';
          setTimeout(() => {
            element.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.6)';
          }, 50);
        }
      }, index * speed);
    });
  }

  // Progress bar liquid animation
  animateProgressBar(element, progress) {
    anime({
      targets: element,
      width: `${progress}%`,
      duration: 1000,
      easing: 'easeOutCubic',
      update: () => {
        // Add liquid effect
        element.style.background = `
          linear-gradient(90deg, 
            #D2B48C 0%, 
            #FFD700 50%, 
            #8B4513 100%)
        `;
        element.style.backgroundSize = '200% 100%';
        
        anime({
          targets: element,
          backgroundPosition: ['0% 0%', '100% 0%'],
          duration: 2000,
          loop: true,
          easing: 'linear'
        });
      }
    });
  }

  // Card flip animations
  animateCardFlip(card) {
    anime({
      targets: card,
      rotateY: [0, 180],
      duration: 600,
      easing: 'easeInOutQuart',
      complete: () => {
        anime({
          targets: card,
          rotateY: [180, 360],
          duration: 600,
          easing: 'easeInOutQuart'
        });
      }
    });
  }

  // Get random brown color variations
  getRandomBrownColor(opacity = 1) {
    const brownColors = [
      `rgba(210, 180, 140, ${opacity})`, // Tan
      `rgba(139, 69, 19, ${opacity})`,   // Saddle Brown
      `rgba(160, 82, 45, ${opacity})`,   // Sienna
      `rgba(205, 133, 63, ${opacity})`,  // Peru
      `rgba(222, 184, 135, ${opacity})`, // Burlywood
      `rgba(255, 215, 0, ${opacity})`,   // Gold
      `rgba(34, 139, 34, ${opacity})`    // Forest Green
    ];
    
    return brownColors[Math.floor(Math.random() * brownColors.length)];
  }

  // Stagger animations for lists
  staggerAnimation(elements, animationType = 'fadeInUp') {
    const animations = {
      fadeInUp: {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo'
      },
      slideInLeft: {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 700,
        easing: 'easeOutBack'
      },
      scaleIn: {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutBack'
      }
    };

    anime({
      targets: elements,
      ...animations[animationType],
      delay: anime.stagger(100)
    });
  }

  // Cleanup function
  destroy() {
    // Remove particles
    if (this.particleSystem) {
      this.particleSystem.forEach(particle => particle.remove());
    }
    
    // Remove morphing background
    if (this.morphingBackground) {
      this.morphingBackground.remove();
    }
    
    // Stop all active animations
    this.activeAnimations.forEach(animation => animation.pause());
    
    this.isInitialized = false;
  }

  // Loading screen animation
  createLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'advanced-loader';
    loader.innerHTML = `
      <div class="loader-scissors">✂️</div>
      <div class="loader-text">Ayo_ReCutz</div>
      <div class="loader-bar">
        <div class="loader-progress"></div>
      </div>
    `;
    
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #8B4513, #D2B48C);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(loader);
    
    // Animate loader
    anime({
      targets: '.loader-scissors',
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      duration: 2000,
      loop: true,
      easing: 'easeInOutSine'
    });
    
    anime({
      targets: '.loader-progress',
      width: ['0%', '100%'],
      duration: 3000,
      easing: 'easeInOutQuart',
      complete: () => {
        anime({
          targets: loader,
          opacity: [1, 0],
          duration: 500,
          complete: () => loader.remove()
        });
      }
    });
  }
}

export default AnimationEngine;