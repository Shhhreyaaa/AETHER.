'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ViewTransitionProps {
  children: React.ReactNode;
  viewKey: string;
}

export function ViewTransition({ children, viewKey }: ViewTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
