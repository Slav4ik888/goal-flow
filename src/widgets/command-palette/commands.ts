// src/widgets/command-palette/commands.ts

import type { AppDispatch } from '@app/providers/store';
import { uiActions } from '@entities/ui';
import { exportAllData } from '@features/export/lib/backup';
// import { createTask } from '@entities/task';


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
    action: () => {
      // Открыть модалку создания задачи
      console.log('Open new task modal');
    }
  },
  {
    id: 'new-goal',
    title: 'Новая цель',
    shortcut: 'G',
    action: (dispatch) => {
      dispatch(uiActions.setCurrentView('goals'));
    }
  },
  {
    id: 'new-project',
    title: 'Новый проект',
    shortcut: 'P',
    action: (dispatch) => {
      dispatch(uiActions.setCurrentView('projects'));
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
