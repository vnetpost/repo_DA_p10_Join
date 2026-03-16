import { Timestamp } from '@angular/fire/firestore';
import { Contact } from '../../shared/interfaces/contact';
import { Subtask, Task, TaskAttachment } from '../../shared/interfaces/task';
import { TaskCategoryOption } from '../../shared/services/task.service';

/**
 * Shape used to hydrate the add-task form from an existing task.
 */
export type AddTaskFormState = {
  taskTitle: Task['title'];
  taskDescription: Task['description'];
  taskDueDate: string;
  activePriority: Task['priority'];
  activeAssignees: Contact[];
  activeCategory: TaskCategoryOption | null;
  activeSubtasks: Subtask[];
  editableExistingAttachments: TaskAttachment[];
};

/**
 * Creates the form state needed to edit an existing task.
 *
 * @param task Task entity that should be edited.
 * @param contacts All available contacts for assignee lookup.
 * @param taskCategories Available task categories.
 * @returns Hydrated add-task form state.
 */
export function mapTaskToAddTaskFormState(
  task: Task,
  contacts: Contact[],
  taskCategories: TaskCategoryOption[]
): AddTaskFormState {
  return {
    taskTitle: task.title,
    taskDescription: task.description,
    taskDueDate: formatDateForAddTaskInput(task.dueDate.toDate()),
    activePriority: task.priority,
    activeAssignees: task.assignees
      .map((id) => contacts.find((contact) => contact.id === id) ?? null)
      .filter((contact): contact is Contact => Boolean(contact)),
    activeCategory:
      taskCategories.find((category) => category.value === task.category) ?? null,
    activeSubtasks: task.subtasks.map((subtask) => ({ ...subtask })),
    editableExistingAttachments: (task.attachments ?? []).map((attachment) => ({
      ...attachment,
    })),
  };
}

/**
 * Creates the shared task payload for create and update workflows.
 *
 * @param title Normalized task title.
 * @param description Normalized task description.
 * @param dueDate Due date timestamp.
 * @param priority Selected task priority.
 * @param assignees Contact IDs assigned to the task.
 * @param category Validated task category.
 * @param subtasks Current subtask state.
 * @param attachments Uploaded attachments for the task.
 * @returns Base payload used for both create and update operations.
 */
export function buildAddTaskPayload(
  title: Task['title'],
  description: Task['description'],
  dueDate: Timestamp,
  priority: Task['priority'],
  assignees: string[],
  category: Task['category'],
  subtasks: Subtask[],
  attachments: TaskAttachment[]
): Omit<Task, 'id' | 'status' | 'order'> {
  return {
    title,
    description,
    dueDate,
    priority,
    assignees,
    category,
    subtasks: subtasks.map((subtask) => ({ ...subtask })),
    attachments,
  };
}

/**
 * Converts a date to the form input format `YYYY/MM/DD`.
 *
 * @param date Source date object.
 * @returns Date string formatted for form controls.
 */
function formatDateForAddTaskInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}
