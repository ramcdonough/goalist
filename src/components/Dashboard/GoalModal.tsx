import { Goal } from "../../context/GoalContext";
import { useGoals } from "../../context/GoalContext";
import { useState, useEffect, useRef } from "react";
import TextEditor from "./TextEditor";

const GoalModal = ({ goal }: { goal: Goal }) => {
  const { updateGoal } = useGoals();
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || '');
  const [dueDate, setDueDate] = useState(goal.dueDate || '');
  const [repeatFrequency, setRepeatFrequency] = useState(goal.repeatFrequency || null);
  const [carryOver, setCarryOver] = useState(goal.carryOver);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  // State for alert messages
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  // Store original values
  const [originalValues, setOriginalValues] = useState({
    title: goal.title,
    description: goal.description || '',
    dueDate: goal.dueDate || '',
    repeatFrequency: goal.repeatFrequency || null,
    carryOver: goal.carryOver,
  });

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const notesDisplayRef = useRef<HTMLDivElement>(null);

  // Function to adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    // Reset height to get the correct scrollHeight
    textarea.style.height = '0px';
    // Set to scrollHeight to fit content exactly
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Initialize textarea height on mount and when title changes
  useEffect(() => {
    if (titleRef.current) {
      adjustTextareaHeight(titleRef.current);
    }
  }, [title, titleRef]);

  // Also adjust on window resize
  useEffect(() => {
    const handleResize = () => {
      if (titleRef.current) {
        adjustTextareaHeight(titleRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When entering edit mode, focus the title field
  useEffect(() => {
    // Focus the title field when the modal is opened
    const handleModalOpen = () => {
      if (titleRef.current) {
        titleRef.current.focus();
      }
    };
    
    const modal = document.getElementById(`goal-modal-${goal.id}`);
    if (modal) {
      modal.addEventListener('show', handleModalOpen);
      return () => modal.removeEventListener('show', handleModalOpen);
    }
  }, [goal.id]);

  // Reset form when modal is closed
  useEffect(() => {
    const handleModalClose = () => {
      // Reset all form fields to their original values
      setTitle(originalValues.title);
      setDescription(originalValues.description);
      setDueDate(originalValues.dueDate);
      setRepeatFrequency(originalValues.repeatFrequency);
      setCarryOver(originalValues.carryOver);
      // Also reset edit mode
      setIsEditingNotes(false);
    };
    
    const modal = document.getElementById(`goal-modal-${goal.id}`) as HTMLDialogElement;
    if (modal) {
      modal.addEventListener('close', handleModalClose);
      return () => modal.removeEventListener('close', handleModalClose);
    }
  }, [goal.id, originalValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGoal(goal.id, { title, description, dueDate, repeatFrequency, carryOver });
      setAlertMessage('Saved!');
      setAlertType('success');
      setAlertVisible(true);
      // Update original values after successful save
      setOriginalValues({ title, description, dueDate, repeatFrequency, carryOver });
      // Exit edit mode after saving
      setIsEditingNotes(false);
      
      // Auto-dismiss the alert after 2 seconds
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      alertTimeoutRef.current = setTimeout(() => {
        setAlertVisible(false);
        // Remove message after fade out animation completes
        setTimeout(() => {
          setAlertMessage('');
          setAlertType(null);
        }, 300);
      }, 2000);
    } catch (error) {
      console.error('Error updating goal:', error);
      setAlertMessage('Save Failed!');
      setAlertType('error');
      setAlertVisible(true);
      
      // Auto-dismiss the error alert after 3 seconds
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      alertTimeoutRef.current = setTimeout(() => {
        setAlertVisible(false);
        // Remove message after fade out animation completes
        setTimeout(() => {
          setAlertMessage('');
          setAlertType(null);
        }, 300);
      }, 3000);
    }
  };

  const clearAlertMessage = () => {
    setAlertVisible(false);
    // Remove message after fade out animation completes
    setTimeout(() => {
      setAlertMessage('');
      setAlertType(null);
    }, 300);
    
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
  };

  // Set alert visible when alertMessage changes
  useEffect(() => {
    if (alertMessage) {
      setAlertVisible(true);
    }
  }, [alertMessage]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const handleNotesClick = (e: React.MouseEvent) => {
    // Check if the click was on a link
    const target = e.target as HTMLElement;
    const isLink = target.tagName === 'A' || target.closest('a');
    
    // Only enter edit mode if not clicking on a link
    if (!isLink) {
      setIsEditingNotes(true);
    }
  };

  // Function to handle link clicks in display mode
  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.tagName === 'A' ? target : target.closest('a');
    
    if (link) {
      e.stopPropagation(); // Prevent entering edit mode
      // Let the default link behavior happen
    }
  };

  return (
    <dialog id={`goal-modal-${goal.id}`} className="modal cursor-default">
      <div className="modal-box px-0 py-4 md:px-4 text-left max-w-5xl max-h-[95vh] min-h-[90vh] md:border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark overflow-hidden flex flex-col">
        {alertMessage && (
          <div 
            className={`
              fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-md
              ${alertType === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} 
              px-4 py-2 rounded-md shadow-md border-l-4 flex items-center gap-2 
              transition-all duration-300 ease-in-out
              ${alertVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
            `}
          >
            {alertType === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{alertMessage}</span>
          </div>
        )}
        <form method="dialog">
          <button className="btn btn-circle text-text-light dark:text-text-dark btn-ghost absolute right-2 top-2" onClick={() => clearAlertMessage()}>✕</button>
        </form>
        <form method="submit" onSubmit={handleSubmit} className="dark:text-text-dark text-text-light flex flex-col flex-grow h-full overflow-hidden">
          <div className="px-3 md:px-0 w-11/12">
            <textarea 
              ref={titleRef}
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              placeholder="Title" 
              rows={1}
              className="textarea w-full resize-none md:text-xl mb-2 font-bold border-none bg-transparent dark:focus:border-primary-dark focus:outline-primary-light leading-relaxed py-2 overflow-hidden" 
            />
          </div>
          <div className="md:px-5 overflow-hidden">
            <div className="rounded-lg">
              {isEditingNotes ? (
                <div className="relative">
                  <TextEditor 
                    initialContent={description}
                    onChange={setDescription}
                    height={"800px"}
                    autoFocus={true}
                  />
                  <button 
                    type="button"
                    onClick={() => setIsEditingNotes(false)} 
                    className="absolute top-2 right-2 btn btn-sm btn-circle bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark"
                    title="Exit edit mode"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div 
                  ref={notesDisplayRef}
                  onClick={handleNotesClick}
                  className="tiptap-display-wrapper prose prose-lg dark:prose-invert p-6 rounded-lg bg-surface-dark/10 dark:bg-surface-light/10 min-h-[200px] cursor-text hover:bg-surface-dark/15 dark:hover:bg-surface-light/15 transition-colors relative group max-w-none"
                  style={{ minHeight: "600px", maxHeight: "800px", overflowY: "auto" }}
                >
                  <button 
                    type="button"
                    onClick={() => setIsEditingNotes(true)} 
                    className="absolute top-2 right-2 btn btn-sm btn-circle bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit notes"
                  >
                    ✎
                  </button>
                  {description ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: description }} 
                      className="notes-content ProseMirror"
                      onClick={handleLinkClick}
                    />
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">
                      <span>Click to add notes...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky bottom-0 bg-surface-light dark:bg-surface-dark pt-2 pb-2 z-10 relative">
              {process.env.NODE_ENV === 'development' && (
                <div className="flex justify-between md:flex-row flex-col w-full md:w-3/4">
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="input md:w-1/3 border-none bg-transparent dark:focus:border-primary-dark focus:outline-primary-light input-primary" 
                  />
                  <select 
                    value={repeatFrequency || ''} 
                    onChange={(e) => setRepeatFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | null)} 
                    className="select md:w-1/3 text-lg bg-transparent"
                  >
                    <option value="">Select Repeat Frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <div className="flex justify-between md:items-center w-full md:w-1/3 md:text-center bg-transparent px-10">
                    <input
                      type="checkbox"
                      checked={carryOver} 
                      className="checkbox md:mr-2 md:ml-10" 
                      onChange={(e) => setCarryOver(e.target.checked)} 
                    />
                    <label className="checkbox-lg">Carry Over</label>
                  </div>
                </div>
              )}
              <div className="flex justify-end w-full md:w-1/4 mt-4 pr-4 md:mt-0 md:absolute md:bottom-2 md:right-5">
                {isEditingNotes && (
                  <button type="submit" className="btn bg-primary-light dark:bg-primary-dark border-none text-white">Save</button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={() => clearAlertMessage()}>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default GoalModal;