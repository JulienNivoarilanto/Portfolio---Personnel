import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { useStore } from '../store';

export function Skills() {
  const skills = useStore((state) => state.skills);
  const siteConfig = useStore((state) => state.siteConfig);
  const customCategoryOrder = siteConfig?.skillsSettings?.categoryOrder || [];

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = (skill.category && skill.category.trim() !== '') ? skill.category.trim() : 'Autres';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Sort skills inside each category according to skill.order
  Object.keys(groupedSkills).forEach((cat) => {
    groupedSkills[cat].sort((a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      if (typeof a.order === 'number') return -1;
      if (typeof b.order === 'number') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  });

  // Sort categories according to customCategoryOrder, then alphabetically
  const sortedCategories = Object.keys(groupedSkills).sort((a, b) => {
    const idxA = customCategoryOrder.indexOf(a);
    const idxB = customCategoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <Section id="skills" className="border-b border-black/5 dark:border-white/5 bg-white/5 dark:bg-black/5 backdrop-blur-sm">
      <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-6 md:px-16 lg:px-32">
        <div className="mb-16 md:mb-24 md:flex items-end justify-between border-b border-black/10 dark:border-white/10 pb-8">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
              Compétences Techniques & Outils
            </h2>
            <p className="text-lg opacity-80 max-w-xl text-balance">
              Voici les technologies, langages et outils que je maîtrise et que j'utilise au quotidien pour concevoir des expériences digitales performantes.
            </p>
          </div>
        </div>

        {skills.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-black/10 dark:border-white/10 rounded-[2rem] p-10 bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
              Aucune compétence ajoutée pour le moment.
            </p>
            <p className="text-sm opacity-50 mt-1">
              Les compétences et technologies ajoutées depuis l'espace d'administration apparaîtront directement ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {sortedCategories.map((category, index) => {
            const categorySkills = groupedSkills[category] || [];
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                  <h3 className="text-2xl font-display font-semibold">
                    {category}
                  </h3>
                  <span className="text-xs font-mono opacity-60">
                    {categorySkills.length} {categorySkills.length > 1 ? 'outils' : 'outil'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/30 dark:bg-black/30 text-zinc-900 dark:text-zinc-100 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-colors shadow-lg"
                    >
                      {skill.iconUrl && skill.iconUrl.trim() !== '' ? (
                        <img src={skill.iconUrl} alt={skill.name} className="w-12 h-12 mb-3 drop-shadow-md object-contain" />
                      ) : (
                        <div className="w-12 h-12 mb-3 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center text-xl font-bold font-mono">
                          {skill.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-center line-clamp-1">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </Section>
  );
}
