
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'orange';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl lg:text-3xl',
    lg: 'text-5xl lg:text-6xl',
    xl: 'text-7xl lg:text-8xl',
  };

  const colorClasses = {
    light: 'text-white',
    dark: 'text-slate-900',
    orange: 'text-[#FF4F00]',
  };

  return (
    <div 
      className={`
        inline-flex items-center font-black tracking-tighter uppercase 
        transition-all duration-700 ease-out hover:scale-105 active:scale-95
        cursor-pointer group select-none
        ${sizeClasses[size]} 
        ${colorClasses[variant === 'orange' ? 'orange' : variant]} 
        ${className}
      `}
    >
      <span className="relative">
        KOOP
        {/* Subtle sliding underline animation on hover */}
        <span className="absolute -bottom-1 left-0 w-0 h-1 bg-[#FF4F00] transition-all duration-500 group-hover:w-full rounded-full" />
      </span>
      <span className="text-[#FF4F00] relative flex h-full">
        .
        {/* Motion animation for the dot */}
        <span className="absolute inset-0 text-[#FF4F00] animate-ping opacity-20 group-hover:opacity-40 transition-opacity">.</span>
      </span>
    </div>
  );
};

export default Logo;
