// src/widgets/filters/index.tsx
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { uiActions } from '@entities/ui';
import { getActiveFilters } from '@features/filters/lib/query-parser';
import styles from './index.module.scss';



export const FilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filterQuery = useAppSelector(state => state.ui.filterQuery);
  const searchQuery = useAppSelector(state => state.ui.searchQuery);
  const [showSyntax, setShowSyntax] = useState(false);
  const [localFilterInput, setLocalFilterInput] = useState(filterQuery);
  const selectedGoalId = useAppSelector(state => state.ui.selectedGoalId);
  const selectedProjectId = useAppSelector(state => state.ui.selectedProjectId);

  const activeFilters = getActiveFilters(filterQuery);
  const hasActiveFilters = filterQuery !== '' || searchQuery !== '';

  const handleFilterApply = () => {
    dispatch(uiActions.setFilterQuery(localFilterInput));
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilterApply();
    }
  };

  const handleClearFilter = () => {
    setLocalFilterInput('');
    dispatch(uiActions.setFilterQuery(''));
  };

  const handleRemoveFilter = (filterValue: string) => {
    const newQuery = filterQuery.replace(filterValue, '').trim();
    setLocalFilterInput(newQuery);
    dispatch(uiActions.setFilterQuery(newQuery));
  };

  const presets = [
    { label: 'Все задачи', query: '' },
    { label: '📅 Сегодня', query: 'due:today' },
    { label: '📅 Эта неделя', query: 'due:week' },
    { label: '⚠️ Просроченные', query: 'due:overdue' },
    { label: '🔥 Высокий приоритет', query: 'priority:P0 priority:P1' },
    { label: '🎯 Без цели', query: 'goal:none' },
    { label: '📁 Без проекта', query: 'project:none' },
    { label: '⏱ >4 часа', query: '>4h' },
  ];

  return (
    <div className={styles.filterBar}>
      {/* Поиск */}
      <div className={styles.searchSection}>
        <div className={styles.searchIcon}>🔍</div>
        <input
          type="text"
          placeholder="Поиск задач..."
          value={searchQuery}
          onChange={(e) => dispatch(uiActions.setSearchQuery(e.target.value))}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            className={styles.clearSearch}
            onClick={() => dispatch(uiActions.setSearchQuery(''))}
            title="Очистить поиск"
          >
            ✕
          </button>
        )}
      </div>

      { (selectedGoalId || selectedProjectId) && (
        <button 
          onClick={() => dispatch(uiActions.goToAllTasks())}
          className={styles.resetNavigationButton}
        >
          ← Показать все задачи
        </button>
      )}
      
      {/* Фильтр с синтаксисом */}
      <div className={styles.filterSection}>
        <div className={styles.filterIcon}>🎛️</div>
        <input
          type="text"
          value={localFilterInput}
          onChange={(e) => setLocalFilterInput(e.target.value)}
          onKeyDown={handleFilterKeyDown}
          placeholder='#tag project:название >4h due:today priority:P0'
          className={styles.filterInput}
        />
        <button onClick={handleFilterApply} className={styles.applyButton}>
          Применить
        </button>
        {(filterQuery || localFilterInput) && (
          <button onClick={handleClearFilter} className={styles.clearFilter} title="Очистить фильтры">
            ✕
          </button>
        )}
      </div>

      {/* Пресеты */}
      <div className={styles.presets}>
        {presets.map(preset => (
          <button
            key={preset.label}
            onClick={() => {
              setLocalFilterInput(preset.query);
              dispatch(uiActions.setFilterQuery(preset.query));
            }}
            className={`${styles.presetButton} ${filterQuery === preset.query ? styles.active : ''}`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowSyntax(!showSyntax)}
          className={`${styles.syntaxButton} ${showSyntax ? styles.active : ''}`}
        >
          {showSyntax ? '📖 Скрыть синтаксис' : '💡 Синтаксис фильтров'}
        </button>
      </div>

      {/* Активные фильтры в виде чипсов */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {searchQuery && (
            <div className={styles.filterChip}>
              <span>🔍 "{searchQuery}"</span>
              <button onClick={() => dispatch(uiActions.setSearchQuery(''))} className={styles.chipRemove}>×</button>
            </div>
          )}
          {activeFilters.map(filter => (
            <div key={filter.value} className={styles.filterChip}>
              <span>{filter.label}</span>
              <button onClick={() => handleRemoveFilter(filter.value)} className={styles.chipRemove}>×</button>
            </div>
          ))}
          {(filterQuery || searchQuery) && (
            <button onClick={() => {
              dispatch(uiActions.setFilterQuery(''));
              dispatch(uiActions.setSearchQuery(''));
              setLocalFilterInput('');
            }} className={styles.clearAllButton}>
              Очистить всё
            </button>
          )}
        </div>
      )}
      
      {/* Показываем дополнительную информацию о текущей навигации */}
      {selectedGoalId && (
        <div className={styles.navigationInfo}>
          🎯 Показаны задачи цели
        </div>
      )}
      {selectedProjectId && (
        <div className={styles.navigationInfo}>
          📁 Показаны задачи проекта
        </div>
      )}

      {/* Справка по синтаксису */}
      {showSyntax && (
        <div className={styles.syntaxHelp}>
          <div className={styles.syntaxTitle}>📖 Синтаксис фильтров:</div>
          <div className={styles.syntaxGrid}>
            <div className={styles.syntaxItem}>
              <code>#urgent</code> — фильтр по тегу
            </div>
            <div className={styles.syntaxItem}>
              <code>project:название</code> — фильтр по проекту
            </div>
            <div className={styles.syntaxItem}>
              <code>goal:название</code> — фильтр по цели
            </div>
            <div className={styles.syntaxItem}>
              <code>priority:P0</code> — фильтр по приоритету (P0-P3)
            </div>
            <div className={styles.syntaxItem}>
              <code>&gt;4h</code> — задачи с временем больше 4 часов
            </div>
            <div className={styles.syntaxItem}>
              <code>&lt;2h</code> — задачи с временем меньше 2 часов
            </div>
            <div className={styles.syntaxItem}>
              <code>due:today</code> — задачи на сегодня
            </div>
            <div className={styles.syntaxItem}>
              <code>due:week</code> — задачи на эту неделю
            </div>
            <div className={styles.syntaxItem}>
              <code>due:overdue</code> — просроченные задачи
            </div>
            <div className={styles.syntaxItem}>
              <code>status:todo</code> — задачи в статусе "к выполнению"
            </div>
            <div className={styles.syntaxItem}>
              <code>goal:none</code> — задачи без цели
            </div>
            <div className={styles.syntaxItem}>
              <code>project:none</code> — задачи без проекта
            </div>
          </div>
          <div className={styles.syntaxExample}>
            Пример: <code>#frontend priority:P0 due:week</code>
          </div>
        </div>
      )}
    </div>
  );
};
