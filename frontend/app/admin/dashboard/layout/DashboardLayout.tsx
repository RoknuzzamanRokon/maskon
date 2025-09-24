"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { DashboardProvider } from "../contexts/DashboardContext";
import { NotificationProvider } from "../../../contexts/NotificationContext";
import { useScreenSize, useSwipeGesture } from "../utils/responsive";
import {
  DashboardErrorBoundary,
  ComponentErrorBoundary,
} from "../components/ErrorBoundary";
import { OfflineBanner } from "../components/OfflineDetector";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isTablet } = useScreenSize();

  // Auto-collapse sidebar on mobile and tablet
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setMobileMenuOpen(false);
    } else if (isTablet) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, isTablet]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Swipe gesture support for mobile
  const swipeHandlers = useSwipeGesture((gesture) => {
    if (isMobile) {
      if (gesture.direction === "right" && !mobileMenuOpen) {
        setMobileMenuOpen(true);
      } else if (gesture.direction === "left" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  });

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && mobileMenuOpen) {
        const target = event.target as Element;
        const sidebar = document.getElementById("mobile-sidebar");
        const menuButton = document.getElementById("mobile-menu-button");

        if (
          sidebar &&
          !sidebar.contains(target) &&
          menuButton &&
          !menuButton.contains(target)
        ) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, mobileMenuOpen]);

  return (
    <DashboardErrorBoundary>
      <NotificationProvider>
        <DashboardProvider>
          <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 relative"
            {...swipeHandlers}
          >
            {/* Offline detection banner */}
            <OfflineBanner />

            {/* Mobile overlay */}
            {isMobile && mobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
            )}

            <ComponentErrorBoundary>
              <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                isMobile={isMobile}
                mobileMenuOpen={mobileMenuOpen}
                onCloseMobile={closeMobileMenu}
              />
            </ComponentErrorBoundary>

            <div
              className={`transition-all duration-300 ${
                isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
              }`}
            >
              <ComponentErrorBoundary>
                <Header
                  onToggleSidebar={toggleSidebar}
                  isMobile={isMobile}
                  mobileMenuOpen={mobileMenuOpen}
                />
              </ComponentErrorBoundary>

              <ComponentErrorBoundary>
                <MainContent>{children}</MainContent>
              </ComponentErrorBoundary>
            </div>
          </div>
        </DashboardProvider>
      </NotificationProvider>
    </DashboardErrorBoundary>
  );
}
