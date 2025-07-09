import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useGoals, Goal } from "../../context/GoalContext";
import {
    useGoalLists,
    GoalList as GoalListType,
} from "../../context/GoalListContext";
import { useUserSettings } from "../../context/UserContext";
import { AlertCircle } from "lucide-react";
import DraggableColumns, {
    ColumnData,
    ListWithGoals,
} from "./DraggableColumns";
import FloatingAddListButton from "./FloatingAddListButton";
import FocusList from "./GoalList/FocusList";

const Dashboard: React.FC = () => {
    const { goals, updateGoal, setGoals } = useGoals();
    const { goalLists, updateGoalList, setGoalLists } = useGoalLists();
    const { columnPreference } = useUserSettings();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const updateColumnsFromGoalLists = useCallback(
        (currentGoalLists: GoalListType[], currentGoals: Goal[]) => {
            const sorted = [...currentGoalLists].sort(
                (a, b) => (a.order || 0) - (b.order || 0)
            );
            const listsWithGoals = sorted.map((list) => ({
                ...list,
                goals: currentGoals
                    .filter((goal) => goal.goalListId === list.id)
                    .sort((a, b) => (a.goalOrder || 0) - (b.goalOrder || 0)),
            }));

            const newColumns: ColumnData = {};
            for (let i = 1; i <= columnPreference; i++) {
                newColumns[`column-${i}`] = [];
            }

            listsWithGoals.forEach((list) => {
                const columnNumber = list.column_number || 1;
                // If the column number is greater than the preference, move it to the last column
                const adjustedColumnNumber = Math.min(
                    columnNumber,
                    columnPreference
                );
                const columnKey =
                    `column-${adjustedColumnNumber}` as keyof ColumnData;
                newColumns[columnKey].push(list as ListWithGoals);
            });

            return newColumns;
        },
        [columnPreference]
    );

    // Compute columns directly from goals and goalLists
    const columns = useMemo(() => {
        return updateColumnsFromGoalLists(goalLists, goals);
    }, [goalLists, goals, updateColumnsFromGoalLists]);

    const handleGoalReorder = useCallback(async (listId: string, newOrder: Goal[]) => {
        try {
            setError(null);

            // Update goal orders based on new order
            const updates = newOrder.map((goal, index) => ({
                id: goal.id,
                goalOrder: index,
            }));
            
            // Optimistic update - update state immediately
            const updatedGoals = goals.map(goal => {
                const update = updates.find(u => u.id === goal.id);
                if (update) {
                    return { ...goal, goalOrder: update.goalOrder };
                }
                return goal;
            });
            setGoals(updatedGoals);
            
            // Update database in background (skip state update since we already did optimistic update)
            await Promise.all(
                updates.map(({ id, goalOrder }) => updateGoal(id, { goalOrder }, true))
            );
        } catch (err) {
            console.error("Error reordering goals:", err);
            setError(err instanceof Error ? err.message : "Failed to reorder goals");
            // Revert optimistic update on error
            // The context will reload the correct state from the database
        }
    }, [goals, setGoals, updateGoal]);

    const handleListReorder = useCallback(async (columnId: string, newOrder: ListWithGoals[]) => {
        try {
            setError(null);

            const columnNumber = parseInt(columnId.split("-")[1]);
            
            // Update list orders based on new order
            const updates = newOrder.map((list, index) => ({
                id: list.id,
                order: index,
                column_number: columnNumber,
            }));

            // Optimistic update - update state immediately
            const updatedLists = goalLists.map(list => {
                const update = updates.find(u => u.id === list.id);
                if (update) {
                    return { ...list, order: update.order, column_number: update.column_number };
                }
                return list;
            });
            setGoalLists(updatedLists);

            // Update database in background (skip state update since we already did optimistic update)
            await Promise.all(
                updates.map(({ id, order, column_number }) => 
                    updateGoalList(id, { order, column_number }, true)
                )
            );
        } catch (err) {
            console.error("Error reordering lists:", err);
            setError(err instanceof Error ? err.message : "Failed to reorder lists");
            // Revert optimistic update on error
            // The context will reload the correct state from the database
        }
    }, [goalLists, setGoalLists, updateGoalList]);

    const handleListMove = useCallback(async (listId: string, fromColumn: string, toColumn: string, newIndex: number) => {
        try {
            setError(null);

            const fromColumnNumber = parseInt(fromColumn.split("-")[1]);
            const toColumnNumber = parseInt(toColumn.split("-")[1]);

            // Find the list to move
            const listToMove = goalLists.find(list => list.id === listId);
            if (!listToMove) {
                throw new Error("List not found");
            }

            // Get all lists in the source and destination columns
            const sourceLists = goalLists
                .filter(list => list.column_number === fromColumnNumber && list.id !== listId)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            const destLists = goalLists
                .filter(list => list.column_number === toColumnNumber)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            // Insert the moved list at the new position
            destLists.splice(newIndex, 0, { ...listToMove, column_number: toColumnNumber });

            // Update orders for all affected lists
            const updates: Array<{ id: string; order: number; column_number: number }> = [];

            // Update source column orders
            sourceLists.forEach((list, index) => {
                updates.push({
                    id: list.id,
                    order: index,
                    column_number: fromColumnNumber,
                });
            });

            // Update destination column orders
            destLists.forEach((list, index) => {
                updates.push({
                    id: list.id,
                    order: index,
                    column_number: toColumnNumber,
                });
            });

            // Optimistic update - update state immediately
            const updatedLists = goalLists.map(list => {
                const update = updates.find(u => u.id === list.id);
                if (update) {
                    return { ...list, order: update.order, column_number: update.column_number };
                }
                return list;
            });
            setGoalLists(updatedLists);

            // Update database in background (skip state update since we already did optimistic update)
            await Promise.all(
                updates.map(({ id, order, column_number }) => 
                    updateGoalList(id, { order, column_number }, true)
                )
            );
        } catch (err) {
            console.error("Error moving list:", err);
            setError(err instanceof Error ? err.message : "Failed to move list");
            // Revert optimistic update on error
            // The context will reload the correct state from the database
        }
    }, [goalLists, setGoalLists, updateGoalList]);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-screen px-2">
            <div className="max-w-7xl mx-auto">
                

                {error && (
                    <div className="alert alert-error shadow-lg md:mx-12">
                        <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
                        <span>{error}</span>
                    </div>
                )}
                {goalLists.length === 0 && goals.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center md:min-h-[60vh] text-center px-4">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-8 border border-blue-100 dark:border-gray-800 max-w-md">
                            <h2 className="text-2xl text-text-light dark:text-text-dark font-semibold mb-3">Welcome to Your Dashboard</h2>
                            <p className="text-text-light dark:text-text-dark text-lg">
                                No goals yet. Create your first list to get started!
                            </p>
                        </div>
                    </div>
                )}
                <div className="space-y-4">
                    <FocusList />

                    <DraggableColumns 
                        columns={columns} 
                        onListReorder={handleListReorder}
                        onListMove={handleListMove}
                        onGoalReorder={handleGoalReorder}
                    />
                </div>

                <FloatingAddListButton onError={setError} columns={columns} />

            </div>
        </div>
    );
};

export default Dashboard;
