import React, { createContext, useContext, useState, useEffect } from 'react';

interface DataModeContextType {
  dataMode: 'real';
  setDataMode: (mode: 'real') => void;
}

export const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const DataModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataMode, setDataMode] = useState<'real'>('real');

  useEffect(() => {
    localStorage.setItem('dataMode', dataMode);
  }, [dataMode]);

  return (
    <DataModeContext.Provider value={{ dataMode, setDataMode }}>
      {children}
    </DataModeContext.Provider>
  );
};

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
} 