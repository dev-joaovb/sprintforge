import { useEffect, useState } from "react";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectStorage";

const useProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(getProjects());
  };

  const addProject = (project) => {
    createProject(project);
    loadProjects();
  };

  const editProject = (project) => {
    updateProject(project);
    loadProjects();
  };

  const removeProject = (id) => {
    deleteProject(id);
    loadProjects();
  };

  return {
    projects,
    addProject,
    editProject,
    removeProject,
    loadProjects,
  };
};

export default useProjects;