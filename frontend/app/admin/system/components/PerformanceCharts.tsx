"use client";

import { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { SystemMetrics } from "./SystemMonitor";

interface PerformanceChartsProps {
  metrics: SystemMetrics | null;
}

interface ChartDataPoint {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
}

export default function PerformanceCharts({ metrics }: PerformanceChartsProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<
    "cpu" | "memory" | "response" | "errors"
  >("cpu");

  useEffect(() => {
    if (metrics) {
      const now = new Date();
      const newDataPoint: ChartDataPoint = {
        timestamp: now.toLocaleTimeString(),
        cpuUsage: metrics.cpuUsage,
        memoryUsage: metrics.memoryUsage,
        responseTime: metrics.responseTime,
        errorRate: metrics.errorRate,
      };

      setChartData((prev) => {
        const updated = [...prev, newDataPoint];
        // Keep only last 20 data points
        return updated.slice(-20);
      });
    }
  }, [metrics]);

  const getChartConfig = () => {
    switch (selectedMetric) {
      case "cpu":
        return {
          dataKey: "cpuUsage",
          name: "CPU Usage (%)",
          color: "#3B82F6",
          domain: [0, 100] as const,
        };
      case "memory":
        return {
          dataKey: "memoryUsage",
          name: "Memory Usage (%)",
          color: "#10B981",
          domain: [0, 100] as const,
        };
      case "response":
        return {
          dataKey: "responseTime",
          name: "Response Time (ms)",
          color: "#F59E0B",
          domain: [0, "dataMax" as const] as const,
        };
      case "errors":
        return {
          dataKey: "errorRate",
          name: "Error Rate (%)",
          color: "#EF4444",
          domain: [0, "dataMax" as const] as const,
        };
      default:
        return {
          dataKey: "cpuUsage",
          name: "CPU Usage (%)",
          color: "#3B82F6",
          domain: [0, 100] as const,
        };
    }
  };

  const config = getChartConfig();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{`Time: ${label}`}</p>
          <p className="text-sm font-medium" style={{ color: config.color }}>
            {`${config.name}: ${payload[0].value}${
              selectedMetric === "response" ? "ms" : "%"
            }`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Charts
        </h3>

        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMetric("cpu")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedMetric === "cpu"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            CPU
          </button>
          <button
            onClick={() => setSelectedMetric("memory")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedMetric === "memory"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Memory
          </button>
          <button
            onClick={() => setSelectedMetric("response")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedMetric === "response"
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Response
          </button>
          <button
            onClick={() => setSelectedMetric("errors")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedMetric === "errors"
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                domain={config.domain}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                fill={config.color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              </div>
              <p>Collecting performance data...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Current CPU</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {metrics?.cpuUsage.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Current Memory</p>
          <p className="font-semibold text-green-600 dark:text-green-400">
            {metrics?.memoryUsage.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Response Time</p>
          <p className="font-semibold text-yellow-600 dark:text-yellow-400">
            {metrics?.responseTime}ms
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Error Rate</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            {metrics?.errorRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
