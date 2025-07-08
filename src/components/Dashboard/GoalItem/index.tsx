import { Trash, Star, ArrowUpRight, GripVertical } from "lucide-react";
import { Goal, useGoals } from "../../../context/GoalContext";
import GoalModal from "../GoalModal";
import ConfirmationModal from '../ConfirmationModal';
import { useState, useEffect } from 'react';
import { useGoalLists } from "../../../context/GoalListContext";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface GoalItemProps {
  goal: Goal;
  handleCheckboxChange: (goalId: string, isChecked: boolean) => void;
  variant?: 'default' | 'focus';
}

const GoalItem: React.FC<GoalItemProps> = ({ 
  goal, 
  handleCheckboxChange,
  variant = 'default'
}) => {
  const { deleteGoal, updateGoal } = useGoals();
  const { goalLists } = useGoalLists();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(!!goal.completedAt);
  
  const isFocusVariant = variant === 'focus';
  const originList = isFocusVariant ? goalLists.find(list => list.id === goal.goalListId) : null;

  // dnd-kit sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Update local state when goal.completedAt changes
  useEffect(() => {
    setIsChecked(!!goal.completedAt);
  }, [goal.completedAt]);

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckedState = e.target.checked;
    setIsChecked(newCheckedState); // Update local state immediately
    handleCheckboxChange(goal.id, newCheckedState); // Trigger the actual update
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

  // Different styling based on variant
  const containerClasses = isFocusVariant
    ? "flex items-center gap-2 py-1 px-0 md:p-3 hover:bg-blue-500/10 dark:hover:bg-blue-400/10 transition-colors group border border-transparent hover:border-blue-500/10 dark:hover:border-blue-400/10 rounded-lg"
    : "flex items-center gap-2 p-2 rounded-lg bg-surface-light/50 dark:bg-surface-dark/50 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors group";

  return (
    <>
      <div 
        ref={setNodeRef}
        style={style}
        className={`${containerClasses} ${isDragging ? 'z-50' : ''}`}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <GripVertical size={16} />
        </div>
        
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxClick}
          className="checkbox checkbox-sm checkbox-primary"
        />
        <div className={isFocusVariant ? "flex-1 flex flex-col md:flex-row md:items-center md:gap-2" : "flex-1 flex items-center gap-2"}>
          <button
            onClick={openModal}
            className={`flex-1 text-left text-text-light dark:text-text-dark ${isChecked ? (isFocusVariant ? 'line-through opacity-50' : 'line-through') : ''}`}
          >
            {goal.title}
          </button>
          
          {/* Mobile origin list for focus variant */}
          {isFocusVariant && originList && (
            <div className="md:hidden">
              <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 opacity-60">
                <ArrowUpRight size={14} />
                <span>{originList.title}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Desktop origin list for focus variant */}
          {isFocusVariant && originList && (
            <div className="hidden md:block">
              <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 opacity-60">
                <ArrowUpRight size={14} />
                <span>{originList.title}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleFocus}
            className={`btn btn-ghost btn-xs ${goal.isFocused ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
            title={goal.isFocused ? "Remove from Focus List" : "Add to Focus List"}
          >
            <Star size={16} className={goal.isFocused ? 'fill-current' : ''} />
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

export default GoalItem; 