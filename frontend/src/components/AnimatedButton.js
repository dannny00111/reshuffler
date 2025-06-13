import React, { useEffect, useRef, useState } from 'react';
import AyoAnimations from '../AyoAnimations';

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  haptic = true,
  className = '',
  ...props 
}) => {
  const buttonRef = useRef(null);
  const animationsRef = useRef(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    animationsRef.current = new AyoAnimations();
    const button = buttonRef.current;
    
    if (button) {
      // Add magnetic hover effect
      animationsRef.current.magneticHover(button, 0.15);
      
      // Add liquid hover effect
      animationsRef.current.liquidHover(button);
    }
    
    return () => {
      if (animationsRef.current) {
        animationsRef.current.cleanup();
      }
    };
  }, []);

  const handleClick = (e) => {
    if (loading) return;
    
    setIsPressed(true);
    
    // Haptic feedback
    if (haptic && animationsRef.current) {
      animationsRef.current.haptic('selection');
    }
    
    // Create particle explosion at click point
    if (animationsRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      animationsRef.current.createParticleExplosion(x, y, { count: 8 });
    }
    
    // Call the original onClick
    if (onClick) {
      onClick(e);
    }
    
    setTimeout(() => setIsPressed(false), 150);
  };

  const variantClasses = {
    primary: 'btn-primary text-white font-semibold',
    secondary: 'btn-secondary text-white font-semibold',
    accent: 'btn-accent text-white font-semibold',
    ghost: 'bg-transparent border border-primary-300 text-primary-600 hover:bg-primary-50'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={loading}
      className={`
        relative overflow-hidden rounded-xl
        transform transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="spinner w-5 h-5" />
        </div>
      )}
      
      {/* Button content */}
      <span className={`relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {/* Ripple effect */}
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full animate-shimmer" />
      </span>
    </button>
  );
};

export default AnimatedButton;