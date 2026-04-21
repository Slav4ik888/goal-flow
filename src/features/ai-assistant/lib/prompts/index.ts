// src/features/ai-assistant/lib/prompts/index.ts

import type { Task } from '@entities/task';


export function generateBreakdownPrompt(taskTitle: string, existingTasks: Task[]): string {
  const similarTasks = existingTasks
    .filter(t => t.title.includes(taskTitle.split(' ')[0]))
    .slice(0, 5);
    
  return `
You are a task decomposition assistant. Break down "${taskTitle}" into 3-5 subtasks.

Context from similar tasks:
${similarTasks.map(t => `- ${t.title} (${t.status})`).join('\n')}

Return ONLY JSON array: [{ "title": string, "estimatedHours": number }]
Make subtasks concrete, actionable, each 1-4 hours max.
`;
}

// Локальный симулятор AI (без API)
export function mockAIDecomposition(taskTitle: string): Array<{title: string; estimatedHours: number}> {
  // В реальном проекте здесь был бы вызов local LLM через WebLLM или API
  // Но для демо используем rule-based
  if (taskTitle.toLowerCase().includes('landing')) {
    return [
      { title: 'Research competitor landing pages', estimatedHours: 2 },
      { title: 'Write hero section copy', estimatedHours: 1.5 },
      { title: 'Design layout in Figma', estimatedHours: 3 },
      { title: 'Implement responsive HTML/CSS', estimatedHours: 4 },
      { title: 'Set up analytics events', estimatedHours: 1 },
    ];
  }
  return [
    { title: `Research ${taskTitle} requirements`, estimatedHours: 1 },
    { title: `Plan ${taskTitle} execution`, estimatedHours: 0.5 },
    { title: `Execute ${taskTitle}`, estimatedHours: 2 },
    { title: `Review and test ${taskTitle}`, estimatedHours: 0.5 },
  ];
}
