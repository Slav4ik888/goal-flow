// src/features/goal-tracking/lib/progress/index.ts
import type { Task } from '@entities/task';

export function calculateGoalProgress(goalId: string, tasks: Task[]): {
  percent   : number
  completed : number
  total     : number
} {
  const relatedTasks = tasks.filter(t => t.goalId === goalId);
  if (relatedTasks.length === 0) return { percent: 0, completed: 0, total: 0 };
  
  // С весами по estimatedHours, если есть
  const hasEstimates = relatedTasks.some(t => t.estimatedHours !== undefined);
  
  if (hasEstimates) {
    let totalWeight = 0;
    let completedWeight = 0;
    for (const task of relatedTasks) {
      const weight = task.estimatedHours || 1;
      totalWeight += weight;
      if (task.status === 'done') completedWeight += weight;
    }
    return {
      percent: (completedWeight / totalWeight) * 100,
      completed: Math.round(completedWeight * 10) / 10,
      total: Math.round(totalWeight * 10) / 10,
    };
  } else {
    const total = relatedTasks.length;
    const completed = relatedTasks.filter(t => t.status === 'done').length;
    return {
      percent: (completed / total) * 100,
      completed,
      total,
    };
  }
}
