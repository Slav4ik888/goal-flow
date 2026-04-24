// src/features/time-tracking/ui/task-timer/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.scss';



interface TaskTimerProps {
  taskId: string;
  initialSeconds: number;
  onUpdate: (seconds: number) => void;
  isRunning: boolean;
  onStartStop: (e: any) => void;
  onManualTimeOpen: () => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ 
  initialSeconds, 
  onUpdate, 
  isRunning, 
  onManualTimeOpen,
  onStartStop 
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(initialSeconds);

  // Обновляем displaySeconds только если изменился initialSeconds И таймер НЕ запущен
  useEffect(() => {
    if (!isRunning) {
      setDisplaySeconds(initialSeconds);
    }
  }, [initialSeconds, isRunning]);

  // Таймер: увеличиваем displaySeconds каждую секунду
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setDisplaySeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning]);

  // Сохраняем изменения ТОЛЬКО когда таймер останавливается
  // Используем useRef чтобы сохранить предыдущее состояние
  const prevIsRunning = useRef(isRunning);
  
  useEffect(() => {
    // Таймер только что остановился
    if (prevIsRunning.current === true && isRunning === false) {
      if (displaySeconds !== initialSeconds) {
        onUpdate(displaySeconds);
      }
    }
    prevIsRunning.current = isRunning;
  }, [isRunning, displaySeconds, initialSeconds, onUpdate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDisplayClick = () => {
    if (!isRunning) {
      onManualTimeOpen();
    }
  };

  
  return (
    <div className={`${styles.timer} timer`}> 
      <span 
        className={`${styles.display} ${!isRunning ? styles.editable : ''}`}
        onClick={handleDisplayClick}
      >
        {formatTime(displaySeconds)}
      </span>
      <button onClick={onStartStop} className={isRunning ? styles.stop : styles.play}>
        {isRunning ? '⏸' : '▶'}
      </button>
    </div>
  );
};
