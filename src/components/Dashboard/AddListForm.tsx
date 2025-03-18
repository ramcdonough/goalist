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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding list:', err);
      onError(err instanceof Error ? err.message : 'Failed to add goal list');
    }
  };

  const openModal = () => {
    setNewListTitle('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="relative h-12 px-5 bg-white dark:bg-gray-800 text-primary-dark dark:text-primary-light font-medium rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]"
      >
        <span className="flex items-center justify-center bg-primary-light dark:bg-primary-dark rounded-full w-5 h-5">
          <Plus size={14} strokeWidth={3} className="text-white" />
        </span>
        <span className="whitespace-nowrap">Add List</span>
      </button>

      {/* Add List Modal */}
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-surface-light dark:bg-surface text-text-light dark:text-text-dark rounded-lg shadow-lg max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">New List</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            
            <div className="form-control w-full mb-6">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newListTitle.trim() !== '') {
                    handleAddList();
                  }
                }}
                placeholder="Enter list name..."
                className="input border-none bg-black/5 dark:bg-white/10 text-text-light dark:text-text-dark w-full focus:outline-none"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-ghost"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                className="btn bg-primary-light dark:bg-primary-dark text-white border-none hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 disabled:opacity-50"
                onClick={handleAddList}
                disabled={newListTitle.trim() === ''}
              >
                Create
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
};

export default AddListForm; 