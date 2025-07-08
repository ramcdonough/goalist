import React from 'react';
import { Goal, useGoals } from '../../../context/GoalContext';
import { useGoalLists } from '../../../context/GoalListContext';
import BaseGoalList from './index';

interface GoalListProps {
  goalListId: string;
  title: string;
  goals: Goal[];
  index: number;
  onGoalReorder?: (newOrder: Goal[]) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goalListId, title, goals, index, onGoalReorder }) => {
  const { addGoal, toggleComplete, updateGoal } = useGoals();
  const { updateGoalList, deleteGoalList } = useGoalLists();

  const handleAddGoal = async (newGoalTitle: string) => {
    try {
      const currentGoals = goals.filter(g => g.goalListId === goalListId);
      const maxOrder = Math.max(-1, ...currentGoals.map(g => g.goalOrder || 0));

      await addGoal({
        title: newGoalTitle,
        description: null,
        dueDate: null,
        goalListId,
        repeatFrequency: null,
        carryOver: true,
        completedAt: null,
        goalOrder: maxOrder + 1,
        isFocused: false,
      });
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    await updateGoalList(goalListId, { title: newTitle });
  };

  const handleDelete = async () => {
    await deleteGoalList(goalListId);
  };

  const handleCheckboxChange = (goalId: string, isChecked: boolean) => {
    toggleComplete(goalId, isChecked);
  };

  const handleGoalReorder = async (newOrder: Goal[]) => {
    if (onGoalReorder) {
      onGoalReorder(newOrder);
    } else {
      // Default reordering logic
      const updates = newOrder.map((goal, index) => ({
        id: goal.id,
        goalOrder: index,
      }));
      
      await Promise.all(
        updates.map(({ id, goalOrder }) => updateGoal(id, { goalOrder }))
      );
    }
  };

  return (
    <BaseGoalList
      id={goalListId}
      title={title}
      goals={goals}
      index={index}
      onTitleUpdate={handleUpdateTitle}
      onDelete={handleDelete}
      onAddGoal={handleAddGoal}
      onGoalReorder={handleGoalReorder}
      handleCheckboxChange={handleCheckboxChange}
      variant="default"
    />
  );
};

export default GoalList; 