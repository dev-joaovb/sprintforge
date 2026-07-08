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

  return (
    <KanbanContext.Provider
      value={{
        tasks,
        setTasks,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  return useContext(KanbanContext);
};