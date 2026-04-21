// src/pages/tasks/index.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { fetchTasks, createTask, editTask, removeTask, type Task } from '@entities/task';
import { fetchProjects } from '@entities/project';
import { fetchGoals } from '@entities/goal';
import { TaskCard } from '@features/task-manager/ui/task-card';
import { TaskForm } from '@features/task-manager/ui/task-form';
import { FilterBar } from '@widgets/filters';
import { parseFilterQuery, filterTasks } from '@features/filters/lib/query-parser';
import styles from './index.module.scss';

export const TasksSpace: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.items);
  const projects = useAppSelector(state => state.projects.items);
  const goals = useAppSelector(state => state.goals.items);
  const filterQuery = useAppSelector(state => state.ui.filterQuery);
  const searchQuery = useAppSelector(state => state.ui.searchQuery);
  const loading = useAppSelector(state => state.tasks.loading);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    dispatch(fetchGoals());
  }, [dispatch]);

  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    
    if (filterQuery) {
      const parsed = parseFilterQuery(filterQuery);
      result = filterTasks(result, parsed);
    }
    
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [tasks, filterQuery, searchQuery]);

  const handleCreateTask = async (data: any) => {
    await dispatch(createTask(data));
    setShowForm(false);
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    await dispatch(editTask({ id, updates }));
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Удалить задачу?')) {
      await dispatch(removeTask(id));
    }
  };

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  return (
    <div className={styles.tasksSpace}>
      <div className={styles.header}>
        <h1>✅ Задачи</h1>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Новая задача
        </button>
      </div>

      <FilterBar />

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Создать задачу</h2>
            <TaskForm
              projects={projects}
              goals={goals}
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {editingTask && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Редактировать задачу</h2>
            <TaskForm
              initialData={editingTask}
              projects={projects}
              goals={goals}
              onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}

      {loading && <div className={styles.loading}>Загрузка...</div>}

      <div className={styles.kanban}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.dotTodo}></span>
            <h3>К выполнению</h3>
            <span className={styles.count}>{todoTasks.length}</span>
          </div>
          <div className={styles.tasksList}>
            {todoTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={(status) => handleUpdateTask(task.id, { status })}
              />
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.dotProgress}></span>
            <h3>В работе</h3>
            <span className={styles.count}>{inProgressTasks.length}</span>
          </div>
          <div className={styles.tasksList}>
            {inProgressTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={(status) => handleUpdateTask(task.id, { status })}
              />
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.dotDone}></span>
            <h3>Готово</h3>
            <span className={styles.count}>{doneTasks.length}</span>
          </div>
          <div className={styles.tasksList}>
            {doneTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={(status) => handleUpdateTask(task.id, { status })}
              />
            ))}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 && !loading && (
        <div className={styles.emptyState}>
          {filterQuery || searchQuery ? 'Ничего не найдено' : 'Нет задач. Создайте первую задачу!'}
        </div>
      )}
    </div>
  );
};
