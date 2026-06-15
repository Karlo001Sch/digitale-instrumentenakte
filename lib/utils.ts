import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Konvertiere Prisma Decimal-Objekte zu Numbers für Client Components
export function serializeDecimals(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj?.constructor?.name === "Decimal") return Number(obj)
  if (Array.isArray(obj)) return obj.map(serializeDecimals)
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeDecimals(value)])
    )
  }
  return obj
}
