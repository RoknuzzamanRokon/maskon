"use client";

import { DashboardLayout } from "../dashboard/layout/DashboardLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import SystemMonitor from "./components/SystemMonitor";
import { DashboardErrorBoundary } from "../dashboard/components/ErrorBoundary";

function SystemMonitorContent() {
  return (
    <DashboardLayout>
      <DashboardErrorBoundary>
        <SystemMonitor />
      </DashboardErrorBoundary>
    </DashboardLayout>
  );
}

export default function SystemMonitorPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <SystemMonitorContent />
    </ProtectedRoute>
  );
}
