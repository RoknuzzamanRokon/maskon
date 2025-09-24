"use client";

import AdminLayout from "../components/admin/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardOverview from "./dashboard/components/DashboardOverview";
import { DashboardErrorBoundary } from "./dashboard/components/ErrorBoundary";
import { DashboardProvider } from "./dashboard/contexts/DashboardContext";

function AdminPageContent() {
  return (
    <AdminLayout>
      <DashboardProvider>
        <DashboardErrorBoundary>
          <DashboardOverview />
        </DashboardErrorBoundary>
      </DashboardProvider>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminPageContent />
    </ProtectedRoute>
  );
}
