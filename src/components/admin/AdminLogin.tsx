import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../../firebase';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const validEmails = ['juliennivoarilanto@gmail.com', 'juliennivoarilanto2@gmail.com'];
    const validPassword = 'Julien.47.';

    if (validEmails.includes(email.trim().toLowerCase()) && password === validPassword) {
      try {
        // Attempt Firebase Auth session if enabled, without blocking login if providers are restricted
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (firebaseErr: any) {
          if (firebaseErr?.code === 'auth/user-not-found' || firebaseErr?.code === 'auth/invalid-credential') {
            try {
              await createUserWithEmailAndPassword(auth, email.trim(), password);
            } catch (createErr) {
              // Sign-in fallback without throwing
              console.warn('[Firebase Auth] Account setup notice:', createErr);
            }
          } else {
            console.warn('[Firebase Auth] Provider notice (continuing with admin session):', firebaseErr?.message || firebaseErr);
          }
        }

        try {
          localStorage.setItem('adminToken', 'true');
        } catch (e) {
          console.warn('localStorage not available', e);
        }
        navigate('/admin-nj/dashboard');
      } catch (err: any) {
        console.warn('Login non-blocking warning:', err);
        try {
          localStorage.setItem('adminToken', 'true');
        } catch (e) {
          console.warn('localStorage not available', e);
        }
        navigate('/admin-nj/dashboard');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('Identifiants incorrects.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold">Administration</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Veuillez vous connecter pour continuer</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white py-2 focus:outline-none transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 opacity-70">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white py-2 focus:outline-none transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-3 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
