export interface User {
    id: number;
    username: string;
    email: string;
    position: string;
    password: string;
}

export interface Constractor {
    id: number;
    name: string;
}

export interface Supervision {
    id: number;
    name: string;
    user: User;
}

export interface ConstructionProject {
    id: number;
    name: string;
    description: string; 
    users: User[];
    constractor: number;
    supervision: number;
    coordinates: [number, number][];
    status?: 'active' | 'completed' | 'planned';
}

export interface Post {
    id: number;
    title: string;
    created_at: string;
    content: string;
    files: File;
    object: ConstructionProject;
    author: User;
}

export interface File {
    id: number;
    post_id: number;
    path: string;
}

export interface LoginRequest {
    email: string; 
    password: string;
}

export interface LoginResponse {
    token: string;
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
    description?: string;
    constractorId: number;
    supervisionId: number;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    object: number; 
    author: number; 
    coordinates: [number, number]; 
}

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
}

export interface Material {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    projectId: number;
    qualityDocumentUrl?: string;
    ttnDocumentUrl?: string;
}

export interface Task {
    id: number;
    projectId: number;
    title: string;
    description: string;
    assignedTo: number;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    deadline?: string;
    createdAt: string;
    coordinates: [number, number];
}

export interface Issue {
    id: number;
    projectId: number;
    title: string;
    description: string;
    createdBy: number;
    status: 'open' | 'in_progress' | 'resolved';
    severity: 'low' | 'medium' | 'high' | 'critical';
    deadline?: string;
    createdAt: string;
    coordinates: [number, number];
}