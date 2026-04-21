// src/features/task-manager/ui/task-card/index.tsx

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import type { Task, Priority, TaskStatus } from '@entities/task';
import { editTask } from '@entities/task';
import { startTimeEntry, stopTimeEntryThunk, fetchActiveTimeEntry } from '@entities/time-entry';
import { TaskTimer } from '@features/time-tracking';
import styles from './index.module.scss';



interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const priorityColors: Record<Priority, string> = {
  P0: '#ff4444',
  P1: '#ff8844',
  P2: '#44aaff',
  P3: '#88cc88',
};

const priorityLabels: Record<Priority, string> = {
  P0: 'Критичный',
  P1: 'Высокий',
  P2: 'Средний',
  P3: 'Низкий',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const dispatch = useAppDispatch();
  const activeTimeEntry = useAppSelector(state => state.timeEntries.activeTimeEntry);
  const [isExpanded, setIsExpanded] = useState(false);
  const isTimerRunning = activeTimeEntry?.taskId === task.id;

  const handleTimeUpdate = async (seconds: number) => {
    await dispatch(editTask({ 
      id: task.id, 
      updates: { timeSpentSeconds: seconds } 
    }));
  };

  const handleStartTimer = async () => {
    if (isTimerRunning) {
      // Остановить таймер
      if (activeTimeEntry) {
        await dispatch(stopTimeEntryThunk({ entryId: activeTimeEntry.id }));
        await dispatch(fetchActiveTimeEntry());
      }
    } else {
      // Запустить таймер
      await dispatch(startTimeEntry({ taskId: task.id }));
      await dispatch(fetchActiveTimeEntry());
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo': return '○';
      case 'in-progress': return '◐';
      case 'done': return '✓';
      default: return '○';
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';
    return date.toLocaleDateString('ru-RU');
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== 'done';

  return (
    <div className={`${styles.card} ${styles[task.status]} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.mainRow}>
        <button 
          className={styles.statusButton}
          onClick={() => {
            const nextStatus: Record<TaskStatus, TaskStatus> = {
              'todo': 'in-progress',
              'in-progress': 'done',
              'done': 'todo'
            };
            onStatusChange(nextStatus[task.status]);
          }}
        >
          <span className={styles.statusIcon}>{getStatusIcon()}</span>
        </button>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{task.title}</h3>
            <div 
              className={styles.priorityBadge} 
              style={{ backgroundColor: priorityColors[task.priority] }}
              title={priorityLabels[task.priority]}
            >
              {task.priority}
            </div>
          </div>
          
          <div className={styles.meta}>
            {task.projectId && (
              <span className={styles.metaItem}>📁 Проект</span>
            )}
            {task.goalId && (
              <span className={styles.metaItem}>🎯 Цель</span>
            )}
            {task.dueDate && (
              <span className={`${styles.metaItem} ${isOverdue ? styles.overdue : ''}`}>
                📅 {formatDate(task.dueDate)}
                {isOverdue && ' (просрочено)'}
              </span>
            )}
            {task.tags.length > 0 && (
              <div className={styles.tags}>
                {task.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
                {task.tags.length > 3 && <span className={styles.tag}>+{task.tags.length - 3}</span>}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <TaskTimer 
            taskId={task.id}
            initialSeconds={task.timeSpentSeconds}
            onUpdate={handleTimeUpdate}
            isRunning={isTimerRunning}
            onStartStop={handleStartTimer}
          />
          
          <button className={styles.iconButton} onClick={() => setIsExpanded(!isExpanded)} title="Подробнее">
            {isExpanded ? '▲' : '▼'}
          </button>
          
          <button className={styles.iconButton} onClick={onEdit} title="Редактировать">
            ✎
          </button>
          
          <button className={`${styles.iconButton} ${styles.deleteButton}`} onClick={onDelete} title="Удалить">
            ×
          </button>
        </div>
      </div>

      {isExpanded && task.description && (
        <div className={styles.description}>
          <p>{task.description}</p>
          {task.estimatedHours && (
            <div className={styles.estimate}>
              ⏱ Оценка: {task.estimatedHours} ч
            </div>
          )}
        </div>
      )}
    </div>
  );
};
