'use client';

import { useAetherStore } from '@/store/useAetherStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function SentinelSuggestions() {
  const { tasks, updateTask, setCurrentView, setFocusMode, addChatMessage } = useAetherStore();

  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const now = new Date();

  // Find overdue tasks
  const overdueTasks = activeTasks.filter(t => new Date(t.dueDate) < now);

  // Find tasks due within 24 hours
  const urgentTasks = activeTasks.filter(t => {
    const diff = new Date(t.dueDate).getTime() - now.getTime();
    return diff > 0 && diff < 24 * 3600 * 1000;
  });

  const getGreetingNudge = () => {
    const hours = now.getHours();
    if (hours >= 5 && hours < 12) {
      return {
        type: 'morning',
        icon: <Zap size={18} className="text-[#3b82f6]" />,
        title: 'Morning Focus Alignment',
        text: activeTasks.length > 0 
          ? `Start your day strong. Ready to align and focus on your top task: "${activeTasks[0].title}"?`
          : 'Your workspace is clear this morning. Start by consulting Aether to outline new goals.',
        actionLabel: activeTasks.length > 0 ? 'Start Focus' : 'Open Oracle',
        action: () => {
          if (activeTasks.length > 0) {
            setFocusMode(true, activeTasks[0].title);
          } else {
            setCurrentView('oracle');
          }
        }
      };
    } else if (hours >= 12 && hours < 17) {
      return {
        type: 'afternoon',
        icon: <Clock size={18} className="text-violet-400" />,
        title: 'Midday Energy Check',
        text: 'Afternoon productivity peaks are shifting. Protect your focus with a structured deep work session.',
        actionLabel: 'Weave Timeline',
        action: () => setCurrentView('timeline')
      };
    } else {
      return {
        type: 'evening',
        icon: <CheckCircle2 size={18} className="text-emerald-400" />,
        title: 'Evening Reflection',
        text: 'Winding down. Excellent work maintaining your momentum. Let\'s review your timeline achievements.',
        actionLabel: 'Review Insights',
        action: () => setCurrentView('insights')
      };
    }
  };

  // Compile active suggestions list
  const suggestions = [];

  // 1. Overdue Nudge
  if (overdueTasks.length > 0) {
    const task = overdueTasks[0];
    suggestions.push({
      id: `overdue-${task.id}`,
      type: 'overdue',
      icon: <AlertCircle size={18} className="text-red-400 animate-pulse" />,
      title: 'Overdue Thread Detected',
      text: `"${task.title}" is past its target timeline. Let's align your schedule to recover momentum.`,
      secondaryText: `Due: ${new Date(task.dueDate).toLocaleDateString()}`,
      actions: (
        <div className="flex gap-2 mt-3 select-none">
          <button
            onClick={() => {
              const tomorrow = new Date(Date.now() + 86400000).toISOString();
              updateTask(task.id, { dueDate: tomorrow });
              toast.success('Rescheduled task', { description: 'Due date shifted to tomorrow.' });
            }}
            className="text-[10px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
          >
            Postpone 24h
          </button>
          <button
            onClick={() => {
              // Write message to chat history and redirect
              addChatMessage('user', `Help me break down and plan steps for overdue task: "${task.title}"`);
              setCurrentView('oracle');
              toast.info('Consulting Aether...', { description: 'Opening Oracle for subtask planning.' });
            }}
            className="text-[10px] font-semibold px-2.5 py-1.5 rounded-xl bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/20 text-[#3b82f6] hover:text-white transition-colors"
          >
            Plan Steps
          </button>
        </div>
      )
    });
  }

  // 2. Urgent Nudge
  if (urgentTasks.length > 0 && overdueTasks.length === 0) {
    const task = urgentTasks[0];
    suggestions.push({
      id: `urgent-${task.id}`,
      type: 'urgent',
      icon: <Zap size={18} className="text-[#3b82f6]" />,
      title: 'Approaching Deadline',
      text: `"${task.title}" is due in less than 24 hours. Protect a block of time to lock focus.`,
      secondaryText: `Due: Today at ${new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      actions: (
        <div className="flex gap-2 mt-3 select-none">
          <MagneticButton
            onClick={() => {
              setFocusMode(true, task.title);
              toast.info('Focus Session Started');
            }}
            variant="primary"
            className="text-[10px] py-1.5 px-3 font-semibold rounded-xl"
          >
            Start Focus
          </MagneticButton>
          <button
            onClick={() => {
              addChatMessage('user', `What is a good strategy to complete "${task.title}" before my deadline?`);
              setCurrentView('oracle');
            }}
            className="text-[10px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
          >
            Analyze Next Steps
          </button>
        </div>
      )
    });
  }

  // 3. Time-based Greeting Nudge (if no immediate overdue/urgent crisis)
  if (suggestions.length === 0) {
    const greeting = getGreetingNudge();
    suggestions.push({
      id: `greeting-${greeting.type}`,
      type: greeting.type,
      icon: greeting.icon,
      title: greeting.title,
      text: greeting.text,
      actions: (
        <div className="mt-3 select-none">
          <button
            onClick={greeting.action}
            className="text-[10px] font-semibold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors flex items-center gap-1"
          >
            {greeting.actionLabel} <ChevronRight size={10} />
          </button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-xs font-semibold tracking-[2px] text-white/40 px-1 select-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-ping" />
        SENTINEL NUDGES
      </div>
      <AnimatePresence mode="popLayout">
        {suggestions.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <GlassCard className="p-5 border border-white/15 relative overflow-hidden bg-black/40 hover:border-white/25 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent blur-xl pointer-events-none" />
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-semibold tracking-wide text-white/90">
                    {s.title}
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {s.text}
                  </p>
                  {s.secondaryText && (
                    <div className="text-[10px] font-semibold text-white/40 pt-0.5">
                      {s.secondaryText}
                    </div>
                  )}
                  {s.actions}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
