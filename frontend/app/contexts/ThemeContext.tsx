"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Apply dark theme immediately to prevent flash
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to 'dark'
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Always default to dark theme and save it
      setThemeState("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Apply CSS custom properties for the current theme
      applyThemeProperties(theme);
    }
  }, [theme, mounted]);

  const applyThemeProperties = (currentTheme: Theme) => {
    const root = document.documentElement;

    if (currentTheme === "dark") {
      // Dark theme properties
      root.style.setProperty("--color-primary", "#3B82F6");
      root.style.setProperty("--color-primary-dark", "#1D4ED8");
      root.style.setProperty("--color-secondary", "#9CA3AF");
      root.style.setProperty("--color-success", "#10B981");
      root.style.setProperty("--color-warning", "#F59E0B");
      root.style.setProperty("--color-error", "#EF4444");
      root.style.setProperty("--color-background", "#111827");
      root.style.setProperty("--color-surface", "#1F2937");
      root.style.setProperty("--color-text-primary", "#F9FAFB");
      root.style.setProperty("--color-text-secondary", "#9CA3AF");
      root.style.setProperty("--color-border", "#374151");
    } else {
      // Light theme properties
      root.style.setProperty("--color-primary", "#3B82F6");
      root.style.setProperty("--color-primary-dark", "#1D4ED8");
      root.style.setProperty("--color-secondary", "#6B7280");
      root.style.setProperty("--color-success", "#10B981");
      root.style.setProperty("--color-warning", "#F59E0B");
      root.style.setProperty("--color-error", "#EF4444");
      root.style.setProperty("--color-background", "#F9FAFB");
      root.style.setProperty("--color-surface", "#FFFFFF");
      root.style.setProperty("--color-text-primary", "#111827");
      root.style.setProperty("--color-text-secondary", "#6B7280");
      root.style.setProperty("--color-border", "#E5E7EB");
    }
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
