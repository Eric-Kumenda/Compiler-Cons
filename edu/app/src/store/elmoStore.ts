import { create } from 'zustand';

interface ElmoState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  activeSection: number;
  setActiveSection: (index: number) => void;
  
  // Step-through simulation state
  stepIndex: number;
  setStepIndex: (index: number) => void;
  
  // Memory simulation state
  memStep: number;
  setMemStep: (index: number) => void;
  
  // Quadruples explorer state
  activeOp: string | null;
  setActiveOp: (op: string | null) => void;
}

export const useElmoStore = create<ElmoState>((set, get) => ({
  theme: 'dark', // Starting with dark mode for high-impact visual
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },
  
  activeSection: 0,
  setActiveSection: (activeSection) => set({ activeSection }),
  
  stepIndex: 0,
  setStepIndex: (stepIndex) => set({ stepIndex }),
  
  memStep: 0,
  setMemStep: (memStep) => set({ memStep }),
  
  activeOp: null,
  setActiveOp: (activeOp) => set({ activeOp }),
}));
