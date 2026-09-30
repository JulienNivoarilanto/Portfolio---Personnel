import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { SvgRenderer } from './SvgRenderer';

export function ShowcaseCarousel() {
  const siteConfig = useStore((state) => state.siteConfig);
  const carouselSettings = siteConfig?.carouselSettings;
  const isEnabled = (siteConfig?.sectionsVisibility?.carousel !== false) && (carouselSettings?.enabled !== false);
  const items = carouselSettings?.items || [];
  
  // Slide duration in seconds (defaults to 5s if not set or <= 0)
  const durationSeconds = Math.max(2, carouselSettings?.slideDuration || 5);

  // ALL HOOKS MUST RUN UNCONDITIONALLY AT THE TOP LEVEL (Prevents React Error #310)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Ensure index remains in bounds if items array changes
  const safeIndex = (items.length > 0 && currentIndex < items.length) ? currentIndex : 0;
  const currentItem = items.length > 0 ? items[safeIndex] : null;

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleGoTo = useCallback((index: number) => {
    setDirection(index > safeIndex ? 'right' : 'left');
    setCurrentIndex(index);
  }, [safeIndex]);

  // Clean auto-slide effect
  useEffect(() => {
    if (!isEnabled || items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, durationSeconds * 1000);

    return () => clearInterval(interval);
  }, [isEnabled, durationSeconds, isPaused, items.length, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || items.length === 0) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 50) {
      handleNext();
      setTouchStart(null);
    } else if (diff < -50) {
      handlePrev();
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // If disabled, has no items or no active item, render nothing (AFTER ALL HOOKS)
  if (!isEnabled || items.length === 0 || !currentItem) {
    return null;
  }

  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 28 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 28 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      },
    }),
  };

  return (
    <section 
      id="showcase-carousel" 
      aria-label="Carousel d'illustrations interactives"
      className="relative py-12 md:py-20 overflow-hidden border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24">
        {/* Carousel Viewport Card */}
        <div className="relative rounded-[2.5rem] border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl p-6 sm:p-10 md:p-14 pb-20 sm:pb-24 min-h-[440px] md:min-h-[500px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentItem.id || safeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center"
            >
              {/* Illustration Pane (Left/Top) */}
              <div className="lg:col-span-7 flex items-center justify-center relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[380px] md:max-h-[420px] p-2 sm:p-4 overflow-hidden">
                <SvgRenderer
                  svgContent={currentItem.illustrationSvg}
                  alt={currentItem.title}
                  className="w-full h-full"
                />
              </div>

              {/* Text Pane (Right/Bottom) */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold tracking-tight">
                  {currentItem.title}
                </h3>

                {currentItem.description && (
                  <p className="text-base md:text-lg opacity-80 leading-relaxed font-light">
                    {currentItem.description}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Controls: Précédent, Indicateurs (dots), Suivant */}
          {items.length > 1 && (
            <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 z-20">
              <button
                onClick={handlePrev}
                aria-label="Illustration précédente"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
              </button>

              <div className="flex items-center gap-2 px-1">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGoTo(idx)}
                    aria-label={`Aller au slide ${idx + 1}`}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      idx === safeIndex
                        ? 'w-7 sm:w-8 bg-zinc-900 dark:bg-white shadow-sm'
                        : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Illustration suivante"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
