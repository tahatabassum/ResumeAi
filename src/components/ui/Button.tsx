import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'ai';
  children: React.ReactNode;
  onClick?: any;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  let baseStyle = 'inline-flex items-center justify-center font-medium font-label-md text-label-md rounded-md cursor-pointer transition-all active:scale-[0.98] h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  if (variant === 'primary') {
    // Solid blue
    baseStyle += ' bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm';
  } else if (variant === 'secondary') {
    // Bordered blue
    baseStyle += ' border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff] bg-transparent';
  } else if (variant === 'ghost') {
    // Text only, no border
    baseStyle += ' text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] bg-transparent';
  } else if (variant === 'ai') {
    // ✨ #7c3aed purple, white text, sparkle glow
    baseStyle += ' bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md ai-glow border-none font-bold';
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
