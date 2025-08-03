"use client";

import Navbar from "./Navbar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
} 