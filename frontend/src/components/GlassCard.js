import React, { useEffect, useRef } from 'react';
import AyoAnimations from '../AyoAnimations';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false,
  animate = true,
  ...props 
}) => {
  const cardRef = useRef(null);
  const animationsRef = useRef(null);

  useEffect(() => {
    if (!animate) return;
    
    animationsRef.current = new AyoAnimations();
    const card = cardRef.current;
    
    if (card) {
      // Apply glassmorphism
      animationsRef.current.createGlassCard(card);
      
      // Add hover effects
      if (hover) {
        animationsRef.current.magneticHover(card, 0.1);
      }
      
      // Add glow effect
      if (glow) {
        animationsRef.current.pulseGlow(card);
      }
      
      // Entrance animation
      animationsRef.current.staggerIn([card], { delay: 0.2 });
    }
    
    return () => {
      if (animationsRef.current) {
        animationsRef.current.cleanup();
      }
    };
  }, [animate, hover, glow]);

  return (
    <div
      ref={cardRef}
      className={`glass relative overflow-hidden rounded-2xl p-6 ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {/* Liquid background effect */}
      {hover && <div className="liquid-bg" />}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shimmer effect overlay */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      )}
    </div>
  );
};

export default GlassCard;