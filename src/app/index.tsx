// src/app/index.tsx

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@app/providers/store';
import { Header } from '@widgets/header';
import { GoalsSpace } from '@pages/goals';
import { TasksSpace } from '@pages/tasks';
import { ProjectsSpace } from '@pages/projects';
import { CommandPalette } from '@widgets/command-palette';
import { useHotkeys } from 'react-hotkeys-hook';
import { uiActions } from '@entities/ui';
import { QuickCapture } from '@features/quick-capture';
import { initDB } from '@shared/lib/db';
import { initializeMockData } from '@shared/mocks/init';
import styles from './index.module.scss';



export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(state => state.ui.currentView);
  const isPaletteOpen = useAppSelector(state => state.ui.isCommandPaletteOpen);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Инициализация базы данных и моков при первом запуске
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Инициализируем базу данных
        await initDB();
        
        // Загружаем моки только если база пуста
        await initializeMockData();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();
  }, []);

  useHotkeys('cmd+k,ctrl+k', (e) => {
    e.preventDefault();
    dispatch(uiActions.setCommandPaletteOpen(!isPaletteOpen));
  });

  useHotkeys('n', (e) => {
    e.preventDefault();
    setIsQuickCaptureOpen(true);
  });

  useHotkeys('escape', () => {
    if (isPaletteOpen) {
      dispatch(uiActions.setCommandPaletteOpen(false));
    }
    if (isQuickCaptureOpen) {
      setIsQuickCaptureOpen(false);
    }
  });

  const renderContent = () => {
    switch (currentView) {
      case 'goals':
        return <GoalsSpace />;
      case 'projects':
        return <ProjectsSpace />;
      case 'tasks':
        return <TasksSpace />;
      default:
        return <TasksSpace />;
    }
  };

  // Показываем индикатор загрузки во время инициализации
  if (isInitializing) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка GoalFlow...</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Header onQuickCapture={() => setIsQuickCaptureOpen(true)} />
      <main className={styles.main}>
        {renderContent()}
      </main>
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => dispatch(uiActions.setCommandPaletteOpen(false))}
      />
      <QuickCapture 
        isOpen={isQuickCaptureOpen} 
        onClose={() => setIsQuickCaptureOpen(false)}
      />
    </div>
  );
};
