import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts plain text from a Slate.js JSON description or returns the original string.
 * LeetCode stores descriptions as Slate.js editor JSON format.
 */
export function parseDescription(description: string | undefined | null): string | null {
  if (!description) return null;
  
  // Check if it looks like JSON (Slate.js format)
  const trimmed = description.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        // Extract text from Slate.js nodes recursively
        return extractTextFromSlateNodes(parsed).trim() || null;
      }
    } catch {
      // Not valid JSON, return as-is
      return description;
    }
  }
  
  return description;
}

/**
 * Recursively extracts plain text from Slate.js nodes
 */
function extractTextFromSlateNodes(nodes: unknown[]): string {
  let text = '';
  
  for (const node of nodes) {
    if (typeof node === 'object' && node !== null) {
      const nodeObj = node as Record<string, unknown>;
      
      // If it has a 'text' property, it's a leaf node
      if (typeof nodeObj.text === 'string') {
        text += nodeObj.text;
      }
      
      // If it has 'children', recurse into them
      if (Array.isArray(nodeObj.children)) {
        text += extractTextFromSlateNodes(nodeObj.children);
      }
      
      // Add spacing for block-level elements
      if (nodeObj.type && typeof nodeObj.type === 'string') {
        const blockTypes = ['Heading1', 'Heading2', 'Heading3', 'Heading4', 'Paragraph', 'ListItem'];
        if (blockTypes.some(t => (nodeObj.type as string).includes(t))) {
          text += ' ';
        }
      }
    }
  }
  
  // Clean up multiple spaces
  return text.replace(/\s+/g, ' ');
}

/**
 * Format date for ICS file (YYYYMMDDTHHMMSSZ format)
 */
function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Generate and download an ICS calendar file for a contest
 */
export interface CalendarContest {
  id: string;
  name: string;
  platform: string;
  startTime: Date | string;
  endTime: Date | string;
  description?: string;
  websiteUrl?: string;
  registrationUrl?: string;
}

export function downloadContestICS(contest: CalendarContest): void {
  const startTime = typeof contest.startTime === 'string' ? new Date(contest.startTime) : contest.startTime;
  const endTime = typeof contest.endTime === 'string' ? new Date(contest.endTime) : contest.endTime;

  // Validate dates before generating ICS
  if (!isValid(startTime) || !isValid(endTime)) {
    console.error('Invalid contest dates for ICS generation');
    return;
  }

  const description = parseDescription(contest.description) || '';
  const location = contest.websiteUrl || 'Online';
  const url = contest.websiteUrl || '';
  const registration = contest.registrationUrl || contest.websiteUrl || 'N/A';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CodeNotify//Contest Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:CodeNotify Contests',
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(startTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `UID:${contest.id}@codenotify.app`,
    `SUMMARY:${contest.name}`,
    `DESCRIPTION:${contest.platform} Contest\\n${description}\\n\\nRegistration: ${registration}`,
    `LOCATION:${location}`,
    `URL:${url}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'DESCRIPTION:Contest starts in 30 minutes',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8',
  });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${contest.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
