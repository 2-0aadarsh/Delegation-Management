import Modal from "./Modal";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Please confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
}) => {
  const confirmClass =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white"
      : "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-5">{message}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 min-h-11 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 min-h-11 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${confirmClass}`}
        >
          {loading ? "Please wait..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
