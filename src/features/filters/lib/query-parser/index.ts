// src/features/filters/lib/query-parser/index.ts

import type { Task } from '@entities/task';

export interface FilterQuery {
  tags?: string[];
  project?: string;
  priority?: string[];
  minHours?: number;
  dueRange?: 'today' | 'week' | 'overdue';
  status?: string[];
  text?: string;
}

export function parseFilterQuery(query: string): FilterQuery {
  const result: FilterQuery = {};
  
  // #tag
  const tagMatches = query.match(/#(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map(t => t.slice(1));
  }
  
  // project:name
  const projectMatch = query.match(/project:(\w+)/);
  if (projectMatch) result.project = projectMatch[1];
  
  // >4h или <2h
  const hoursMatch = query.match(/>(\d+)h/);
  if (hoursMatch) result.minHours = parseInt(hoursMatch[1]);
  
  // due:today, due:week
  const dueMatch = query.match(/due:(today|week|overdue)/);
  if (dueMatch) result.dueRange = dueMatch[1] as 'today' | 'week' | 'overdue';
  
  // status:todo|done
  const statusMatch = query.match(/status:(\w+)/);
  if (statusMatch) result.status = [statusMatch[1]];
  
  // обычный текст
  const cleanText = query.replace(/#\w+|project:\w+|>\d+h|due:\w+|status:\w+/g, '').trim();
  if (cleanText) result.text = cleanText;
  
  return result;
}

export function filterTasks(tasks: Task[], query: FilterQuery): Task[] {
  return tasks.filter(task => {
    if (query.tags?.length && !query.tags.some(tag => task.tags.includes(tag))) return false;
    if (query.project && task.projectId !== query.project) return false;
    if (query.priority?.length && !query.priority.includes(task.priority)) return false;
    if (query.minHours && (task.timeSpentSeconds / 3600) < query.minHours) return false;
    if (query.dueRange === 'overdue' && task.dueDate && task.dueDate < Date.now() && task.status !== 'done') return false;
    if (query.dueRange === 'today' && task.dueDate) {
      const today = new Date().setHours(0,0,0,0);
      const due = new Date(task.dueDate).setHours(0,0,0,0);
      if (due !== today) return false;
    }
    if (query.text && !task.title.toLowerCase().includes(query.text.toLowerCase())) return false;
    return true;
  });
}
