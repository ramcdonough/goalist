import React, { useState, useMemo } from 'react';
import { Trash, Plus, Save } from 'lucide-react';
import { useUserSettings } from '../../../context/UserContext';
import GoalItem from '../GoalItem/index';
import ConfirmationModal from '../ConfirmationModal';
import { 
  DndContext, 
  rectIntersection, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { BaseGoalListProps } from '../types';

export type GoalListProps = BaseGoalListProps;

const BaseGoalList: React.FC<BaseGoalListProps> = ({
  id,
  title,
  goals,
  index = 0,
  allowGoalReordering = true,
  onTitleUpdate,
  onDelete,
  onAddGoal,
  variant = 'default',
  titleComponent,
  handleCheckboxChange,
  onGoalReorder,
}) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [listTitle, setListTitle] = useState(title);
  const { soundEnabled } = useUserSettings();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const isFocusVariant = variant === 'focus';

  // Configure sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize sorted goals to prevent unnecessary re-renders
  const sortedGoals = useMemo(() => {
    return goals
      .filter(goal => !goal.archivedAt)
      .sort((a, b) => {
        // First sort by completion status
        if (!!a.completedAt !== !!b.completedAt) {
          return !!a.completedAt ? 1 : -1; // Completed goals go to the bottom
        }
        // Then sort by goal order
        return (a.goalOrder || 0) - (b.goalOrder || 0);
      });
  }, [goals]);

  const handleAddGoal = async () => {
    if (newGoalTitle.trim() === '' || !onAddGoal) return;
    await onAddGoal(newGoalTitle);
    setNewGoalTitle('');
  };

  const handleUpdateTitle = async () => {
    if (listTitle.trim() === '' || !onTitleUpdate) return;
    await onTitleUpdate(listTitle);
    setIsEditing(false);
  };

  const handleDeleteList = async () => {
    if (onDelete) {
      await onDelete();
      setDeleteModalOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedGoals.findIndex(goal => goal.id === active.id);
      const newIndex = sortedGoals.findIndex(goal => goal.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(sortedGoals, oldIndex, newIndex);
        if (onGoalReorder) {
          onGoalReorder(newOrder);
        }
      }
    }
  };

  const defaultTitle = (
    <div className="flex items-center justify-between mb-4 px-1">
      {isEditing ? (
        <>
          <div className="flex-1">
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateTitle();
                }
              }}
              onBlur={() => {
                if (listTitle.trim() === '') {
                  setListTitle(title);
                } else {
                  handleUpdateTitle();
                }
              }}
              className="input input-sm bg-transparent border-none text-xl font-semibold text-text-light dark:text-text-dark pl-2 ml-0 w-full"
              autoFocus 
            />
          </div>
          <button
            onClick={handleUpdateTitle}
            className="btn btn-sm bg-primary-light dark:bg-primary-dark text-white border-none rounded-full"
          >
            <span className="hidden md:block">Save</span>
            <Save className="md:hidden" size={16} />
          </button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark flex items-center">
              <span className="mr-2 pl-2" onClick={() => onTitleUpdate && setIsEditing(true)}>{title}</span>
              <span className="text-sm font-normal text-text-light/60 dark:text-text-dark/60">
                ({goals.filter(goal => !goal.archivedAt).length})
              </span>
            </h2>
          </div>
          {onDelete && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="btn btn-sm btn-ghost text-red-500"
            >
              <Trash size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );

  const goalsList = allowGoalReordering ? (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedGoals.map(goal => goal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1" id="goal-container">
          {sortedGoals.map((goal) => (
            <div key={goal.id}>
              <GoalItem
                goal={goal}
                handleCheckboxChange={handleCheckboxChange}
                variant={variant}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="space-y-1" id="goal-container">
      {sortedGoals.map((goal) => (
        <div key={goal.id}>
          <GoalItem
            goal={goal}
            handleCheckboxChange={handleCheckboxChange}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );

  // Different container styles based on variant
  const containerClasses = isFocusVariant
    ? "goal-list bg-blue-100/90 dark:bg-blue-900/30 rounded-lg shadow-lg border border-blue-300/20 dark:border-blue-400/20 py-2 px-1 md:p-6"
    : "goal-list bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2 px-1 md:p-6";

  const content = (
    <div className={containerClasses}>
      {titleComponent || defaultTitle}
      {goalsList}

      {onAddGoal && (
        <div className="mt-2">
          <div className="flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-light dark:focus-within:ring-primary-dark">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newGoalTitle.trim() !== '') {
                  handleAddGoal();
                }
              }}
              placeholder="Add new goal..."
              className="flex-1 bg-surface-dark/10 dark:bg-surface rounded-l-lg px-4 py-2 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={handleAddGoal}
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark hover:bg-primary dark:hover:bg-primary-dark text-white font-medium rounded-r-lg transition-colors focus:outline-none"
            >
              <Plus size={20} strokeWidth={3}/>
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={handleDeleteList} 
        itemName={title}
      />
    </div>
  );

  return content;
};

export default BaseGoalList; 