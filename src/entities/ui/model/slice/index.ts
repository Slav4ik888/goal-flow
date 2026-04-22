// src/app/providers/store/ui-slice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export type ViewType = 'goals' | 'projects' | 'tasks';
export type NavigationStackItem = {
  view: ViewType;
  id?: string;
  title?: string;
  parentId?: string;
};

export interface StateSchemaUI {
  currentView: ViewType;
  navigationHistory: NavigationStackItem[];
  isCommandPaletteOpen: boolean;
  searchQuery: string;
  filterQuery: string;
  selectedTaskId: string | null;
  selectedProjectId: string | null;
  selectedGoalId: string | null;
  // Режим отображения: 'all' - все, 'filtered' - отфильтрованные по выбранному элементу
  displayMode: 'all' | 'filtered';
}

const initialState: StateSchemaUI = {
  currentView: 'tasks',
  navigationHistory: [],
  isCommandPaletteOpen: false,
  searchQuery: '',
  filterQuery: '',
  selectedTaskId: null,
  selectedProjectId: null,
  selectedGoalId: null,
  displayMode: 'all',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<ViewType>) {
      state.currentView = action.payload;
    },
    
    // Навигация на цель - показываем задачи и проекты этой цели
    navigateToGoal(state, action: PayloadAction<{ id: string; title: string }>) {
      const { id, title } = action.payload;
      
      // Проверяем дубликат
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      if (lastItem?.view === 'goals' && lastItem?.id === id) return;
      
      // Обрезаем историю если элемент уже есть
      const existingIndex = state.navigationHistory.findIndex(
        item => item.view === 'goals' && item.id === id
      );
      
      if (existingIndex !== -1) {
        state.navigationHistory = state.navigationHistory.slice(0, existingIndex + 1);
      } else {
        state.navigationHistory.push({ view: 'goals', id, title });
      }
      
      state.selectedGoalId = id;
      state.selectedProjectId = null;
      state.selectedTaskId = null;
      state.currentView = 'tasks'; // Переключаемся на задачи
      state.displayMode = 'filtered';
      // Устанавливаем фильтр по цели
      state.filterQuery = `goal:${id}`;
    },
    
    // Навигация на проект - показываем задачи этого проекта
    navigateToProject(state, action: PayloadAction<{ id: string; title: string; goalId?: string; goalTitle?: string }>) {
      const { id, title, goalId } = action.payload;
      
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      if (lastItem?.view === 'projects' && lastItem?.id === id) return;
      
      const existingIndex = state.navigationHistory.findIndex(
        item => item.view === 'projects' && item.id === id
      );
      
      if (existingIndex !== -1) {
        state.navigationHistory = state.navigationHistory.slice(0, existingIndex + 1);
      } else {
        state.navigationHistory.push({ view: 'projects', id, title, parentId: goalId });
      }
      
      state.selectedProjectId = id;
      state.selectedTaskId = null;
      state.currentView = 'tasks';
      state.displayMode = 'filtered';
      state.filterQuery = `project:${id}`;
    },
    
    // Навигация на задачу - открываем детальный просмотр
    navigateToTask(state, action: PayloadAction<{ id: string; title: string; projectId?: string }>) {
      const { id, title, projectId } = action.payload;
      
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      if (lastItem?.view === 'tasks' && lastItem?.id === id) return;
      
      const existingIndex = state.navigationHistory.findIndex(
        item => item.view === 'tasks' && item.id === id
      );
      
      if (existingIndex !== -1) {
        state.navigationHistory = state.navigationHistory.slice(0, existingIndex + 1);
      } else {
        state.navigationHistory.push({ view: 'tasks', id, title, parentId: projectId });
      }
      
      state.selectedTaskId = id;
      state.currentView = 'tasks';
      state.displayMode = 'filtered';
      // Фильтруем до одной конкретной задачи
      state.filterQuery = `id:${id}`;
    },
    
    // Возврат к просмотру всех задач
    goToAllTasks(state) {
      state.navigationHistory = [];
      state.selectedGoalId = null;
      state.selectedProjectId = null;
      state.selectedTaskId = null;
      state.currentView = 'tasks';
      state.displayMode = 'all';
      state.filterQuery = '';
    },
    
    goBack(state) {
      if (state.navigationHistory.length === 0) return;
      
      state.navigationHistory.pop();
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      
      if (lastItem) {
        state.currentView = lastItem.view;
        if (lastItem.view === 'goals') {
          state.selectedGoalId = lastItem.id || null;
          state.selectedProjectId = null;
          state.filterQuery = `goal:${lastItem.id}`;
        } else if (lastItem.view === 'projects') {
          state.selectedProjectId = lastItem.id || null;
          state.selectedGoalId = null;
          state.filterQuery = `project:${lastItem.id}`;
        } else if (lastItem.view === 'tasks') {
          state.selectedTaskId = lastItem.id || null;
          state.filterQuery = `id:${lastItem.id}`;
        }
        state.displayMode = 'filtered';
      } else {
        state.currentView = 'tasks';
        state.selectedGoalId = null;
        state.selectedProjectId = null;
        state.selectedTaskId = null;
        state.displayMode = 'all';
        state.filterQuery = '';
      }
    },
    
    goToRoot(state) {
      state.navigationHistory = [];
      state.currentView = 'tasks';
      state.selectedGoalId = null;
      state.selectedProjectId = null;
      state.selectedTaskId = null;
      state.displayMode = 'all';
      state.filterQuery = '';
    },
    
    // Остальные редьюсеры...
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.isCommandPaletteOpen = action.payload;
    },
    
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    
    setFilterQuery(state, action: PayloadAction<string>) {
      state.filterQuery = action.payload;
    },
    
    setSelectedTaskId(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },
    
    setSelectedProjectId(state, action: PayloadAction<string | null>) {
      state.selectedProjectId = action.payload;
    },
    
    setSelectedGoalId(state, action: PayloadAction<string | null>) {
      state.selectedGoalId = action.payload;
    },
    
    setDisplayMode(state, action: PayloadAction<'all' | 'filtered'>) {
      state.displayMode = action.payload;
    },
  },
});


export const { actions, reducer } = uiSlice;
