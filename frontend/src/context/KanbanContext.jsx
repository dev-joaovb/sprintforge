import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import initialTasks from "../features/kanban/data/initialTasks";

const STORAGE_KEY = "kanbanTasks";

const KanbanContext = createContext();

export const KanbanProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks =
      localStorage.getItem(STORAGE_KEY);

    return savedTasks
      ? JSON.parse(savedTasks)
      : initialTasks;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tasks)
    );
  }, [tasks]);

  const totalTasks = tasks.length;

    const backlogTasks = tasks.filter(
    (task) => task.status === "backlog"
    ).length;

    const todoTasks = tasks.filter(
    (task) => task.status === "todo"
    ).length;

    const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
    ).length;

    const reviewTasks = tasks.filter(
    (task) => task.status === "review"
    ).length;

    const doneTasks = tasks.filter(
    (task) => task.status === "done"
    ).length;

    const criticalTasks = tasks.filter(
    (task) => task.priority === "Crítica"
    ).length;

  return (
    <KanbanContext.Provider
      value={{
        tasks,
        setTasks,

        totalTasks,

        backlogTasks,
        todoTasks,
        inProgressTasks,
        reviewTasks,
        doneTasks,

        criticalTasks,
     }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  return useContext(KanbanContext);
};