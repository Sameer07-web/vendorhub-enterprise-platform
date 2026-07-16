import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  variant = 'danger',
  isLoading = false 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title={title}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-surface-600 leading-relaxed">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
