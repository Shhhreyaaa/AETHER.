'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAether = message.role === 'aether';

  return (
    <div className={cn("flex", isAether ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed",
          isAether 
            ? "bg-white/5 border border-white/10 rounded-tl-none" 
            : "bg-[#3b82f6] text-white rounded-tr-none"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
