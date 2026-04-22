// src/features/filters/lib/query-parser/index.ts

import type { Task, Priority } from '@entities/task';


export interface FilterQuery {
  tags?: string[];
  projectId?: string;
  goalId?: string;
  priority?: Priority[];
  minHours?: number;
  maxHours?: number;
  dueRange?: 'today' | 'week' | 'overdue' | 'month';
  status?: string[];
  hasNoGoal?: boolean;
  hasNoProject?: boolean;
  text?: string;
}

// Парсинг текстового запроса
export function parseFilterQuery(query: string): FilterQuery {
  const result: FilterQuery = {};
  
  if (!query.trim()) return result;
  
  // #tag
  const tagMatches = query.match(/#(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map(t => t.slice(1));
  }
  
  // project:название или projectId:uuid
  const projectMatch = query.match(/project:(\S+)/);
  if (projectMatch) {
    result.projectId = projectMatch[1];
  }
  
  // goal:название или goalId:uuid
  const goalMatch = query.match(/goal:(\S+)/);
  if (goalMatch) {
    result.goalId = goalMatch[1];
  }
  
  // priority:P0, P1, P2, P3
  const priorityMatch = query.match(/priority:(P[0-3])/i);
  if (priorityMatch) {
    result.priority = [priorityMatch[1].toUpperCase() as Priority];
  }
  
  // >4h или >2.5h
  const minHoursMatch = query.match(/>(\d+(?:\.\d+)?)h/);
  if (minHoursMatch) {
    result.minHours = parseFloat(minHoursMatch[1]);
  }
  
  // <2h или <1.5h
  const maxHoursMatch = query.match(/<(\d+(?:\.\d+)?)h/);
  if (maxHoursMatch) {
    result.maxHours = parseFloat(maxHoursMatch[1]);
  }
  
  // due:today, due:week, due:month, due:overdue
  const dueMatch = query.match(/due:(today|week|month|overdue)/);
  if (dueMatch) {
    result.dueRange = dueMatch[1] as any;
  }
  
  // status:todo, status:in-progress, status:done
  const statusMatch = query.match(/status:(todo|in-progress|done)/);
  if (statusMatch) {
    result.status = [statusMatch[1]];
  }
  
  // goal:none — задачи без цели
  if (query.includes('goal:none')) {
    result.hasNoGoal = true;
  }
  
  // project:none — задачи без проекта
  if (query.includes('project:none')) {
    result.hasNoProject = true;
  }
  
  // Обычный текст (убираем все спец-конструкции)
  const cleanText = query
    .replace(/#\w+/g, '')
    .replace(/project:\S+/g, '')
    .replace(/goal:\S+/g, '')
    .replace(/priority:P[0-3]/gi, '')
    .replace(/>\d+(?:\.\d+)?h/g, '')
    .replace(/<\d+(?:\.\d+)?h/g, '')
    .replace(/due:\w+/g, '')
    .replace(/status:\w+/g, '')
    .replace(/goal:none/g, '')
    .replace(/project:none/g, '')
    .trim();
    
  if (cleanText) {
    result.text = cleanText;
  }
  
  return result;
}

// Фильтрация задач
export function filterTasks(tasks: Task[], query: FilterQuery, projects: any[] = [], goals: any[] = []): Task[] {
  return tasks.filter(task => {
    // Фильтр по тегам
    if (query.tags?.length && !query.tags.some(tag => task.tags.includes(tag))) {
      return false;
    }
    
    // Фильтр по проекту
    if (query.projectId) {
      if (query.projectId === 'none') {
        if (task.projectId) return false;
      } else if (task.projectId !== query.projectId) {
        // Также проверяем по названию проекта
        const project = projects.find(p => p.id === task.projectId);
        if (!project?.title.toLowerCase().includes(query.projectId!.toLowerCase())) {
          return false;
        }
      }
    }
    
    // Фильтр по цели
    if (query.goalId) {
      if (query.goalId === 'none') {
        if (task.goalId) return false;
      } else if (task.goalId !== query.goalId) {
        const goal = goals.find(g => g.id === task.goalId);
        if (!goal?.title.toLowerCase().includes(query.goalId!.toLowerCase())) {
          return false;
        }
      }
    }
    
    // Фильтр по приоритету
    if (query.priority?.length && !query.priority.includes(task.priority)) {
      return false;
    }
    
    // Фильтр по затраченному времени
    const hoursSpent = task.timeSpentSeconds / 3600;
    if (query.minHours !== undefined && hoursSpent < query.minHours) return false;
    if (query.maxHours !== undefined && hoursSpent > query.maxHours) return false;
    
    // Фильтр по дедлайну
    if (query.dueRange && task.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const weekEnd = today + 7 * 24 * 60 * 60 * 1000;
      const monthEnd = today + 30 * 24 * 60 * 60 * 1000;
      
      switch (query.dueRange) {
        case 'today':
          if (task.dueDate < today || task.dueDate >= today + 24 * 60 * 60 * 1000) return false;
          break;
        case 'week':
          if (task.dueDate < today || task.dueDate > weekEnd) return false;
          break;
        case 'month':
          if (task.dueDate < today || task.dueDate > monthEnd) return false;
          break;
        case 'overdue':
          if (!task.dueDate || task.dueDate >= today || task.status === 'done') return false;
          break;
      }
    }
    
    // Статус
    if (query.status?.length && !query.status.includes(task.status)) {
      return false;
    }
    
    // Текстовый поиск
    if (query.text) {
      const searchLower = query.text.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(searchLower);
      const matchDesc = task.description?.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchDesc) return false;
    }
    
    return true;
  });
}

// Получение активных фильтров для отображения
export function getActiveFilters(query: string): { type: string; value: string; label: string }[] {
  const filters: { type: string; value: string; label: string }[] = [];
  
  const tagMatch = query.match(/#\w+/g);
  if (tagMatch) {
    tagMatch.forEach(tag => {
      filters.push({ type: 'tag', value: tag, label: `Тег: ${tag}` });
    });
  }
  
  const projectMatch = query.match(/project:\S+/);
  if (projectMatch) {
    filters.push({ type: 'project', value: projectMatch[0], label: `Проект: ${projectMatch[0].replace('project:', '')}` });
  }
  
  const priorityMatch = query.match(/priority:P[0-3]/i);
  if (priorityMatch) {
    filters.push({ type: 'priority', value: priorityMatch[0], label: `Приоритет: ${priorityMatch[0].replace('priority:', '')}` });
  }
  
  const dueMatch = query.match(/due:\w+/);
  if (dueMatch) {
    const dueMap: Record<string, string> = { today: 'Сегодня', week: 'Эта неделя', month: 'Этот месяц', overdue: 'Просроченные' };
    filters.push({ type: 'due', value: dueMatch[0], label: dueMap[dueMatch[0].replace('due:', '')] || dueMatch[0] });
  }
  
  if (query.includes('goal:none')) {
    filters.push({ type: 'goal', value: 'goal:none', label: 'Без цели' });
  }
  
  if (query.includes('project:none')) {
    filters.push({ type: 'project', value: 'project:none', label: 'Без проекта' });
  }
  
  return filters;
}
