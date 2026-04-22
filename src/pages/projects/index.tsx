// src/pages/projects/index.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { fetchProjects, createProject, type Project } from '@entities/project';
import { ProjectCard } from '@features/project-management/ui/project-card';
import { ProjectForm } from '@features/project-management/ui/project-form';
import { uiActions } from '@entities/ui';
import styles from './index.module.scss';



export const ProjectsSpace: React.FC = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects.items);
  const goals = useAppSelector(state => state.goals.items);
  const loading = useAppSelector(state => state.projects.loading);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async (data: { title: string; description?: string; goalId?: string }) => {
    await dispatch(createProject(data));
    setShowForm(false);
  };
  
  const handleProjectClick = (project: Project) => {
    const goal = goals.find(g => g.id === project.goalId);
    dispatch(uiActions.navigateToProject({ 
      id: project.id, 
      title: project.title,
      goalId: project.goalId,
      goalTitle: goal?.title 
    }));
    // Фильтруем задачи по этому проекту
    dispatch(uiActions.setFilterQuery(`project:${project.id}`));
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className={styles.projectsSpace}>
      <div className={styles.header}>
        <h1>📁 Проекты</h1>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Новый проект
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Создать проект</h2>
            <ProjectForm
              goals={goals}
              onSubmit={handleCreateProject}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {loading && <div className={styles.loading}>Загрузка...</div>}

      <div className={styles.section}>
        <h2>Активные проекты</h2>
        <div className={styles.projectsGrid}>
          {activeProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
          {activeProjects.length === 0 && (
            <div className={styles.emptyState}>
              Нет активных проектов. Создайте первый проект!
            </div>
          )}
        </div>
      </div>

      {archivedProjects.length > 0 && (
        <div className={styles.section}>
          <h2>Архив</h2>
          <div className={styles.projectsGrid}>
            {archivedProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
