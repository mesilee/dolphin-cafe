'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        'bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-[#2563EB]/20 rounded-2xl shadow-lg',
        'hover:shadow-xl hover:border-[#2563EB]/40 transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}