// src/entities/project/types/index.ts

export interface Project {
  id        : string;
  title     : string;
  goalId?   : string; // Проект может принадлежать цели
  createdAt : number;
}
