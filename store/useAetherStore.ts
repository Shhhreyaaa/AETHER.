import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, CalendarEvent, ChatMessage, View, UserProfile, RescueProtocol, Habit } from '@/types';
import { getPrioritizedTasks, reweaveDay, generateRescueProtocol } from '@/lib/ai/weaver';

interface AetherState {
  tasks: Task[];
  events: CalendarEvent[];
  chatHistory: ChatMessage[];
  currentView: View;
  userProfile: UserProfile;
  oneThing?: string;
  isFocusMode: boolean;
  focusTaskTitle: string;
  habits: Habit[];

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'priority' | 'status' | 'dependencies'> & { dependencies?: string[] }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reweaveDay: () => any[];
  generateRescueProtocol: (taskId: string) => RescueProtocol | null;
  addChatMessage: (role: 'user' | 'aether', content: string) => void;
  setCurrentView: (view: View) => void;
  setOneThing: (oneThing: string) => void;
  setFocusMode: (enabled: boolean, title?: string) => void;
  addHabit: (title: string) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
}

const mockTasks: Task[] = [
  {
    id: 't1', title: 'Finish investor pitch deck', description: 'Complete financial projections and competitive analysis',
    dueDate: new Date(Date.now() + 1000 * 3600 * 28).toISOString(), estimatedMin: 180, status: 'TODO',
    priority: 94, impactScore: 9, energyCost: 7, category: 'Business', dependencies: [], createdAt: new Date().toISOString(),
  },
  {
    id: 't2', title: 'Train ML model v2', description: 'Fine-tune transformer on new dataset',
    dueDate: new Date(Date.now() + 1000 * 3600 * 52).toISOString(), estimatedMin: 240, status: 'TODO',
    priority: 81, impactScore: 8, energyCost: 8, category: 'Technical', dependencies: [], createdAt: new Date().toISOString(),
  },
  {
    id: 't3', title: 'Prepare for client call', dueDate: new Date(Date.now() + 1000 * 3600 * 19).toISOString(),
    estimatedMin: 45, status: 'TODO', priority: 88, impactScore: 7, energyCost: 4, category: 'Business',
    dependencies: [], createdAt: new Date().toISOString(),
  },
];

const mockEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Team Standup', start: new Date().toISOString(), end: new Date(Date.now() + 1800000).toISOString(), type: 'meeting' },
];

export const useAetherStore = create<AetherState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      events: mockEvents,
      chatHistory: [],
      currentView: 'dashboard',
      userProfile: {
        id: 'user-1',
        name: 'Layane',
        energyProfile: { morning: 0.95, afternoon: 0.78, evening: 0.62, night: 0.38 },
      },
      oneThing: '',
      isFocusMode: false,
      focusTaskTitle: 'Deep Work Session',
      habits: [
        {
          id: 'h1',
          title: 'Deep Work (2+ Hours)',
          streak: 5,
          completedDates: [
            new Date(Date.now() - 86400000).toISOString().split('T')[0],
            new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
            new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
            new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
          ],
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
        {
          id: 'h2',
          title: 'Inbox Zero',
          streak: 3,
          completedDates: [
            new Date(Date.now() - 86400000).toISOString().split('T')[0],
            new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
          ],
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: 'h3',
          title: 'Exercise / Active Rest',
          streak: 0,
          completedDates: [],
          createdAt: new Date().toISOString(),
        },
      ],

      addTask: (newTaskData) => {
        const task: Task = {
          ...newTaskData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'TODO',
          priority: 50,
          dependencies: newTaskData.dependencies || [],
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: 'DONE', completedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      reweaveDay: () => {
        const { tasks, events, userProfile } = get();
        return reweaveDay(tasks, events, userProfile.energyProfile);
      },

      generateRescueProtocol: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        return task ? generateRescueProtocol(task) : null;
      },

      addChatMessage: (role, content) => {
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ chatHistory: [...state.chatHistory, message] }));
      },

      setCurrentView: (view) => set({ currentView: view }),
      setOneThing: (oneThing) => set({ oneThing }),
      setFocusMode: (enabled, title) => set((state) => ({
        isFocusMode: enabled,
        ...(title !== undefined && { focusTaskTitle: title }),
      })),

      addHabit: (title) => {
        const newHabit: Habit = {
          id: crypto.randomUUID(),
          title,
          streak: 0,
          completedDates: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      toggleHabit: (id) => {
        const todayStr = new Date().toISOString().split('T')[0];
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            const completed = habit.completedDates.includes(todayStr);
            let newCompletedDates = [...habit.completedDates];
            if (completed) {
              newCompletedDates = newCompletedDates.filter((d) => d !== todayStr);
            } else {
              newCompletedDates.push(todayStr);
            }

            // Streak calculation scanning chronologically backward
            const sortedDates = [...newCompletedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            let streak = 0;
            if (sortedDates.length > 0) {
              const todayStr = new Date().toISOString().split('T')[0];
              const hasToday = sortedDates.includes(todayStr);
              const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
              if (hasToday || sortedDates.includes(yesterdayStr)) {
                let currentCheck = hasToday ? new Date() : new Date(Date.now() - 86400000);
                while (true) {
                  const checkStr = currentCheck.toISOString().split('T')[0];
                  if (sortedDates.includes(checkStr)) {
                    streak++;
                    currentCheck.setDate(currentCheck.getDate() - 1);
                  } else {
                    break;
                  }
                }
              }
            }

            return {
              ...habit,
              completedDates: newCompletedDates,
              streak,
            };
          }),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
      },
    }),
    { name: 'aether-storage' }
  )
);
