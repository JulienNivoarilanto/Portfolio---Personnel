import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, Skill, Testimonial, SiteConfig, ProjectsLayoutType } from './types';
import { 
  projects as initialProjects, 
  skills as initialSkills, 
  testimonials as initialTestimonials, 
  defaultSiteConfig
} from './data';
import {
  initAndMigrateFirebase,
  subscribeToProjects,
  subscribeToSkills,
  subscribeToTestimonials,
  subscribeToSiteConfig,
  firestoreAddProject,
  firestoreUpdateProject,
  firestoreDeleteProject,
  firestoreAddSkill,
  firestoreUpdateSkill,
  firestoreDeleteSkill,
  firestoreAddTestimonial,
  firestoreUpdateTestimonial,
  firestoreDeleteTestimonial,
  firestoreSaveSiteConfig,
  firestoreBatchUpdateProjectOrders,
  firestoreBatchUpdateSkillOrders
} from './firebase';

// Safe storage wrapper to prevent iframe SecurityError crashes
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('localStorage is not available:', e);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.warn('localStorage is not available:', e);
    }
  },
};

interface AppState {
  projects: Project[];
  skills: Skill[];
  testimonials: Testimonial[];
  siteConfig: SiteConfig;
  isLoading: boolean;
  
  updateProject: (id: string, updated: Partial<Project>) => Promise<void>;
  updateSkill: (id: string, updated: Partial<Skill>) => Promise<void>;
  updateTestimonial: (id: string, updated: Partial<Testimonial>) => Promise<void>;
  
  addProject: (project: Project) => Promise<void>;
  addSkill: (skill: Skill) => Promise<void>;
  addTestimonial: (testimonial: Testimonial) => Promise<void>;
  
  deleteProject: (id: string) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  updatePersonalInfo: (updated: Partial<SiteConfig['personalInfo']>) => Promise<void>;
  updateThemeSettings: (updated: Partial<SiteConfig['themeSettings']>) => Promise<void>;
  updateLegalInfo: (updated: Partial<SiteConfig['legalInfo']>) => Promise<void>;
  updateSectionsVisibility: (updated: Partial<SiteConfig['sectionsVisibility']>) => Promise<void>;

  reorderProjects: (orderedProjects: Project[]) => Promise<void>;
  setProjectsLayout: (layout: ProjectsLayoutType) => Promise<void>;
  reorderSkills: (orderedSkills: Skill[]) => Promise<void>;
  updateCategoryOrder: (categoryOrder: string[]) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: initialProjects,
      skills: initialSkills,
      testimonials: initialTestimonials,
      siteConfig: defaultSiteConfig,
      isLoading: true,
      
      updateProject: async (id, updated) => {
        if (!id) return;
        set((state) => {
          const exists = state.projects.some(p => p.id === id);
          if (exists) {
            return {
              projects: state.projects.map(p => p.id === id ? { ...p, ...updated } : p)
            };
          } else {
            return {
              projects: [{ id, ...updated } as Project, ...state.projects]
            };
          }
        });
        firestoreUpdateProject(id, updated).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },

      updateSkill: async (id, updated) => {
        if (!id) return;
        set((state) => {
          const exists = state.skills.some(s => s.id === id);
          if (exists) {
            return {
              skills: state.skills.map(s => s.id === id ? { ...s, ...updated } : s)
            };
          } else {
            return {
              skills: [{ id, ...updated } as Skill, ...state.skills]
            };
          }
        });
        firestoreUpdateSkill(id, updated).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },

      updateTestimonial: async (id, updated) => {
        if (!id) return;
        set((state) => {
          const exists = state.testimonials.some(t => t.id === id);
          if (exists) {
            return {
              testimonials: state.testimonials.map(t => t.id === id ? { ...t, ...updated } : t)
            };
          } else {
            return {
              testimonials: [{ id, ...updated } as Testimonial, ...state.testimonials]
            };
          }
        });
        firestoreUpdateTestimonial(id, updated).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },
      
