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
    status?: string; 
}

interface PostResponse {
    id: number;
    title: string;
    content: string;
    created_at: string;
    author: {
        id: number;
        username: string;
        email: string;
    };
}

class OfflineService {
    private pendingActions: PendingAction[] = [];
    private syncInProgress = false;

    constructor() {
        this.loadPendingActions();
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // синхронизация (каждые 30 секунд)
        setInterval(() => this.syncPendingActions(), 30000);
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
        
        console.log(`📱 Action saved offline: ${type}`, action.id);
        return action.id;
    }

    async syncPendingActions(): Promise<void> {
        if (!navigator.onLine || this.syncInProgress || this.pendingActions.length === 0) {
            return;
        }

        this.syncInProgress = true;
        console.log(`🔄 Syncing ${this.pendingActions.length} pending actions...`);

        const actionsToProcess = [...this.pendingActions];
        const successfulActions: string[] = [];

        for (const action of actionsToProcess) {
            try {
                console.log(`🔄 Processing action: ${action.type}`, action.id);
                
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
                            const response = await api.post<PostResponse>(
                                `/objects/access/${postData.object}/create_post/`, 
                                postData
                            );
                            console.log('✅ Post synced successfully:', response.data);
                        } else {
                            console.warn('Cannot sync post with files offline');
                            continue;
                        }
                        break;
                    }
                    case 'ADD_MATERIAL':
                        await api.post('/materials', action.payload);
                        break;
                    default:
                        console.warn(`Unknown action type: ${action.type}`);
                        continue;
                }
                
                successfulActions.push(action.id);
                console.log(`✅ Action ${action.type} synced successfully`);
                
            } catch (error) {
                console.error(`❌ Failed to sync action ${action.type}:`, error);
                
                // если ошибка не связана с сетью, удаление action чтобы избежать бесконечных попыток
                if (error instanceof Error && !error.message.includes('Network Error')) {
                    console.warn(`Removing failed action ${action.type} due to server error`);
                    successfulActions.push(action.id);
                }
            }
        }

        // удаление успешно синхронизированных actions
        this.pendingActions = this.pendingActions.filter(
            action => !successfulActions.includes(action.id)
        );
        this.savePendingActions();
        
        this.syncInProgress = false;
        
        if (successfulActions.length > 0) {
            console.log(`🎉 Successfully synced ${successfulActions.length} actions`);
            this.showSyncNotification(successfulActions.length);
        }
    }

    private handleOnline() {
        console.log('🌐 Online - starting sync...');
        this.syncPendingActions();
    }

    private handleOffline() {
        console.log('📴 Offline - actions will be saved locally');
    }

    private showSyncNotification(count: number) {
        console.log(`🔄 ${count} actions synced with server`);
        
        if (count > 0) {
            alert(`Успешно синхронизировано ${count} действий с сервером`);
        }
    }

    private loadPendingActions(): void {
        try {
            const stored = localStorage.getItem('pendingActions');
            if (stored) {
                this.pendingActions = JSON.parse(stored);
                console.log(`📂 Loaded ${this.pendingActions.length} pending actions from storage`);
            }
        } catch (error) {
            console.error('Error loading pending actions:', error);
            this.pendingActions = [];
        }
    }

    private savePendingActions(): void {
        try {
            localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
        } catch (error) {
            console.error('Error saving pending actions:', error);
        }
    }

    isOnline(): boolean {
        return navigator.onLine;
    }

    canSavePostOffline(postData: OfflinePostData): boolean { 
        return !postData.files || postData.files.length === 0;
    }

    getPendingActionsCount(): number {
        return this.pendingActions.length;
    }

    getPendingActions(): PendingAction[] {
        return [...this.pendingActions];
    }

    clearPendingActions(): void {
        this.pendingActions = [];
        this.savePendingActions();
        console.log('🧹 All pending actions cleared');
    }
}

export const offlineService = new OfflineService();