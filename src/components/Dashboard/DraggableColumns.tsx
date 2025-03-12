import React from 'react';
import { Goal } from '../../context/GoalContext';
import { GoalList as GoalListType } from '../../context/GoalListContext';
import { Droppable } from '@hello-pangea/dnd';
import GoalList from './GoalList';
import { useUserSettings } from '../../context/UserContext';

export type ListWithGoals = GoalListType & { goals: Goal[] };

export type ColumnData = {
  [key: `column-${number}`]: ListWithGoals[];
};

export interface DraggableColumnsProps {
  columns: ColumnData;
}

const DraggableColumns: React.FC<DraggableColumnsProps> = ({ columns }) => {
  const { columnPreference } = useUserSettings();

  return (
    <div className={`grid grid-cols-1 ${columnPreference === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
      {Object.entries(columns).map(([columnId, lists]) => (
        <Droppable key={columnId} droppableId={columnId} type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-4"
            >
              {lists.map((list, index) => (
                <GoalList
                  key={list.id}
                  goalListId={list.id}
                  title={list.title}
                  goals={list.goals}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
};

export default DraggableColumns; 