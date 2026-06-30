'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { format } from 'date-fns';
import { useAetherStore } from '@/store/useAetherStore';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onClick?: (task: Task) => void;
}

export const TaskCard = React.memo(function TaskCard({ 
  task, 
  onComplete, 
  onClick 
}: TaskCardProps) {
  const { updateTask } = useAetherStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempPriority, setTempPriority] = useState(task.priority.toString());

  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== 'DONE';

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTempPriority(task.priority.toString());
  };

  const savePriority = () => {
    const newPriority = parseInt(tempPriority);
    if (!isNaN(newPriority) && newPriority >= 1 && newPriority <= 100) {
      updateTask(task.id, { priority: newPriority });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') savePriority();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
  };

  return (
    <GlassCard 
      className="task-card p-5 cursor-pointer group" 
      onClick={() => onClick?.(task)}
    >
      <div className="flex justify-between items-start">
        {/* Left Content */}
        <div className="flex-1 pr-4">
          <div className="font-semibold text-[17px] tracking-tight group-hover:text-[#3b82f6] transition-colors">
            {task.title}
          </div>
          
          {task.description && (
            <div className="text-sm text-white/50 mt-1.5 line-clamp-2">
              {task.description}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 text-xs">
            <div className="flex items-center gap-1 text-white/60">
              <span>⏱</span>
              <span>{task.estimatedMin} min</span>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white/70'}`}>
              {format(dueDate, 'MMM dd')}
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/60">
              {task.category}
            </div>
          </div>
        </div>

        {/* Right Side - Priority */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {isEditing ? (
            <input
              type="number"
              value={tempPriority}
              onChange={(e) => setTempPriority(e.target.value)}
              onBlur={savePriority}
              onKeyDown={handleKeyDown}
              className="w-[52px] text-4xl font-semibold tabular-nums tracking-tighter text-[#3b82f6] bg-transparent border-b border-[#3b82f6] text-right focus:outline-none"
              min="1"
              max="100"
              autoFocus
            />
          ) : (
            <div 
              onClick={handlePriorityClick}
              className="cursor-pointer text-right group-hover:opacity-80 transition-all"
            >
              <div className="text-[42px] leading-none font-semibold tabular-nums tracking-[-1.5px] text-[#3b82f6]">
                {task.priority}
              </div>
              <div className="text-[9px] text-white/40 tracking-[1.5px] -mt-0.5 flex items-center justify-end gap-1">
                PRIORITY
                <span className="opacity-0 group-hover:opacity-100 text-[10px]">✎</span>
              </div>
            </div>
          )}

          {/* Complete Button */}
          {task.status !== 'DONE' && (
            <button
              onClick={handleComplete}
              className="w-8 h-8 mt-1 rounded-2xl flex items-center justify-center border border-white/15 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 active:scale-95 transition-all"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
});
