// src/entities/goal/model/slice/index.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Goal } from '../../types';
import { saveGoal, getGoals, deleteGoal, updateGoal } from '@shared/lib/db';



export interface StateSchemaGoals {
  items: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: StateSchemaGoals = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchGoals = createAsyncThunk('goals/fetchGoals', async () => {
  const goals = await getGoals();
  return goals;
});

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (data: { title: string; description?: string; targetDate?: number }) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      status: 'active',
      targetDate: data.targetDate,
      actualDate: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveGoal(newGoal);
    return newGoal;
  }
);

export const editGoal = createAsyncThunk(
  'goals/editGoal',
  async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
    const existingGoals = await getGoals();
    const goal = existingGoals.find(g => g.id === id);
    if (!goal) throw new Error('Goal not found');
    
    const updatedGoal = { 
      ...goal, 
      ...updates, 
      updatedAt: Date.now(),
      // Если статус меняется на completed, устанавливаем дату выполнения
      actualDate: updates.status === 'completed' && goal.status !== 'completed' 
        ? Date.now() 
        : goal.actualDate
    };
    await saveGoal(updatedGoal);
    return updatedGoal;
  }
);

export const removeGoal = createAsyncThunk('goals/removeGoal', async (id: string) => {
  await deleteGoal(id);
  return id;
});

// Slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    updateGoalLocally(state, action: PayloadAction<Goal>) {
      const index = state.items.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    clearGoalsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGoals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch goals';
      })
      // createGoal
      .addCase(createGoal.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // editGoal
      .addCase(editGoal.fulfilled, (state, action) => {
        const index = state.items.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // removeGoal
      .addCase(removeGoal.fulfilled, (state, action) => {
        state.items = state.items.filter(g => g.id !== action.payload);
      });
  },
});

export const { actions, reducer } = goalsSlice;
