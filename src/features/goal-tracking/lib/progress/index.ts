// src/features/goal-tracking/lib/progress/index.ts
import type { Task } from '@entities/task';

export function calculateGoalProgress(goalId: string, tasks: Task[]): {
  percent: number;
  completed: number;
  total: number;
  byWeight: boolean;
} {
  const relatedTasks = tasks.filter(t => t.goalId === goalId);
  if (relatedTasks.length === 0) return { percent: 0, completed: 0, total: 0, byWeight: false };
  
  // С весами по estimatedHours, если есть
  const hasEstimates = relatedTasks.some(t => t.estimatedHours !== undefined && t.estimatedHours > 0);
  
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
      byWeight: true,
    };
  } else {
    const total = relatedTasks.length;
    const completed = relatedTasks.filter(t => t.status === 'done').length;
    return {
      percent: (completed / total) * 100,
      completed,
      total,
      byWeight: false,
    };
  }
}

export function getGoalTimeSpent(goalId: string, tasks: Task[]): number {
  const relatedTasks = tasks.filter(t => t.goalId === goalId);
  return relatedTasks.reduce((sum, task) => sum + task.timeSpentSeconds, 0);
}

export function getGoalEstimatedTimeLeft(goalId: string, tasks: Task[]): number {
  const relatedTasks = tasks.filter(t => t.goalId === goalId && t.status !== 'done');
  return relatedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0) * 3600, 0);
}
