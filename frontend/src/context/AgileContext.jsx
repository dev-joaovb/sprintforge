import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AgileContext = createContext();

const STORAGE_KEY = "sprintforge-agile-data";

const defaultAgileData = {
  recommendedMethodology: null,

  maturity: {
    level: null,
    percentage: 0,
  },

  strongest: null,

  weakest: null,

  recommendations: [],
};

export const AgileProvider = ({ children }) => {
  const [agileData, setAgileData] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error(
          "Erro ao carregar dados do SprintForge:",
          error
        );

        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return defaultAgileData;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(agileData)
    );
  }, [agileData]);

  return (
    <AgileContext.Provider
      value={{
        agileData,
        setAgileData,
      }}
    >
      {children}
    </AgileContext.Provider>
  );
};

export const useAgile = () => {
  return useContext(AgileContext);
};