// src/entities/goal/types/index.ts

export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id           : string
  title        : string
  description? : string
  status       : GoalStatus
  targetDate?  : number
  actualDate?  : number
  createdAt    : number
  updatedAt?   : number
}
