// src/entities/project/types/index.ts

export type ProjectStatus = 'active' | 'archived'

export interface Project {
  id          : string
  title       : string
  description : string
  status      : ProjectStatus
  goalId?     : string // Проект может принадлежать цели
  createdAt   : number
  updatedAt   : number
}
