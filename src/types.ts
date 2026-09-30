export type ProjectsLayoutType = 'mosaic' | 'equal-grid' | 'album' | 'slider';

export interface CodeBlock {
  id?: string;
  language: string;
  code: string;
  title?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl: string;
  fullDescription?: string;
  extraImages?: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  codeLanguages?: string[];
  codeBlocks?: CodeBlock[];
  order?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  iconUrl: string;
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}

export interface LegalInfo {
  firstName: string;
  lastName: string;
  neq: string;
  address: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  illustrationSvg: string;
  order?: number;
}

export interface CarouselSettings {
  enabled: boolean;
  slideDuration: number; // in seconds
  items: CarouselItem[];
}

export interface PersonalInfo {
  name: string;
  role: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
  availableForWork: boolean;
  avatarUrl?: string;
  cvLink: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  contactTitle: string;
  contactSubtitle: string;
  footerText: string;
}

export interface ThemeSettings {
  accentColor: string;
  darkMode: 'light' | 'dark' | 'system';
  activeTheme?: 'default' | 'summer-ocean-breeze' | 'ocean-breeze' | 'pastel-comfort' | 'tropical-sunrise' | 'turquoise-harmony' | 'deep-blue-sea';
}

export interface SectionsVisibility {
  testimonials: boolean;
  legalStatus: boolean;
  carousel?: boolean;
}

export interface SkillsSettings {
  categoryOrder?: string[];
}

export interface ProjectsSettings {
  layout?: ProjectsLayoutType;
}

export interface SiteConfig {
  personalInfo: PersonalInfo;
  themeSettings: ThemeSettings;
  legalInfo?: LegalInfo;
  sectionsVisibility?: SectionsVisibility;
  skillsSettings?: SkillsSettings;
  projectsSettings?: ProjectsSettings;
  projectsLayout?: ProjectsLayoutType;
  carouselSettings?: CarouselSettings;
}
