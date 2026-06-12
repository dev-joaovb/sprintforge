import {
  Bell,
  Search,
  UserCircle2
} from "lucide-react";

import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": "Dashboard",
  "/kanban": "Kanban",
  "/scrum": "Scrum",
  "/xp": "Extreme Programming",
  "/analytics": "Analytics",
  "/settings": "Configurações",
};

const Topbar = () => {
  const location = useLocation();

  const currentPage =
    pageTitles[location.pathname] || "SprintForge";

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6">

      {/* Lado esquerdo */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          {currentPage}
        </h2>

        <p className="text-xs text-slate-400">
          SprintForge Workspace
        </p>
      </div>

      {/* Centro */}
      <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg w-80 border border-slate-800">

        <Search size={18} />

        <input
          type="text"
          placeholder="Pesquisar..."
          className="bg-transparent outline-none w-full text-sm"
        />

      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-4">

        <button className="hover:text-blue-500 transition">
          <Bell size={20} />
        </button>

        <button className="flex items-center gap-2 hover:text-blue-500 transition">
          <UserCircle2 size={28} />

          <span className="hidden lg:block text-sm">
            João Victor
          </span>
        </button>

      </div>

    </header>
  );
};

export default Topbar;