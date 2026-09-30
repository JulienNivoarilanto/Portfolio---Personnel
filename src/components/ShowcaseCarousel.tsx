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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // If disabled or has no items, render nothing (pure database-driven, no empty ghost frames)
  if (!isEnabled || items.length === 0) {
    return null;
  }

  // Ensure index remains in bounds if items array changes
  const safeIndex = currentIndex >= items.length ? 0 : currentIndex;
  const currentItem = items[safeIndex];

  const handleNext = useCallback(() => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleGoTo = useCallback((index: number) => {
    setDirection(index > safeIndex ? 'right' : 'left');
    setCurrentIndex(index);
  }, [safeIndex]);

  // Clean auto-slide effect
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, durationSeconds * 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, isPaused, items.length, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
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
      },
    }),
  };

  return (
    <section 
      className="py-16 md:py-24 lg:py-28 relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 2xl:px-20 transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrousel illustré"
    >
      {/* Outer Card with ambient glow backdrop - Expanded & Responsive */}
      <div className="relative w-full rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-white/70 via-white/40 to-white/20 dark:from-zinc-900/85 dark:via-zinc-900/55 dark:to-zinc-950/35 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.07)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        
        {/* Subtle decorative background gradient circles */}
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Carousel Content Container with generous padding and panoramic width */}
        <div className="relative min-h-[400px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[540px] xl:min-h-[580px] flex items-center p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentItem.id || safeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 xl:gap-20 items-center"
            >
              {/* LEFT COLUMN: Large SVG Illustration */}
              <div className="md:col-span-5 lg:col-span-5 flex items-center justify-center relative order-1">
                {/* Ambient glow behind the SVG */}
                <div className="absolute inset-0 max-w-[300px] max-h-[300px] sm:max-w-[380px] sm:max-h-[380px] lg:max-w-[440px] lg:max-h-[440px] mx-auto my-auto bg-gradient-to-tr from-blue-500/20 to-teal-400/20 dark:from-blue-600/30 dark:to-cyan-400/30 rounded-3xl blur-3xl transform rotate-6 scale-95 pointer-events-none" />
                
                <div className="relative z-10 w-64 h-64 sm:w-76 sm:h-76 md:w-88 md:h-88 lg:w-[400px] lg:h-[400px] xl:w-[460px] xl:h-[460px] flex items-center justify-center p-4 transition-transform duration-500 hover:scale-[1.03]">
                  <SvgRenderer 
                    svgContent={currentItem.illustrationSvg} 
                    alt={currentItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Title & Description */}
              <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center order-2 text-left">
                {/* Titre */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight text-zinc-950 dark:text-white mb-5 sm:mb-6 leading-[1.15]">
                  {currentItem.title}
                </h3>

                {/* Description */}
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line max-w-3xl">
                  {currentItem.description}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Bar: Centered Previous / Next Controls, Slide Dots on Left */}
        <div className="relative border-t border-zinc-200/50 dark:border-zinc-800/80 px-6 sm:px-12 py-4 sm:py-5 flex items-center justify-center bg-white/20 dark:bg-zinc-950/20">
          
          {/* Slide Indicator Dots (Positioned on the left side) */}
          <div className="hidden sm:flex absolute left-6 sm:left-12 items-center gap-2">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => handleGoTo(idx)}
                className={`transition-all duration-300 rounded-full h-2 ${
                  idx === safeIndex
                    ? 'w-8 bg-zinc-900 dark:bg-white'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                }`}
                title={`Aller à la diapositive ${idx + 1}`}
                aria-label={`Diapositive ${idx + 1}`}
              />
            ))}
          </div>

          {/* Centered Navigation Controls: Previous / Next buttons */}
          {items.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-xs active:scale-95"
                title="Élément précédent"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Mobile dots between arrows if on small screen */}
              <div className="flex sm:hidden items-center gap-1.5 px-2">
                {items.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    onClick={() => handleGoTo(idx)}
                    className={`transition-all duration-300 rounded-full h-1.5 ${
                      idx === safeIndex
                        ? 'w-6 bg-zinc-900 dark:bg-white'
                        : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                    }`}
                    title={`Aller à la diapositive ${idx + 1}`}
                    aria-label={`Diapositive ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-xs active:scale-95"
                title="Élément suivant"
                aria-label="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
