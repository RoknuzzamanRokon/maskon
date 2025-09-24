"use client";

import React from "react";
import { responsiveClasses } from "../utils/responsive";

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined";
  onClick?: () => void;
  ariaLabel?: string;
}

export function ResponsiveCard({
  children,
  className = "",
  padding = "md",
  variant = "default",
  onClick,
  ariaLabel,
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  const variantClasses = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated:
      "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
    outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
  };

  const baseClasses = responsiveClasses({
    base: `rounded-lg transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]}`,
    sm: onClick ? "hover:shadow-md" : "",
    md: onClick ? "hover:shadow-lg" : "",
  });

  const interactiveClasses = onClick
    ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
    : "";

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={onClick ? { WebkitTapHighlightColor: "transparent" } : undefined}
    >
      {children}
    </Component>
  );
}

/**
 * Responsive grid container for cards
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, lg: 3, xl: 4 },
  gap = "md",
  className = "",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  const getColumnClass = (breakpoint: string, cols: number) => {
    const prefix = breakpoint ? `${breakpoint}:` : "";
    if (cols === 1) return `${prefix}grid-cols-1`;
    if (cols === 2) return `${prefix}grid-cols-2`;
    if (cols === 3) return `${prefix}grid-cols-3`;
    if (cols === 4) return `${prefix}grid-cols-4`;
    if (cols === 5) return `${prefix}grid-cols-5`;
    if (cols === 6) return `${prefix}grid-cols-6`;
    return `${prefix}grid-cols-${cols}`;
  };

  const gridClasses = responsiveClasses({
    base: `grid ${gapClasses[gap]} ${
      columns.xs ? getColumnClass("", columns.xs) : ""
    }`,
    sm: columns.sm ? getColumnClass("sm", columns.sm) : "",
    md: columns.md ? getColumnClass("md", columns.md) : "",
    lg: columns.lg ? getColumnClass("lg", columns.lg) : "",
    xl: columns.xl ? getColumnClass("xl", columns.xl) : "",
  });

  return <div className={`${gridClasses} ${className}`}>{children}</div>;
}

/**
 * Responsive stack container for vertical layouts
 */
interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveStack({
  children,
  spacing = "md",
  className = "",
}: ResponsiveStackProps) {
  const spacingClasses = {
    sm: "space-y-2 sm:space-y-3",
    md: "space-y-4 sm:space-y-6",
    lg: "space-y-6 sm:space-y-8",
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>{children}</div>
  );
}
