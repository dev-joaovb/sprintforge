import { createContext, useContext, useState } from "react";

const AgileContext = createContext();

export const AgileProvider = ({ children }) => {
  const [agileData, setAgileData] = useState({
    recommendedMethodology: null,

    maturity: {
      level: null,
      percentage: 0,
    },

    strongest: null,

    weakest: null,

    recommendations: [],
  });

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