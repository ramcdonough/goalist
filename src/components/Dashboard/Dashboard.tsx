import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useGoals, Goal } from "../../context/GoalContext";
import {
    useGoalLists,
    GoalList as GoalListType,
} from "../../context/GoalListContext";
import { useUserSettings } from "../../context/UserContext";
import { AlertCircle } from "lucide-react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import DraggableColumns, {
    ColumnData,
    ListWithGoals,
} from "./DraggableColumns";
import ProgressSection from "./Progress/ProgressSection";
import AddListForm from "./AddListForm";
import FocusList from "./GoalList/FocusList";
const Dashboard: React.FC = () => {
    const { goals, updateGoal, setGoals } = useGoals();
    const { goalLists, updateGoalList, setGoalLists } = useGoalLists();
    const { columnPreference } = useUserSettings();
    const [isProgressOpen, setIsProgressOpen] = useState(
        () => localStorage.getItem("progressOpen") === "true"
    );
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

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, type, draggableId } = result;

        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;

        try {
            setError(null);

            if (type === "goal") {
                // Handle goal dragging
                const sourceList = goalLists.find(
                    (list) => list.id === source.droppableId
                );
                const destList = goalLists.find(
                    (list) => list.id === destination.droppableId
                );

                if (!sourceList || !destList) {
                    throw new Error("Source or destination list not found");
                }

                // Get all goals in the source and destination lists
                const sourceGoals = goals
                    .filter((goal) => goal.goalListId === source.droppableId)
                    .sort((a, b) => (a.goalOrder || 0) - (b.goalOrder || 0));

                const destGoals =
                    source.droppableId === destination.droppableId
                        ? [...sourceGoals]
                        : goals
                              .filter(
                                  (goal) =>
                                      goal.goalListId ===
                                      destination.droppableId
                              )
                              .sort(
                                  (a, b) =>
                                      (a.goalOrder || 0) - (b.goalOrder || 0)
                              );

                // Find the moved goal
                const movedGoal = goals.find((g) => g.id === draggableId);
                if (!movedGoal) throw new Error("Moved goal not found");

                // Create a new array of all goals
                const newGoals = [...goals];
                const movedGoalIndex = newGoals.findIndex(
                    (g) => g.id === draggableId
                );

                // Update the moved goal's list ID if moving between lists
                if (source.droppableId !== destination.droppableId) {
                    newGoals[movedGoalIndex] = {
                        ...movedGoal,
                        goalListId: destination.droppableId,
                    };
                }

                // Calculate new orders
                const updatedSourceGoals = newGoals
                    .filter(
                        (g) =>
                            g.goalListId === source.droppableId &&
                            g.id !== draggableId
                    )
                    .sort((a, b) => (a.goalOrder || 0) - (b.goalOrder || 0))
                    .map((g, index) => ({ ...g, goalOrder: index }));

                const updatedDestGoals = newGoals
                    .filter((g) => g.goalListId === destination.droppableId)
                    .sort((a, b) => (a.goalOrder || 0) - (b.goalOrder || 0));

                if (source.droppableId === destination.droppableId) {
                    updatedDestGoals.splice(source.index, 1);
                }
                updatedDestGoals.splice(destination.index, 0, {
                    ...newGoals[movedGoalIndex],
                    goalOrder: destination.index,
                });
                updatedDestGoals.forEach((g, index) => {
                    g.goalOrder = index;
                });

                // Merge all updates back into the goals array
                const finalGoals = newGoals.map((goal) => {
                    if (
                        goal.goalListId === source.droppableId &&
                        goal.id !== draggableId
                    ) {
                        const updated = updatedSourceGoals.find(
                            (g) => g.id === goal.id
                        );
                        return updated || goal;
                    }
                    if (goal.goalListId === destination.droppableId) {
                        const updated = updatedDestGoals.find(
                            (g) => g.id === goal.id
                        );
                        return updated || goal;
                    }
                    return goal;
                });

                // Update state immediately
                setGoals(finalGoals);

                // Update database
                const updates = [...updatedSourceGoals, ...updatedDestGoals];
                await Promise.all(
                    updates.map((goal) =>
                        updateGoal(goal.id, {
                            goalOrder: goal.goalOrder,
                            goalListId: goal.goalListId,
                        })
                    )
                );
            } else {
                // Handle list dragging
                const sourceColumn = source.droppableId as keyof ColumnData;
                const destColumn = destination.droppableId as keyof ColumnData;

                // Get the lists for both columns
                const sourceLists = goalLists
                    .filter(
                        (list) =>
                            list.column_number ===
                            parseInt(sourceColumn.split("-")[1])
                    )
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                const destLists =
                    sourceColumn === destColumn
                        ? [...sourceLists]
                        : goalLists
                              .filter(
                                  (list) =>
                                      list.column_number ===
                                      parseInt(destColumn.split("-")[1])
                              )
                              .sort((a, b) => (a.order || 0) - (b.order || 0));

                // Find the moved list
                const movedList = goalLists.find(
                    (list) => list.id === draggableId
                );
                if (!movedList) throw new Error("Moved list not found");

                // Create new array of all lists
                const newLists = [...goalLists];
                const movedListIndex = newLists.findIndex(
                    (list) => list.id === draggableId
                );

                // Update column number if moving between columns
                const newColumnNumber = parseInt(destColumn.split("-")[1]);
                if (sourceColumn !== destColumn) {
                    newLists[movedListIndex] = {
                        ...movedList,
                        column_number: newColumnNumber,
                    };
                }

                // Handle reordering within the same column
                if (sourceColumn === destColumn) {
                    const columnLists = newLists.filter(
                        (list) => list.column_number === newColumnNumber
                    );
                    columnLists.sort((a, b) => (a.order || 0) - (b.order || 0));

                    // Remove from old position and insert at new position
                    const [removed] = columnLists.splice(source.index, 1);
                    columnLists.splice(destination.index, 0, removed);

                    // Update orders
                    columnLists.forEach((list, index) => {
                        const listIndex = newLists.findIndex(
                            (l) => l.id === list.id
                        );
                        if (listIndex !== -1) {
                            newLists[listIndex] = { ...list, order: index };
                        }
                    });
                } else {
                    // Handle moving between columns
                    const sourceColumnLists = newLists
                        .filter(
                            (list) =>
                                list.column_number ===
                                    parseInt(sourceColumn.split("-")[1]) &&
                                list.id !== draggableId
                        )
                        .sort((a, b) => (a.order || 0) - (b.order || 0));

                    const destColumnLists = newLists
                        .filter(
                            (list) => list.column_number === newColumnNumber
                        )
                        .sort((a, b) => (a.order || 0) - (b.order || 0));

                    // Update orders in source column
                    sourceColumnLists.forEach((list, index) => {
                        const listIndex = newLists.findIndex(
                            (l) => l.id === list.id
                        );
                        if (listIndex !== -1) {
                            newLists[listIndex] = { ...list, order: index };
                        }
                    });

                    // Update orders in destination column
                    destColumnLists.splice(destination.index, 0, {
                        ...movedList,
                        column_number: newColumnNumber,
                    });
                    destColumnLists.forEach((list, index) => {
                        const listIndex = newLists.findIndex(
                            (l) => l.id === list.id
                        );
                        if (listIndex !== -1) {
                            newLists[listIndex] = { ...list, order: index };
                        }
                    });
                }

                // Update state immediately
                setGoalLists(newLists);

                // Update database
                await Promise.all(
                    newLists.map((list) =>
                        updateGoalList(list.id, {
                            order: list.order,
                            column_number: list.column_number,
                        })
                    )
                );
            }
        } catch (err) {
            console.error("Error reordering:", err);
            setError(err instanceof Error ? err.message : "Failed to reorder");
        }
    };

    const toggleProgress = () => {
        const newState = !isProgressOpen;
        setIsProgressOpen(newState);
        localStorage.setItem("progressOpen", String(newState));
    };

    return (
        <div className="min-h-screen p-4 md:p-8 md:pt-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-center md:pr-12">
                    <h1 className="text-2xl md:text-2xl text-left md:text-left font-bold relative md:ml-12">
                        <span
                            className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r dark:from-red-500 dark:to-red-500 from-red-500 to-red-700"
                            style={{ letterSpacing: "1px" }}
                        >
                            {new Date().toLocaleString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                    </h1>
                    <AddListForm onError={setError} columns={columns} />
                </div>

                {error && (
                    <div className="alert alert-error shadow-lg md:mx-12">
                        <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
                        <span>{error}</span>
                    </div>
                )}
                {!isLoading && goalLists.length === 0 && goals.length === 0 && (
                    <div className="flex flex-col items-center justify-center md:min-h-[60vh] text-center px-4">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-8 border border-blue-100 dark:border-gray-800 max-w-md">
                            <h2 className="text-2xl text-text-light dark:text-text-dark font-semibold mb-3">Welcome to Your Dashboard</h2>
                            <p className="text-text-light dark:text-text-dark text-lg">
                                No goals yet. Create your first list to get started!
                            </p>
                        </div>
                    </div>
                )}

                <FocusList />

                <DragDropContext onDragEnd={handleDragEnd}>
                    <DraggableColumns columns={columns} />
                </DragDropContext>
            </div>
        </div>
    );
};

export default Dashboard;
