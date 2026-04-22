// src/widgets/header/index.tsx

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { uiActions, type ViewType } from '@entities/ui';
import styles from './index.module.scss';
import { clearAllData, initializeMockData } from '@shared/mocks/init';
import { fetchGoals } from '@entities/goal';
import { fetchProjects } from '@entities/project';
import { fetchTasks } from '@entities/task';

interface HeaderProps {
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  onQuickCapture?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView: propView, onViewChange, onQuickCapture }) => {
  const dispatch = useAppDispatch();
  const storeView = useAppSelector(state => state.ui.currentView);
  const currentView = propView ?? storeView;
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMockConfirm, setShowMockConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewChange = (view: ViewType) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      dispatch(uiActions.setCurrentView(view));
    }
  };

  const handleOpenPalette = () => {
    dispatch(uiActions.setCommandPaletteOpen(true));
  };

  const handleClearDatabase = async () => {
    setIsLoading(true);
    try {
      // Очищаем базу данных
      await clearAllData();
      
      // Перезагружаем пустые данные в Redux store
      await dispatch(fetchGoals());
      await dispatch(fetchProjects());
      await dispatch(fetchTasks());
      
      // Закрываем подтверждение
      setShowClearConfirm(false);
      
      // Показываем уведомление об успехе
      alert('🗑️ База данных успешно очищена');
    } catch (error) {
      console.error('Failed to clear database:', error);
      alert('❌ Ошибка при очистке базы данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillWithMocks = async () => {
    setIsLoading(true);
    try {
      // Наполняем базу моками
      const result = await initializeMockData();
      
      if (result) {
        // Перезагружаем данные в Redux store
        await dispatch(fetchGoals());
        await dispatch(fetchProjects());
        await dispatch(fetchTasks());
        
        // Закрываем подтверждение
        setShowMockConfirm(false);
        
        alert('📦 База данных успешно наполнена тестовыми данными');
      } else {
        alert('⚠️ В базе уже есть данные. Очистите базу перед наполнением моками.');
      }
    } catch (error) {
      console.error('Failed to fill with mocks:', error);
      alert('❌ Ошибка при наполнении базы данных');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🏆</span>
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
          <button 
            className={styles.quickAdd} 
            onClick={onQuickCapture}
            title="Быстрая задача (N)"
          >
            +
          </button>
          <button 
            className={styles.mockButton} 
            onClick={() => setShowMockConfirm(true)}
            title="Наполнить базу тестовыми данными"
            disabled={isLoading}
          >
            📦
          </button>
          <button 
            className={styles.clearButton} 
            onClick={() => setShowClearConfirm(true)}
            title="Очистить все данные"
            disabled={isLoading}
          >
            🗑️
          </button>
        </div>
      </header>

      {/* Модальное окно подтверждения очистки */}
      {showClearConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowClearConfirm(false)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>🗑️</div>
            <h3 className={styles.confirmTitle}>Очистка базы данных</h3>
            <p className={styles.confirmMessage}>
              Внимание! При нажатии будут безвозвратно удалены:
              <br />
              • Все цели
              <br />
              • Все проекты
              <br />
              • Все задачи
              <br />
              • Все записи времени
              <br />
              <strong>Это действие необратимо!</strong>
            </p>
            <div className={styles.confirmButtons}>
              <button 
                className={styles.cancelConfirmButton}
                onClick={() => setShowClearConfirm(false)}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button 
                className={styles.clearConfirmButton}
                onClick={handleClearDatabase}
                disabled={isLoading}
              >
                {isLoading ? 'Очистка...' : 'Очистить всё'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения наполнения моками */}
      {showMockConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowMockConfirm(false)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>📦</div>
            <h3 className={styles.confirmTitle}>Наполнение тестовыми данными</h3>
            <p className={styles.confirmMessage}>
              Будут добавлены следующие тестовые данные:
              <br />
              • 5 целей (3 активные, 1 выполненная, 1 архивная)
              <br />
              • 19 проектов (с привязкой к целям)
              <br />
              • 40+ задач (разных статусов и приоритетов)
              <br />
              • 15 задач без привязки к целям
              <br />
              <strong>Существующие данные будут перезаписаны!</strong>
            </p>
            <div className={styles.confirmButtons}>
              <button 
                className={styles.cancelConfirmButton}
                onClick={() => setShowMockConfirm(false)}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button 
                className={styles.mockConfirmButton}
                onClick={handleFillWithMocks}
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Наполнить данными'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
