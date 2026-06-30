'use client';

import { useAetherStore } from '@/store/useAetherStore';
import { getPrioritizedTasks } from '@/lib/ai/weaver';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { addHours } from 'date-fns';

export function TimelineWeaver() {
  const { tasks, userProfile, updateTask } = useAetherStore();
  const prioritized = getPrioritizedTasks(tasks, userProfile.energyProfile).filter(t => t.status !== 'DONE');

  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Simple time slots (8 AM to 10 PM)
  const timeSlots = Array.from({ length: 15 }, (_, i) => 8 + i);

  const handleDragEnd = (taskId: string, info: any) => {
    // Simple logic: move task forward/backward in time based on drag distance
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentDue = new Date(task.dueDate);
    const hoursShift = Math.round(info.offset.x / 80); // 80px ≈ 1 hour

    const newDueDate = addHours(currentDue, hoursShift);
    
    updateTask(taskId, { dueDate: newDueDate.toISOString() });
    setDraggedTask(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-semibold tracking-tighter">Timeline Weaver</div>
        <p className="text-white/60 mt-1">Drag tasks to reschedule. AI continuously re-optimizes.</p>
      </div>

      <GlassCard className="p-8 overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Time Header */}
          <div className="flex border-b border-white/10 pb-4 mb-6">
            {timeSlots.map((hour) => (
              <div key={hour} className="flex-1 text-center text-xs text-white/50">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Timeline Tracks */}
          <div className="space-y-4">
            {prioritized.slice(0, 6).map((task, index) => {
              const dueDate = new Date(task.dueDate);
              const startHour = dueDate.getHours();
              const leftPosition = ((startHour - 8) / 14) * 100;

              return (
                <div key={task.id} className="relative h-14 flex items-center">
                  {/* Background Track */}
                  <div className="absolute left-0 right-0 h-1 bg-white/10 rounded-full" />

                  {/* Draggable Task Block */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -400, right: 600 }}
                    onDragStart={() => setDraggedTask(task.id)}
                    onDragEnd={(_, info) => handleDragEnd(task.id, info)}
                    whileDrag={{ scale: 1.03, zIndex: 50 }}
                    className="absolute glass-strong border border-white/20 rounded-2xl px-5 py-2.5 cursor-grab active:cursor-grabbing flex items-center gap-4 shadow-xl"
                    style={{ 
                      left: `${Math.max(0, Math.min(85, leftPosition))}%`,
                      minWidth: '220px'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm tracking-tight truncate">{task.title}</div>
                      <div className="text-[10px] text-white/50 flex gap-2 mt-0.5">
                        <span>{task.estimatedMin} min</span>
                        <span>•</span>
                        <span className="text-[#3b82f6]">{task.priority}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <div className="text-xs text-white/40 px-2">
        Drag tasks left or right to reschedule. The Weaver AI will re-prioritize automatically.
      </div>
    </div>
  );
}
