// src/app/index.tsx

import React from 'react';
import { Provider } from 'react-redux';
import { store, useAppSelector, useAppDispatch, setCommandPaletteOpen } from '@app/providers/store';
import { Header } from '@widgets/header';
import { GoalsSpace } from '@pages/goals';
import { TasksSpace } from '@pages/tasks';
import { ProjectsSpace } from '@pages/projects';
import { CommandPalette } from '@widgets/command-palette';
import { useHotkeys } from 'react-hotkeys-hook';
import styles from './app.module.scss';



const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(state => state.ui.currentView);
  const isPaletteOpen = useAppSelector(state => state.ui.isCommandPaletteOpen);

  useHotkeys('cmd+k,ctrl+k', (e) => {
    e.preventDefault();
    dispatch(setCommandPaletteOpen(!isPaletteOpen));
  });

  useHotkeys('escape', () => {
    if (isPaletteOpen) {
      dispatch(setCommandPaletteOpen(false));
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

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {renderContent()}
      </main>
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => dispatch(setCommandPaletteOpen(false))}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};
