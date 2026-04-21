// src/features/quick-capture/ui/quick-capture/index.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store';
import { createTask } from '@entities/task';
import { fetchProjects } from '@entities/project';
import { fetchGoals } from '@entities/goal';
import { useHotkeys } from 'react-hotkeys-hook';
import styles from './index.module.scss';



interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [parsedTask, setParsedTask] = useState<{
    title: string;
    projectId?: string;
    priority?: string;
    tags?: string[];
  } | null>(null);

  const projects = useAppSelector(state => state.projects.items);
  const goals = useAppSelector(state => state.goals.items);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProjects());
      dispatch(fetchGoals());
      inputRef.current?.focus();
    }
  }, [isOpen, dispatch]);

  useHotkeys('esc', () => {
    if (isOpen) onClose();
  });

  // Парсинг натурального языка
  const parseInput = (text: string) => {
    const result: any = { title: text };
    
    // Приоритет: p0, p1, p2, p3
    const priorityMatch = text.match(/\b(p[0-3])\b/i);
    if (priorityMatch) {
      result.priority = priorityMatch[1].toUpperCase();
      result.title = result.title.replace(priorityMatch[0], '').trim();
    }
    
    // Проект: #project или project:название
    const projectMatch = text.match(/#(\w+)/) || text.match(/project:(\w+)/);
    if (projectMatch) {
      const projectName = projectMatch[1];
      const existingProject = projects.find(p => 
        p.title.toLowerCase().includes(projectName.toLowerCase())
      );
      if (existingProject) {
        result.projectId = existingProject.id;
        result.title = result.title.replace(projectMatch[0], '').trim();
      }
    }
    
    // Теги: @tag
    const tagMatches = text.match(/@(\w+)/g);
    if (tagMatches) {
      result.tags = tagMatches.map(t => t.slice(1));
      result.title = result.title.replace(/@\w+/g, '').trim();
    }
    
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      setParsedTask(parseInput(value));
    } else {
      setParsedTask(null);
    }
  };

  const handleSubmit = async () => {
    if (!parsedTask?.title) return;
    
    await dispatch(createTask({
      title: parsedTask.title,
      description: '',
      priority: (parsedTask.priority as any) || 'P2',
      status: 'todo',
      projectId: parsedTask.projectId,
      goalId: undefined,
      tags: parsedTask.tags || [],
    }));
    
    setInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.capture} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.icon}>⚡</span>
          <span className={styles.title}>Быстрая задача</span>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder='Например: "Сделать отчет p1 #work @urgent" или "Позвонить клиенту"'
            className={styles.input}
            onKeyDown={e => {
              if (e.key === 'Enter' && parsedTask?.title) {
                handleSubmit();
              }
            }}
          />
        </div>
        
        {parsedTask && parsedTask.title && (
          <div className={styles.preview}>
            <div className={styles.previewTitle}>Предпросмотр:</div>
            <div className={styles.taskPreview}>
              <span className={styles.taskTitle}>{parsedTask.title}</span>
              {parsedTask.priority && (
                <span className={styles.priorityBadge}>{parsedTask.priority}</span>
              )}
              {parsedTask.projectId && (
                <span className={styles.projectBadge}>
                  📁 {projects.find(p => p.id === parsedTask.projectId)?.title}
                </span>
              )}
              {parsedTask.tags?.map(tag => (
                <span key={tag} className={styles.tagBadge}>#{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className={styles.hint}>
          <div className={styles.hintTitle}>💡 Синтаксис быстрого ввода:</div>
          <div className={styles.hintGrid}>
            <span><code>p0/p1/p2/p3</code> — приоритет</span>
            <span><code>#проект</code> — проект</span>
            <span><code>@тег</code> — тег</span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена (ESC)
          </button>
          <button 
            onClick={handleSubmit} 
            className={styles.submitButton}
            disabled={!parsedTask?.title}
          >
            Создать (Enter)
          </button>
        </div>
      </div>
    </div>
  );
};
