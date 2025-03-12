import { Trash, Star, GripVertical, ArrowUpRight } from "lucide-react";
import { Goal, useGoals } from "../../context/GoalContext";
import { useGoalLists } from "../../context/GoalListContext";
import GoalModal from "./GoalModal";
import ConfirmationModal from './ConfirmationModal';
import { useState } from 'react';

interface FocusGoalItemProps {
  goal: Goal;
  handleCheckboxChange: (goalId: string, isChecked: boolean) => void;
}

const FocusGoalItem: React.FC<FocusGoalItemProps> = ({ goal, handleCheckboxChange }) => {
  const { deleteGoal, updateGoal } = useGoals();
  const { goalLists } = useGoalLists();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(!!goal.completedAt);

  const originList = goalLists.find(list => list.id === goal.goalListId);

  const handleCheckboxClick = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    handleCheckboxChange(goal.id, newCheckedState);
  };

  const handleDeleteGoal = async () => {
    try {
      await deleteGoal(goal.id);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const toggleFocus = async () => {
    try {
      await updateGoal(goal.id, { isFocused: !goal.isFocused });
    } catch (error) {
      console.error('Error toggling focus:', error);
    }
  };

  const openModal = () => {
    const modal = document.getElementById(`goal-modal-${goal.id}`) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 hover:bg-blue-500/10 dark:hover:bg-blue-400/10 transition-colors group border border-transparent hover:border-blue-500/10 dark:hover:border-blue-400/10 rounded-lg">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={16} className="text-blue-500/50" />
        </div>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxClick}
          className="checkbox checkbox-sm checkbox-primary"
        />
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-2">
          <button
            onClick={openModal}
            className={`flex-1 text-left text-text-light dark:text-text-dark ${isChecked ? 'line-through opacity-50' : ''}`}
          >
            {goal.title}
          </button>
          <div className="md:hidden">
            {originList && (
              <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 opacity-60">
                <ArrowUpRight size={14} />
                <span>{originList.title}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            {originList && (
              <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 opacity-60">
                <ArrowUpRight size={14} />
                <span>{originList.title}</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleFocus}
            className={`btn btn-ghost btn-xs ${goal.isFocused ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
            title="Remove from Focus List"
          >
            <Star size={16} className="fill-current" />
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="btn btn-ghost btn-xs text-red-500"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <GoalModal goal={goal} />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={handleDeleteGoal} 
        itemName={goal.title}
      />
    </>
  );
};

export default FocusGoalItem; 