"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavigationContextType {
  showNavbar: boolean;
  showFooter: boolean;
  setShowNavbar: (show: boolean) => void;
  setShowFooter: (show: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Hide navbar and footer when in admin pages
    const isAdminPage = pathname?.startsWith("/admin");
    const isLoginPage = pathname === "/login";

    if (isAdminPage || isLoginPage) {
      setShowNavbar(false);
      setShowFooter(false);
    } else {
      setShowNavbar(true);
      setShowFooter(true);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider
      value={{
        showNavbar,
        showFooter,
        setShowNavbar,
        setShowFooter,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
