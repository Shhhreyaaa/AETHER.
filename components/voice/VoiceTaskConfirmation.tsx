'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Sparkles, Calendar, Folder, Volume2 } from 'lucide-react';

interface VoiceTaskConfirmationProps {
  parsedTask: any;
  onConfirm: (editedTask: any) => void;
  onCancel: () => void;
}

export function VoiceTaskConfirmation({ parsedTask, onConfirm, onCancel }: VoiceTaskConfirmationProps) {
  const [title, setTitle] = useState(parsedTask.title || '');
  const [category, setCategory] = useState(parsedTask.category || 'General');

  // Convert ISO string to format required by input type="datetime-local" (YYYY-MM-DDTHH:MM)
  const toDatetimeLocal = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const [dueDate, setDueDate] = useState(toDatetimeLocal(parsedTask.dueDate));

  // Dynamic auto-generated micro plan
  const planSteps = [
    `Break down "${title || 'this task'}" into 2-3 smaller parts`,
    `Block 90 minutes in your calendar before the deadline`,
    `Start with the first small part today`,
  ];

  const handleConfirm = () => {
    onConfirm({
      title: title.trim() || parsedTask.title,
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : parsedTask.dueDate,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient light inside modal */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1.5 text-[#3b82f6] text-xs font-semibold tracking-[3px] uppercase mb-2 select-none">
              <Volume2 size={14} className="animate-pulse" /> Voice Captured
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg font-semibold text-center text-white placeholder-white/30 focus:outline-none focus:border-white/20 mt-1 focus:bg-white/10 transition-colors"
            />
          </div>

          <div className="space-y-4 py-4 border-t border-b border-white/5 my-6 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span className="text-white/55 flex items-center gap-2 select-none"><Folder size={14} /> Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-white/20 [&>option]:bg-[#0c0c12] cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Academics">Academics</option>
                <option value="ML / Technical">ML / Technical</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-white/55 flex items-center gap-2 select-none"><Calendar size={14} /> Deadline</span>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-white/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Mini Plan */}
          <div className="mb-8">
            <div className="text-xs tracking-wider text-white/40 flex items-center gap-1.5 mb-3 uppercase font-semibold select-none">
              <Sparkles size={12} className="text-[#3b82f6]" /> Suggested First Steps
            </div>
            <div className="space-y-2.5">
              {planSteps.map((step, index) => (
                <div key={index} className="glass rounded-2xl px-4 py-3 text-sm flex gap-3 border border-white/5 bg-white/5 select-none">
                  <span className="text-[#3b82f6] font-mono mt-0.5 font-bold">{index + 1}</span>
                  <span className="text-white/80 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <MagneticButton onClick={onCancel} variant="secondary" className="flex-1 font-medium py-3 rounded-xl">
              Cancel
            </MagneticButton>
            <MagneticButton onClick={handleConfirm} variant="primary" className="flex-1 font-medium py-3 rounded-xl">
              Add Task & Plan
            </MagneticButton>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
