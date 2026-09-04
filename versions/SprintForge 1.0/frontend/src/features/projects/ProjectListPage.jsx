import { useState } from "react";
import { Plus } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import ProjectCard from "./components/ProjectCard";
import ProjectModal from "./components/ProjectModal";

import useProjects from "./hooks/useProjects";

const ProjectListPage = () => {
  const {
    projects,
    addProject,
    editProject,
    removeProject,
  } = useProjects();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const handleNewProject = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleSubmit = (project) => {
    if (editingProject) {
      editProject({
        ...editingProject,
        ...project,
      });
    } else {
      addProject(project);
    }

    setModalOpen(false);
    setEditingProject(null);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Deseja realmente excluir este projeto?"
      )
    ) {
      removeProject(id);
    }
  };

  return (
    <>
      <PageHeader
        title="Projetos"
        subtitle="Gerencie todos os projetos do SprintForge."
      />

      <div className="mb-6 flex justify-end">
        <Button onClick={handleNewProject}>
          <Plus size={18} />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>

          <div className="text-center py-12">

            <h2 className="text-2xl font-semibold">
              Nenhum projeto encontrado
            </h2>

            <p className="text-slate-400 mt-3">
              Clique em "Novo Projeto"
              para começar.
            </p>

          </div>

        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDelete}
            />
          ))}

        </div>
      )}

      <ProjectModal
        open={modalOpen}
        title={
          editingProject
            ? "Editar Projeto"
            : "Novo Projeto"
        }
        initialData={editingProject}
        onSubmit={handleSubmit}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
      />
    </>
  );
};

export default ProjectListPage;