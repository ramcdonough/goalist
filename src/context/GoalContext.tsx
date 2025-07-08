import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import the Supabase client
import { useAuth } from './AuthContext';

// Utility functions for case conversion
const toSnakeCase = (str: string): string => 
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const toCamelCase = (str: string): string => 
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const convertToSnakeCase = (obj: { [key: string]: any }): { [key: string]: any } => {
  const snakeCaseObj: { [key: string]: any } = {};
  Object.keys(obj).forEach(key => {
    snakeCaseObj[toSnakeCase(key)] = obj[key];
  });
  return snakeCaseObj;
};

const convertToCamelCase = (obj: { [key: string]: any }): { [key: string]: any } => {
  const camelCaseObj: { [key: string]: any } = {};
  Object.keys(obj).forEach(key => {
    camelCaseObj[toCamelCase(key)] = obj[key];
  });
  return camelCaseObj;
};

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  goalListId: string;
  repeatFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  carryOver: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  goalOrder: number;
  isFocused: boolean;
  archivedAt: string | null;
};

// Type for database operations
type DbGoal = {
  title: string;
  description: string | null;
  due_date: string | null;
  goal_list_id: string;
  repeat_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  carry_over: boolean;
  completed_at: string | null;
  user_id: string;
  goal_order: number;
};

type GoalContextType = {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'archivedAt'>) => Promise<void>;
  updateGoal: (id: string, updatedGoal: Partial<Goal>, skipStateUpdate?: boolean) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleComplete: (id: string, isComplete: boolean) => Promise<void>;
  clearGoals: () => void;
  archiveGoal: (id: string) => Promise<void>;
  unarchiveGoal: (id: string) => Promise<void>;
};

const GOALS_CACHE_KEY = 'goalist_goals_cache';

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load goals when user changes
  useEffect(() => {
    const loadGoals = async () => {
      if (!user) {
        setGoals([]);
        return;
      }

      // First try to load from cache
      const cachedGoals = localStorage.getItem(GOALS_CACHE_KEY);
      if (cachedGoals) {
        try {
          const parsedGoals = JSON.parse(cachedGoals);
          setGoals(parsedGoals);
        } catch (error) {
          console.error('Error parsing cached goals:', error);
        }
      }

      // Then fetch from database to ensure we have latest data
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching goals:', error);
        return;
      }
      if (data) {
        const formattedGoals: Goal[] = data.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          dueDate: goal.due_date,
          goalListId: goal.goal_list_id,
          repeatFrequency: goal.repeat_frequency,
          carryOver: goal.carry_over,
          completedAt: goal.completed_at,
          createdAt: goal.created_at,
          updatedAt: goal.updated_at,
          userId: goal.user_id,
          goalOrder: goal.goal_order || 0,
          isFocused: goal.is_focused,
          archivedAt: goal.archived_at
        }));

        setGoals(formattedGoals);
        localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(formattedGoals));
      }
    };

    loadGoals();
  }, [user]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'archivedAt'>) => {
    if (!user) {
      throw new Error('User must be logged in to add a goal');
    }

    try {
      // Convert the goal to snake_case for database
      const dbGoal: DbGoal = {
        title: goal.title,
        description: goal.description,
        due_date: goal.dueDate,
        goal_list_id: goal.goalListId,
        repeat_frequency: goal.repeatFrequency,
        carry_over: goal.carryOver,
        completed_at: goal.completedAt,
        user_id: user.id,
        goal_order: goal.goalOrder
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(dbGoal)
        .select('*')
        .single();

      if (error) {
        console.error('Error adding goal:', error);
        throw new Error(`Failed to add goal: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after adding goal');
      }

      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date,
        goalListId: data.goal_list_id,
        repeatFrequency: data.repeat_frequency,
        carryOver: data.carry_over,
        completedAt: data.completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        goalOrder: data.goal_order,
        isFocused: data.is_focused,
        archivedAt: data.archived_at
      };

      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error in addGoal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updatedGoal: Partial<Goal>, skipStateUpdate?: boolean) => {
    const snakeCaseGoal = convertToSnakeCase(updatedGoal);
    if (snakeCaseGoal.due_date !== undefined) {
      snakeCaseGoal.due_date = null
    }
    const { error } = await supabase
      .from('goals')
      .update(snakeCaseGoal)
      .eq('id', id);

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    if (!skipStateUpdate) {
      const newGoals = goals.map(goal => 
        goal.id === id ? { ...goal, ...updatedGoal } : goal
      );
      setGoals(newGoals);
      localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(newGoals));
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }

    const newGoals = goals.filter(goal => goal.id !== id);
    setGoals(newGoals);
    localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(newGoals));
  };

  const toggleComplete = async (id: string, isComplete: boolean) => {
    const completedAt = isComplete ? new Date().toISOString() : null;
    
    // Update local state immediately for optimistic update
    const newGoals = goals.map(goal => 
      goal.id === id ? { ...goal, completedAt } : goal
    );
    setGoals(newGoals);
    localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(newGoals));

    try {
      // Then update the database
      const { error } = await supabase
        .from('goals')
        .update({ completed_at: completedAt })
        .eq('id', id);

      if (error) {
        // If there's an error, revert the optimistic update
        console.error('Error toggling goal completion:', error);
        const revertedGoals = goals.map(goal => 
          goal.id === id ? { ...goal } : goal
        );
        setGoals(revertedGoals);
        localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(revertedGoals));
        throw error;
      }
    } catch (error) {
      console.error('Error in toggleComplete:', error);
      throw error;
    }
  };

  const clearGoals = () => {
    setGoals([]);
    localStorage.removeItem(GOALS_CACHE_KEY);
  };

  const archiveGoal = async (id: string) => {
    const archivedAt = new Date().toISOString();
    
    // Update local state immediately for optimistic update
    const newGoals = goals.map(goal => 
      goal.id === id ? { ...goal, archivedAt } : goal
    );
    setGoals(newGoals);
    localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(newGoals));

    try {
      // Then update the database
      const { error } = await supabase
        .from('goals')
        .update({ archived_at: archivedAt })
        .eq('id', id);

      if (error) {
        // If there's an error, revert the optimistic update
        console.error('Error archiving goal:', error);
        const revertedGoals = goals.map(goal => 
          goal.id === id ? { ...goal } : goal
        );
        setGoals(revertedGoals);
        localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(revertedGoals));
        throw error;
      }
    } catch (error) {
      console.error('Error in archiveGoal:', error);
      throw error;
    }
  };

  const unarchiveGoal = async (id: string) => {
    // Update local state immediately for optimistic update
    const newGoals = goals.map(goal => 
      goal.id === id ? { ...goal, archivedAt: null } : goal
    );
    setGoals(newGoals);
    localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(newGoals));

    try {
      // Then update the database
      const { error } = await supabase
        .from('goals')
        .update({ archived_at: null })
        .eq('id', id);

      if (error) {
        // If there's an error, revert the optimistic update
        console.error('Error unarchiving goal:', error);
        const revertedGoals = goals.map(goal => 
          goal.id === id ? { ...goal } : goal
        );
        setGoals(revertedGoals);
        localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(revertedGoals));
        throw error;
      }
    } catch (error) {
      console.error('Error in unarchiveGoal:', error);
      throw error;
    }
  };

  return (
    <GoalContext.Provider value={{ 
      goals, 
      setGoals,
      addGoal, 
      updateGoal, 
      deleteGoal, 
      toggleComplete, 
      clearGoals,
      archiveGoal,
      unarchiveGoal
    }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = (): GoalContextType => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};