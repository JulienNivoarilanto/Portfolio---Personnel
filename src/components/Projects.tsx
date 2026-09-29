import { useState, useEffect, useMemo } from 'react';
import { Section } from './Section';
import { useStore } from '../store';
import { 
  Github, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Eye, 
  Copy, 
  Check, 
  Code2, 
  Image as ImageIcon,
  ShieldCheck,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Project, CodeBlock, ProjectsLayoutType } from '../types';
import { 
  extractProjectCodeBlocks, 
  normalizeLanguage, 
  getLanguageIcon, 
  getLanguageBadge,
  getLanguageDisplayName 
} from '../utils/codeSnippetUtils';

export function Projects() {
  const rawProjects = useStore((state) => state.projects);
  const siteConfig = useStore((state) => state.siteConfig);
  
  // Layout is configured exclusively in the Admin console
  const currentLayout: ProjectsLayoutType = siteConfig?.projectsLayout || siteConfig?.projectsSettings?.layout || 'mosaic';
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Sort projects strictly by order field
  const projects = useMemo(() => {
    return [...rawProjects].sort((a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      if (typeof a.order === 'number') return -1;
      if (typeof b.order === 'number') return 1;
      return 0;
    });
  }, [rawProjects]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeCodeBlockIndex, setActiveCodeBlockIndex] = useState(0);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isCodeWideMode, setIsCodeWideMode] = useState(false);

  // Modal media view: whether the left pane displays the images or the code blocks
  const [modalMediaView, setModalMediaView] = useState<'image' | 'code'>('image');

  // Per-card preview view mode ('image' | 'code') for the bento grid
  const [cardPreviewModes, setCardPreviewModes] = useState<Record<string, 'image' | 'code'>>({});
  const [copiedCardCodeId, setCopiedCardCodeId] = useState<string | null>(null);

  const handleCopyCode = (code: string, cardId?: string) => {
    navigator.clipboard.writeText(code);
    if (cardId) {
      setCopiedCardCodeId(cardId);
      setTimeout(() => setCopiedCardCodeId(null), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleOpenProject = (project: Project, initialMediaView: 'image' | 'code' = 'image') => {
    const projectBlocks = extractProjectCodeBlocks(project);
    const hasImages = (project.imageUrl && project.imageUrl.trim() !== '') || 
      (project.extraImages && project.extraImages.length > 0);

    setSelectedProject(project);
    setActiveImageIndex(0);
    setActiveCodeBlockIndex(0);
    setFitMode('contain');
    setIsCodeExpanded(false);
    setIsCodeWideMode(false);
    
    // If no images exist or user specifically opened in code view, switch left pane to code
    if (!hasImages && projectBlocks.length > 0) {
      setModalMediaView('code');
    } else {
      setModalMediaView(initialMediaView);
    }
  };

  const projectImages = selectedProject 
    ? [selectedProject.imageUrl, ...(selectedProject.extraImages || [])].filter((img): img is string => typeof img === 'string' && img.trim() !== '') 
    : [];

  const codeBlocks = selectedProject ? extractProjectCodeBlocks(selectedProject) : [];
  const activeCodeBlock = codeBlocks[activeCodeBlockIndex] || codeBlocks[0] || null;

  // Raccourcis clavier pour naviguer dans les images ou fermer le modal
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          setSelectedProject(null);
        }
      } else if (e.key === 'ArrowLeft' && projectImages.length > 1 && modalMediaView === 'image') {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : projectImages.length - 1));
      } else if (e.key === 'ArrowRight' && projectImages.length > 1 && modalMediaView === 'image') {
        setActiveImageIndex((prev) => (prev < projectImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, isLightboxOpen, projectImages.length, modalMediaView]);

  return (
    <>
      <Section id="projects" className="border-b border-black/5 dark:border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-32">
        <div className="mb-16 md:mb-24 md:flex items-end justify-between border-b border-black/10 dark:border-white/10 pb-8">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4 text-balance">
              Sélection de Projets
            </h2>
            <p className="text-lg opacity-80 max-w-xl">
              Une sélection asymétrique de mes réalisations les plus abouties. Visualisez les interfaces et les extraits de code ciblés directement sur chaque aperçu.
            </p>
          </div>
        </div>

        {projects.length === 0 && (
          <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 rounded-[2rem] p-10 bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
              Aucun projet enregistré pour le moment.
            </p>
            <p className="text-sm opacity-50 mt-1">
              Les projets ajoutés depuis l'espace d'administration apparaîtront directement ici.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LAYOUT 1 : MOSAÏQUE BENTO (PAR DÉFAUT)                        */}
        {/* ------------------------------------------------------------- */}
        {currentLayout === 'mosaic' && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project, index) => {
              const isLargePattern = [true, false, false, true, true, false];
              const isLarge = isLargePattern[index % 6];
              const projectBlocks = extractProjectCodeBlocks(project);
              const hasCode = projectBlocks.length > 0;
              const primaryBlock = projectBlocks[0] || null;
              const primaryBadge = getLanguageBadge(primaryBlock?.language || 'python');
              const hasValidImage = Boolean(project.imageUrl && project.imageUrl.trim() !== '');
              const cardMode = cardPreviewModes[project.id] ?? (hasValidImage ? 'image' : 'code');

              return (
                <motion.div
                  layoutId={`project-${project.id}`}
                  key={project.id}
                  className={`group relative flex flex-col bg-white/40 dark:bg-black/40 text-zinc-900 dark:text-zinc-100 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                    isLarge ? "md:col-span-2 lg:col-span-2" : "col-span-1"
                  }`}
                  onClick={() => handleOpenProject(project, cardMode)}
                >
                  {/* Switcher Visuel / Code */}
                  {hasCode && hasValidImage && (
                    <div 
                      className="absolute top-3 left-3 z-30 flex items-center p-1 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 shadow-lg text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setCardPreviewModes(prev => ({ ...prev, [project.id]: 'image' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          cardMode === 'image' 
                            ? 'bg-white/25 text-white shadow-sm font-semibold' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Afficher l'image du projet"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Visuel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardPreviewModes(prev => ({ ...prev, [project.id]: 'code' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          cardMode === 'code' 
                            ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Afficher l'extrait de code en direct sur la carte"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${primaryBadge.dotColor}`}></span>
                        <span>Extrait {primaryBadge.label}</span>
                      </button>
                    </div>
                  )}

                  {/* Image Container / Code Container */}
                  <div className={`relative ${isLarge ? 'aspect-video md:aspect-[2/1]' : 'aspect-square md:aspect-[4/3]'} overflow-hidden select-none`}>
                    {cardMode === 'image' && hasValidImage ? (
                      <>
                        <div className="absolute inset-0 bg-black/35 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                        <motion.img
                          layoutId={`image-${project.id}`}
                          src={project.imageUrl}
                          alt={`Aperçu du projet ${project.title}`}
                          className="object-cover w-full h-full transform group-hover:scale-[1.04] transition-transform duration-[2s] ease-out grayscale-[0.15] group-hover:grayscale-0"
                          loading="lazy"
                        />

                        {hasCode && (
                          <div className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-md">
                            <span className={`w-1.5 h-1.5 rounded-full ${primaryBadge.dotColor}`}></span>
                            <span>{primaryBadge.label} [{primaryBadge.tag}] • {primaryBlock?.code.split('\n').length} l.</span>
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/25 backdrop-blur-xs gap-3 pointer-events-none">
                          <div className="p-3.5 bg-white/95 text-zinc-900 rounded-full flex items-center justify-center font-medium gap-2 shadow-2xl backdrop-blur-md border border-white/30 text-sm">
                            <Maximize2 className="w-4 h-4" />
                            <span>Détails & Code</span>
                          </div>
                        </div>
                      </>
                    ) : hasCode && primaryBlock ? (
                      <div className="w-full h-full bg-[#121214] p-3 sm:p-4 flex flex-col font-mono text-zinc-300 relative overflow-hidden">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                            </div>
                            <span className="text-xs text-zinc-200 font-semibold flex items-center gap-1.5 ml-2 font-mono">
                              <span className={`w-1.5 h-1.5 rounded-full ${primaryBadge.dotColor}`}></span>
                              <span>{primaryBlock.title || `Extrait ${primaryBadge.label}`}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                              {primaryBadge.tag}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(primaryBlock.code, project.id)}
                              className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center gap-1"
                              title="Copier l'extrait"
                            >
                              {copiedCardCodeId === project.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copier</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative rounded-lg bg-[#18181b] p-2 text-xs">
                          <SyntaxHighlighter
                            language={normalizeLanguage(primaryBlock.language)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '0.5rem',
                              background: 'transparent',
                              fontSize: '0.8rem',
                              lineHeight: '1.45',
                              overflow: 'hidden'
                            }}
                            showLineNumbers={true}
                            wrapLongLines={false}
                          >
                            {primaryBlock.code.split('\n').slice(0, isLarge ? 12 : 8).join('\n')}
                          </SyntaxHighlighter>
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#18181b] to-transparent pointer-events-none flex items-end justify-center pb-1">
                            <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                              Cliquer pour ouvrir l'extrait complet ({primaryBlock.code.split('\n').length} lignes)
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 px-1 shrink-0 font-mono">
                          <span className="flex items-center gap-1.5 text-blue-400">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Extrait ciblé protégé</span>
                          </span>
                          <span>{projectBlocks.length > 1 ? `+${projectBlocks.length - 1} autre(s)` : 'Extrait représentatif'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 text-zinc-400 p-6 text-center">
                        <Terminal className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">Aperçu du projet</span>
                        <span className="text-xs opacity-60 mt-1">Cliquer pour découvrir les détails</span>
                      </div>
                    )}
                  </div>

                  {/* Contenu textuel */}
                  <div className="flex flex-col flex-1 p-8 md:p-10">
                    <motion.h3 layoutId={`title-${project.id}`} className="text-3xl font-display font-bold mb-4">
                      {project.title}
                    </motion.h3>
                    <p className="opacity-80 mb-6 flex-1 text-base sm:text-lg leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      {hasCode && (
                        <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-700/80 flex items-center gap-1.5 shadow-xs">
                          <Code2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{projectBlocks.map(b => getLanguageBadge(b.language).label).join(', ')}</span>
                        </span>
                      )}

                      {(project.tags || []).map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-black/5 dark:bg-white/10 rounded-full backdrop-blur-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LAYOUT 2 : MOSAÏQUE ÉGAUX (GRILLE SYMÉTRIQUE RÉGULIÈRE)       */}
        {/* ------------------------------------------------------------- */}
        {currentLayout === 'equal-grid' && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project, index) => {
              const projectBlocks = extractProjectCodeBlocks(project);
              const hasCode = projectBlocks.length > 0;
              const primaryBlock = projectBlocks[0] || null;
              const primaryBadge = getLanguageBadge(primaryBlock?.language || 'python');
              const hasValidImage = Boolean(project.imageUrl && project.imageUrl.trim() !== '');
              const cardMode = cardPreviewModes[project.id] ?? (hasValidImage ? 'image' : 'code');

              return (
                <motion.div
                  layoutId={`project-${project.id}`}
                  key={project.id}
                  className="group relative flex flex-col bg-white/40 dark:bg-black/40 text-zinc-900 dark:text-zinc-100 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer col-span-1"
                  onClick={() => handleOpenProject(project, cardMode)}
                >
                  {/* Switcher Visuel / Code */}
                  {hasCode && hasValidImage && (
                    <div 
                      className="absolute top-3 left-3 z-30 flex items-center p-1 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 shadow-lg text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setCardPreviewModes(prev => ({ ...prev, [project.id]: 'image' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          cardMode === 'image' 
                            ? 'bg-white/25 text-white shadow-sm font-semibold' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Afficher l'image du projet"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Visuel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardPreviewModes(prev => ({ ...prev, [project.id]: 'code' }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          cardMode === 'code' 
                            ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Afficher l'extrait de code en direct"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${primaryBadge.dotColor}`}></span>
                        <span>{primaryBadge.label}</span>
                      </button>
                    </div>
                  )}

                  {/* Image Container / Code Container - Equal Proportions */}
                  <div className="relative aspect-[16/10] overflow-hidden select-none">
                    {cardMode === 'image' && hasValidImage ? (
                      <>
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                        <motion.img
                          layoutId={`image-${project.id}`}
                          src={project.imageUrl}
                          alt={`Aperçu du projet ${project.title}`}
                          className="object-cover w-full h-full transform group-hover:scale-[1.04] transition-transform duration-[2s] ease-out grayscale-[0.1] group-hover:grayscale-0"
                          loading="lazy"
                        />

                        {hasCode && (
                          <div className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md">
                            <span className={`w-1.5 h-1.5 rounded-full ${primaryBadge.dotColor}`}></span>
                            <span>{primaryBadge.label}</span>
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/25 backdrop-blur-xs gap-3 pointer-events-none">
                          <div className="p-3 bg-white/95 text-zinc-900 rounded-full flex items-center justify-center font-medium gap-2 shadow-2xl backdrop-blur-md border border-white/30 text-xs">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Explorer</span>
                          </div>
                        </div>
                      </>
                    ) : hasCode && primaryBlock ? (
                      <div className="w-full h-full bg-[#121214] p-3 flex flex-col font-mono text-zinc-300 relative overflow-hidden">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 shrink-0 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${primaryBadge.dotColor}`}></span>
                            <span className="font-semibold text-zinc-200">{primaryBlock.title || primaryBadge.label}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {primaryBadge.tag}
                          </span>
                        </div>
                        <div className="flex-1 overflow-hidden relative rounded bg-[#18181b] p-2 text-xs">
                          <SyntaxHighlighter
                            language={normalizeLanguage(primaryBlock.language)}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '0.25rem', background: 'transparent', fontSize: '0.75rem', lineHeight: '1.4' }}
                            showLineNumbers={true}
                          >
                            {primaryBlock.code.split('\n').slice(0, 9).join('\n')}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 text-zinc-400 p-4 text-center">
                        <Terminal className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-xs font-medium">Aperçu du projet</span>
                      </div>
                    )}
                  </div>

                  {/* Text content - Uniform equal padding */}
                  <div className="flex flex-col flex-1 p-6 md:p-8">
                    <motion.h3 layoutId={`title-${project.id}`} className="text-2xl font-display font-bold mb-3">
                      {project.title}
                    </motion.h3>
                    <p className="opacity-80 mb-6 flex-1 text-sm sm:text-base leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                      {(project.tags || []).map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 text-xs font-medium bg-black/5 dark:bg-white/10 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LAYOUT 3 : ALBUM (PRÉSENTATION ÉDITORIALE HAUT DE GAMME)       */}
        {/* ------------------------------------------------------------- */}
        {currentLayout === 'album' && projects.length > 0 && (
          <div className="space-y-12 md:space-y-16">
            {projects.map((project, index) => {
              const projectBlocks = extractProjectCodeBlocks(project);
              const hasCode = projectBlocks.length > 0;
              const primaryBlock = projectBlocks[0] || null;
              const primaryBadge = getLanguageBadge(primaryBlock?.language || 'python');
              const hasValidImage = Boolean(project.imageUrl && project.imageUrl.trim() !== '');
              const cardMode = cardPreviewModes[project.id] ?? (hasValidImage ? 'image' : 'code');
              const plateNumber = String(index + 1).padStart(2, '0');

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-xl overflow-hidden"
                >
                  {/* Plate Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-black/10 dark:border-white/10 gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 tracking-widest">
                        PL. {plateNumber}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-display font-bold">
                        {project.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-sm"
                          title="Dépôt GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-sm"
                          title="Démo en direct"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Editorial Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Media Showcase on Left */}
                    <div className="lg:col-span-7">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg bg-zinc-950">
                        {/* Switcher Visuel / Code on Album */}
                        {hasCode && hasValidImage && (
                          <div className="absolute top-3 left-3 z-30 flex items-center p-1 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-white">
                            <button
                              type="button"
                              onClick={() => setCardPreviewModes(prev => ({ ...prev, [project.id]: 'image' }))}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                cardMode === 'image' ? 'bg-white/25 text-white font-semibold' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Photographie</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardPreviewModes(prev => ({ ...prev, [project.id]: 'code' }))}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                cardMode === 'code' ? 'bg-blue-600 text-white font-semibold' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>Extrait {primaryBadge.label}</span>
                            </button>
                          </div>
                        )}

                        {cardMode === 'image' && hasValidImage ? (
                          <img 
                            src={project.imageUrl} 
                            alt={project.title} 
                            className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-700"
                            onClick={() => handleOpenProject(project, 'image')}
                          />
                        ) : hasCode && primaryBlock ? (
                          <div className="w-full h-full p-4 flex flex-col font-mono text-xs bg-[#121214] text-zinc-300">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                              <span className="text-zinc-200 font-semibold">{primaryBlock.title || `Extrait ${primaryBadge.label}`}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {primaryBadge.tag}
                              </span>
                            </div>
                            <div className="flex-1 overflow-auto rounded bg-[#18181b] p-3 text-xs">
                              <SyntaxHighlighter
                                language={normalizeLanguage(primaryBlock.language)}
                                style={vscDarkPlus}
                                customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                showLineNumbers={true}
                              >
                                {primaryBlock.code}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <span>Aperçu de l'album</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Editorial Details on Right */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <span className="text-xs uppercase tracking-widest font-mono text-zinc-500 block">
                          Monographie du projet
                        </span>
                        <p className="text-base sm:text-lg opacity-85 leading-relaxed">
                          {project.description}
                        </p>
                        {project.fullDescription && (
                          <p className="text-sm opacity-70 leading-relaxed line-clamp-3">
                            {project.fullDescription}
                          </p>
                        )}
                      </div>

                      {/* Tech Chips */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {(project.tags || []).map(tag => (
                            <span 
                              key={tag} 
                              className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/5 dark:bg-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Interactive CTAs */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenProject(project, 'image')}
                            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium text-xs shadow-md hover:opacity-90 transition flex items-center gap-2"
                          >
                            <span>Consulter la fiche complète</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          {hasCode && (
                            <button
                              type="button"
                              onClick={() => handleOpenProject(project, 'code')}
                              className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 font-medium text-xs transition flex items-center gap-2"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>Inspecter le code</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LAYOUT 4 : SLIDE (CARROUSEL INTERACTIF ÉPURÉ)                 */}
        {/* ------------------------------------------------------------- */}
        {currentLayout === 'slider' && projects.length > 0 && (
          <div className="space-y-8">
            {/* Slider Navigation Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {String(activeSlideIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="font-sans font-medium text-sm hidden sm:inline text-zinc-800 dark:text-zinc-200">
                  {projects[activeSlideIndex]?.title}
                </span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1))}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-zinc-800 dark:text-zinc-200"
                  title="Projet précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0))}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-zinc-800 dark:text-zinc-200"
                  title="Projet suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Slide Spotlight */}
            {(() => {
              const activeProj = projects[activeSlideIndex] || projects[0];
              const projectBlocks = extractProjectCodeBlocks(activeProj);
              const hasCode = projectBlocks.length > 0;
              const primaryBlock = projectBlocks[0] || null;
              const primaryBadge = getLanguageBadge(primaryBlock?.language || 'python');
              const hasValidImage = Boolean(activeProj.imageUrl && activeProj.imageUrl.trim() !== '');
              const cardMode = cardPreviewModes[activeProj.id] ?? (hasValidImage ? 'image' : 'code');

              return (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProj.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/50 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      {/* Media Display on Slide */}
                      <div className="lg:col-span-7">
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-xl bg-zinc-950">
                          {hasCode && hasValidImage && (
                            <div className="absolute top-3 left-3 z-30 flex items-center p-1 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-white">
                              <button
                                type="button"
                                onClick={() => setCardPreviewModes(prev => ({ ...prev, [activeProj.id]: 'image' }))}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                  cardMode === 'image' ? 'bg-white/25 text-white font-semibold' : 'opacity-70 hover:opacity-100'
                                }`}
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Visuel</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCardPreviewModes(prev => ({ ...prev, [activeProj.id]: 'code' }))}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                  cardMode === 'code' ? 'bg-blue-600 text-white font-semibold' : 'opacity-70 hover:opacity-100'
                                }`}
                              >
                                <Code2 className="w-3.5 h-3.5" />
                                <span>Extrait {primaryBadge.label}</span>
                              </button>
                            </div>
                          )}

                          {cardMode === 'image' && hasValidImage ? (
                            <img 
                              src={activeProj.imageUrl} 
                              alt={activeProj.title} 
                              className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-700"
                              onClick={() => handleOpenProject(activeProj, 'image')}
                            />
                          ) : hasCode && primaryBlock ? (
                            <div className="w-full h-full p-4 flex flex-col font-mono text-xs bg-[#121214] text-zinc-300">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                                <span className="text-zinc-200 font-semibold">{primaryBlock.title || `Extrait ${primaryBadge.label}`}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  {primaryBadge.tag}
                                </span>
                              </div>
                              <div className="flex-1 overflow-auto rounded bg-[#18181b] p-3 text-xs">
                                <SyntaxHighlighter
                                  language={normalizeLanguage(primaryBlock.language)}
                                  style={vscDarkPlus}
                                  customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                  showLineNumbers={true}
                                >
                                  {primaryBlock.code}
                                </SyntaxHighlighter>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <span>Aperçu du projet</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content on Slide */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest font-mono text-zinc-500">
                              Projet #{activeSlideIndex + 1}
                            </span>
                            {activeSlideIndex === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                En premier
                              </span>
                            )}
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-display font-bold">
                            {activeProj.title}
                          </h3>
                          <p className="text-base sm:text-lg opacity-85 leading-relaxed">
                            {activeProj.description}
                          </p>
                        </div>

                        {/* Tech tags */}
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {(activeProj.tags || []).map(tag => (
                              <span key={tag} className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/5 dark:bg-white/10">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Action buttons */}
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenProject(activeProj, 'image')}
                              className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium text-xs shadow-md hover:opacity-90 transition flex items-center gap-2"
                            >
                              <span>Ouvrir les détails</span>
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            {activeProj.liveUrl && (
                              <a
                                href={activeProj.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 font-medium text-xs transition flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Démo en ligne</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              );
            })()}

            {/* Slide Quick Navigation Strip (Thumbnails & Dots) */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-2">
              {projects.map((proj, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md font-bold'
                        : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-600 dark:text-zinc-400'
                    }`}
                    title={proj.title}
                  >
                    <span>#{idx + 1}</span>
                    <span className="hidden md:inline line-clamp-1 max-w-[120px]">{proj.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      </Section>

      {/* Modal pour le détail du projet */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex justify-center items-center p-2 sm:p-4 md:p-6 lg:p-8"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                layoutId={`project-${selectedProject.id}`}
                className="bg-white/95 dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100 backdrop-blur-2xl w-full max-w-[1520px] 2xl:max-w-[1680px] h-[94vh] md:h-[92vh] max-h-[96vh] rounded-[2rem] flex flex-col md:flex-row relative shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Bouton fermeture toujours visible */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-[120] p-2.5 bg-black/70 hover:bg-black text-white dark:bg-white/80 dark:hover:bg-white dark:text-black rounded-full backdrop-blur-md shadow-lg transition cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Partie gauche - Images ou Extraits de code pleine surface */}
                <div className={`w-full md:w-[44%] lg:w-[42%] bg-zinc-100/90 dark:bg-zinc-900/80 flex flex-col h-[340px] sm:h-[400px] md:h-full border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 relative overflow-hidden select-none shrink-0 ${
                  isCodeWideMode ? 'hidden md:hidden' : 'flex'
                }`}>
                  
                  {/* Barre d'outils supérieure : Bascule entre Galerie Visuelle et Extraits de Code */}
                  <div className="px-4 py-3 bg-black/5 dark:bg-black/30 border-b border-black/10 dark:border-white/10 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-2">
                      {/* Switcher Visuel / Code for left pane */}
                      <div className="flex items-center p-0.5 bg-black/10 dark:bg-white/10 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setModalMediaView('image')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            modalMediaView === 'image'
                              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Galerie ({projectImages.length})</span>
                        </button>

                        {codeBlocks.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setModalMediaView('code')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                              modalMediaView === 'code'
                                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                            }`}
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Extraits ({codeBlocks.length})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {modalMediaView === 'image' && (
                        <>
                          {/* Bouton bascule ajustement plein / complet */}
                          <button
                            type="button"
                            onClick={() => setFitMode(f => f === 'contain' ? 'cover' : 'contain')}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5"
                            title={fitMode === 'contain' ? "Remplir tout l'espace" : "Afficher l'image au complet sans coupure"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{fitMode === 'contain' ? 'Complet' : 'Remplir'}</span>
                          </button>

                          {/* Bouton plein écran / zoom */}
                          {projectImages[activeImageIndex] && (
                            <button
                              type="button"
                              onClick={() => setIsLightboxOpen(true)}
                              className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-700 dark:text-zinc-300 transition"
                              title="Agrandir en plein écran"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}

                      {modalMediaView === 'code' && activeCodeBlock && (
                        <button
                          type="button"
                          onClick={() => handleCopyCode(activeCodeBlock.code)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copié' : 'Copier'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scène de prévisualisation : Mode Galerie d'Images OU Mode Code Viewer */}
                  {modalMediaView === 'image' ? (
                    <div className="relative flex-1 min-h-0 w-full flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                      {projectImages[activeImageIndex] && (
                        <div
                          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 dark:opacity-35 scale-125 pointer-events-none transition-all duration-700"
                          style={{ backgroundImage: `url(${projectImages[activeImageIndex]})` }}
                        />
                      )}

                      {projectImages[activeImageIndex] ? (
                        <div 
                          className="relative z-10 w-full h-full flex items-center justify-center cursor-zoom-in group"
                          onClick={() => setIsLightboxOpen(true)}
                          title="Cliquer pour afficher en plein écran"
                        >
                          <motion.img
                            key={projectImages[activeImageIndex]}
                            initial={{ opacity: 0.7, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            src={projectImages[activeImageIndex]}
                            alt={selectedProject.title}
                            className={`transition-all duration-300 rounded-xl shadow-2xl ${
                              fitMode === 'cover' 
                                ? 'w-full h-full object-cover' 
                                : 'max-w-full max-h-full w-auto h-auto object-contain'
                            }`}
                          />
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-none">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Agrandir</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-400 text-sm gap-2">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                          <span>Aucune image disponible</span>
                          {codeBlocks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setModalMediaView('code')}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs mt-2"
                            >
                              Voir l'extrait de code
                            </button>
                          )}
                        </div>
                      )}

                      {/* Flèches de navigation précédent / suivant sur l'image */}
                      {projectImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : projectImages.length - 1));
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-lg hover:scale-105 active:scale-95"
                            title="Image précédente"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev < projectImages.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-lg hover:scale-105 active:scale-95"
                            title="Image suivante"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    /* MODE CODE VIEWER PLEINE HAUTEUR DANS LE VOLET MÉDIA */
                    <div className="relative flex-1 min-h-0 w-full flex flex-col bg-[#141416] text-zinc-200 select-text">
                      {/* Onglets multi-langages */}
                      {codeBlocks.length > 1 && (
                        <div className="bg-[#1c1c20] px-4 py-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
                          {codeBlocks.map((block, idx) => {
                            const isTabActive = idx === activeCodeBlockIndex;
                            const badge = getLanguageBadge(block.language);
                            return (
                              <button
                                key={block.id || idx}
                                type="button"
                                onClick={() => setActiveCodeBlockIndex(idx)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition shrink-0 cursor-pointer ${
                                  isTabActive
                                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}></span>
                                <span>{block.title || `Extrait ${badge.label}`}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isTabActive ? 'bg-white/20' : 'bg-white/5'}`}>
                                  {block.code ? block.code.split('\n').length : 0} l.
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Header d'information sur la sécurité de l'extrait */}
                      <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/40 text-[11px] text-blue-300 flex items-center justify-between shrink-0 font-mono">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>Extrait ciblé sécurisé — Propriété intellectuelle préservée</span>
                        </span>
                        <span className="font-mono">{activeCodeBlock ? `${activeCodeBlock.code.split('\n').length} lignes` : ''}</span>
                      </div>

                      {/* Zone d'affichage du code avec coloration syntaxique */}
                      <div className="flex-1 overflow-y-auto overflow-x-auto p-4 custom-scrollbar bg-[#18181b]">
                        {activeCodeBlock && (
                          <SyntaxHighlighter
                            language={normalizeLanguage(activeCodeBlock.language)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '0.75rem',
                              background: 'transparent',
                              fontSize: '0.92rem',
                              lineHeight: '1.6'
                            }}
                            showLineNumbers={true}
                            wrapLongLines={false}
                          >
                            {activeCodeBlock.code}
                          </SyntaxHighlighter>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Galerie Miniatures (si mode image) */}
                  {modalMediaView === 'image' && projectImages.length > 1 && (
                    <div className="shrink-0 p-3 sm:p-4 flex gap-2.5 overflow-x-auto bg-black/5 dark:bg-black/40 border-t border-black/10 dark:border-white/10">
                      {projectImages.map((img, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            activeImageIndex === i 
                              ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/30' 
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Miniature ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Partie droite - Infos & Code avec défilement fluide et visible */}
                <div 
                  className={`p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col h-full min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar select-text pb-36 transition-all duration-300 ${
                    isCodeWideMode ? 'w-full' : 'w-full md:w-[56%] lg:w-[58%]'
                  }`}
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <motion.h2 layoutId={`title-${selectedProject.id}`} className="text-3xl md:text-5xl font-display font-bold">
                      {selectedProject.title}
                    </motion.h2>

                    {isCodeWideMode && (
                      <button
                        type="button"
                        onClick={() => setIsCodeWideMode(false)}
                        className="px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-black/5 dark:bg-white/10 text-xs font-mono font-medium hover:bg-black/10 dark:hover:bg-white/20 transition flex items-center gap-1.5 shrink-0"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Vue partagée</span>
                      </button>
                    )}
                  </div>

                  {/* Mature Developer Tech Badges (No tacky small emojis) */}
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    {codeBlocks.map(b => {
                      const badge = getLanguageBadge(b.language);
                      return (
                        <span 
                          key={b.id || b.language} 
                          className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-700/80 shadow-xs flex items-center gap-2"
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dotColor} shadow-[0_0_8px_rgba(59,130,246,0.6)]`}></span>
                          <span>{badge.label} [{badge.tag}]</span>
                        </span>
                      );
                    })}

                    {(selectedProject.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1.5 text-xs font-semibold tracking-wide uppercase bg-black/5 dark:bg-white/10 rounded-xl text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 font-mono">
                        {tag}
                      </span>
                    ))}

                    {/* Quick jump to code button */}
                    {codeBlocks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('project-code-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                        title="Faire défiler vers l'extrait de code"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Accéder à l'extrait ({activeCodeBlock?.code.split('\n').length || 0} l.) ↓</span>
                      </button>
                    )}
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-10 opacity-85 text-inherit leading-relaxed">
                    <p className="text-lg leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300">{selectedProject.fullDescription || selectedProject.description}</p>
                  </div>

                  {/* Section Extraits de Code Agrandie & Élargie (Grand format visible) */}
                  {codeBlocks.length > 0 && activeCodeBlock && (() => {
                    const activeBadge = getLanguageBadge(activeCodeBlock.language);
                    return (
                      <div id="project-code-section" className="mb-10 w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative group bg-[#121214]">
                        
                        {/* Onglets si plusieurs extraits de code (Python, TypeScript, SQL...) - Style mature */}
                        {codeBlocks.length > 1 && (
                          <div className="bg-[#101012] px-4 pt-3 pb-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                            {codeBlocks.map((block, idx) => {
                              const isTabActive = idx === activeCodeBlockIndex;
                              const bBadge = getLanguageBadge(block.language);
                              const name = block.title || `Extrait ${bBadge.label}`;
                              return (
                                <button
                                  key={block.id || idx}
                                  type="button"
                                  onClick={() => setActiveCodeBlockIndex(idx)}
                                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                                    isTabActive
                                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isTabActive ? 'bg-white' : bBadge.dotColor}`}></span>
                                  <span>{name}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal normal-case ${isTabActive ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-500'}`}>
                                    {block.code.split('\n').length} l.
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Header du bloc de code actif - Design Pro mature */}
                        <div className="bg-[#18181b] px-5 py-3.5 text-xs font-mono flex flex-wrap gap-3 items-center justify-between border-b border-zinc-800 text-zinc-300">
                          <div className="flex items-center gap-3">
                            {/* Traffic light dots */}
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
                              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
                              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs text-zinc-100 font-bold uppercase tracking-wider pl-1">
                              <span className={`w-2 h-2 rounded-full ${activeBadge.dotColor} shadow-[0_0_8px_rgba(52,211,153,0.6)]`}></span>
                              <span>EXTRAIT {activeBadge.label.toUpperCase()}</span>
                              <span className="text-[11px] font-normal text-zinc-400 font-mono tracking-normal normal-case">
                                ({activeCodeBlock.code.split('\n').length} lignes)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-bold tracking-wider uppercase border border-zinc-700">
                              {activeBadge.tag}
                            </span>

                            {/* Bouton Pleine Largeur */}
                            <button
                              type="button"
                              onClick={() => setIsCodeWideMode(!isCodeWideMode)}
                              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg active:scale-95 transition cursor-pointer font-medium ${
                                isCodeWideMode
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-zinc-200'
                              }`}
                              title={isCodeWideMode ? "Revenir à la vue partagée" : "Agrandir l'extrait sur toute la largeur"}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span className="normal-case">{isCodeWideMode ? 'Vue partagée' : 'Pleine largeur'}</span>
                            </button>

                            {/* Bouton Agrandir / Réduire la hauteur du code */}
                            <button
                              type="button"
                              onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition text-zinc-200 cursor-pointer font-medium"
                              title={isCodeExpanded ? "Restreindre la hauteur" : "Afficher tout le code sans contrainte"}
                            >
                              {isCodeExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                              <span className="normal-case">{isCodeExpanded ? 'Hauteur réduite' : 'Hauteur complète'}</span>
                            </button>

                            {/* Bouton Copier */}
                            <button
                              type="button"
                              onClick={() => handleCopyCode(activeCodeBlock.code)}
                              className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white cursor-pointer font-semibold shadow-sm"
                              title="Copier le code"
                            >
                              {copiedCode ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span className="normal-case">Copié !</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="normal-case">Copier</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Notice non-divulgation sobre & pro */}
                        <div className="px-5 py-2 bg-blue-950/30 border-b border-blue-900/30 text-[11px] text-blue-300 flex items-center justify-between font-mono">
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Extrait ciblé sécurisé (protection de la propriété intellectuelle)</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Sécurisé</span>
                        </div>
                        
                        {/* Zone d'extrait de code élargie avec hauteur généreuse et scroll libre */}
                        <div 
                          className={`overflow-x-auto bg-[#18181b] p-3 sm:p-5 custom-scrollbar transition-all duration-300 ${
                            isCodeExpanded 
                              ? 'max-h-none h-auto' 
                              : 'min-h-[360px] sm:min-h-[460px] max-h-[620px] overflow-y-auto'
                          }`}
                          style={{ overscrollBehavior: 'contain' }}
                        >
                          <SyntaxHighlighter
                            language={normalizeLanguage(activeCodeBlock.language)}
                            style={vscDarkPlus}
                            customStyle={{ 
                              margin: 0, 
                              padding: '1.25rem', 
                              background: 'transparent',
                              fontSize: '0.94rem',
                              lineHeight: '1.65'
                            }}
                            showLineNumbers={true}
                            wrapLongLines={false}
                          >
                            {activeCodeBlock.code}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actions et liens externes (sans mt-auto pour permettre le scroll fluide vers le bas) */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-black/10 dark:border-white/10 shrink-0">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>Voir en ligne</span>
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-black/5 dark:bg-white/10 text-inherit px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/20 transition"
                      >
                        <Github className="w-5 h-5" />
                        Code Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Modal Plein Écran / Lightbox pour zoom maximal */}
            <AnimatePresence>
              {isLightboxOpen && projectImages[activeImageIndex] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
                  onClick={() => setIsLightboxOpen(false)}
                >
                  {/* Header Lightbox */}
                  <div className="flex items-center justify-between z-30" onClick={e => e.stopPropagation()}>
                    <div className="text-white font-medium text-sm flex items-center gap-2">
                      <span className="font-bold">{selectedProject.title}</span>
                      {projectImages.length > 1 && (
                        <span className="text-zinc-400 font-mono text-xs">({activeImageIndex + 1} / {projectImages.length})</span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsLightboxOpen(false)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                      aria-label="Fermer le plein écran"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Image Centrale Plein Écran */}
                  <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6" onClick={e => e.stopPropagation()}>
                    <img
                      src={projectImages[activeImageIndex]}
                      alt={selectedProject.title}
                      className="max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
                    />
                    {projectImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : projectImages.length - 1))}
                          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition shadow-lg hover:scale-105 active:scale-95"
                          title="Image précédente"
                        >
                          <ChevronLeft className="w-7 h-7" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev < projectImages.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition shadow-lg hover:scale-105 active:scale-95"
                          title="Image suivante"
                        >
                          <ChevronRight className="w-7 h-7" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Galerie Miniatures Lightbox */}
                  {projectImages.length > 1 && (
                    <div className="flex justify-center gap-2 overflow-x-auto py-2 z-30" onClick={e => e.stopPropagation()}>
                      {projectImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-14 h-10 rounded-md overflow-hidden border-2 transition ${
                            activeImageIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
