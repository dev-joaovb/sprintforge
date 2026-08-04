import { useEffect, useState } from "react";

const StoryModal = ({
  open,
  onClose,
  onSave,
  onDelete,
  story = null,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState("Média");
  const [storyPoints, setStoryPoints] =
    useState(3);
  const [assignee, setAssignee] =
    useState("");

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description);
      setPriority(story.priority);
      setStoryPoints(story.storyPoints);
      setAssignee(story.assignee);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Média");
      setStoryPoints(3);
      setAssignee("");
    }
  }, [story, open]);

  if (!open) return null;

  const handleSave = () => {
  if (!title.trim()) return;

  onSave({
    ...(story && { id: story.id }),
    title,
    description,
    priority,
    storyPoints: Number(storyPoints),
    assignee,
  });
};

const handleDelete = () => {
  if (!story || !onDelete) return;

  onClose();

  onDelete(story);
};

    return (
    <div
        className="
        fixed
        inset-0
        bg-black/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
        "
    >
        <div
        className="
            bg-slate-900
            rounded-xl
            border
            border-slate-700
            w-full
            max-w-xl
            p-6
            shadow-2xl
        "
        >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
            {story
                ? "Editar User Story"
                : "Nova User Story"}
            </h2>

            <button
            onClick={onClose}
            className="
                text-slate-400
                hover:text-white
                text-xl
            "
            >
            ✕
            </button>

        </div>

        {/* Formulário */}

        <div className="space-y-5">

            {/* Título */}
            <div>
                <label className="block mb-2">
                Título
                </label>

                <input
                type="text"
                value={title}
                onChange={(e) =>
                    setTitle(e.target.value)
                }
                className="
                    w-full
                    bg-slate-800
                    rounded-lg
                    p-3
                    outline-none
                "
                />
            </div>

            {/* Descrição */}
            <div>
                <label className="block mb-2">
                Descrição
                </label>

                <textarea
                rows="4"
                value={description}
                onChange={(e) =>
                    setDescription(e.target.value)
                }
                className="
                    w-full
                    bg-slate-800
                    rounded-lg
                    p-3
                    outline-none
                "
                />
            </div>

            {/* Prioridade | Story Points */}
            <div className="grid grid-cols-2 gap-4">

                <div>
                <label className="block mb-2">
                    Prioridade
                </label>

                <select
                    value={priority}
                    onChange={(e) =>
                    setPriority(e.target.value)
                    }
                    className="
                    w-full
                    bg-slate-800
                    rounded-lg
                    p-3
                    "
                >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                </select>
                </div>

                <div>
                <label className="block mb-2">
                    Story Points
                </label>

                <select
                    value={storyPoints}
                    onChange={(e) =>
                    setStoryPoints(Number(e.target.value))
                    }
                    className="
                    w-full
                    bg-slate-800
                    rounded-lg
                    p-3
                    "
                >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={13}>13</option>
                    <option value={21}>21</option>
                </select>
                </div>

            </div>

            {/* Responsável */}
            <div>
                <label className="block mb-2">
                Responsável
                </label>

                <input
                type="text"
                value={assignee}
                onChange={(e) =>
                    setAssignee(e.target.value)
                }
                className="
                    w-full
                    bg-slate-800
                    rounded-lg
                    p-3
                "
                />
            </div>

        </div>

        {/* Rodapé */}
        <div className="flex justify-between items-center mt-8">

            <div>
                {story && (
                <button
                    onClick={handleDelete}
                    className="
                    px-5
                    py-2
                    rounded-lg
                    bg-red-600
                    hover:bg-red-700
                    transition
                    "
                >
                    Excluir
                </button>
                )}
            </div>

            <div className="flex gap-3">

                <button
                onClick={onClose}
                className="
                    px-5
                    py-2
                    rounded-lg
                    bg-slate-700
                "
                >
                Cancelar
                </button>

                <button
                onClick={handleSave}
                className="
                    px-5
                    py-2
                    rounded-lg
                    bg-blue-600
                    hover:bg-blue-700
                "
                >
                {story
                    ? "Salvar Alterações"
                    : "Salvar"}
                </button>

            </div>

        </div>

        </div>
    </div>
    );

};

export default StoryModal;