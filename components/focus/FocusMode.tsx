'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { toast } from 'sonner';

interface FocusModeProps {
  taskTitle?: string;
  onExit: () => void;
}

type SessionType = 'work' | 'shortBreak' | 'longBreak';

export function FocusMode({ taskTitle = "Deep Work Session", onExit }: FocusModeProps) {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  const sessionDurations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Initialize AudioContext (must be created on user interaction)
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Play notification sound
  const playNotificationSound = (type: 'workComplete' | 'breakComplete') => {
    try {
      const audioCtx = getAudioContext();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      if (type === 'workComplete') {
        // Pleasant "ding" for work completion
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.value = 0.4;
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
      } else {
        // Softer, calmer tone for break completion
        oscillator.type = 'sine';
        oscillator.frequency.value = 660;
        gain.gain.value = 0.35;
        filter.type = 'lowpass';
        filter.frequency.value = 900;
      }

      const duration = type === 'workComplete' ? 0.8 : 0.6;

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 
    else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    if (sessionType === 'work') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      playNotificationSound('workComplete');

      if (newCount % 4 === 0) {
        setSessionType('longBreak');
        setTimeLeft(sessionDurations.longBreak);
        toast.success("Excellent work! Time for a long break.", { duration: 5000 });
      } else {
        setSessionType('shortBreak');
        setTimeLeft(sessionDurations.shortBreak);
        toast.success("Work session complete. Take a short break.", { duration: 4000 });
      }
    } else {
      playNotificationSound('breakComplete');
      setSessionType('work');
      setTimeLeft(sessionDurations.work);
      toast.info("Break finished. Ready to focus again?");
    }
  };

  const toggleTimer = () => {
    // Resume AudioContext on first user interaction (required by browsers)
    if (!audioContextRef.current) {
      getAudioContext();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(sessionDurations.work);
    setCompletedSessions(0);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getSessionLabel = () => {
    if (sessionType === 'work') return "Focus Session";
    if (sessionType === 'shortBreak') return "Short Break";
    return "Long Break";
  };

  const getSessionColor = () => {
    if (sessionType === 'work') return '#3b82f6';
    return '#10b981';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 bg-[#050507] z-[300] flex flex-col overflow-hidden select-none"
    >
      {/* Cinematic Ambient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_65%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div 
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none animate-pulse" 
        style={{ 
          backgroundColor: `${getSessionColor()}0d`,
          animationDuration: '10s' 
        }} 
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-12 py-8 border-b border-white/5 bg-[#050507]/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full animate-ping" 
              style={{ backgroundColor: getSessionColor(), animationDuration: '2s' }}
            />
            <div>
              <div className="text-xs text-white/50 tracking-[3px] font-medium">{getSessionLabel().toUpperCase()}</div>
              <div className="font-semibold text-sm tracking-tight text-white mt-0.5">{taskTitle}</div>
            </div>
          </div>

          <button 
            onClick={onExit} 
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-xl mx-auto space-y-8">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[140px] md:text-[180px] font-semibold tabular-nums tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.03)]"
              style={{ color: getSessionColor() }}
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 text-xs tracking-[4px] font-semibold uppercase"
            >
              {completedSessions} / 4 SESSIONS COMPLETED
            </motion.div>
          </div>

          {/* Controls */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex items-center gap-5 mt-16"
          >
            <MagneticButton 
              onClick={toggleTimer} 
              variant="primary" 
              className="px-12 py-5 text-base font-medium rounded-2xl flex items-center justify-center min-w-[160px]"
            >
              {isRunning ? <><Pause size={18} className="mr-2.5" /> Pause</> : <><Play size={18} className="mr-2.5" /> Start</>}
            </MagneticButton>

            <MagneticButton 
              onClick={resetTimer} 
              variant="secondary" 
              className="px-8 py-5 text-base font-medium rounded-2xl flex items-center justify-center border border-white/10 hover:border-white/20"
            >
              <RotateCcw size={18} className="mr-2.5" /> Reset
            </MagneticButton>

            <MagneticButton 
              onClick={skipSession} 
              variant="ghost" 
              className="px-6 py-5 text-white/70 hover:text-white hover:bg-white/5 transition-all text-base font-medium rounded-2xl"
            >
              Skip
            </MagneticButton>
          </motion.div>
        </div>

        <div className="text-center pb-12 text-xs text-white/30 tracking-wide font-sans">
          Pomodoro • 25 min focus + 5 min break
        </div>
      </div>
    </motion.div>
  );
}
