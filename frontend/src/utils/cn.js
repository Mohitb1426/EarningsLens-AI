import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
