"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup with improved field of view for better zoom out effect
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50; // Increased distance for better zoom out view
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    
    // Particles with adjusted count for better performance and visual effect
    const particlesCount = window.innerWidth < 768 ? 300 : 500; // Adaptive based on screen size
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    const isDark = theme === 'dark';
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position - more spread out for minimalist effect with improved distribution
      positions[i] = (Math.random() - 0.5) * 180; // Wider X spread
      positions[i + 1] = (Math.random() - 0.5) * 180; // Wider Y spread
      positions[i + 2] = (Math.random() - 0.5) * 180; // Wider Z spread
      
      // Color - more subtle, metallic colors
      if (isDark) {
        const shade = Math.random() * 0.3 + 0.7; // Brighter metallic in dark mode
        colors[i] = shade;
        colors[i + 1] = shade;
        colors[i + 2] = shade;
      } else {
        const shade = Math.random() * 0.2 + 0.7; // Subtle metallic in light mode
        colors[i] = shade;
        colors[i + 1] = shade;
        colors[i + 2] = shade;
      }
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05, // Smaller particles
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Slower, more subtle rotation
      particles.rotation.x = elapsedTime * 0.02;
      particles.rotation.y = elapsedTime * 0.01;
      
      // Gentle wave effect
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        
        // Subtle sine wave
        positions[i3 + 1] = y + Math.sin(elapsedTime * 0.2 + x * 0.02) * 0.1;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize with improved zoom handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      
      // Adjust camera position based on screen size for responsive zoom
      if (window.innerWidth < 768) {
        camera.position.z = 60; // More zoomed out for mobile
      } else if (window.innerWidth < 1024) {
        camera.position.z = 55; // Medium zoom for tablets
      } else {
        camera.position.z = 50; // Standard zoom for desktop
      }
      
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [theme]);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-50" // Reduced opacity for minimalist look
      style={{ pointerEvents: 'none' }}
    />
  );
}