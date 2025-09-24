"use client";

import React from "react";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="p-3 sm:p-4 md:p-6 min-h-[calc(100vh-4rem)] overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">{children}</div>
    </main>
  );
}
