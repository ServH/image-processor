import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes conditionally
 * Uses clsx for conditional class names and twMerge to properly merge Tailwind classes
 * 
 * @param inputs - Class names to be merged
 * @returns Merged class names string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}