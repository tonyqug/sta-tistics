'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ClassContextType {
  ClassCode: string | null;
  setClassCode: (url: string | null) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children }: { children: ReactNode }) => {
  const [ClassCode, setClassCode ] = useState<string | null>(null);

  return (
    <ClassContext.Provider value={{ ClassCode, setClassCode }}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = (): ClassContextType => {
  const context = useContext(ClassContext);
  if (!context) throw new Error('useClass must be used within a ClassProvider');
  return context;
};
