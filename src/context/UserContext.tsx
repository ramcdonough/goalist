import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Import the useAuth hook

interface UserContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  user: any; // Include user from AuthContext
  darkModeEnabled: boolean;
  toggleTheme: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const toggleTheme = () => {
    setDarkModeEnabled(prev => !prev);
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
    } else {
      htmlElement.classList.add('dark');
    }
  };

  return (
    <UserContext.Provider value={{ soundEnabled, toggleSound, user, darkModeEnabled, toggleTheme }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserProvider');
  }
  return context;
};