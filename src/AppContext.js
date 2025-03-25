// AppContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check for user preference on dark mode
  useEffect(() => {
    // Check if user has previously set a preference
    const savedDarkMode = localStorage.getItem('darkMode');
    
    // Check for system preference if no saved preference
    if (savedDarkMode === null) {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    } else {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Apply dark mode to body when state changes
  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
    
    // Apply or remove dark-mode class on body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <AppContext.Provider value={{ user, setUser, darkMode, setDarkMode }}>
      {children}
    </AppContext.Provider>
  );
};
