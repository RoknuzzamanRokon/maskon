export interface Notification {
    id: string;
    type: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    actionLabel?: string;
    category?: "system" | "user" | "content" | "security";
    priority?: "low" | "medium" | "high" | "critical";
    source?: string;
    metadata?: {
        [key: string]: any;
    };
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    lastFetch: string | null;
}

export interface NotificationContextType {
    state: NotificationState;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAll: () => void;
    fetchNotifications: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

export interface NotificationFilters {
    type?: Notification['type'];
    category?: Notification['category'];
    isRead?: boolean;
    priority?: Notification['priority'];
}

export interface NotificationPreferences {
    enableRealTime: boolean;
    enableSound: boolean;
    categories: {
        system: boolean;
        user: boolean;
        content: boolean;
        security: boolean;
    };
    priorities: {
        low: boolean;
        medium: boolean;
        high: boolean;
        critical: boolean;
    };
}
