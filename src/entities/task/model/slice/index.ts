// src/entities/task/model/slice/index.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '../../types';
import { saveTask, getTasks, deleteTask, updateTask } from '@shared/lib/db';



interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const tasks = await getTasks();
  return tasks;
});

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpentSeconds'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      timeSpentSeconds: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveTask(newTask);
    return newTask;
  }
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
    const existingTasks = await getTasks();
    const task = existingTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    const updatedTask = { ...task, ...updates, updatedAt: Date.now() };
    await saveTask(updatedTask);
    return updatedTask;
  }
);

export const removeTask = createAsyncThunk('tasks/removeTask', async (id: string) => {
  await deleteTask(id);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    updateTaskLocally(state, action: PayloadAction<Task>) {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // editTask
      .addCase(editTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // removeTask
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export const { updateTaskLocally } = tasksSlice.actions;
export default tasksSlice.reducer;
