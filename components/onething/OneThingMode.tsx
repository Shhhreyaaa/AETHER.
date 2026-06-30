'use client';

import { useState, useEffect } from 'react';
import { useAetherStore } from '@/store/useAetherStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Target, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export function OneThingMode() {
  const { oneThing, setOneThing } = useAetherStore();
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (oneThing) {
      setInput(oneThing);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [oneThing]);

  const handleSave = () => {
    if (!input.trim()) return;
    setOneThing(input.trim());
    setIsEditing(false);
    toast.success("Daily Focus Saved", {
      description: "Atmosphere calibrated. Focus on this single thread today."
    });
  };

  return (
    <GlassCard className="p-6 relative overflow-hidden border border-white/10 shadow-2xl">
      {/* Glow Effect */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="text-sm text-[#3b82f6] tracking-[2px] mb-3 uppercase">DAILY FOCUS</div>
      <div className="text-2xl font-semibold tracking-tight mb-5">What is the one thing that will make today successful?</div>

      <div>
        {isEditing ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Finish the pitch deck draft"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-white/20 transition-colors text-white placeholder-white/30"
            />
            <MagneticButton onClick={handleSave} variant="primary">
              Set
            </MagneticButton>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
            <span className="text-base font-medium text-white/90 leading-relaxed truncate flex-1">
              &quot;{oneThing}&quot;
            </span>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="text-xs text-white/35 mt-6">
        Calm the noise. Focus completely on what matters most.
      </div>
    </GlassCard>
  );
}
