import React from 'react';
import { useGoals } from "../../../context/GoalContext";
import GoalList from './index';
import FocusListTitle from './FocusListTitle';

const FocusList = () => {
  const { goals, updateGoal, toggleComplete } = useGoals();

  // Filter goals that are marked as focus
  const focusedGoals = goals.filter(goal => goal.isFocused);

  const handleGoalReorder = async (newOrder: any[]) => {
    try {
      // Update goal orders based on new order
      const updates = newOrder.map((goal, index) => ({
        id: goal.id,
        goalOrder: index,
      }));
      
      await Promise.all(
        updates.map(({ id, goalOrder }) => updateGoal(id, { goalOrder }))
      );
    } catch (error) {
      console.error('Error reordering goals:', error);
    }
  };

  const handleCheckboxChange = (goalId: string, isChecked: boolean) => {
    toggleComplete(goalId, isChecked);
  };

  return (
    <>
      {focusedGoals.length > 0 && (
        <GoalList
          id="focus-list"
          title="Focus List"
          goals={focusedGoals}
          onGoalReorder={handleGoalReorder}
          variant="focus"
          titleComponent={<FocusListTitle title="Focus List" goalCount={focusedGoals.length} />}
          handleCheckboxChange={handleCheckboxChange}
        />
      )}
    </>
  );
};

export default FocusList; 