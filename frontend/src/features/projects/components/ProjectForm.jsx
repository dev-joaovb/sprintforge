import { useEffect, useState } from "react";

import Button from "../../../components/ui/Button";

const ProjectForm = ({
  initialData = null,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    methodology: "Scrum",
    status: "Planejamento",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(form);

    if (!initialData) {
      setForm({
        name: "",
        description: "",
        methodology: "Scrum",
        status: "Planejamento",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="block mb-2 font-medium">
          Nome do Projeto
        </label>

        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
          className="w-full bg-slate-800 rounded-lg p-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Descrição
        </label>

        <textarea
          rows="4"
          value={form.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Metodologia
        </label>

        <select
          value={form.methodology}
          onChange={(e) =>
            handleChange(
              "methodology",
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-lg p-3"
        >
          <option>Scrum</option>
          <option>Kanban</option>
          <option>Extreme Programming (XP)</option>
          <option>Scrumban</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Status
        </label>

        <select
          value={form.status}
          onChange={(e) =>
            handleChange(
              "status",
              e.target.value
            )
          }
          className="w-full bg-slate-800 rounded-lg p-3"
        >
          <option>Planejamento</option>
          <option>Em andamento</option>
          <option>Concluído</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">

        <Button
          type="button"
          className="bg-slate-700 hover:bg-slate-600"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button type="submit">
          {initialData
            ? "Salvar Alterações"
            : "Criar Projeto"}
        </Button>

      </div>
    </form>
  );
};

export default ProjectForm;