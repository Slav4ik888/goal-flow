// src/widgets/command-palette/commands.ts

import type { AppDispatch } from '@app/providers/store';
import { setCurrentView } from '@app/providers/store';
import { exportAllData } from '@features/export/lib/backup';
import { createTask } from '@entities/task/model/tasks-slice';


export interface Command {
  id: string;
  title: string;
  shortcut?: string;
  action: (dispatch: AppDispatch) => void;
}

export const getCommands = (): Command[] => [
  {
    id: 'new-task',
    title: 'Новая задача',
    shortcut: 'N',
    action: (dispatch) => {
      // Открыть модалку создания задачи
      console.log('Open new task modal');
    }
  },
  {
    id: 'new-goal',
    title: 'Новая цель',
    shortcut: 'G',
    action: (dispatch) => {
      dispatch(setCurrentView('goals'));
    }
  },
  {
    id: 'new-project',
    title: 'Новый проект',
    shortcut: 'P',
    action: (dispatch) => {
      dispatch(setCurrentView('projects'));
    }
  },
  {
    id: 'export-data',
    title: 'Экспорт данных',
    shortcut: 'E',
    action: () => {
      exportAllData();
    }
  },
];
