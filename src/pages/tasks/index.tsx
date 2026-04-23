// src/pages/tasks/index.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { fetchTasks, createTask, editTask, removeTask, type Task } from '@entities/task';
import { fetchProjects } from '@entities/project';
import { fetchGoals } from '@entities/goal';
import { TaskCard, TaskForm } from '@features/task-manager';
import { FilterBar } from '@widgets/filters';
import { parseFilterQuery, filterTasks } from '@features/filters/lib/query-parser';
import { uiActions } from '@entities/ui';
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
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    dispatch(fetchGoals());
  }, [dispatch]);

  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    
    if (filterQuery) {
      const parsed = parseFilterQuery(filterQuery);
      result = filterTasks(result, parsed, projects, goals);
    }
    
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [tasks, filterQuery, searchQuery, projects, goals]);

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

  // Открытие модалки с деталями задачи
  const handleTaskDoubleClick = (task: Task) => {
    setSelectedTaskDetail(task);
  };

  // Закрытие модалки с деталями - сбрасываем фильтр, если он был установлен для этой задачи
  const handleCloseTaskDetail = () => {
    setSelectedTaskDetail(null);
    // Проверяем, не был ли установлен фильтр по ID этой задачи
    if (filterQuery && filterQuery.startsWith('id:')) {
      dispatch(uiActions.goToAllTasks()); // Сбрасываем фильтр и показываем все задачи
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

      {/* Модалка с деталями задачи */}
      {selectedTaskDetail && (
        <div className={styles.modal} onClick={handleCloseTaskDetail}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedTaskDetail.title}</h2>
              <button onClick={handleCloseTaskDetail} className={styles.closeModalButton}>
                ✕
              </button>
            </div>
            
            <div className={styles.taskDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Описание:</span>
                <span className={styles.detailValue}>
                  {selectedTaskDetail.description || 'Нет описания'}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Приоритет:</span>
                <span className={`${styles.detailValue} ${styles.priority}`}>
                  {selectedTaskDetail.priority}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Статус:</span>
                <span className={styles.detailValue}>
                  {selectedTaskDetail.status === 'todo' && 'К выполнению'}
                  {selectedTaskDetail.status === 'in-progress' && 'В работе'}
                  {selectedTaskDetail.status === 'done' && 'Готово'}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Затрачено времени:</span>
                <span className={styles.detailValue}>
                  {Math.floor(selectedTaskDetail.timeSpentSeconds / 3600)}ч{' '}
                  {Math.floor((selectedTaskDetail.timeSpentSeconds % 3600) / 60)}м
                </span>
              </div>
              
              {selectedTaskDetail.estimatedHours && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Оценка:</span>
                  <span className={styles.detailValue}>{selectedTaskDetail.estimatedHours} ч</span>
                </div>
              )}
              
              {selectedTaskDetail.dueDate && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Дедлайн:</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedTaskDetail.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {selectedTaskDetail.tags.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Теги:</span>
                  <div className={styles.tagsList}>
                    {selectedTaskDetail.tags.map(tag => (
                      <span key={tag} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTaskDetail.projectId && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Проект:</span>
                  <span className={styles.detailValue}>
                    {projects.find(p => p.id === selectedTaskDetail.projectId)?.title || 'Неизвестно'}
                  </span>
                </div>
              )}
              
              {selectedTaskDetail.goalId && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Цель:</span>
                  <span className={styles.detailValue}>
                    {goals.find(g => g.id === selectedTaskDetail.goalId)?.title || 'Неизвестно'}
                  </span>
                </div>
              )}
            </div>
            
            <div className={styles.modalButtons}>
              <button 
                onClick={() => {
                  handleCloseTaskDetail();
                  setEditingTask(selectedTaskDetail);
                }} 
                className={styles.editButton}
              >
                ✎ Редактировать
              </button>
              <button 
                onClick={() => {
                  handleDeleteTask(selectedTaskDetail.id);
                  handleCloseTaskDetail();
                }} 
                className={styles.deleteButton}
              >
                🗑 Удалить
              </button>
              <button onClick={handleCloseTaskDetail} className={styles.closeButton}>
                Закрыть
              </button>
            </div>
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
                onDoubleClick={() => handleTaskDoubleClick(task)}
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
                onDoubleClick={() => handleTaskDoubleClick(task)}
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
                onDoubleClick={() => handleTaskDoubleClick(task)}
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
