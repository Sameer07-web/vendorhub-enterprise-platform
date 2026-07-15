import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Textarea from '../../../components/common/Textarea';

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
        <p className="text-sm text-surface-600">
          Are you sure you want to approve this purchase request? This action cannot be undone.
        </p>
        
        <Textarea
          id="approve-comments"
          label="Comments (Optional)"
          rows={3}
          placeholder="Add any approval notes here..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default ApprovalDialog;
