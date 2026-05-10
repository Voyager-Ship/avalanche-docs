/**
 * Utility for sanitizing and rendering markdown content safely.
 * Addresses vulnerability SBP-002: Persistent XSS risk from untrusted content.
 * Uses `marked` for markdown parsing and DOMPurify for HTML sanitization.
 */

import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

/**
 * Sanitizes HTML content, removing dangerous elements while preserving safe ones.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

/**
 * Converts markdown to safe HTML.
 * Parses markdown with `marked`, then sanitizes with DOMPurify.
 */
export function markdownToSafeHtml(text: string): string {
  if (!text) return '';
  
  // Parse markdown to HTML
  const html = marked.parse(text, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  
  // Sanitize the resulting HTML
  return sanitizeHtml(html);
}
