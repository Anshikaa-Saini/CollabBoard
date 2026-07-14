import { useState } from "react";
import Modal from "./Modal";
import AlertBanner from "./AlertBanner";

const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirm", onClose, onConfirm }) => {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);
    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="flex flex-col gap-4">
        <AlertBanner message={error} />
        <p className="text-sm text-gray-600">{message}</p>
        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary bg-red-600 hover:bg-red-700"
            disabled={submitting}
          >
            {submitting ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
