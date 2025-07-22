import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { getDefaultDateRange } from '../constants/dateRanges';

interface FilterState {
  date_range: [Date | null, Date | null];
  selected_branch: string;
  selected_product_line: string;
  sales_target: string;
}

type FilterAction =
  | { type: 'SET_DATE_RANGE'; payload: [Date | null, Date | null] }
  | { type: 'SET_BRANCH'; payload: string }
  | { type: 'SET_PRODUCT_LINE'; payload: string }
  | { type: 'SET_SALES_TARGET'; payload: string }
  | { type: 'RESET_FILTERS' };

const initialFilters: FilterState = {
  date_range: getDefaultDateRange(),
  selected_branch: 'all',
  selected_product_line: 'all',
  sales_target: '50000000',
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_DATE_RANGE':
      return { ...state, date_range: action.payload };
    case 'SET_BRANCH':
      return { ...state, selected_branch: action.payload };
    case 'SET_PRODUCT_LINE':
      return { ...state, selected_product_line: action.payload };
    case 'SET_SALES_TARGET':
      return { ...state, sales_target: action.payload };
    case 'RESET_FILTERS':
      return initialFilters;
    default:
      return state;
  }
}

interface FilterContextType {
  date_range: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  selected_branch: string;
  setSelectedBranch: (branch: string) => void;
  selected_product_line: string;
  setSelectedProductLine: (productLine: string) => void;
  sales_target: string;
  setSalesTarget: (target: string) => void;
  start_date: string | null;
  end_date: string | null;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: React.ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialFilters);

  // Computed values for API calls
  const start_date = state.date_range[0] ? format(state.date_range[0], 'yyyy-MM-dd') : null;
  const end_date = state.date_range[1] ? format(state.date_range[1], 'yyyy-MM-dd') : null;

  // Persist filters to localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('dashboardFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        if (parsed.start_date && parsed.end_date) {
          dispatch({ type: 'SET_DATE_RANGE', payload: [new Date(parsed.start_date), new Date(parsed.end_date)] });
        }
        if (parsed.selected_branch) dispatch({ type: 'SET_BRANCH', payload: parsed.selected_branch });
        if (parsed.selected_product_line) dispatch({ type: 'SET_PRODUCT_LINE', payload: parsed.selected_product_line });
        if (parsed.sales_target) dispatch({ type: 'SET_SALES_TARGET', payload: parsed.sales_target });
      } catch (error) {
        console.warn('Failed to load saved filters:', error);
      }
    }
  }, []);

  useEffect(() => {
    const filtersToSave = {
      start_date,
      end_date,
      selected_branch: state.selected_branch,
      selected_product_line: state.selected_product_line,
      sales_target: state.sales_target,
    };
    localStorage.setItem('dashboardFilters', JSON.stringify(filtersToSave));
  }, [start_date, end_date, state.selected_branch, state.selected_product_line, state.sales_target]);

  const contextValue = useMemo(() => ({
    date_range: state.date_range,
    setDateRange: (range: [Date | null, Date | null]) => dispatch({ type: 'SET_DATE_RANGE', payload: range }),
    selected_branch: state.selected_branch,
    setSelectedBranch: (branch: string) => dispatch({ type: 'SET_BRANCH', payload: branch }),
    selected_product_line: state.selected_product_line,
    setSelectedProductLine: (productLine: string) => dispatch({ type: 'SET_PRODUCT_LINE', payload: productLine }),
    sales_target: state.sales_target,
    setSalesTarget: (target: string) => dispatch({ type: 'SET_SALES_TARGET', payload: target }),
    start_date,
    end_date,
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
  }), [state, start_date, end_date]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
