"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type SelectedFilesContextType = {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const SelectedFilesContext = createContext<SelectedFilesContextType | undefined>(undefined);

export function useSelectedFiles() {
  const context = useContext(SelectedFilesContext);
  if (!context) {
    throw new Error("useSelectedFiles must be used within a SelectedFilesProvider");
  }
  return context;
}

export function SelectedFilesProvider({ children }: { children: ReactNode }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  return (
    <SelectedFilesContext.Provider value={{ selectedFiles, setSelectedFiles }}>
      {children}
    </SelectedFilesContext.Provider>
  );
}
