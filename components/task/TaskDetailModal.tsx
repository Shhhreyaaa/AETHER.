'use client';

import { Task } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
  onStartFocus?: (task: Task) => void;
}

export function TaskDetailModal({ task, onClose, onComplete, onStartFocus }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-lg relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="pr-8">
          <div className="text-sm text-[#3b82f6] tracking-[2px] mb-2">{task.category.toUpperCase()}</div>
          <h2 className="text-3xl font-semibold tracking-tighter pr-10">{task.title}</h2>
          
          {task.description && (
            <p className="mt-4 text-white/70 leading-relaxed">{task.description}</p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-white/50 text-xs tracking-wider mb-1">DUE DATE</div>
              <div>{format(new Date(task.dueDate), 'EEEE, MMM dd')}</div>
            </div>
            <div>
              <div className="text-white/50 text-xs tracking-wider mb-1">ESTIMATED</div>
              <div>{task.estimatedMin} minutes</div>
            </div>
            <div>
              <div className="text-white/50 text-xs tracking-wider mb-1">PRIORITY</div>
              <div className="text-[#3b82f6] font-semibold text-xl tracking-tighter">{task.priority}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <MagneticButton 
            variant="secondary" 
            onClick={onClose}
            className="flex-1"
          >
            Close
          </MagneticButton>
          {task.status !== 'DONE' && onStartFocus && (
            <MagneticButton 
              variant="secondary" 
              onClick={() => {
                onStartFocus(task);
                onClose();
              }}
              className="flex-1 border border-white/10 hover:border-white/20"
            >
              Start Focus
            </MagneticButton>
          )}
          {task.status !== 'DONE' && (
            <MagneticButton 
              variant="primary" 
              onClick={() => {
                onComplete(task.id);
                onClose();
              }}
              className="flex-1"
            >
              Complete
            </MagneticButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
