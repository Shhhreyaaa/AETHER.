'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { X } from 'lucide-react';

interface WeaveDayModalProps {
  blocks: any[];
  onClose: () => void;
}

export function WeaveDayModal({ blocks, onClose }: WeaveDayModalProps) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[#3b82f6] text-sm tracking-[2px]">WEAVER AI</div>
            <h2 className="text-3xl font-semibold tracking-tighter">Your Optimized Day</h2>
          </div>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="space-y-3 max-h-[420px] overflow-auto pr-2">
          {blocks.map((block, index) => (
            <div key={index} className="glass rounded-2xl p-5 flex justify-between items-center">
              <div>
                <div className="font-medium">{block.title}</div>
                <div className="text-xs text-white/50 mt-1">
                  {block.startHour.toFixed(1)} — {(block.startHour + block.duration).toFixed(1)} hrs • {block.category}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[#3b82f6] font-semibold">{block.priority}</div>
                <div className="text-[10px] text-white/50">PRIORITY</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <MagneticButton onClick={onClose} variant="primary" className="w-full">
            Accept This Schedule
          </MagneticButton>
        </div>
      </GlassCard>
    </div>
  );
}
