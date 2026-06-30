export type Intent = 
  | 'task_creation' 
  | 'general_question' 
  | 'scheduling' 
  | 'unknown';

export function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();

  // Task creation keywords
  const taskKeywords = [
    'i have to', 'i need to', 'add task', 'create task', 
    'remind me', 'assignment', 'deadline', 'due', 'complete'
  ];

  if (taskKeywords.some(kw => lower.includes(kw))) {
    return 'task_creation';
  }

  // Scheduling related
  if (lower.includes('schedule') || lower.includes('plan my day') || lower.includes('weave')) {
    return 'scheduling';
  }

  // Everything else = general question (ChatGPT style)
  return 'general_question';
}
