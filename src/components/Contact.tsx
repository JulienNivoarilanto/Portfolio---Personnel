import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Section } from './Section';
import { Send, ArrowRight, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { firestoreSendMessage } from '../firebase';
import { toast } from 'sonner';

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
    try {
      // Direct Firestore storage
      await firestoreSendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      toast.success('Votre message a bien été envoyé !');

      // Auto-revert smoothly after 7 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 7000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact">
      <div className="max-w-5xl mx-auto px-6 md:px-16 lg:px-32 bg-white/10 dark:bg-black/10 text-zinc-900 dark:text-zinc-100 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-3xl p-8 md:p-16 shadow-xl transition-all">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4 text-inherit">
            {contactTitle}
          </h2>
          <p className="text-lg opacity-80 text-inherit max-w-2xl mx-auto">
            {contactSubtitle}
          </p>
        </div>

        {/* Smooth In / Out Transition Between Form & Confirmation */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="confirmation-message"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="p-10 md:p-14 rounded-3xl bg-current/5 border border-current/15 text-center flex flex-col items-center text-inherit backdrop-blur-sm shadow-sm"
            >
              {/* Animated Check Icon with Text Color Accent (No Green) */}
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 240, 
                  damping: 18,
                  delay: 0.05 
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-current/80 flex items-center justify-center mb-6 text-inherit bg-current/5 shadow-inner"
              >
                <motion.svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-inherit stroke-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17L4 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.2, 
                      ease: "easeOut" 
                    }}
                  />
                </motion.svg>
              </motion.div>

              {/* Message Details */}
              <h3 className="text-2xl sm:text-3xl font-display font-bold mb-3 text-inherit tracking-tight">
                Message envoyé !
              </h3>
              <p className="text-base sm:text-lg opacity-80 text-inherit max-w-md mx-auto leading-relaxed">
                Merci pour votre prise de contact. Je vous répondrai dans les plus brefs délais.
              </p>

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border border-current/20 hover:bg-current/10 text-inherit transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Envoyer un autre message</span>
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="contact-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onSubmit={handleSubmit}
              className="space-y-8"
              noValidate
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-medium mb-2 opacity-70 text-inherit">
                    Nom complet
                  </label>
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
                  {errors.name && <p className="absolute -bottom-6 text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>
                
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium mb-2 opacity-70 text-inherit">
                    Email
                  </label>
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
                  {errors.email && <p className="absolute -bottom-6 text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>
              </div>

              <div className="relative pt-4">
                <label htmlFor="message" className="block text-sm font-medium mb-2 opacity-70 text-inherit">
                  Message
                </label>
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
                {errors.message && <p className="absolute -bottom-6 text-xs text-red-500 font-medium">{errors.message}</p>}
              </div>

              <div className="pt-6 text-right">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md"
                >
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                  {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
