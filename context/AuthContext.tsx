"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    isLoading: boolean;
  }>({
    user: null,
    isLoading: true,
  });

  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = () => {
      const storedUser = getCookie("user");
      const token = getCookie("auth-token");

      if (storedUser && token) {
        try {
          setAuthState({
            user: JSON.parse(decodeURIComponent(storedUser)),
            isLoading: false,
          });
        } catch {
          setAuthState({
            user: null,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!authState.isLoading) {
      const isProtectedRoute =
        pathname?.startsWith("/projects") || pathname?.startsWith("/settings");
      const isAuthPage = pathname === "/login";

      if (isProtectedRoute && !authState.user) {
        router.push("/login");
      } else if (isAuthPage && authState.user) {
        router.push("/projects");
      }
    }
  }, [authState.user, authState.isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    if (email && password) {
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
      };

      setAuthState({
        user: mockUser,
        isLoading: false,
      });

      setCookie("user", encodeURIComponent(JSON.stringify(mockUser)));
      setCookie("auth-token", "mock-token-123");
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isLoading: false,
    });

    deleteCookie("user");
    deleteCookie("auth-token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: !!authState.user,
        login,
        logout,
        isLoading: authState.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
