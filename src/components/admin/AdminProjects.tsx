import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Project, CodeBlock, ProjectsLayoutType } from '../../types';
import { uploadImageToStorage } from '../../firebase';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  extractProjectCodeBlocks, 
  normalizeLanguage, 
  getLanguageIcon, 
  getLanguageBadge,
  getLanguageDisplayName,
  POPULAR_QUICK_LANGUAGES
} from '../../utils/codeSnippetUtils';
import { toast } from 'sonner';
import { 
  Upload, 
  Star, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  Code2,
  Loader2,
  Wand2,
  Eye,
  Edit3,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Github,
  LayoutGrid,
  Grid,
  BookOpen,
  SlidersHorizontal,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const SUGGESTED_LANGUAGES = [
  'Python',
  'TypeScript',
  'React',
  'SQL',
  'Bash',
  'JavaScript',
  'Rust',
  'Go',
  'Docker',
  'HTML/CSS',
  'Tailwind',
  'Vue.js',
  'Java',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Solidity',
  'GraphQL',
  'YAML',
  'JSON',
  'Markdown'
];

export function AdminProjects() {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    reorderProjects, 
    siteConfig, 
    setProjectsLayout 
  } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [tagsInput, setTagsInput] = useState('');
  
  // Layout and reordering state
  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const currentLayout: ProjectsLayoutType = siteConfig?.projectsLayout || siteConfig?.projectsSettings?.layout || 'mosaic';

  // Images management: index 0 is the primary image, indices 1..n are extraImages (max 10 total)
  const [images, setImages] = useState<string[]>([]);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgError, setImgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-snippets (Code Blocks)
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [activeCodeBlockTab, setActiveCodeBlockTab] = useState<number>(0);
  const [codeViewMode, setCodeViewMode] = useState<'editor' | 'preview'>('editor');
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [showFullProjectPreview, setShowFullProjectPreview] = useState(false);

  // Reorder Handlers
  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const list = [...projects];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    reorderProjects(list);
    toast.success(`Projet "${moved.title}" placé en position #${targetIndex + 1} !`);
  };

  const moveProjectToTop = (index: number) => {
    if (index === 0) return;
    const list = [...projects];
    const [moved] = list.splice(index, 1);
    list.unshift(moved);
    reorderProjects(list);
    toast.success(`Projet "${moved.title}" placé en 1ère position (En premier) !`);
  };

  const handleProjectDragStart = (e: React.DragEvent, index: number) => {
    setDraggedProjectIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleProjectDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedProjectIndex === null || draggedProjectIndex === dropIndex) {
      setDraggedProjectIndex(null);
      return;
    }

    const list = [...projects];
    const [moved] = list.splice(draggedProjectIndex, 1);
    list.splice(dropIndex, 0, moved);

    reorderProjects(list);
    toast.success(`Projet "${moved.title}" déplacé en position #${dropIndex + 1} !`);
    setDraggedProjectIndex(null);
  };

  const handleSelectLayout = (layout: ProjectsLayoutType) => {
    setProjectsLayout(layout);
    const layoutNames: Record<ProjectsLayoutType, string> = {
      mosaic: 'Mosaïque (Bento)',
      'equal-grid': 'Mosaïque Égaux',
      album: 'Album',
      slider: 'Slide'
    };
    toast.success(`Affichage portfolio configuré sur "${layoutNames[layout]}" !`);
  };

  // Fast snippet sample helper to help users see immediate mature excerpts
  const handleInsertSampleSnippet = (lang: string) => {
    const norm = normalizeLanguage(lang);
    let sample = '';
    switch (norm) {
      case 'python':
        sample = `# Extrait d'algorithme sécurisé (non-divulgation de fichier intégral)
def sanitize_data_pipeline(records: list[dict]) -> dict:
    valid_entries = [r for r in records if r.get("active") and not r.get("archived")]
    return {
        "processed_count": len(valid_entries),
        "checksum": hash(tuple(valid_entries)),
        "status": "ready"
    }`;
        break;
      case 'typescript':
        sample = `// Extrait d'architecture de typage et de gestion d'état
export interface PipelineConfig<T> {
  readonly id: string;
  transform: (data: T) => Promise<T>;
  onError?: (err: Error) => void;
}

export async function executePipeline<T>(input: T, steps: PipelineConfig<T>[]): Promise<T> {
  return steps.reduce(async (prev, step) => step.transform(await prev), Promise.resolve(input));
}`;
        break;
      case 'jsx':
      case 'tsx':
        sample = `// Extrait de composant d'interface réactif
export function FeatureCard({ title, badge, onAction }: CardProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="p-5 rounded-2xl border border-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-base">{title}</h4>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20">{badge}</span>
      </div>
      <button onClick={onAction} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">
        Activer
      </button>
    </div>
  );
}`;
        break;
      case 'sql':
        sample = `-- Extrait de requête analytique optimisée
SELECT 
    DATE_TRUNC('month', created_at) AS report_month,
    COUNT(id) AS total_transactions,
    ROUND(SUM(amount)::numeric, 2) AS gross_revenue
FROM user_transactions
WHERE status = 'confirmed' AND deleted_at IS NULL
GROUP BY report_month
ORDER BY report_month DESC
LIMIT 12;`;
        break;
      case 'bash':
        sample = `#!/usr/bin/env bash
# Extrait de script d'automatisation de déploiement
set -euo pipefail

echo "==> Vérification des dépendances et du build..."
npm run build -- --mode=production
echo "==> Déploiement complété avec succès ! 🚀"`;
        break;
      default:
        sample = `// Extrait représentatif de code (${lang})
function processItem(item) {
  // Logique métier ciblée
  return { ...item, timestamp: Date.now() };
}`;
    }

    if (codeBlocks[activeCodeBlockTab]) {
      handleUpdateCodeBlock(activeCodeBlockTab, {
        language: lang,
        title: `Extrait ${getLanguageDisplayName(lang)}`,
        code: sample
      });
    }
  };

  const handleEdit = (project: Project) => {
    setIsNewProject(false);
    setIsEditing(project.id);
    setFormData({ ...project });
    setTagsInput(Array.isArray(project.tags) ? project.tags.join(', ') : (typeof (project as any).tags === 'string' ? (project as any).tags : ''));
    
    // Combine primary imageUrl + extraImages into single ordered list
    const allImgs = [project.imageUrl, ...(project.extraImages || [])].filter((img): img is string => typeof img === 'string' && img.trim() !== '');
    setImages(allImgs);
    setImgError(null);
    setImgUrlInput('');

    // Extract code blocks
    const extractedBlocks = extractProjectCodeBlocks(project);
    setCodeBlocks(extractedBlocks.length > 0 ? extractedBlocks : [{
      id: 'block-0',
      language: (project.codeLanguages && project.codeLanguages[0]) || project.codeLanguage || 'TypeScript',
      title: 'Extrait principal',
      code: project.codeSnippet || ''
    }]);
    setActiveCodeBlockTab(0);
    setCodeViewMode('editor');
  };

  const handleAddNew = () => {
    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setIsNewProject(true);
    setIsEditing(newId);
    setFormData({ 
      id: newId, 
      title: '', 
      description: '', 
      fullDescription: '',
      tags: [], 
      githubUrl: '', 
      liveUrl: '', 
      imageUrl: '',
      extraImages: [],
      codeSnippet: '',
      codeLanguage: 'python',
      codeLanguages: ['python'],
      codeBlocks: []
    });
    setTagsInput('');
    setImages([]);
    setImgError(null);
    setImgUrlInput('');
    setCodeBlocks([{
      id: 'block-0',
      language: 'Python',
      title: 'Extrait Python',
      code: ''
    }]);
    setActiveCodeBlockTab(0);
    setCodeViewMode('editor');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setTagsInput(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // State for upload and save loading
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Image upload via file browser (1 to 10 images max)
  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableSlots = 10 - images.length;
    if (availableSlots <= 0) {
      setImgError('La limite de 10 images maximum par projet est atteinte.');
      e.target.value = '';
      return;
    }

    const filesToRead = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      setImgError(`Seules les ${availableSlots} premières images ont été ajoutées pour respecter le maximum de 10.`);
    } else {
      setImgError(null);
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToRead.map((file) => uploadImageToStorage(file, 'projects'));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean);
      setImages((prev) => [...prev, ...validUrls]);
      setImgError(null);
    } catch (err) {
      console.warn('[Upload] Image upload notice:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Add image by URL
  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = imgUrlInput.trim();
    if (!trimmed) return;
    if (images.length >= 10) {
      setImgError('La limite de 10 images maximum par projet est atteinte.');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImgUrlInput('');
    setImgError(null);
  };

  // Set image as primary (moves it to index 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  // Move image left (earlier in order)
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move image right (later in order)
  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImgError(null);
  };

  /**
   * Code block handlers: flexible, dynamic, and non-frozen
   */
  const handleQuickAddOrSwitchLanguage = (lang: string) => {
    const activeBlock = codeBlocks[activeCodeBlockTab];
    // If current block is completely empty (no code written yet), switch its language seamlessly
    if (activeBlock && (!activeBlock.code || activeBlock.code.trim() === '')) {
      handleUpdateCodeBlock(activeCodeBlockTab, {
        language: lang,
        title: `Extrait ${getLanguageDisplayName(lang)}`
      });
      return;
    }

    // Otherwise, create a new snippet block with this language
    const newBlock: CodeBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      language: lang,
      title: `Extrait ${getLanguageDisplayName(lang)}`,
      code: ''
    };
    setCodeBlocks(prev => [...prev, newBlock]);
    setActiveCodeBlockTab(codeBlocks.length);
    setCodeViewMode('editor');
  };

  const handleUpdateCodeBlock = (index: number, updated: Partial<CodeBlock>) => {
    setCodeBlocks(prev => prev.map((b, i) => i === index ? { ...b, ...updated } : b));
  };

  const handleRemoveCodeBlock = (index: number) => {
    if (codeBlocks.length <= 1) {
      handleUpdateCodeBlock(0, { code: '', title: 'Extrait principal', language: 'Python' });
      return;
    }
    setCodeBlocks(prev => prev.filter((_, i) => i !== index));
    setActiveCodeBlockTab(prev => Math.max(0, Math.min(prev, codeBlocks.length - 2)));
  };

  const handleMoveCodeBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === codeBlocks.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    setCodeBlocks(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
    setActiveCodeBlockTab(target);
  };

  const handleAutoDetectMarkdown = (index: number) => {
    const block = codeBlocks[index];
    if (!block || !block.code) return;
    const parsed = extractProjectCodeBlocks({ codeSnippet: block.code });
    if (parsed.length > 1) {
      setCodeBlocks(prev => {
        const next = [...prev];
        next.splice(index, 1, ...parsed);
        return next;
      });
      setActiveCodeBlockTab(index);
    }
  };

  const handleCopyCurrentSnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2000);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Veuillez renseigner un titre pour le projet.');
      return;
    }
    
    try {
      const primaryImg = images[0] || '';
      const otherImgs = images.slice(1);

      // Clean and validate code blocks - preserve even 1-line excerpts
      const validBlocks = codeBlocks.filter(b => b && typeof b.code === 'string' && b.code.trim() !== '');
      const blocksToSave = validBlocks.length > 0 ? validBlocks : codeBlocks;
      const allLanguages = Array.from(new Set(
        blocksToSave.map(b => (b.language || 'typescript').trim()).filter(Boolean)
      ));

      const primarySnippet = validBlocks[0]?.code || codeBlocks[0]?.code || '';
      const primaryLang = validBlocks[0]?.language || codeBlocks[0]?.language || 'python';

      // Always guarantee a unique ID for new projects
      const finalId = isNewProject 
        ? (formData.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`)
        : (isEditing || formData.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

      const projectToSave: Project = {
        id: finalId,
        title: formData.title || '',
        description: formData.description || '',
        fullDescription: formData.fullDescription || '',
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        githubUrl: formData.githubUrl || '',
        liveUrl: formData.liveUrl || '',
        imageUrl: primaryImg,
        extraImages: otherImgs,
        codeBlocks: blocksToSave,
        codeSnippet: primarySnippet,
        codeLanguages: allLanguages.length > 0 ? allLanguages : [primaryLang],
        codeLanguage: primaryLang,
      };

      if (isNewProject) {
        addProject(projectToSave);
        toast.success(`Nouveau projet "${projectToSave.title}" ajouté avec succès !`);
      } else {
        updateProject(finalId, projectToSave);
        toast.success(`Projet "${projectToSave.title}" mis à jour avec succès !`);
      }
      
      // Immediately close modal & reset
      setIsEditing(null);
      setIsNewProject(false);
      setFormData({});
    } catch (err) {
      console.error('[Admin] Error saving project:', err);
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    const currentActiveBlock = codeBlocks[activeCodeBlockTab] || codeBlocks[0];
    const hasCodeContent = Boolean(currentActiveBlock?.code && currentActiveBlock.code.trim().length > 0);

    return (
      <div className="max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-2xl font-display font-bold">
              {projects.find(p => p.id === isEditing) ? 'Éditer le projet' : 'Nouveau projet'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Configurez le titre, les images de couverture, les tags et les extraits de code ciblés.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFullProjectPreview(p => !p)}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>{showFullProjectPreview ? 'Masquer aperçu carte' : 'Aperçu rendu carte'}</span>
            </button>
          </div>
        </div>

        {/* Live Project Card Test Preview Drawer */}
        {showFullProjectPreview && (
          <div className="mb-8 p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Rendu en direct de la carte sur le portfolio</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Vue visiteur</span>
            </div>

            <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {images[0] ? (
                  <img src={images[0]} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                    Aucune image
                  </div>
                )}
                {currentActiveBlock?.code && (() => {
                  const b = getLanguageBadge(currentActiveBlock.language);
                  return (
                    <div className="absolute top-2.5 left-2.5 bg-zinc-950/85 backdrop-blur-md text-zinc-200 text-[11px] px-2.5 py-0.5 rounded font-mono flex items-center gap-1.5 border border-zinc-700/60">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.dotColor}`}></span>
                      <span>{b.label} · {b.tag}</span>
                    </div>
                  );
                })()}
              </div>
              <div className="p-5">
                <h4 className="text-base font-semibold font-display text-zinc-900 dark:text-white">{formData.title || 'Titre du projet'}</h4>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{formData.description || 'Description courte du projet...'}</p>
                
                {/* Code snippet preview badge */}
                {codeBlocks.some(b => b.code && b.code.trim()) && (() => {
                  const b = getLanguageBadge(currentActiveBlock?.language || 'python');
                  return (
                    <div className="mt-3 p-2.5 rounded-lg bg-zinc-900 text-zinc-200 text-[11px] font-mono border border-zinc-800">
                      <div className="flex items-center justify-between mb-1 opacity-80">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${b.dotColor}`}></span>
                          <span>{currentActiveBlock?.title || `Extrait ${b.label}`}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{currentActiveBlock?.code ? currentActiveBlock.code.split('\n').length : 0} lignes</span>
                      </div>
                      <p className="truncate text-zinc-400 text-xs font-mono">
                        {currentActiveBlock?.code?.split('\n')[0] || '// Aucun code'}
                      </p>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap gap-1 mt-3">
                  {tagsInput.split(',').filter(Boolean).map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-8">
          {/* Main Info */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Titre du projet</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title || ''} 
              onChange={handleChange} 
              placeholder="Ex: Système d'Analyse Temps Réel"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-zinc-500 text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Description de la carte (courte)</label>
            <textarea 
              name="description" 
              value={formData.description || ''} 
              onChange={handleChange} 
              placeholder="Courte description affichée sur la grille de projets..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 min-h-[85px] text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Description complète (Détails de la modale)</label>
            <textarea 
              name="fullDescription" 
              value={formData.fullDescription || ''} 
              onChange={handleChange} 
              placeholder="Détails complets de conception, architecture, défis relevés..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 min-h-[120px] text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Tags & Technologies (séparés par des virgules)</label>
            <input 
              type="text" 
              name="tags" 
              value={tagsInput} 
              onChange={handleChange} 
              placeholder="Python, FastAPI, TypeScript, PostgreSQL, Docker"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 text-sm" 
            />
          </div>

          {/* Section Gestion des Images (Multi-images & Réorganisation) */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-display font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  <ImageIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span>Galerie photos du projet ({images.length}/10 max)</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  La 1ère image sert de couverture principale. Réorganisez l'ordre par glisser ou boutons.
                </p>
              </div>

              {/* Parcourir Button */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/*" 
                  onChange={handleFilesSelect} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 10 || isUploading}
                  className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 disabled:opacity-50 rounded-lg text-xs font-medium transition flex items-center gap-2 hover:opacity-90 shadow-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Téléversement...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Parcourir images</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional URL addition */}
            <div className="flex gap-2">
              <input
                type="text"
                value={imgUrlInput}
                onChange={(e) => setImgUrlInput(e.target.value)}
                placeholder="Ou coller une URL d'image web (https://...)"
                disabled={images.length >= 10}
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={!imgUrlInput.trim() || images.length >= 10}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 transition flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {imgError && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-500" />
                <span>{imgError}</span>
              </div>
            )}

            {/* Images Grid */}
            {images.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition bg-zinc-50/50 dark:bg-zinc-950/50"
              >
                <Upload className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Aucune photo importée pour le moment
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Cliquez ici pour sélectionner des images depuis votre appareil (PNG, JPG, WebP)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {images.map((img, idx) => {
                  if (!img || typeof img !== 'string' || img.trim() === '') return null;
                  const isPrimary = idx === 0;
                  return (
                    <div 
                      key={idx}
                      className={`relative group bg-zinc-50 dark:bg-zinc-950 rounded-xl border transition-all overflow-hidden flex flex-col ${
                        isPrimary 
                          ? 'border-zinc-900 dark:border-white ring-1 ring-zinc-900/10 dark:ring-white/10' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                          #{idx + 1}
                        </div>
                        {isPrimary && (
                          <div className="absolute top-2 right-2 bg-zinc-950/85 dark:bg-white/95 text-white dark:text-zinc-950 text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 shadow-xs border border-white/10 dark:border-black/10">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Couverture</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 text-zinc-200 hover:text-white rounded-md shadow-xs transition"
                          title="Supprimer cette image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2.5 flex items-center justify-between gap-1.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                        {!isPrimary ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium flex items-center gap-1 transition"
                          >
                            <Star className="w-3 h-3 text-zinc-400" />
                            <span>Définir couverture</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-medium">Image principale</span>
                        )}

                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleMoveLeft(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-25 transition text-zinc-600 dark:text-zinc-400"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRight(idx)}
                            disabled={idx === images.length - 1}
                            className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-25 transition text-zinc-600 dark:text-zinc-400"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECTION EXTRAITS DE CODE & MULTI-LANGAGES DYNAMIQUES */}
          {/* ======================================================== */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-display font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  <Code2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span>Extraits de code & Architecture ({codeBlocks.length})</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Insérez des extraits représentatifs de votre code. Saisie libre et non restreinte.
                </p>
              </div>
              
              {/* BOUTONS RAPIDES MONOCHROMES (+ Python, + TypeScript, etc.) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline">
                  Ajout rapide :
                </span>
                {POPULAR_QUICK_LANGUAGES.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleQuickAddOrSwitchLanguage(q.name)}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 rounded-md text-[11px] font-mono transition"
                    title={`Ajouter ou passer en ${q.name}`}
                  >
                    <span className="font-semibold">+ {q.name}</span>
                    <span className="text-[10px] opacity-40 ml-1">[{q.tag}]</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note de confidentialité & Sécurité professionnelle */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs flex items-start gap-2.5 text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Recommandation de non-divulgation :</span>{' '}
                N'entrez pas un fichier entier sous secret professionnel. Insérez uniquement un <strong>extrait concis et représentatif</strong> (signature d'algorithme, typage, pipeline ou requête).
              </div>
            </div>

            {/* Onglets des extraits configurés */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 custom-scrollbar">
              {codeBlocks.map((block, idx) => {
                const isTabActive = idx === activeCodeBlockTab;
                const badge = getLanguageBadge(block.language);
                const title = block.title || getLanguageDisplayName(block.language);
                const lineCount = block.code ? block.code.split('\n').length : 0;

                return (
                  <button
                    key={block.id || idx}
                    type="button"
                    onClick={() => setActiveCodeBlockTab(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                      isTabActive
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}></span>
                    <span>{title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isTabActive 
                        ? 'bg-white/20 dark:bg-black/20 text-inherit' 
                        : 'bg-black/5 dark:bg-white/5 text-zinc-500'
                    }`}>
                      {lineCount} l.
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleQuickAddOrSwitchLanguage('Python')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 border border-dashed border-zinc-300 dark:border-zinc-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvel extrait</span>
              </button>
            </div>

            {/* Édition / Aperçu du bloc de code actif */}
            {currentActiveBlock && (() => {
              const hasMarkdownFences = currentActiveBlock.code.includes('```');
              const lines = currentActiveBlock.code ? currentActiveBlock.code.split('\n').length : 0;

              return (
                <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  {/* Barre d'outils du bloc */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* Champ Langage Libre & Dynamique */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                          Langage (saisie libre)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <input
                              type="text"
                              list="language-suggestions"
                              value={currentActiveBlock.language}
                              onChange={(e) => handleUpdateCodeBlock(activeCodeBlockTab, { 
                                language: e.target.value,
                                title: currentActiveBlock.title === `Extrait ${getLanguageDisplayName(currentActiveBlock.language)}`
                                  ? `Extrait ${getLanguageDisplayName(e.target.value)}`
                                  : currentActiveBlock.title
                              })}
                              placeholder="ex: Python, TypeScript, SQL..."
                              className="w-36 sm:w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-zinc-500"
                            />
                            <datalist id="language-suggestions">
                              {SUGGESTED_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </datalist>
                          </div>
                          
                          {(() => {
                            const b = getLanguageBadge(currentActiveBlock.language);
                            return (
                              <span className="px-2 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${b.dotColor}`}></span>
                                <span>{b.tag}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Titre de l'onglet */}
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                          Titre descriptif
                        </label>
                        <input
                          type="text"
                          value={currentActiveBlock.title || ''}
                          onChange={(e) => handleUpdateCodeBlock(activeCodeBlockTab, { title: e.target.value })}
                          placeholder={`ex: Extrait ${currentActiveBlock.language}`}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Mode Bascule : Éditeur vs Aperçu */}
                    <div className="flex items-center gap-2 self-start lg:self-center">
                      <div className="flex items-center p-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setCodeViewMode('editor')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                            codeViewMode === 'editor'
                              ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Édition</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCodeViewMode('preview')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                            codeViewMode === 'preview'
                              ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aperçu syntaxique</span>
                        </button>
                      </div>

                      {hasMarkdownFences && (
                        <button
                          type="button"
                          onClick={() => handleAutoDetectMarkdown(activeCodeBlockTab)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                          title="Détecter et scinder automatiquement les blocs ``` en onglets séparés"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Scinder blocs</span>
                        </button>
                      )}

                      {/* Déplacement & Suppression */}
                      <button
                        type="button"
                        onClick={() => handleMoveCodeBlock(activeCodeBlockTab, 'up')}
                        disabled={activeCodeBlockTab === 0}
                        title="Déplacer vers la gauche"
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 transition text-zinc-600 dark:text-zinc-400"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCodeBlock(activeCodeBlockTab, 'down')}
                        disabled={activeCodeBlockTab === codeBlocks.length - 1}
                        title="Déplacer vers la droite"
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 transition text-zinc-600 dark:text-zinc-400"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCodeBlock(activeCodeBlockTab)}
                        title="Supprimer cet extrait de code"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chips de changement instantané de langage pour ce bloc */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 font-medium">Formatage :</span>
                    {POPULAR_QUICK_LANGUAGES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleUpdateCodeBlock(activeCodeBlockTab, {
                            language: item.name,
                            title: `Extrait ${item.name}`
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1.5 border ${
                          normalizeLanguage(currentActiveBlock.language) === normalizeLanguage(item.name)
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white font-medium'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        <span>{item.name}</span>
                      </button>
                    ))}

                    {/* Insérer un extrait exemple */}
                    {!hasCodeContent && (
                      <button
                        type="button"
                        onClick={() => handleInsertSampleSnippet(currentActiveBlock.language)}
                        className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium flex items-center gap-1 transition"
                      >
                        <span>Insérer exemple</span>
                      </button>
                    )}
                  </div>

                  {/* Zone de code : Mode Édition ou Mode Aperçu du rendu */}
                  {codeViewMode === 'editor' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <span>Saisie de l'extrait ({currentActiveBlock.language})</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {lines > 0 ? `${lines} lignes` : '0 ligne'}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setCodeViewMode('preview')}
                          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 transition font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir aperçu syntaxique</span>
                        </button>
                      </div>
                      
                      <textarea
                        value={currentActiveBlock.code || ''}
                        onChange={(e) => handleUpdateCodeBlock(activeCodeBlockTab, { code: e.target.value })}
                        placeholder={
                          normalizeLanguage(currentActiveBlock.language) === 'python'
                            ? `# Insérez votre extrait Python concis...\ndef sanitize_payload(data: dict):\n    return {k: v for k, v in data.items() if v is not None}`
                            : `// Insérez votre extrait de code ${currentActiveBlock.language} ici...\n// N'insérez que les lignes significatives (quelques fonctions, types ou requêtes).`
                        }
                        className="w-full bg-[#18181b] text-zinc-200 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 min-h-[220px] leading-relaxed custom-scrollbar"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    /* APERÇU DE L'EXTRAIT DE CODE EN DIRECT */
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#18181b] shadow-inner">
                      {/* Entête de l'aperçu */}
                      <div className="bg-black/60 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800 text-xs font-mono text-zinc-300">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                            <span>{getLanguageIcon(currentActiveBlock.language)}</span>
                            <span>{currentActiveBlock.title || getLanguageDisplayName(currentActiveBlock.language)}</span>
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {lines} lignes
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-700">
                            {normalizeLanguage(currentActiveBlock.language)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCurrentSnippet(currentActiveBlock.code)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition"
                          >
                            {copiedCodeSnippet ? <Check className="w-3.5 h-3.5 text-zinc-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCodeSnippet ? 'Copié' : 'Copier'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Rendu syntaxique avec Prism */}
                      <div className="p-3 bg-[#1e1e1e] overflow-x-auto custom-scrollbar max-h-[380px]">
                        {currentActiveBlock.code && currentActiveBlock.code.trim() !== '' ? (
                          <SyntaxHighlighter
                            language={normalizeLanguage(currentActiveBlock.language)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '0.75rem',
                              background: 'transparent',
                              fontSize: '0.88rem',
                              lineHeight: '1.5'
                            }}
                            showLineNumbers={true}
                            wrapLongLines={false}
                          >
                            {currentActiveBlock.code}
                          </SyntaxHighlighter>
                        ) : (
                          <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                            Aucun code saisi pour cet extrait. Cliquez sur "Édition" pour saisir votre extrait.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* External Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">URL Dépôt GitHub</label>
              <input 
                type="text" 
                name="githubUrl" 
                value={formData.githubUrl || ''} 
                onChange={handleChange} 
                placeholder="https://github.com/..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">URL Démo en direct (Optionnel)</label>
              <input 
                type="text" 
                name="liveUrl" 
                value={formData.liveUrl || ''} 
                onChange={handleChange} 
                placeholder="https://..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 text-sm" 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button 
              type="button"
              onClick={() => setIsEditing(null)} 
              className="px-6 py-2.5 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
            >
              Annuler
            </button>
            <button 
              type="button"
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? 'Enregistrement dans Firebase...' : 'Sauvegarder le projet'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Gestion des Projets</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gérez vos réalisations, réorganisez l'ordre d'affichage sur le portfolio et configurez le type de mise en page.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={handleAddNew} 
            className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-medium shadow-xs hover:opacity-90 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un projet</span>
          </button>
        </div>
      </div>

      {/* Configuration du type d'affichage sur le portfolio (Mosaïque, Mosaïque Égaux, Album, Slide) */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-zinc-500" />
              <span>Type d'affichage sur le portfolio</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Choisissez comment vos réalisations sont présentées aux visiteurs.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 self-start sm:self-auto">
            Actif : {currentLayout === 'mosaic' ? 'Mosaïque (Bento)' : currentLayout === 'equal-grid' ? 'Mosaïque Égaux' : currentLayout === 'album' ? 'Album' : 'Slide (Carrousel)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Mosaïque */}
          <button
            type="button"
            onClick={() => handleSelectLayout('mosaic')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              currentLayout === 'mosaic'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Mosaïque (Bento)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${currentLayout === 'mosaic' ? 'bg-white/20 dark:bg-black/20 text-inherit' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                Par défaut
              </span>
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed">
              Grille asymétrique moderne alternant cartes larges et formats standards.
            </p>
          </button>

          {/* Mosaïque Égaux */}
          <button
            type="button"
            onClick={() => handleSelectLayout('equal-grid')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              currentLayout === 'equal-grid'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Mosaïque Égaux</span>
              <Grid className="w-3.5 h-3.5 opacity-60" />
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed">
              Grille uniforme et régulière avec cartes de dimensions parfaitement égales.
            </p>
          </button>

          {/* Album */}
          <button
            type="button"
            onClick={() => handleSelectLayout('album')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              currentLayout === 'album'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Album</span>
              <BookOpen className="w-3.5 h-3.5 opacity-60" />
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed">
              Présentation éditoriale immersive en fiches larges avec galerie visuelle.
            </p>
          </button>

          {/* Slide */}
          <button
            type="button"
            onClick={() => handleSelectLayout('slider')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              currentLayout === 'slider'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Slide</span>
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-60" />
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed">
              Carrousel horizontal interactif avec navigation tactile et pagination.
            </p>
          </button>
        </div>
      </div>

      {/* Reordering Instructions Banner */}
      <div className="p-3.5 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs flex items-center justify-between gap-3 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>
            <strong>Ordre d'affichage direct :</strong> Le projet <strong>#1</strong> s'affiche en premier, le projet <strong>#2</strong> juste à côté, etc. Glissez-déposez les lignes ou utilisez les flèches <strong>Monter</strong> / <strong>Descendre</strong>.
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 shrink-0">
          {projects.length} projets au total
        </span>
      </div>

      {/* Projects Table with Drag & Drop */}
      <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
              <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-36">Ordre / Rang</th>
              <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-20">Visuel</th>
              <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Titre & Technologies</th>
              <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 hidden md:table-cell">Extraits de Code</th>
              <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 hidden sm:table-cell">Galerie</th>
              <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              const totalImgs = [project.imageUrl, ...(project.extraImages || [])].filter((img): img is string => typeof img === 'string' && img.trim() !== '').length;
              const extractedCodeBlocks = extractProjectCodeBlocks(project);
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isLast = index === projects.length - 1;

              return (
                <tr 
                  key={project.id} 
                  draggable={true}
                  onDragStart={(e) => handleProjectDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleProjectDrop(e, index)}
                  className={`border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                    draggedProjectIndex === index ? 'opacity-30 bg-zinc-100 dark:bg-zinc-800' : ''
                  }`}
                >
                  {/* Ordre & Poignée de glisser-déposer */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span 
                        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
                        title="Glisser-déposer pour réorganiser"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>

                      <div className="flex flex-col">
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          isFirst 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                            : isSecond 
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          #{index + 1} {isFirst ? '· En premier' : isSecond ? '· À côté' : ''}
                        </span>

                        <div className="flex items-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => moveProject(index, 'up')}
                            disabled={isFirst}
                            title="Monter ce projet"
                            className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 transition text-zinc-600 dark:text-zinc-400"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveProject(index, 'down')}
                            disabled={isLast}
                            title="Descendre ce projet"
                            className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 transition text-zinc-600 dark:text-zinc-400"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {!isFirst && (
                            <button
                              type="button"
                              onClick={() => moveProjectToTop(index)}
                              title="Placer directement en premier sur le portfolio"
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                              Top
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Aperçu Visuel */}
                  <td className="py-3 px-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shrink-0">
                      {project.imageUrl && project.imageUrl.trim() !== '' ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Titre & Technologies */}
                  <td className="py-3 px-4 font-medium">
                    <div>
                      <span className="text-sm text-zinc-900 dark:text-zinc-100 block">{project.title}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(project.tags) ? project.tags : []).slice(0, 4).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Extraits de code */}
                  <td className="py-3 px-4 text-sm text-zinc-500 hidden md:table-cell">
                    {extractedCodeBlocks.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {extractedCodeBlocks.map((b, i) => (
                          <span 
                            key={b.id || i}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 text-xs font-mono font-medium flex items-center gap-1.5"
                          >
                            <span>{getLanguageIcon(b.language)}</span>
                            <span>{b.language}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">({b.code.split('\n').length} l.)</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 italic font-mono">Aucun extrait</span>
                    )}
                  </td>

                  {/* Galerie */}
                  <td className="py-3 px-4 text-sm text-zinc-500 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono border border-zinc-200/60 dark:border-zinc-700/60">
                      {totalImgs} {totalImgs > 1 ? 'photos' : 'photo'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleEdit(project)} 
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mr-2 border border-zinc-200/80 dark:border-zinc-700/60"
                    >
                      Éditer
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Supprimer le projet "${project.title}" ?`)) {
                          deleteProject(project.id);
                          toast.success(`Projet "${project.title}" supprimé.`);
                        }
                      }} 
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-transparent hover:border-red-200/60 dark:hover:border-red-900/40"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-sm font-medium">Aucun projet enregistré pour le moment.</p>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Commencez par ajouter votre premier projet avec ses photos, langages et extraits de code ciblés.
                    </p>
                    <button
                      onClick={handleAddNew}
                      className="mt-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-2 rounded-lg text-xs font-medium shadow-xs hover:opacity-90 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un premier projet</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
