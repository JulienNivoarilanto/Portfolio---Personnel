import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { CarouselItem } from '../../types';
import { SvgRenderer } from '../SvgRenderer';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  SlidersHorizontal, 
  Eye, 
  EyeOff, 
  Upload, 
  Sparkles, 
  Play, 
  Clock,
  Check,
  X,
  FileCode
} from 'lucide-react';
import { toast } from 'sonner';

// Curated high quality SVG templates that the user can pick in 1 click
const PRESET_SVG_TEMPLATES = [
  {
    name: 'Architecture Cloud & Systèmes',
    svg: `<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect x="20" y="20" width="360" height="360" rx="36" fill="url(#cloudGrad)" fill-opacity="0.08"/>
  <circle cx="200" cy="200" r="130" stroke="url(#cloudGrad)" stroke-width="2" stroke-dasharray="6 6" opacity="0.4"/>
  <circle cx="200" cy="200" r="90" fill="url(#cloudGrad)" fill-opacity="0.15"/>
  <path d="M260 215C258 185 233 162 202 165C178 140 137 150 128 183C105 190 95 215 108 238C117 252 133 260 150 260H255C275 260 290 245 290 225C290 207 277 195 260 215Z" fill="url(#cloudGrad)" filter="url(#glow)"/>
  <circle cx="140" cy="130" r="16" fill="#38bdf8" fill-opacity="0.8"/>
  <circle cx="290" cy="140" r="12" fill="#818cf8" fill-opacity="0.8"/>
  <circle cx="270" cy="290" r="14" fill="#6366f1" fill-opacity="0.8"/>
  <line x1="140" y1="130" x2="170" y2="170" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
  <line x1="290" y1="140" x2="250" y2="180" stroke="#818cf8" stroke-width="2" stroke-dasharray="3 3"/>
</svg>`
  },
  {
    name: 'Développement Full-Stack & Code',
    svg: `<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect x="30" y="50" width="340" height="300" rx="28" fill="#18181b" stroke="#27272a" stroke-width="3"/>
  <rect x="30" y="50" width="340" height="46" rx="28" fill="#27272a"/>
  <circle cx="65" cy="73" r="6" fill="#ef4444"/>
  <circle cx="85" cy="73" r="6" fill="#eab308"/>
  <circle cx="105" cy="73" r="6" fill="#22c55e"/>
  <path d="M120 170L70 210L120 250" stroke="url(#codeGrad)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M280 170L330 210L280 250" stroke="url(#codeGrad)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M220 150L180 270" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"/>
  <rect x="135" y="115" width="130" height="10" rx="5" fill="#3f3f46"/>
</svg>`
  },
  {
    name: 'Haute Performance & Vélocité',
    svg: `<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>
  <circle cx="200" cy="200" r="140" stroke="#27272a" stroke-width="8"/>
  <path d="M90 280A130 130 0 1 1 310 280" stroke="url(#perfGrad)" stroke-width="16" stroke-linecap="round" stroke-dasharray="16 8"/>
  <circle cx="200" cy="200" r="24" fill="#ef4444"/>
  <path d="M200 200L275 125" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="10" fill="#ffffff"/>
  <polygon points="190,70 210,70 200,95" fill="#f59e0b"/>
</svg>`
  },
  {
    name: 'Sécurité & Robustesse',
    svg: `<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <path d="M200 60L310 110V210C310 280 260 330 200 350C140 330 90 280 90 210V110L200 60Z" fill="url(#secGrad)" fill-opacity="0.15" stroke="url(#secGrad)" stroke-width="6"/>
  <path d="M200 100L280 138V210C280 260 240 298 200 315C160 298 120 260 120 210V138L200 100Z" fill="url(#secGrad)"/>
  <path d="M170 205L190 225L235 180" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    name: 'Design & Interaction UI/UX',
    svg: `<svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="uiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect x="60" y="70" width="280" height="260" rx="32" fill="#18181b" stroke="url(#uiGrad)" stroke-width="4"/>
  <circle cx="110" cy="120" r="22" fill="url(#uiGrad)"/>
  <rect x="150" y="110" width="150" height="20" rx="10" fill="#3f3f46"/>
  <rect x="100" y="170" width="200" height="12" rx="6" fill="#27272a"/>
  <rect x="100" y="200" width="160" height="12" rx="6" fill="#27272a"/>
  <rect x="100" y="245" width="110" height="36" rx="18" fill="url(#uiGrad)"/>
</svg>`
  }
];

export function AdminCarousel() {
  const { 
    siteConfig, 
    updateCarouselSettings, 
    addCarouselItem, 
    updateCarouselItem, 
    deleteCarouselItem, 
    reorderCarouselItems,
    updateSectionsVisibility 
  } = useStore();

  const carouselSettings = siteConfig?.carouselSettings || {
    enabled: true,
    slideDuration: 5,
    items: []
  };

  const isVisible = (siteConfig?.sectionsVisibility?.carousel !== false) && (carouselSettings.enabled !== false);
  const items = carouselSettings.items || [];
  const slideDuration = carouselSettings.slideDuration || 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [formData, setFormData] = useState<{ title: string; description: string; illustrationSvg: string }>({
    title: '',
    description: '',
    illustrationSvg: ''
  });
  const [svgSourceTab, setSvgSourceTab] = useState<'code' | 'upload' | 'presets'>('code');
  const [previewDarkBg, setPreviewDarkBg] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle overall section visibility
  const handleToggleVisibility = async () => {
    const nextState = !isVisible;
    await updateCarouselSettings({ enabled: nextState });
    await updateSectionsVisibility({ carousel: nextState });
    toast.success(nextState ? 'Carrousel visible sur le portfolio' : 'Carrousel masqué sur le portfolio');
  };

  // Change auto-slide duration
  const handleDurationChange = async (duration: number) => {
    const clamped = Math.max(2, Math.min(60, duration));
    await updateCarouselSettings({ slideDuration: clamped });
    toast.success(`Durée ajustée à ${clamped} secondes`);
  };

  // Open modal for new item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      illustrationSvg: ''
    });
    setSvgSourceTab('code');
    setIsModalOpen(true);
  };

  // Open modal for editing existing item
  const handleOpenEditModal = (item: CarouselItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      illustrationSvg: item.illustrationSvg || ''
    });
    setSvgSourceTab('code');
    setIsModalOpen(true);
  };

  // Handle SVG file upload via reader
  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      toast.error('Veuillez sélectionner un fichier SVG (.svg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setFormData((prev) => ({ ...prev, illustrationSvg: content }));
        toast.success(`SVG "${file.name}" importé avec succès !`);
      }
    };
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier SVG');
    };
    reader.readAsText(file);
    e.target.value = ''; // reset so same file can be chosen again
  };

  // Save item (add or update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Veuillez renseigner un titre');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Veuillez renseigner une description');
      return;
    }

    if (!formData.illustrationSvg.trim()) {
      toast.error('Veuillez renseigner une illustration SVG (code direct, fichier ou modèle)');
      return;
    }

    if (editingItem) {
      await updateCarouselItem(editingItem.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        illustrationSvg: formData.illustrationSvg.trim()
      });
      toast.success('Élément mis à jour avec succès');
    } else {
      await addCarouselItem({
        title: formData.title.trim(),
        description: formData.description.trim(),
        illustrationSvg: formData.illustrationSvg.trim()
      });
      toast.success('Nouvel élément ajouté au carrousel');
    }

    setIsModalOpen(false);
  };

  // Delete item with confirmation
  const handleDeleteItem = async (id: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'élément "${title}" ?`)) {
      await deleteCarouselItem(id);
      toast.success('Élément supprimé');
    }
  };

  // Move item up
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...items];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    await reorderCarouselItems(reordered);
  };

  // Move item down
  const handleMoveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const reordered = [...items];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    await reorderCarouselItems(reordered);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Carrousel & Vitrine Illustrée</h2>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isVisible 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {isVisible ? 'Section Active' : 'Section Masquée'}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
            Section automatique positionnée après les Compétences Techniques & Outils. Présente vos concepts clés avec de grandes illustrations SVG placées à gauche de chaque élément.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un élément</span>
        </button>
      </div>

      {/* Control Panel: Visibility & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Visibility Card */}
        <div className="p-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">Visibilité modulable</span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Affichage sur le portfolio</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Activez ou masquez la section entière instantanément sur le site public.
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${isVisible ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
              {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-xs text-zinc-500">
              État actuel : <strong className="text-zinc-900 dark:text-zinc-200">{isVisible ? 'Visible' : 'Masqué'}</strong>
            </span>
            <button
              onClick={handleToggleVisibility}
              className={`px-4 py-2 rounded-lg text-xs font-medium border transition ${
                isVisible 
                  ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
              }`}
            >
              {isVisible ? 'Masquer la section' : 'Activer la section'}
            </button>
          </div>
        </div>

        {/* Slide Duration Card */}
        <div className="p-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Carrousel automatique</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {slideDuration}s par slide
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Durée d'affichage de chaque slide</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Réglez le délai avant le glissement automatique vers l'élément suivant.
            </p>
          </div>

          <div className="space-y-3">
            {/* Slider */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={slideDuration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="flex-1 accent-zinc-900 dark:accent-white cursor-pointer"
              />
              <span className="font-mono text-sm font-semibold w-10 text-right">{slideDuration}s</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: '3s (Rapide)', val: 3 },
                { label: '5s (Idéal)', val: 5 },
                { label: '8s (Lecture)', val: 8 },
                { label: '12s (Détaillé)', val: 12 }
              ].map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => handleDurationChange(preset.val)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    slideDuration === preset.val
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Éléments du carrousel</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {items.length} {items.length > 1 ? 'éléments' : 'élément'}
            </span>
          </div>

          {items.length > 0 && (
            <span className="text-xs text-zinc-400">
              Utilisez les flèches pour réorganiser l'ordre d'affichage
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-[#121214]/50">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Aucun élément dans le carrousel</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6">
              Votre base de données Firestore ne contient aucun élément de carrousel pour l'instant. Ajoutez votre premier concept illustré pour le voir défiler.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un élément maintenant</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.id}
                className="p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                {/* Left Side: Large Illustration Thumbnail + Title & Description */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Illustration Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0 p-2 flex items-center justify-center overflow-hidden">
                    <SvgRenderer 
                      svgContent={item.illustrationSvg} 
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                        Diapositive #{index + 1}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right Side: Actions (Reorder, Edit, Delete) */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 mr-2 border-r border-zinc-100 dark:border-zinc-800 pr-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
                      title="Monter"
                      aria-label="Monter"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
                      title="Descendre"
                      aria-label="Descendre"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Supprimer cet élément"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {editingItem ? 'Modifier l\'élément du carrousel' : 'Ajouter un élément au carrousel'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Renseignez le titre, la description et l'illustration grand format (SVG).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-6">
              
              {/* Titre */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Architecture Cloud Haute Disponibilité"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ex: Conception d'infrastructures distribuées et résilientes sur Google Cloud et AWS, avec équilibrage de charge dynamique et déploiements sans interruption de service."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition resize-none leading-relaxed"
                />
              </div>

              {/* Illustration Grand (SVG) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Illustration Grand (SVG) — Placé à gauche de l'élément <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Source Tabs */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSvgSourceTab('code')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                        svgSourceTab === 'code' 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      Code SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSvgSourceTab('upload')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                        svgSourceTab === 'upload' 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      Fichier .svg
                    </button>
                    <button
                      type="button"
                      onClick={() => setSvgSourceTab('presets')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                        svgSourceTab === 'presets' 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' 
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Modèles prêts</span>
                    </button>
                  </div>
                </div>

                {/* SVG Source: Code */}
                {svgSourceTab === 'code' && (
                  <div>
                    <textarea
                      rows={5}
                      placeholder="<svg viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'> ... </svg>"
                      value={formData.illustrationSvg}
                      onChange={(e) => setFormData((prev) => ({ ...prev, illustrationSvg: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Vous pouvez coller du code SVG brut, un lien SVG ou une URL d'image vectorielle.
                    </p>
                  </div>
                )}

                {/* SVG Source: Upload File */}
                {svgSourceTab === 'upload' && (
                  <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 text-center">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept=".svg,image/svg+xml"
                      onChange={handleSvgFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-1">
                      Cliquez pour sélectionner un fichier SVG depuis votre ordinateur
                    </p>
                    <p className="text-[11px] text-zinc-400 mb-3">
                      Le contenu sera automatiquement extrait et sauvegardé dans Firestore.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition"
                    >
                      Choisir un fichier SVG
                    </button>
                  </div>
                )}

                {/* SVG Source: Presets */}
                {svgSourceTab === 'presets' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                    {PRESET_SVG_TEMPLATES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, illustrationSvg: preset.svg }));
                          toast.success(`Modèle "${preset.name}" sélectionné !`);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-2 transition ${
                          formData.illustrationSvg === preset.svg
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                        }`}
                      >
                        <div className="w-16 h-16 flex items-center justify-center">
                          <SvgRenderer svgContent={preset.svg} className="w-full h-full" />
                        </div>
                        <span className="text-[11px] font-medium text-center line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Illustration Preview */}
                {formData.illustrationSvg && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-zinc-500">
                        Aperçu de la Grande Illustration (côté gauche) :
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewDarkBg((prev) => !prev)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        Fond : {previewDarkBg ? 'Sombre' : 'Clair'}
                      </button>
                    </div>

                    <div className={`w-full h-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-6 overflow-hidden transition-colors ${
                      previewDarkBg ? 'bg-[#18181b]' : 'bg-zinc-100'
                    }`}>
                      <div className="w-44 h-44 flex items-center justify-center">
                        <SvgRenderer 
                          svgContent={formData.illustrationSvg}
                          alt="Aperçu SVG"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 transition shadow-sm"
                >
                  {editingItem ? 'Enregistrer les modifications' : 'Ajouter l\'élément'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
