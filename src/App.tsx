import React, { Component, ErrorInfo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { motion } from 'motion/react';
import { NavBar } from './components/NavBar';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { ShowcaseCarousel } from './components/ShowcaseCarousel';
import { Testimonials } from './components/Testimonials';
import { LegalStatus } from './components/LegalStatus';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { useStore, initFirebaseSync } from './store';
import { Toaster } from 'sonner';

// Code-split admin modules into isolated chunks: public visitors will never load admin code
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

function FourDBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate random stable properties for prisms to avoid layout shifts/re-renders
  const prisms = React.useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      x: (Math.random() * 200 - 100), // -100vw to 100vw
      y: (Math.random() * 200 - 100), // -100vh to 100vh
      z: (Math.random() * 800 - 400), // -400px to 400px
      rZ: Math.random() * 360,
      size: Math.random() * 40 + 10, // 10vw to 50vw
      duration: Math.random() * 100 + 150, // 150s to 250s
      direction: Math.random() > 0.5 ? 1 : -1,
      isCircle: Math.random() > 0.5
    }));
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const smoothMove = () => {
      // Lerp for smooth trailing effect
      currentX += (targetX - currentX) * 0.02; // Slower follow
      currentY += (targetY - currentY) * 0.02;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(smoothMove);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    smoothMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-transparent" style={{ perspective: '1200px' }}>
      <motion.div
        animate={{
          rotateX: mousePos.y * -5, // reduced rotation for subtlety
          rotateY: mousePos.x * 5,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Deep ambient light core */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[80vw] h-[80vw] bg-current opacity-20 blur-[200px] rounded-full mix-blend-screen dark:mix-blend-color-dodge"
          style={{ transform: 'translateZ(-600px)' }}
        />

        {/* 4DX Abstract Geometric Rings - Ultra Slow & Dispersed */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            initial={{
              x: `${i % 2 === 0 ? 20 : -20}vw`,
              y: `${i % 3 === 0 ? 20 : -20}vh`,
              z: -500 + i * 250,
            }}
            animate={{
              rotateZ: [0, 360 * (i % 2 === 0 ? 1 : -1)],
              rotateX: [0, 15, 0, -15, 0],
              rotateY: [0, -15, 0, 15, 0],
            }}
            transition={{ duration: 150 + i * 50, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border border-current opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
            style={{ 
              width: `${80 + i * 40}vw`, 
              height: `${70 + i * 35}vw`,
              borderWidth: `${1 + (i % 2)}px`,
              borderStyle: 'solid',
            }}
          />
        ))}

        {/* Floating 4D Prisms - Randomized in Space */}
        {prisms.map((prism) => (
          <motion.div
            key={`prism-${prism.id}`}
            initial={{
              x: `${prism.x}vw`,
              y: `${prism.y}vh`,
              z: prism.z,
            }}
            animate={{
              rotateZ: [prism.rZ, prism.rZ + (360 * prism.direction)],
              rotateX: [0, 45 * prism.direction, 0],
              rotateY: [0, -45 * prism.direction, 0],
            }}
            transition={{ duration: prism.duration, repeat: Infinity, ease: "linear" }}
            className="absolute border border-current opacity-[0.02] dark:opacity-[0.04]"
            style={{ 
              width: `${prism.size}vw`,
              height: `${prism.size}vw`,
              borderRadius: prism.isCircle ? '40% 60% 60% 40% / 40% 40% 60% 60%' : '15%',
              background: 'linear-gradient(135deg, transparent, currentColor 5%, transparent)',
            }}
          />
        ))}

        {/* Foreground dynamic grid - Subtler */}
        <motion.div
          initial={{ z: 100 }}
          animate={{
            rotateZ: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
          className="absolute w-[200vw] h-[200vw] opacity-[0.01] dark:opacity-[0.02]"
          style={{ 
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '8rem 8rem',
          }}
        />
      </motion.div>
    </div>
  );
}

class SafeComponentBoundary extends Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, fallback?: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn("SafeComponentBoundary intercepted error:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, info: ErrorInfo | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white font-sans text-center">
          <div className="max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-3 font-display">Un instant...</h2>
            <p className="text-sm text-zinc-400 mb-6">Une actualisation est nécessaire pour synchroniser le portfolio avec les dernières données.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, info: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Actualiser le portfolio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PortfolioLayout() {
  const { siteConfig } = useStore();
  const theme = siteConfig?.themeSettings?.activeTheme || 'default';
  const showTestimonials = siteConfig?.sectionsVisibility?.testimonials !== false;
  const showLegalStatus = siteConfig?.sectionsVisibility?.legalStatus !== false;
  const showCarousel = siteConfig?.sectionsVisibility?.carousel !== false && 
    siteConfig?.carouselSettings?.enabled !== false &&
    Boolean(siteConfig?.carouselSettings?.items && siteConfig.carouselSettings.items.length > 0);

  const getThemeClasses = () => {
    switch (theme) {
      case 'summer-ocean-breeze':
        return 'bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#9f1239] dark:from-[#0f172a] dark:via-[#1e3a8a] dark:to-[#9f1239] bg-[length:300%_300%] animate-gradient-flow text-white selection:bg-white/30 selection:text-white';
      case 'ocean-breeze':
        return 'bg-gradient-to-br from-[#082f49] via-[#0ea5e9] to-[#020617] dark:from-[#020617] dark:via-[#0ea5e9] dark:to-[#082f49] bg-[length:300%_300%] animate-gradient-flow text-white selection:bg-white/30 selection:text-white';
      case 'pastel-comfort':
        return 'bg-[#fdfbf7] dark:bg-[#2b2726] text-zinc-900 dark:text-[#fdfbf7] selection:bg-black/20 selection:text-black dark:selection:bg-white/20 dark:selection:text-white';
      case 'tropical-sunrise':
        return 'bg-gradient-to-br from-[#ffffff] via-[#cbf3f0] to-[#ffbf69] dark:from-[#ff9f1c] dark:via-[#2ec4b6] dark:to-[#ffbf69] bg-[length:300%_300%] animate-gradient-flow text-zinc-900 dark:text-zinc-900 selection:bg-black/20 selection:text-black';
      case 'turquoise-harmony':
        return 'bg-gradient-to-br from-[#f0f3bd] via-[#02c39a] to-[#00a896] dark:from-[#05668d] dark:via-[#028090] dark:to-[#00a896] bg-[length:300%_300%] animate-gradient-flow text-zinc-900 dark:text-white selection:bg-black/20 selection:text-black dark:selection:bg-white/30 dark:selection:text-white';
      case 'deep-blue-sea':
        return 'bg-gradient-to-br from-[#6fffe9] via-[#5bc0be] to-[#3a506b] dark:from-[#0b132b] dark:via-[#1c2541] dark:to-[#3a506b] bg-[length:300%_300%] animate-gradient-flow text-zinc-900 dark:text-white selection:bg-black/20 selection:text-black dark:selection:bg-white/30 dark:selection:text-white';
      default:
        return 'bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50';
    }
  };

  return (
    <div className={`font-sans min-h-screen relative transition-colors duration-1000 ${getThemeClasses()} overflow-x-hidden`}>
      <div className="fixed inset-0 bg-noise mix-blend-overlay opacity-50 z-0"></div>
      
      <FourDBackground />

      <NavBar />
      
      <main className="relative">
        <Hero />
        <Projects />
        <Skills />
        {showCarousel && (
          <SafeComponentBoundary>
            <ShowcaseCarousel />
          </SafeComponentBoundary>
        )}
        {showTestimonials && <Testimonials />}
        {showLegalStatus && <LegalStatus />}
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

function AdminShortcutAndSessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  // Raccourci clavier global : Ctrl + Alt + D (ou Cmd + Alt + D sur macOS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = (e.ctrlKey || e.metaKey) && e.altKey;
      if (isModifier && (e.key === 'd' || e.key === 'D' || e.code === 'KeyD')) {
        e.preventDefault();
        navigate('/admin-nj');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Fermer automatiquement la session si l'utilisateur quitte la page admin
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin-nj');
    if (!isAdminRoute) {
      const hasSession = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
      if (hasSession || auth.currentUser) {
        try {
          sessionStorage.removeItem('adminToken');
          localStorage.removeItem('adminToken');
        } catch (e) {}
        signOut(auth).catch(() => {});
      }
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    initFirebaseSync();
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Router>
        <AdminShortcutAndSessionWatcher />
        <Routes>
          <Route path="/" element={<PortfolioLayout />} />
          <Route 
            path="/admin-nj" 
            element={
              <React.Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
                <AdminLogin />
              </React.Suspense>
            } 
          />
          <Route 
            path="/admin-nj/dashboard/*" 
            element={
              <React.Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
                <AdminDashboard />
              </React.Suspense>
            } 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

