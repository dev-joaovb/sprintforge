import {
  Bell,
  Search,
  UserCircle2
} from "lucide-react";

const Topbar = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6">

      {/* Lado esquerdo */}
      <div>
        <h2 className="text-lg font-semibold">
          Dashboard
        </h2>
      </div>

      {/* Centro */}
      <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg w-80">

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

        <button className="hover:text-blue-500 transition">
          <UserCircle2 size={28} />
        </button>

      </div>

    </header>
  );
};

export default Topbar;