'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { X } from 'lucide-react';

interface RescueProtocolModalProps {
  protocol: any;
  onClose: () => void;
  onStartFocus: () => void;
}

export function RescueProtocolModal({ protocol, onClose, onStartFocus }: RescueProtocolModalProps) {
  if (!protocol) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">
          <X size={20} />
        </button>

        <div>
          <div className="text-red-400 text-sm tracking-[2px] mb-1">EMERGENCY PROTOCOL</div>
          <h2 className="text-3xl font-semibold tracking-tighter pr-8">{protocol.taskTitle}</h2>
          <p className="mt-3 text-white/70">{protocol.motivationalNote}</p>
        </div>

        <div className="mt-8">
          <div className="text-xs tracking-wider text-white/50 mb-3">MICRO STEPS</div>
          <div className="space-y-3">
            {protocol.steps.map((step: string, index: number) => (
              <div key={index} className="glass rounded-2xl p-4 text-sm flex gap-3">
                <div className="text-[#3b82f6] font-mono mt-0.5">{index + 1}</div>
                <div>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <MagneticButton variant="secondary" onClick={onClose} className="flex-1">
            Maybe Later
          </MagneticButton>
          <MagneticButton variant="primary" onClick={onStartFocus} className="flex-1">
            Start 20-min Focus
          </MagneticButton>
        </div>
      </GlassCard>
    </div>
  );
}
