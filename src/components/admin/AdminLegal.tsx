import React, { useState } from 'react';
import { useStore } from '../../store';
import { LegalInfo } from '../../types';
import { Eye, EyeOff } from 'lucide-react';

export function AdminLegal() {
  const { siteConfig, updateLegalInfo, updateSectionsVisibility } = useStore();
  const defaultLegalInfo = { firstName: '', lastName: '', neq: '', address: '' };
  const [formData, setFormData] = useState<LegalInfo>(siteConfig.legalInfo || defaultLegalInfo);
  const [isSaved, setIsSaved] = useState(false);

  const isSectionVisible = siteConfig?.sectionsVisibility?.legalStatus !== false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLegalInfo(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display font-bold">Statut Légal</h2>
      </div>

      {/* Modular Section Visibility Toggle - Mature Executive Style */}
      <div className="mb-6 p-4 bg-white dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {isSectionVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-medium text-sm flex items-center gap-2">
              <span>Section Statut Légal sur le portfolio</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium border ${
                isSectionVisible 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700' 
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
              }`}>
                {isSectionVisible ? 'Active' : 'Désactivée'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Contrôlez l'affichage de vos mentions et immatriculation d'entreprise (NEQ).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateSectionsVisibility({ legalStatus: !isSectionVisible })}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 shrink-0 border ${
            isSectionVisible 
              ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700' 
              : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 border-transparent shadow-xs'
          }`}
        >
          {isSectionVisible ? 'Masquer du site' : 'Activer sur le site'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Prénom</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Nom</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Numéro d'entreprise (NEQ)</label>
          <input 
            type="text" 
            name="neq" 
            value={formData.neq} 
            onChange={handleChange} 
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 font-mono" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Adresse complète</label>
          <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            rows={3} 
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 resize-none" 
          />
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className={`text-sm text-emerald-600 dark:text-emerald-400 font-medium transition-opacity duration-300 ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
            Modifications sauvegardées avec succès
          </span>
          <button 
            type="submit" 
            className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}
