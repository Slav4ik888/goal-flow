// src/entities/task/index.ts

export type { TaskStatus, Priority, Task } from './types'
export type { StateSchemaTasks } from './model/slice'
export { reducer as tasksReducer, actions as tasksActions } from './model/slice'
export { fetchTasks, createTask, editTask } from './model/slice'
