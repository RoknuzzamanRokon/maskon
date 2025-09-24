"use client";

import { DashboardLayout } from "../dashboard/layout/DashboardLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import UserManagement from "./components/UserManagement";
import { DashboardErrorBoundary } from "../dashboard/components/ErrorBoundary";

function UserManagementContent() {
  return (
    <DashboardLayout>
      <DashboardErrorBoundary>
        <UserManagement />
      </DashboardErrorBoundary>
    </DashboardLayout>
  );
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <UserManagementContent />
    </ProtectedRoute>
  );
}
