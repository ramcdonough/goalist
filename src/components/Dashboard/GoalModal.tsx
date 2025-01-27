import { Goal } from "../../context/GoalContext";
import { useGoals } from "../../context/GoalContext";
import { useState } from "react";
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
      <div className="modal-box px-0 py-4 md:px-4 text-left max-w-2xl md:border border-gray-700 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900/60 overflow-hidde min-h-screen md:min-h-fit">
        {alertMessage && (
          <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'} mb-4 alert-sm max-w-lg w-2/3 mx-auto max-h-10 flex items-center justify-center border text-white`}>
            {alertMessage}
          </div>
        )}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => clearAlertMessage()}>✕</button>
        </form>
        <form method="submit" onSubmit={handleSubmit} className="dark:text-text-dark text-text-light">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Title" 
            className="input md:text-xl mb-2 mx-3 md:mx-0 font-bold border-none bg-transparent dark:focus:border-primary-dark focus:outline-primary-light input-primary w-10/12 md:w-11/12" 
          />
          <div className="md:px-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg mb-4 max-h-[400px] md:max-h-[500px] overflow-y-auto">
              <TextEditor 
                initialContent={description}
                onChange={setDescription}
                height={"full"}
              />
            </div>
            <div className="flex justify-between md:flex-row flex-col">
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
          </div>
          <div className="flex justify-end mt-5 md:mr-0 mr-5">
            <button type="submit" className="btn bg-primary-light dark:bg-primary-dark border-none text-white">Save</button>
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