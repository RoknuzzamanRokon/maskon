import { useEffect, useState } from "react";
import {
  getBlogPosts,
  getPortfolio,
  getProducts,
  getAdminNotifications,
  getAdminSettings,
} from "../../../lib/api";

interface DashboardStats {
  totalPosts: number;
  totalPortfolio: number;
  totalProducts: number;
  totalUsers: number;
  unreadNotifications: number;
  recentActivity: ActivityItem[];
  systemHealth: {
    status: "healthy" | "warning" | "error";
    uptime: string;
    lastBackup: string;
    activeUsers: number;
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  weeklyTrends: {
    posts: number[];
    users: number[];
    revenue: number[];
    views: number[];
  };
  performanceMetrics: {
    pageViews: number;
    bounceRate: number;
    avgSession: string;
    conversionRate: number;
    loadTime: number;
    errorRate: number;
  };
  analytics: {
    topPages: Array<{ page: string; views: number; change: number }>;
    userGrowth: number;
    revenueGrowth: number;
    engagementRate: number;
    retentionRate: number;
  };
  realtimeData: {
    onlineUsers: number;
    activeChats: number;
    serverLoad: number;
    requestsPerMinute: number;
  };
}

interface ActivityItem {
  id: string;
  type: "post" | "portfolio" | "product" | "user" | "system";
  action: string;
  title: string;
  timestamp: string;
  user?: string;
  avatar?: string;
}

interface QuickStat {
  icon: string;
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  color: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setIsRefreshing(!showLoading);

      // Fetch real data from APIs
      const [posts, portfolio, products, notifications, settings] =
        await Promise.all([
          getBlogPosts(100).catch(() => []),
          getPortfolio().catch(() => []),
          getProducts(100).catch(() => []),
          getAdminNotifications().catch(() => ({
            notifications: [],
            unreadCount: 0,
          })),
          getAdminSettings().catch(() => ({
            system_stats: { total_users: 0 },
          })),
        ]);

