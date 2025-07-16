import React, { createContext, useContext, useCallback } from "react";

type LocalFilterResetContextType = {
  resetAllLocalFilters: () => void;
};

const LocalFilterResetContext = createContext<
  LocalFilterResetContextType | undefined
>(undefined);

export const LocalFilterResetProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const resetAllLocalFilters = useCallback(() => {
    // Implement your filter reset logic here
    console.log("Filters reset!");
  }, []);

  return (
    <LocalFilterResetContext.Provider value={{ resetAllLocalFilters }}>
      {children}
    </LocalFilterResetContext.Provider>
  );
};

export const useLocalFilterReset = () => {
  const context = useContext(LocalFilterResetContext);
  if (!context) {
    throw new Error(
      "useLocalFilterReset must be used within a LocalFilterResetProvider"
    );
  }
  return context;
};
