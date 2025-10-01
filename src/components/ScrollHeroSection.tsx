'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

const CloudSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 60"
    className={className}
    fill="currentColor"
  >
    <path d="M25,25 Q15,20 10,25 Q5,30 10,35 Q15,40 25,35 Q35,40 45,35 Q50,30 45,25 Q40,20 35,25 Q30,20 25,25 Z" />
  </svg>
);

export default function ScrollHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  // Animation values based on scroll progress
  const whiteOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const welcomeOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const welcomeY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  
  // Cloud animations
  const leftCloudX = useTransform(scrollYProgress, [0.1, 0.4], [0, -200]);
  const rightCloudX = useTransform(scrollYProgress, [0.1, 0.4], [0, 200]);
  const cloudOpacity = useTransform(scrollYProgress, [0.1, 0.4], [1, 0]);
  
  // Mountain background animations
  const mountainOpacity = useTransform(scrollYProgress, [0.3, 0.6, 0.8], [0, 1, 0]);
  const mountainScale = useTransform(scrollYProgress, [0.3, 0.8], [1.1, 1]);
  const mountainY = useTransform(scrollYProgress, [0.3, 0.8], [0, -50]);

  return (
    <div ref={containerRef} className="relative h-[400vh] overflow-hidden">
      {/* White background that fades out */}
      <motion.div
        className="fixed inset-0 bg-white z-10"
        style={{ opacity: whiteOpacity }}
      />

      {/* Welcome text */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-20"
        style={{
          opacity: welcomeOpacity,
          y: welcomeY,
        }}
      >
        <h1 className="text-6xl md:text-8xl font-bold text-gray-900">
          Welcome
        </h1>
      </motion.div>

      {/* Left cloud */}
      <motion.div
        className="fixed top-1/4 left-1/4 z-15 text-gray-300"
        style={{
          x: leftCloudX,
          opacity: cloudOpacity,
        }}
      >
        <CloudSVG className="w-32 h-20 md:w-48 md:h-32" />
      </motion.div>

      {/* Right cloud */}
      <motion.div
        className="fixed top-1/3 right-1/4 z-15 text-gray-300"
        style={{
          x: rightCloudX,
          opacity: cloudOpacity,
        }}
      >
        <CloudSVG className="w-40 h-24 md:w-56 md:h-36" />
      </motion.div>

      {/* Additional smaller clouds */}
      <motion.div
        className="fixed top-1/2 left-1/3 z-15 text-gray-200"
        style={{
          x: leftCloudX,
          opacity: cloudOpacity,
        }}
      >
        <CloudSVG className="w-24 h-16 md:w-32 md:h-20" />
      </motion.div>

      <motion.div
        className="fixed top-2/3 right-1/3 z-15 text-gray-200"
        style={{
          x: rightCloudX,
          opacity: cloudOpacity,
        }}
      >
        <CloudSVG className="w-28 h-18 md:w-36 md:h-24" />
      </motion.div>

      {/* Mountain background */}
      <motion.div
        className="fixed inset-0 z-5"
        style={{
          opacity: mountainOpacity,
          scale: mountainScale,
          y: mountainY,
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/photos/mountain.jpg"
            alt="Mountain landscape"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 text-gray-600"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
        }}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2">Scroll down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
