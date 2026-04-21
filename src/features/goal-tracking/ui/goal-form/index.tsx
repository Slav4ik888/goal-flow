// src/features/goal-tracking/ui/goal-form/index.tsx

import React, { useState } from 'react';
import styles from './index.module.scss';


interface GoalFormProps {
  initialData?: {
    title?: string;
    description?: string;
    targetDate?: string;
  };
  onSubmit: (data: { title: string; description?: string; targetDate?: number }) => void;
  onCancel: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    targetDate: initialData?.targetDate || '',
  });

  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    const newErrors: { title?: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Название цели обязательно';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      targetDate: formData.targetDate ? new Date(formData.targetDate).getTime() : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          Название цели <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => {
            setFormData({ ...formData, title: e.target.value });
            if (errors.title) setErrors({});
          }}
          className={`${styles.input} ${errors.title ? styles.error : ''}`}
          placeholder="Например: Запустить продукт до марта"
          autoFocus
        />
        {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className={styles.textarea}
          rows={4}
          placeholder="Опишите цель, почему она важна и какие результаты ожидаются..."
        />
        <div className={styles.hint}>
          💡 Хорошая цель: конкретная, измеримая, достижимая, релевантная, ограниченная по времени
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Целевая дата</label>
        <input
          type="date"
          value={formData.targetDate}
          onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
          className={styles.input}
          min={new Date().toISOString().split('T')[0]}
        />
        <div className={styles.hint}>
          📅 Когда планируете достичь эту цель?
        </div>
      </div>

      <div className={styles.buttons}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
        <button type="submit" className={styles.submitButton}>
          {initialData ? 'Сохранить изменения' : 'Создать цель'}
        </button>
      </div>
    </form>
  );
};
