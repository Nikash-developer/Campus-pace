// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

export const FORMULA = {
  WATER_PER_SHEET: 10,        // liters
  CO2_PER_SHEET: 4.64,        // grams
  SHEETS_PER_TREE: 8333,      // sheets
  WEIGHT_PER_SHEET: 4.9       // grams
};

export function calculateImpact(pages: number) {
  return {
    pagesSaved: pages,
    waterSaved: parseFloat((pages * FORMULA.WATER_PER_SHEET).toFixed(2)),
    co2Saved: parseFloat((pages * FORMULA.CO2_PER_SHEET).toFixed(2)),
    treesSaved: parseFloat((pages / FORMULA.SHEETS_PER_TREE).toFixed(5)),
    formattedPages: formatNumber(pages)
  };
}
