// src/entities/time-entry/types/index.ts

export interface TimeEntry {
  id        : string
  parentId  : string // В зависимости от того, что мы будем отслеживать: goalId | projectId | taskId
  startTime : number
  endTime   : number
  duration  : number
}
