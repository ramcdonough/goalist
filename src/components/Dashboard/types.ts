import { Goal } from "../../context/GoalContext";

export interface GoalItemProps {
  goal: Goal;
  handleCheckboxChange: (goalId: string, isChecked: boolean) => void;
  variant?: 'default' | 'focus';
}

export interface BaseGoalListProps {
  id: string;
  title: string;
  goals: Goal[];
  index?: number;
  isDraggable?: boolean;
  allowGoalReordering?: boolean;
  onTitleUpdate?: (newTitle: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onAddGoal?: (title: string) => Promise<void>;
  variant?: 'default' | 'focus';
  titleComponent?: React.ReactNode;
  handleCheckboxChange: (goalId: string, isChecked: boolean) => void;
} 