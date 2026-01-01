
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'orange';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'orange', showText = true }) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 'w-16 h-16', text: 'text-4xl', gap: 'gap-4' },
    xl: { icon: 'w-24 h-24', text: 'text-6xl', gap: 'gap-6' },
  };

  const currentSize = sizeClasses[size];

  const colors = {
    orange: {
      bg: 'bg-gradient-to-br from-[#FF6B21] to-[#FF4F00]',
      text: 'text-slate-900',
      iconColor: 'white'
    },
    light: {
      bg: 'bg-white',
      text: 'text-white',
      iconColor: '#FF4F00'
    },
    dark: {
      bg: 'bg-slate-900',
      text: 'text-white',
      iconColor: 'white'
    }
  };

  const currentColor = colors[variant];

  return (
    <div className={`flex items-center ${currentSize.gap} group cursor-pointer`}>
      {/* Icon: The Geometric K */}
      <div className={`${currentSize.icon} ${currentColor.bg} rounded-[28%] flex items-center justify-center shadow-xl shadow-orange-500/10 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden`}>
        {/* Subtle geometric overlay for depth */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <svg 
          viewBox="0 0 24 24" 
          className="w-3/5 h-3/5" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M7 4V20M7 12L17 4M10 12L17 20" 
            stroke={variant === 'orange' ? 'white' : currentColor.iconColor} 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`${currentSize.text} font-[900] tracking-[-0.05em] ${variant === 'light' ? 'text-white' : 'text-slate-900'} transition-colors`}>
          KOOP<span className="text-[#FF4F00]">.</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
