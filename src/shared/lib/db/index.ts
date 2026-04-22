// src/shared/lib/db/index.ts

import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Task } from '@entities/task';
import type { Goal } from '@entities/goal';
import type { Project } from '@entities/project';
import type { TimeEntry } from '@entities/time-entry';

let db: IDBPDatabase | null = null;

export async function initDB() {
  if (db) return db;
  
  db = await openDB('GoalFlowDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('projectId', 'projectId');
        taskStore.createIndex('goalId', 'goalId');
        taskStore.createIndex('status', 'status');
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('timeEntries')) {
        const timeStore = db.createObjectStore('timeEntries', { keyPath: 'id' });
        timeStore.createIndex('taskId', 'taskId');
        timeStore.createIndex('startTime', 'startTime');
      }
    },
  });
  
  return db;
}

// Функция очистки без удаления базы данных
export async function clearAllStores() {
  const database = await initDB();
  
  const stores = ['tasks', 'goals', 'projects', 'timeEntries'];
  
  const tx = database.transaction(stores, 'readwrite');
  
  for (const store of stores) {
    await tx.objectStore(store).clear();
  }
  
  await tx.done;
  console.log('All stores cleared successfully');
}



// Task operations
export async function saveTask(task: Task) {
  const database = await initDB();
  await database.put('tasks', { ...task, updatedAt: Date.now() });
}

export async function getTasks(filter?: { projectId?: string; goalId?: string }) {
  const database = await initDB();
  let tasks = await database.getAll('tasks');
  if (filter?.projectId) {
    tasks = tasks.filter(t => t.projectId === filter.projectId);
  }
  if (filter?.goalId) {
    tasks = tasks.filter(t => t.goalId === filter.goalId);
  }
  return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteTask(id: string) {
  const database = await initDB();
  await database.delete('tasks', id);
}

// Goal operations
export async function saveGoal(goal: Goal) {
  const database = await initDB();
  await database.put('goals', { ...goal, updatedAt: Date.now() });
}

export async function getGoals(): Promise<Goal[]> {
  const database = await initDB();
  return await database.getAll('goals');
}

export async function deleteGoal(id: string) {
  const database = await initDB();
  await database.delete('goals', id);
}

export async function updateGoal(id: string, updates: Partial<Goal>) {
  const database = await initDB();
  const goal = await database.get('goals', id);
  if (goal) {
    const updated = { ...goal, ...updates, updatedAt: Date.now() };
    await database.put('goals', updated);
    return updated;
  }
  return null;
}

// Project operations
export async function saveProject(project: Project) {
  const database = await initDB();
  await database.put('projects', { ...project, updatedAt: Date.now() });
}

export async function getProjects(): Promise<Project[]> {
  const database = await initDB();
  return await database.getAll('projects');
}

export async function deleteProject(id: string) {
  const database = await initDB();
  await database.delete('projects', id);
}

// TimeEntry operations
export async function saveTimeEntry(entry: TimeEntry) {
  const database = await initDB();
  await database.put('timeEntries', entry);
}

export async function getTimeEntries(): Promise<TimeEntry[]> {
  const database = await initDB();
  return await database.getAll('timeEntries');
}

export async function deleteTimeEntry(id: string) {
  const database = await initDB();
  await database.delete('timeEntries', id);
}

export async function getActiveTimeEntry(): Promise<TimeEntry | null> {
  const database = await initDB();
  const entries = await database.getAll('timeEntries');
  return entries.find(e => e.isRunning) || null;
}

export async function stopTimeEntry(id: string): Promise<TimeEntry | null> {
  const database = await initDB();
  const entry = await database.get('timeEntries', id);
  if (entry && entry.isRunning) {
    const stoppedEntry = {
      ...entry,
      endTime: Date.now(),
      durationSeconds: Math.floor((Date.now() - entry.startTime) / 1000),
      isRunning: false,
    };
    await database.put('timeEntries', stoppedEntry);
    return stoppedEntry;
  }
  return null;
}
