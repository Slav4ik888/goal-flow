// // src/app/providers/store/store.ts

// import { configureStore } from '@reduxjs/toolkit';



// export const store = configureStore({
//   reducer: {
//     tasks       : tasksReducer,
//     goals       : goalsReducer,
//     projects    : projectsReducer,
//     timeEntries : timeEntriesReducer,
//     ui          : uiReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, // для работы с Date
//     }),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
