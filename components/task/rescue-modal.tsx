import React, { useEffect } from 'react';
import { RescueProtocol } from '@/types';
import { useAetherStore } from '@/store/useAetherStore';
import { speakText, stopSpeaking } from '@/lib/voice';
import { ShieldAlert, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface RescueModalProps {
  protocol: RescueProtocol;
  onClose: () => void;
}

export function RescueModal({ protocol, onClose }: RescueModalProps) {
  const { tasks, completeTask } = useAetherStore();
  const task = tasks.find((t) => t.id === protocol.taskId);

  // Trigger voice synthesis on mount
  useEffect(() => {
    if (protocol.motivationalNote) {
      speakText(protocol.motivationalNote);
    }
    return () => {
      stopSpeaking();
    };
  }, [protocol]);

  const handleConquer = () => {
    if (task) {
      completeTask(task.id);
      toast.success('Target Conquered. Rescue protocol terminated.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Cinematic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-950/10 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl glass border border-rose-500/20 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 text-rose-400 border-b border-white/5 pb-4">
          <ShieldAlert className="h-6 w-6 animate-pulse" />
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Aether Rescue Protocol</h2>
            <p className="text-[10px] text-rose-400/80 font-bold uppercase tracking-widest mt-0.5">Atmosphere locked. Eliminate noise.</p>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Target</span>
          <h3 className="text-xl font-semibold text-white mt-1">
            {task?.title || 'Focused Thread'}
          </h3>
        </div>

        {/* Motivational Coaching note */}
        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs italic text-rose-300/90 leading-relaxed text-glow">
          &quot;{protocol.motivationalNote}&quot;
        </div>

        {/* Steps Checklist */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Micro-Steps Pathway</span>
          <div className="space-y-3.5">
            {protocol.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white/70 shrink-0">
                  {idx + 1}
                </div>
                <p className="text-xs text-white/80 leading-normal pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-2">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Clock className="h-4 w-4 text-rose-400" />
            <span>Total focus time: <strong>{protocol.estimatedTotalMin} min</strong></span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition-all"
            >
              Postpone
            </button>
            <button
              onClick={handleConquer}
              className="btn-premium px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg glow-rose border border-rose-500/30"
            >
              Conquer Target
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
