import { Trash, Star, GripVertical } from "lucide-react";
import { Goal, useGoals } from "../../context/GoalContext";
import GoalModal from "./GoalModal";
import ConfirmationModal from './ConfirmationModal';
import { useState, useEffect } from 'react';

interface GoalItemProps {
  goal: Goal;
  handleCheckboxChange: (goalId: string, isChecked: boolean) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, handleCheckboxChange }) => {
  const { deleteGoal } = useGoals();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(!!goal.completedAt);

  // Update local state when goal.completedAt changes
  useEffect(() => {
    setIsChecked(!!goal.completedAt);
  }, [goal.completedAt]);

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckedState = e.target.checked;
    setIsChecked(newCheckedState); // Update local state immediately
    handleCheckboxChange(goal.id, newCheckedState); // Trigger the actual update
  };

  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    const modal = document.getElementById(`goal-modal-${goal.id}`) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-light/50 dark:bg-surface-dark/50 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors group">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={16} className="text-gray-400" />
        </div>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxClick}
          className="checkbox checkbox-sm"
        />
        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={openModal}
            className={`flex-1 text-left text-text-light dark:text-text-dark ${isChecked ? 'line-through' : ''}`}
          >
            {goal.title}
          </button>
          {/* {goal.description && (
            <Star size={16} className="text-yellow-500" />
          )} */}
        </div>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="btn btn-ghost btn-xs text-red-500"
        >
          <Trash size={16} />
        </button>
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

export default GoalItem;