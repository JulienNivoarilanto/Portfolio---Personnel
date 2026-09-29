import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { useStore } from '../store';
import { FileText, Building, MapPin, BadgeCheck } from 'lucide-react';

export function LegalStatus() {
  const siteConfig = useStore((state) => state.siteConfig);
  const legalInfo = siteConfig?.legalInfo;

  if (!legalInfo) return null;

  return (
    <Section id="legal-status" className="bg-white/5 dark:bg-black/5 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 space-y-6 md:space-y-0">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
              Statut Légal
            </h2>
            <p className="text-lg opacity-80 max-w-xl">
              Informations professionnelles et légales.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white/40 dark:bg-black/40 text-zinc-900 dark:text-zinc-100 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BadgeCheck className="w-48 h-48" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-8">
                <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-black/50 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold">
                    {legalInfo.firstName} {legalInfo.lastName}
                  </h3>
                  <p className="opacity-70">Entrepreneur Individuel</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Building className="w-6 h-6 opacity-60 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium opacity-60 uppercase tracking-wider mb-1">Numéro d'entreprise (NEQ)</p>
                    <p className="text-lg font-medium font-mono">{legalInfo.neq}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 opacity-60 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium opacity-60 uppercase tracking-wider mb-1">Adresse complète</p>
                    <p className="text-lg leading-relaxed max-w-md">
                      {legalInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
