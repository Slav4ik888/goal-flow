// src/features/time-tracking/ui/task-timer.tsx
import { useState, useEffect } from 'react';
import styles from './task-timer.module.scss';



interface TaskTimerProps {
  taskId: string;
  initialSeconds: number;
  onUpdate: (seconds: number) => void;
}

export function TaskTimer({ taskId, initialSeconds, onUpdate }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Восстановление забытого таймера
  useEffect(() => {
    const saved = sessionStorage.getItem(`timer_${taskId}`);
    if (saved) {
      const { startTime: savedStart, accumulated } = JSON.parse(saved) as { startTime: number, accumulated: number };
      const elapsed = Math.floor((Date.now() - savedStart) / 1000);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeconds(accumulated + elapsed);
      setIsRunning(true);
      setStartTime(savedStart);
    }
  }, [taskId]);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && startTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(initialSeconds + elapsed);
      }, 1000);
    }
    return () => {
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, [isRunning, startTime, initialSeconds]);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    sessionStorage.setItem(`timer_${taskId}`, JSON.stringify({
      startTime: now,
      accumulated: seconds
    }));
  };

  const handleStop = () => {
    setIsRunning(false);
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newSeconds = seconds + elapsed;
      setSeconds(newSeconds);
      onUpdate(newSeconds);
      sessionStorage.removeItem(`timer_${taskId}`);
    }
    setStartTime(null);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.timer}>
      <span className={styles.display}>{formatTime(seconds)}</span>
      {!isRunning ? (
        <button onClick={handleStart} className={styles.play}>▶</button>
      ) : (
        <button onClick={handleStop} className={styles.stop}>⏸</button>
      )}
    </div>
  );
}
