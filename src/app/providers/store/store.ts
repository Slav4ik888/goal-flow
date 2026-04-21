// src/app/providers/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '@entities/task/model/tasks-slice';
import goalsReducer from '@entities/goal/model/goals-slice';
import projectsReducer from '@entities/project/model/projects-slice';
import timeEntriesReducer from '@entities/time-entry/model/time-entries-slice';
import uiReducer from '@app/store/ui-slice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    goals: goalsReducer,
    projects: projectsReducer,
    timeEntries: timeEntriesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // для работы с Date
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
