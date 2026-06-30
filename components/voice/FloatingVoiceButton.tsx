'use client';

import { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useAetherStore } from '@/store/useAetherStore';
import { parseVoiceInput } from '@/lib/ai/voiceParser';
import { VoiceTaskConfirmation } from './VoiceTaskConfirmation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

export function FloatingVoiceButton({ isFloating = true }: { isFloating?: boolean }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [parsedTask, setParsedTask] = useState<any>(null);
  const [error, setError] = useState('');

  const { addTask } = useAetherStore();

  const startListening = () => {
    setError('');

    // If mockVoice query param is present, simulate speech input for testing
    if (typeof window !== 'undefined' && window.location.search.includes('mockVoice=true')) {
      setIsListening(true);
      toast.info("Simulating Voice Input...", { 
        description: "Using mock transcript: 'Add ML assignment by tomorrow evening'." 
      });
      setTimeout(() => {
        setIsListening(false);
        setIsProcessing(true);
        setTimeout(() => {
          const parsed = parseVoiceInput("Add ML assignment by tomorrow evening");
          setParsedTask(parsed);
          setShowConfirmation(true);
          setIsProcessing(false);
        }, 400);
      }, 1500);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Voice input not supported. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsProcessing(false);
      if (event.error === 'no-speech') {
        setError("Didn't catch that. Please try again.");
      } else {
        setError("Voice recognition error. Please try again.");
      }
      setTimeout(() => setError(''), 2500);
    };

    recognition.onresult = (event: any) => {
      setIsProcessing(true);
      const transcript = event.results[0][0].transcript;

      // Simulate slight processing delay for better UX
      setTimeout(() => {
        const parsed = parseVoiceInput(transcript);
        setParsedTask(parsed);
        setShowConfirmation(true);
        setIsProcessing(false);
      }, 400);
    };

    recognition.start();
  };

  const handleConfirm = (editedTask?: any) => {
    const taskToCreate = editedTask || parsedTask;
    if (!taskToCreate) return;

    addTask({
      title: taskToCreate.title,
      dueDate: taskToCreate.dueDate,
      estimatedMin: 90,
      impactScore: 8,
      energyCost: 6,
      category: taskToCreate.category,
    });

    toast.success("Task created and scheduled!", {
      description: `"${taskToCreate.title}" has been prioritized by Weaver AI.`
    });

    setShowConfirmation(false);
    setParsedTask(null);
  };

  const buttonContent = (
    <>
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="bg-red-500/90 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-2xl border border-red-500/20 shadow-xl mb-1.5"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.8 }}
        onClick={startListening}
        disabled={isListening || isProcessing}
        className={`group w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 outline-none border border-white/10 relative
          ${isListening 
            ? 'bg-red-500 scale-110 border-red-400' 
            : isProcessing 
              ? 'bg-[#3b82f6]/70 border-[#3b82f6]/30 cursor-not-allowed' 
              : 'bg-[#3b82f6] hover:bg-[#3b82f6]/90 hover:scale-105 hover:shadow-[#3b82f6]/20 active:scale-95'
          }`}
      >
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full bg-red-500/10 animate-pulse" />
          </>
        )}
        {isProcessing ? (
          <Loader2 className="text-white animate-spin relative z-10" size={26} />
        ) : isListening ? (
          <MicOff className="text-white relative z-10" size={26} />
        ) : (
          <Mic className="text-white group-hover:scale-110 transition-transform relative z-10" size={26} />
        )}
      </motion.button>

      {/* Example hint */}
      {!isListening && !isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="text-[10px] text-white font-sans text-right pr-1 tracking-wide"
        >
          Try: “ML assignment by 30 June”
        </motion.div>
      )}
    </>
  );

  return (
    <>
      {isFloating ? (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-2.5">
          {buttonContent}
        </div>
      ) : (
        <div className="flex flex-col items-end gap-2.5 relative">
          {buttonContent}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && parsedTask && (
          <VoiceTaskConfirmation
            parsedTask={parsedTask}
            onConfirm={handleConfirm}
            onCancel={() => {
              setShowConfirmation(false);
              setParsedTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
