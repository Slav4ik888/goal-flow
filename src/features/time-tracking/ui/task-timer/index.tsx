// src/features/time-tracking/ui/task-timer/index.tsx

import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { ManualTimeModal } from '../manual-time-modal';



interface TaskTimerProps {
  taskId: string;
  taskTitle?: string;
  initialSeconds: number;
  onUpdate: (seconds: number) => void;
  isRunning: boolean;
  onStartStop: (e: any) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ 
  taskId,
  taskTitle,
  initialSeconds, 
  onUpdate, 
  isRunning, 
  onStartStop 
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(initialSeconds);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDisplayClick = () => {
    if (!isRunning) {
      setIsModalOpen(true);
    }
  };

  const handleManualSave = (seconds: number) => {
    setDisplaySeconds(seconds);
    onUpdate(seconds);
  };

  
  return (
    <>
      <div className={`${styles.timer} timer`}> 
        <span 
          className={`${styles.display} ${!isRunning ? styles.editable : ''}`}
          onClick={handleDisplayClick}
          title={!isRunning ? "Кликните для ручного ввода времени" : ""}
        >
          {formatTime(displaySeconds)}
        </span>
        <button 
          onClick={onStartStop} 
          className={isRunning ? styles.stop : styles.play}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
      </div>
      
      <ManualTimeModal
        isOpen={isModalOpen}
        taskTitle={taskTitle || 'Задача'}
        currentSeconds={displaySeconds}
        onSave={handleManualSave}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
