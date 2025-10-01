"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CanvasScrollImageSequenceProps {
  images: string[];
  containerHeight?: number;
  textTriggerFrame?: number;
}

interface LoadedImage {
  image: HTMLImageElement;
  loaded: boolean;
}

export default function CanvasScrollImageSequence({
  images,
  containerHeight = 4000,
  textTriggerFrame = 26,
}: CanvasScrollImageSequenceProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const descriptionTimeout = useRef<number | null>(null);
  const loadedImagesRef = useRef<LoadedImage[]>([]);
  const lastFrameRef = useRef<number>(-1);

  /**
   * Preload all images for smooth animation
   * This ensures all frames are ready before starting the animation
   */
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise<LoadedImage>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            resolve({ image: img, loaded: true });
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            reject(new Error(`Failed to load ${src}`));
          };
          img.src = src;
        });
      });

      try {
        loadedImagesRef.current = await Promise.all(imagePromises);
        setImagesLoaded(true);
        console.log(`Successfully preloaded ${images.length} images`);
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    preloadImages();
  }, [images]);

  /**
   * Draw current frame on canvas
   * Uses hardware-accelerated canvas rendering for optimal performance
   */
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded || frameIndex < 0 || frameIndex >= loadedImagesRef.current.length) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadedImage = loadedImagesRef.current[frameIndex];
    if (!loadedImage || !loadedImage.loaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio and positioning for proper image scaling
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = loadedImage.image.width / loadedImage.image.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imageAspect > canvasAspect) {
      // Image is wider than canvas
      drawHeight = canvas.height;
      drawWidth = drawHeight * imageAspect;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      // Image is taller than canvas
      drawWidth = canvas.width;
      drawHeight = drawWidth / imageAspect;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    // Draw the image with proper scaling and centering
    ctx.drawImage(loadedImage.image, offsetX, offsetY, drawWidth, drawHeight);
  }, [imagesLoaded]);

  /**
   * Update frame based on scroll progress
   * Handles smooth frame transitions and text overlay triggers
   * Optimized for 30-image sequence with precise frame mapping
   */
  const updateFrame = useCallback(
    (progress: number) => {
      // Clamp progress between 0 and 1 for safety
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const exactFrame = clampedProgress * (images.length - 1);
      const frameIndex = Math.round(exactFrame);

      // Only update if frame has changed to avoid unnecessary redraws
      if (frameIndex !== lastFrameRef.current && frameIndex >= 0 && frameIndex < images.length) {
        lastFrameRef.current = frameIndex;
        setCurrentFrame(frameIndex);
        drawFrame(frameIndex);

        // Show text overlay at specified frame
        setShowText(frameIndex >= textTriggerFrame);
        
        // Handle description with delay
        if (frameIndex >= textTriggerFrame) {
          if (!showDescription) {
            if (descriptionTimeout.current) {
              clearTimeout(descriptionTimeout.current);
            }
            descriptionTimeout.current = window.setTimeout(() => {
              setShowDescription(true);
            }, 800);
          }
        } else {
          if (descriptionTimeout.current) {
            clearTimeout(descriptionTimeout.current);
          }
          setShowDescription(false);
        }
      }
    },
    [images.length, textTriggerFrame, showDescription, drawFrame]
  );

  /**
   * Handle scroll events with requestAnimationFrame for smooth 60fps updates
   * Uses passive event listeners for better performance
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current || !imagesLoaded) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Calculate scroll progress with improved precision for 30-frame sequence
      const containerHeight = rect.height - window.innerHeight;
      const scrollProgress = containerHeight > 0 
        ? Math.max(0, Math.min(1, -rect.top / containerHeight))
        : 0;

      // Use requestAnimationFrame to ensure smooth 60fps updates
      if (!ticking) {
        ticking = true;
        animationRef.current = requestAnimationFrame(() => {
          updateFrame(scrollProgress);
          ticking = false;
        });
      }
    };

    // Initial call to set up the first frame
    handleScroll();

    // Add scroll event listener with passive flag for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (descriptionTimeout.current) {
        clearTimeout(descriptionTimeout.current);
      }
    };
  }, [updateFrame, imagesLoaded]);

  /**
   * Handle canvas resize to maintain proper aspect ratio
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Redraw current frame after resize
      if (imagesLoaded) {
        drawFrame(currentFrame);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [imagesLoaded, currentFrame, drawFrame]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Sticky canvas container that stays visible while scrolling */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          {/* Canvas element for rendering frames */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            style={{
              transform: "translateZ(0)", // Hardware acceleration
              willChange: "transform",
            }}
          />

          {/* Loading indicator */}
          {!imagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-xl">Loading images...</div>
            </div>
          )}

          {/* Frame counter overlay */}
          {imagesLoaded && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Frame {currentFrame + 1} / {images.length}
            </div>
          )}

          {/* Main text overlay */}
          {imagesLoaded && (
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out w-full pl-[150px] ${
                showText ? "opacity-100" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-white px-8 py-6 rounded-xl text-3xl font-bold mb-4">
                ჩოგბურთის კორტი
              </div>

              {/* Description with delayed appearance */}
              <div
                className={`transition-all duration-1000 ease-out ${
                  showDescription ? "opacity-100" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="text-white px-6 py-3 rounded-lg text-lg font-medium">
                  <p>8,000 კვ.მ. ზონა ცენტრალური პარკით,</p>
                  <p>ველობილიკითა და ITF სტანდარტის ჩოგბურთის კორტით.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
