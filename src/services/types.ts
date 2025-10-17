// export interface User {
//     id?: number;
//     username?: string;
//     email: string;
//     position?: string;
//     password: string;
// }

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
    id?: number;
    name: string;
    description: string;
    responsibleContractor?: {
        username: string;
        position: string;
        email: string;
    };
    responsibleSupervision?: {
        username: string;
        position: string;
        email: string;
    };
    coordinates: Array<{
        x: number;
        y: number;
    }>;
    status?: 'active' | 'completed' | 'planned';
    posts?: Post[] | null; // Добавляем поле posts
    users?: User[]; // Оставляем users, если оно используется
}

export interface Post {
    id: number;
    title: string;
    created_at: string;
    content: string;
    files: string[]; // Измените на массив строк (пути к файлам)
    object: ConstructionProject;
    author: User;
}

export interface PostFile {
    id: number;
    post_id: number;
    path: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    author: number; // ID автора
    object: number; // ID объекта
    files?: File[]; // Опциональный массив файлов для загрузки
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken?: string;
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
    status?: number;
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

export interface User {
    id?: number;
    username?: string;
    email: string;
    position?: string;
}

export interface LoginRequest {
    email: string; 
    password: string;
}

export interface LoginResponse {
    token: string;
    user?: User;
    refreshToken?: string;
}

export interface FileUploadResponse {
  message: string;
  fileUrl?: string;
}