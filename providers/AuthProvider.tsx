"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initializeAuth } = useAuthStore();

  // Initialize auth state from cookies on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      const isProtectedRoute =
        pathname?.startsWith("/projects") || pathname?.startsWith("/settings");
      const isAuthPage = pathname === "/login";

      if (isProtectedRoute && !user) {
        router.push("/login");
      } else if (isAuthPage && user) {
        router.push("/projects");
      }
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
