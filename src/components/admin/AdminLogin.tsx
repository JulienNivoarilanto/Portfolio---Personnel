import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // If already authenticated via Firebase Auth and has active session, redirect to dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const activeSession = sessionStorage.getItem('adminToken');
      if (user && activeSession) {
        navigate('/admin-nj/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Veuillez renseigner tous les champs.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Authenticate directly through Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      
      try {
        sessionStorage.setItem('adminToken', userCredential.user.uid);
      } catch (e) {
        console.warn('sessionStorage not available', e);
      }
      
      toast.success('Connexion réussie');
      navigate('/admin-nj/dashboard');
    } catch (firebaseErr: any) {
      console.warn('[Firebase Auth] Erreur de connexion:', firebaseErr?.code || firebaseErr);
      const code = firebaseErr?.code;
      
      if (
        code === 'auth/invalid-credential' || 
        code === 'auth/user-not-found' || 
        code === 'auth/wrong-password'
      ) {
        setError('Identifiants incorrects.');
      } else if (code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez patienter avant de réessayer.');
      } else if (code === 'auth/user-disabled') {
        setError('Compte désactivé.');
      } else if (code === 'auth/invalid-email') {
        setError("Format d'email invalide.");
      } else if (code === 'auth/network-request-failed') {
        setError('Erreur réseau. Vérifiez votre connexion.');
      } else {
        setError('Échec de la connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-center items-center p-6 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] rounded-3xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-all">
        
        {/* Minimalist Top Icon */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Mot de passe"
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-3 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Error display */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md cursor-pointer"
          >
            <span>{isSubmitting ? 'Connexion...' : 'Se connecter'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
