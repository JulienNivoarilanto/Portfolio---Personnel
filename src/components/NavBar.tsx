import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Github, Linkedin, Twitter } from 'lucide-react';
import { useStore } from '../store';

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const siteConfig = useStore((state) => state.siteConfig);
  const { name, githubUrl, linkedinUrl, twitterUrl, avatarUrl } = siteConfig?.personalInfo || {};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showTestimonials = siteConfig?.sectionsVisibility?.testimonials !== false;
  const showLegalStatus = siteConfig?.sectionsVisibility?.legalStatus !== false;

  const navLinks = [
    { name: 'Projets', href: '#projects' },
    { name: 'Compétences', href: '#skills' },
    ...(showTestimonials ? [{ name: 'Témoignages', href: '#testimonials' }] : []),
    ...(showLegalStatus ? [{ name: 'Statut légal', href: '#legal-status' }] : []),
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-4 px-4'
          : 'py-8 px-0'
      }`}
    >
      <div className={`mx-auto flex items-center justify-between transition-all duration-700 ease-out rounded-[2rem] border ${
        isScrolled ? 'max-w-5xl bg-white/10 dark:bg-black/10 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_-15px_rgba(255,255,255,0.1)] px-8 py-4' : 'max-w-[1600px] px-6 md:px-16 lg:px-32 bg-transparent border-transparent py-4'
      }`}>
        <a
          href="#"
          className="hover:opacity-80 transition-opacity flex items-center gap-4"
        >
          {isScrolled && Boolean(avatarUrl && avatarUrl.trim() !== '') && (
            <motion.div
              layoutId="profile-avatar"
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="relative rounded-full overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 w-12 h-12 shrink-0"
            >
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
          <motion.span layout className="text-2xl font-display font-bold tracking-tight text-inherit mix-blend-difference">
            {name}
          </motion.span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-inherit opacity-70 hover:opacity-100 transition-opacity"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Social Links & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="text-inherit opacity-70 hover:opacity-100 transition-opacity"><Github className="w-5 h-5" /></a>}
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-inherit opacity-70 hover:opacity-100 transition-opacity"><Linkedin className="w-5 h-5" /></a>}
          </div>
          
          <button
            className="md:hidden p-2 text-inherit opacity-70"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800"
          >
            <nav className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-zinc-600 dark:text-zinc-400"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex items-center space-x-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="text-zinc-400"><Github className="w-5 h-5" /></a>}
                {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-zinc-400"><Linkedin className="w-5 h-5" /></a>}
                {twitterUrl && <a href={twitterUrl} target="_blank" rel="noreferrer" className="text-zinc-400"><Twitter className="w-5 h-5" /></a>}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
