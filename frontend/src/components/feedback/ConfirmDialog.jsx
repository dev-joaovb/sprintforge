const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/60
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          bg-slate-900
          border
          border-slate-700
          rounded-xl
          p-6
          w-full
          max-w-md
        "
      >
        <h2 className="text-xl font-bold mb-3">
          {title}
        </h2>

        <p className="text-slate-300 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="
              px-4
              py-2
              rounded-lg
              bg-slate-700
              hover:bg-slate-600
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4
              py-2
              rounded-lg
              bg-red-600
              hover:bg-red-700
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;