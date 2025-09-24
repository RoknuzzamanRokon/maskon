"use client";

import { useState, useEffect } from "react";
import {
  Server,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
} from "lucide-react";
import SystemStatusCard from "./SystemStatusCard";
import PerformanceCharts from "./PerformanceCharts";
import SystemLogsViewer from "./SystemLogsViewer";
import { getSystemMetrics, getSystemLogs } from "../../../lib/systemApi";

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

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchSystemData = async () => {
    try {
      setError(null);
      const [metricsData, logsData] = await Promise.all([
        getSystemMetrics(),
        getSystemLogs({ limit: 100 }),
      ]);

      setMetrics(metricsData);
      setLogs(logsData);
    } catch (err) {
      console.error("Error fetching system data:", err);
      setError("Failed to load system monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchSystemData();
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSystemData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              Error Loading System Data
            </h3>
          </div>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Monitor
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time system health and performance monitoring
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Auto-refresh:
            </label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-label="Toggle auto-refresh"
              role="switch"
              aria-checked={autoRefresh}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SystemStatusCard
            title="Server Health"
            value={metrics.serverHealth}
            icon={getHealthIcon(metrics.serverHealth)}
            color={getHealthColor(metrics.serverHealth)}
            description="Overall system status"
          />

          <SystemStatusCard
            title="Uptime"
            value={formatUptime(metrics.uptime)}
            icon={<Clock className="w-5 h-5" />}
            color="text-blue-600 dark:text-blue-400"
            description="System uptime"
          />

          <SystemStatusCard
            title="Active Users"
            value={metrics.activeUsers.toString()}
            icon={<Users className="w-5 h-5" />}
            color="text-green-600 dark:text-green-400"
            description="Currently online"
          />

          <SystemStatusCard
            title="Response Time"
            value={`${metrics.responseTime}ms`}
            icon={<Activity className="w-5 h-5" />}
            color={
              metrics.responseTime > 500
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
            description="Average API response"
          />
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SystemStatusCard
            title="CPU Usage"
            value={`${metrics.cpuUsage.toFixed(1)}%`}
            icon={<Cpu className="w-5 h-5" />}
            color={
              metrics.cpuUsage > 80
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }
            description="Processor utilization"
            progress={metrics.cpuUsage}
          />

          <SystemStatusCard
            title="Memory Usage"
            value={`${metrics.memoryUsage.toFixed(1)}%`}
            icon={<HardDrive className="w-5 h-5" />}
            color={
              metrics.memoryUsage > 80
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }
            description="RAM utilization"
            progress={metrics.memoryUsage}
          />

          <SystemStatusCard
            title="Disk Usage"
            value={`${metrics.diskUsage.toFixed(1)}%`}
            icon={<HardDrive className="w-5 h-5" />}
            color={
              metrics.diskUsage > 90
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }
            description="Storage utilization"
            progress={metrics.diskUsage}
          />

          <SystemStatusCard
            title="Error Rate"
            value={`${metrics.errorRate.toFixed(2)}%`}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={
              metrics.errorRate > 5
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
            description="Request error rate"
          />
        </div>
      )}

      {/* Charts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCharts metrics={metrics} />
        <SystemLogsViewer logs={logs} onRefresh={fetchSystemData} />
      </div>

      {/* Last Updated */}
      {metrics && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}
