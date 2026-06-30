export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  estimatedMin: number;
  actualMin?: number;
  status: TaskStatus;
  priority: number;
  impactScore: number;
  energyCost: number;
  category: string;
  dependencies: string[];
  createdAt: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'meeting' | 'focus' | 'personal' | 'deadline';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'aether';
  content: string;
  timestamp: string;
}

export interface RescueProtocol {
  taskId: string;
  steps: string[];
  estimatedTotalMin: number;
  motivationalNote: string;
}

export interface UserProfile {
  id: string;
  name: string;
  energyProfile: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // ISO 'YYYY-MM-DD'
  createdAt: string;
}

export type View = 'dashboard' | 'oracle' | 'chronosphere' | 'timeline' | 'insights';
