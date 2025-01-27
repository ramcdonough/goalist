import React from 'react';
import { useUserSettings } from '../../context/UserContext';
import SettingsToggle from './SettingsToggle';

const Settings: React.FC = () => {
  const { darkModeEnabled, toggleTheme } = useUserSettings();
  const { soundEnabled, toggleSound } = useUserSettings();

  return (
    <div className="flex justify-center min-h-screen bg-background-light dark:bg-background-dark md:p-16">
      <div className="w-full lg:max-w-xl p-8 max-h-fit md:shadow-sm md:bg-surface-light dark:bg-surface rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-text-dark text-center">Settings</h1>
        <div className="flex flex-col gap-8 p-6 bg-surface-light dark:bg-surface rounded-lg">
          <div className="flex items-center justify-between">
            <SettingsToggle label="Dark Mode" value={darkModeEnabled} toggleMethod={toggleTheme} />
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