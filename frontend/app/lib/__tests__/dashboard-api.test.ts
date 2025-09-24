/**
 * Integration tests for Dashboard API functions
 * Tests API interactions, caching, and data flow
 */

import {
    getDashboardMetrics,
    getCachedDashboardMetrics,
    getNotifications,
    getCachedNotifications,
    getUsers,
    getUserDetails,
    updateUserRole,
    updateUserStatus,
    getUserActivity,
    getSystemMetrics,
    getCachedSystemMetrics,
    getSystemLogs,
    bulkDeletePosts,
    bulkDeletePortfolioItems,
    bulkDeleteProducts,
    searchContent,
    dashboardCache,
    dashboardWebSocket,
    dashboardPoller,
    requireAdminAuth,
    validateAdminSession,
    initializeDashboard,
    cleanupDashboard,
    setAuthToken,
    removeAuthToken,
    getAuthToken,
    getUserInfo
} from '../api';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
    readyState: 1,
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Dashboard API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        dashboardCache.clear();
        localStorageMock.getItem.mockReturnValue('mock-token');
    });

    afterEach(() => {
        cleanupDashboard();
    });

    describe('Authentication', () => {
        test('requireAdminAuth should return true for admin users', () => {
            localStorageMock.getItem
                .mockReturnValueOnce('mock-token')
                .mockReturnValueOnce(JSON.stringify({ is_admin: true, username: 'admin' }));

            const result = requireAdminAuth();
            expect(result).toBe(true);
        });

        test('requireAdminAuth should return false for non-admin users', () => {
            localStorageMock.getItem
                .mockReturnValueOnce('mock-token')
                .mockReturnValueOnce(JSON.stringify({ is_admin: false, username: 'user' }));

            const result = requireAdminAuth();
            expect(result).toBe(false);
        });

        test('validateAdminSession should validate session successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ valid: true })
            } as Response);

            const result = await validateAdminSession();
            expect(result).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/validate-session',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    })
                })
            );
        });

        test('validateAdminSession should handle invalid session', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401
            } as Response);

            const result = await validateAdminSession();
            expect(result).toBe(false);
        });
    });

    describe('Dashboard Metrics API', () => {
        const mockMetrics = {
            totalPosts: 42,
            totalPortfolioItems: 18,
            totalProducts: 25,
            totalUsers: 156,
            recentActivity: [],
            systemHealth: {
                serverHealth: 'healthy' as const,
                uptime: 99.8,
                responseTime: 245,
                errorRate: 0.2,
                activeUsers: 23,
                memoryUsage: 68.5,
                cpuUsage: 34.2
            }
        };

        test('getDashboardMetrics should fetch metrics successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics
            } as Response);

            const result = await getDashboardMetrics();
            expect(result).toEqual(mockMetrics);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/dashboard/metrics',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    }),
                    cache: 'no-store'
                })
            );
        });

        test('getDashboardMetrics should return mock data on API error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            } as Response);

            const result = await getDashboardMetrics();
            expect(result).toBeDefined();
            expect(typeof result.totalPosts).toBe('number');
        });

        test('getCachedDashboardMetrics should use cache when available', async () => {
            // First call should fetch from API
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetrics
            } as Response);

            const result1 = await getCachedDashboardMetrics();
            expect(result1).toEqual(mockMetrics);
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await getCachedDashboardMetrics();
            expect(result2).toEqual(mockMetrics);
            expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
        });
    });

    describe('Notifications API', () => {
        const mockNotifications = {
            notifications: [
                {
                    id: 'notif_1',
                    type: 'info' as const,
                    title: 'Test Notification',
                    message: 'This is a test notification',
                    timestamp: new Date().toISOString(),
                    isRead: false
                }
            ],
            unreadCount: 1,
            totalCount: 1
        };

        test('getNotifications should fetch notifications successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockNotifications
            } as Response);

            const result = await getNotifications(10, 0);
            expect(result).toEqual(mockNotifications);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/notifications?limit=10&offset=0',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    }),
                    cache: 'no-store'
                })
            );
        });

        test('getCachedNotifications should cache results', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockNotifications
            } as Response);

            const result1 = await getCachedNotifications(10, 0);
            expect(result1).toEqual(mockNotifications);

            const result2 = await getCachedNotifications(10, 0);
            expect(result2).toEqual(mockNotifications);
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('User Management API', () => {
        const mockUsers = {
            users: [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin' as const,
                    isActive: true,
                    lastLogin: new Date().toISOString(),
                    registrationDate: new Date().toISOString(),
                    activityCount: 156
                }
            ],
            totalCount: 1,
            currentPage: 1,
            totalPages: 1,
            pageSize: 25
        };

        test('getUsers should fetch users successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUsers
            } as Response);

            const result = await getUsers(1, 25);
            expect(result).toEqual(mockUsers);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/users?page=1&page_size=25',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    }),
                    cache: 'no-store'
                })
            );
        });

        test('getUserDetails should fetch user details successfully', async () => {
            const mockUser = mockUsers.users[0];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUser
            } as Response);

            const result = await getUserDetails(1);
            expect(result).toEqual(mockUser);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/users/1',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    }),
                    cache: 'no-store'
                })
            );
        });

        test('updateUserRole should update user role successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            } as Response);

            await updateUserRole(1, 'admin');
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/users/1/role',
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer mock-token'
                    }),
                    body: JSON.stringify({ role: 'admin' })
                })
            );
        });

        test('updateUserStatus should update user status successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            } as Response);

            await updateUserStatus(1, false);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/users/1/status',
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer mock-token'
                    }),
                    body: JSON.stringify({ is_active: false })
                })
            );
        });
    });

    describe('System Monitoring API', () => {
        const mockSystemMetrics = {
            serverHealth: 'healthy' as const,
            uptime: 99.8,
            responseTime: 245,
            errorRate: 0.2,
            activeUsers: 23,
            memoryUsage: 68.5,
            cpuUsage: 34.2,
            diskUsage: 45.7,
            networkIO: {
                bytesIn: 1024000,
                bytesOut: 2048000
            },
            databaseConnections: 12,
            queueSize: 5,
            lastUpdated: new Date().toISOString()
        };

        test('getSystemMetrics should fetch system metrics successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSystemMetrics
            } as Response);

            const result = await getSystemMetrics();
            expect(result).toEqual(mockSystemMetrics);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/system/metrics',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    }),
                    cache: 'no-store'
                })
            );
        });

        test('getCachedSystemMetrics should cache results with shorter TTL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSystemMetrics
            } as Response);

            const result1 = await getCachedSystemMetrics();
            expect(result1).toEqual(mockSystemMetrics);

            const result2 = await getCachedSystemMetrics();
            expect(result2).toEqual(mockSystemMetrics);
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('Bulk Operations', () => {
        test('bulkDeletePosts should delete posts and invalidate cache', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            } as Response);

            // Add something to cache first
            dashboardCache.set('dashboard_metrics', { test: 'data' });
            expect(dashboardCache.get('dashboard_metrics')).toBeTruthy();

            await bulkDeletePosts([1, 2, 3]);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/posts/bulk-delete',
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer mock-token'
                    }),
                    body: JSON.stringify({ post_ids: [1, 2, 3] })
                })
            );

            // Cache should be invalidated
            expect(dashboardCache.get('dashboard_metrics')).toBeNull();
        });

        test('bulkDeletePortfolioItems should delete items and invalidate cache', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            } as Response);

            await bulkDeletePortfolioItems([1, 2]);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/portfolio/bulk-delete',
                expect.objectContaining({
                    method: 'DELETE',
                    body: JSON.stringify({ item_ids: [1, 2] })
                })
            );
        });

        test('bulkDeleteProducts should delete products and invalidate cache', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            } as Response);

            await bulkDeleteProducts([1, 2, 3]);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/products/bulk-delete',
                expect.objectContaining({
                    method: 'DELETE',
                    body: JSON.stringify({ product_ids: [1, 2, 3] })
                })
            );
        });
    });

    describe('Content Search', () => {
        test('searchContent should search across content types', async () => {
            const mockSearchResults = {
                posts: [{ id: 1, title: 'Test Post' }],
                portfolio: [{ id: 1, title: 'Test Portfolio' }],
                products: [{ id: 1, name: 'Test Product' }],
                totalResults: 3
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults
            } as Response);

            const result = await searchContent('test', ['posts', 'portfolio', 'products'], 20);
            expect(result).toEqual(mockSearchResults);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/admin/search?q=test&types=posts%2Cportfolio%2Cproducts&limit=20',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    }),
                    cache: 'no-store'
                })
            );
        });
    });

    describe('Cache Management', () => {
        test('dashboardCache should store and retrieve data', () => {
            const testData = { test: 'data' };
            dashboardCache.set('test_key', testData);

            const retrieved = dashboardCache.get('test_key');
            expect(retrieved).toEqual(testData);
        });

        test('dashboardCache should expire data after TTL', (done) => {
            const testData = { test: 'data' };
            dashboardCache.set('test_key', testData, 100); // 100ms TTL

            expect(dashboardCache.get('test_key')).toEqual(testData);

            setTimeout(() => {
                expect(dashboardCache.get('test_key')).toBeNull();
                done();
            }, 150);
        });

        test('dashboardCache should invalidate patterns', () => {
            dashboardCache.set('notifications_1', { data: 1 });
            dashboardCache.set('notifications_2', { data: 2 });
            dashboardCache.set('other_data', { data: 3 });

            dashboardCache.invalidatePattern('notifications_');

            expect(dashboardCache.get('notifications_1')).toBeNull();
            expect(dashboardCache.get('notifications_2')).toBeNull();
            expect(dashboardCache.get('other_data')).toBeTruthy();
        });

        test('dashboardCache should provide stats', () => {
            dashboardCache.clear();
            dashboardCache.set('key1', 'data1');
            dashboardCache.set('key2', 'data2');

            const stats = dashboardCache.getStats();
            expect(stats.size).toBe(2);
            expect(stats.keys).toContain('key1');
            expect(stats.keys).toContain('key2');
        });
    });

    describe('WebSocket Integration', () => {
        test('dashboardWebSocket should connect and handle messages', () => {
            const mockWs = {
                readyState: 1,
                send: jest.fn(),
                close: jest.fn(),
                onopen: null,
                onclose: null,
                onmessage: null,
                onerror: null
            };

            (global.WebSocket as jest.Mock).mockImplementation(() => mockWs);

            dashboardWebSocket.connect();

            // Simulate connection open
            if (mockWs.onopen) {
                mockWs.onopen({} as Event);
            }

            expect(dashboardWebSocket.isConnected()).toBe(true);
        });

        test('dashboardWebSocket should handle message and invalidate cache', () => {
            dashboardCache.set('dashboard_metrics', { test: 'data' });

            const callback = jest.fn();
            const unsubscribe = dashboardWebSocket.subscribe('metrics_update', callback);

            // Simulate message
            const mockMessage = {
                type: 'metrics_update',
                payload: { newData: 'updated' }
            };

            // Access the private handleMessage method through message event
            const mockWs = {
                readyState: 1,
                send: jest.fn(),
                close: jest.fn(),
                onopen: null,
                onclose: null,
                onmessage: null,
                onerror: null
            };

            (global.WebSocket as jest.Mock).mockImplementation(() => mockWs);
            dashboardWebSocket.connect();

            if (mockWs.onmessage) {
                mockWs.onmessage({
                    data: JSON.stringify(mockMessage)
                } as MessageEvent);
            }

            expect(callback).toHaveBeenCalledWith(mockMessage.payload);
            expect(dashboardCache.get('dashboard_metrics')).toBeNull();

            unsubscribe();
        });
    });

    describe('Polling Fallback', () => {
        test('dashboardPoller should start and stop polling', (done) => {
            const callback = jest.fn().mockResolvedValue(undefined);

            dashboardPoller.startPolling('test', callback, 100);
            expect(dashboardPoller.isPolling('test')).toBe(true);

            setTimeout(() => {
                expect(callback).toHaveBeenCalled();
                dashboardPoller.stopPolling('test');
                expect(dashboardPoller.isPolling('test')).toBe(false);
                done();
            }, 150);
        });

        test('dashboardPoller should handle errors gracefully', (done) => {
            const callback = jest.fn().mockRejectedValue(new Error('Test error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            dashboardPoller.startPolling('test', callback, 100);

            setTimeout(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Polling error for test:',
                    expect.any(Error)
                );
                dashboardPoller.stopPolling('test');
                consoleSpy.mockRestore();
                done();
            }, 150);
        });
    });

    describe('Dashboard Initialization', () => {
        test('initializeDashboard should start WebSocket and polling', () => {
            const connectSpy = jest.spyOn(dashboardWebSocket, 'connect');
            const pollingSpy = jest.spyOn(dashboardPoller, 'startPolling');

            initializeDashboard();

            expect(connectSpy).toHaveBeenCalled();
            expect(pollingSpy).toHaveBeenCalledWith('metrics', expect.any(Function), 60000);
            expect(pollingSpy).toHaveBeenCalledWith('session_validation', expect.any(Function), 300000);
        });

        test('cleanupDashboard should disconnect and clear resources', () => {
            const disconnectSpy = jest.spyOn(dashboardWebSocket, 'disconnect');
            const stopAllSpy = jest.spyOn(dashboardPoller, 'stopAllPolling');
            const clearSpy = jest.spyOn(dashboardCache, 'clear');

            cleanupDashboard();

            expect(disconnectSpy).toHaveBeenCalled();
            expect(stopAllSpy).toHaveBeenCalled();
            expect(clearSpy).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('API functions should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await getDashboardMetrics();
            expect(result).toBeDefined();
            expect(typeof result.totalPosts).toBe('number');
        });

        test('API functions should handle HTTP errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            } as Response);

            const result = await getNotifications();
            expect(result).toBeDefined();
            expect(Array.isArray(result.notifications)).toBe(true);
        });

        test('Bulk operations should throw on API errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            } as Response);

            await expect(bulkDeletePosts([1, 2, 3])).rejects.toThrow('Failed to bulk delete posts');
        });
    });
});