import { Github, Linkedin, Twitter, Lock } from 'lucide-react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const siteConfig = useStore((state) => state.siteConfig) || { personalInfo: {} as any };
  const { name = '', footerText = '', githubUrl = '', linkedinUrl = '', twitterUrl = '' } = siteConfig.personalInfo || {};
  
  return (
    <footer className="py-12 border-t border-black/5 dark:border-white/5 bg-transparent relative z-10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-32 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <a
            href="#"
            className="text-xl font-display font-bold tracking-tight inline-block mb-2 text-inherit"
          >
            {name}
          </a>
          <p className="opacity-60 text-sm text-inherit">
            {footerText.replace('© ' + currentYear, '© ' + currentYear)} {/* Fallback just in case */}
          </p>
        </div>
        
        <div className="flex items-center space-x-6">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-opacity" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-opacity" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {twitterUrl && (
            <a href={twitterUrl} target="_blank" rel="noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-opacity" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          )}
          <Link to="/admin-nj" className="text-inherit opacity-60 hover:opacity-100 transition-opacity ml-4" aria-label="Administration">
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
