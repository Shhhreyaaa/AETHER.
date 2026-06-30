'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useAetherStore } from '@/store/useAetherStore';
import { parseVoiceInput } from '@/lib/ai/voiceParser';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Mic, Send, Volume2, Plus, Clock, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function OracleChat() {
  const { 
    chatHistory, 
    addChatMessage, 
    tasks, 
    userProfile,
    addTask,
    setCurrentView,
    reweaveDay,
    setFocusMode
  } = useAetherStore();

  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const prioritizedTasks = tasks.filter(t => t.status !== 'DONE').slice(0, 4);

  // useChat from @ai-sdk/react using the DefaultChatTransport and messages
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        tasks,
        userProfile,
      },
    }),
    messages: chatHistory.map(msg => ({
      id: msg.id,
      role: msg.role === 'aether' ? 'assistant' : 'user',
      parts: [{ type: 'text', text: msg.content }]
    })),
    onFinish: ({ message }) => {
      // Save assistant response to Zustand
      const text = message.parts
        ?.filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('') || (message as any).content || '';
      addChatMessage('aether', text);
    }
  });

  const [input, setInput] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleActionAddTask = (text: string) => {
    let title = "New Task from Oracle";
    const quoteMatch = text.match(/"([^"]+)"/);
    if (quoteMatch && quoteMatch[1]) {
      title = quoteMatch[1];
    } else {
      const clean = text.replace(/\[AETHER Offline Mode\]/gi, '').trim();
      const firstLine = clean.split('\n')[0].replace(/[.!?]/, '');
      if (firstLine && firstLine.length > 5 && firstLine.length < 60) {
        title = firstLine;
      }
    }
    
    addTask({
      title,
      dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(), // due tomorrow
      estimatedMin: 60,
      impactScore: 6,
      energyCost: 4,
      category: 'General',
    });
    toast.success("Task added to dashboard", { description: `"${title}"` });
  };

  const handleActionWeaveDay = () => {
    reweaveDay();
    setCurrentView('timeline');
    toast.success("Day re-woven around your latest context.");
  };

  const handleActionStartFocus = (text: string) => {
    let title = "Deep Work Session";
    const quoteMatch = text.match(/"([^"]+)"/);
    if (quoteMatch && quoteMatch[1]) {
      title = quoteMatch[1];
    }
    setFocusMode(true, title);
    toast.info(`Focus Session Started: "${title}"`);
  };

  const handleActionBreakItDown = () => {
    const prompt = "Please break down the previous suggestions into a numbered list of subtasks.";
    addChatMessage('user', prompt);
    sendMessage({ text: prompt });
  };

  const parseTaskList = (text: string): string[] => {
    const lines = text.split('\n');
    const steps: string[] = [];
    const regex = /^(?:\d+[\.\)]|[\*\-\+])\s+(.+)$/i;
    
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(regex);
      if (match && match[1]) {
        const stepText = match[1].replace(/\[[ x]\]/gi, '').trim();
        if (stepText && stepText.length > 3) {
          steps.push(stepText);
        }
      }
    }
    return steps;
  };

  const handleCreateSubtasks = (text: string) => {
    const steps = parseTaskList(text);
    if (steps.length === 0) return;
    
    steps.forEach((step, idx) => {
      addTask({
        title: step,
        dueDate: new Date(Date.now() + 1000 * 3600 * 24 * (idx + 1)).toISOString(),
        estimatedMin: 45,
        impactScore: 5,
        energyCost: 3,
        category: 'General',
      });
    });
    
    toast.success(`Created ${steps.length} subtasks on your Dashboard!`);
  };

  // Helper to extract text from a UIMessage
  const getMessageText = (m: any): string => {
    if (m.content) return m.content;
    if (Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('');
    }
    return '';
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Intercept submits to dynamically extract obvious tasks
  const handleSmartSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const message = input.trim();
    if (!message) return;

    // Save user message to Zustand
    addChatMessage('user', message);

    const looksLikeTask = 
      message.toLowerCase().includes('i have to') || 
      message.toLowerCase().includes('i need to') ||
      message.toLowerCase().includes('add task') || 
      message.toLowerCase().includes('create task') || 
      message.toLowerCase().includes('remind me');

    if (looksLikeTask) {
      const parsed = parseVoiceInput(message);
      addTask({
        title: parsed.title,
        dueDate: parsed.dueDate,
        estimatedMin: 90,
        impactScore: 7,
        energyCost: 5,
        category: parsed.category,
      });
      toast.success(`Task created: "${parsed.title}"`);
    }

    sendMessage({ text: message });
    setInput('');
  };

  // Voice Input (STT)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      
      setTimeout(() => {
        handleVoiceSubmit(transcript);
      }, 300);
    };

    recognition.start();
  };

  const handleVoiceSubmit = (transcript: string) => {
    if (!transcript.trim()) return;

    addChatMessage('user', transcript);

    const looksLikeTask = 
      transcript.toLowerCase().includes('i have to') || 
      transcript.toLowerCase().includes('i need to') ||
      transcript.toLowerCase().includes('add task') || 
      transcript.toLowerCase().includes('create task') || 
      transcript.toLowerCase().includes('remind me');

    if (looksLikeTask) {
      const parsed = parseVoiceInput(transcript);
      addTask({
        title: parsed.title,
        dueDate: parsed.dueDate,
        estimatedMin: 90,
        impactScore: 7,
        energyCost: 5,
        category: parsed.category,
      });
      toast.success(`Task created: "${parsed.title}"`);
    }

    sendMessage({ text: transcript });
    setInput('');
  };

  // Voice Output (TTS)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between select-none">
            <div>
              <div className="font-semibold tracking-tight text-xl">The Oracle</div>
              <div className="text-xs text-white/50">Powered by OpenAI GPT-4o-mini + Smart Actions</div>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              Context Aware
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-white/50 mt-10 select-none">
                Hello. Ask me anything — tasks, tech, business, or life.<br />I&apos;m here to help you move forward.
              </div>
            )}
            {messages.map((m, index) => {
              const textContent = getMessageText(m);
              return (
                <div key={index} className="group flex gap-2 items-start justify-between">
                  <div className={`flex flex-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="group flex gap-2 items-start max-w-[80%]">
                      {m.role === 'assistant' && (
                        <button 
                          onClick={() => speak(textContent)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 shrink-0 select-none"
                        >
                          <Volume2 size={16} className="text-white/40 hover:text-white" />
                        </button>
                      )}
                      <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${m.role === 'user' 
                        ? 'bg-[#3b82f6] text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 rounded-tl-none text-white/95'}`}>
                        <div className="whitespace-pre-line">{textContent}</div>
                        
                        {m.role === 'assistant' && index === messages.length - 1 && (
                          <div className="mt-4 pt-3 border-t border-white/10 flex gap-2 flex-wrap select-none">
                            <button
                              onClick={() => handleActionAddTask(textContent)}
                              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Plus size={12} className="text-blue-400" /> Add as Task
                            </button>
                            <button
                              onClick={handleActionWeaveDay}
                              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Clock size={12} className="text-violet-400" /> Weave Day
                            </button>
                            <button
                              onClick={() => handleActionStartFocus(textContent)}
                              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-[#3b82f6] hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Zap size={12} /> Start Focus
                            </button>
                            <button
                              onClick={handleActionBreakItDown}
                              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Sparkles size={12} className="text-amber-400" /> Break it down
                            </button>
                            {parseTaskList(textContent).length > 0 && (
                              <button
                                onClick={() => handleCreateSubtasks(textContent)}
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-white transition-all flex items-center gap-1.5"
                              >
                                <Sparkles size={12} /> Create {parseTaskList(textContent).length} Tasks
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2 items-start justify-start animate-pulse">
                <div className="px-5 py-4 rounded-3xl rounded-tl-none bg-white/5 border border-white/10 text-white/40 text-xs w-[60%] space-y-2 select-none">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="font-semibold tracking-wider text-[10px] uppercase text-white/50">Aligning Aether Field...</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full w-full" />
                  <div className="h-2 bg-white/10 rounded-full w-[85%]" />
                  <div className="h-2 bg-white/10 rounded-full w-[40%]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="p-4 border-t border-white/10 flex flex-wrap gap-2 select-none">
              {["I'm overwhelmed", "Explain React Server Components", "Weave my day", "What's a good career move in AI?"].map((text, i) => (
                <button 
                  key={i}
                  onClick={() => handleVoiceSubmit(text)}
                  className="text-xs px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/70 hover:text-white"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSmartSubmit} className="p-4 border-t border-white/10 flex gap-3">
            <button 
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-2xl transition-all select-none ${isListening ? 'bg-red-500/20 text-red-400' : 'glass hover:bg-white/10'}`}
            >
              <Mic size={18} />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Talk to AETHER... (tasks or questions)"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm focus:outline-none focus:border-white/30 animate-pulse"
            />
            
            <MagneticButton type="submit" variant="primary" className="select-none">
              <Send size={16} />
            </MagneticButton>
          </form>
        </GlassCard>
      </div>

      {/* Context Sidebar */}
      <div className="w-80 select-none">
        <GlassCard className="h-full">
          <div className="font-medium mb-4 px-1">Current Context</div>
          
          <div className="space-y-3">
            {prioritizedTasks.map(task => (
              <div key={task.id} className="glass rounded-2xl p-4 text-sm">
                <div className="font-medium tracking-tight text-white/90">{task.title}</div>
                <div className="text-xs text-white/50 mt-1 flex justify-between">
                  <span>Priority: {task.priority}</span>
                  <span>{task.estimatedMin} min</span>
                </div>
              </div>
            ))}
            {prioritizedTasks.length === 0 && (
              <div className="text-center py-6 text-white/30 text-xs">No active threads</div>
            )}
          </div>

          <div className="mt-8 text-xs text-white/40 px-1">
            AETHER can see your current priorities and energy levels.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
