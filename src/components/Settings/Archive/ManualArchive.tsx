import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { useGoals } from '../../../context/GoalContext';
import { useUserSettings } from '../../../context/UserContext';
import { Archive, Loader2 } from 'lucide-react';

const ManualArchive: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const { goals, setGoals } = useGoals();
  const { archiveAfterDays } = useUserSettings();

  const handleManualArchive = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResultMessage(null);

    try {
      // If we're not using an Edge Function, do client-side archiving
      if (!archiveAfterDays) {
        setResultMessage("Please enable auto-archiving first by setting a day period in the settings above.");
        setIsLoading(false);
        return;
      }

      // Calculate the cutoff date based on user's archive_after_days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - archiveAfterDays);
      const cutoffDateIso = cutoffDate.toISOString();

      // Find all completed, non-archived goals older than the cutoff date
      const eligibleGoals = goals.filter(goal => 
        goal.completedAt && 
        !goal.archivedAt && 
        new Date(goal.completedAt) < cutoffDate
      );

      if (eligibleGoals.length === 0) {
        setResultMessage("No goals found to archive.");
        setIsLoading(false);
        return;
      }

      const goalIds = eligibleGoals.map(goal => goal.id);
      const now = new Date().toISOString();

      // Update the goals in the database
      const { error } = await supabase
        .from('goals')
        .update({ archived_at: now })
        .in('id', goalIds);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedGoals = goals.map(goal => 
        goalIds.includes(goal.id) ? { ...goal, archivedAt: now } : goal
      );
      setGoals(updatedGoals);

      setResultMessage(`Successfully archived ${goalIds.length} goal${goalIds.length !== 1 ? 's' : ''}.`);
    } catch (error: any) {
      console.error('Error manually archiving goals:', error);
      setResultMessage(`Error: ${error.message || 'Failed to archive goals'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="font-semibold text-text-light dark:text-text-dark mb-2">Manual Archive</h3>
      <p className="text-sm text-text-light/80 dark:text-text-dark/80 mb-3">
        Archive all eligible completed goals now based on your archive settings.
      </p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleManualArchive}
          disabled={isLoading || !archiveAfterDays}
          className={`flex items-center gap-2 px-4 py-2 rounded-md 
            ${!archiveAfterDays 
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
              : 'bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary'} 
            transition-colors`}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Archive size={18} />
          )}
          {isLoading ? 'Archiving...' : 'Archive Now'}
        </button>
        
        {resultMessage && (
          <span className={`text-sm ${resultMessage.startsWith('Error') 
            ? 'text-red-500 dark:text-red-400' 
            : 'text-green-600 dark:text-green-400'}`}>
            {resultMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default ManualArchive;
