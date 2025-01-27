import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  return (
    <>
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-surface-light dark:bg-surface text-text-light dark:text-text-dark min-h-fit">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
            </form>
            <p className="mb-4 mt-8">Are you sure you want to delete <span className="font-bold">{itemName}</span>?</p>
            <p className="mb-12">This action cannot be undone.</p>
            <div className="modal-action">
              <button className="btn border-none bg-red-500 text-white" onClick={onConfirm}>Yes, delete</button>
              <button className="btn border-none bg-primary-light dark:bg-primary-dark text-white" onClick={onClose}>Cancel</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      )}
    </>
  );
};

export default ConfirmationModal; 