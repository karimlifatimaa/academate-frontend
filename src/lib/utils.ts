import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null): string {
  const safe = name?.trim() || "?"
  const parts = safe.split(" ")
  return parts.length >= 2
    ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
    : safe.slice(0, 2)
}
