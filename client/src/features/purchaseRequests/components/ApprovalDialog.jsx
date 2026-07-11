import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

const ApprovalDialog = ({ isOpen, onClose, onConfirm, isSubmitting, title = "Approve Request" }) => {
  const [comments, setComments] = useState('');

  const handleConfirm = () => {
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
          <Button variant="primary" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Approving...' : 'Approve'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to approve this purchase request? This action cannot be undone.
        </p>
        
        <div>
          <label htmlFor="approve-comments" className="block text-sm font-medium text-slate-700 mb-1">
            Comments (Optional)
          </label>
          <textarea
            id="approve-comments"
            rows={3}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add any approval notes here..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalDialog;
