"use client";
import { createContext, useContext, useState } from "react";
const SelectedFilesContext = createContext();
export function useSelectedFiles() { return useContext(SelectedFilesContext); }
export function SelectedFilesProvider({ children }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  return (
    <SelectedFilesContext.Provider value={{ selectedFiles, setSelectedFiles }}>
      {children}
    </SelectedFilesContext.Provider>
  );
}
