import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { AgileProvider } from "./context/AgileContext"; // Importando o provedor de contexto do Agile
import { KanbanProvider } from "./context/KanbanContext"; // Importando o provedor de contexto do Kanban
import { ToastProvider } from "./context/ToastContext"; // Importando o provedor de contexto do Toast

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgileProvider>
      <KanbanProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </KanbanProvider>
    </AgileProvider>
  </StrictMode>
);