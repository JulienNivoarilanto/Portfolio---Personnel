import React, { useMemo } from 'react';

interface SvgRendererProps {
  svgContent: string;
  className?: string;
  alt?: string;
}

/**
 * Safely and crisply renders an SVG either from raw SVG code (<svg...>...</svg>),
 * a Data URI (data:image/svg+xml,...), or an SVG URL (http... / ...).
 */
export const SvgRenderer: React.FC<SvgRendererProps> = ({ svgContent, className = '', alt = 'Illustration' }) => {
  const trimmed = (svgContent || '').trim();

  const isRawSvg = useMemo(() => {
    return trimmed.startsWith('<svg') || (trimmed.startsWith('<?xml') && trimmed.includes('<svg'));
  }, [trimmed]);

  const sanitizedRawSvg = useMemo(() => {
    if (!isRawSvg) return '';
    // Strip script tags to keep SVG safe
    return trimmed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }, [trimmed, isRawSvg]);

  if (!trimmed) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-xs p-6 ${className}`}>
        <span>Aucune illustration SVG</span>
      </div>
    );
  }

  if (isRawSvg) {
    return (
      <div 
        className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain filter drop-shadow-md select-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedRawSvg }}
      />
    );
  }

  return (
    <img 
      src={trimmed} 
      alt={alt} 
      className={`w-full h-full object-contain filter drop-shadow-md select-none ${className}`} 
      loading="lazy"
    />
  );
};
