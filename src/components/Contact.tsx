import React, { useState } from 'react';
import { Section } from './Section';
import { Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';

export function Contact() {
  const siteConfig = useStore((state) => state.siteConfig) || { personalInfo: {} as any };
  const { contactTitle, contactSubtitle } = siteConfig.personalInfo || {};
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return value.trim().length > 2 ? '' : 'Le nom doit contenir au moins 3 caractères.';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : "L'adresse email n'est pas valide.";
      case 'message':
        return value.trim().length > 10 ? '' : 'Le message doit contenir au moins 10 caractères.';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      message: validateField('message', formData.message),
    };
    
    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <Section id="contact">
      <div className="max-w-5xl mx-auto px-6 md:px-16 lg:px-32 bg-white/10 dark:bg-black/10 text-zinc-900 dark:text-zinc-100 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-3xl p-8 md:p-16 shadow-xl">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4 text-inherit">
            {contactTitle}
          </h2>
          <p className="text-lg opacity-80 text-inherit">
            {contactSubtitle}
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 rounded-3xl bg-green-500/20 border border-green-500/30 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-400 mb-6" />
            <h3 className="text-2xl font-display font-semibold mb-2 text-inherit">Message envoyé !</h3>
            <p className="opacity-80 text-inherit">Je vous répondrai dans les plus brefs délais.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium mb-2 opacity-70 text-inherit">Nom complet</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-black/5 dark:bg-black/20 backdrop-blur-sm border-b-2 py-4 px-4 rounded-t-xl focus:outline-none transition-colors ${
                    errors.name ? 'border-red-500' : 'border-white/20 dark:border-white/10 focus:border-current'
                  }`}
                  placeholder="Jean Dupont"
                />
                {errors.name && <p className="absolute -bottom-6 text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium mb-2 opacity-70 text-inherit">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-black/5 dark:bg-black/20 backdrop-blur-sm border-b-2 py-4 px-4 rounded-t-xl focus:outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-white/20 dark:border-white/10 focus:border-current'
                  }`}
                  placeholder="jean@example.com"
                />
                {errors.email && <p className="absolute -bottom-6 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="relative pt-4">
              <label htmlFor="message" className="block text-sm font-medium mb-2 opacity-70 text-inherit">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className={`w-full bg-black/5 dark:bg-black/20 backdrop-blur-sm border-b-2 py-4 px-4 rounded-t-xl focus:outline-none transition-colors resize-none ${
                  errors.message ? 'border-red-500' : 'border-white/20 dark:border-white/10 focus:border-current'
                }`}
                placeholder="Parlez-moi de votre projet..."
              />
              {errors.message && <p className="absolute -bottom-6 text-xs text-red-500">{errors.message}</p>}
            </div>

            <div className="pt-8 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Envoi...' : 'Envoyer le message'}</span>
                {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}
