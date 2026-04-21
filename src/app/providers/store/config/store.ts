// src/app/providers/store/config/store.ts
import { configureStore } from '@reduxjs/toolkit'
import type { ReducersMapObject } from '@reduxjs/toolkit'
import { tasksReducer } from '@entities/task';
import { goalsReducer } from '@entities/goal';
import { projectsReducer } from '@entities/project';
import { timeEntriesReducer } from '@entities/time-entry';
import { uiReducer } from '@entities/ui';
import type { StateSchema } from './state';
import { createReducerManager } from './reducer-manager';


export function createReduxStore(
  initialState?  : StateSchema,
  asyncReducers? : ReducersMapObject<StateSchema>,
) {
  const
    rootReducers: ReducersMapObject<StateSchema> = {
      ...asyncReducers,

      // Entities
      tasks       : tasksReducer,
      goals       : goalsReducer,
      projects    : projectsReducer,
      timeEntries : timeEntriesReducer,
      ui          : uiReducer,
    },
    reducerManager = createReducerManager(rootReducers);
    // extraArg = {
    //   api
    // };

  const store = configureStore({
    reducer        : reducerManager.reduce,
  // @ts-ignore
    devTools       : __IS_DEV__,
    preloadedState : initialState || {},
    middleware     : (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false, // для работы с Date
      // thunk: {
      //   extraArgument: extraArg
      // }
    })
  });

  // @ts-ignore
  store.reducerManager = reducerManager;

  return store
}


export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch'];
