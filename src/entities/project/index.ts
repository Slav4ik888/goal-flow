// src/entities/project/index.ts

export type { Project } from './types';
export type { StateSchemaProjects } from './model/slice'
export {
  reducer as projectsReducer, actions as projectsActions,
  editProject, removeProject, archiveProject, fetchProjects, createProject
} from './model/slice'
