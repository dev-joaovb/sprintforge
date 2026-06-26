import ProjectForm from "./ProjectForm";

const ProjectModal = ({
  open,
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>

        </div>

        {/* Body */}
        <div className="p-6">

          <ProjectForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
          />

        </div>

      </div>

    </div>
  );
};

export default ProjectModal;