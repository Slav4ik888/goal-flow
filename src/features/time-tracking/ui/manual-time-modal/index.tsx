// src/features/time-tracking/ui/manual-time-modal/index.tsx
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';



interface ManualTimeModalProps {
  isOpen: boolean;
  taskTitle: string;
  currentSeconds: number;
  onSave: (seconds: number) => void;
  onClose: () => void;
}

export const ManualTimeModal: React.FC<ManualTimeModalProps> = ({
  isOpen,
  taskTitle,
  currentSeconds,
  onSave,
  onClose,
}) => {
  const [hours, setHours] = useState(Math.floor(currentSeconds / 3600).toString());
  const [minutes, setMinutes] = useState(Math.floor((currentSeconds % 3600) / 60).toString());
  const [seconds, setSeconds] = useState((currentSeconds % 60).toString());

  // Валидация только цифр
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // только цифры
    setHours(value);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    let num = parseInt(value);
    if (num > 59) num = 59;
    if (!isNaN(num)) value = num.toString();
    setMinutes(value);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    let num = parseInt(value);
    if (num > 59) num = 59;
    if (!isNaN(num)) value = num.toString();
    setSeconds(value);
  };

  const handleSave = () => {
    const totalSeconds = 
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    onSave(totalSeconds);
    onClose();
  };

  const formatTime = (h: number, m: number, s: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Ручной ввод времени</h3>
        <p className={styles.taskTitle}>Задача: {taskTitle}</p>
        
        <div className={styles.timeInputs}>
          <div className={styles.inputGroup}>
            <label>Часы</label>
            <input
              type="text"  // <-- меняем с number на text
              inputMode="numeric"  // <-- на мобильных показывает цифровую клавиатуру
              value={hours}
              onChange={handleHoursChange}
              placeholder="0"
              className={styles.timeInput}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Минуты</label>
            <input
              type="text"
              inputMode="numeric"
              value={minutes}
              onChange={handleMinutesChange}
              placeholder="0"
              className={styles.timeInput}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Секунды</label>
            <input
              type="text"
              inputMode="numeric"
              value={seconds}
              onChange={handleSecondsChange}
              placeholder="0"
              className={styles.timeInput}
            />
          </div>
        </div>
        
        <div className={styles.preview}>
          Итого: {formatTime(parseInt(hours) || 0, parseInt(minutes) || 0, parseInt(seconds) || 0)}
        </div>
        
        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
