import { CodeBlock, Project } from '../types';

export interface QuickLanguageOption {
  id: string;
  name: string;
  tag: string;
  dotColor: string;
  badgeClass?: string;
}

export const POPULAR_QUICK_LANGUAGES: QuickLanguageOption[] = [
  { id: 'python', name: 'Python', tag: 'PY', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'typescript', name: 'TypeScript', tag: 'TS', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'react', name: 'React', tag: 'REACT', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'sql', name: 'SQL', tag: 'SQL', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'bash', name: 'Bash', tag: 'SH', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'javascript', name: 'JavaScript', tag: 'JS', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'rust', name: 'Rust', tag: 'RS', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'go', name: 'Go', tag: 'GO', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'docker', name: 'Docker', tag: 'DOCKER', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'other', name: 'Autre', tag: 'DEV', dotColor: 'bg-zinc-400 dark:bg-zinc-500' },
];

/**
 * Returns a mature developer badge info (tag + neutral dot) without rainbow candy colors
 */
export function getLanguageBadge(lang?: string): { tag: string; dotColor: string; label: string } {
  const norm = normalizeLanguage(lang);
  const neutralDot = 'bg-zinc-400 dark:bg-zinc-500';
  switch (norm) {
    case 'python':
      return { tag: 'PY', dotColor: neutralDot, label: 'Python' };
    case 'typescript':
      return { tag: 'TS', dotColor: neutralDot, label: 'TypeScript' };
    case 'javascript':
      return { tag: 'JS', dotColor: neutralDot, label: 'JavaScript' };
    case 'jsx':
    case 'tsx':
    case 'react':
      return { tag: 'REACT', dotColor: neutralDot, label: 'React' };
    case 'sql':
      return { tag: 'SQL', dotColor: neutralDot, label: 'SQL' };
    case 'bash':
      return { tag: 'SH', dotColor: neutralDot, label: 'Bash' };
    case 'rust':
      return { tag: 'RS', dotColor: neutralDot, label: 'Rust' };
    case 'go':
      return { tag: 'GO', dotColor: neutralDot, label: 'Go' };
    case 'docker':
      return { tag: 'DOCKER', dotColor: neutralDot, label: 'Docker' };
    case 'css':
      return { tag: 'CSS', dotColor: neutralDot, label: 'CSS' };
    case 'html':
      return { tag: 'HTML', dotColor: neutralDot, label: 'HTML' };
    case 'c':
    case 'cpp':
      return { tag: 'C++', dotColor: neutralDot, label: 'C++' };
    case 'solidity':
      return { tag: 'SOL', dotColor: neutralDot, label: 'Solidity' };
    default:
      return { 
        tag: (norm.slice(0, 3)).toUpperCase() || 'DEV', 
        dotColor: neutralDot, 
        label: lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : 'Code' 
      };
  }
}

/**
 * Returns a display badge icon or clean indicator for a given programming language
 * (Maintained for backward compatibility without tacky emojis)
 */
export function getLanguageIcon(lang: string): string {
  const badge = getLanguageBadge(lang);
  return badge.tag;
}

/**
 * Normalizes language strings to valid Prism syntax highlighter language identifiers
 */
export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'javascript';
  const clean = lang.toLowerCase().trim();
  if (['py', 'python', 'python3', 'django', 'flask', 'fastapi'].includes(clean)) return 'python';
  if (['ts', 'typescript'].includes(clean)) return 'typescript';
  if (['js', 'javascript', 'node', 'nodejs'].includes(clean)) return 'javascript';
  if (['react', 'jsx'].includes(clean)) return 'jsx';
  if (['tsx'].includes(clean)) return 'tsx';
  if (['html', 'htm'].includes(clean)) return 'html';
  if (['css', 'tailwind', 'tailwindcss', 'scss', 'sass', 'less'].includes(clean)) return 'css';
  if (['sql', 'postgresql', 'postgres', 'mysql', 'sqlite', 'mariadb'].includes(clean)) return 'sql';
  if (['sh', 'bash', 'shell', 'zsh', 'terminal', 'cmd'].includes(clean)) return 'bash';
  if (['rs', 'rust'].includes(clean)) return 'rust';
  if (['go', 'golang'].includes(clean)) return 'go';
  if (['json'].includes(clean)) return 'json';
  if (['yaml', 'yml'].includes(clean)) return 'yaml';
  if (['md', 'markdown'].includes(clean)) return 'markdown';
  if (['c', 'h'].includes(clean)) return 'c';
  if (['cpp', 'c++', 'cplusplus'].includes(clean)) return 'cpp';
  if (['cs', 'c#', 'csharp'].includes(clean)) return 'csharp';
  if (['java', 'kotlin'].includes(clean)) return 'java';
  if (['php'].includes(clean)) return 'php';
  if (['docker', 'dockerfile'].includes(clean)) return 'docker';
  if (['ruby', 'rb'].includes(clean)) return 'ruby';
  if (['swift'].includes(clean)) return 'swift';
  if (['dart', 'flutter'].includes(clean)) return 'dart';
  if (['solidity', 'sol'].includes(clean)) return 'solidity';
  if (['graphql', 'gql'].includes(clean)) return 'graphql';
  return clean;
}

