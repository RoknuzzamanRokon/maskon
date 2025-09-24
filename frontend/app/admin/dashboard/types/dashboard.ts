// Core Dashboard Types and Interfaces

export interface DashboardLayoutProps {
    children: React.ReactNode;
}

export interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export interface HeaderProps {
    onToggleSidebar: () => void;
}

export interface MainContentProps {
    children: React.ReactNode;
}

// Navigation Types
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    children?: MenuItem[];
    requiredRole?: "admin" | "user";
}

// Notification Types
export interface Notification {
    id: string;
    type: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

// Dashboard Metrics Types
export interface DashboardMetrics {
    totalPosts: number;
    totalPortfolioItems: number;
    totalProducts: number;
    totalUsers: number;
    recentActivity: ActivityItem[];
    systemHealth: SystemStatus;
}

export interface ActivityItem {
    id: string;
    type: "post" | "portfolio" | "product" | "user";
    action: "created" | "updated" | "deleted";
    title: string;
    timestamp: string;
    user: string;
}

export interface SystemStatus {
    serverHealth: "healthy" | "warning" | "error";
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    memoryUsage: number;
    cpuUsage: number;
}

// User Management Types
export interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: "admin" | "user";
    isActive: boolean;
    lastLogin: string;
    registrationDate: string;
    activityCount: number;
}

// Theme Types
export type Theme = "light" | "dark";

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

// Error Handling Types
export interface ErrorState {
    hasError: boolean;
    errorMessage: string;
    errorCode?: string;
    retryAction?: () => void;
}

// Component Props Types
export interface MetricCardProps {
    title: string;
    value: number | string;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
}

export interface ChartWidgetProps {
    title: string;
    data: any[];
    type: "line" | "bar" | "pie" | "area";
    height?: number;
    loading?: boolean;
}

export interface ActivityFeedProps {
    activities: ActivityItem[];
    maxItems?: number;
    loading?: boolean;
}

export interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onRemove: (id: string) => void;
    maxVisible?: number;
}

// Data Table Types
export interface DataTableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    loading?: boolean;
    searchable?: boolean;
    sortable?: boolean;
    pagination?: boolean;
    pageSize?: number;
    onRowClick?: (item: T) => void;
    onBulkAction?: (action: string, selectedIds: string[]) => void;
}

// Modal Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
}

// Loading State Types
export interface LoadingSkeletonProps {
    lines?: number;
    height?: string;
    className?: string;
}

export interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

// Responsive Design Types
export type Breakpoint = "mobile" | "tablet" | "desktop" | "large";

export interface ResponsiveConfig {
    mobile: any;
    tablet?: any;
    desktop?: any;
    large?: any;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Form Types
export interface FormField {
    name: string;
    label: string;
    type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "radio";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        pattern?: RegExp;
        minLength?: number;
        maxLength?: number;
        custom?: (value: any) => string | null;
    };
}

export interface FormProps {
    fields: FormField[];
    onSubmit: (data: Record<string, any>) => void;
    loading?: boolean;
    initialValues?: Record<string, any>;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel?: () => void;
}