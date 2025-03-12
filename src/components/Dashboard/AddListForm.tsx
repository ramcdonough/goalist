import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGoalLists } from '../../context/GoalListContext';
import { useUserSettings } from '../../context/UserContext';
import { ColumnData } from './DraggableColumns';

interface AddListFormProps {
  onError: (error: string) => void;
  columns: ColumnData;
}

const AddListForm: React.FC<AddListFormProps> = ({ onError, columns }) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [isInputVisible, setInputVisible] = useState(false);
  const { addGoalList } = useGoalLists();
  const { columnPreference } = useUserSettings();

  const handleAddList = async () => {
    if (newListTitle.trim() === '') return;
    
    try {
      // Find the column with the least number of lists
      let minColumn = 1;
      let minCount = columns['column-1']?.length || 0;

      for (let i = 2; i <= columnPreference; i++) {
        const count = columns[`column-${i}`]?.length || 0;
        if (count < minCount) {
          minCount = count;
          minColumn = i;
        }
      }

      await addGoalList({ title: newListTitle, column_number: minColumn });
      setNewListTitle('');
      setInputVisible(false);
    } catch (err) {
      console.error('Error adding list:', err);
      onError(err instanceof Error ? err.message : 'Failed to add goal list');
    }
  };

  return (
    <div className="flex justify-end gap-2 md:ml-12">
      {isInputVisible && (
        <input
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newListTitle.trim() !== '') {
              handleAddList();
            }
          }}
          placeholder="Add new list..."
          className="input input-bordered bg-surface-light dark:bg-surface text-text-light dark:text-text-dark flex-1 max-w-xs focus:outline-none"
        />
      )}
      <button
        onClick={() => setInputVisible(!isInputVisible)}
        className="btn bg-primary-light dark:bg-primary-dark text-white border-none hover:bg-primary dark:hover:bg-primary-dark/80"
      >
        <Plus size={15} strokeWidth={3}/> Add List
      </button>
    </div>
  );
};

export default AddListForm; 