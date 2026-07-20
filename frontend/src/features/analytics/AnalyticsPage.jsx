import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

import { useKanban } from "../../context/KanbanContext";

import { calculateAnalytics } from "./analyticsEngine";

import TaskStatusChart from "./components/TaskStatusChart";

const AnalyticsPage = () => {
  const { tasks } = useKanban();

  const analytics = calculateAnalytics(tasks);

  const statusData = [
    {
      name: "Backlog",
      value: analytics.backlogTasks,
    },
    {
      name: "To Do",
      value: analytics.todoTasks,
    },
    {
      name: "In Progress",
      value: analytics.inProgressTasks,
    },
    {
      name: "Review",
      value: analytics.reviewTasks,
    },
    {
      name: "Done",
      value: analytics.doneTasks,
    },
  ];

  return ( // Retorna o JSX da página de Analytics
    <>
      <PageHeader
        title="Analytics"
        subtitle="Indicadores de desempenho do projeto."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card>
          <h3 className="text-slate-400 text-sm">
            Total de Tarefas
          </h3>

          <p className="text-3xl font-bold mt-2">
            {analytics.totalTasks}
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Concluídas
          </h3>

          <p className="text-3xl font-bold mt-2">
            {analytics.completedTasks}
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Pendentes
          </h3>

          <p className="text-3xl font-bold mt-2">
            {analytics.pendingTasks}
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Taxa de Conclusão
          </h3>

          <p className="text-3xl font-bold mt-2">
            {analytics.completionRate}%
          </p>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        <Card>

          <h2 className="text-lg font-semibold mb-4">
            Fluxo das Tarefas
          </h2>

          <ul className="space-y-3 text-slate-300">

            <li>Backlog: {analytics.backlogTasks}</li>

            <li>To Do: {analytics.todoTasks}</li>

            <li>
              Em andamento: {analytics.inProgressTasks}
            </li>

            <li>Review: {analytics.reviewTasks}</li>

            <li>Concluídas: {analytics.doneTasks}</li>

          </ul>

        </Card>

        <Card>

          <h2 className="text-lg font-semibold mb-4">
            Prioridades
          </h2>

          <p className="text-slate-300">
            Tarefas críticas:
          </p>

          <p className="text-3xl font-bold mt-2 text-red-400">
            {analytics.criticalTasks}
          </p>

        </Card>

        <Card>

          <h2 className="text-lg font-semibold mb-4">
            Resumo
          </h2>

          <p className="text-slate-300 leading-relaxed">
            Atualmente existem{" "}
            <strong>{analytics.totalTasks}</strong> tarefas
            cadastradas no projeto, com uma taxa de
            conclusão de{" "}
            <strong>{analytics.completionRate}%</strong>.
          </p>

        </Card>

      </div>

      <div className="mt-6">
        <TaskStatusChart data={statusData} />
      </div>
    </>
  );
};

export default AnalyticsPage;