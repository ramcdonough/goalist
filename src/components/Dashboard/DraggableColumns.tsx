import React, { useState } from 'react';
import { Goal } from '../../context/GoalContext';
import { GoalList as GoalListType } from '../../context/GoalListContext';
import GoalList from './GoalList/GoalList';
import { useUserSettings } from '../../context/UserContext';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  rectIntersection,
  DragOverEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  useSortable,
} from '@dnd-kit/sortable';
import { 
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

export type ListWithGoals = GoalListType & { goals: Goal[] };

export type ColumnData = {
  [key: string]: ListWithGoals[];
};

export interface DraggableColumnsProps {
  columns: ColumnData;
  onListReorder?: (columnId: string, newOrder: ListWithGoals[]) => void;
  onListMove?: (listId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  onGoalReorder?: (listId: string, newOrder: Goal[]) => void;
}

// Simple sortable list wrapper
const SortableList: React.FC<{
  list: ListWithGoals;
  onGoalReorder?: (listId: string, newOrder: Goal[]) => void;
}> = ({ list, onGoalReorder }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'z-50' : ''}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GoalList
          goalListId={list.id}
          title={list.title}
          goals={list.goals}
          index={list.order || 0}
          onGoalReorder={(newOrder) => onGoalReorder?.(list.id, newOrder)}
        />
      </div>
    </div>
  );
};

// Droppable column wrapper
const DroppableColumn: React.FC<{
  columnId: string;
  lists: ListWithGoals[];
  onGoalReorder?: (listId: string, newOrder: Goal[]) => void;
}> = ({ columnId, lists, onGoalReorder }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-4 min-h-[200px] rounded-lg transition-colors ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600' : ''
      }`}
    >
      <SortableContext
        items={lists.map(list => list.id)}
        strategy={verticalListSortingStrategy}
      >
        {lists.map((list) => (
          <SortableList
            key={list.id}
            list={list}
            onGoalReorder={onGoalReorder}
          />
        ))}
      </SortableContext>
    </div>
  );
};

const DraggableColumns: React.FC<DraggableColumnsProps> = ({ 
  columns, 
  onListReorder,
  onListMove,
  onGoalReorder
}) => {
  const { columnPreference } = useUserSettings();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } 
    })
  );

  const allLists = Object.values(columns).flat();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      // Check if we're over a column droppable zone
      if (over.id.toString().startsWith('column-')) {
        const columnId = over.id.toString().replace('column-', '');
        setOverColumnId(columnId);
      } else {
        // We're over a list, find which column it's in
        const columnId = Object.keys(columns).find(colId => 
          columns[colId].some(list => list.id === over.id)
        );
        setOverColumnId(columnId || null);
      }
    } else {
      setOverColumnId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    
    if (!over || active.id === over.id) return;

    // Find source column
    const fromColumnId = Object.keys(columns).find(colId => 
      columns[colId].some(list => list.id === active.id)
    );

    if (!fromColumnId) return;

    let toColumnId: string;
    let toIndex: number;

    // Check if we're dropping on a column droppable zone
    if (over.id.toString().startsWith('column-')) {
      toColumnId = over.id.toString().replace('column-', '');
      toIndex = columns[toColumnId].length; // Add to end of column
    } else {
      // We're dropping on a list
      toColumnId = Object.keys(columns).find(colId => 
        columns[colId].some(list => list.id === over.id)
      ) || fromColumnId;
      
      toIndex = columns[toColumnId].findIndex(list => list.id === over.id);
    }

    if (!toColumnId || toIndex === -1) return;

    const fromIndex = columns[fromColumnId].findIndex(list => list.id === active.id);

    if (fromIndex === -1) return;

    if (fromColumnId === toColumnId && onListReorder) {
      // Same column reorder
      const newOrder = arrayMove(columns[fromColumnId], fromIndex, toIndex);
      onListReorder(fromColumnId, newOrder);
    } else if (onListMove) {
      // Cross-column move
      onListMove(active.id as string, fromColumnId, toColumnId, toIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`grid grid-cols-1 ${columnPreference === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        {Object.keys(columns).map((columnId) => (
          <DroppableColumn
            key={columnId}
            columnId={columnId}
            lists={columns[columnId]}
            onGoalReorder={onGoalReorder}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeId && (
          <div className="opacity-80">
            <GoalList
              goalListId={activeId}
              title={allLists.find(l => l.id === activeId)?.title || ''}
              goals={allLists.find(l => l.id === activeId)?.goals || []}
              index={0}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableColumns; 