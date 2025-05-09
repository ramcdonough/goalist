import React, { useState } from 'react';
import { Goal } from '../../../context/GoalContext';
import { Trash, Plus, Edit2, Save } from 'lucide-react';
import { useUserSettings } from '../../../context/UserContext';
import GoalItem from '../GoalItem/index';
import ConfirmationModal from '../ConfirmationModal';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { BaseGoalListProps } from '../types';

export type GoalListProps = BaseGoalListProps;

const BaseGoalList: React.FC<BaseGoalListProps> = ({
  id,
  title,
  goals,
  index = 0,
  isDraggable = true,
  allowGoalReordering = true,
  onTitleUpdate,
  onDelete,
  onAddGoal,
  variant = 'default',
  titleComponent,
  handleCheckboxChange,
}) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [listTitle, setListTitle] = useState(title);
  const { soundEnabled } = useUserSettings();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const isFocusVariant = variant === 'focus';

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
                ({goals.length})
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

  const goalsList = (
    <Droppable droppableId={id} type="goal">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="space-y-1"
          id="goal-container"
        >
          {goals
            .filter(goal => !goal.archivedAt)
            .sort((a, b) => {
              // First sort by completion status
              if (!!a.completedAt !== !!b.completedAt) {
                return !!a.completedAt ? 1 : -1; // Completed goals go to the bottom
              }
              // Then sort by goal order
              return (a.goalOrder || 0) - (b.goalOrder || 0);
            })
            .map((goal, index) => (
              allowGoalReordering ? (
                <Draggable key={goal.id} draggableId={goal.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <div {...provided.dragHandleProps}>
                        <GoalItem
                          goal={goal}
                          handleCheckboxChange={handleCheckboxChange}
                          variant={variant}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ) : (
                <div key={goal.id}>
                  <GoalItem
                    goal={goal}
                    handleCheckboxChange={handleCheckboxChange}
                    variant={variant}
                  />
                </div>
              )
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
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
              className="flex-1 bg-surface-light dark:bg-surface rounded-l-lg px-4 py-2 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
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

  if (!isDraggable) {
    return content;
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
};

export default BaseGoalList; 