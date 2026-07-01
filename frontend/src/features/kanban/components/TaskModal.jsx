const TaskModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/60
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          bg-slate-900
          rounded-xl
          border
          border-slate-700
          w-full
          max-w-xl
          p-6
        "
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">
            Nova Tarefa
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>

        </div>

        {/* Corpo */}
        <div className="space-y-5">

          <div>
            <label className="block mb-2">
              Título
            </label>

            <input
              type="text"
              className="
                w-full
                bg-slate-800
                rounded-lg
                p-3
                outline-none
              "
            />
          </div>

          <div>
            <label className="block mb-2">
              Descrição
            </label>

            <textarea
              rows="4"
              className="
                w-full
                bg-slate-800
                rounded-lg
                p-3
                outline-none
              "
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-2">
                Prioridade
              </label>

              <select
                className="
                  w-full
                  bg-slate-800
                  rounded-lg
                  p-3
                "
              >
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
                <option>Crítica</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">
                Responsável
              </label>

              <input
                type="text"
                className="
                  w-full
                  bg-slate-800
                  rounded-lg
                  p-3
                "
              />
            </div>

          </div>

        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="
              px-5
              py-2
              rounded-lg
              bg-slate-700
            "
          >
            Cancelar
          </button>

          <button
            className="
              px-5
              py-2
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
            "
          >
            Salvar
          </button>

        </div>

      </div>
    </div>
  );
};

export default TaskModal;