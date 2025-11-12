import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, Branch, DashboardData } from '../types';

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

interface AppStore {
  branches: Branch[];
  currentBranch: Branch | null;
  dashboardData: DashboardData | null;
  setBranches: (branches: Branch[]) => void;
  setCurrentBranch: (branch: Branch | null) => void;
  setDashboardData: (data: DashboardData | null) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
}

// Auth Store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          loading: false,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// App Store
export const useAppStore = create<AppStore>()((set) => ({
  branches: [],
  currentBranch: null,
  dashboardData: null,
  setBranches: (branches: Branch[]) => set({ branches }),
  setCurrentBranch: (branch: Branch | null) => set({ currentBranch: branch }),
  setDashboardData: (data: DashboardData | null) => set({ dashboardData: data }),
  addBranch: (branch: Branch) =>
    set((state) => ({ branches: [...state.branches, branch] })),
  updateBranch: (id: string, updates: Partial<Branch>) =>
    set((state) => ({
      branches: state.branches.map((branch) =>
        branch.id === id ? { ...branch, ...updates } : branch
      ),
    })),
  deleteBranch: (id: string) =>
    set((state) => ({
      branches: state.branches.filter((branch) => branch.id !== id),
    })),
}));