import React, { useState } from 'react';
import { useUserSettings } from '../../context/UserContext';
import SettingsToggle from './SettingsToggle';
import ThemeToggle from './ThemeToggle';
import { AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { darkModeEnabled, toggleTheme, soundEnabled, toggleSound, columnPreference, setColumnPreference } = useUserSettings();
  const [error, setError] = useState<string | null>(null);

  const handleColumnChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = Number(event.target.value);
    try {
      setError(null);
      
      if (isNaN(newValue) || ![2, 3].includes(newValue)) {
        throw new Error('Invalid column preference value. Must be 2 or 3.');
      }

      await setColumnPreference(newValue);
    } catch (err) {
      console.error('Error updating column preference:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update column preference';
      setError(errorMessage);
      
      // Revert the select value to the current preference
      event.target.value = columnPreference.toString();
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-background-light dark:bg-background-dark md:p-16 p-4">
      <div className="w-full lg:max-w-xl p-8 max-h-fit md:shadow-sm rounded-lg bg-surface-light dark:bg-surface">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark text-center">Settings</h1>
        <div className="flex flex-col gap-4 p-6 rounded-lg">
          {error && (
            <div className="alert alert-error shadow-lg">
              <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <ThemeToggle label="Theme" value={darkModeEnabled} toggleMethod={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <SettingsToggle label="Sound Effects" value={soundEnabled} toggleMethod={toggleSound} />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <span className="text-text-light dark:text-text-dark font-semibold">Dashboard Columns</span>
              <select 
                value={columnPreference} 
                onChange={handleColumnChange}
                className="select select-bordered w-24 text-text-light dark:text-text-dark bg-surface-light dark:bg-surface"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 