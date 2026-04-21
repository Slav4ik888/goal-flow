// src/widgets/header/index.tsx

import React from 'react';
import { useAppDispatch, useAppSelector, setCurrentView, setCommandPaletteOpen, ViewType } from '@app/store';
import styles from './index.module.scss';

interface HeaderProps {
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView: propView, onViewChange }) => {
  const dispatch = useAppDispatch();
  const storeView = useAppSelector(state => state.ui.currentView);
  const currentView = propView ?? storeView;

  const handleViewChange = (view: ViewType) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      dispatch(setCurrentView(view));
    }
  };

  const handleOpenPalette = () => {
    dispatch(setCommandPaletteOpen(true));
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🎯</span>
        <span className={styles.logoText}>GoalFlow</span>
      </div>

      <nav className={styles.nav}>
        <button
          className={`${styles.navButton} ${currentView === 'goals' ? styles.active : ''}`}
          onClick={() => handleViewChange('goals')}
        >
          🎯 Цели
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'projects' ? styles.active : ''}`}
          onClick={() => handleViewChange('projects')}
        >
          📁 Проекты
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'tasks' ? styles.active : ''}`}
          onClick={() => handleViewChange('tasks')}
        >
          ✅ Задачи
        </button>
      </nav>

      <div className={styles.actions}>
        <button className={styles.searchButton} onClick={handleOpenPalette}>
          <span className={styles.shortcut}>⌘K</span>
          <span>Поиск</span>
        </button>
        <button className={styles.quickAdd} onClick={handleOpenPalette}>
          +
        </button>
      </div>
    </header>
  );
};
