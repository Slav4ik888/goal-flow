// src/entities/project/model/slice/index.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Project, ProjectStatus } from '../../types';
import { saveProject, getProjects, deleteProject } from '@shared/lib/db';


export interface StateSchemaProjects {
  items: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: StateSchemaProjects = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
  const projects = await getProjects();
  return projects;
});

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: { title: string; description?: string; goalId?: string }) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      goalId: data.goalId,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProject(newProject);
    return newProject;
  }
);

export const editProject = createAsyncThunk(
  'projects/editProject',
  async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
    const existingProjects = await getProjects();
    const project = existingProjects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    
    const updatedProject = { ...project, ...updates, updatedAt: Date.now() };
    await saveProject(updatedProject);
    return updatedProject;
  }
);

export const removeProject = createAsyncThunk('projects/removeProject', async (id: string) => {
  await deleteProject(id);
  return id;
});

export const archiveProject = createAsyncThunk(
  'projects/archiveProject',
  async (id: string) => {
    const existingProjects = await getProjects();
    const project = existingProjects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    
    const updatedProject = { 
      ...project, 
      status: 'archived' as ProjectStatus, 
      updatedAt: Date.now() 
    };
    await saveProject(updatedProject);
    return updatedProject;
  }
);

// Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    updateProjectLocally(state, action: PayloadAction<Project>) {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    clearProjectsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      // createProject
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // editProject
      .addCase(editProject.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // removeProject
      .addCase(removeProject.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      // archiveProject
      .addCase(archiveProject.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { actions, reducer } = projectsSlice;
