import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { AgileProvider } from "./context/AgileContext";
import { KanbanProvider } from "./context/KanbanContext";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgileProvider>
      <KanbanProvider>
        <App />
      </KanbanProvider>
    </AgileProvider>
  </StrictMode>
);