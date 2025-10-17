// import api from './api';

// interface PendingAction {
//     type: string;
//     payload: unknown;
//     timestamp: number;
//     id: string;
// }

// class OfflineService {
//     private pendingActions: PendingAction[] = [];

//     constructor() {
//         this.loadPendingActions();
//         window.addEventListener('online', this.syncPendingActions.bind(this));
//     }

//     async saveAction(type: string, payload: unknown): Promise<string> {
//         const action: PendingAction = {
//             type,
//             payload,
//             timestamp: Date.now(),
//             id: Math.random().toString(36).slice(2, 11),
//         };
//         this.pendingActions.push(action);
//         this.savePendingActions();

//         return action.id;
//     }

//     async syncPendingActions(): Promise<void> {
//         if (!navigator.onLine) return;

//         const actionsToProcess = [...this.pendingActions];
//         this.pendingActions = [];
//         this.savePendingActions();

//         for (const action of actionsToProcess) {
//             try {
//                 switch (action.type) {
//                     case 'CREATE_TASK':
//                         await api.post('/tasks', action.payload);
//                         break;
//                     case 'CREATE_ISSUE':
//                         await api.post('/issues', action.payload);
//                         break;
//                     case 'CREATE_POST':
//                         await api.post('/posts', action.payload);
//                         break;
//                     case 'ADD_MATERIAL':
//                         await api.post('/materials', action.payload);
//                         break;
//                 }
//             } catch (error) {
//                 console.error(`Failed to sync action ${action.type}:`, error);
//                 this.pendingActions.push(action);
//             }
//         }
//         this.savePendingActions();
//     }

//     private loadPendingActions(): void {
//         const stored = localStorage.getItem('pendingActions');
//         if (stored) {
//             this.pendingActions = JSON.parse(stored);
//         }
//     }

//     private savePendingActions(): void {
//         localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
//     }

//     isOnline(): boolean {
//         return navigator.onLine;
//     }
// }

// export const offlineService = new OfflineService();

import api from './api';

interface PendingAction {
    type: string;
    payload: unknown;
    timestamp: number;
    id: string;
}

interface OfflinePostData {
    title: string;
    content: string;
    author: number;
    object: number;
    files?: File[];
}

class OfflineService {
    private pendingActions: PendingAction[] = [];

    constructor() {
        this.loadPendingActions();
        window.addEventListener('online', this.syncPendingActions.bind(this));
    }

    async saveAction(type: string, payload: unknown): Promise<string> {
        const action: PendingAction = {
            type,
            payload,
            timestamp: Date.now(),
            id: Math.random().toString(36).slice(2, 11),
        };
        this.pendingActions.push(action);
        this.savePendingActions();

        return action.id;
    }

    async syncPendingActions(): Promise<void> {
        if (!navigator.onLine) return;

        const actionsToProcess = [...this.pendingActions];
        this.pendingActions = [];
        this.savePendingActions();

        for (const action of actionsToProcess) {
            try {
                switch (action.type) {
                    case 'CREATE_TASK':
                        await api.post('/tasks', action.payload);
                        break;
                    case 'CREATE_ISSUE':
                        await api.post('/issues', action.payload);
                        break;
                    case 'CREATE_POST': {
                        const postData = action.payload as OfflinePostData; 
                        
                        if (!postData.files || postData.files.length === 0) {
                            await api.post(`/objects/${postData.object}/create_post/`, postData);
                        } else {
                            console.warn('Cannot sync post with files offline');
                        }
                        break;
                    }
                    case 'ADD_MATERIAL':
                        await api.post('/materials', action.payload);
                        break;
                }
            } catch (error) {
                console.error(`Failed to sync action ${action.type}:`, error);
                this.pendingActions.push(action);
            }
        }
        this.savePendingActions();
    }

    private loadPendingActions(): void {
        const stored = localStorage.getItem('pendingActions');
        if (stored) {
            this.pendingActions = JSON.parse(stored);
        }
    }

    private savePendingActions(): void {
        localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
    }

    isOnline(): boolean {
        return navigator.onLine;
    }

    canSavePostOffline(postData: OfflinePostData): boolean { 
        return !postData.files || postData.files.length === 0;
    }
}

export const offlineService = new OfflineService();