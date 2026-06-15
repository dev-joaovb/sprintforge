import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  RefreshCcw,
  Zap,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2,
  BrainCircuit,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Kanban",
    path: "/kanban",
    icon: KanbanSquare,
  },
  {
    name: "Scrum",
    path: "/scrum",
    icon: RefreshCcw,
  },
  {
    name: "XP",
    path: "/xp",
    icon: Zap,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        bg-slate-900
        border-r
        border-slate-800
        flex
        flex-col
        transition-all
        duration-300
      `}
    >
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-blue-500">
                SprintForge
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Forge better workflows.
              </p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white transition"
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 overflow-y-auto">

        {/* Dashboard */}
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `
                flex items-center
                ${collapsed ? "justify-center" : ""}
                gap-3
                px-4
                py-3
                rounded-lg
                transition-all
                ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
              `
              }
            >
              <LayoutDashboard size={20} />
              {!collapsed && "Dashboard"}
            </NavLink>
          </li>
        </ul>

        {/* Metodologias */}
        {!collapsed && (
          <div className="mt-8 mb-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Metodologias
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {menuItems.slice(1, 4).map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `
                    flex items-center
                    ${collapsed ? "justify-center" : ""}
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    transition-all
                    ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }
                  `
                  }
                >
                  <Icon size={20} />
                  {!collapsed && item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Analytics */}
        {!collapsed && (
          <div className="mt-8 mb-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Análises
            </p>
          </div>
        )}

        <ul className="space-y-2">

          <li>
            <NavLink
              to="/agile-assistant"
              className={({ isActive }) =>
                `
                flex items-center
                ${collapsed ? "justify-center" : ""}
                gap-3
                px-4
                py-3
                rounded-lg
                transition-all
                ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
              `
              }
            >
              <BrainCircuit size={20} />
              {!collapsed && "Assistente Ágil"}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `
                flex items-center
                ${collapsed ? "justify-center" : ""}
                gap-3
                px-4
                py-3
                rounded-lg
                transition-all
                ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
              `
              }
            >
              <BarChart3 size={20} />
              {!collapsed && "Analytics"}
            </NavLink>
          </li>
        </ul>

      </nav>

      {/* Usuário */}
      <div className="border-t border-slate-800 p-4">

        {!collapsed && (
          <div className="flex items-center gap-3 mb-4">
            <UserCircle2 size={36} className="text-slate-400" />

            <div>
              <p className="text-sm font-medium text-white">
                João Victor
              </p>

              <p className="text-xs text-slate-400">
                Software Engineer
              </p>
            </div>
          </div>
        )}

        <NavLink
          to="/settings"
          className={`
            flex items-center
            ${collapsed ? "justify-center" : ""}
            gap-3
            px-4
            py-3
            rounded-lg
            text-slate-300
            hover:bg-slate-800
            transition-all
          `}
        >
          <Settings size={20} />
          {!collapsed && "Settings"}
        </NavLink>

      </div>
    </aside>
  );
};

export default Sidebar;