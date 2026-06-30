'use client';

import { useState } from 'react';
import { useAetherStore } from '@/store/useAetherStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Trash2, CheckCircle2, TrendingUp, AlertTriangle, ShieldAlert, Sparkles, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export function InsightsHabitsView() {
  const { habits, addHabit, toggleHabit, deleteHabit, tasks } = useAetherStore();
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedTasks = tasks.filter(t => t.status === 'DONE');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabit(newHabitTitle.trim());
    toast.success('Habit added', { description: `"${newHabitTitle}" created.` });
    setNewHabitTitle('');
    setIsAdding(false);
  };

  // Peak hours analytics data (simulated with dynamic highlighting)
  const peakData = [
    { label: 'Morning (6am-12pm)', value: 68, active: true, color: 'bg-blue-500 shadow-blue-500/20' },
    { label: 'Afternoon (12pm-5pm)', value: 42, active: false, color: 'bg-violet-500/80 shadow-violet-500/10' },
    { label: 'Evening (5pm-10pm)', value: 18, active: false, color: 'bg-white/10 shadow-transparent' },
    { label: 'Night (10pm-6am)', value: 8, active: false, color: 'bg-white/5 shadow-transparent' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Habit Tracking Grid */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="text-xs text-white/50 tracking-wider uppercase">ROUTINE ALIGNMENT</div>
              <div className="text-3xl font-semibold tracking-tight text-white mt-1">Core Habits</div>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add Habit Inline Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
              >
                <GlassCard className="p-4 border border-white/10">
                  <form onSubmit={handleAdd} className="flex gap-3">
                    <input
                      type="text"
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      placeholder="Enter habit name..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/20"
                      autoFocus
                    />
                    <MagneticButton type="submit" variant="primary" className="text-xs py-2 px-4 rounded-xl font-semibold">
                      Add
                    </MagneticButton>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Habits List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {habits.map((habit) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isCompletedToday = habit.completedDates.includes(todayStr);

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard className={`p-4 border hover:border-white/25 transition-all relative group ${
                      isCompletedToday ? 'border-blue-500/30 bg-blue-500/[0.02]' : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleHabit(habit.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                              isCompletedToday 
                                ? 'bg-[#3b82f6] border-[#3b82f6] text-white scale-105' 
                                : 'border-white/20 hover:border-white/40 bg-transparent text-transparent'
                            }`}
                          >
                            ✓
                          </button>
                          <span className={`text-sm font-medium transition-colors ${
                            isCompletedToday ? 'text-white/95 line-through decoration-white/20' : 'text-white/80'
                          }`}>
                            {habit.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Streak Flame */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold tracking-wide ${
                            habit.streak > 0 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-white/5 text-white/40'
                          }`}>
                            <Flame size={14} className={habit.streak > 0 ? 'fill-amber-500/20' : ''} />
                            <span>{habit.streak} DAY STREAK</span>
                          </div>

                          {/* Delete Action */}
                          <button
                            onClick={() => {
                              deleteHabit(habit.id);
                              toast.success('Habit deleted');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
              {habits.length === 0 && (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-white/40 text-sm">
                  No habits added yet. Track your routines to align your day.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Analytics Insights Dashboard */}
        <div className="lg:col-span-6 space-y-6">
          <div className="px-1">
            <div className="text-xs text-white/50 tracking-wider uppercase">PERFORMANCE TELEMETRY</div>
            <div className="text-3xl font-semibold tracking-tight text-white mt-1">Focus Insights</div>
          </div>

          {/* Peak Hours Completion Chart */}
          <GlassCard className="p-5 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-[#3b82f6]" />
                <span className="text-xs font-bold tracking-wider uppercase text-white/70">Peak Completion Hours</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">14d Window</span>
            </div>

            {/* Custom SVG/Tailwind Columns Chart */}
            <div className="space-y-4 pt-2">
              {peakData.map((d, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={d.active ? 'text-white font-bold' : 'text-white/60'}>
                      {d.label} {d.active && '⚡'}
                    </span>
                    <span className={d.active ? 'text-[#3b82f6] font-bold' : 'text-white/80'}>
                      {d.value}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.value}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full transition-all ${d.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-white/50 leading-relaxed flex gap-2 border-t border-white/5">
              <span className="text-[#3b82f6]">ℹ</span>
              <span>
                You complete <span className="text-white font-bold">68% more tasks</span> when started before 11 AM. Weaver AI recommends scheduling deep focus blocks in your morning window.
              </span>
            </div>
          </GlassCard>

          {/* Behavioral Insights Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Task Friction */}
            <GlassCard className="p-4 border border-white/10 flex gap-3 items-start bg-black/15">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                <AlertTriangle size={15} />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-white/40 uppercase">Task Friction</div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Technical tasks experience a <span className="text-violet-400 font-bold">45% higher delay rate</span>.
                </div>
                <div className="text-[10px] text-white/40 pt-1 font-semibold">
                  Aether recommends planning subtasks &lt; 30 min.
                </div>
              </div>
            </GlassCard>

            {/* Habit Multiplier */}
            <GlassCard className="p-4 border border-white/10 flex gap-3 items-start bg-black/15">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <TrendingUp size={15} />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-white/40 uppercase">Habit Multiplier</div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Completing your &quot;Deep Work&quot; routine triggers a <span className="text-emerald-400 font-bold">2.4x task completion boost</span>.
                </div>
                <div className="text-[10px] text-white/40 pt-1 font-semibold">
                  Streaks protect high-leverage outcomes.
                </div>
              </div>
            </GlassCard>

            {/* Peak Days */}
            <GlassCard className="p-4 border border-white/10 flex gap-3 items-start bg-black/15 col-span-1 md:col-span-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                <Sparkles size={15} />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-white/40 uppercase">Optimal Days</div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Tuesdays and Thursdays are your peak focus zones. You register <span className="text-[#3b82f6] font-bold">38% longer session times</span>.
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
}
