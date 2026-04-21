// src/entities/task/types/index.ts

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'

export interface Task {
  id               : string
  title            : string
  description?     : string
  status           : TaskStatus
  projectId?       : string
  goalId?          : string
  priority         : Priority
  dueDate?         : number // timestamp
  estimatedHours?  : number
  tags             : string[]
  timeSpentSeconds : number
  createdAt        : number
  updatedAt        : number
}
