import React from 'react';
import { useUserSettings } from '../../context/UserContext';
import SettingsToggle from './SettingsToggle';
import ThemeToggle from './ThemeToggle';

const Settings: React.FC = () => {
  const { darkModeEnabled, toggleTheme } = useUserSettings();
  const { soundEnabled, toggleSound } = useUserSettings();

  return (
    <div className="flex justify-center min-h-screen bg-background-light dark:bg-background-dark md:p-16 p-4">
      <div className="w-full lg:max-w-xl p-8 max-h-fit md:shadow-sm rounded-lg bg-surface-light dark:bg-surface">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark text-center">Settings</h1>
        <div className="flex flex-col gap-4 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <ThemeToggle label="Theme" value={darkModeEnabled} toggleMethod={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <SettingsToggle label="Sound Effects" value={soundEnabled} toggleMethod={toggleSound} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 