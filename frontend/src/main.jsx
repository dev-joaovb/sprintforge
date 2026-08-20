// main principal para renderizar a aplicação React, incluindo os provedores de contexto para Agile, Kanban, Scrum e Toast. Ele importa os estilos globais e o componente principal App, garantindo que todos os componentes da aplicação tenham acesso aos estados compartilhados através dos contextos.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { AgileProvider } from "./context/AgileContext"; // Importando o provedor de contexto do Agile
import { KanbanProvider } from "./context/KanbanContext"; // Importando o provedor de contexto do Kanban
import { ToastProvider } from "./context/ToastContext"; // Importando o provedor de contexto do Toast
import { ScrumProvider } from "./context/ScrumContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgileProvider>
      <KanbanProvider>
        <ScrumProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ScrumProvider>
      </KanbanProvider>
    </AgileProvider>
  </StrictMode>
);