import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats monetary amounts in Indian Rupees (₹ / INR)
 */
export function formatCurrencyINR(amount?: string | number): string {
  if (amount === undefined || amount === null || amount === "") return "₹0";
  const num = Number(amount);
  if (isNaN(num)) return `₹${amount}`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatSalary(min?: string | number, max?: string | number, period?: string): string {
  if (!min && !max) return "Negotiable";
  const p = period ? ` / ${period}` : "";
  const minFormatted = min ? formatCurrencyINR(min) : "";
  const maxFormatted = max ? formatCurrencyINR(max) : "";

  if (min && max) return `${minFormatted} - ${maxFormatted}${p}`;
  if (min) return `From ${minFormatted}${p}`;
  if (max) return `Up to ${maxFormatted}${p}`;
  return "Negotiable";
}
