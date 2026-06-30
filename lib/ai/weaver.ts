import { Task, CalendarEvent } from '@/types';
import { differenceInHours, parseISO } from 'date-fns';

export function getCurrentHour(): number {
  return new Date().getHours();
}

export function getEnergyFactor(hour: number, profile: any): number {
  if (hour >= 6 && hour < 12) return profile.morning;
  if (hour >= 12 && hour < 17) return profile.afternoon;
  if (hour >= 17 && hour < 22) return profile.evening;
  return profile.night * 0.6;
}

export function calculateTaskScore(task: Task, currentHour: number, energyProfile: any): number {
  const dueDate = parseISO(task.dueDate);
  const hoursLeft = Math.max(1, differenceInHours(dueDate, new Date()));
  
  const urgency = Math.min(100, Math.max(15, 140 - hoursLeft * 4.5));
  const impact = task.impactScore * 7.5;
  const energyMatch = getEnergyFactor(currentHour, energyProfile) * (11 - task.energyCost) * 2.8;

  const score = Math.floor((urgency * 0.42) + (impact * 0.38) + (energyMatch * 0.20));
  return Math.min(100, Math.max(12, score));
}

export function getPrioritizedTasks(tasks: Task[], energyProfile: any): Task[] {
  const currentHour = getCurrentHour();
  return [...tasks]
    .filter(t => t.status !== 'DONE')
    .map(task => ({
      ...task,
      priority: calculateTaskScore(task, currentHour, energyProfile)
    }))
    .sort((a, b) => b.priority - a.priority);
}

// Returns optimized time blocks
export function reweaveDay(tasks: Task[], events: CalendarEvent[], energyProfile: any) {
  const prioritized = getPrioritizedTasks(tasks, energyProfile);
  const blocks: any[] = [];
  let currentHour = 8.5;

  prioritized.slice(0, 6).forEach((task, index) => {
    const duration = Math.max(0.75, Math.ceil(task.estimatedMin / 60));
    
    blocks.push({
      id: `block-${index}`,
      taskId: task.id,
      title: task.title,
      startHour: currentHour,
      duration,
      priority: task.priority,
      category: task.category,
      energyCost: task.energyCost,
    });
    currentHour += duration + 0.25; // small buffer
  });

  return blocks;
}

export function generateRescueProtocol(task: Task) {
  const steps = [
    `Open the file and commit to just 3 minutes of work`,
    `Set a 20-minute timer and work with full focus`,
    `After finishing, tell AETHER what you completed`,
    `Take a short break to reset your energy`,
  ];

  return {
    taskId: task.id,
    taskTitle: task.title,
    steps,
    estimatedTotalMin: Math.min(50, Math.floor(task.estimatedMin * 0.55)),
    motivationalNote: "You don't need to finish everything. You only need to begin. Small wins create momentum.",
  };
}
