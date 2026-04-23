// src/features/goal-tracking/ui/goal-card/index.tsx

import React, { useState } from 'react';
import { useAppDispatch } from '@app/providers/store';
import type { Goal } from '@entities/goal/types';
import type { Task } from '@entities/task/types';
import { editGoal, removeGoal } from '@entities/goal';
import { calculateGoalProgress } from '../../lib/progress';
import styles from './index.module.scss';



interface GoalCardProps {
  goal: Goal;
  tasks: Task[];
  onClick?: (goal: Goal) => void;
  onEdit?: (goal: Goal) => void;
  onCreateProject?: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  tasks, 
  onClick, 
  onEdit,
  onCreateProject
}) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);

  const progress = calculateGoalProgress(goal.id, tasks);
  const relatedTasks = tasks.filter(t => t.goalId === goal.id);
  const completedTasks = relatedTasks.filter(t => t.status === 'done');
  const inProgressTasks = relatedTasks.filter(t => t.status === 'in-progress');

  const handleCardClick = () => {
    if (onClick) {
      onClick(goal);
    }
  };

  const handleCreateProject = (e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы не сработал onClick карточки
    if (onCreateProject) {
      onCreateProject(goal);
    }
  };

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = goal.status === 'active' ? 'completed' : 'active';
    await dispatch(editGoal({ id: goal.id, updates: { status: newStatus } }));
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Удалить цель "${goal.title}"? Связанные задачи не будут удалены.`)) {
      await dispatch(removeGoal(goal.id));
    }
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== goal.title) {
      await dispatch(editGoal({ id: goal.id, updates: { title: editTitle } }));
    }
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    switch (goal.status) {
      case 'active': return '🎯';
      case 'completed': return '✅';
      case 'archived': return '📦';
      default: return '🎯';
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('ru-RU');
  };

  const isOverdue = goal.targetDate && goal.targetDate < Date.now() && goal.status !== 'completed';

  return (
    <div 
      className={`${styles.card} ${styles[goal.status]} ${isExpanded ? styles.expanded : ''}`}
      onClick={handleCardClick}
    >
      <div className={styles.header}>
        <div className={styles.statusIcon}>{getStatusIcon()}</div>
        
        {isEditing ? (
          <div className={styles.editContainer} onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className={styles.editInput}
              autoFocus
              onKeyPress={e => e.key === 'Enter' && handleSaveEdit()}
            />
            <button onClick={handleSaveEdit} className={styles.saveButton}>✓</button>
            <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>✗</button>
          </div>
        ) : (
          <h3 className={styles.title}>{goal.title}</h3>
        )}

        <div className={styles.actions} onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setIsEditing(true)} 
            className={styles.iconButton}
            title="Редактировать"
          >
            ✎
          </button>
          <button 
            onClick={handleDelete} 
            className={`${styles.iconButton} ${styles.deleteButton}`}
            title="Удалить"
          >
            ×
          </button>
        </div>
      </div>

      {goal.description && (
        <div className={styles.description}>
          {goal.description}
        </div>
      )}

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Прогресс</span>
          <span className={styles.progressPercent}>{Math.round(progress.percent)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>✅ {completedTasks.length} выполнено</span>
          <span>🔄 {inProgressTasks.length} в работе</span>
          <span>📋 {relatedTasks.length} всего</span>
        </div>
      </div>

      {(goal.targetDate || goal.actualDate) && (
        <div className={styles.dates}>
          {goal.targetDate && (
            <div className={`${styles.date} ${isOverdue ? styles.overdue : ''}`}>
              <span className={styles.dateLabel}>🎯 Цель:</span>
              <span>{formatDate(goal.targetDate)}</span>
              {isOverdue && <span className={styles.overdueBadge}>Просрочено</span>}
            </div>
          )}
          {goal.actualDate && (
            <div className={styles.date}>
              <span className={styles.dateLabel}>✅ Выполнена:</span>
              <span>{formatDate(goal.actualDate)}</span>
            </div>
          )}
        </div>
      )}

      {isExpanded && relatedTasks.length > 0 && (
        <div className={styles.tasksList}>
          <div className={styles.tasksHeader}>Связанные задачи:</div>
          <div className={styles.tasks}>
            {relatedTasks.slice(0, 5).map(task => (
              <div key={task.id} className={styles.taskItem}>
                <span className={task.status === 'done' ? styles.taskDone : styles.taskPending}>
                  {task.status === 'done' ? '✓' : '○'}
                </span>
                <span className={task.status === 'done' ? styles.taskTitleDone : styles.taskTitle}>
                  {task.title}
                </span>
              </div>
            ))}
            {relatedTasks.length > 5 && (
              <div className={styles.moreTasks}>
                + ещё {relatedTasks.length - 5} задач
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
            className={styles.expandButton}
          >
            {isExpanded ? 'Скрыть детали ▲' : 'Показать детали ▼'}
          </button>
          
          {/* Кнопка создания проекта */}
          <button 
            onClick={handleCreateProject}
            className={styles.createProjectButton}
            title="Создать проект для этой цели"
          >
            ➕ Проект
          </button>
        </div>
        
        <div className={styles.footerRight}>
          {goal.status === 'active' && (
            <button onClick={handleStatusToggle} className={styles.completeButton}>
              Отметить выполненной
            </button>
          )}
          
          {goal.status === 'completed' && (
            <button onClick={handleStatusToggle} className={styles.reactivateButton}>
              Реактивировать
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// export const GoalCard: React.FC<GoalCardProps> = ({ goal, tasks, onClick }) => {
//   const dispatch = useAppDispatch();
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editTitle, setEditTitle] = useState(goal.title);

//   const progress = calculateGoalProgress(goal.id, tasks);
//   const relatedTasks = tasks.filter(t => t.goalId === goal.id);
//   const completedTasks = relatedTasks.filter(t => t.status === 'done');
//   const inProgressTasks = relatedTasks.filter(t => t.status === 'in-progress');

//   const handleCardClick = () => {
//     if (onClick) {
//       onClick();
//     }
//   };
  
//   const handleStatusToggle = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     const newStatus = goal.status === 'active' ? 'completed' : 'active';
//     await dispatch(editGoal({ id: goal.id, updates: { status: newStatus } }));
//   };

//   const handleDelete = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (confirm(`Удалить цель "${goal.title}"? Связанные задачи не будут удалены.`)) {
//       await dispatch(removeGoal(goal.id));
//     }
//   };

//   const handleSaveEdit = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//     e.stopPropagation();
//     if (editTitle.trim() && editTitle !== goal.title) {
//       await dispatch(editGoal({ id: goal.id, updates: { title: editTitle } }));
//     }
//     setIsEditing(false);
//   };

//   const getStatusIcon = () => {
//     switch (goal.status) {
//       case 'active': return '🎯';
//       case 'completed': return '✅';
//       case 'archived': return '📦';
//       default: return '🎯';
//     }
//   };

//   const formatDate = (timestamp?: number) => {
//     if (!timestamp) return null;
//     return new Date(timestamp).toLocaleDateString('ru-RU');
//   };

//   const isOverdue = goal.targetDate && goal.targetDate < Date.now() && goal.status !== 'completed';

//   return (
//     <div
//       className={`${styles.card} ${styles[goal.status]} ${isExpanded ? styles.expanded : ''}`}
//       onClick={handleCardClick}
//     >
//       <div className={styles.header}>
//         <div className={styles.statusIcon}>{getStatusIcon()}</div>
        
//         {isEditing ? (
//           <div className={styles.editContainer}>
//             <input
//               type="text"
//               value={editTitle}
//               onChange={e => setEditTitle(e.target.value)}
//               className={styles.editInput}
//               autoFocus
//               onKeyPress={e => e.key === 'Enter' && handleSaveEdit(e)}
//             />
//             <button onClick={handleSaveEdit} className={styles.saveButton}>✓</button>
//             <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>✗</button>
//           </div>
//         ) : (
//           <h3 className={styles.title} onClick={() => setIsExpanded(!isExpanded)}>
//             {goal.title}
//           </h3>
//         )}

//         <div className={styles.actions}>
//           <button
//             className={styles.iconButton}
//             title="Редактировать"
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsEditing(true);
//             }}
//           >
//             ✎
//           </button>
//           <button 
//             className={`${styles.iconButton} ${styles.deleteButton}`}
//             title="Удалить"
//             onClick={(e) => handleDelete(e)}
//           >
//             ×
//           </button>
//         </div>
//       </div>

//       {goal.description && (
//         <div className={styles.description}>
//           {goal.description}
//         </div>
//       )}

//       <div className={styles.progressSection}>
//         <div className={styles.progressHeader}>
//           <span className={styles.progressLabel}>Прогресс</span>
//           <span className={styles.progressPercent}>{Math.round(progress.percent)}%</span>
//         </div>
//         <div className={styles.progressBar}>
//           <div 
//             className={styles.progressFill} 
//             style={{ width: `${progress.percent}%` }}
//           />
//         </div>
//         <div className={styles.progressStats}>
//           <span>✅ {completedTasks.length} выполнено</span>
//           <span>🔄 {inProgressTasks.length} в работе</span>
//           <span>📋 {relatedTasks.length} всего</span>
//         </div>
//       </div>

//       {(goal.targetDate || goal.actualDate) && (
//         <div className={styles.dates}>
//           {goal.targetDate && (
//             <div className={`${styles.date} ${isOverdue ? styles.overdue : ''}`}>
//               <span className={styles.dateLabel}>🎯 Цель:</span>
//               <span>{formatDate(goal.targetDate)}</span>
//               {isOverdue && <span className={styles.overdueBadge}>Просрочено</span>}
//             </div>
//           )}
//           {goal.actualDate && (
//             <div className={styles.date}>
//               <span className={styles.dateLabel}>✅ Выполнена:</span>
//               <span>{formatDate(goal.actualDate)}</span>
//             </div>
//           )}
//         </div>
//       )}

//       {isExpanded && relatedTasks.length > 0 && (
//         <div className={styles.tasksList}>
//           <div className={styles.tasksHeader}>Связанные задачи:</div>
//           <div className={styles.tasks}>
//             {relatedTasks.slice(0, 5).map(task => (
//               <div key={task.id} className={styles.taskItem}>
//                 <span className={task.status === 'done' ? styles.taskDone : styles.taskPending}>
//                   {task.status === 'done' ? '✓' : '○'}
//                 </span>
//                 <span className={task.status === 'done' ? styles.taskTitleDone : styles.taskTitle}>
//                   {task.title}
//                 </span>
//               </div>
//             ))}
//             {relatedTasks.length > 5 && (
//               <div className={styles.moreTasks}>
//                 + ещё {relatedTasks.length - 5} задач
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div className={styles.footer}>
//         <button 
//           className={styles.expandButton}
//           onClick={(e) => {
//             e.stopPropagation();
//             setIsExpanded(!isExpanded)
//           }}
//         >
//           {isExpanded ? 'Скрыть детали ▲' : 'Показать детали ▼'}
//         </button>
        
//         {goal.status === 'active' && (
//           <button onClick={(e) => handleStatusToggle(e)} className={styles.completeButton}>
//             Отметить выполненной
//           </button>
//         )}
        
//         {goal.status === 'completed' && (
//           <button onClick={(e) => handleStatusToggle(e)} className={styles.reactivateButton}>
//             Реактивировать
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };
