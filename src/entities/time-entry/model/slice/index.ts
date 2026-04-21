// src/entities/time-entry/model/slice/index.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TimeEntry } from '../../types';
import { 
  saveTimeEntry, 
  getTimeEntries, 
  deleteTimeEntry, 
  updateTimeEntry,
  getActiveTimeEntry,
  stopTimeEntry 
} from '@shared/lib/db';

export interface StateSchemaTimeEntries {
  items: TimeEntry[];
  activeTimeEntry: TimeEntry | null;
  loading: boolean;
  error: string | null;
}

const initialState: StateSchemaTimeEntries = {
  items: [],
  activeTimeEntry: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTimeEntries = createAsyncThunk('timeEntries/fetchTimeEntries', async () => {
  const entries = await getTimeEntries();
  return entries;
});

export const fetchActiveTimeEntry = createAsyncThunk('timeEntries/fetchActiveTimeEntry', async () => {
  const active = await getActiveTimeEntry();
  return active;
});

export const startTimeEntry = createAsyncThunk(
  'timeEntries/startTimeEntry',
  async ({ taskId }: { taskId: string }) => {
    // Проверяем, нет ли уже активной записи
    const active = await getActiveTimeEntry();
    if (active) {
      throw new Error('Already have an active time entry');
    }
    
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      taskId,
      startTime: Date.now(),
      endTime: undefined,
      duration: 0,
      isRunning: true,
    };
    await saveTimeEntry(newEntry);
    return newEntry;
  }
);

export const stopTimeEntryThunk = createAsyncThunk(
  'timeEntries/stopTimeEntry',
  async ({ entryId }: { entryId: string }) => {
    const stoppedEntry = await stopTimeEntry(entryId);
    if (!stoppedEntry) throw new Error('Failed to stop time entry');
    return stoppedEntry;
  }
);

export const addManualTimeEntry = createAsyncThunk(
  'timeEntries/addManualTimeEntry',
  async ({ taskId, duration, date }: { taskId: string; duration: number; date?: number }) => {
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      taskId,
      startTime: date || Date.now() - duration * 1000,
      endTime: date || Date.now(),
      duration,
      isRunning: false,
    };
    await saveTimeEntry(newEntry);
    return newEntry;
  }
);

export const removeTimeEntry = createAsyncThunk('timeEntries/removeTimeEntry', async (id: string) => {
  await deleteTimeEntry(id);
  return id;
});

export const editTimeEntry = createAsyncThunk(
  'timeEntries/editTimeEntry',
  async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
    const existingEntries = await getTimeEntries();
    const entry = existingEntries.find(e => e.id === id);
    if (!entry) throw new Error('Time entry not found');
    
    const updatedEntry = { ...entry, ...updates };
    await saveTimeEntry(updatedEntry);
    return updatedEntry;
  }
);

// Slice
const timeEntriesSlice = createSlice({
  name: 'timeEntries',
  initialState,
  reducers: {
    updateActiveTimeEntryLocally(state, action: PayloadAction<Partial<TimeEntry>>) {
      if (state.activeTimeEntry) {
        state.activeTimeEntry = { ...state.activeTimeEntry, ...action.payload };
      }
    },
    clearTimeEntriesError(state) {
      state.error = null;
    },
    // Для реального времени обновления таймера
    tickActiveTimer(state) {
      if (state.activeTimeEntry && state.activeTimeEntry.isRunning) {
        const now = Date.now();
        const duration = Math.floor((now - state.activeTimeEntry.startTime) / 1000);
        state.activeTimeEntry.duration = duration;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTimeEntries
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch time entries';
      })
      // fetchActiveTimeEntry
      .addCase(fetchActiveTimeEntry.fulfilled, (state, action) => {
        state.activeTimeEntry = action.payload;
      })
      // startTimeEntry
      .addCase(startTimeEntry.fulfilled, (state, action) => {
        state.activeTimeEntry = action.payload;
        state.items.unshift(action.payload);
      })
      // stopTimeEntryThunk
      .addCase(stopTimeEntryThunk.fulfilled, (state, action) => {
        state.activeTimeEntry = null;
        const index = state.items.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      // addManualTimeEntry
      .addCase(addManualTimeEntry.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // removeTimeEntry
      .addCase(removeTimeEntry.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload);
      })
      // editTimeEntry
      .addCase(editTimeEntry.fulfilled, (state, action) => {
        const index = state.items.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { actions, reducer } = timeEntriesSlice;
