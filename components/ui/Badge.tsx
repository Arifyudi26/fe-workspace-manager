import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/types";
import { STATUS_COLORS } from "@/lib/constants";

interface BadgeProps {
  children: ReactNode;
  status?: ProjectStatus;
  className?: string;
}

export function Badge({ children, status, className }: BadgeProps) {
  const statusClass = status
    ? STATUS_COLORS[status]
    : "bg-gray-100 text-gray-800";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusClass,
        className
      )}
    >
      {children}
    </span>
  );
}
