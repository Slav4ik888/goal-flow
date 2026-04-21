// src/app/providers/store/ui-slice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export type ViewType = 'goals' | 'projects' | 'tasks';
export type NavigationStackItem = {
  view: ViewType;
  id?: string; // id выбранного элемента (проекта, цели)
  title?: string;
};

export interface StateSchemaUI {
  currentView: ViewType;
  navigationStack: NavigationStackItem[];
  isCommandPaletteOpen: boolean;
  searchQuery: string;
  filterQuery: string;
  selectedTaskId: string | null;
}

const initialState: StateSchemaUI = {
  currentView: 'tasks',
  navigationStack: [],
  isCommandPaletteOpen: false,
  searchQuery: '',
  filterQuery: '',
  selectedTaskId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<ViewType>) {
      state.currentView = action.payload;
      state.navigationStack = [];
    },
    pushToStack(state, action: PayloadAction<NavigationStackItem>) {
      state.navigationStack.push(action.payload);
      state.currentView = action.payload.view;
    },
    popFromStack(state) {
      state.navigationStack.pop();
      const lastItem = state.navigationStack[state.navigationStack.length - 1];
      if (lastItem) {
        state.currentView = lastItem.view;
      } else {
        state.currentView = 'tasks';
      }
    },
    clearStack(state) {
      state.navigationStack = [];
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
  },
});

export const { actions, reducer } = uiSlice;
