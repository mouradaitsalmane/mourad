import React from 'react';

interface FintechLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  id?: string;
}

export default function FintechLogo({ 
  className = '', 
  size = 'md',
  showText = true,
  id
}: FintechLogoProps) {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm font-bold',
    lg: 'text-lg font-extrabold',
    xl: 'text-2xl font-black'
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id={id || "fictional-fintech-brand-logo"}>
      {/* Abstract Modern Fintech Icon: Interlocking geometric loops of blue and gold */}
      <svg 
        className={`${dimensions} transition-transform duration-500 hover:rotate-12`} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Professional Metallic Blue Gradient */}
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" /> {/* Blue 600 */}
            <stop offset="50%" stopColor="#3B82F6" /> {/* Blue 500 */}
            <stop offset="100%" stopColor="#1D4ED8" /> {/* Blue 700 */}
          </linearGradient>

          {/* Premium Reflective Gold Gradient */}
          <linearGradient id="goldGradient" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D97706" /> {/* Amber 600 */}
            <stop offset="50%" stopColor="#F59E0B" /> {/* Amber 500 */}
            <stop offset="100%" stopColor="#FCD34D" /> {/* Amber 300 */}
          </linearGradient>

          {/* Soft Glow Radial Gradient */}
          <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx="50" cy="50" r="45" fill="url(#softGlow)" />

        {/* Dynamic Inner Geometric Shield (SaaS Security) */}
        <path 
          d="M50 15 L82 31 V52 C82 68.5 68.5 82 50 87 C31.5 82 18 68.5 18 52 V31 L50 15 Z" 
          stroke="url(#blueGradient)" 
          strokeWidth="3.5" 
          strokeLinejoin="round"
          strokeOpacity="0.15"
          fill="none"
        />

        {/* Outer Intertwined Loop - High-tech Financial Flow (representing digital escrow & balance) */}
        <path 
          d="M32 40 C32 28.95 40.95 20 52 20 C63.05 20 72 28.95 72 40 C72 51.05 60 55 48 55 C36 55 32 60.95 32 72 C32 83.05 40.95 90 52 90" 
          stroke="url(#blueGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          className="drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
        />

        {/* Interlocking Golden Loop - Trust, Value & Multiplier */}
        <path 
          d="M68 60 C68 71.05 59.05 80 48 80 C36.95 80 28 71.05 28 60 C28 48.95 40 45 52 45 C64 45 68 39.05 68 28 C68 16.95 59.05 10 48 10" 
          stroke="url(#goldGradient)" 
          strokeWidth="6" 
          strokeLinecap="round"
          className="drop-shadow-[0_2px_6px_rgba(217,119,6,0.3)]"
        />

        {/* Center Golden Core - Verified Transaction Settlement */}
        <circle cx="50" cy="50" r="6" fill="url(#goldGradient)" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left font-sans">
          <span className={`${textSize} tracking-tight bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500 bg-clip-text text-transparent leading-none`}>
            CrediZone
          </span>
          <span className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">
            Secure Escrow
          </span>
        </div>
      )}
    </div>
  );
}
