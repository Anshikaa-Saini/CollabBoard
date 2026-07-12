import { useState } from "react";
import Modal from "./Modal";
import FormInput from "./FormInput";
import AlertBanner from "./AlertBanner";

const JoinRoomDialog = ({ open, onClose, onJoin }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setCode("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim() || code.trim().length !== 6) {
      setError("Enter a valid 6-character room code");
      return;
    }

    setSubmitting(true);
    try {
      await onJoin(code.trim().toUpperCase());
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room. Please check the code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Join a Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AlertBanner message={error} />

        <FormInput
          id="room-code"
          name="roomCode"
          label="Room code"
          placeholder="e.g. 7XQK2P"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          autoFocus
        />

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Joining..." : "Join Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinRoomDialog;
