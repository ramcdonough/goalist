import React from 'react';
import { useGoals } from "../../context/GoalContext";
import BaseGoalList from './BaseGoalList';
import FocusListTitle from './FocusListTitle';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

const FocusList = () => {
  const { goals, updateGoal } = useGoals();

  // Filter goals that are marked as focus
  const focusedGoals = goals.filter(goal => goal.isFocused);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.index === destination.index) return;

    try {
      // Find the moved goal
      const movedGoal = goals.find(g => g.id === draggableId);
      if (!movedGoal) return;

      // Get all focused goals sorted by order
      const sortedGoals = [...focusedGoals].sort((a, b) => (a.goalOrder || 0) - (b.goalOrder || 0));

      // Calculate new order
      let newOrder: number;
      if (destination.index === 0) {
        // Moving to start
        newOrder = (sortedGoals[0]?.goalOrder || 0) - 1;
      } else if (destination.index === sortedGoals.length - 1) {
        // Moving to end
        newOrder = (sortedGoals[sortedGoals.length - 1]?.goalOrder || 0) + 1;
      } else {
        // Moving between items
        const prevOrder = sortedGoals[destination.index - 1]?.goalOrder || 0;
        const nextOrder = sortedGoals[destination.index]?.goalOrder || 0;
        newOrder = (prevOrder + nextOrder) / 2;
      }

      // Update the goal's order
      await updateGoal(draggableId, { goalOrder: newOrder });
    } catch (error) {
      console.error('Error reordering goals:', error);
    }
  };

  // Custom wrapper component for focus list styling
  const FocusListWrapper = () => (
    <div className="focus-list-container bg-blue-100/90 dark:bg-blue-900/30 rounded-lg shadow-lg border border-blue-300/20 dark:border-blue-400/20 p-6">
      <BaseGoalList
        id="focus-list"
        title="Focus List"
        goals={focusedGoals}
        isDraggable={false}
        allowGoalReordering={true}
        isFocusList={true}
        titleComponent={<FocusListTitle title="Focus List" goalCount={focusedGoals.length} />}
      />
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {focusedGoals.length > 0 && <FocusListWrapper />}
    </DragDropContext>
  );
};

export default FocusList;
