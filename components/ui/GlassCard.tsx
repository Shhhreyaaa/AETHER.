'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.003 } : undefined}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={cn(
        "glass-strong rounded-3xl border border-white/10 p-6 transition-all duration-300",
        hover && "hover:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
