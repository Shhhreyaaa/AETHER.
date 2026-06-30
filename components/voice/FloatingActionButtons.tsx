'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FloatingVoiceButton } from './FloatingVoiceButton';
import { AddTaskModal } from '../task/AddTaskModal';

export function FloatingActionButtons() {
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3.5">
        {/* Add Task Button */}
        <button
          onClick={() => setShowAddTask(true)}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all active:scale-95 shadow-2xl shrink-0"
        >
          <Plus className="text-white" size={24} />
        </button>

        {/* Mic Button */}
        <FloatingVoiceButton isFloating={false} />
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal onClose={() => setShowAddTask(false)} />
      )}
    </>
  );
}
