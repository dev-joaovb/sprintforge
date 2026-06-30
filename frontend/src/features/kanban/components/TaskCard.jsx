const TaskCard = () => {
  return (
    <div
      className="
        bg-slate-800
        border
        border-slate-700
        rounded-lg
        p-4
        hover:border-blue-500
        hover:shadow-lg
        transition-all
        cursor-pointer
      "
    >
      {/* Título */}
      <h3 className="font-semibold text-white">
        Exemplo de tarefa
      </h3>

      {/* Descrição */}
      <p className="text-sm text-slate-400 mt-2">
        Este é um cartão de exemplo que será substituído por tarefas reais nas próximas Sprints.
      </p>

      {/* Rodapé */}
      <div className="flex items-center justify-between mt-4">

        <span
          className="
            bg-red-500/20
            text-red-400
            text-xs
            px-2
            py-1
            rounded-full
          "
        >
          Alta
        </span>

        <span className="text-xs text-slate-500">
          João Victor
        </span>

      </div>
    </div>
  );
};

export default TaskCard;