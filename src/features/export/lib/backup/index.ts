// src/features/export/lib/backup/index.ts

import type { Goal } from '@entities/goal';
import type { Project } from '@entities/project';
import type { Task } from '@entities/task';
import type { TimeEntry } from '@entities/time-entry';
import { initDB } from '@shared/lib/db';


export async function exportAllData() {
  const db = await initDB();
  const tasks = await db.getAll('tasks');
  const goals = await db.getAll('goals');
  const projects = await db.getAll('projects');
  const timeEntries = await db.getAll('timeEntries');
  
  const backup = {
    version: '1.0',
    timestamp: Date.now(),
    data: { tasks, goals, projects, timeEntries }
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `goalflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File) {
  const text = await file.text();
  const backup = JSON.parse(text);
  const db = await initDB();
  
  const tx = db.transaction(['tasks', 'goals', 'projects', 'timeEntries'], 'readwrite');
  await Promise.all([
    ...backup.data.tasks.map((t: Task) => tx.objectStore('tasks').put(t)),
    ...backup.data.goals.map((g: Goal) => tx.objectStore('goals').put(g)),
    ...backup.data.projects.map((p: Project) => tx.objectStore('projects').put(p)),
    ...backup.data.timeEntries.map((te: TimeEntry) => tx.objectStore('timeEntries').put(te)),
  ]);
  await tx.done;
  window.location.reload(); // перезагрузка для обновления UI
}
