import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

type GoalList = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  order: number;
  column_number: number;
};

type GoalListOrder = {
  id: string;
  order: number;
};

type GoalListContextType = {
  goalLists: GoalList[];
  addGoalList: (goalList: Omit<GoalList, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'order'>) => Promise<void>;
  updateGoalList: (id: string, updatedGoalList: Partial<GoalList>) => Promise<void>;
  deleteGoalList: (id: string) => Promise<void>;
  clearGoalLists: () => void;
  updateGoalListOrder: (updates: GoalListOrder[]) => Promise<void>;
  setGoalLists: React.Dispatch<React.SetStateAction<GoalList[]>>;
};

const GOAL_LISTS_CACHE_KEY = 'goalist_goal_lists_cache';

const GoalListContext = createContext<GoalListContextType | undefined>(undefined);

export const GoalListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [goalLists, setGoalLists] = useState<GoalList[]>([]);

  useEffect(() => {
    const loadGoalLists = async () => {
      if (!user) {
        setGoalLists([]);
        return;
      }

      // First try to load from cache
      const cachedLists = localStorage.getItem(GOAL_LISTS_CACHE_KEY);
      if (cachedLists) {
        try {
          const parsedLists = JSON.parse(cachedLists);
          setGoalLists(parsedLists);
        } catch (error) {
          console.error('Error parsing cached goal lists:', error);
        }
      }

      // Then fetch from database to ensure we have latest data
      const { data, error } = await supabase
        .from('goal_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('list_order', { ascending: true });

      if (error) {
        console.error('Error fetching goal lists:', error);
        return;
      }

      if (data) {
        const formattedGoalLists: GoalList[] = data.map(list => ({
          id: list.id,
          title: list.title,
          createdAt: list.created_at,
          updatedAt: list.updated_at,
          userId: list.user_id,
          order: list.list_order,
          column_number: list.column_number
        }));
        setGoalLists(formattedGoalLists);
        localStorage.setItem(GOAL_LISTS_CACHE_KEY, JSON.stringify(formattedGoalLists));
      }
    };

    loadGoalLists();
  }, [user]);

  const addGoalList = async (goalList: Omit<GoalList, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'order'>) => {
    if (!user) {
      throw new Error('User must be logged in to add a goal list');
    }

    try {
      // Get the highest order number and add 1
      const maxOrder = Math.max(0, ...goalLists.map(list => list.order || 0));
      const nextOrder = maxOrder + 1;

      const { data, error } = await supabase
        .from('goal_lists')
        .insert({
          title: goalList.title,
          user_id: user.id,
          list_order: nextOrder,
          column_number: goalList.column_number || 1
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error details:', error);
        throw new Error(`Failed to add goal list: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after adding goal list');
      }

      const newGoalList: GoalList = {
        id: data.id,
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        order: data.list_order,
        column_number: data.column_number
      };
      const updatedGoalLists = [...goalLists, newGoalList];
      setGoalLists(updatedGoalLists);
      localStorage.setItem(GOAL_LISTS_CACHE_KEY, JSON.stringify(updatedGoalLists));
    } catch (error) {
      console.error('Full error:', error);
      throw error;
    }
  };

  const updateGoalList = async (id: string, updatedGoalList: Partial<GoalList>) => {
    // Convert fields to snake_case for database
    const dbFields = {
      ...(updatedGoalList.title !== undefined && { title: updatedGoalList.title }),
      ...(updatedGoalList.column_number !== undefined && { column_number: updatedGoalList.column_number }),
      ...(updatedGoalList.order !== undefined && { list_order: updatedGoalList.order })
    };

    const { error } = await supabase
      .from('goal_lists')
      .update(dbFields)
      .eq('id', id);

    if (error) {
      console.error('Error updating goal list:', error);
      throw error;
    }

    const newGoalLists = goalLists.map(list => 
      list.id === id ? { ...list, ...updatedGoalList } : list
    );
    setGoalLists(newGoalLists);
    localStorage.setItem(GOAL_LISTS_CACHE_KEY, JSON.stringify(newGoalLists));
  };

  const updateGoalListOrder = async (updates: GoalListOrder[]) => {
    // Update the database
    const promises = updates.map(({ id, order }) =>
      supabase
        .from('goal_lists')
        .update({ list_order: order })
        .eq('id', id)
    );

    try {
      await Promise.all(promises);
      
      // Update local state
      const newGoalLists = [...goalLists];
      updates.forEach(({ id, order }) => {
        const list = newGoalLists.find(l => l.id === id);
        if (list) {
          list.order = order;
        }
      });
      
      // Sort by new order
      newGoalLists.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setGoalLists(newGoalLists);
      localStorage.setItem(GOAL_LISTS_CACHE_KEY, JSON.stringify(newGoalLists));
    } catch (error) {
      console.error('Error updating goal list order:', error);
      throw error;
    }
  };

  const deleteGoalList = async (id: string) => {
    const { error } = await supabase
      .from('goal_lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal list:', error);
      throw error;
    }

    const newGoalLists = goalLists.filter(list => list.id !== id);
    setGoalLists(newGoalLists);
    localStorage.setItem(GOAL_LISTS_CACHE_KEY, JSON.stringify(newGoalLists));
  };

  const clearGoalLists = () => {
    setGoalLists([]);
    localStorage.removeItem(GOAL_LISTS_CACHE_KEY);
  };

  return (
    <GoalListContext.Provider value={{ goalLists, addGoalList, updateGoalList, deleteGoalList, clearGoalLists, updateGoalListOrder, setGoalLists }}>
      {children}
    </GoalListContext.Provider>
  );
};

export const useGoalLists = (): GoalListContextType => {
  const context = useContext(GoalListContext);
  if (!context) {
    throw new Error('useGoalLists must be used within a GoalListProvider');
  }
  return context;
};

export { type GoalList }; 