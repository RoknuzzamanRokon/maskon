"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ProtectedRoute from "../../components/ProtectedRoute";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  uptime: string;
  processes: number;
  temperature: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  source: string;
}

function SystemMonitorContent() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { upload: 0, download: 0 },
    uptime: "0d 0h 0m",
    processes: 0,
    temperature: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time system metrics
    const updateMetrics = () => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: 65 + Math.floor(Math.random() * 20),
        network: {
          upload: Math.floor(Math.random() * 1000),
          download: Math.floor(Math.random() * 5000),
        },
        uptime: "15d 8h 42m",
        processes: 120 + Math.floor(Math.random() * 50),
        temperature: 45 + Math.floor(Math.random() * 20),
      });
    };

    // Mock system logs
    const mockLogs: LogEntry[] = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: "info",
        message: "System backup completed successfully",
        source: "Backup Service",
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: "warning",
        message: "High memory usage detected (85%)",
        source: "Memory Monitor",
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: "info",
        message: "Database connection pool optimized",
        source: "Database",
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: "error",
        message: "Failed to connect to external API",
        source: "API Gateway",
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        level: "info",
        message: "SSL certificate renewed successfully",
        source: "Security",
      },
    ];

    setLogs(mockLogs);
    updateMetrics();
    setIsLoading(false);

    // Update metrics every 3 seconds
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (
    value: number,
    thresholds: { warning: number; critical: number }
  ) => {
    if (value >= thresholds.critical) return "text-red-600 dark:text-red-400";
    if (value >= thresholds.warning)
      return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProgressColor = (
    value: number,
    thresholds: { warning: number; critical: number }
  ) => {
    if (value >= thresholds.critical) return "bg-red-500";
    if (value >= thresholds.warning) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900";
      default:
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading system metrics...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🖥️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  System Monitor
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Real-time system performance and health monitoring
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metrics.uptime}
              </p>
            </div>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                CPU Usage
              </h3>
              <span
                className={`text-2xl font-bold ${getStatusColor(metrics.cpu, {
                  warning: 70,
                  critical: 90,
                })}`}
              >
                {metrics.cpu}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                  metrics.cpu,
                  { warning: 70, critical: 90 }
                )}`}
                style={{ width: `${metrics.cpu}%` }}
              ></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Memory
              </h3>
              <span
                className={`text-2xl font-bold ${getStatusColor(
                  metrics.memory,
                  { warning: 80, critical: 95 }
                )}`}
              >
                {metrics.memory}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                  metrics.memory,
                  { warning: 80, critical: 95 }
                )}`}
                style={{ width: `${metrics.memory}%` }}
              ></div>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Disk Space
              </h3>
              <span
                className={`text-2xl font-bold ${getStatusColor(metrics.disk, {
                  warning: 80,
                  critical: 95,
                })}`}
              >
                {metrics.disk}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                  metrics.disk,
                  { warning: 80, critical: 95 }
                )}`}
                style={{ width: `${metrics.disk}%` }}
              ></div>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Temperature
              </h3>
              <span
                className={`text-2xl font-bold ${getStatusColor(
                  metrics.temperature,
                  { warning: 60, critical: 75 }
                )}`}
              >
                {metrics.temperature}°C
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                  metrics.temperature,
                  { warning: 60, critical: 75 }
                )}`}
                style={{ width: `${(metrics.temperature / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Network & Processes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Network Activity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  📤 Upload
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.network.upload} KB/s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  📥 Download
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.network.download} KB/s
                </span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  ⚙️ Processes
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.processes}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  🔄 Status
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent System Logs
          </h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                    log.level
                  )}`}
                >
                  {log.level.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {log.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {log.source} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SystemMonitorPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <SystemMonitorContent />
    </ProtectedRoute>
  );
}
