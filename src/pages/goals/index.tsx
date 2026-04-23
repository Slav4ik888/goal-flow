// src/pages/goals/index.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { fetchGoals, createGoal, type Goal } from '@entities/goal';
import { fetchTasks } from '@entities/task';
import { GoalCard } from '@features/goal-tracking/ui/goal-card';
import { GoalForm } from '@features/goal-tracking/ui/goal-form';
import { uiActions } from '@entities/ui';
import styles from './index.module.scss';
import { createProject, fetchProjects } from '@entities/project';
import { ProjectForm } from '@features/project-management';



export const GoalsSpace: React.FC = () => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector(state => state.goals.items);
  const tasks = useAppSelector(state => state.tasks.items);
  const loading = useAppSelector(state => state.goals.loading);
  
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedGoalForProject, setSelectedGoalForProject] = useState<Goal | null>(null);

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchProjects());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreateGoal = async (data: { title: string; description?: string; targetDate?: number }) => {
    await dispatch(createGoal(data));
    setShowGoalForm(false);
  };

  // Обработчик создания проекта для цели
  const handleCreateProjectForGoal = (goal: Goal) => {
    setSelectedGoalForProject(goal);
    setShowProjectForm(true);
  };

  const handleCreateProject = async (data: { title: string; description?: string; goalId?: string }) => {
    await dispatch(createProject(data));
    setShowProjectForm(false);
    setSelectedGoalForProject(null);
  };

  const handleGoalClick = (goal: Goal) => {
    dispatch(uiActions.navigateToGoal({ id: goal.id, title: goal.title }));
    dispatch(uiActions.setFilterQuery(`goal:${goal.id}`));
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className={styles.goalsSpace}>
      <div className={styles.header}>
        <h1>🎯 Цели</h1>
        <button className={styles.addButton} onClick={() => setShowGoalForm(true)}>
          + Новая цель
        </button>
      </div>

      {/* Форма создания цели */}
      {showGoalForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Создать цель</h2>
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setShowGoalForm(false)}
            />
          </div>
        </div>
      )}

      {/* Форма создания проекта для выбранной цели */}
      {showProjectForm && selectedGoalForProject && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>
              Создать проект для цели 
              <span className={styles.goalName}> "{selectedGoalForProject.title}"</span>
            </h2>
            <ProjectForm
              initialData={{ goalId: selectedGoalForProject.id }}
              goals={goals}
              onSubmit={handleCreateProject}
              onCancel={() => {
                setShowProjectForm(false);
                setSelectedGoalForProject(null);
              }}
            />
          </div>
        </div>
      )}

      {loading && <div className={styles.loading}>Загрузка...</div>}

      <div className={styles.section}>
        <h2>Активные цели</h2>
        <div className={styles.goalsGrid}>
          {activeGoals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              tasks={tasks}
              onClick={handleGoalClick}
              onCreateProject={handleCreateProjectForGoal}  // <-- передаём обработчик
            />
          ))}
          {activeGoals.length === 0 && (
            <div className={styles.emptyState}>
              Нет активных целей. Создайте первую цель!
            </div>
          )}
        </div>
      </div>

      {completedGoals.length > 0 && (
        <div className={styles.section}>
          <h2>Выполненные цели</h2>
          <div className={styles.goalsGrid}>
            {completedGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                tasks={tasks}
                onClick={handleGoalClick}
                onCreateProject={handleCreateProjectForGoal}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
