"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Briefcase,
  ShoppingBag,
  Users,
  TrendingUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import MetricCard from "../../../components/admin/widgets/MetricCard";
import ActivityFeed from "../../../components/admin/widgets/ActivityFeed";
import {
  getDashboardMetrics,
  getRecentActivity,
  type DashboardMetrics,
  type ActivityItem,
} from "../../../lib/api";
import { DashboardSkeleton } from "./LoadingStates";
import { ErrorFallback } from "./ErrorBoundary";
import { useDashboard } from "../contexts/DashboardContext";
import {
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveStack,
} from "./ResponsiveCard";
import { ResponsiveButton, ResponsiveIconButton } from "./ResponsiveButton";
import { useScreenSize } from "../utils/responsive";

export default function DashboardOverview() {
  const { setLoading, setError, addNotification } = useDashboard();
  const { isMobile, isTablet } = useScreenSize();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const [metricsData, activityData] = await Promise.all([
        getDashboardMetrics(),
        getRecentActivity(10),
      ]);

      setMetrics(metricsData);
      setRecentActivity(activityData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      addNotification({
        type: "error",
        title: "Dashboard Error",
        message: "Failed to load dashboard data",
        isRead: false,
      });
    } finally {
      setLoading(false);
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

  const getMetricChange = (current: number, type: string) => {
    // Mock trend data - in real implementation, this would come from the API
    const trends: Record<
      string,
      { value: number; type: "increase" | "decrease" | "neutral" }
    > = {
      posts: { value: 12.5, type: "increase" },
      portfolio: { value: 8.3, type: "increase" },
      products: { value: 5.7, type: "increase" },
      users: { value: 15.2, type: "increase" },
    };

    return trends[type] || { value: 0, type: "neutral" as const };
  };

  if (!metrics) {
    return <DashboardSkeleton />;
  }

  return (
    <ResponsiveStack spacing="lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Welcome back! Here's what's happening with your site.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {lastUpdated && !isMobile && (
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <ResponsiveButton
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="secondary"
            size={isMobile ? "sm" : "md"}
            className="self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isMobile ? "Refresh" : "Refresh Data"}
          </ResponsiveButton>
        </div>
      </div>

      {/* Metrics Cards */}
      <ResponsiveGrid
        columns={{ xs: 1, sm: 2, lg: 4 }}
        gap={isMobile ? "sm" : "md"}
      >
        <MetricCard
          title="Total Posts"
          value={metrics.totalPosts}
          change={{
            ...getMetricChange(metrics.totalPosts, "posts"),
            period: "vs last month",
          }}
          icon={FileText}
          onClick={() => (window.location.href = "/admin/posts")}
        />

        <MetricCard
          title="Portfolio Items"
          value={metrics.totalPortfolioItems}
          change={{
            ...getMetricChange(metrics.totalPortfolioItems, "portfolio"),
            period: "vs last month",
          }}
          icon={Briefcase}
          onClick={() => (window.location.href = "/admin/portfolio")}
        />

        <MetricCard
          title="Products"
          value={metrics.totalProducts}
          change={{
            ...getMetricChange(metrics.totalProducts, "products"),
            period: "vs last month",
          }}
          icon={ShoppingBag}
          onClick={() => (window.location.href = "/admin/products")}
        />

        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change={{
            ...getMetricChange(metrics.totalUsers, "users"),
            period: "vs last month",
          }}
          icon={Users}
        />
      </ResponsiveGrid>

      {/* Main Content Grid */}
      <ResponsiveGrid columns={{ xs: 1, lg: 3 }} gap={isMobile ? "sm" : "md"}>
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={recentActivity}
            maxItems={isMobile ? 5 : 8}
            showViewAll={true}
            onViewAll={() => {
              // Navigate to full activity log
              console.log("Navigate to full activity log");
            }}
            onItemClick={(activity) => {
              // Navigate to specific item
              console.log("Navigate to activity item:", activity);
            }}
          />
        </div>

        {/* System Health */}
        <ResponsiveCard padding={isMobile ? "sm" : "md"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {/* Server Health */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Server Status
              </span>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    metrics.systemHealth.serverHealth === "healthy"
                      ? "bg-green-500"
                      : metrics.systemHealth.serverHealth === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {metrics.systemHealth.serverHealth}
                </span>
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Uptime
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.systemHealth.uptime}%
              </span>
            </div>

            {/* Response Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Response Time
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.systemHealth.responseTime}ms
              </span>
            </div>

            {/* Active Users */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.systemHealth.activeUsers}
              </span>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Memory Usage
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.systemHealth.memoryUsage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.systemHealth.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  CPU Usage
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.systemHealth.cpuUsage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.systemHealth.cpuUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <ResponsiveCard padding={isMobile ? "sm" : "md"}>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>

        <ResponsiveGrid columns={{ xs: 1, md: 3 }} gap={isMobile ? "sm" : "md"}>
          <ResponsiveCard
            onClick={() => (window.location.href = "/admin/posts")}
            className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
            padding="sm"
            ariaLabel="Create new post"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Create New Post
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Write a new blog post
                </p>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard
            onClick={() => (window.location.href = "/admin/portfolio/new")}
            className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
            padding="sm"
            ariaLabel="Add portfolio item"
          >
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Add Portfolio Item
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Showcase your work
                </p>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard
            onClick={() => (window.location.href = "/admin/products/create")}
            className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
            padding="sm"
            ariaLabel="Create product"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  Create Product
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Add a new product
                </p>
              </div>
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>
      </ResponsiveCard>
    </ResponsiveStack>
  );
}
