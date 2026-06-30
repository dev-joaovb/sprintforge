import TaskCard from "./TaskCard";

const Column = ({ title }) => {
  return (
    <div
      className="
        bg-slate-900
        rounded-xl
        border
        border-slate-800
        p-4
        min-h-[600px]
        flex
        flex-col
      "
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <span
          className="
            bg-slate-800
            text-slate-300
            text-xs
            px-2
            py-1
            rounded-full
          "
        >
          0
        </span>
      </div>

      {/* Área dos cards */}
      <div className="flex flex-col gap-3 flex-1">
        <TaskCard />
      </div>
    </div>
  );
};

export default Column;