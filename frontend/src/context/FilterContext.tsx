import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDefaultDateRange } from '../constants/dateRanges';

interface FilterContextType {
    // Date range filters
    dateRange: [Date | null, Date | null];
    setDateRange: (range: [Date | null, Date | null]) => void;

    // Business context filters
    selectedBranch: string;
    setSelectedBranch: (branch: string) => void;
    selectedProductLine: string;
    setSelectedProductLine: (productLine: string) => void;

    // Sales target
    salesTarget: string;
    setSalesTarget: (target: string) => void;

    // Computed values for API calls
    startDate: string | null;
    endDate: string | null;

    // Filter reset
    resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
    children: React.ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(getDefaultDateRange());
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [selectedProductLine, setSelectedProductLine] = useState<string>('all');
    const [salesTarget, setSalesTarget] = useState<string>('50000000'); // 50M realistic target

    // Computed values for API calls
    const startDate = dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : null;
    const endDate = dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : null;

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
                if (parsed.startDate && parsed.endDate) {
                    setDateRange([new Date(parsed.startDate), new Date(parsed.endDate)]);
                }
                if (parsed.selectedBranch) setSelectedBranch(parsed.selectedBranch);
                if (parsed.selectedProductLine) setSelectedProductLine(parsed.selectedProductLine);
                if (parsed.salesTarget) setSalesTarget(parsed.salesTarget);
            } catch (error) {
                console.warn('Failed to load saved filters:', error);
            }
        }
    }, []);

    useEffect(() => {
        const filtersToSave = {
            startDate: startDate,
            endDate: endDate,
            selectedBranch,
            selectedProductLine,
            salesTarget,
        };
        localStorage.setItem('dashboardFilters', JSON.stringify(filtersToSave));
    }, [startDate, endDate, selectedBranch, selectedProductLine, salesTarget]);

    const value: FilterContextType = {
        dateRange,
        setDateRange,
        selectedBranch,
        setSelectedBranch,
        selectedProductLine,
        setSelectedProductLine,
        salesTarget,
        setSalesTarget,
        startDate,
        endDate,
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
