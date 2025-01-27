import React from 'react';
import { Goal } from '../../context/GoalContext';
import { GoalList as GoalListType } from '../../context/GoalListContext';
import { Droppable } from '@hello-pangea/dnd';
import GoalList from './GoalList';

export type ListWithGoals = GoalListType & { goals: Goal[] };

export type ColumnData = {
  'column-1': ListWithGoals[];
  'column-2': ListWithGoals[];
};

export interface DraggableColumnsProps {
  columns: ColumnData;
}

const DraggableColumns: React.FC<DraggableColumnsProps> = ({ columns }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:mx-12">
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