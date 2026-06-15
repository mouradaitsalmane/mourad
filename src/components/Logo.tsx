import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const fontSize = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }[size];

  return (
    <div className={`flex items-center select-none ${className}`} id="tasker-brand-logo-container">
      <span className={`font-black tracking-tight ${fontSize} text-sky-500 flex items-center`}>
        Tasker
      </span>
    </div>
  );
}
