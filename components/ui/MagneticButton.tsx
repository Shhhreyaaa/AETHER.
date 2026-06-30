'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
}

export function MagneticButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button'
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const styles = {
    primary: "bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white",
    secondary: "glass border border-white/20 hover:border-white/40",
    ghost: "hover:bg-white/5 text-white/90",
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className={`magnetic flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm transition-all active:scale-[0.985] ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
