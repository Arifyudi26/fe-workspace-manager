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
