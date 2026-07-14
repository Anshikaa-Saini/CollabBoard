import { useEffect, useState } from "react";
import Modal from "./Modal";
import FormInput from "./FormInput";
import AlertBanner from "./AlertBanner";

const RenameRoomDialog = ({ open, room, onClose, onRename }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && room) setName(room.name);
  }, [open, room]);

  const handleClose = () => {
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
      await onRename(room._id, name.trim());
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to rename room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Rename Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AlertBanner message={error} />

        <FormInput
          id="rename-room-name"
          name="roomName"
          label="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameRoomDialog;