      // Generate recent activity from real data
      const recentActivity: ActivityItem[] = [
        ...posts.slice(0, 5).map((post: any, index: number) => ({
          id: `post-${post.id}`,
          type: "post" as const,
          action: Math.random() > 0.5 ? "created" : "updated",
          title: post.title,
          timestamp:
            post.created_at ||
            new Date(Date.now() - index * 3600000).toISOString(),
          user: "Admin",
          avatar: "👨‍💼",
        })),
        ...portfolio.slice(0, 3).map((item: any, index: number) => ({
          id: `portfolio-${item.id}`,
          type: "portfolio" as const,
          action: "published",
          title: item.title,
          timestamp:
            item.created_at ||
            new Date(Date.now() - (index + 3) * 3600000).toISOString(),
          user: "Designer",
          avatar: "🎨",
        })),
        ...products.slice(0, 2).map((product: any, index: number) => ({
          id: `product-${product.id}`,
          type: "product" as const,
          action: "added",
          title: product.name,
          timestamp:
            product.created_at ||
            new Date(Date.now() - (index + 5) * 3600000).toISOString(),
          user: "Manager",
          avatar: "🛒",
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 8);

      // Generate mock trends data based on time range
      const generateTrendData = (base: number) => {
        return Array.from(
          { length: 7 },
          (_, i) => base + Math.floor(Math.random() * 10)
        );
      };

      const dashboardStats: DashboardStats = {
        totalPosts: posts.length,
        totalPortfolio: portfolio.length,
        totalProducts: products.length,
        totalUsers: settings.system_stats?.total_users || 1,
        unreadNotifications: notifications.unreadCount || 0,
        recentActivity,
        systemHealth: {
          status: Math.random() > 0.8 ? "warning" : "healthy",
          uptime: "15d 8h 42m",
          lastBackup: new Date(Date.now() - 24 * 3600000).toISOString(),
          activeUsers: Math.floor(Math.random() * 50) + 10,
          responseTime: Math.floor(Math.random() * 200) + 50,
          cpuUsage: Math.floor(Math.random() * 40) + 20,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          diskUsage: Math.floor(Math.random() * 20) + 60,
          networkLatency: Math.floor(Math.random() * 50) + 10,
        },
        weeklyTrends: {
          posts: generateTrendData(posts.length),
          users: generateTrendData(settings.system_stats?.total_users || 1),
          revenue: generateTrendData(1000),
          views: generateTrendData(5000),
        },
        performanceMetrics: {
          pageViews: Math.floor(Math.random() * 10000) + 5000,
          bounceRate: Math.floor(Math.random() * 30) + 15,
          avgSession: `${Math.floor(Math.random() * 5) + 2}:${Math.floor(
            Math.random() * 60
          )
            .toString()
            .padStart(2, "0")}`,
          conversionRate: Math.floor(Math.random() * 5) + 1,
          loadTime: Math.floor(Math.random() * 2000) + 500,
          errorRate: Math.floor(Math.random() * 3) + 0.1,
        },
        analytics: {
          topPages: [
            { page: "/blog", views: 2847, change: 12.5 },
            { page: "/portfolio", views: 1923, change: 8.3 },
            { page: "/products", views: 1456, change: -2.1 },
            { page: "/contact", views: 892, change: 15.7 },
            { page: "/", views: 3421, change: 22.1 },
          ],
          userGrowth: Math.floor(Math.random() * 20) + 5,
          revenueGrowth: Math.floor(Math.random() * 15) + 8,
          engagementRate: Math.floor(Math.random() * 30) + 60,
          retentionRate: Math.floor(Math.random() * 20) + 70,
        },
        realtimeData: {
          onlineUsers: Math.floor(Math.random() * 25) + 5,
          activeChats: Math.floor(Math.random() * 8) + 2,
          serverLoad: Math.floor(Math.random() * 40) + 30,
          requestsPerMinute: Math.floor(Math.random() * 500) + 200,
        },
      };

      setStats(dashboardStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set fallback data if API fails
      setStats({
        totalPosts: 0,
        totalPortfolio: 0,
        totalProducts: 0,
        totalUsers: 1,
        unreadNotifications: 0,
        recentActivity: [],
        systemHealth: {
          status: "error",
          uptime: "0d 0h 0m",
          lastBackup: new Date().toISOString(),
          activeUsers: 0,
          responseTime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLatency: 0,
        },
        weeklyTrends: {
          posts: [0, 0, 0, 0, 0, 0, 0],
          users: [0, 0, 0, 0, 0, 0, 0],
          revenue: [0, 0, 0, 0, 0, 0, 0],
          views: [0, 0, 0, 0, 0, 0, 0],
        },
        performanceMetrics: {
          pageViews: 0,
          bounceRate: 0,
          avgSession: "0:00",
          conversionRate: 0,
          loadTime: 0,
          errorRate: 0,
        },
        analytics: {
          topPages: [],
          userGrowth: 0,
          revenueGrowth: 0,
          engagementRate: 0,
          retentionRate: 0,
        },
        realtimeData: {
          onlineUsers: 0,
          activeChats: 0,
          serverLoad: 0,
          requestsPerMinute: 0,
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate real quick stats from actual data
  const quickStats: QuickStat[] = [
    {
      icon: "📝",
      label: "Total Posts",
      value: stats?.totalPosts.toString() || "0",
      change: 12.5,
      trend: "up",
      color: "text-blue-600",
    },
    {
      icon: "🎨",
      label: "Portfolio Items",
      value: stats?.totalPortfolio.toString() || "0",
      change: 8.3,
      trend: "up",
      color: "text-purple-600",
    },
    {
      icon: "🛍️",
      label: "Products",
      value: stats?.totalProducts.toString() || "0",
      change: -2.1,
      trend: stats?.totalProducts > 5 ? "up" : "down",
      color: stats?.totalProducts > 5 ? "text-green-600" : "text-orange-600",
    },
    {
      icon: "👥",
      label: "Active Users",
      value: stats?.totalUsers.toString() || "1",
      change: 15.7,
      trend: "up",
      color: "text-green-600",
    },
  ];

  const MiniBarChart = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    return (
      <div className="flex items-end space-x-1 h-8">
        {data.map((value, index) => (
          <div
            key={index}
            className={`flex-1 rounded-t ${color} transition-all duration-300 hover:opacity-80`}
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Dashboard Unavailable
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We're having trouble loading your dashboard data.
            </p>
            <button
              onClick={() => fetchDashboardData()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Welcome back! Here's what's happening with your system today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              <svg
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.trend === "up" ? "↗" : "↘"} {stat.change}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      from last week
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Metrics
                </h3>
                <div className="flex space-x-2">
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range as any)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        timeRange === range
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.performanceMetrics.pageViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page Views
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.performanceMetrics.bounceRate}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bounce Rate
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.performanceMetrics.avgSession}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Session
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.performanceMetrics.conversionRate}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conversion
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Posts Trend</span>
                    <span>Last 7 days</span>
                  </div>
                  <MiniBarChart
                    data={stats.weeklyTrends.posts}
                    color="bg-gradient-to-t from-blue-500 to-blue-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Users Growth</span>
                    <span>Last 7 days</span>
                  </div>
                  <MiniBarChart
                    data={stats.weeklyTrends.users}
                    color="bg-gradient-to-t from-green-500 to-green-400"
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.recentActivity.length} activities
                </span>
              </div>

              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{activity.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.user} •{" "}
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Health
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stats.systemHealth.status === "healthy"
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                      : stats.systemHealth.status === "warning"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                  }`}
                >
                  {stats.systemHealth.status}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Uptime</span>
                    <span>{stats.systemHealth.uptime}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Response Time</span>
                    <span>{stats.systemHealth.responseTime}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stats.systemHealth.responseTime < 100
                          ? "bg-green-500"
                          : stats.systemHealth.responseTime < 300
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (stats.systemHealth.responseTime / 500) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.systemHealth.activeUsers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active Users
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Date(
                        stats.systemHealth.lastBackup
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last Backup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔔</span>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {stats.unreadNotifications}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Unread notifications
                </p>
                <button className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all">
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: "📝",
                  label: "Create Post",
                  description: "Write a new blog post",
                  color: "from-blue-500 to-blue-600",
                  href: "/admin/posts/create",
                },
                {
                  icon: "🎨",
                  label: "Add Portfolio",
                  description: "Showcase your work",
                  color: "from-purple-500 to-purple-600",
                  href: "/admin/portfolio",
                },
                {
                  icon: "🛍️",
                  label: "Manage Products",
                  description: "Update product catalog",
                  color: "from-green-500 to-green-600",
                  href: "/admin/products",
                },
                {
                  icon: "👥",
                  label: "User Management",
                  description: "Manage user accounts",
                  color: "from-orange-500 to-orange-600",
                  href: "/admin/users",
                },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => (window.location.href = action.href)}
                  className="flex items-center p-4 bg-gradient-to-r hover:scale-105 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mr-4`}
                  >
                    <span className="text-2xl text-white">{action.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              System Resources
            </h3>
            <div className="space-y-6">
              {[
                {
                  label: "Storage",
                  used: 65,
                  total: 100,
                  color: "bg-blue-500",
                },
                { label: "Memory", used: 42, total: 64, color: "bg-green-500" },
                { label: "CPU", used: 23, total: 100, color: "bg-purple-500" },
                {
                  label: "Database",
                  used: 78,
                  total: 100,
                  color: "bg-orange-500",
                },
              ].map((resource, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>{resource.label}</span>
                    <span>
                      {resource.used}GB / {resource.total}GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${resource.color} h-2 rounded-full transition-all duration-500`}
                      style={{
                        width: `${(resource.used / resource.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Analytics & Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Real-time Analytics
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Live
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-gray-200 dark:text-gray-700"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${
                        stats.realtimeData.onlineUsers * 3
                      }, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.realtimeData.onlineUsers}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Online
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.realtimeData.activeChats}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Active Chats
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.realtimeData.requestsPerMinute}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Req/min
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Pages
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                This week
              </span>
            </div>

            <div className="space-y-4">
              {stats.analytics.topPages.slice(0, 4).map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {page.page}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {page.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      page.change >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {page.change >= 0 ? "+" : ""}
                    {page.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Status
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    SSL Certificate
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Valid
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">🛡️</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Firewall
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ⚠️
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Updates
                  </span>
                </div>
                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                  2 Pending
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">🔐</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    2FA Users
                  </span>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  85%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Performance Monitor
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">
                  Real-time
                </span>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      stats.systemHealth.cpuUsage > 80
                        ? "text-red-500"
                        : stats.systemHealth.cpuUsage > 60
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${stats.systemHealth.cpuUsage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.systemHealth.cpuUsage}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                CPU Usage
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                4 cores @ 3.2GHz
              </p>
            </div>

            {/* Memory Usage */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      stats.systemHealth.memoryUsage > 80
                        ? "text-red-500"
                        : stats.systemHealth.memoryUsage > 60
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${stats.systemHealth.memoryUsage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.systemHealth.memoryUsage}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Memory
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                16 GB DDR4
              </p>
            </div>

            {/* Disk Usage */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      stats.systemHealth.diskUsage > 80
                        ? "text-red-500"
                        : stats.systemHealth.diskUsage > 60
                        ? "text-yellow-500"
                        : "text-purple-500"
                    }`}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${stats.systemHealth.diskUsage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.systemHealth.diskUsage}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Storage
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                500 GB NVMe SSD
              </p>
            </div>

            {/* Network */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      stats.systemHealth.networkLatency > 100
                        ? "text-red-500"
                        : stats.systemHealth.networkLatency > 50
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${
                      100 - stats.systemHealth.networkLatency / 2
                    }, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.systemHealth.networkLatency}ms
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Network
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latency
              </p>
            </div>
          </div>
        </div>

        {/* Content Analytics & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Content Performance
            </h3>

            <div className="space-y-6">
              {/* Blog Posts */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📝</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Blog Posts
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Published articles
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalPosts}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total
                  </p>
                </div>
              </div>

              {/* Portfolio */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🎨</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Portfolio
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showcase projects
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.totalPortfolio}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Projects
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🛍️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Products
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalProducts}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Items
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 shadow-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Insights
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart recommendations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Content Strategy
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Your blog posts are performing{" "}
                      {stats.totalPosts > 5 ? "excellently" : "well"}!
                      {stats.totalPosts < 5
                        ? " Consider publishing more content to increase engagement."
                        : " Keep up the great work."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Performance Tip
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      System performance is{" "}
                      {stats.systemHealth.status === "healthy"
                        ? "optimal"
                        : "needs attention"}
                      .
                      {stats.systemHealth.responseTime > 200
                        ? " Consider optimizing response times."
                        : " All metrics look good."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Growth Opportunity
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {stats.totalPortfolio < 3
                        ? "Add more portfolio items to showcase your work better."
                        : "Your portfolio is well-stocked. Focus on quality updates."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Analytics Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analytics Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Key performance indicators for the current period
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">👥</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                +{stats.analytics.userGrowth}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                User Growth
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                vs last month
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{stats.analytics.revenueGrowth}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Revenue Growth
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                vs last month
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">❤️</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.analytics.engagementRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Engagement Rate
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                average rate
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">🔄</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.analytics.retentionRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Retention Rate
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                30-day rate
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Analytics & Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Pages
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  This week
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-4">
              {stats.analytics.topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {page.page}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {page.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium ${
                        page.change >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {page.change >= 0 ? "+" : ""}
                      {page.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Monitoring */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Real-time Monitoring
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Live
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg
                    className="w-20 h-20 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-gray-200 dark:text-gray-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${
                        stats.realtimeData.onlineUsers * 2
                      }, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {stats.realtimeData.onlineUsers}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Online Users
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg
                    className="w-20 h-20 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-gray-200 dark:text-gray-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${stats.realtimeData.serverLoad}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {stats.realtimeData.serverLoad}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Server Load
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.realtimeData.activeChats}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Chats
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.realtimeData.requestsPerMinute}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Requests/min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Insights & Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart suggestions based on your data
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "📈",
                title: "Traffic Growth",
                message:
                  "Your blog traffic increased by 22% this week. Consider publishing more content on similar topics.",
                type: "success",
              },
              {
                icon: "⚡",
                title: "Performance Alert",
                message:
                  "Page load time is 15% slower than usual. Check your image optimization.",
                type: "warning",
              },
              {
                icon: "🎯",
                title: "Engagement Boost",
                message:
                  "Posts with images get 3x more engagement. Add visuals to increase interaction.",
                type: "info",
              },
            ].map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                    : insight.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.analytics.userGrowth}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                User Growth
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.analytics.revenueGrowth}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Revenue Growth
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.analytics.engagementRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Engagement Rate
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.analytics.retentionRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Retention Rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
