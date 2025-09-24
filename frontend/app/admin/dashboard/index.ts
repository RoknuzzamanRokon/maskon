// Main Dashboard Exports
export * from "./layout";
export { DashboardProvider, useDashboard } from "./contexts/DashboardContext";
export * from "./utils/responsive";

// Re-export specific types to avoid conflicts
export type {
    DashboardLayoutProps,
    SidebarProps,
    HeaderProps,
    MainContentProps,
    MetricCardProps,
    ChartWidgetProps,
    ActivityFeedProps,
    NotificationCenterProps,
    DataTableProps,
    ModalProps,
    LoadingSkeletonProps,
    LoadingSpinnerProps,
    ResponsiveConfig,
    ApiResponse,
    PaginatedResponse,
    FormField,
    FormProps,
    ErrorState,
    AdminUser,
    Theme,
    ThemeContextType,
    Breakpoint
} from "./types/dashboard";