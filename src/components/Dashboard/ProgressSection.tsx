import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useGoals } from '../../context/GoalContext';
import { GoalList } from '../../context/GoalListContext';
import ProgressMeter from './ProgressMeter';

interface ProgressSectionProps {
  goalLists: GoalList[];
  isProgressOpen: boolean;
  toggleProgress: () => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  goalLists,
  isProgressOpen,
  toggleProgress,
}) => {
  const { goals } = useGoals();

  const calculateProgress = (listId: string) => {
    const listGoals = goals.filter(goal => goal.goalListId === listId);
    if (listGoals.length === 0) return 0;
    const completedGoals = listGoals.filter(goal => goal.completedAt).length;
    return (completedGoals / listGoals.length) * 100;
  };

  if (goalLists.length < 1) return null;

  return (
    <div className="collapse bg-gradient-to-r from-primary-dark to-primary-dark/50 rounded-lg shadow-lg border border-gray-400 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500">
      <input 
        type="checkbox" 
        checked={isProgressOpen} 
        onChange={toggleProgress}
      />
      <div className="collapse-title text-base font-bold flex items-center justify-between text-text-dark dark:text-text-light">
        <span>Progress</span>
        {isProgressOpen ? <ChevronDown size={20} strokeWidth={3}/> : <ChevronUp size={20} strokeWidth={3}/>}
      </div>
      <div className="collapse-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goalLists.slice(0, 4).map(list => (
            <ProgressMeter 
              key={list.id} 
              title={list.title} 
              progress={calculateProgress(list.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressSection; 