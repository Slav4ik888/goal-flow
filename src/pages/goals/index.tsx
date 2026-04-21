// src/pages/goals/index.tsx

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { fetchGoals, createGoal } from '@entities/goal';
import { fetchTasks } from '@entities/task';
import { GoalCard } from '@features/goal-tracking/ui/goal-card';
import { GoalForm } from '@features/goal-tracking/ui/goal-form';
import styles from './index.module.scss';

export const GoalsSpace: React.FC = () => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector(state => state.goals.items);
  const tasks = useAppSelector(state => state.tasks.items);
  const loading = useAppSelector(state => state.goals.loading);
  const [showForm, setShowForm] = React.useState(false);

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreateGoal = async (data: { title: string; description?: string; targetDate?: number }) => {
    await dispatch(createGoal(data));
    setShowForm(false);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className={styles.goalsSpace}>
      <div className={styles.header}>
        <h1>🎯 Цели</h1>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Новая цель
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Создать цель</h2>
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {loading && <div className={styles.loading}>Загрузка...</div>}

      <div className={styles.section}>
        <h2>Активные цели</h2>
        <div className={styles.goalsGrid}>
          {activeGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} tasks={tasks} />
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
              <GoalCard key={goal.id} goal={goal} tasks={tasks} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
