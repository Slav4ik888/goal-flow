// src/entities/time-entry/types/index.ts

export interface TimeEntry {
  id         : string
  taskId     : string
  startTime  : number
  endTime    : number | undefined
  duration   : number // in seconds
  isRunning? : boolean
}
