import { useState } from "react";
import Modal from "./Modal";
import FormInput from "./FormInput";
import AlertBanner from "./AlertBanner";

const CreateRoomDialog = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Room name must be at least 2 characters");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(name.trim());
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create a Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AlertBanner message={error} />

        <FormInput
          id="room-name"
          name="roomName"
          label="Room name"
          placeholder="e.g. Sprint Planning Board"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoomDialog;
