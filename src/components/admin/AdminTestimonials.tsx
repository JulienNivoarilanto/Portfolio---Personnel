import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Testimonial } from '../../types';
import { uploadImageToStorage } from '../../firebase';
import { Eye, EyeOff, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AdminTestimonials() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial, siteConfig, updateSectionsVisibility } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isNewTestimonial, setIsNewTestimonial] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSectionVisible = siteConfig?.sectionsVisibility?.testimonials !== false;

  const handleEdit = (testi: Testimonial) => {
    setIsNewTestimonial(false);
    setIsEditing(testi.id);
    setFormData({ ...testi });
  };

  const handleAddNew = () => {
    const newId = `testi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setIsNewTestimonial(true);
    setIsEditing(newId);
    setFormData({ id: newId, name: '', role: '', content: '', avatarUrl: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'testimonials', 400, 400);
      if (url) {
        setFormData(prev => ({ ...prev, avatarUrl: url }));
      }
    } catch (err) {
      console.warn('[Testimonial Avatar] Upload notice:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Veuillez renseigner le nom de la personne.');
      return;
    }
    
    const finalId = isNewTestimonial 
      ? (formData.id || `testi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      : (isEditing || formData.id || `testi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

    const testiToSave: Testimonial = {
      id: finalId,
      name: formData.name,
      role: formData.role || '',
      content: formData.content || '',
      avatarUrl: formData.avatarUrl || '',
    };

    if (isNewTestimonial) {
      addTestimonial(testiToSave);
      toast.success(`Témoignage de "${testiToSave.name}" ajouté avec succès !`);
    } else {
      updateTestimonial(finalId, testiToSave);
      toast.success(`Témoignage de "${testiToSave.name}" mis à jour avec succès !`);
    }
    
    setIsEditing(null);
    setIsNewTestimonial(false);
    setFormData({});
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
        <h3 className="text-2xl font-display font-bold mb-6">{testimonials.find(p => p.id === isEditing) ? 'Éditer le témoignage' : 'Nouveau témoignage'}</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Nom</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Rôle / Entreprise</label>
              <input type="text" name="role" value={formData.role || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Photo d'avatar (Optionnel)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                name="avatarUrl" 
                value={formData.avatarUrl || ''} 
                onChange={handleChange} 
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" 
                placeholder="URL d'avatar ou téléversez une photo" 
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 rounded-lg text-xs font-medium flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? 'Traitement...' : 'Téléverser'}
              </button>
            </div>
            {Boolean(formData.avatarUrl && formData.avatarUrl.trim() !== '') && (
              <div className="mt-3 flex items-center gap-3">
                <img src={formData.avatarUrl} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm" />
                <span className="text-xs text-zinc-500">Aperçu de la photo</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Contenu</label>
            <textarea name="content" value={formData.content || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 min-h-[100px]" />
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setIsEditing(null)} className="px-6 py-2 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Annuler</button>
            <button onClick={handleSave} className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity">Sauvegarder</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Témoignages & Avis</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Recommandations clients et retours d'expérience ({testimonials.length} enregistrés).
          </p>
        </div>
        <button 
          onClick={handleAddNew} 
          className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un témoignage</span>
        </button>
      </div>

      {/* Modular Section Visibility Toggle - Mature Style */}
      <div className="mb-6 p-4 bg-white dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {isSectionVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-medium text-sm flex items-center gap-2">
              <span>Section Témoignages sur le portfolio</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium border ${
                isSectionVisible 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700' 
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
              }`}>
                {isSectionVisible ? 'Active' : 'Désactivée'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Contrôlez l'affichage de cette section sur la page d'accueil et dans la navigation.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateSectionsVisibility({ testimonials: !isSectionVisible })}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 shrink-0 border ${
            isSectionVisible 
              ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700' 
              : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 border-transparent shadow-xs'
          }`}
        >
          {isSectionVisible ? 'Masquer du site' : 'Activer sur le site'}
        </button>
      </div>

      <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
              <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Nom</th>
              <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 hidden md:table-cell">Rôle / Entreprise</th>
              <th className="py-3 px-5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testi) => (
              <tr key={testi.id} className="border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 px-5 font-medium text-sm text-zinc-900 dark:text-zinc-100">{testi.name}</td>
                <td className="py-3 px-5 text-sm text-zinc-500 hidden md:table-cell">{testi.role}</td>
                <td className="py-3 px-5 text-right">
                  <button 
                    onClick={() => handleEdit(testi)} 
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mr-2 border border-zinc-200/80 dark:border-zinc-700/60"
                  >
                    Éditer
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Supprimer le témoignage de "${testi.name}" ?`)) {
                        deleteTestimonial(testi.id);
                        toast.success(`Témoignage de "${testi.name}" supprimé.`);
                      }
                    }} 
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-transparent hover:border-red-200/60 dark:hover:border-red-900/40"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 px-6 text-center text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-sm font-medium">Aucun témoignage enregistré.</p>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Ajoutez des recommandations de collègues ou de clients.
                    </p>
                    <button
                      onClick={handleAddNew}
                      className="mt-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-2 rounded-lg text-xs font-medium shadow-xs hover:opacity-90 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un témoignage</span>
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
