"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, canAccessAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply auth protection to the login page
  const isLoginPage = pathname === "/eesa/login";

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!isAuthenticated) {
        router.push("/eesa/login");
      } else if (!canAccessAdmin()) {
        router.push("/");
      }
    }
  }, [isAuthenticated, canAccessAdmin, isLoading, router, isLoginPage]);

  // Allow login page to render without auth checks
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !canAccessAdmin()) {
    return null;
  }

  return <>{children}</>;
}
