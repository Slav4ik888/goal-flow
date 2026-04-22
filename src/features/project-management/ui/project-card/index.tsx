// src/features/project-management/ui/project-card/index.tsx

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import type { Project } from '@entities/project/types';
import { editProject, removeProject, archiveProject } from '@entities/project';
import styles from './index.module.scss';



interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.items);
  const goals = useAppSelector(state => state.goals.items);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);

  const relatedTasks = tasks.filter(t => t.projectId === project.id);
  const completedTasks = relatedTasks.filter(t => t.status === 'done');
  const inProgressTasks = relatedTasks.filter(t => t.status === 'in-progress');
  const totalTimeSpent = relatedTasks.reduce((sum, t) => sum + t.timeSpentSeconds, 0);
  
  const relatedGoal = project.goalId ? goals.find(g => g.id === project.goalId) : null;
  const progress = relatedTasks.length > 0 
    ? (completedTasks.length / relatedTasks.length) * 100 
    : 0;

  const handleProjectClick = () => {
    if (onClick) {
      onClick();
    }
  };
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Архивировать проект "${project.title}"?`)) {
      await dispatch(archiveProject(project.id));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Удалить проект "${project.title}"? Связанные задачи не будут удалены.`)) {
      await dispatch(removeProject(project.id));
    }
  };

  const handleSaveEdit = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle !== project.title) {
      await dispatch(editProject({ id: project.id, updates: { title: editTitle } }));
    }
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div
      className={`${styles.card} ${project.status === 'archived' ? styles.archived : ''} ${isExpanded ? styles.expanded : ''}`}
      onClick={handleProjectClick}
    >
      <div className={styles.header}>
        <div className={styles.icon}>📁</div>
        
        {isEditing ? (
          <div className={styles.editContainer}>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className={styles.editInput}
              autoFocus
              onKeyPress={e => e.key === 'Enter' && handleSaveEdit(e)}
            />
            <button onClick={(e) => handleSaveEdit(e)} className={styles.saveButton}>✓</button>
            <button
              className={styles.cancelButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
            >
              ✗
            </button>
          </div>
        ) : (
          <h3 className={styles.title} onClick={() => setIsExpanded(!isExpanded)}>
            {project.title}
          </h3>
        )}

        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            title="Редактировать"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            ✎
          </button>
          {project.status === 'active' && (
            <button 
              className={styles.iconButton}
              title="Архивировать"
              onClick={(e) => handleArchive(e)} 
            >
              📦
            </button>
          )}
          <button 
            className={`${styles.iconButton} ${styles.deleteButton}`}
            title="Удалить"
            onClick={(e) => handleDelete(e)} 
          >
            ×
          </button>
        </div>
      </div>

      {project.description && (
        <div className={styles.description}>
          {project.description}
        </div>
      )}

      {relatedGoal && (
        <div className={styles.relatedGoal}>
          <span className={styles.relatedGoalLabel}>Связано с целью:</span>
          <span className={styles.relatedGoalTitle}>{relatedGoal.title}</span>
          {relatedGoal.status === 'completed' && <span className={styles.completedBadge}>✓</span>}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{relatedTasks.length}</span>
          <span className={styles.statLabel}>всего задач</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{completedTasks.length}</span>
          <span className={styles.statLabel}>выполнено</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{inProgressTasks.length}</span>
          <span className={styles.statLabel}>в работе</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatTime(totalTimeSpent)}</span>
          <span className={styles.statLabel}>затрачено</span>
        </div>
      </div>

      {relatedTasks.length > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {Math.round(progress)}% выполнено
          </div>
        </div>
      )}

      {isExpanded && relatedTasks.length > 0 && (
        <div className={styles.tasksList}>
          <div className={styles.tasksHeader}>
            <span>Последние задачи:</span>
            <button className={styles.viewAllButton}>Все задачи →</button>
          </div>
          <div className={styles.tasks}>
            {relatedTasks.slice(0, 4).map(task => (
              <div key={task.id} className={styles.taskItem}>
                <span className={task.status === 'done' ? styles.taskDone : styles.taskPending}>
                  {task.status === 'done' ? '✓' : '○'}
                </span>
                <span className={styles.taskTitle}>{task.title}</span>
                <span className={styles.taskTime}>{formatTime(task.timeSpentSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <button 
          className={styles.expandButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? 'Скрыть задачи ▲' : `Показать задачи (${relatedTasks.length}) ▼`}
        </button>
      </div>
    </div>
  );
};
