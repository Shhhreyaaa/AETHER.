'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mail, User, Briefcase, GraduationCap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: 'Student',
    college: '',
    company: '',
  });

  const { login } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) return;

    // Save extra details in localStorage for later use
    localStorage.setItem('aether-user-details', JSON.stringify(formData));

    login(formData.email, formData.name || formData.email.split('@')[0]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 select-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md relative z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-xl opacity-70 pointer-events-none" />

            <GlassCard hover={false} className="p-8 relative overflow-hidden bg-black/60 border-white/10 backdrop-blur-2xl">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5"
              >
                <X size={16} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={20} className="text-blue-400" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tighter bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-xs text-white/50 mt-1.5">
                  {isLogin ? "Re-align your AETHER productivity workspace." : "Initialize your contextual cognitive environment."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Name input */}
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                          required={!isLogin}
                        />
                      </div>

                      {/* Designation select */}
                      <div className="relative">
                        <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                        <select
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-white/70 appearance-none"
                        >
                          <option value="Student" className="bg-[#121214] text-white">Student</option>
                          <option value="Working Professional" className="bg-[#121214] text-white">Working Professional</option>
                          <option value="Entrepreneur" className="bg-[#121214] text-white">Entrepreneur</option>
                          <option value="Freelancer" className="bg-[#121214] text-white">Freelancer</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/35 text-xs">▼</div>
                      </div>

                      {/* College input (Conditional) */}
                      {formData.designation === 'Student' && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                          <input
                            type="text"
                            name="college"
                            placeholder="College / University Name"
                            value={formData.college}
                            onChange={handleChange}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                            required={formData.designation === 'Student'}
                          />
                        </motion.div>
                      )}

                      {/* Company input (Conditional) */}
                      {formData.designation !== 'Student' && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                          <input
                            type="text"
                            name="company"
                            placeholder="Company / Organization"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email input */}
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                    required
                  />
                </div>

                <MagneticButton type="submit" variant="primary" className="w-full py-4 mt-6 font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-[0_0_20px_rgba(59,130,246,0.3)] border-transparent">
                  {isLogin ? "Sign In" : "Register"}
                </MagneticButton>
              </form>

              <div className="text-center text-xs text-white/40 mt-6 pt-5 border-t border-white/5">
                {isLogin ? "New to AETHER?" : "Already initialized?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors ml-1"
                >
                  {isLogin ? "Create Account" : "Access Workspace"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
