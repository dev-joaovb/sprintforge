const STORAGE_KEY = "sprintforge-projects";

export const getProjects = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    return [];
  }
};

export const saveProjects = (projects) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects)
  );
};

export const createProject = (project) => {
  const projects = getProjects();

  const newProject = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...project,
  };

  projects.push(newProject);

  saveProjects(projects);

  return newProject;
};

export const updateProject = (updatedProject) => {
  const projects = getProjects().map((project) =>
    project.id === updatedProject.id
      ? updatedProject
      : project
  );

  saveProjects(projects);
};

export const deleteProject = (id) => {
  const projects = getProjects().filter(
    (project) => project.id !== id
  );

  saveProjects(projects);
};