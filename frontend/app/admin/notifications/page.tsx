"use client";

import { useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminNotificationDashboard from "../../components/AdminNotificationDashboard";

interface PendingInquiry {
  id: number;
  session_id: string;
  product_id: number;
  product_name: string;
  customer_name: string;
  customer_email?: string;
  priority: string;
  status: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
  unread_count: number;
}

function AdminNotificationsContent() {
  const [selectedInquiry, setSelectedInquiry] = useState<PendingInquiry | null>(
    null
  );

  const handleInquirySelect = (inquiry: PendingInquiry) => {
    setSelectedInquiry(inquiry);
    // Navigate to the inquiry details or open in a modal
    window.location.href = `/admin/inquiries?inquiry=${inquiry.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Monitor and manage customer inquiry notifications
          </p>
        </div>

        <AdminNotificationDashboard onInquirySelect={handleInquirySelect} />
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminNotificationsContent />
    </ProtectedRoute>
  );
}
