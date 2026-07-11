import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

export const SendRFQDialog = ({ isOpen, onClose, onConfirm, isSubmitting, title = "Send RFQ" }) => (
  <Modal
    isOpen={isOpen}
    onClose={() => !isSubmitting && onClose()}
    title={title}
    actions={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send RFQ'}
        </Button>
      </>
    }
  >
    <p>Are you sure you want to send this RFQ to all selected vendors? This action will formally start the quotation process and cannot be reversed.</p>
  </Modal>
);

export const CloseRFQDialog = ({ isOpen, onClose, onConfirm, isSubmitting, title = "Close RFQ" }) => (
  <Modal
    isOpen={isOpen}
    onClose={() => !isSubmitting && onClose()}
    title={title}
    actions={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 border-emerald-600 text-white">
          {isSubmitting ? 'Closing...' : 'Close RFQ'}
        </Button>
      </>
    }
  >
    <p>Are you sure you want to close this RFQ? Vendors will no longer be able to submit quotations. This action cannot be reversed.</p>
  </Modal>
);

export const CancelRFQDialog = ({ isOpen, onClose, onConfirm, isSubmitting, title = "Cancel RFQ" }) => (
  <Modal
    isOpen={isOpen}
    onClose={() => !isSubmitting && onClose()}
    title={title}
    actions={
      <>
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Keep Draft</Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Cancelling...' : 'Cancel RFQ'}
        </Button>
      </>
    }
  >
    <p>Are you sure you want to cancel this RFQ? This will mark it as cancelled and it can no longer be edited or sent. This action cannot be reversed.</p>
  </Modal>
);
