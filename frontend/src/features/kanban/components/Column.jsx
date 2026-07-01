import { useDroppable } from "@dnd-kit/core";

import TaskCard from "./TaskCard";

const Column = ({
  id,
  title,
  tasks,
}) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl
        border
        p-4
        min-h-[600px]
        flex
        flex-col
        transition-all

        ${
          isOver
            ? "bg-slate-800 border-blue-500"
            : "bg-slate-900 border-slate-800"
        }
      `}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <span
          className="
            bg-slate-800
            text-slate-300
            text-xs
            px-2
            py-1
            rounded-full
          "
        >
          {tasks.length}
        </span>

      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
          />
        ))}

        {tasks.length === 0 && (
          <div
            className="
              border-2
              border-dashed
              border-slate-700
              rounded-lg
              p-6
              text-center
              text-slate-500
              text-sm
            "
          >
            Nenhuma tarefa
          </div>
        )}

      </div>
    </div>
  );
};

export default Column;