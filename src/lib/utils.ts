import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

export const FORMULA = {
  PAGES_PER_ASSIGNMENT: 10,
  PAGES_PER_TREE: 8000,
  CO2_PER_PAGE: 0.005, // kg
};

export function calculateImpact(pages: number) {
  return {
    trees: (pages / FORMULA.PAGES_PER_TREE).toFixed(2),
    co2: (pages * FORMULA.CO2_PER_PAGE).toFixed(2),
    pages: formatNumber(pages)
  };
}
