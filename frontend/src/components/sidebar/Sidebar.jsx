import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  RefreshCcw,
  Zap,
  BarChart3,
  Settings,
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
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-500">
          SprintForge
        </h1>
      </div>

      <nav className="flex-1 p-4">

        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon size={20} />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

      </nav>

      <div className="p-4 border-t border-slate-800">

        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-all"
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </div>

    </aside>
  );
};

export default Sidebar;