import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDefaultDateRange } from '../constants/dateRanges';

interface FilterContextType {
    // Date range filters
    date_range: [Date | null, Date | null];
    setDateRange: (range: [Date | null, Date | null]) => void;

    // Business context filters
    selected_branch: string;
    setSelectedBranch: (branch: string) => void;
    selected_product_line: string;
    setSelectedProductLine: (productLine: string) => void;

    // Sales target
    sales_target: string;
    setSalesTarget: (target: string) => void;

    // Computed values for API calls
    start_date: string | null;
    end_date: string | null;

    // Filter reset
    resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
    children: React.ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
    const [date_range, setDateRange] = useState<[Date | null, Date | null]>(getDefaultDateRange());
    const [selected_branch, setSelectedBranch] = useState<string>('all');
    const [selected_product_line, setSelectedProductLine] = useState<string>('all');
    const [sales_target, setSalesTarget] = useState<string>('50000000'); // 50M realistic target

    // Computed values for API calls
    const start_date = date_range[0] ? format(date_range[0], 'yyyy-MM-dd') : null;
    const end_date = date_range[1] ? format(date_range[1], 'yyyy-MM-dd') : null;

    const resetFilters = () => {
        setDateRange(getDefaultDateRange());
        setSelectedBranch('all');
        setSelectedProductLine('all');
        setSalesTarget('50000000');
    };

    // Persist filters to localStorage
    useEffect(() => {
        const savedFilters = localStorage.getItem('dashboardFilters');
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                if (parsed.start_date && parsed.end_date) {
                    setDateRange([new Date(parsed.start_date), new Date(parsed.end_date)]);
                }
                if (parsed.selected_branch) setSelectedBranch(parsed.selected_branch);
                if (parsed.selected_product_line) setSelectedProductLine(parsed.selected_product_line);
                if (parsed.sales_target) setSalesTarget(parsed.sales_target);
            } catch (error) {
                console.warn('Failed to load saved filters:', error);
            }
        }
    }, []);

    useEffect(() => {
        const filtersToSave = {
            start_date: start_date,
            end_date: end_date,
            selected_branch,
            selected_product_line,
            sales_target,
        };
        localStorage.setItem('dashboardFilters', JSON.stringify(filtersToSave));
    }, [start_date, end_date, selected_branch, selected_product_line, sales_target]);

    const value: FilterContextType = {
        date_range,
        setDateRange,
        selected_branch,
        setSelectedBranch,
        selected_product_line,
        setSelectedProductLine,
        sales_target,
        setSalesTarget,
        start_date,
        end_date,
        resetFilters,
    };

    return (
        <FilterContext.Provider value={value}>
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
