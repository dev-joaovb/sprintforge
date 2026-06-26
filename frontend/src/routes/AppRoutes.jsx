import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

import DashboardPage from "../features/dashboard/DashboardPage";
import ProjectListPage from "../features/projects/ProjectListPage";
import KanbanPage from "../features/kanban/KanbanPage";
import ScrumPage from "../features/scrum/ScrumPage";
import XPPage from "../features/xp/XPPage";
import AnalyticsPage from "../features/analytics/AnalyticsPage";
import AgileAssistantPage from "../features/agile-assistant/AgileAssistantPage";
import AgileMaturityPage from "../features/agile-maturity/AgileMaturityPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AppLayout />}>

          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/projects"
            element={<ProjectListPage />}
          />

          <Route
            path="/kanban"
            element={<KanbanPage />}
          />

          <Route
            path="/scrum"
            element={<ScrumPage />}
          />

          <Route
            path="/xp"
            element={<XPPage />}
          />

          <Route
            path="/analytics"
            element={<AnalyticsPage />}
          />

          <Route
            path="/agile-assistant"
            element={<AgileAssistantPage />}
          />

          <Route
            path="/agile-maturity"
            element={<AgileMaturityPage />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;