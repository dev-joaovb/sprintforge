import {
  FolderKanban,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";

import Button from "../../../components/ui/Button";

const statusColors = {
  Planejamento: "bg-yellow-500",
  "Em andamento": "bg-blue-500",
  Concluído: "bg-green-500",
};

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-blue-500 transition-all">

      {/* Cabeçalho */}
      <div className="flex justify-between items-start">

        <div className="flex items-center gap-3">

          <FolderKanban
            size={28}
            className="text-blue-500"
          />

          <div>

            <h2 className="text-lg font-semibold">
              {project.name}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {project.description}
            </p>

          </div>

        </div>

        <span
          className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-medium
            text-white
            ${
              statusColors[
                project.status
              ] || "bg-slate-600"
            }
          `}
        >
          {project.status}
        </span>

      </div>

      {/* Informações */}
      <div className="mt-6 space-y-3">

        <div className="flex justify-between">

          <span className="text-slate-400">
            Metodologia
          </span>

          <span className="font-medium">
            {project.methodology}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Criado em
          </span>

          <div className="flex items-center gap-2">

            <CalendarDays size={16} />

            <span>
              {new Date(
                project.createdAt
              ).toLocaleDateString("pt-BR")}
            </span>

          </div>

        </div>

      </div>

      {/* Botões */}
      <div className="mt-8 flex gap-3">

        <Button
          className="flex-1"
          onClick={() => onEdit(project)}
        >
          <Pencil size={16} />

          Editar
        </Button>

        <Button
          className="flex-1 bg-red-600 hover:bg-red-700"
          onClick={() =>
            onDelete(project.id)
          }
        >
          <Trash2 size={16} />

          Excluir
        </Button>

      </div>

    </div>
  );
};

export default ProjectCard;