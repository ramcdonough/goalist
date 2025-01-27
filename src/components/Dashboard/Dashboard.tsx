import React, { useState, useEffect, useCallback } from 'react';
import { useGoals } from '../../context/GoalContext';
import { useGoalLists, type GoalList as GoalListType } from '../../context/GoalListContext';
import { AlertCircle } from 'lucide-react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import DraggableColumns, { ColumnData, ListWithGoals } from './DraggableColumns';
import ProgressSection from './ProgressSection';
import AddListForm from './AddListForm';

const Dashboard: React.FC = () => {
  const { goals, updateGoal, setGoals } = useGoals();
  const { goalLists, updateGoalList, setGoalLists } = useGoalLists();
  const [isProgressOpen, setIsProgressOpen] = useState(() => localStorage.getItem('progressOpen') === 'true');
  const [columns, setColumns] = useState<ColumnData>({
    'column-1': [],
    'column-2': []
  });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localGoals, setLocalGoals] = useState(goals);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const updateColumnsFromGoalLists = useCallback((currentGoalLists: GoalListType[]) => {
    const sorted = [...currentGoalLists].sort((a, b) => (a.order || 0) - (b.order || 0));
    const listsWithGoals = sorted.map(list => ({
      ...list,
      goals: localGoals.filter(goal => goal.goalListId === list.id)
        .sort((a, b) => (a.goal_order || 0) - (b.goal_order || 0))
    }));

    const newColumns: ColumnData = {
      'column-1': [],
      'column-2': []
    };

    listsWithGoals.forEach(list => {
      const columnNumber = list.column_number || 1;
      const columnKey = `column-${columnNumber}` as keyof ColumnData;
      newColumns[columnKey].push(list as ListWithGoals);
    });

    return newColumns;
  }, [localGoals]);

  // Update columns when goalLists change, but not during drag operations
  useEffect(() => {
    const newColumns = updateColumnsFromGoalLists(goalLists);
    setColumns(newColumns);
  }, [goalLists, updateColumnsFromGoalLists]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    
    if (!destination) {
      setIsDragging(false);
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      setIsDragging(false);
      return;
    }

    try {
      setError(null);

      if (type === "goal") {
        // Handle goal dragging
        const sourceList = goalLists.find(list => list.id === source.droppableId);
        const destList = goalLists.find(list => list.id === destination.droppableId);

        if (!sourceList || !destList) {
          throw new Error("Source or destination list not found");
        }

        // Get all goals in the source list
        const sourceGoals = localGoals
          .filter(goal => goal.goalListId === source.droppableId)
          .sort((a, b) => (a.goal_order || 0) - (b.goal_order || 0));

        // Get all goals in the destination list
        let destGoals;
        const movedGoal = sourceGoals.find(g => g.id === draggableId);
        
        if (!movedGoal) {
          throw new Error("Moved goal not found");
        }

        if (source.droppableId === destination.droppableId) {
          // Moving within the same list
          destGoals = [...sourceGoals]; // Create a new copy
          destGoals.splice(source.index, 1); // Remove from old position
          destGoals.splice(destination.index, 0, movedGoal); // Insert at new position
        } else {
          // Moving to a different list
          destGoals = localGoals
            .filter(goal => goal.goalListId === destination.droppableId)
            .sort((a, b) => (a.goal_order || 0) - (b.goal_order || 0));
          movedGoal.goalListId = destination.droppableId;
          destGoals.splice(destination.index, 0, movedGoal);
        }

        // Calculate new orders for all affected goals
        const updates: { id: string; goal_order: number; goalListId: string }[] = [];

        if (source.droppableId === destination.droppableId) {
          // Update orders for all goals in the list
          destGoals.forEach((goal, index) => {
            updates.push({
              id: goal.id,
              goal_order: index,
              goalListId: goal.goalListId
            });
          });
        } else {
          // Update orders in both source and destination lists
          const updatedSourceGoals = sourceGoals.filter(g => g.id !== movedGoal.id);
          updatedSourceGoals.forEach((goal, index) => {
            updates.push({
              id: goal.id,
              goal_order: index,
              goalListId: goal.goalListId
            });
          });

          destGoals.forEach((goal, index) => {
            updates.push({
              id: goal.id,
              goal_order: index,
              goalListId: goal.goalListId
            });
          });
        }

        // Create new goals array with updates
        const newGoals = localGoals.map(goal => {
          const update = updates.find(u => u.id === goal.id);
          if (update) {
            return {
              ...goal,
              goal_order: update.goal_order,
              goalListId: update.goalListId
            };
          }
          return goal;
        });

        // Update both states in a single batch
        setLocalGoals(newGoals);
        setGoals(newGoals);
        setColumns(prev => {
          const newColumns = {
            'column-1': [...prev['column-1']],
            'column-2': [...prev['column-2']]
          };

          Object.keys(newColumns).forEach(columnKey => {
            newColumns[columnKey as keyof ColumnData] = newColumns[columnKey as keyof ColumnData].map(list => ({
              ...list,
              goals: newGoals
                .filter(goal => goal.goalListId === list.id)
                .sort((a, b) => (a.goal_order || 0) - (b.goal_order || 0))
            }));
          });

          return newColumns;
        });

        // Then update database
        try {
          await Promise.all(
            updates.map(update =>
              updateGoal(update.id, {
                goal_order: update.goal_order,
                goalListId: update.goalListId
              })
            )
          );
        } catch (error) {
          console.error('Error updating database:', error);
          // Revert to original state if database update fails
          setLocalGoals(goals);
          setGoals(goals);
          setColumns(updateColumnsFromGoalLists(goalLists));
        }
      } else {
        // Handle list dragging
        const sourceColumn = source.droppableId as keyof ColumnData;
        const destColumn = destination.droppableId as keyof ColumnData;
        
        const newColumns = {
          'column-1': [...columns['column-1']],
          'column-2': [...columns['column-2']]
        };
        
        const [movedItem] = newColumns[sourceColumn].splice(source.index, 1);
        const newColumnNumber = parseInt(destColumn.split('-')[1]);
        movedItem.column_number = newColumnNumber;
        newColumns[destColumn].splice(destination.index, 0, movedItem);

        // Update UI immediately
        setColumns(newColumns);

        // Prepare all updates
        const updates = Object.entries(newColumns).flatMap(([columnId, lists]) =>
          lists.map((list, index) => ({
            id: list.id,
            order: index,
            column_number: parseInt(columnId.split('-')[1])
          }))
        );

        // Update local state
        const newGoalLists = goalLists.map(list => {
          const update = updates.find(u => u.id === list.id);
          if (update) {
            return {
              ...list,
              order: update.order,
              column_number: update.column_number
            };
          }
          return list;
        });
        setGoalLists(newGoalLists);

        // Then update database
        await Promise.all(
          updates.map(update =>
            updateGoalList(update.id, {
              order: update.order,
              column_number: update.column_number
            })
          )
        );
      }
    } catch (err) {
      console.error('Error reordering:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder');
      // Revert to original state
      setLocalGoals(goals);
      setGoals(goals);
      setColumns(updateColumnsFromGoalLists(goalLists));
    } finally {
      setIsDragging(false);
    }
  };

  const toggleProgress = () => {
    const newState = !isProgressOpen;
    setIsProgressOpen(newState);
    localStorage.setItem('progressOpen', String(newState));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 md:pt-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center md:pr-12">
          <h1 className="text-2xl md:text-2xl text-left md:text-left font-bold relative md:ml-12">
            <span
              className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r dark:from-red-400 dark:to-red-500 from-red-500 to-red-700"
              style={{ letterSpacing: '1px' }}
            >
              {new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </h1>
          <AddListForm 
            onError={setError}
            columns={columns}
          />
        </div>

        {error && (
          <div className="alert alert-error shadow-lg md:mx-12">
            <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        <ProgressSection 
          goalLists={goalLists}
          isProgressOpen={isProgressOpen}
          toggleProgress={toggleProgress}
        />

        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <DraggableColumns
            columns={columns}
          />
        </DragDropContext>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg md:mx-12">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({ goalLists, columns }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
