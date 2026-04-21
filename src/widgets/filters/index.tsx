// src/widgets/filters/index.tsx
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { uiActions } from '@entities/ui';
import styles from './index.module.scss';

export const FilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filterQuery = useAppSelector(state => state.ui.filterQuery);
  const searchQuery = useAppSelector(state => state.ui.searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presets = [
    { label: 'Все задачи', query: '' },
    { label: 'Сегодня', query: 'due:today' },
    { label: 'Эта неделя', query: 'due:week' },
    { label: 'Просроченные', query: 'due:overdue' },
    { label: 'Высокий приоритет', query: 'priority:P0 priority:P1' },
    { label: 'Без цели', query: 'goal:none' },
    { label: '> 4 часов', query: '>4h' },
  ];

  const handlePresetClick = (query: string) => {
    dispatch(uiActions.setFilterQuery(query));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(uiActions.setSearchQuery(e.target.value));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(uiActions.setFilterQuery(e.target.value));
  };

  const clearFilters = () => {
    dispatch(uiActions.setFilterQuery(''));
    dispatch(uiActions.setSearchQuery(''));
  };

  const hasActiveFilters = filterQuery !== '' || searchQuery !== '';

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchSection}>
        <div className={styles.searchIcon}>🔍</div>
        <input
          id="global-search"
          type="text"
          placeholder="Поиск задач... (поддерживает #теги project:название >4h due:today)"
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        {hasActiveFilters && (
          <button onClick={clearFilters} className={styles.clearButton} title="Очистить фильтры">
            ✕
          </button>
        )}
      </div>

      <div className={styles.presets}>
        {presets.map(preset => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.query)}
            className={`${styles.presetButton} ${filterQuery === preset.query ? styles.active : ''}`}
          >
            {preset.label}
          </button>
        ))}
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`${styles.presetButton} ${showAdvanced ? styles.active : ''}`}
        >
          {showAdvanced ? '📝 Скрыть синтаксис' : '💡 Синтаксис фильтров'}
        </button>
      </div>

      {showAdvanced && (
        <div className={styles.syntaxHelp}>
          <div className={styles.syntaxTitle}>📖 Синтаксис фильтров:</div>
          <div className={styles.syntaxGrid}>
            <div className={styles.syntaxItem}>
              <code>#tag</code> — фильтр по тегу
            </div>
            <div className={styles.syntaxItem}>
              <code>project:название</code> — фильтр по проекту
            </div>
            <div className={styles.syntaxItem}>
              <code>&gt;4h</code> — задачи с временем больше 4 часов
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
          </div>
        </div>
      )}

      <div className={styles.activeFilters}>
        {filterQuery && (
          <div className={styles.filterChip}>
            <span>Фильтр: {filterQuery}</span>
            <button onClick={() => dispatch(uiActions.setFilterQuery(''))} className={styles.chipRemove}>×</button>
          </div>
        )}
        {searchQuery && (
          <div className={styles.filterChip}>
            <span>Поиск: "{searchQuery}"</span>
            <button onClick={() => dispatch(uiActions.setSearchQuery(''))} className={styles.chipRemove}>×</button>
          </div>
        )}
      </div>
    </div>
  );
};
