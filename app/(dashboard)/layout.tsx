"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar Skeleton */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Skeleton className="h-6 w-48" />
                <div className="ml-10 flex space-x-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Workspace Manager
              </h1>
              <div className="ml-10 flex space-x-4">
                <button
                  onClick={() => router.push("/projects")}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                >
                  Projects
                </button>
                <button
                  onClick={() => router.push("/settings/billing")}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name || user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="cursor-pointer"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