      addProject: async (project) => {
        const id = (project.id && project.id.trim() !== '') 
          ? project.id 
          : `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const withId = { ...project, id };
        set((state) => {
          const exists = state.projects.some(p => p.id === withId.id);
          return {
            projects: exists
              ? state.projects.map(p => p.id === withId.id ? withId : p)
              : [withId, ...state.projects]
          };
        });
        firestoreAddProject(withId).catch((e) => {
          console.warn('[Firebase] Background add notice:', e);
        });
      },

      addSkill: async (skill) => {
        const id = (skill.id && skill.id.trim() !== '') 
          ? skill.id 
          : `skill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const withId = { ...skill, id };
        set((state) => {
          const exists = state.skills.some(s => s.id === withId.id);
          return {
            skills: exists
              ? state.skills.map(s => s.id === withId.id ? withId : s)
              : [withId, ...state.skills]
          };
        });
        firestoreAddSkill(withId).catch((e) => {
          console.warn('[Firebase] Background add notice:', e);
        });
      },

      addTestimonial: async (testimonial) => {
        const id = (testimonial.id && testimonial.id.trim() !== '') 
          ? testimonial.id 
          : `testi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const withId = { ...testimonial, id };
        set((state) => {
          const exists = state.testimonials.some(t => t.id === withId.id);
          return {
            testimonials: exists
              ? state.testimonials.map(t => t.id === withId.id ? withId : t)
              : [withId, ...state.testimonials]
          };
        });
        firestoreAddTestimonial(withId).catch((e) => {
          console.warn('[Firebase] Background add notice:', e);
        });
      },
      
      deleteProject: async (id) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id)
        }));
        firestoreDeleteProject(id).catch((e) => {
          console.warn('[Firebase] Background delete notice:', e);
        });
      },

      deleteSkill: async (id) => {
        set((state) => ({
          skills: state.skills.filter(s => s.id !== id)
        }));
        firestoreDeleteSkill(id).catch((e) => {
          console.warn('[Firebase] Background delete notice:', e);
        });
      },

      deleteTestimonial: async (id) => {
        set((state) => ({
          testimonials: state.testimonials.filter(t => t.id !== id)
        }));
        firestoreDeleteTestimonial(id).catch((e) => {
          console.warn('[Firebase] Background delete notice:', e);
        });
      },

      updatePersonalInfo: async (updated) => {
        const currentConfig = get().siteConfig || defaultSiteConfig;
        const newConfig = {
          ...currentConfig,
          personalInfo: { ...currentConfig.personalInfo, ...updated }
        };
        set({ siteConfig: newConfig });
        firestoreSaveSiteConfig(newConfig).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },

      updateThemeSettings: async (updated) => {
        const currentConfig = get().siteConfig || defaultSiteConfig;
        const newConfig = {
          ...currentConfig,
          themeSettings: { ...currentConfig.themeSettings, ...updated }
        };
        set({ siteConfig: newConfig });
        firestoreSaveSiteConfig(newConfig).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },

      updateLegalInfo: async (updated) => {
        const currentConfig = get().siteConfig || defaultSiteConfig;
        const newConfig = {
          ...currentConfig,
          legalInfo: { ...(currentConfig.legalInfo || { firstName: '', lastName: '', neq: '', address: '' }), ...updated }
        };
        set({ siteConfig: newConfig });
        firestoreSaveSiteConfig(newConfig).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },

      updateSectionsVisibility: async (updated) => {
        const currentConfig = get().siteConfig || defaultSiteConfig;
        const newConfig = {
          ...currentConfig,
          sectionsVisibility: { 
            ...(currentConfig.sectionsVisibility || { testimonials: true, legalStatus: true }),
            ...updated 
          }
        };
        set({ siteConfig: newConfig });
        firestoreSaveSiteConfig(newConfig).catch((e) => {
          console.warn('[Firebase] Background update notice:', e);
        });
      },

      reorderProjects: async (orderedProjects) => {
        const indexed = orderedProjects.map((p, idx) => ({ ...p, order: idx }));
        set({ projects: indexed });
        const orders = indexed.map(p => ({ id: p.id, order: p.order ?? 0 }));
        firestoreBatchUpdateProjectOrders(orders).catch((e) => {
          console.warn('[Firebase] Background reorder projects notice:', e);
        });
      },

      setProjectsLayout: async (layout) => {
        const currentConfig = get().siteConfig || defaultSiteConfig;
        const newConfig: SiteConfig = {
          ...currentConfig,
          projectsLayout: layout,
          projectsSettings: {
            ...(currentConfig.projectsSettings || {}),
            layout
          }
        };
        set({ siteConfig: newConfig });
        firestoreSaveSiteConfig(newConfig).catch((e) => {
          console.warn('[Firebase] Background update projects layout notice:', e);
        });
      },

      reorderSkills: async (orderedSkills) => {
        const indexed = orderedSkills.map((s, idx) => ({ ...s, order: idx }));
        set({ skills: indexed });
        const orders = indexed.map(s => ({ id: s.id, order: s.order ?? 0, category: s.category }));
        firestoreBatchUpdateSkillOrders(orders).catch((e) => {
          console.warn('[Firebase] Background reorder skills notice:', e);
        });
      },

      updateCategoryOrder: async (categoryOrder) => {
        const currentConfig = get().siteConfig || defaultSiteConfig;
        const newConfig: SiteConfig = {
          ...currentConfig,
          skillsSettings: {
            ...(currentConfig.skillsSettings || {}),
            categoryOrder
          }
        };
        set({ siteConfig: newConfig });
        firestoreSaveSiteConfig(newConfig).catch((e) => {
          console.warn('[Firebase] Background update category order notice:', e);
        });
      },
    }),
    {
      name: 'portfolio-storage',
      version: 5,
      storage: createJSONStorage(() => safeStorage),
      merge: (persistedState: any, currentState: AppState) => {
        const persisted = typeof persistedState === 'object' && persistedState !== null ? persistedState : {};
        const siteConfig = persisted.siteConfig || currentState.siteConfig;

        return {
          ...currentState,
          ...persisted,
          projects: Array.isArray(persisted.projects) ? persisted.projects : [],
          skills: Array.isArray(persisted.skills) ? persisted.skills : [],
          testimonials: Array.isArray(persisted.testimonials) ? persisted.testimonials : [],
          siteConfig: siteConfig || currentState.siteConfig,
        };
      },
    }
  )
);

// Global initialization function to bootstrap Firestore and start real-time listeners
let syncInitialized = false;

export function initFirebaseSync() {
  if (syncInitialized) return;
  syncInitialized = true;

  // Run initialization if needed
  initAndMigrateFirebase().then(() => {
    // Start real-time Firestore listeners
    subscribeToProjects((remoteProjects) => {
      useStore.setState(() => {
        if (!remoteProjects || remoteProjects.length === 0) {
          return { projects: [], isLoading: false };
        }
        // Only accept remote projects that have valid titles (filter out ghost/empty documents)
        const validRemote = remoteProjects.filter(p => p && typeof p.title === 'string' && p.title.trim() !== '');

        const formatted = validRemote.map(p => ({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags : (typeof (p as any).tags === 'string' ? [(p as any).tags] : []),
          extraImages: Array.isArray(p.extraImages) ? p.extraImages : [],
          codeBlocks: Array.isArray(p.codeBlocks) ? p.codeBlocks : []
        }));
        return {
          projects: formatted,
          isLoading: false
        };
      });
    });

    subscribeToSkills((remoteSkills) => {
      useStore.setState(() => {
        if (!remoteSkills || remoteSkills.length === 0) return { skills: [] };
        const validRemote = remoteSkills.filter(s => s && typeof s.name === 'string' && s.name.trim() !== '');
        return { skills: validRemote };
      });
    });

    subscribeToTestimonials((remoteTestimonials) => {
      useStore.setState(() => {
        if (!remoteTestimonials || remoteTestimonials.length === 0) return { testimonials: [] };
        const validRemote = remoteTestimonials.filter(t => t && typeof t.name === 'string' && t.name.trim() !== '');
        return { testimonials: validRemote };
      });
    });

    subscribeToSiteConfig((siteConfig) => {
      if (siteConfig) {
        useStore.setState({ siteConfig });
      }
    });
  }).catch((err) => {
    console.warn('[Firebase] Initialization notice:', err);
    useStore.setState({ isLoading: false });
  });
}

// Auto-trigger sync on load
if (typeof window !== 'undefined') {
  initFirebaseSync();
}
