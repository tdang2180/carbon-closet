// This utility function combines class names using clsx and merges Tailwind CSS classes using tailwind-merge.
// 

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
