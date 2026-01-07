'use client';

import { useEffect } from 'react';

export default function CursorEffect() {
  useEffect(() => {
    // Don't run on touch devices
    if ('ontouchstart' in window) {
      return;
    }

    // Detect pixel ratio for retina displays
    const pixelRatio = window.devicePixelRatio || 1;
    const isRetina = pixelRatio > 1;

    // Scale factor for retina displays
    const scaleFactor = isRetina ? pixelRatio * 0.6 : 1; // Adjust multiplier as needed

    let mouseX: number = 0;
    let mouseY: number = 0;
    let particles: HTMLDivElement[] = [];

    // Fire-like layered color variations with mauveine palette
    const colorVariations = [
      // Hot core - brightest (like fire center)
      {
        gradient: `radial-gradient(circle, 
          rgba(228, 87, 251, 0.5) 0%,
          rgba(197, 23, 219, 0.3) 20%,
          rgba(145, 14, 162, 0.15) 50%,
          transparent 100%
        )`,
        brightness: 0.7,
      },
      // Mid-bright layer
      {
        gradient: `radial-gradient(circle, 
          rgba(197, 23, 219, 0.6) 0%,
          rgba(145, 14, 162, 0.4) 30%,
          rgba(119, 9, 133, 0.2) 60%,
          transparent 100%
        )`,
        brightness: 0.6,
      },
      // Medium purple layer
      {
        gradient: `radial-gradient(circle, 
          rgba(145, 14, 162, 0.7) 0%,
          rgba(119, 9, 133, 0.5) 25%,
          rgba(94, 6, 105, 0.25) 55%,
          transparent 100%
        )`,
        brightness: 0.55,
      },
      // Deep purple layer
      {
        gradient: `radial-gradient(circle, 
          rgba(119, 9, 133, 0.8) 0%,
          rgba(94, 6, 105, 0.6) 30%,
          rgba(66, 3, 75, 0.3) 60%,
          transparent 100%
        )`,
        brightness: 0.5,
      },
      // Dark layer (like outer fire)
      {
        gradient: `radial-gradient(circle, 
          rgba(94, 6, 105, 0.9) 0%,
          rgba(66, 3, 75, 0.7) 35%,
          rgba(43, 1, 50, 0.4) 65%,
          transparent 100%
        )`,
        brightness: 0.45,
      },
      // Very dark layer
      {
        gradient: `radial-gradient(circle, 
          rgba(66, 3, 75, 0.95) 0%,
          rgba(43, 1, 50, 0.8) 30%,
          rgba(31, 1, 36, 0.5) 60%,
          transparent 100%
        )`,
        brightness: 0.4,
      },
      // Almost black edge layer
      {
        gradient: `radial-gradient(circle, 
          rgba(43, 1, 50, 1) 0%,
          rgba(31, 1, 36, 0.9) 25%,
          rgba(31, 1, 36, 0.6) 55%,
          transparent 100%
        )`,
        brightness: 0.35,
      },
      // Mixed gradient (transition layer)
      {
        gradient: `radial-gradient(circle, 
          rgba(197, 23, 219, 0.4) 0%,
          rgba(94, 6, 105, 0.5) 40%,
          rgba(43, 1, 50, 0.3) 70%,
          transparent 100%
        )`,
        brightness: 0.5,
      },
    ];

    const createParticle = (x: number, y: number): void => {
      const particle: HTMLDivElement = document.createElement('div');

      // Wild size variation for non-uniform look, scaled for retina
      const baseWidth = 120 * scaleFactor;
      const baseHeight = 60 * scaleFactor;
      const sizeVariation = 0.4 + Math.random() * 1.2; // 0.4 to 1.6 (huge range)
      const width = baseWidth * sizeVariation;
      const height = baseHeight * sizeVariation;

      // Pick random color from palette
      const colorScheme = colorVariations[Math.floor(Math.random() * colorVariations.length)];

      // Random position offset for layered effect, scaled for retina
      const offsetX = (Math.random() - 0.5) * 30 * scaleFactor;
      const offsetY = (Math.random() - 0.5) * 30 * scaleFactor;

      // Styling inline for smooth circular gradient
      particle.style.position = 'fixed';
      particle.style.pointerEvents = 'none';
      particle.style.width = `${width}px`;
      particle.style.height = `${height}px`;
      particle.style.left = `${x + offsetX}px`;
      particle.style.top = `${y + offsetY}px`;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.borderRadius = `${40 + Math.random() * 20}%`; // Irregular shape
      particle.style.zIndex = '99999';
      particle.style.willChange = 'transform, opacity';
      particle.style.mixBlendMode = 'screen';

      particle.style.background = colorScheme.gradient;

      // Varying blur and brightness for depth, scaled for retina
      const blurAmount = (10 + Math.random() * 25) * scaleFactor; // 10-35px (wide range)
      particle.style.filter = `blur(${blurAmount}px) brightness(${colorScheme.brightness})`;
      particle.style.opacity = '0';

      // Random animation duration for more chaos - longer on retina
      const baseDuration = 0.5 + Math.random() * 0.4;
      const duration = isRetina ? baseDuration * 1.3 : baseDuration; // Slower fade on retina
      particle.style.animation = `cursorTrailFade ${duration}s ease-out forwards`;

      document.body.appendChild(particle);
      particles.push(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
        particles = particles.filter((p: HTMLDivElement) => p !== particle);
      }, duration * 1000);
    };

    let lastTime = 0;
    const throttleDelay = 5;

    const handleMouseMove = (e: MouseEvent): void => {
      const currentTime = Date.now();

      if (currentTime - lastTime < throttleDelay) {
        return;
      }

      lastTime = currentTime;
      mouseX = e.clientX;
      mouseY = e.clientY;

      createParticle(mouseX, mouseY);
    };

    // Add keyframes animation dynamically
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes cursorTrailFade {
        0% {
          opacity: 0.7;
          transform: translate(-50%, -50%) scale(0.4);
        }
        40% {
          opacity: 0.4;
          transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1.3);
        }
      }
    `;
    document.head.appendChild(styleSheet);

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      particles.forEach((p: HTMLDivElement) => p.remove());
      styleSheet.remove();
    };
  }, []);

  return null;
}
