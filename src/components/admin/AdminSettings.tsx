import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { ImageCropperModal } from './ImageCropperModal';
import { uploadImageToStorage } from '../../firebase';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { PersonalInfo } from '../../types';

export function AdminSettings() {
  const { siteConfig, updatePersonalInfo, updateThemeSettings, updateSectionsVisibility } = useStore();
  const safeSiteConfig = siteConfig || { personalInfo: {} as PersonalInfo, themeSettings: {} as any };
  const [formData, setFormData] = useState<Partial<PersonalInfo>>(safeSiteConfig.personalInfo || {});
  const [themeData, setThemeData] = useState(safeSiteConfig.themeSettings || { activeTheme: 'default' });
  const [isSaved, setIsSaved] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleThemeChange = (theme: string) => {
    setThemeData((prev) => ({ ...prev, activeTheme: theme }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result?.toString() || null);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ''; // reset so the same file can be selected again
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setShowCropper(false);
    setImageToCrop(null);
    // Instant UI preview without any waiting
    setFormData((prev) => ({ ...prev, avatarUrl: croppedImageUrl }));
    uploadImageToStorage(croppedImageUrl, 'avatars', 512, 512).then((storageUrl) => {
      if (storageUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: storageUrl }));
      }
    }).catch((err) => {
      console.warn('[Avatar] Upload notice:', err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePersonalInfo(formData);
    await updateThemeSettings(themeData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const themes = [
    { id: 'default', name: 'Par défaut', bgClass: 'bg-zinc-100' },
    { id: 'summer-ocean-breeze', name: 'Summer Ocean Breeze', bgClass: 'bg-gradient-to-br from-[#f1faee] via-[#a8dadc] to-[#457b9d]' },
    { id: 'ocean-breeze', name: 'Ocean Breeze', bgClass: 'bg-gradient-to-br from-cyan-100 to-teal-100' },
    { id: 'pastel-comfort', name: 'Pastel Comfort', bgClass: 'bg-gradient-to-br from-rose-100 to-orange-100' },
    { id: 'tropical-sunrise', name: 'Tropical Sunrise', bgClass: 'bg-gradient-to-br from-[#ff9f1c] via-[#ffbf69] to-[#2ec4b6]' },
    { id: 'turquoise-harmony', name: 'Turquoise Harmony', bgClass: 'bg-gradient-to-br from-[#05668d] via-[#00a896] to-[#f0f3bd]' },
    { id: 'deep-blue-sea', name: 'Deep Blue Sea', bgClass: 'bg-gradient-to-br from-[#0b132b] via-[#3a506b] to-[#6fffe9]' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold">Configuration Générale</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
        
        {/* Themes */}
        <section className="space-y-6">
          <h3 className="text-xl font-display font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-4">Thème visuel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all overflow-hidden h-32 flex items-center justify-center ${themeData.activeTheme === theme.id ? 'border-blue-500 shadow-md' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
              >
                <div className={`absolute inset-0 ${theme.bgClass} opacity-50`}></div>
                <div className="relative z-10 font-medium text-zinc-900 bg-white/80 px-4 py-2 rounded-lg shadow-sm backdrop-blur-sm">
                  {theme.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sections Modulables */}
        <section className="space-y-6">
          <div>
            <h3 className="text-xl font-display font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-4">Sections modulables du site</h3>
            <p className="text-sm opacity-70 mt-2">Activez ou masquez les sections optionnelles de la page d'accueil de votre portfolio (synchronisé avec le menu).</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214] flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Section Témoignages</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Avis et recommandations clients</p>
              </div>
              <button
                type="button"
                onClick={() => updateSectionsVisibility({ testimonials: siteConfig?.sectionsVisibility?.testimonials === false ? true : false })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  siteConfig?.sectionsVisibility?.testimonials !== false 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs' 
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {siteConfig?.sectionsVisibility?.testimonials !== false ? 'Active' : 'Désactivée'}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214] flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Section Statut Légal</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">NEQ et coordonnées d'entreprise</p>
              </div>
              <button
                type="button"
                onClick={() => updateSectionsVisibility({ legalStatus: siteConfig?.sectionsVisibility?.legalStatus === false ? true : false })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  siteConfig?.sectionsVisibility?.legalStatus !== false 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs' 
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {siteConfig?.sectionsVisibility?.legalStatus !== false ? 'Active' : 'Désactivée'}
              </button>
            </div>
          </div>
        </section>

        {/* Identité */}
        <section className="space-y-6">
          <h3 className="text-xl font-display font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-4">Identité</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Nom affiché</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Rôle / Poste</label>
              <input type="text" name="role" value={formData.role} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 opacity-70">Photo de profil (Avatar)</label>
              <div className="flex items-start gap-4">
                {Boolean(formData.avatarUrl && formData.avatarUrl.trim() !== '') && (
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-2">
                    <input type="text" name="avatarUrl" value={formData.avatarUrl || ''} onChange={handleChange} placeholder="URL de l'image ou recadrez une nouvelle photo..." className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Parcourir</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showCropper && imageToCrop && (
          <ImageCropperModal
            imageSrc={imageToCrop}
            onClose={() => {
              setShowCropper(false);
              setImageToCrop(null);
            }}
            onCropComplete={handleCropComplete}
            aspect={4 / 5}
          />
        )}

        {/* Section Hero */}
        <section className="space-y-6">
          <h3 className="text-xl font-display font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-4">Accueil (Hero)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Titre principal</label>
              <input type="text" name="heroTitle" value={formData.heroTitle} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Mot mis en avant (highlight)</label>
              <input type="text" name="heroTitleHighlight" value={formData.heroTitleHighlight} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 opacity-70">Description</label>
              <textarea name="heroDescription" value={formData.heroDescription} onChange={handleChange} rows={3} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500 resize-y" />
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="availableForWork" name="availableForWork" checked={formData.availableForWork} onChange={handleChange} className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
              <label htmlFor="availableForWork" className="text-sm font-medium">Disponible pour de nouvelles opportunités</label>
            </div>
          </div>
        </section>

        {/* Liens & Contact */}
        <section className="space-y-6">
          <h3 className="text-xl font-display font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-4">Liens, Réseaux & Footer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Lien CV</label>
              <input type="text" name="cvLink" value={formData.cvLink} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">URL GitHub</label>
              <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">URL LinkedIn</label>
              <input type="text" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">URL Twitter</label>
              <input type="text" name="twitterUrl" value={formData.twitterUrl} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Titre section Contact</label>
              <input type="text" name="contactTitle" value={formData.contactTitle} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
             <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Sous-titre section Contact</label>
              <input type="text" name="contactSubtitle" value={formData.contactSubtitle} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 opacity-70">Texte du Pied de page (Footer)</label>
              <input type="text" name="footerText" value={formData.footerText} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end items-center space-x-4">
          {isSaved && <span className="text-green-600 dark:text-green-500 text-sm font-medium">Sauvegardé avec succès !</span>}
          <button type="submit" className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
            Sauvegarder les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
