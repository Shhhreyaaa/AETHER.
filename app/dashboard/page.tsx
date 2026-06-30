'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAetherStore } from '@/store/useAetherStore';
import { useAuthStore } from '@/store/useAuthStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ViewTransition } from '@/components/ui/ViewTransition';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { OracleChat } from '@/components/oracle/OracleChat';
import { WeaveDayModal } from '@/components/ai/WeaveDayModal';
import { RescueProtocolModal } from '@/components/ai/RescueProtocolModal';

const ChronoSphere = dynamic(
  () => import('@/components/3d/ChronoSphere'),
  { 
    ssr: false,
    loading: () => <div className="text-center py-20 text-white/50">Loading 3D view...</div>
  }
);
import { TimelineWeaver } from '@/components/timeline/TimelineWeaver';
import { FocusMode } from '@/components/focus/FocusMode';
import { FloatingActionButtons } from '@/components/voice/FloatingActionButtons';
import { OneThingMode } from '@/components/onething/OneThingMode';
import { getPrioritizedTasks } from '@/lib/ai/weaver';
import { TaskCompleteConfetti } from '@/components/ui/TaskCompleteConfetti';
import { SentinelSuggestions } from '@/components/task/SentinelSuggestions';
import { InsightsHabitsView } from '@/components/insights/InsightsHabitsView';
import { toast } from 'sonner';
import { Target, Zap, Clock, X, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { 
    tasks, 
    userProfile, 
    currentView, 
    setCurrentView,
    completeTask,
    updateTask,
    reweaveDay,
    generateRescueProtocol,
    oneThing,
    isFocusMode,
    focusTaskTitle,
    setFocusMode
  } = useAetherStore();

  const { user, logout } = useAuthStore();
  const userName = user?.name || userProfile?.name || 'Layane';

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [rescueProtocol, setRescueProtocol] = useState<any>(null);
  const [weaveBlocks, setWeaveBlocks] = useState<any[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [sentinelSuggestion, setSentinelSuggestion] = useState<any>(null);
  const [sentinelEnabled, setSentinelEnabled] = useState(false);
  const [showSentinelSuggestion, setShowSentinelSuggestion] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const prioritized = useMemo(() => {
    return getPrioritizedTasks(tasks, userProfile.energyProfile);
  }, [tasks, userProfile.energyProfile]);

  const activeTasks = useMemo(() => {
    return prioritized.filter(t => t.status !== 'DONE');
  }, [prioritized]);

  const startFocusSession = (title: string = "Deep Work Session") => {
    setFocusMode(true, title);
  };

  // Keyboard Shortcuts Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setFocusMode(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentView('oracle');
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCurrentView('oracle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, setCurrentView, setFocusMode]);

  // Dynamic Sentinel Suggestion Generator
  const updateSentinelSuggestion = () => {
    if (activeTasks.length === 0) {
      setSentinelSuggestion({
        type: 'clear',
        title: 'All Clear',
        text: 'You have completed all active threads. Outstanding work maintaining momentum!',
        actionLabel: 'Oracle Consultation',
        action: () => setCurrentView('oracle'),
      });
      return;
    }

    // 1. Check for urgent deadline (<24h)
    const urgentTask = activeTasks.find(t => {
      const hoursLeft = (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 3600);
      return hoursLeft > 0 && hoursLeft < 24;
    });

    if (urgentTask) {
      setSentinelSuggestion({
        type: 'urgent',
        title: 'Urgent Nudge',
        text: `"${urgentTask.title}" is due in less than 24 hours. AETHER recommends starting a Focus Session now with a structured pathway.`,
        actionLabel: 'Start Focus',
        action: () => startFocusSession(urgentTask.title),
      });
      return;
    }

    // 2. Check if morning
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) {
      setSentinelSuggestion({
        type: 'morning',
        title: 'Morning Focus',
        text: `Good morning! Your most important task today is "${activeTasks[0].title}". Shall we initiate focus?`,
        actionLabel: 'Start Focus',
        action: () => startFocusSession(activeTasks[0].title),
      });
      return;
    }

    // 3. Energy profile match
    const highestTask = activeTasks[0];
    setSentinelSuggestion({
      type: 'energy',
      title: 'Sentinel Suggestion',
      text: `Your current energy matches "${highestTask.title}". Ready to tackle this highest priority task?`,
      actionLabel: 'Start Focus',
      action: () => startFocusSession(highestTask.title),
    });
  };

  // Sentinel Mode Dynamic Controller
  useEffect(() => {
    if (!sentinelEnabled) {
      setShowSentinelSuggestion(false);
      return;
    }

    updateSentinelSuggestion();

    const demoTimeout = setTimeout(() => {
      setShowSentinelSuggestion(true);
    }, 2000);

    return () => clearTimeout(demoTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelEnabled, tasks]);

  const handleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    completeTask(id);
    setConfettiTrigger(prev => prev + 1);

    const nextTask = tasks.filter(t => t.id !== id && t.status !== 'DONE')[0];
    const descriptionText = nextTask 
      ? `Great work! Ready for "${nextTask.title}" next?`
      : "Excellent work! All threads checked off today.";

    toast.success("Task completed", {
      description: descriptionText,
      action: {
        label: "Undo",
        onClick: () => {
          updateTask(id, { status: 'TODO', completedAt: undefined });
          toast.success("Task restored");
        }
      }
    });

    if (sentinelEnabled) {
      setSentinelSuggestion({
        type: 'celebration',
        title: 'Momentum Maintained',
        text: task 
          ? `Checked off: "${task.title}". Outstanding work! Ready to jump into the next thread, or take a short break?`
          : 'Task completed! Maintain momentum.',
        actionLabel: nextTask ? 'Next Task' : 'Go to Oracle',
        action: () => {
          if (nextTask) {
            startFocusSession(nextTask.title);
          } else {
            setCurrentView('oracle');
          }
          setShowSentinelSuggestion(false);
        }
      });
      setShowSentinelSuggestion(true);
    }
  };

  const handleWeaveDay = () => {
    const blocks = reweaveDay();
    setWeaveBlocks(blocks);
  };

  const handleRescueMe = () => {
    if (activeTasks.length === 0) return;
    const protocol = generateRescueProtocol(activeTasks[0].id);
    if (protocol) {
      setRescueProtocol(protocol);
      toast.error(`Rescue Protocol Activated`, {
        description: protocol.motivationalNote,
      });
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {isClient && <TaskCompleteConfetti trigger={confettiTrigger} />}
      {/* Top Bar */}
      <div className="glass-strong border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
              <span className="font-semibold tracking-[-2px] text-2xl">A</span>
            </div>
            <div className="font-semibold tracking-tighter text-2xl">AETHER</div>
          </div>

          <div className="flex items-center gap-3">
            <MagneticButton onClick={handleWeaveDay} variant="secondary">Weave My Day</MagneticButton>
            <MagneticButton onClick={handleRescueMe} variant="primary">Rescue Me</MagneticButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10 pb-20 flex gap-8">
        {/* Sidebar */}
        <div className="w-72 glass-strong rounded-3xl p-6 h-fit sticky top-24">
          <div className="mb-8 px-2">
            <div className="text-[10px] tracking-[3px] text-white/50 mb-1">WORKSPACE</div>
            <div className="text-3xl font-semibold tracking-tighter">AETHER</div>
          </div>

          <div className="space-y-1 text-sm">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Target },
              { id: 'oracle', label: 'The Oracle', icon: Zap },
              { id: 'chronosphere', label: 'ChronoSphere', icon: Clock },
              { id: 'timeline', label: 'Timeline Weaver', icon: Clock },
              { id: 'insights', label: 'Insights & Habits', icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`sidebar-item w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${currentView === item.id ? 'active' : 'hover:bg-white/5 text-white/70'}`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </div>

          {/* Focus Mode Trigger */}
          <button
            onClick={() => startFocusSession(activeTasks[0]?.title || "Deep Work Session")}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-medium text-sm active:scale-95"
          >
            <Zap size={14} className="text-[#3b82f6]" /> Start Focus Session
          </button>

          {/* Sentinel Mode Toggle */}
          <div className="mt-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs text-white/70">
            <div className="flex flex-col">
              <span className="font-semibold text-white">Sentinel Mode</span>
              <span className="text-[10px] text-white/40">Proactive suggestions</span>
            </div>
            <button
              onClick={() => {
                setSentinelEnabled(!sentinelEnabled);
                toast.success(`Sentinel Mode ${!sentinelEnabled ? 'Enabled' : 'Disabled'}`, {
                  description: !sentinelEnabled 
                    ? 'AETHER will proactively optimize your focus flow.' 
                    : 'Proactive recommendations paused.'
                });
              }}
              className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 outline-none ${sentinelEnabled ? 'bg-[#3b82f6]' : 'bg-white/10'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${sentinelEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-6 border-t border-white/10 pt-4 px-2 space-y-2">
            <div className="text-[10px] tracking-[2px] text-white/40 font-semibold uppercase">Shortcuts</div>
            <div className="flex justify-between text-[11px] text-white/50">
              <span>Open Oracle</span>
              <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-[9px]">/</span>
            </div>
            <div className="flex justify-between text-[11px] text-white/50">
              <span>Command Palette</span>
              <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-[9px]">Ctrl + K</span>
            </div>
            <div className="flex justify-between text-[11px] text-white/50">
              <span>Exit Focus</span>
              <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-[9px]">Esc</span>
            </div>
          </div>

          {/* Profile & Log Out */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0 font-medium text-blue-400">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white truncate">{userName}</span>
                <span className="text-[10px] text-white/40 truncate">{user?.email || 'offline@aether.ai'}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="text-[11px] text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all px-2.5 py-1.5 rounded-xl border border-transparent hover:border-red-500/10 font-semibold"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {isClient ? (
            <ViewTransition viewKey={currentView}>
            {/* === DASHBOARD === */}
            {currentView === 'dashboard' && (
              <div>
                {/* Cinematic Greeting */}
                <div className="mb-12">
                  <div className="text-[#3b82f6] text-sm tracking-[3.5px] font-medium mb-3">
                    {getGreeting().toUpperCase()}
                  </div>
                  <h1 className="text-7xl font-semibold tracking-tighter">
                    {getGreeting()}, {userName}.
                  </h1>
                  <p className="mt-4 text-2xl text-white/70">
                    You have <span className="text-white font-medium">{activeTasks.length} active threads</span> demanding your focus today.
                  </p>
                  {oneThing && (
                    <div className="mt-4 px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#3b82f6] font-semibold text-xs w-fit flex items-center gap-2 select-none shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      Daily Focus: <span className="text-white font-medium">&quot;{oneThing}&quot;</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Today's Highest Priority Threads */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-6 px-1">
                      <div>
                        <div className="text-sm text-white/60 tracking-wider">TODAY’S FOCUS</div>
                        <div className="text-3xl font-semibold tracking-tight">Highest Priority Threads</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {activeTasks.length > 0 ? (
                          activeTasks.map((task) => (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                              <TaskCard 
                                task={task} 
                                onComplete={handleComplete}
                                onClick={setSelectedTask}
                              />
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <GlassCard className="p-10 text-center flex flex-col items-center justify-center border border-dashed border-white/10 relative overflow-hidden bg-white/[0.01]">
                              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#3b82f6] mb-4">
                                <Sparkles size={22} className="animate-pulse" />
                              </div>
                              <h3 className="text-lg font-semibold tracking-tight text-white mb-2">Aether Atmosphere Clean</h3>
                              <p className="text-sm text-white/50 max-w-sm mb-6 leading-relaxed">
                                No active threads remain. Your calendar is clear and your focus energy is preserved.
                              </p>
                              <button
                                onClick={() => setCurrentView('oracle')}
                                className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                              >
                                Consult the Oracle
                              </button>
                            </GlassCard>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right Sidebar - Daily Focus + Sentinel Suggestions */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Sentinel Suggestions */}
                    {sentinelEnabled && <SentinelSuggestions />}

                    {/* Daily Focus / One Thing */}
                    <OneThingMode />
                  </div>
                </div>
              </div>
            )}

            {/* The Oracle View */}
            {currentView === 'oracle' && (
              <div>
                <div className="mb-6">
                  <div className="text-3xl font-semibold tracking-tighter">The Oracle</div>
                  <p className="text-white/60 mt-1">Talk naturally. Get intelligent, contextual help.</p>
                </div>
                <OracleChat />
              </div>
            )}

            {/* ChronoSphere View */}
            {currentView === 'chronosphere' && (
              <div>
                <div className="mb-6 select-none">
                  <div className="text-3xl font-semibold tracking-tighter">ChronoSphere</div>
                  <p className="text-white/60">Your time visualized as a living system.</p>
                </div>
                <Suspense fallback={<div className="text-center py-20 text-white/50 text-xs animate-pulse">Loading 3D view...</div>}>
                  <ChronoSphere />
                </Suspense>
              </div>
            )}

            {/* Timeline View */}
            {currentView === 'timeline' && <TimelineWeaver />}

            {/* Insights & Habits View */}
            {currentView === 'insights' && (
              <div>
                <div className="mb-6 select-none">
                  <div className="text-3xl font-semibold tracking-tighter">Insights & Habits</div>
                  <p className="text-white/60 mt-1">Your core routines and behavioral focus telemetry.</p>
                </div>
                <InsightsHabitsView />
              </div>
            )}

            {/* Other Views (Placeholders) */}
            {currentView !== 'dashboard' && currentView !== 'oracle' && currentView !== 'chronosphere' && currentView !== 'timeline' && currentView !== 'insights' && (
              <GlassCard className="min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-semibold tracking-tight mb-2 capitalize">{currentView}</div>
                  <p className="text-white/50">This section will be expanded in upcoming phases.</p>
                </div>
              </GlassCard>
            )}
          </ViewTransition>
          ) : (
            <div className="min-h-[450px] flex items-center justify-center">
              <span className="text-white/30 text-xs tracking-widest animate-pulse">ALIGNING AETHER FIELD...</span>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onComplete={handleComplete} 
        onStartFocus={(task) => startFocusSession(task.title)}
      />

      {weaveBlocks.length > 0 && (
        <WeaveDayModal blocks={weaveBlocks} onClose={() => setWeaveBlocks([])} />
      )}
      <RescueProtocolModal 
        protocol={rescueProtocol} 
        onClose={() => setRescueProtocol(null)} 
        onStartFocus={() => {
          setRescueProtocol(null);
          startFocusSession(activeTasks[0]?.title || "Rescue Focus Session");
        }} 
      />

      <AnimatePresence>
        {isFocusMode && (
          <FocusMode 
            taskTitle={focusTaskTitle} 
            onExit={() => setFocusMode(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSentinelSuggestion && sentinelSuggestion && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 right-6 z-[200]"
          >
            <GlassCard className="max-w-sm p-5 border border-white/20 shadow-2xl relative bg-black/85">
              <button 
                onClick={() => setShowSentinelSuggestion(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                  <Zap size={16} />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-wider text-[#3b82f6] uppercase">
                    {sentinelSuggestion.title}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {sentinelSuggestion.text}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setShowSentinelSuggestion(false)}
                  className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Dismiss
                </button>
                <MagneticButton 
                  onClick={() => {
                    setShowSentinelSuggestion(false);
                    if (sentinelSuggestion.action) sentinelSuggestion.action();
                  }} 
                  variant="primary"
                  className="text-xs py-1.5 px-4 font-medium"
                >
                  {sentinelSuggestion.actionLabel || "Start"}
                </MagneticButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      {isClient && <FloatingActionButtons />}
    </div>
  );
}
