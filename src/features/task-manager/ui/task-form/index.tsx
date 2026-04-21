// src/features/task-manager/ui/task-form/index.tsx

import React, { useState } from 'react';
import type { Priority, TaskStatus } from '@entities/task';
import type { Goal } from '@entities/goal/types';
import type { Project } from '@entities/project/types';
import styles from './index.module.scss';


interface TaskFormProps {
  initialData?: any;
  projects: Project[];
  goals: Goal[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  initialData, 
  projects, 
  goals, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'P2',
    status: initialData?.status || 'todo',
    projectId: initialData?.projectId || '',
    goalId: initialData?.goalId || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: initialData?.estimatedHours || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: any) => t),
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Название задачи *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className={styles.input}
          placeholder="Например: Сверстать главный экран"
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="Подробное описание задачи..."
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Приоритет</label>
          <select
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
            className={styles.select}
          >
            <option value="P0">P0 - Критичный</option>
            <option value="P1">P1 - Высокий</option>
            <option value="P2">P2 - Средний</option>
            <option value="P3">P3 - Низкий</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Статус</label>
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            className={styles.select}
          >
            <option value="todo">К выполнению</option>
            <option value="in-progress">В работе</option>
            <option value="done">Готово</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Проект</label>
          <select
            value={formData.projectId}
            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
            className={styles.select}
          >
            <option value="">Без проекта</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Цель</label>
          <select
            value={formData.goalId}
            onChange={e => setFormData({ ...formData, goalId: e.target.value })}
            className={styles.select}
          >
            <option value="">Без цели</option>
            {goals.filter(g => g.status === 'active').map(goal => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Дедлайн</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Оценка (часы)</label>
          <input
            type="number"
            step="0.5"
            value={formData.estimatedHours}
            onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
            className={styles.input}
            placeholder="Например: 2.5"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Теги (через запятую)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={e => setFormData({ ...formData, tags: e.target.value })}
          className={styles.input}
          placeholder="frontend, bug, urgent"
        />
      </div>

      <div className={styles.buttons}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
        <button type="submit" className={styles.submitButton}>
          {initialData ? 'Сохранить' : 'Создать задачу'}
        </button>
      </div>
    </form>
  );
};
