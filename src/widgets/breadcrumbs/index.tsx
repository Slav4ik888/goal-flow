// src/widgets/breadcrumbs/index.tsx

import React from 'react';
import { useAppDispatch as useDispatch, useAppSelector } from '@app/providers/store';
import { uiActions } from '@entities/ui';
import styles from './index.module.scss';

interface BreadcrumbsProps {
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const dispatch = useDispatch();
  const navigationHistory = useAppSelector(state => state.ui.navigationHistory);
  const currentView = useAppSelector(state => state.ui.currentView);
  
  // Получаем данные из хранилища для отображения заголовков
  const goals = useAppSelector(state => state.goals.items);
  const projects = useAppSelector(state => state.projects.items);
  const tasks = useAppSelector(state => state.tasks.items);
  
  if (navigationHistory.length === 0 && currentView === 'tasks') {
    return null;
  }
  
  // Функция для получения названия элемента по ID
  const getItemTitle = (view: string, id?: string): string => {
    if (!id) return '';
    
    switch (view) {
      case 'goals':
        return goals.find(g => g.id === id)?.title || id;
      case 'projects':
        return projects.find(p => p.id === id)?.title || id;
      case 'tasks':
        return tasks.find(t => t.id === id)?.title || id;
      default:
        return id;
    }
  };
  
  // Обработчик клика по хлебной крошке
  const handleNavigateTo = (item: any, index: number) => {
    if (item.view === 'goals') {
      dispatch(uiActions.navigateToGoal({ id: item.id!, title: item.title || getItemTitle('goals', item.id) }));
    } else if (item.view === 'projects') {
      dispatch(uiActions.navigateToProject({ 
        id: item.id!, 
        title: item.title || getItemTitle('projects', item.id),
        goalId: item.parentId 
      }));
    }
    // Обрезаем историю до этого элемента
    for (let i = navigationHistory.length - 1; i > index; i--) {
      dispatch(uiActions.goBack());
    }
  };
  
  const handleBack = () => {
    dispatch(uiActions.goBack());
  };
  
  const handleHome = () => {
    dispatch(uiActions.goToRoot());
  };
  
  // Иконки для разных типов
  const getIcon = (view: string) => {
    switch (view) {
      case 'goals': return '🎯';
      case 'projects': return '📁';
      case 'tasks': return '✅';
      default: return '🏠';
    }
  };
  
  return (
    <div className={`${styles.breadcrumbs} ${className || ''}`}>
      <button onClick={handleHome} className={styles.homeButton} title="Все задачи">
        <span className={styles.homeIcon}>🏠</span>
      </button>
      
      <button onClick={handleBack} className={styles.backButton} title="Назад">
        ← Назад
      </button>
      
      <div className={styles.trail}>
        {navigationHistory.map((item, index) => {
          const isLast = index === navigationHistory.length - 1;
          const displayTitle = item.title || getItemTitle(item.view, item.id);
          
          return (
            <React.Fragment key={`${item.view}-${item.id}-${index}`}>
              <button
                onClick={() => handleNavigateTo(item, index)}
                className={`${styles.crumb} ${isLast ? styles.active : ''}`}
                disabled={isLast}
              >
                <span className={styles.crumbIcon}>{getIcon(item.view)}</span>
                <span className={styles.crumbTitle}>{displayTitle}</span>
              </button>
              {!isLast && <span className={styles.separator}>/</span>}
            </React.Fragment>
          );
        })}
        
        {/* Текущий уровень, если его нет в истории */}
        {navigationHistory.length === 0 && currentView !== 'tasks' && (
          <button className={`${styles.crumb} ${styles.active}`} disabled>
            <span className={styles.crumbIcon}>
              {currentView === 'goals' ? '🎯' : currentView === 'projects' ? '📁' : '✅'}
            </span>
            <span className={styles.crumbTitle}>
              {currentView === 'goals' ? 'Все цели' : currentView === 'projects' ? 'Все проекты' : 'Все задачи'}
            </span>
          </button>
        )}
      </div>
      
      {navigationHistory.length > 0 && (
        <button onClick={handleHome} className={styles.clearButton} title="Очистить навигацию">
          ✕
        </button>
      )}
    </div>
  );
};
