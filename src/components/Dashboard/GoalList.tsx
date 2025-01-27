import React, { useState } from 'react';
import { Goal, useGoals } from '../../context/GoalContext';
import { Trash, Plus, Edit2 } from 'lucide-react';
import { useUserSettings } from '../../context/UserContext';
import { useGoalLists } from '../../context/GoalListContext';
import GoalItem from './GoalItem';
import ConfirmationModal from './ConfirmationModal';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface GoalListProps {
  goalListId: string;
  title: string;
  goals: Goal[];
  index: number;
}

const GoalList: React.FC<GoalListProps> = ({ goalListId, title, goals, index }) => {
  const { toggleComplete, addGoal, updateGoal } = useGoals();
  const { updateGoalList, deleteGoalList } = useGoalLists();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [listTitle, setListTitle] = useState(title);
  const { soundEnabled } = useUserSettings();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleAddGoal = async () => {
    if (newGoalTitle.trim() === '') return;

    try {
      // Get the current goals for this list and find the max order
      const currentGoals = goals.filter(g => g.goalListId === goalListId);
      const maxOrder = Math.max(-1, ...currentGoals.map(g => g.goal_order || 0));

      const newGoal = {
        title: newGoalTitle,
        description: null,
        dueDate: null,
        goalListId,
        repeatFrequency: null,
        carryOver: true,
        completedAt: null,
        goal_order: maxOrder + 1,
      };

      await addGoal(newGoal);
      setNewGoalTitle('');
    } catch (error) {
      console.error('Error adding goal:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleUpdateTitle = async () => {
    if (listTitle.trim() === '') return;
    await updateGoalList(goalListId, { title: listTitle });
    setIsEditing(false);
  };

  const handleCheckboxChange = (goalId: string, isChecked: boolean) => {
    if (soundEnabled) {
      const audio = new Audio('/check_sound.mp3');
      audio.play();
    }
    toggleComplete(goalId, isChecked);
  };

  const handleDeleteGoalList = () => {
    deleteGoalList(goalListId);
    setDeleteModalOpen(false);
  };

  return (
    <Draggable draggableId={goalListId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="goal-list bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4" {...provided.dragHandleProps}>
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateTitle();
                    }
                  }}
                  className="input input-sm flex-1 bg-surface-light dark:bg-surface rounded-lg"
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
                <span className="mr-2">{title}</span>
                <span className="text-sm font-normal text-text-light/60 dark:text-text-dark/60">
                  ({goals.length})
                </span>
              </h2>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-sm btn-ghost"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="btn btn-sm btn-ghost text-red-500"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>

          <Droppable droppableId={goalListId} type="goal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-1"
                id="goal-container"
              >
                {goals
                  .sort((a, b) => (a.goal_order || 0) - (b.goal_order || 0))
                  .map((goal, index) => (
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
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

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
                className="px-4 py-2 bg-primary-light dark:bg-primary hover:bg-primary dark:hover:bg-primary-dark text-white font-medium rounded-r-lg transition-colors focus:outline-none"
              >
                <Plus size={20} strokeWidth={3}/>
              </button>
            </div>
          </div>

          <ConfirmationModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setDeleteModalOpen(false)} 
            onConfirm={handleDeleteGoalList} 
            itemName={title}
          />
        </div>
      )}
    </Draggable>
  );
};

export default GoalList;