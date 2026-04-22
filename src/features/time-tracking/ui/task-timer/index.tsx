// src/features/time-tracking/ui/task-timer/index.tsx
import { useState, useEffect } from 'react';
import styles from './index.module.scss';



interface TaskTimerProps {
  taskId: string;
  initialSeconds: number;
  onUpdate: (seconds: number) => void;
  isRunning: boolean;
  onStartStop: (e: React.MouseEvent) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ 
  initialSeconds, 
  onUpdate, 
  isRunning, 
  onStartStop 
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(initialSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setDisplaySeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning && displaySeconds !== initialSeconds) {
      onUpdate(displaySeconds);
    }
  }, [isRunning, displaySeconds, initialSeconds, onUpdate]);

  useEffect(() => {
    if (!isRunning) {
      setDisplaySeconds(initialSeconds);
    }
  }, [initialSeconds, isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.timer}>
      <span className={styles.display}>{formatTime(displaySeconds)}</span>
      <button onClick={(e) => onStartStop(e)} className={isRunning ? styles.stop : styles.play}>
        {isRunning ? '⏸' : '▶'}
      </button>
    </div>
  );
};
