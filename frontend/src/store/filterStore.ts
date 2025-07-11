import { create } from 'zustand';
import { subDays } from 'date-fns';

interface FilterState {
  dateRange: [Date | null, Date | null];
  salesTarget: string;
  selectedBranch: string | null;
  selectedProduct: string | null;
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  setSalesTarget: (target: string) => void;
  setSelectedBranch: (branch: string | null) => void;
  setSelectedProduct: (product: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: [subDays(new Date(), 30), new Date()],
  salesTarget: '100000',
  selectedBranch: null,
  selectedProduct: null,
  
  setDateRange: (dateRange) => set({ dateRange }),
  setSalesTarget: (salesTarget) => set({ salesTarget }),
  setSelectedBranch: (selectedBranch) => set({ selectedBranch }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  
  resetFilters: () => set({
    dateRange: [subDays(new Date(), 30), new Date()],
    salesTarget: '100000',
    selectedBranch: null,
    selectedProduct: null,
  }),
}));
