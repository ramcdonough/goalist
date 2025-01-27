import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGoalLists } from '../../context/GoalListContext';

interface AddListFormProps {
  onError: (error: string) => void;
  columns: {
    'column-1': any[];
    'column-2': any[];
  };
}

const AddListForm: React.FC<AddListFormProps> = ({ onError, columns }) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [isInputVisible, setInputVisible] = useState(false);
  const { addGoalList } = useGoalLists();

  const handleAddList = async () => {
    if (newListTitle.trim() === '') return;
    
    try {
      const columnNumber = columns['column-1'].length <= columns['column-2'].length ? 1 : 2;
      await addGoalList({ title: newListTitle, column_number: columnNumber });
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
          className="input input-bordered flex-1 max-w-xs"
        />
      )}
      <button
        onClick={() => setInputVisible(!isInputVisible)}
        className="btn bg-primary-light dark:bg-primary-dark text-white border-none rounded-full"
      >
        <Plus size={20} strokeWidth={3}/>
      </button>
    </div>
  );
};

export default AddListForm; 