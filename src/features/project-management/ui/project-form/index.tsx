// src/features/project-management/ui/project-form/index.tsx

import React, { useState } from 'react';
import type { Goal } from '@entities/goal';
import styles from './index.module.scss';



interface ProjectFormProps {
  initialData?: {
    title?: string;
    description?: string;
    goalId?: string;
  };
  goals: Goal[];
  onSubmit: (data: { title: string; description?: string; goalId?: string }) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, goals, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    goalId: initialData?.goalId || '',
  });

  const [errors, setErrors] = useState<{ title?: string }>({});

  const activeGoals = goals.filter(g => g.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    const newErrors: { title?: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Название проекта обязательно';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      goalId: formData.goalId || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          Название проекта <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => {
            setFormData({ ...formData, title: e.target.value });
            if (errors.title) setErrors({});
          }}
          className={`${styles.input} ${errors.title ? styles.error : ''}`}
          placeholder="Например: MVP лендинга"
          autoFocus
        />
        {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="Опишите цели и задачи проекта..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Связать с целью</label>
        <select
          value={formData.goalId}
          onChange={e => setFormData({ ...formData, goalId: e.target.value })}
          className={styles.select}
        >
          <option value="">Без цели</option>
          {activeGoals.map(goal => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
        <div className={styles.hint}>
          💡 Связывание проекта с целью поможет отслеживать прогресс
        </div>
      </div>

      {formData.goalId && (
        <div className={styles.selectedGoal}>
          <div className={styles.selectedGoalIcon}>🎯</div>
          <div className={styles.selectedGoalInfo}>
            <div className={styles.selectedGoalLabel}>Выбранная цель:</div>
            <div className={styles.selectedGoalTitle}>
              {goals.find(g => g.id === formData.goalId)?.title}
            </div>
          </div>
        </div>
      )}

      <div className={styles.buttons}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
        <button type="submit" className={styles.submitButton}>
          {initialData ? 'Сохранить изменения' : 'Создать проект'}
        </button>
      </div>
    </form>
  );
};
