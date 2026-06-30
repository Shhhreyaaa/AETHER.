'use client';

import { useState } from 'react';
import { useAetherStore } from '@/store/useAetherStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { toast } from 'sonner';

interface AddTaskModalProps {
  onClose: () => void;
}

export function AddTaskModal({ onClose }: AddTaskModalProps) {
  const { addTask } = useAetherStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMin, setEstimatedMin] = useState(60);
  const [category, setCategory] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 1000 * 3600 * 48).toISOString(),
      estimatedMin,
      impactScore: 7,
      energyCost: 5,
      category,
    });

    toast.success("Task added successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-lg">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Add New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-white/60 block mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Complete ML assignment"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What exactly needs to be done?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 h-24 resize-none text-white placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 block mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-2">Estimated Time (mins)</label>
              <input
                type="number"
                value={estimatedMin}
                onChange={(e) => setEstimatedMin(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-white/20 [&>option]:bg-[#0c0c12]"
            >
              <option value="General">General</option>
              <option value="Academics">Academics</option>
              <option value="ML / Technical">ML / Technical</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <MagneticButton type="button" onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </MagneticButton>
            <MagneticButton type="submit" variant="primary" className="flex-1">
              Add Task
            </MagneticButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
