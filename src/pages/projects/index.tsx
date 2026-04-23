// src/pages/projects/index.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { fetchProjects, createProject, type Project } from '@entities/project';
import { ProjectCard } from '@features/project-management/ui/project-card';
import { ProjectForm } from '@features/project-management/ui/project-form';
import { uiActions } from '@entities/ui';
import styles from './index.module.scss';
import { fetchGoals } from '@entities/goal';
import { createTask } from '@entities/task';
import { TaskForm } from '@features/task-manager';



export const ProjectsSpace: React.FC = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects.items);
  const goals = useAppSelector(state => state.goals.items);
  const loading = useAppSelector(state => state.projects.loading);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<Project | null>(null);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleCreateProject = async (data: { title: string; description?: string; goalId?: string }) => {
    await dispatch(createProject(data));
    setShowProjectForm(false);
  };

  // Обработчик создания задачи для проекта
  const handleCreateTaskForProject = (project: Project) => {
    setSelectedProjectForTask(project);
    setShowTaskForm(true);
  };

  const handleCreateTask = async (data: any) => {
    await dispatch(createTask(data));
    setShowTaskForm(false);
    setSelectedProjectForTask(null);
  };

  const handleProjectClick = (project: Project) => {
    dispatch(uiActions.navigateToProject({ 
      id: project.id, 
      title: project.title,
      goalId: project.goalId,
      goalTitle: goals.find(g => g.id === project.goalId)?.title 
    }));
    dispatch(uiActions.setFilterQuery(`project:${project.id}`));
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className={styles.projectsSpace}>
      <div className={styles.header}>
        <h1>📁 Проекты</h1>
        <button className={styles.addButton} onClick={() => setShowProjectForm(true)}>
          + Новый проект
        </button>
      </div>

      {/* Форма создания проекта */}
      {showProjectForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Создать проект</h2>
            <ProjectForm
              goals={goals}
              onSubmit={handleCreateProject}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        </div>
      )}

      {/* Форма создания задачи для выбранного проекта */}
      {showTaskForm && selectedProjectForTask && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>
              Создать задачу для проекта 
              <span className={styles.projectName}> "{selectedProjectForTask.title}"</span>
            </h2>
            <TaskForm
              initialData={{
                projectId: selectedProjectForTask.id,
                goalId: selectedProjectForTask.goalId || undefined,
              }}
              projects={projects}
              goals={goals}
              onSubmit={handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setSelectedProjectForTask(null);
              }}
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
              onClick={handleProjectClick}
              onCreateTask={handleCreateTaskForProject}
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
                onClick={handleProjectClick}
                onCreateTask={handleCreateTaskForProject}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
