// src/entities/goal/types/index.ts

export interface Goal {
  id           : string
  title        : string
  description? : string
  status       : 'active' | 'completed' | 'archived'
  targetDate?  : number
  actualDate?  : number
  createdAt    : number
}
