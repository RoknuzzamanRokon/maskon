"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";
import { NotificationProvider } from "../../contexts/NotificationContext";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";
import NotificationToastContainer from "./NotificationToast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobileOpen } =
    useSidebar();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggleCollapsed}
        currentPath={pathname}
        isMobileOpen={isMobileOpen}
        onMobileToggle={toggleMobileOpen}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Desktop header */}
        <DesktopHeader />

        {/* Mobile header */}
        <MobileHeader />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Toast notifications */}
      <NotificationToastContainer />
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </NotificationProvider>
    </SidebarProvider>
  );
}
