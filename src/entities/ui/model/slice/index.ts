// src/app/providers/store/ui-slice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export type ViewType = 'goals' | 'projects' | 'tasks';
export type NavigationStackItem = {
  view: ViewType;
  id?: string; // id выбранного элемента (проекта, цели)
  title?: string;
  parentId?: string; // <-- добавить для связи
};

export interface StateSchemaUI {
  currentView: ViewType;
  navigationHistory: NavigationStackItem[];
  isCommandPaletteOpen: boolean;
  searchQuery: string;
  filterQuery: string;
  selectedTaskId: string | null;
  selectedProjectId: string | null;  // <-- добавить для отслеживания выбранного проекта
  selectedGoalId: string | null;      // <-- добавить для отслеживания выбранной цели
}

const initialState: StateSchemaUI = {
  currentView: 'tasks',
  navigationHistory: [],
  isCommandPaletteOpen: false,
  searchQuery: '',
  filterQuery: '',
  selectedTaskId: null,
  selectedProjectId: null,
  selectedGoalId: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<ViewType>) {
      state.currentView = action.payload;
    },
    // Навигация по иерархии
    navigateToGoal(state, action: PayloadAction<{ id: string; title: string }>) {
      state.selectedGoalId = action.payload.id;
      state.selectedProjectId = null;
      state.selectedTaskId = null;
      state.currentView = 'goals';
      
      // Добавляем в историю, если ещё не там
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      if (!lastItem || lastItem.id !== action.payload.id || lastItem.view !== 'goals') {
        state.navigationHistory.push({
          view: 'goals',
          id: action.payload.id,
          title: action.payload.title,
        });
      }
    },
    
    navigateToProject(state, action: PayloadAction<{ id: string; title: string; goalId?: string; goalTitle?: string }>) {
      state.selectedProjectId = action.payload.id;
      state.selectedTaskId = null;
      state.currentView = 'projects';
      
      // Добавляем в историю
      state.navigationHistory.push({
        view: 'projects',
        id: action.payload.id,
        title: action.payload.title,
        parentId: action.payload.goalId,
      });
    },
    
    navigateToTask(state, action: PayloadAction<{ id: string; title: string; projectId?: string }>) {
      state.selectedTaskId = action.payload.id;
      state.currentView = 'tasks';
      
      // Добавляем в историю
      state.navigationHistory.push({
        view: 'tasks',
        id: action.payload.id,
        title: action.payload.title,
        parentId: action.payload.projectId,
      });
    },
    
    goBack(state) {
      state.navigationHistory.pop();
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      
      if (lastItem) {
        state.currentView = lastItem.view;
        if (lastItem.view === 'goals') {
          state.selectedGoalId = lastItem.id || null;
          state.selectedProjectId = null;
        } else if (lastItem.view === 'projects') {
          state.selectedProjectId = lastItem.id || null;
        }
        state.selectedTaskId = null;
      } else {
        state.currentView = 'tasks';
        state.selectedGoalId = null;
        state.selectedProjectId = null;
        state.selectedTaskId = null;
      }
    },
    
    goToRoot(state) {
      state.navigationHistory = [];
      state.currentView = 'tasks';
      state.selectedGoalId = null;
      state.selectedProjectId = null;
      state.selectedTaskId = null;
    },
    
    pushToHistory(state, action: PayloadAction<NavigationStackItem>) {
      state.navigationHistory.push(action.payload);
      state.currentView = action.payload.view;
    },
    
    popFromHistory(state) {
      state.navigationHistory.pop();
      const lastItem = state.navigationHistory[state.navigationHistory.length - 1];
      state.currentView = lastItem ? lastItem.view : 'tasks';
    },
    
    clearHistory(state) {
      state.navigationHistory = [];
      state.currentView = 'tasks';
    },
    
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
  },
});

export const { actions, reducer } = uiSlice;
