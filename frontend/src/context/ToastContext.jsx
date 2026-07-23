// Contexto para gerenciar notificações do tipo Toast

import { createContext, useContext, useState } from "react";

import ToastContainer from "../components/feedback/ToastContainer";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (
    message,
    type = "success"
  ) => {
    const id = Date.now();

    setToasts((previous) => [
      ...previous,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((previous) =>
        previous.filter(
          (toast) => toast.id !== id
        )
      );
    }, 3000);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast deve ser utilizado dentro de um ToastProvider."
    );
  }

  return context;
};