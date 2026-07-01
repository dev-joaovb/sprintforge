import { useState } from "react";

import initialTasks from "../data/initialTasks";

import Column from "./Column";
import TaskModal from "./TaskModal";

const columns = [
  {
    id: "backlog",
    title: "Backlog",
  },
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in-progress",
    title: "In Progress",
  },
  {
    id: "review",
    title: "Review",
  },
  {
    id: "done",
    title: "Done",
  },
];

const Board = () => {
  const [tasks] = useState(initialTasks);

  const [modalOpen, setModalOpen] =
    useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-2xl font-bold">
            Quadro Kanban
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Organize o fluxo de trabalho da equipe.
          </p>
        </div>

        <button
          onClick={() =>
            setModalOpen(true)
          }
          className="
            bg-blue-600
            hover:bg-blue-700
            transition
            px-5
            py-2
            rounded-lg
            font-medium
          "
        >
          + Nova Tarefa
        </button>

      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-5
          gap-6
        "
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            title={column.title}
            tasks={tasks.filter(
              (task) =>
                task.status === column.id
            )}
          />
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      />
    </>
  );
};

export default Board;