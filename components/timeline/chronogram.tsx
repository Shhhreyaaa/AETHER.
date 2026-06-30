import React from 'react';
import { useAetherStore } from '@/store/useAetherStore';
import { ChevronRight } from 'lucide-react';

interface ChronogramProps {
  onViewAll: () => void;
}

export function Chronogram({ onViewAll }: ChronogramProps) {
  const { reweaveDay } = useAetherStore();
  const timeline = reweaveDay();

  return (
    <div className="glass p-5 rounded-3xl flex flex-col border border-white/5 gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-xs font-bold text-white tracking-widest uppercase">Chronogram Timeline</span>
        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wide">Dynamic Weaver</span>
      </div>

      {timeline.length === 0 ? (
        <p className="text-xs text-white/40 italic py-4 text-center">
          No events woven yet.
        </p>
      ) : (
        <div className="space-y-4 relative pl-4 border-l border-white/10 ml-2">
          {timeline.slice(0, 4).map((block, idx) => {
            // Format start hour to string e.g. 8.5 -> 08:30
            const hours = Math.floor(block.startHour);
            const mins = Math.round((block.startHour - hours) * 60);
            const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

            return (
              <div key={block.id || idx} className="relative group">
                {/* Bullet marker */}
                <div className="absolute left-[-21px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-800 group-hover:bg-[#3b82f6] transition-colors border-2 border-[#050507]" />

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-white/95 group-hover:text-white transition-colors">
                      {block.title}
                    </p>
                    <p className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wide font-medium">
                      {block.category} • {block.duration}h
                    </p>
                  </div>
                  <span className="text-[10px] text-white/45 font-mono pt-0.5">{timeStr}</span>
                </div>
              </div>
            );
          })}

          {timeline.length > 4 && (
            <button
              onClick={onViewAll}
              className="text-[10px] text-[#3b82f6] hover:text-[#3b82f6]/80 font-semibold flex items-center gap-0.5 pt-1"
            >
              View entire schedule ({timeline.length} blocks)
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
