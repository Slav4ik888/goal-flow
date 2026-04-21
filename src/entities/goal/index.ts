// src/entities/goal/index.ts

export type { Goal, GoalStatus } from './types';
export type { StateSchemaGoals } from './model/slice'
export {
  reducer as goalsReducer, actions as goalsActions,
  fetchGoals, createGoal, editGoal, removeGoal
} from './model/slice'
