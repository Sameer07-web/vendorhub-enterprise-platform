import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

const RejectDialog = ({ isOpen, onClose, onConfirm, isSubmitting, title = "Reject Request" }) => {
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComments('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!comments.trim()) {
      setError('Comments are required when rejecting a request.');
      return;
    }
    onConfirm(comments);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={title}
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Rejecting...' : 'Reject'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to reject this purchase request? The creator will be notified.
        </p>
        
        <div>
          <label htmlFor="reject-comments" className="block text-sm font-medium text-slate-700 mb-1">
            Rejection Reason (Required) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reject-comments"
            rows={3}
            className={`block w-full rounded-md border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-orange-500'} px-3 py-2 text-sm focus:outline-none focus:ring-2`}
            placeholder="Please provide a reason for rejection..."
            value={comments}
            onChange={(e) => {
              setComments(e.target.value);
              if (error) setError('');
            }}
            disabled={isSubmitting}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default RejectDialog;
