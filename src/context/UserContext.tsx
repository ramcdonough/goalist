import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import the useAuth hook
import { supabase } from '../supabaseClient';

interface UserSettings {
  sound_enabled: boolean;
  dark_mode_enabled: boolean;
  column_preference: number;
  archive_after_days: number | null;
}

interface UserContextType {
  soundEnabled: boolean;
  toggleSound: () => Promise<void>;
  user: any; // Include user from AuthContext
  darkModeEnabled: boolean;
  toggleTheme: () => Promise<void>;
  columnPreference: number;
  setColumnPreference: (columns: number) => Promise<void>;
  archiveAfterDays: number | null;
  setArchiveAfterDays: (days: number | null) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Initialize theme from localStorage immediately
const cachedTheme = localStorage.getItem('theme');
if (cachedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Add a class to prevent theme flash
document.documentElement.classList.add('disable-transitions');

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(cachedTheme === 'dark');
  const [columnPreference, setColumnPreferenceState] = useState(2);
  const [archiveAfterDays, setArchiveAfterDaysState] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) {
        setColumnPreferenceState(2);
        setSoundEnabled(true);
        // Don't override darkModeEnabled here as it's set from localStorage
        setIsInitialized(true);
        return;
      }

      try {
        // First, ensure user settings exist
        const { data: existingSettings, error: checkError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking user settings:', checkError);
          return;
        }

        if (!existingSettings) {
          // Create initial settings if they don't exist
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({ 
              user_id: user.id,
              sound_enabled: true,
              dark_mode_enabled: darkModeEnabled, // Use the value from localStorage
              column_preference: 2,
              archive_after_days: null
            });

          if (insertError) {
            console.error('Error creating initial user settings:', insertError);
            return;
          }
          
          setSoundEnabled(true);
          setColumnPreferenceState(2);
          setArchiveAfterDaysState(null);
        } else {
          // Update state with existing settings
          setSoundEnabled(existingSettings.sound_enabled);
          setDarkModeEnabled(existingSettings.dark_mode_enabled);
          setColumnPreferenceState(existingSettings.column_preference || 2);
          setArchiveAfterDaysState(existingSettings.archive_after_days);
          
          // Update localStorage with server value
          localStorage.setItem('theme', existingSettings.dark_mode_enabled ? 'dark' : 'light');
          
          // Only update theme class if it differs from current state
          const isDark = document.documentElement.classList.contains('dark');
          if (existingSettings.dark_mode_enabled !== isDark) {
            if (existingSettings.dark_mode_enabled) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error in loadUserPreferences:', error);
      }
    };

    loadUserPreferences();
  }, [user, darkModeEnabled]);

  // Remove transition disable class after initialization
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.classList.remove('disable-transitions');
    }
  }, [isInitialized]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) {
      throw new Error('User must be logged in to update preferences');
    }

    const { error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  };

  const toggleSound = async () => {
    try {
      const newValue = !soundEnabled;
      await updateSettings({ sound_enabled: newValue });
      setSoundEnabled(newValue);
    } catch (error) {
      console.error('Error toggling sound:', error);
      throw error;
    }
  };

  const toggleTheme = async () => {
    try {
      const newValue = !darkModeEnabled;
      await updateSettings({ dark_mode_enabled: newValue });
      
      // Update localStorage first
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      
      // Then update the UI
      setDarkModeEnabled(newValue);
      const htmlElement = document.documentElement;
      if (newValue) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error toggling theme:', error);
      throw error;
    }
  };

  const setColumnPreference = async (columns: number) => {
    if (!user) {
      throw new Error('User must be logged in to update preferences');
    }

    if (columns !== 2 && columns !== 3) {
      throw new Error('Column preference must be either 2 or 3');
    }

    try {
      await updateSettings({ column_preference: columns });
      setColumnPreferenceState(columns);
    } catch (error) {
      console.error('Error setting column preference:', error);
      throw error;
    }
  };

  const setArchiveAfterDays = async (days: number | null) => {
    try {
      if (!user) return;

      setArchiveAfterDaysState(days);

      // Update the settings in the database
      const { error } = await supabase
        .from('user_settings')
        .update({
          archive_after_days: days
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating archive after days setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update archive settings:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      soundEnabled, 
      toggleSound, 
      user, 
      darkModeEnabled, 
      toggleTheme,
      columnPreference,
      setColumnPreference,
      archiveAfterDays,
      setArchiveAfterDays
    }}>
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