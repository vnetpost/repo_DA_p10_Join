import { Timestamp } from '@angular/fire/firestore';

/**
 * Task entity rendered on the board and persisted in Firestore.
 */
export interface Task {
  status: 'to-do' | 'in-progress' | 'await-feedback' | 'done';
  order: number;
  id?: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  priority: 'low' | 'medium' | 'high';
  assignees: Array<string>;
  category: 'user-story' | 'technical-task';
  subtasks: Array<Subtask>;
  attachments?: Array<TaskAttachment>;
}

/**
 * Small checklist item that belongs to a task.
 */
export interface Subtask {
  title: string;
  done: boolean;
}

/**
 * Serialized task attachment payload stored directly on a task document.
 */
export interface TaskAttachment {
  fileName: string;
  fileType: string;
  base64Size: number;
  base64: string;
  uploadedAt: Timestamp;
}
