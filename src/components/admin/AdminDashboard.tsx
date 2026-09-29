import { useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  FolderKanban, 
  Cpu, 
  MessageSquare, 
  Settings, 
  Scale, 
  ArrowUpRight 
} from 'lucide-react';
import { AdminProjects } from './AdminProjects';
import { AdminSettings } from './AdminSettings';
import { AdminSkills } from './AdminSkills';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminLegal } from './AdminLegal';
import { useStore } from '../../store';

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, skills, testimonials } = useStore();

  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin-nj');
      }
    } catch (e) {
      navigate('/admin-nj');
    }
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('adminToken');
    } catch (e) {
      console.warn('localStorage not available');
    }
    navigate('/admin-nj');
  };
  
  const navItems = [
    { name: 'Vue globale', path: '/admin-nj/dashboard', icon: LayoutDashboard },
    { name: 'Projets', path: '/admin-nj/dashboard/projects', icon: FolderKanban, count: projects.length },
    { name: 'Compétences & Outils', path: '/admin-nj/dashboard/skills', icon: Cpu, count: skills.length },
    { name: 'Témoignages', path: '/admin-nj/dashboard/testimonials', icon: MessageSquare, count: testimonials.length },
    { name: 'Statut légal', path: '/admin-nj/dashboard/legal', icon: Scale },
    { name: 'Paramètres généraux', path: '/admin-nj/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex flex-col md:flex-row font-sans text-zinc-900 dark:text-zinc-100 antialiased">
      
      {/* Sidebar - Mature executive console design */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-mono font-bold text-xs">
              AD
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight block">Console Admin</span>
              <span className="text-[10px] text-zinc-400 font-mono block">v2.4 · Production</span>
            </div>
          </div>
          
          <Link 
            to="/" 
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium transition-colors"
            title="Consulter le portfolio public"
          >
            <span>Site</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Gestion du contenu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin-nj/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span>{item.name}</span>
                </div>
                {typeof item.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive 
                      ? 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' 
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 text-zinc-400" />
            <span>Fermer la session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        <Routes>
          <Route path="/" element={
            <div className="space-y-8 max-w-5xl">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Tableau de bord</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Espace de gestion et d'édition professionnelle des réalisations, compétences et paramètres.
                </p>
              </div>
              
              {/* Quick stats in mature enterprise styling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Projets publiés</span>
                  <div className="text-2xl font-bold font-mono tracking-tight">{projects.length}</div>
                  <p className="text-xs text-zinc-400 mt-2">Réalisations avec galeries et extraits</p>
                </div>

                <div className="p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Compétences & Outils</span>
                  <div className="text-2xl font-bold font-mono tracking-tight">{skills.length}</div>
                  <p className="text-xs text-zinc-400 mt-2">Frameworks, langages et devops</p>
                </div>

                <div className="p-5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-zinc-500 block mb-1">Témoignages clients</span>
                  <div className="text-2xl font-bold font-mono tracking-tight">{testimonials.length}</div>
                  <p className="text-xs text-zinc-400 mt-2">Recommandations professionnelles</p>
                </div>
              </div>

              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Link 
                  to="/admin-nj/dashboard/projects" 
                  className="p-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-700 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <FolderKanban className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                      <span className="text-xs font-mono text-zinc-400">{projects.length} fiches</span>
                    </div>
                    <h3 className="text-base font-semibold mb-1">Gestion des Projets</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Ajoutez de nouvelles réalisations, gérez la galerie photo, réorganisez les extraits de code syntaxiques et les métadonnées.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <span>Ouvrir l'éditeur</span>
                    <span>→</span>
                  </div>
                </Link>

                <Link 
                  to="/admin-nj/dashboard/skills" 
                  className="p-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-700 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Cpu className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                      <span className="text-xs font-mono text-zinc-400">{skills.length} outils</span>
                    </div>
                    <h3 className="text-base font-semibold mb-1">Compétences & Stack</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Maintenez votre inventaire technique : frameworks, bibliothèques, architectures, bases de données et outils avec logos officiels.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <span>Ouvrir l'éditeur</span>
                    <span>→</span>
                  </div>
                </Link>
              </div>
            </div>
          } />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/projects" element={<AdminProjects />} />
          <Route path="/skills" element={<AdminSkills />} />
          <Route path="/testimonials" element={<AdminTestimonials />} />
          <Route path="/legal" element={<AdminLegal />} />
        </Routes>
      </main>
    </div>
  );
}
