import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const completeOnboarding = (userData) => {
    setUser(userData);
    setHasOnboarded(true);
  };

  return (
    <AppContext.Provider value={{ user, hasOnboarded, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
