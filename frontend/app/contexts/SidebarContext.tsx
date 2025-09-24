"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobileOpen: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  // Always keep sidebar expanded (not collapsed)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Force sidebar to always be expanded on desktop
  useEffect(() => {
    setIsCollapsed(false);
  }, []);

  // Disable localStorage saving/loading for collapsed state since we want it always expanded
  // Load collapsed state from localStorage on mount
  // useEffect(() => {
  //   try {
  //     const savedState = localStorage.getItem("sidebar-collapsed");
  //     if (savedState !== null) {
  //       setIsCollapsed(JSON.parse(savedState));
  //     }
  //   } catch (error) {
  //     // Ignore localStorage errors and use default state
  //     console.warn("Failed to load sidebar state from localStorage:", error);
  //   }
  // }, []);

  // Save collapsed state to localStorage
  // useEffect(() => {
  //   try {
  //     localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  //   } catch (error) {
  //     // Ignore localStorage errors
  //     console.warn("Failed to save sidebar state to localStorage:", error);
  //   }
  // }, [isCollapsed]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen]);

  const toggleCollapsed = () => {
    // Disable toggle functionality - keep sidebar always expanded
    // setIsCollapsed((prev) => !prev);
  };

  const toggleMobileOpen = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const value: SidebarContextType = {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    toggleMobileOpen,
    closeMobile,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
