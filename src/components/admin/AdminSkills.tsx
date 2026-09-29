import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../../store';
import { Skill } from '../../types';
import { uploadImageToStorage } from '../../firebase';
import { 
  Upload, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Layers, 
  Edit3, 
  Trash2, 
  ArrowUpDown,
  Search,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminSkills() {
  const { skills, addSkill, updateSkill, deleteSkill, reorderSkills, siteConfig, updateCategoryOrder } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isNewSkill, setIsNewSkill] = useState(false);
  const [formData, setFormData] = useState<Partial<Skill>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'categories' | 'table'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [draggedSkillId, setDraggedSkillId] = useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customCategoryOrder = siteConfig?.skillsSettings?.categoryOrder || [];

  // Group skills by category with current sorting
  const groupedSkills = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      const cat = (skill.category && skill.category.trim() !== '') ? skill.category.trim() : 'Autres';
      if (!map[cat]) {
        map[cat] = [];
      }
      map[cat].push(skill);
    });

    // Sort items within each category according to their order
    Object.keys(map).forEach((cat) => {
      map[cat].sort((a, b) => {
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order;
        }
        if (typeof a.order === 'number') return -1;
        if (typeof b.order === 'number') return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    });

    return map;
  }, [skills]);

  // Distinct list of categories ordered by customCategoryOrder
  const orderedCategories = useMemo(() => {
    const rawCategories = Array.from(new Set(skills.map(s => (s.category && s.category.trim() !== '') ? s.category.trim() : 'Autres')));
    
    // Also include any categories explicitly in customCategoryOrder even if currently 0 items
    customCategoryOrder.forEach(cat => {
      if (!rawCategories.includes(cat)) {
        rawCategories.push(cat);
      }
    });

    return rawCategories.sort((a, b) => {
      const idxA = customCategoryOrder.indexOf(a);
      const idxB = customCategoryOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [skills, customCategoryOrder]);

  const handleEdit = (skill: Skill) => {
    setIsNewSkill(false);
    setIsEditing(skill.id);
    setFormData({ ...skill });
  };

  const handleAddNew = (prefilledCategory?: string) => {
    const newId = `skill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const categoryToUse = prefilledCategory || orderedCategories[0] || 'Système';
    setIsNewSkill(true);
    setIsEditing(newId);
    setFormData({ id: newId, name: '', category: categoryToUse, iconUrl: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'skills', 256, 256);
      if (url) {
        setFormData(prev => ({ ...prev, iconUrl: url }));
      }
    } catch (err) {
      console.warn('[Skill Icon] Upload notice:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.category) {
      toast.error('Veuillez renseigner le nom et la catégorie de la compétence.');
      return;
    }
    
    const finalId = isNewSkill 
      ? (formData.id || `skill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      : (isEditing || formData.id || `skill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

    const cleanCategory = formData.category.trim();

    // Determine order: place at end of its category if new
    const categoryItems = groupedSkills[cleanCategory] || [];
    const maxOrderInCategory = categoryItems.reduce((max, s) => Math.max(max, s.order ?? 0), -1);

    const skillToSave: Skill = {
      id: finalId,
      name: formData.name.trim(),
      category: cleanCategory,
      iconUrl: formData.iconUrl || '',
      order: isNewSkill ? maxOrderInCategory + 1 : (formData.order ?? maxOrderInCategory + 1),
    };

    if (isNewSkill) {
      addSkill(skillToSave);
      toast.success(`Compétence "${skillToSave.name}" ajoutée à "${cleanCategory}" !`);
    } else {
      updateSkill(finalId, skillToSave);
      toast.success(`Compétence "${skillToSave.name}" mise à jour !`);
    }
    
    // Ensure category is in category order list if new
    if (!customCategoryOrder.includes(cleanCategory)) {
      updateCategoryOrder([...customCategoryOrder, cleanCategory]);
    }

    setIsEditing(null);
    setIsNewSkill(false);
    setFormData({});
  };

  // Reorder Categories
  const moveCategory = (categoryName: string, direction: 'up' | 'down') => {
    const currentList = [...orderedCategories];
    const index = currentList.indexOf(categoryName);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const [removed] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, removed);

    updateCategoryOrder(currentList);
    toast.success(`Catégorie "${categoryName}" placée en position #${targetIndex + 1} !`);
  };

  // Reorder Skills inside a category
  const moveSkillInCategory = (categoryName: string, skillId: string, direction: 'up' | 'down') => {
    const categoryList = [...(groupedSkills[categoryName] || [])];
    const index = categoryList.findIndex(s => s.id === skillId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoryList.length) return;

    const [removed] = categoryList.splice(index, 1);
    categoryList.splice(targetIndex, 0, removed);

    // Reassign order numbers to skills in this category
    const updatedCategorySkills = categoryList.map((skill, idx) => ({
      ...skill,
      order: idx
    }));

    // Merge back into all skills
    const otherSkills = skills.filter(s => s.category !== categoryName);
    const fullNewSkills = [...otherSkills, ...updatedCategorySkills];

    reorderSkills(fullNewSkills);
    toast.success(`Outil "${removed.name}" placé en position #${targetIndex + 1} de "${categoryName}" !`);
  };

  // HTML5 Drag and drop handlers for skills within a category
  const handleSkillDragStart = (e: React.DragEvent, skillId: string) => {
    e.stopPropagation();
    setDraggedSkillId(skillId);
    e.dataTransfer.setData('text/plain', skillId);
  };

  const handleSkillDrop = (e: React.DragEvent, categoryName: string, targetSkillId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSkillId || draggedSkillId === targetSkillId) {
      setDraggedSkillId(null);
      return;
    }

    const categoryList = [...(groupedSkills[categoryName] || [])];
    const fromIndex = categoryList.findIndex(s => s.id === draggedSkillId);
    const toIndex = categoryList.findIndex(s => s.id === targetSkillId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = categoryList.splice(fromIndex, 1);
      categoryList.splice(toIndex, 0, moved);

      const updatedCategorySkills = categoryList.map((s, idx) => ({
        ...s,
        order: idx
      }));

      const otherSkills = skills.filter(s => s.category !== categoryName);
      reorderSkills([...otherSkills, ...updatedCategorySkills]);
      toast.success(`"${moved.name}" déplacé à la position #${toIndex + 1} !`);
    }

    setDraggedSkillId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    const clean = newCategoryInput.trim();
    if (!orderedCategories.includes(clean)) {
      updateCategoryOrder([clean, ...customCategoryOrder]);
      toast.success(`Catégorie "${clean}" créée en 1ère position !`);
    }
    setNewCategoryInput('');
    setNewCategoryModalOpen(false);
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
          <h3 className="text-xl font-semibold tracking-tight">
            {skills.find(p => p.id === isEditing) ? 'Éditer la compétence' : 'Nouvelle compétence'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Définissez l'outil ou le langage, son icône et la catégorie d'affichage.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Nom de l'outil / langage
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-zinc-500" 
                placeholder="ex: Windows, React, PostgreSQL" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Catégorie (Groupe d'affichage)
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  name="category" 
                  list="category-suggestions"
                  value={formData.category || ''} 
                  onChange={handleChange} 
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-zinc-500" 
                  placeholder="ex: Système, Frontend, Cloud & DevOps" 
                />
                <datalist id="category-suggestions">
                  {orderedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </datalist>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Choisissez une catégorie existante ou saisissez-en une nouvelle.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Icône / Logo de la compétence
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input 
                type="text" 
                name="iconUrl" 
                value={formData.iconUrl || ''} 
                onChange={handleChange} 
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-zinc-500" 
                placeholder="URL d'image ou téléversez un logo (SVG, PNG...)" 
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,.svg" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 rounded-lg text-xs font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Téléversement...' : 'Téléverser'}</span>
              </button>
            </div>
          </div>
          
          {Boolean(formData.iconUrl && formData.iconUrl.trim() !== '') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Aperçu du logo
              </label>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl inline-flex items-center gap-3 border border-zinc-200 dark:border-zinc-700">
                <img src={formData.iconUrl} alt="Preview" className="w-10 h-10 object-contain" />
                <span className="text-xs text-zinc-500 font-mono">Format optimisé</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button 
              type="button"
              onClick={() => setIsEditing(null)} 
              className="px-5 py-2 rounded-lg text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="button"
              onClick={handleSave} 
              className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shadow-xs"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Compétences & Outils</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gérez vos catégories, organisez l'ordre des groupes et des éléments affichés sur le portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View switcher */}
          <div className="flex items-center p-0.5 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveViewMode('categories')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                activeViewMode === 'categories'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Par Catégories</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                activeViewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Liste globale</span>
            </button>
          </div>

          <button 
            onClick={() => setNewCategoryModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition text-zinc-800 dark:text-zinc-200 shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span>Nouvelle Catégorie</span>
          </button>

          <button 
            onClick={() => handleAddNew()} 
            className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un outil</span>
          </button>
        </div>
      </div>

      {/* Info notice about order */}
      <div className="p-3.5 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs flex items-start justify-between gap-3 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            <strong>Ordre d'affichage direct :</strong> Utilisez les boutons <strong>Monter</strong> / <strong>Descendre</strong> ou le glisser-déposer pour organiser l'ordre des catégories et des outils. Vos visiteurs verront le portfolio exactement dans cet ordre.
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-400 shrink-0">
          {orderedCategories.length} catégories · {skills.length} outils
        </div>
      </div>

      {/* Modal / Quick form for new category */}
      {newCategoryModalOpen && (
        <form onSubmit={handleCreateCategory} className="p-4 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="flex-1">
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Nom de la nouvelle catégorie (ex: Système, DevOps, Frontend...)"
              autoFocus
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-1.5 text-xs focus:outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:opacity-90 transition"
          >
            Créer catégorie
          </button>
          <button
            type="button"
            onClick={() => setNewCategoryModalOpen(false)}
            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Annuler
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VUE 1 : REGROUPÉ PAR CATÉGORIE (VUE PRINCIPALE DEMANDÉE)       */}
      {/* ------------------------------------------------------------- */}
      {activeViewMode === 'categories' ? (
        <div className="space-y-6">
          {orderedCategories.map((category, catIndex) => {
            const categorySkills = groupedSkills[category] || [];
            const isFirstCat = catIndex === 0;
            const isLastCat = catIndex === orderedCategories.length - 1;

            return (
              <div 
                key={category} 
                className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs transition-all"
              >
                {/* En-tête de catégorie avec contrôles d'ordre de la catégorie */}
                <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                      #{catIndex + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{category}</span>
                        {isFirstCat && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            Affiché en 1er sur le portfolio
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {categorySkills.length} {categorySkills.length > 1 ? 'outils enregistrés' : 'outil enregistré'}
                      </span>
                    </div>
                  </div>

                  {/* Contrôles de tri de la catégorie */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => moveCategory(category, 'up')}
                      disabled={isFirstCat}
                      title="Afficher cette catégorie plus haut sur le portfolio"
                      className="p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition flex items-center gap-1 text-xs"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Monter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(category, 'down')}
                      disabled={isLastCat}
                      title="Afficher cette catégorie plus bas sur le portfolio"
                      className="p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition flex items-center gap-1 text-xs"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Descendre</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddNew(category)}
                      className="ml-2 px-3 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition text-xs font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter dans {category}</span>
                    </button>
                  </div>
                </div>

                {/* Liste des compétences dans cette catégorie avec réorganisation élément par élément */}
                {categorySkills.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                    Aucun outil dans cette catégorie. Cliquez sur "Ajouter dans {category}" ci-dessus.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {categorySkills.map((skill, skillIndex) => {
                      const isFirstSkill = skillIndex === 0;
                      const isLastSkill = skillIndex === categorySkills.length - 1;

                      return (
                        <div
                          key={skill.id}
                          draggable={true}
                          onDragStart={(e) => handleSkillDragStart(e, skill.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleSkillDrop(e, category, skill.id)}
                          className={`p-3 sm:px-5 sm:py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors ${
                            draggedSkillId === skill.id ? 'opacity-40 bg-zinc-100 dark:bg-zinc-800' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span 
                              className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              title="Glisser-déposer pour réorganiser"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>

                            <span className="w-5 text-[11px] font-mono text-zinc-400 font-semibold text-center">
                              #{skillIndex + 1}
                            </span>

                            {skill.iconUrl && skill.iconUrl.trim() !== '' ? (
                              <img src={skill.iconUrl} alt={skill.name} className="w-7 h-7 object-contain rounded" />
                            ) : (
                              <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                                {skill.name.charAt(0)}
                              </div>
                            )}

                            <div>
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
                                {skill.name}
                              </span>
                              {isFirstSkill && (
                                <span className="text-[10px] font-mono text-zinc-400 block">
                                  1er affiché dans {category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions de tri et d'édition pour cet élément spécifique */}
                          <div className="flex items-center gap-1.5">
                            {/* Boutons monter / descendre l'élément dans la catégorie */}
                            <button
                              type="button"
                              onClick={() => moveSkillInCategory(category, skill.id, 'up')}
                              disabled={isFirstSkill}
                              title="Monter cet outil"
                              className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-25 transition text-zinc-600 dark:text-zinc-400"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSkillInCategory(category, skill.id, 'down')}
                              disabled={isLastSkill}
                              title="Descendre cet outil"
                              className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-25 transition text-zinc-600 dark:text-zinc-400"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => handleEdit(skill)} 
                              className="ml-2 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200/80 dark:border-zinc-700/60"
                            >
                              Éditer
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Supprimer la compétence "${skill.name}" ?`)) {
                                  deleteSkill(skill.id);
                                  toast.success(`Compétence "${skill.name}" supprimée.`);
                                }
                              }} 
                              className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-transparent hover:border-red-200/60 dark:hover:border-red-900/40"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VUE 2 : TABLEAU PLAT RAPIDE                                    */
        /* ------------------------------------------------------------- */
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-16">Logo</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Nom</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 hidden md:table-cell">Catégorie</th>
                <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-5">
                    {skill.iconUrl && skill.iconUrl.trim() !== '' ? (
                      <img src={skill.iconUrl} alt={skill.name} className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        {skill.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-5 font-medium text-sm text-zinc-900 dark:text-zinc-100">{skill.name}</td>
                  <td className="py-3 px-5 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-xs font-mono border border-zinc-200/60 dark:border-zinc-700/50">
                      {skill.category}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button 
                      onClick={() => handleEdit(skill)} 
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mr-2 border border-zinc-200/80 dark:border-zinc-700/60"
                    >
                      Éditer
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Supprimer la compétence "${skill.name}" ?`)) {
                          deleteSkill(skill.id);
                          toast.success(`Compétence "${skill.name}" supprimée.`);
                        }
                      }} 
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-transparent hover:border-red-200/60 dark:hover:border-red-900/40"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
