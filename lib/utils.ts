import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string (Jan 15, 2024)
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Format date with time (Jan 15, 2024, 10:30 AM)
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Truncate string and add ellipsis
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// Generate unique ID from timestamp
export const generateId = (): string => {
  return Date.now().toString();
};

// Format card number with spaces (1234 5678 9012 3456)
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, "");
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(" ") : cleaned;
};

// Format expiry date (MM/YY)
export const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);

  if (cleaned.length === 0) return "";

  if (cleaned.length === 1) return cleaned;

  const monthRaw = cleaned.slice(0, 2);
  let monthNum = parseInt(monthRaw, 10);
  if (Number.isNaN(monthNum) || monthNum <= 0) monthNum = 1;
  if (monthNum > 12) monthNum = 12;
  const month = String(monthNum).padStart(2, "0");

  if (cleaned.length === 2) return month;

  const year = cleaned.slice(2, 4);
  return `${month}/${year}`;
};

// Format phone number
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
    6,
    10
  )}`;
};
