import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Textarea from '../../../components/common/Textarea';

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
        <p className="text-sm text-surface-600">
          Are you sure you want to reject this purchase request? The creator will be notified.
        </p>
        
        <Textarea
          id="reject-comments"
          label="Rejection Reason"
          required
          rows={3}
          placeholder="Please provide a reason for rejection..."
          value={comments}
          onChange={(e) => {
            setComments(e.target.value);
            if (error) setError('');
          }}
          disabled={isSubmitting}
          error={error}
        />
      </div>
    </Modal>
  );
};

export default RejectDialog;
