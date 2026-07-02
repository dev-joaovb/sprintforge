import { useState } from "react";

import { DndContext } from "@dnd-kit/core";

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
  const [tasks, setTasks] = useState(initialTasks);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const handleSaveTask = (taskData) => {
    if (taskData.id) {
      // Editar
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskData.id
            ? {
                ...task,
                ...taskData,
              }
            : task
        )
      );
    } else {
      // Criar
      setTasks((previousTasks) => [
        ...previousTasks,
        {
          id: Date.now(),
          status: "backlog",
          ...taskData,
        },
      ]);
    }

    setSelectedTask(null);
    setModalOpen(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task.id !== taskId
      )
    );

    setSelectedTask(null);
    setModalOpen(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );
  };

  const handleEditTask = (task) => {
    console.log("Clique na tarefa:", task);


    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

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
          onClick={handleNewTask}
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

      <DndContext onDragEnd={handleDragEnd}>
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
              id={column.id}
              title={column.title}
              tasks={tasks.filter(
                (task) =>
                  task.status === column.id
              )}
              onTaskClick={handleEditTask}
            />
          ))}
        </div>
      </DndContext>

      <TaskModal
        open={modalOpen}
        task={selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setModalOpen(false);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </>
  );
};

export default Board;