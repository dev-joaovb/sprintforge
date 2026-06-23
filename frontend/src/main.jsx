import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { AgileProvider } from "./context/AgileContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgileProvider>
      <App />
    </AgileProvider>
  </StrictMode>
);