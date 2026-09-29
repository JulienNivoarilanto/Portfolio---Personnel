import { Project, Skill, Testimonial, SiteConfig } from './types';

// Default configuration with no mock data
export const defaultSiteConfig: SiteConfig = {
  personalInfo: {
    name: 'Julien N.',
    role: '',
    heroTitle: '',
    heroTitleHighlight: '',
    heroDescription: '',
    availableForWork: true,
    avatarUrl: '',
    cvLink: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    contactTitle: '',
    contactSubtitle: '',
    footerText: `© ${new Date().getFullYear()} Julien Nivoarilanto. Tous droits réservés.`,
  },
  themeSettings: {
    accentColor: 'zinc',
    darkMode: 'system',
    activeTheme: 'default',
  },
  legalInfo: {
    firstName: 'Julien',
    lastName: 'Nivoarilanto',
    neq: '',
    address: '',
  },
  projectsLayout: 'mosaic',
  sectionsVisibility: {
    testimonials: false,
    legalStatus: true,
  }
};

// Pure database-driven: empty by default until added in Firebase
export const projects: Project[] = [];
export const skills: Skill[] = [];
export const testimonials: Testimonial[] = [];

