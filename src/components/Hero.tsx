import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Download } from 'lucide-react';
import { useStore } from '../store';

export function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);
  const siteConfig = useStore((state) => state.siteConfig) || { personalInfo: {} as any };
  const { heroTitle, heroTitleHighlight, heroDescription, availableForWork, cvLink, avatarUrl } = siteConfig.personalInfo || {};

  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 100]);
  const yImage = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden border-b border-black/5 dark:border-white/5">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-32 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-32">
        
        {/* Colonne Avatar */}
        {Boolean(avatarUrl && avatarUrl.trim() !== '') && (
          <motion.div 
            style={{ y: yImage }}
            className="w-full md:w-5/12 max-w-[280px] sm:max-w-[320px] md:max-w-[450px] shrink-0 relative aspect-[3/4] mx-auto md:mx-0 mb-8 md:mb-0 order-1 md:order-none"
          >
            {/* Ambient glow behind image */}
            <div className="absolute inset-0 bg-current opacity-[0.08] dark:opacity-[0.15] blur-[100px] rounded-full"></div>
            {!isScrolled && (
              <motion.div
                layoutId="profile-avatar"
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md"
              >
                <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-700" />
                
                {/* Glassmorphic overlay details */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/20 opacity-0 hover:opacity-100 transition-opacity duration-500 shadow-xl">
                  <p className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white mix-blend-normal">Directeur Créatif & Développeur</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Colonne Texte */}
        <motion.div 
          style={{ y: yText, opacity }}
          className="flex-1 max-w-2xl z-10 order-2 md:order-none pt-4 md:pt-0"
        >
          {availableForWork && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-current/20 bg-current/5 backdrop-blur-md text-current text-xs font-semibold tracking-wide uppercase mb-10 shadow-lg"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current"></span>
              </span>
              Disponible pour opportunités
            </motion.div>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-display font-bold tracking-tighter text-balance leading-[1.05]"
          >
            {heroTitle || siteConfig?.personalInfo?.name || 'Portfolio'} {heroTitleHighlight && (
              <>
                <br className="hidden md:block"/>
                <span className="opacity-60 italic">{heroTitleHighlight}</span>
              </>
            )}
          </motion.h1>
          
          {heroDescription && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 text-lg sm:text-xl opacity-80 max-w-2xl leading-relaxed text-balance font-light"
            >
              {heroDescription}
            </motion.p>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-6"
          >
            <a
              href="#projects"
              className="group relative flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-all duration-500 w-full sm:w-auto overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 rounded-full" />
              <span className="relative z-10 text-white dark:text-zinc-900 tracking-wide">Réalisations</span>
              <ArrowRight className="w-5 h-5 relative z-10 text-white dark:text-zinc-900 group-hover:translate-x-2 transition-transform duration-500" />
            </a>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
