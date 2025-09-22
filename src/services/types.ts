// src/types/api.ts
export interface Role {
  id: number;
  name: 'constractor' | 'supervision' | 'inspector' | 'developer' | 'admin' | 'worker';
}

export interface User {
  id: number;
  username: string;
  email: string;
  position: string;
  password: string;
  role: Role;
}

export interface ConstructionProject {
  id: number;
  name: string;
  coordinates: [number, number][]; // Массив координат [x, y]
  users: User[];
}

export interface Post {
  id: number;
  body: string;
  object: ConstructionProject;
  author: User;
}

// Типы для запросов и ответов API
export interface LoginRequest {
  email: string; // Изменено с username на email
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface CreateProjectRequest {
  name: string;
  coordinates: [number, number][]; 
  users: number[]; 
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}