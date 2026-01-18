/**
 * Checklist Parser Service
 * Extracts and parses checkboxes from markdown content
 */

import type { ChecklistSection, ChecklistItem } from '@/types';

// Regex patterns for parsing
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;
const CHECKBOX_REGEX = /^(\s*)-\s*\[([ xX])\]\s*(.+)$/;
const TASK_ID_REGEX = /\[?(T\d+)\]?/;

interface ParsedCheckbox {
  lineNumber: number;
  checked: boolean;
  text: string;
  taskId?: string;
  indentLevel: number;
}

/**
 * Parse all checkboxes from markdown content
 */
export function parseCheckboxes(content: string): ParsedCheckbox[] {
  const lines = content.split('\n');
  const checkboxes: ParsedCheckbox[] = [];

  lines.forEach((line, idx) => {
    const match = line.match(CHECKBOX_REGEX);
    if (match) {
      const indentLevel = match[1].length / 2; // Assume 2-space indent
      const checked = match[2].toLowerCase() === 'x';
      const text = match[3].trim();
      
      // Extract task ID if present
      const taskIdMatch = text.match(TASK_ID_REGEX);
      const taskId = taskIdMatch?.[1];

      checkboxes.push({
        lineNumber: idx + 1, // 1-indexed
        checked,
        text,
        taskId,
        indentLevel: Math.floor(indentLevel),
      });
    }
  });

  return checkboxes;
}

/**
 * Parse markdown content into sections with checkboxes
 */
export function parseChecklistSections(content: string): ChecklistSection[] {
  const lines = content.split('\n');
  const sections: ChecklistSection[] = [];
  
  let currentSection: Partial<ChecklistSection> | null = null;
  let items: ChecklistItem[] = [];

  const finalizeSection = (endLine: number) => {
    if (currentSection && currentSection.heading) {
      const completedCount = items.filter((item) => item.checked).length;
      sections.push({
        heading: currentSection.heading,
        level: currentSection.level ?? 1,
        startLine: currentSection.startLine ?? 1,
        endLine,
        items: [...items],
        completionRatio: items.length > 0 ? completedCount / items.length : 0,
      });
      items = [];
    }
  };

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;

    // Check for heading
    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      // Finalize previous section
      if (currentSection) {
        finalizeSection(lineNumber - 1);
      }

      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        startLine: lineNumber,
      };
      return;
    }

    // Check for checkbox
    const checkboxMatch = line.match(CHECKBOX_REGEX);
    if (checkboxMatch && currentSection) {
      const text = checkboxMatch[3].trim();
      const taskIdMatch = text.match(TASK_ID_REGEX);

      items.push({
        id: `checkbox-${lineNumber}`,
        lineNumber,
        rawText: text,
        displayText: text,
        checked: checkboxMatch[2].toLowerCase() === 'x',
        indent: 0,
        metadata: taskIdMatch?.[1] ? { story: taskIdMatch[1] } : undefined,
      });
    }
  });

  // Finalize last section
  if (currentSection) {
    finalizeSection(lines.length);
  }

  return sections;
}

/**
 * Calculate overall completion statistics
 */
export function calculateCompletionStats(sections: ChecklistSection[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  let total = 0;
  let completed = 0;

  for (const section of sections) {
    total += section.items.length;
    completed += section.items.filter((item) => item.checked).length;
  }

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Calculate completion stats from raw checkboxes
 */
export function calculateCheckboxStats(checkboxes: ParsedCheckbox[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  const total = checkboxes.length;
  const completed = checkboxes.filter((cb) => cb.checked).length;

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Update a checkbox in content (toggle checked state)
 */
export function updateCheckboxInContent(
  content: string,
  lineNumber: number,
  checked: boolean
): string {
  const lines = content.split('\n');
  const idx = lineNumber - 1;

  if (idx >= 0 && idx < lines.length) {
    const line = lines[idx];
    if (checked) {
      lines[idx] = line.replace(/- \[ \]/, '- [X]');
    } else {
      lines[idx] = line.replace(/- \[[Xx]\]/, '- [ ]');
    }
  }

  return lines.join('\n');
}

/**
 * Filter checkboxes by phase or category
 */
export function filterCheckboxesByPhase(
  checkboxes: ParsedCheckbox[],
  phasePrefix: string
): ParsedCheckbox[] {
  return checkboxes.filter((cb) => {
    if (!cb.taskId) return false;
    // Extract the phase number from task ID (e.g., T001 -> 0, T023 -> 2)
    const taskNum = parseInt(cb.taskId.substring(1), 10);
    return cb.taskId.startsWith(phasePrefix) || 
           (phasePrefix === 'Phase1' && taskNum >= 1 && taskNum <= 7) ||
           (phasePrefix === 'Phase2' && taskNum >= 8 && taskNum <= 22);
  });
}

/**
 * Group checkboxes by their section heading
 */
export function groupCheckboxesBySection(
  content: string
): Map<string, ParsedCheckbox[]> {
  const lines = content.split('\n');
  const groups = new Map<string, ParsedCheckbox[]>();
  let currentHeading = 'Uncategorized';

  lines.forEach((line, idx) => {
    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      currentHeading = headingMatch[2].trim();
      return;
    }

    const checkboxMatch = line.match(CHECKBOX_REGEX);
    if (checkboxMatch) {
      const text = checkboxMatch[3].trim();
      const taskIdMatch = text.match(TASK_ID_REGEX);

      const checkbox: ParsedCheckbox = {
        lineNumber: idx + 1,
        checked: checkboxMatch[2].toLowerCase() === 'x',
        text,
        taskId: taskIdMatch?.[1],
        indentLevel: Math.floor(checkboxMatch[1].length / 2),
      };

      const existing = groups.get(currentHeading) || [];
      existing.push(checkbox);
      groups.set(currentHeading, existing);
    }
  });

  return groups;
}
