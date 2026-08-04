import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import initialStories from "../features/scrum/data/initialStories";

const STORAGE_KEY = "scrumStories";

const ScrumContext = createContext();

export const ScrumProvider = ({ children }) => {
  const [stories, setStories] = useState(() => {
    const savedStories =
      localStorage.getItem(STORAGE_KEY);

    return savedStories
      ? JSON.parse(savedStories)
      : initialStories;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stories)
    );
  }, [stories]);

  const totalStories = stories.length;

  const backlogStories = stories.filter(
    (story) => story.status === "Backlog"
  ).length;

  const totalStoryPoints = stories.reduce(
    (total, story) => total + story.storyPoints,
    0
  );

  return (
    <ScrumContext.Provider
      value={{
        stories,
        setStories,

        totalStories,
        backlogStories,
        totalStoryPoints,
      }}
    >
      {children}
    </ScrumContext.Provider>
  );
};

export const useScrum = () => {
  return useContext(ScrumContext);
};