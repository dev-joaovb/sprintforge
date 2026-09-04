// Arquivo para calcular métricas de tarefas para o dashboard

export const calculateAnalytics = (tasks) => {
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  const criticalTasks = tasks.filter(
    (task) => task.priority === "Crítica"
  ).length;

  const backlogTasks = tasks.filter(
    (task) => task.status === "backlog"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "review"
  ).length;

  const doneTasks = completedTasks;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
    criticalTasks,
    backlogTasks,
    todoTasks,
    inProgressTasks,
    reviewTasks,
    doneTasks,
  };
};