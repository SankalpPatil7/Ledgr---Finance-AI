import React, { createContext, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ currentTheme: "corporate", setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext) || { currentTheme: "corporate", setTheme: () => {} };
}
