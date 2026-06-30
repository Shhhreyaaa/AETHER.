import React from 'react';
import { useAetherStore } from '@/store/useAetherStore';
import { Sparkles } from 'lucide-react';
import { ButtonPremium } from '../ui/button-premium';

interface OraclePanelProps {
  onConsult: () => void;
}

export function OraclePanel({ onConsult }: OraclePanelProps) {
  const { chatHistory } = useAetherStore();
  
  const lastMessage = chatHistory[chatHistory.length - 1];
  const lastText = lastMessage 
    ? lastMessage.content 
    : "Greetings. I have analyzed today's focus windows. We have critical deep work schedules ahead. How shall we coordinate?";

  return (
    <div className="glass p-5 rounded-3xl flex flex-col border border-white/5 justify-between h-48">
      <div>
        <div className="flex items-center gap-2 text-[#3b82f6]">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">The Oracle</span>
        </div>
        <p className="text-xs text-white/70 mt-3 leading-relaxed line-clamp-3">
          &quot;{lastText}&quot;
        </p>
      </div>
      <ButtonPremium onClick={onConsult} variant="secondary" className="w-full py-2 text-xs font-semibold">
        Consult the Oracle
      </ButtonPremium>
    </div>
  );
}
