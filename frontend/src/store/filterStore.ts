import { create } from 'zustand';

/**
 * Zustand store for dashboard filters.
 *
 * State:
 *   startDate (Date | null): The selected start date.
 *   endDate (Date | null): The selected end date.
 *   selectedBranches (string[]): Selected branches.
 *   selectedProductLines (string[]): Selected product lines.
 *   selectedItemGroups (string[]): Selected item groups.
 *   salesTarget (string): Sales target value.
 *
 * Actions:
 *   setStartDate, setEndDate, setBranches, setProductLines, setItemGroups, setSalesTarget, clearFilters
 */
export type FilterStore = {
  startDate: Date | null;
  endDate: Date | null;
  selectedBranches: string[];
  selectedProductLines: string[];
  selectedItemGroups: string[];
  salesTarget: string;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setBranches: (branches: string[]) => void;
  setProductLines: (lines: string[]) => void;
  setItemGroups: (groups: string[]) => void;
  setSalesTarget: (target: string) => void;
  clearFilters: () => void;
  resetToDefaults: () => void; // Development only
};

// Default dates for initial state - use January 2025 where we know data exists
const getDefaultDates = () => {
  // Use January 2025 instead of current month to ensure data exists
  const startOfMonth = new Date(2025, 0, 1); // January 1, 2025
  const endOfMonth = new Date(2025, 0, 31); // January 31, 2025
  return { startOfMonth, endOfMonth };
};

export const useFilterStore = create<FilterStore>((set, get) => {
  const { startOfMonth, endOfMonth } = getDefaultDates();
  
  return {
    startDate: startOfMonth,
    endDate: endOfMonth,
    selectedBranches: [],
    selectedProductLines: [],
    selectedItemGroups: [],
    salesTarget: '',
    setStartDate: (date) => set({ startDate: date }),
    setEndDate: (date) => set({ endDate: date }),
    setBranches: (branches) => set({ selectedBranches: branches }),
    setProductLines: (lines) => set({ selectedProductLines: lines }),
    setItemGroups: (groups) => set({ selectedItemGroups: groups }),
    setSalesTarget: (target) => set({ salesTarget: target }),
    clearFilters: () => {
      const { startOfMonth, endOfMonth } = getDefaultDates();
      set({
        startDate: startOfMonth,
        endDate: endOfMonth,
        selectedBranches: [],
        selectedProductLines: [],
        selectedItemGroups: [],
        salesTarget: '',
      });
    },
    resetToDefaults: () => {
      const { startOfMonth, endOfMonth } = getDefaultDates();
      set({
        startDate: startOfMonth,
        endDate: endOfMonth,
        selectedBranches: [],
        selectedProductLines: [],
        selectedItemGroups: [],
        salesTarget: '',
      });
      // Clear localStorage if available
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.includes('filter') || key.includes('date') || key.includes('query')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('Cleared localStorage keys:', keysToRemove);
      }
    },
  };
});
