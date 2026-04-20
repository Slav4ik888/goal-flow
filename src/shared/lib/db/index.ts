// src/shared/lib/db/index.ts

import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Task } from '@entities/task';

let db: IDBPDatabase | null = null;

export async function initDB() {
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
