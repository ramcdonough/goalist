import React, { useState } from 'react';
import { Goal, useGoals } from '../../context/GoalContext';
import { Trash, Plus, Edit2 } from 'lucide-react';
import { useUserSettings } from '../../context/UserContext';
import GoalItem from './GoalItem';
import FocusGoalItem from './FocusGoalItem';
import ConfirmationModal from './ConfirmationModal';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface BaseGoalListProps {
  id: string;
  title: string;
  goals: Goal[];
  index?: number;
  isDraggable?: boolean;
  allowGoalReordering?: boolean;
  onTitleUpdate?: (newTitle: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onAddGoal?: (title: string) => Promise<void>;
  isFocusList?: boolean;
  titleComponent?: React.ReactNode;
}

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
  isFocusList = false,
  titleComponent,
}) => {
  const { toggleComplete } = useGoals();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [listTitle, setListTitle] = useState(title);
  const { soundEnabled } = useUserSettings();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const handleCheckboxChange = (goalId: string, isChecked: boolean) => {
    if (soundEnabled) {
      const audio = new Audio('/check_sound.mp3');
      audio.play();
    }
    toggleComplete(goalId, isChecked);
  };

  const handleDeleteList = async () => {
    if (onDelete) {
      await onDelete();
      setDeleteModalOpen(false);
    }
  };

  const GoalComponent = isFocusList ? FocusGoalItem : GoalItem;

  const defaultTitle = (
    <div className="flex items-center justify-between mb-4 px-1">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1 text-text-light dark:text-text-dark">
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
            className="input input-sm flex-1 bg-transparent border-none text-xl font-semibold"
            autoFocus
          />
          <button
            onClick={handleUpdateTitle}
            className="btn btn-sm bg-primary-light dark:bg-primary-dark text-white border-none rounded-full"
          >
            Save
          </button>
        </div>
      ) : (
        <h2 className="text-xl font-semibold text-text-light dark:text-text-dark flex items-center">
          <span className="mr-2" onClick={() => onTitleUpdate && setIsEditing(true)}>{title}</span>
          <span className="text-sm font-normal text-text-light/60 dark:text-text-dark/60">
            ({goals.length})
          </span>
        </h2>
      )}
      {(onTitleUpdate || onDelete) && (
        <div className="flex items-center gap-2">
          {onTitleUpdate && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-sm btn-ghost"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="btn btn-sm btn-ghost text-red-500"
            >
              <Trash size={16} />
            </button>
          )}
        </div>
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
            .sort((a, b) => (a.goalOrder || 0) - (b.goalOrder || 0))
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
                        <GoalComponent
                          goal={goal}
                          handleCheckboxChange={handleCheckboxChange}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ) : (
                <div key={goal.id}>
                  <GoalComponent
                    goal={goal}
                    handleCheckboxChange={handleCheckboxChange}
                  />
                </div>
              )
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  const content = (
    <div className={`goal-list ${!isFocusList ? 'bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800' : ''}`}>
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