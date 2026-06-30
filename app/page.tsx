'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';
import Dashboard from './dashboard/page';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, Clock, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { isLoggedIn } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hydration protection & redirect to Dashboard
  if (isClient && isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden select-none">
      {/* Ambient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[90px] pointer-events-none" />

      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <span className="font-semibold tracking-[-2px] text-lg">A</span>
            </div>
            <div className="font-bold tracking-tighter text-xl bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">AETHER</div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAuthModal(true)} 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <MagneticButton 
              onClick={() => setShowAuthModal(true)} 
              variant="primary" 
              className="px-4 py-2 text-xs bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 rounded-xl"
            >
              Get Started
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-24 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold tracking-wide text-blue-400 mb-8 shadow-inner"
          >
            <Sparkles size={12} className="animate-pulse" />
            AI-Powered Productivity Companion
          </motion.div>
          
          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.08]"
          >
            Master your time.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Before it masters you.
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AETHER is an intelligent, context-aware productivity companion that weaves your tasks, energy levels, and schedule into a cohesive, focused daily roadmap.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold text-base transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2 active:scale-95 border-none"
            >
              Get Started Free <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 rounded-2xl glass hover:bg-white/10 font-semibold text-base transition-all flex items-center justify-center gap-2 border-white/10 hover:border-white/20 active:scale-95"
            >
              Access Workspace
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm tracking-[3px] text-blue-500/80 font-bold uppercase mb-2">Designed for Flow</h2>
            <h3 className="text-3xl font-semibold tracking-tight">Three Pillars of Cognitive Mastery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "The Oracle",
                description: "Consult AETHER directly. Our context-aware companion uses your active tasks and real-time energy profiles to break down goals and answer complex workflow questions.",
                color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
              },
              {
                icon: Target,
                title: "ChronoSphere",
                description: "Interact with a gorgeous 3D living schedule system. Plan dependencies, analyze priorities, and view your focus energy maps within an immersive visual canvas.",
                color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
              },
              {
                icon: Clock,
                title: "Sentinel Nudges",
                description: "Non-intrusive, proactive nudges tailored directly to your morning stamina or evening fatigue, guiding you smoothly towards deep focus blocks.",
                color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <GlassCard className="h-full flex flex-col items-start p-8 relative overflow-hidden bg-white/[0.01]">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-6 ${feature.color}`}>
                      <Icon size={20} />
                    </div>
                    <h4 className="text-xl font-semibold tracking-tight mb-3">{feature.title}</h4>
                    <p className="text-sm text-white/50 leading-relaxed flex-1">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20 relative z-10 text-center text-xs text-white/40 select-none">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 AETHER. All cognitive fields aligned.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
