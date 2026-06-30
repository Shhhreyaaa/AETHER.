import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonPremiumProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'rose';
}

export function ButtonPremium({ children, className, variant = 'secondary', ...props }: ButtonPremiumProps) {
  return (
    <button
      className={cn(
        'btn-premium magnetic px-5 py-2 rounded-2xl text-sm font-medium transition-all active:scale-[0.985] flex items-center justify-center gap-2 select-none',
        variant === 'primary' && 'bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 glow-purple border border-[#3b82f6]/20',
        variant === 'rose' && 'bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 glow-rose',
        variant === 'secondary' && 'bg-white/5 hover:bg-white/10 border border-white/10 text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
