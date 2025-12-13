import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthState } from "@/types";

interface AuthStore extends AuthState {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  setLoading: (loading: boolean) => void;
}

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
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
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      initializeAuth: () => {
        const storedUser = getCookie("user");
        const token = getCookie("auth-token");

        if (storedUser && token) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(storedUser));
            set({
              user: parsedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (!email || email.trim() === "") {
            throw new Error("Email is required");
          }

          const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name: email.split("@")[0],
          };

          const mockToken = `mock-token-${Date.now()}`;

          setCookie("auth-token", mockToken);
          setCookie("user", encodeURIComponent(JSON.stringify(mockUser)));

          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        deleteCookie("auth-token");
        deleteCookie("user");
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
