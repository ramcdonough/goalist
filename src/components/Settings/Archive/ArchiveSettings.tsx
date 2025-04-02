import React, { useState, useEffect } from 'react';
import { useUserSettings } from '../../../context/UserContext';
import ManualArchive from './ManualArchive';

const ArchiveSettings: React.FC = () => {
  const { archiveAfterDays, setArchiveAfterDays } = useUserSettings();
  const [isArchivingEnabled, setIsArchivingEnabled] = useState(archiveAfterDays !== null);
  const [days, setDays] = useState<number>(archiveAfterDays || 7);
  
  // Keep UI state in sync with context values
  useEffect(() => {
    setIsArchivingEnabled(archiveAfterDays !== null);
    setDays(archiveAfterDays || 7);
  }, [archiveAfterDays]);
  
  const handleToggleArchiving = async () => {
    try {
      const newState = !isArchivingEnabled;
      setIsArchivingEnabled(newState);
      
      // If toggling off, set archive_after_days to null
      // If toggling on, use the current days value
      await setArchiveAfterDays(newState ? days : null);
    } catch (error) {
      console.error('Error toggling archiving setting:', error);
      // Revert UI on error
      setIsArchivingEnabled(archiveAfterDays !== null);
    }
  };
  
  const handleDaysChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDays = parseInt(event.target.value, 10);
    if (isNaN(newDays)) return;
    
    setDays(newDays);
    if (isArchivingEnabled) {
      try {
        await setArchiveAfterDays(newDays);
      } catch (error) {
        console.error('Error updating archive days:', error);
      }
    }
  };
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-start w-full">
        <label className="flex items-start gap-2">
          <input 
            type="checkbox" 
            className="toggle toggle-success mt-1" 
            checked={isArchivingEnabled} 
            onChange={handleToggleArchiving} 
          />
          <div className="flex flex-col text-left">
            <span className="text-text-light dark:text-text-dark font-semibold">
              Auto-Archive Completed Goals
            </span>
            <span className="text-text-light/50 dark:text-text-dark/50 text-sm">
              {isArchivingEnabled 
                ? `Automatically archive completed goals after ${days} days` 
                : "Archiving is disabled"}
            </span>
          </div>
        </label>
      </div>
      
      {isArchivingEnabled && (
        <div className="ml-14">
          <label className="flex items-center gap-2">
            <div className="text-text-light dark:text-text-dark">Archive after</div>
            <select 
              value={days}
              onChange={handleDaysChange}
              className="select select-bordered select-sm w-24 text-text-light dark:text-text-dark bg-surface-light dark:bg-surface"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </label>
        </div>
      )}
      
      <ManualArchive />
    </div>
  );
};

export default ArchiveSettings;
