import React from 'react';
import { Goal, useGoals } from '../../context/GoalContext';
import { useGoalLists } from '../../context/GoalListContext';
import BaseGoalList from './BaseGoalList';

interface GoalListProps {
  goalListId: string;
  title: string;
  goals: Goal[];
  index: number;
}

const GoalList: React.FC<GoalListProps> = ({ goalListId, title, goals, index }) => {
  const { addGoal } = useGoals();
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

  return (
    <BaseGoalList
      id={goalListId}
      title={title}
      goals={goals}
      index={index}
      onTitleUpdate={handleUpdateTitle}
      onDelete={handleDelete}
      onAddGoal={handleAddGoal}
    />
  );
};

export default GoalList;