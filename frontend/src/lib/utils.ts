import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSkuForUrl(sku: string | null | undefined): string {
  if (!sku) return "";
  return sku
    .replace(/%/g, "")
    .replace(/:/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\-_]/g, ""); // Keep Cyrillic, letters, numbers, dashes, underscores
}
