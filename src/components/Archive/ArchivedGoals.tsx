import React, { useState, useMemo } from 'react';
import { Goal, useGoals } from '../../context/GoalContext';
import { useGoalLists } from '../../context/GoalListContext';
import { format } from 'date-fns';
import { Archive, RotateCcw, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const ArchivedGoals: React.FC = () => {
  const { goals, unarchiveGoal } = useGoals();
  const { goalLists } = useGoalLists();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get only archived goals
  const archivedGoals = goals.filter(goal => goal.archivedAt);
  
  // Filter by search term if exists
  const filteredGoals = useMemo(() => {
    if (!searchTerm) return archivedGoals;
    return archivedGoals.filter(goal => 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [archivedGoals, searchTerm]);

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveGoal(id);
    } catch (error) {
      console.error('Error unarchiving goal:', error);
    }
  };

  const toggleModal = () => {
    if (!isModalOpen) {
      // Reset pagination and search when opening
      setCurrentPage(1);
      setSearchTerm('');
    }
    setIsModalOpen(!isModalOpen);
  };

  // Group archived goals by list
  const goalsByList = filteredGoals.reduce((acc, goal) => {
    const listId = goal.goalListId;
    if (!acc[listId]) {
      acc[listId] = [];
    }
    acc[listId].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Get list titles for each group
  const listsWithGoals = Object.entries(goalsByList).map(([listId, goals]) => {
    const list = goalLists.find(l => l.id === listId);
    return {
      listId,
      listTitle: list ? list.title : 'Unknown List',
      goals
    };
  });
  
  // Pagination
  const totalPages = Math.max(1, Math.ceil(listsWithGoals.length / ITEMS_PER_PAGE));
  const paginatedLists = listsWithGoals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (archivedGoals.length === 0) {
    return (
      <button 
        className="fixed bottom-4 right-4 p-2 bg-primary-light dark:bg-primary-dark text-white rounded-full shadow-lg z-10 flex items-center justify-center"
        onClick={toggleModal}
        title="Archived Goals"
      >
        <Archive size={24} />
      </button>
    );
  }

  return (
    <>
      {/* Archived Button */}
      <button 
        className="fixed bottom-4 right-4 p-2 bg-primary-light dark:bg-primary-dark text-white rounded-full shadow-lg z-10 flex items-center justify-center"
        onClick={toggleModal}
        title="Archived Goals"
      >
        <Archive size={24} />
      </button>

      {/* Archive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark flex items-center">
                <Archive className="mr-2" size={20} /> Archived Goals
              </h2>
              <button 
                onClick={toggleModal}
                className="text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search */}
            <div className="mb-4 relative">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search archived goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            
            {paginatedLists.length === 0 ? (
              <p className="text-text-light dark:text-text-dark">No archived goals found.</p>
            ) : (
              <div className="space-y-2">
                {paginatedLists.map(({ listId, listTitle, goals }) => (
                  <div key={listId} className="border-b dark:border-gray-700 pb-2">
                    <h3 className="font-semibold text-text-light dark:text-text-dark mb-1 text-sm">{listTitle}</h3>
                    <ul className="space-y-1">
                      {goals.map(goal => (
                        <li 
                          key={goal.id} 
                          className="flex items-center justify-between bg-background-light dark:bg-background-dark p-1.5 rounded-md text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-text-light/70 dark:text-text-dark/70">
                              <span className="line-through">{goal.title}</span>
                            </div>
                            <div className="text-xs text-text-light/50 dark:text-text-dark/50 flex flex-wrap gap-x-2">
                              <span>Completed: {goal.completedAt && format(new Date(goal.completedAt), 'MMM d')}</span>
                              <span>Archived: {goal.archivedAt && format(new Date(goal.archivedAt), 'MMM d')}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnarchive(goal.id)}
                            className="p-1 text-primary-light dark:text-primary-dark hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full ml-2 flex-shrink-0"
                            title="Unarchive"
                          >
                            <RotateCcw size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-text-light dark:text-text-dark"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-2 py-1 text-sm text-text-light dark:text-text-dark">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-text-light dark:text-text-dark"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ArchivedGoals;
