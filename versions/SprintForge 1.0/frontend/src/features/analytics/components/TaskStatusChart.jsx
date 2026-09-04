// Componente para exibir o gráfico de status das tarefas

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import Card from "../../../components/ui/Card";

const TaskStatusChart = ({ data }) => {
  return (
    <Card>

      <h2 className="text-lg font-semibold mb-6">
        Distribuição das Tarefas
      </h2>

      <div className="w-full h-80">

        <ResponsiveContainer>

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </Card>
  );
};

export default TaskStatusChart;