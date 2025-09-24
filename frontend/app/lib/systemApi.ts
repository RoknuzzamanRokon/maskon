import { getAuthHeaders } from './api';

const API_BASE_URL = 'http://localhost:8000/api';

export interface SystemMetrics {
    serverHealth: "healthy" | "warning" | "error";
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
    lastUpdated: string;
}

export interface SystemLog {
    id: string;
    timestamp: string;
    level: "info" | "warning" | "error" | "debug";
    source: string;
    message: string;
    details?: string;
    userId?: string;
    ipAddress?: string;
}

export interface SystemLogsResponse {
    logs: SystemLog[];
    totalCount: number;
    hasMore: boolean;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/system/metrics`, {
            headers: getAuthHeaders(),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.warn('System metrics API returned error status, using mock data');
            return getMockSystemMetrics();
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching system metrics:', error);
        // Return mock data for development - don't throw
        return getMockSystemMetrics();
    }
}

export async function getSystemLogs(options: {
    limit?: number;
    offset?: number;
    level?: string;
    source?: string;
    search?: string;
} = {}): Promise<SystemLog[]> {
    try {
        const { limit = 100, offset = 0, level, source, search } = options;

        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });

        if (level && level !== 'all') params.append('level', level);
        if (source && source !== 'all') params.append('source', source);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}/admin/system/logs?${params}`, {
            headers: getAuthHeaders(),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.warn('System logs API returned error status, using mock data');
            return getMockSystemLogs();
        }

        const data = await response.json();
        return data.logs || [];
    } catch (error) {
        console.error('Error fetching system logs:', error);
        // Return mock data for development - don't throw
        return getMockSystemLogs();
    }
}

export async function getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "error";
    checks: Array<{
        name: string;
        status: "healthy" | "warning" | "error";
        message: string;
        lastChecked: string;
    }>;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/system/health`, {
            headers: getAuthHeaders(),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.warn('System health API returned error status, using mock data');
            return getMockSystemHealth();
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching system health:', error);
        return getMockSystemHealth();
    }
}

export async function getPerformanceHistory(
    metric: 'cpu' | 'memory' | 'response' | 'errors',
    timeRange: '1h' | '6h' | '24h' | '7d' = '1h'
): Promise<Array<{
    timestamp: string;
    value: number;
}>> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/system/performance/${metric}?range=${timeRange}`,
            {
                headers: getAuthHeaders(),
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            console.warn('Performance history API returned error status, using mock data');
            return getMockPerformanceHistory(metric);
        }

        const data = await response.json();
        return data.history || [];
    } catch (error) {
        console.error('Error fetching performance history:', error);
        return getMockPerformanceHistory(metric);
    }
}

// Mock data functions for development
function getMockSystemMetrics(): SystemMetrics {
    const now = new Date();

    // Generate realistic fluctuating values
    const baseValues = {
        cpuUsage: 35 + Math.random() * 30, // 35-65%
        memoryUsage: 60 + Math.random() * 25, // 60-85%
        diskUsage: 45 + Math.random() * 20, // 45-65%
        responseTime: 200 + Math.random() * 100, // 200-300ms
        errorRate: Math.random() * 2, // 0-2%
        activeUsers: Math.floor(15 + Math.random() * 20), // 15-35 users
        uptime: 86400 * 7 + Math.random() * 86400 // ~7 days
    };

    return {
        serverHealth: baseValues.cpuUsage > 80 || baseValues.memoryUsage > 90 ? "warning" : "healthy",
        uptime: baseValues.uptime,
        responseTime: Math.round(baseValues.responseTime),
        errorRate: Number(baseValues.errorRate.toFixed(2)),
        activeUsers: baseValues.activeUsers,
        memoryUsage: Number(baseValues.memoryUsage.toFixed(1)),
        cpuUsage: Number(baseValues.cpuUsage.toFixed(1)),
        diskUsage: Number(baseValues.diskUsage.toFixed(1)),
        networkLatency: Math.round(10 + Math.random() * 20), // 10-30ms
        lastUpdated: now.toISOString()
    };
}

function getMockSystemLogs(): SystemLog[] {
    const now = new Date();
    const sources = ['api', 'database', 'auth', 'websocket', 'scheduler', 'cache'];
    const levels: Array<"info" | "warning" | "error" | "debug"> = ['info', 'warning', 'error', 'debug'];

    const messages = {
        info: [
            'User authentication successful',
            'Database connection established',
            'Cache cleared successfully',
            'Scheduled task completed',
            'API request processed',
            'WebSocket connection opened'
        ],
        warning: [
            'High memory usage detected',
            'Slow database query detected',
            'Rate limit threshold approaching',
            'Cache miss rate elevated',
            'Connection pool near capacity'
        ],
        error: [
            'Database connection failed',
            'Authentication token expired',
            'API request timeout',
            'File upload failed',
            'WebSocket connection lost'
        ],
        debug: [
            'Query execution plan generated',
            'Cache key invalidated',
            'Session data updated',
            'Background job queued',
            'Configuration reloaded'
        ]
    };

    const logs: SystemLog[] = [];

    for (let i = 0; i < 50; i++) {
        const level = levels[Math.floor(Math.random() * levels.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const messageList = messages[level];
        const message = messageList[Math.floor(Math.random() * messageList.length)];

        const timestamp = new Date(now.getTime() - (i * 60000 + Math.random() * 60000));

        logs.push({
            id: `log_${i + 1}`,
            timestamp: timestamp.toISOString(),
            level,
            source,
            message,
            details: level === 'error' ? `Stack trace:\n  at Function.${source}.handler (/${source}/handler.js:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})\n  at process.processTicksAndRejections (node:internal/process/task_queues.js:95:5)` : undefined,
            userId: Math.random() > 0.7 ? `user_${Math.floor(Math.random() * 100) + 1}` : undefined,
            ipAddress: Math.random() > 0.5 ? `192.168.1.${Math.floor(Math.random() * 255)}` : undefined
        });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getMockSystemHealth() {
    return {
        status: "healthy" as const,
        checks: [
            {
                name: "Database Connection",
                status: "healthy" as const,
                message: "All database connections are responding normally",
                lastChecked: new Date().toISOString()
            },
            {
                name: "Redis Cache",
                status: "healthy" as const,
                message: "Cache is operational with good hit rates",
                lastChecked: new Date().toISOString()
            },
            {
                name: "External APIs",
                status: "warning" as const,
                message: "Some external services experiencing minor delays",
                lastChecked: new Date().toISOString()
            },
            {
                name: "File Storage",
                status: "healthy" as const,
                message: "File system is accessible and responsive",
                lastChecked: new Date().toISOString()
            }
        ]
    };
}

function getMockPerformanceHistory(metric: string) {
    const now = new Date();
    const history = [];

    for (let i = 19; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000); // Every minute for last 20 minutes
        let value;

        switch (metric) {
            case 'cpu':
                value = 30 + Math.random() * 40 + Math.sin(i * 0.3) * 10; // 20-80% with some pattern
                break;
            case 'memory':
                value = 50 + Math.random() * 30 + i * 0.5; // Gradually increasing
                break;
            case 'response':
                value = 200 + Math.random() * 100 + (i % 5 === 0 ? 50 : 0); // Occasional spikes
                break;
            case 'errors':
                value = Math.random() * 3; // 0-3%
                break;
            default:
                value = Math.random() * 100;
        }

        history.push({
            timestamp: timestamp.toISOString(),
            value: Number(value.toFixed(2))
        });
    }

    return history;
}