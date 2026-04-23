// src/shared/lib/backup/index.ts

import type { Task } from '@entities/task';
import type { Goal } from '@entities/goal';
import type { Project } from '@entities/project';
import type { TimeEntry } from '@entities/time-entry';
import { initDB, clearAllStores } from '../db';



export interface BackupData {
  version: string;
  timestamp: number;
  data: {
    tasks: Task[];
    goals: Goal[];
    projects: Project[];
    timeEntries: TimeEntry[];
  };
}

// Экспорт всех данных в JSON
export async function exportAllData(): Promise<void> {
  const db = await initDB();
  
  const tasks = await db.getAll('tasks');
  const goals = await db.getAll('goals');
  const projects = await db.getAll('projects');
  const timeEntries = await db.getAll('timeEntries');
  
  const backup: BackupData = {
    version: '1.0',
    timestamp: Date.now(),
    data: {
      tasks,
      goals,
      projects,
      timeEntries,
    },
  };
  
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `goalflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Data exported successfully');
}

// Импорт данных из JSON файла
export async function importDataFromFile(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const backup: BackupData = JSON.parse(content);
        
        // Валидация структуры
        if (!backup.version || !backup.data || !backup.data.tasks || !backup.data.goals || !backup.data.projects) {
          throw new Error('Неверная структура файла');
        }
        
        const db = await initDB();
        
        // Очищаем существующие данные
        await clearAllStores();
        
        // Импортируем данные
        const tx = db.transaction(['tasks', 'goals', 'projects', 'timeEntries'], 'readwrite');
        
        // Импортируем цели
        for (const goal of backup.data.goals) {
          await tx.objectStore('goals').put(goal);
        }
        
        // Импортируем проекты
        for (const project of backup.data.projects) {
          await tx.objectStore('projects').put(project);
        }
        
        // Импортируем задачи
        for (const task of backup.data.tasks) {
          await tx.objectStore('tasks').put(task);
        }
        
        // Импортируем записи времени
        if (backup.data.timeEntries) {
          for (const entry of backup.data.timeEntries) {
            await tx.objectStore('timeEntries').put(entry);
          }
        }
        
        await tx.done;
        
        console.log('✅ Data imported successfully');
        resolve({ success: true, message: `Импортировано: ${backup.data.goals.length} целей, ${backup.data.projects.length} проектов, ${backup.data.tasks.length} задач` });
      } catch (error) {
        console.error('Import failed:', error);
        resolve({ success: false, message: `Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Ошибка чтения файла' });
    };
    
    reader.readAsText(file);
  });
}

// Импорт данных с выбором файла
export async function importData(): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false, message: 'Файл не выбран' });
        return;
      }
      
      const result = await importDataFromFile(file);
      resolve(result);
    };
    
    input.click();
  });
}
