import create from 'zustand';

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
};

export const useFilterStore = create<FilterStore>(set => ({
  startDate: null,
  endDate: null,
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
  clearFilters: () => set({
    startDate: null,
    endDate: null,
    selectedBranches: [],
    selectedProductLines: [],
    selectedItemGroups: [],
    salesTarget: '',
  }),
}));
