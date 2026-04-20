// src/widgets/goal-card/index.tsx

import { calculateGoalProgress } from '@features/goal-tracking/lib/progress';
import styles from './goal-card.module.scss';
import type { Goal } from '@entities/goal';
import type { Task } from '@entities/task';

export function GoalCard({ goal, tasks }: { goal: Goal; tasks: Task[] }) {
  const progress = calculateGoalProgress(goal.id, tasks);
  
  return (
    <div className={styles.card}>
      <h3>{goal.title}</h3>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <span>{Math.round(progress.percent)}% • {progress.completed}/{progress.total} задач</span>
    </div>
  );
}
