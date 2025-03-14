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
  
  // State for alert messages
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);

  // Store original values
  const [originalValues, setOriginalValues] = useState({
    title: goal.title,
    description: goal.description || '',
    dueDate: goal.dueDate || '',
    repeatFrequency: goal.repeatFrequency || null,
    carryOver: goal.carryOver,
  });

  const titleRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGoal(goal.id, { title, description, dueDate, repeatFrequency, carryOver });
      setAlertMessage('Saved!');
      setAlertType('success');
      // Update original values after successful save
      setOriginalValues({ title, description, dueDate, repeatFrequency, carryOver });
    } catch (error) {
      console.error('Error updating goal:', error);
      setAlertMessage('Save Failed!');
      setAlertType('error');
    }
  };

  const clearAlertMessage = () => {
    setAlertMessage('');
    setAlertType(null);
  };

  return (
    <dialog id={`goal-modal-${goal.id}`} className="modal cursor-default">
      <div className="modal-box px-0 py-4 md:px-4 text-left max-w-5xl max-h-[95vh] min-h-[90vh] md:border border-gray-700 bg-surface-light dark:bg-surface-dark overflow-hidden flex flex-col">
        {alertMessage && (
          <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'} mb-4 alert-sm max-w-lg w-2/3 mx-auto max-h-10 flex items-center justify-center border text-white`}>
            {alertMessage}
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
              <TextEditor 
                initialContent={description}
                onChange={setDescription}
                height={"800px"}
              />
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
                <button type="submit" className="btn bg-primary-light dark:bg-primary-dark border-none text-white">Save</button>
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