/**
 * Returns a clean display name for a language (e.g. 'ts' -> 'TypeScript')
 */
export function getLanguageDisplayName(lang: string): string {
  const norm = normalizeLanguage(lang);
  switch (norm) {
    case 'python': return 'Python';
    case 'typescript': return 'TypeScript';
    case 'javascript': return 'JavaScript';
    case 'jsx': return 'React (JSX)';
    case 'tsx': return 'React (TSX)';
    case 'sql': return 'SQL';
    case 'bash': return 'Bash / Shell';
    case 'rust': return 'Rust';
    case 'go': return 'Go';
    case 'css': return 'CSS';
    case 'html': return 'HTML';
    case 'json': return 'JSON';
    case 'java': return 'Java';
    case 'c': return 'C';
    case 'cpp': return 'C++';
    case 'csharp': return 'C#';
    case 'php': return 'PHP';
    case 'docker': return 'Docker';
    case 'ruby': return 'Ruby';
    case 'swift': return 'Swift';
    case 'dart': return 'Dart';
    case 'graphql': return 'GraphQL';
    case 'solidity': return 'Solidity';
    case 'yaml': return 'YAML';
    default: return lang.charAt(0).toUpperCase() + lang.slice(1);
  }
}

/**
 * Automatically extracts all code blocks from a project:
 * 1. From project.codeBlocks if present
 * 2. Parses markdown code fences (```python ... ```) if present in codeSnippet
 * 3. Or falls back to project.codeSnippet with project.codeLanguages
 */
export function extractProjectCodeBlocks(project: Partial<Project> | null | undefined): CodeBlock[] {
  if (!project) return [];

  // 1. If explicit codeBlocks exist and have non-empty code
  if (Array.isArray(project.codeBlocks) && project.codeBlocks.length > 0) {
    const validBlocks = project.codeBlocks.filter(b => b && typeof b.code === 'string' && b.code.trim() !== '');
    if (validBlocks.length > 0) {
      return validBlocks.map((b, idx) => ({
        id: b.id || `block-${idx}`,
        language: b.language || 'typescript',
        title: b.title || getLanguageDisplayName(b.language || 'typescript'),
        code: b.code
      }));
    }
  }

  // 2. Check codeSnippet
  const snippet = project.codeSnippet;
  if (!snippet || typeof snippet !== 'string' || snippet.trim() === '') {
    return [];
  }

  // Check if snippet contains markdown code fences like ```python ... ```
  const fenceRegex = /```([a-zA-Z0-9_#-]+)?\s*\n([\s\S]*?)```/g;
  const matches = Array.from(snippet.matchAll(fenceRegex));

  if (matches.length > 0) {
    const blocks: CodeBlock[] = [];
    matches.forEach((m, idx) => {
      const lang = (m[1] && m[1].trim()) ? m[1].trim() : (project.codeLanguages?.[idx] || project.codeLanguage || 'code');
      const code = m[2] ? m[2].trim() : '';
      if (code) {
        blocks.push({
          id: `fence-${idx}`,
          language: lang,
          title: getLanguageDisplayName(lang),
          code
        });
      }
    });

    if (blocks.length > 0) {
      return blocks;
    }
  }

  // 3. Fallback: single code block with project's defined language(s)
  const primaryLang = (project.codeLanguages && project.codeLanguages.length > 0)
    ? project.codeLanguages[0]
    : (project.codeLanguage || 'typescript');

  return [
    {
      id: 'default-0',
      language: primaryLang,
      title: getLanguageDisplayName(primaryLang),
      code: snippet.trim()
    }
  ];
}
