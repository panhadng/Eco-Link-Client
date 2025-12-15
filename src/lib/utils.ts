import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Converts HTML line breaks (<br>, <br/>, <br />) to actual line breaks
 * This is used to render sanitized HTML content that contains <br> tags
 * 
 * The backend now allows up to 2 consecutive <br> tags (for paragraph spacing)
 * but collapses 3+ to prevent abuse. This function preserves that spacing.
 */
export function convertHtmlLineBreaks(text: string): string {
  if (!text) return text;
  
  // First, handle paragraph tags - convert closing </p> to newline
  let result = text
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '');
  
  // Convert consecutive <br> tags to corresponding newlines
  // Handle patterns like <br>, <br><br>, <br />, <br/><br/>, etc.
  // Count consecutive <br> tags and convert to that many newlines
  result = result.replace(/(<br\s*\/?>\s*)+/gi, (match) => {
    // Count how many <br> tags are in this match
    const brCount = (match.match(/<br\s*\/?>/gi) || []).length;
    // Return that many newlines (backend allows max 2, so this will be 1-2)
    return '\n'.repeat(brCount);
  });
  
  // Clean up any remaining newlines that might have been between <br> tags
  // Collapse 3+ consecutive newlines to 2 (for reasonable spacing)
  result = result.replace(/\n{3,}/g, '\n\n');
  
  return result.trim();
}

