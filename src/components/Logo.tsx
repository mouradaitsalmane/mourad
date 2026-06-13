import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  // Dimension definitions
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  }[size];

  const fontSize = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`} id="tasker-brand-logo-container">
      {/* Sleek icon representing task fulfillment */}
      <div 
        className={`flex items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 border border-sky-400/20 ${
          size === 'sm' ? 'p-1' : 'p-1.5'
        }`}
      >
        <CheckCircle2 className={`${iconSize} stroke-[2.5]`} />
      </div>
      
      {showText && (
        <span className={`font-black tracking-tight ${fontSize} text-slate-900 dark:text-white flex items-center`}>
          <span className="text-sky-500 font-black">Tasker</span>
        </span>
      )}
    </div>
  );
}
