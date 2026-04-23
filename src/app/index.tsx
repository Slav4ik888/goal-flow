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
import { Breadcrumbs } from '@widgets/breadcrumbs';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { SettingsSpace } from '@pages/settings';
import styles from './index.module.scss';



export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isPaletteOpen = useAppSelector(state => state.ui.isCommandPaletteOpen);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  // Инициализация базы данных и моков при первом запуске
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Инициализируем базу данных
        await initDB();
        // Загружаем моки только если база пуста
        await initializeMockData();
      }
      catch (error) {
        console.error('Failed to initialize app:', error);
      }
      finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();
  }, []);

  // Используем react-hotkeys-hook для глобальных хоткеев
  useHotkeys('cmd+k,ctrl+k', (e) => {
    e.preventDefault();
    console.log('Ctrl+K pressed'); // Для отладки
    dispatch(uiActions.setCommandPaletteOpen(!isPaletteOpen));
  });
  
  useHotkeys('cmd+g,ctrl+g', (e) => {
    e.preventDefault();
    console.log('Ctrl+G pressed');
    navigate('/goals');
  });
  
  useHotkeys('cmd+p,ctrl+p', (e) => {
    e.preventDefault();
    console.log('Ctrl+P pressed');
    navigate('/projects');
  });
  
  useHotkeys('cmd+t,ctrl+t', (e) => {
    e.preventDefault();
    console.log('Ctrl+T pressed');
    navigate('/tasks');
  });
  
  useHotkeys('cmd+e,ctrl+e', (e) => {
    e.preventDefault();
    console.log('Ctrl+E pressed');
    navigate('/settings');
  });

  useHotkeys('escape', () => {
    if (isPaletteOpen) {
      dispatch(uiActions.setCommandPaletteOpen(false));
    }
    if (isQuickCaptureOpen) {
      setIsQuickCaptureOpen(false);
    }
  });

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
      <Breadcrumbs />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<GoalsSpace />} />
          <Route path="/tasks" element={<TasksSpace />} />
          <Route path="/goals" element={<GoalsSpace />} />
          <Route path="/projects" element={<ProjectsSpace />} />
          <Route path="/settings" element={<SettingsSpace />} />
        </Routes>
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
