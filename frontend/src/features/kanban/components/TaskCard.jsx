import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

const priorityColors = {
  Baixa: "bg-green-500/20 text-green-400",
  Média: "bg-yellow-500/20 text-yellow-400",
  Alta: "bg-red-500/20 text-red-400",
  Crítica: "bg-purple-500/20 text-purple-400",
};

const TaskCard = ({
  task,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick(task)}
      className={`
        bg-slate-800
        border
        border-slate-700
        rounded-lg
        p-4
        hover:border-blue-500
        hover:shadow-lg
        transition-all
        cursor-pointer
        ${
          isDragging
            ? "opacity-50 shadow-2xl border-blue-500"
            : ""
        }
      `}
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">

        <h3 className="font-semibold text-white">
          {task.title}
        </h3>

        <button
          type="button"
          {...listeners}
          {...attributes}
          className="
            text-slate-500
            hover:text-white
            cursor-grab
            active:cursor-grabbing
            p-1
          "
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} />
        </button>

      </div>

      {/* Descrição */}
      <p className="text-sm text-slate-400 mt-2">
        {task.description}
      </p>

      {/* Rodapé */}
      <div className="flex items-center justify-between mt-4">

        <span
          className={`
            text-xs
            px-2
            py-1
            rounded-full
            ${priorityColors[task.priority]}
          `}
        >
          {task.priority}
        </span>

        <span className="text-xs text-slate-500">
          {task.assignee}
        </span>

      </div>

    </div>
  );
};


export default TaskCard;
