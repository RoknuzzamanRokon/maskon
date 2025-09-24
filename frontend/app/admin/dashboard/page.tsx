"use client";

import { DashboardLayout } from "./layout/DashboardLayout";
import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardOverview from "./components/DashboardOverview";
import { DashboardErrorBoundary } from "./components/ErrorBoundary";

function DashboardContent() {
  return (
    <DashboardLayout>
      <DashboardErrorBoundary>
        <DashboardOverview />
      </DashboardErrorBoundary>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
