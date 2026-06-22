import { create } from 'zustand';

type AssignedTab = 'ALL ORDERS' | 'ASSIGNED' | 'IN PROGRESS';

interface NotaryUIState {
  /** Currently selected tab on the Assigned Orders screen */
  assignedTab: AssignedTab;
  /** Active search query on the Assigned Orders screen */
  assignedSearch: string;

  setAssignedTab: (tab: AssignedTab) => void;
  setAssignedSearch: (query: string) => void;
}

export const useNotaryUIStore = create<NotaryUIState>((set) => ({
  assignedTab: 'ALL ORDERS',
  assignedSearch: '',

  setAssignedTab: (tab) => set({ assignedTab: tab }),
  setAssignedSearch: (query) => set({ assignedSearch: query }),
}));
