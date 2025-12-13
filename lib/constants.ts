import { ProjectStatus } from "@/types";

export const APP_NAME = "Workspace Manager";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Active",
  "Paused",
  "Archived",
];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Archived: "bg-gray-100 text-gray-800 border-gray-200",
};

export const ITEMS_PER_PAGE = 10;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  PROJECTS: "/projects",
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  SETTINGS_BILLING: "/settings/billing",
} as const;

export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  PROJECTS: "/api/projects",
  PROJECT: (id: string) => `/api/projects/${id}`,
  BILLING: "/api/billing",
} as const;
