const DashboardPage = () => {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-slate-400">
            Projetos Ativos
          </h3>

          <p className="text-3xl font-bold mt-2">
            8
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-slate-400">
            Sprints Ativas
          </h3>

          <p className="text-3xl font-bold mt-2">
            3
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-slate-400">
            Tarefas Concluídas
          </h3>

          <p className="text-3xl font-bold mt-2">
            124
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-slate-400">
            Velocity
          </h3>

          <p className="text-3xl font-bold mt-2">
            87
          </p>
        </div>

      </div>

    </div>

    
  );
};

export default DashboardPage;