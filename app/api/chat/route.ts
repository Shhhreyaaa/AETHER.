import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getDynamicSystemPrompt } from '@/lib/ai/getDynamicSystemPrompt';

const grok = createOpenAI({
  baseURL: 'https://api.x.ai/v1',
  apiKey: process.env.XAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, tasks, userProfile } = await req.json();

  // Convert UIMessages from client to ModelMessages for streamText
  const coreMessages = messages.map((m: any) => {
    const text = Array.isArray(m.parts)
      ? m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('')
      : m.content || '';

    return {
      role: m.role === 'assistant' ? 'assistant' : m.role,
      content: text,
    };
  });

  const lastUserMessage = coreMessages
    .filter((m: any) => m.role === 'user')
    .pop()?.content || '';

  // Get active tasks list and user profile details from req body
  const activeTasksList = Array.isArray(tasks) 
    ? tasks.filter((t: any) => t.status !== 'DONE')
           .map((t: any) => `- [${t.category}] ${t.title} (Priority: ${t.priority}%, Due: ${new Date(t.dueDate).toLocaleDateString()})`)
           .join('\n')
    : 'None';
    
  const energyLevels = userProfile?.energyProfile 
    ? `Morning: ${userProfile.energyProfile.morning}, Afternoon: ${userProfile.energyProfile.afternoon}, Evening: ${userProfile.energyProfile.evening}, Night: ${userProfile.energyProfile.night}`
    : 'Default';

  const dynamicSystemPrompt = getDynamicSystemPrompt(
    lastUserMessage,
    activeTasksList,
    energyLevels,
    userProfile?.name || 'Layane'
  );

  try {
    const result = await streamText({
      model: grok('grok-3'),
      system: dynamicSystemPrompt,
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Grok Error, falling back to mock stream:", error);

    const topTaskTitle = Array.isArray(tasks) && tasks.length > 0 
      ? tasks.filter((t: any) => t.status !== 'DONE')[0]?.title 
      : null;

    const mockText = topTaskTitle
      ? `[AETHER Offline Mode] It looks like the Grok API key is unavailable. Here is a simulated response:\n\nTo move forward effectively, I recommend focusing on your highest priority task: "${topTaskTitle}". Would you like me to weave your day around it, or shall we break down specific steps together?`
      : `[AETHER Offline Mode] It looks like the Grok API key is unavailable. Here is a simulated response:\n\nTo move forward effectively, I recommend creating a new task or focusing on your highest priority thread in the sidebar. Would you like me to weave your day, or shall we plan together?`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const messageId = crypto.randomUUID();
        
        // 1. Send text-start
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-start', id: messageId })}\n\n`));
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Send text-deltas
        const words = mockText.split(' ');
        for (const word of words) {
          const chunk = `data: ${JSON.stringify({ type: 'text-delta', id: messageId, delta: word + ' ' })}\n\n`;
          controller.enqueue(encoder.encode(chunk));
          await new Promise(resolve => setTimeout(resolve, 60));
        }

        // 3. Send text-end
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  }
}
