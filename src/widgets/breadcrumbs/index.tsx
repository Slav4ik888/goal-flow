// src/widgets/breadcrumbs/index.tsx

import React from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { uiActions } from '@entities/ui';
import styles from './index.module.scss';


export const Breadcrumbs: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigationStack = useAppSelector(state => state.ui.navigationStack);
  const currentView = useAppSelector(state => state.ui.currentView);

  if (navigationStack.length === 0) return null;

  const handleNavigateTo = (index: number) => {
    // Удаляем все элементы после выбранного
    for (let i = navigationStack.length - 1; i > index; i--) {
      dispatch(uiActions.popFromStack());
    }
  };

  const handleBack = () => {
    dispatch(uiActions.popFromStack());
  };

  const handleClear = () => {
    dispatch(uiActions.clearStack());
  };

  return (
    <div className={styles.breadcrumbs}>
      <button onClick={handleBack} className={styles.backButton} title="Назад">
        ← Назад
      </button>
      
      <div className={styles.trail}>
        {navigationStack.map((item, index) => (
          <React.Fragment key={`${item.view}-${item.id}`}>
            <button
              onClick={() => handleNavigateTo(index)}
              className={`${styles.crumb} ${index === navigationStack.length - 1 ? styles.active : ''}`}
            >
              {item.view === 'goals' && '🎯'}
              {item.view === 'projects' && '📁'}
              {item.view === 'tasks' && '✅'}
              {item.title || (item.view === 'goals' ? 'Цели' : item.view === 'projects' ? 'Проекты' : 'Задачи')}
            </button>
            {index < navigationStack.length - 1 && <span className={styles.separator}>/</span>}
          </React.Fragment>
        ))}
      </div>

      {navigationStack.length > 0 && (
        <button onClick={handleClear} className={styles.clearButton} title="Очистить навигацию">
          ✕
        </button>
      )}
    </div>
  );
};
