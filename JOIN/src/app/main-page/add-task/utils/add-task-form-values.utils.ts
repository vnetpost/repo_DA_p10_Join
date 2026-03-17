import { Contact } from '../../../shared/interfaces/contact';
import { Subtask, Task, TaskAttachment } from '../../../shared/interfaces/task';
import { TaskCategoryOption } from '../../../shared/services/task.service';
import { AddTaskFormState as HydratedAddTaskFormState } from './add-task-mapper.utils';

/**
 * Mutable add-task form fields stored by the host component.
 */
export type AddTaskFormValueTarget = {
  taskTitle: Task['title'];
  taskDescription: Task['description'];
  taskDueDate: string;
  activePriority: Task['priority'];
  activeAssignees: Contact[];
  activeCategory: TaskCategoryOption | null;
  activeSubtasks: Subtask[];
  editableExistingAttachments: TaskAttachment[];
  selectedAttachments: File[];
  attachmentUploadError: string;
};

/**
 * Resets the editable add-task form values to their defaults.
 *
 * @param target Host object containing the form fields.
 * @returns void
 */
export function resetAddTaskFormValues(target: AddTaskFormValueTarget): void {
  target.taskTitle = '';
  target.taskDescription = '';
  target.taskDueDate = '';
  target.activePriority = 'medium';
  target.activeAssignees = [];
  target.activeCategory = null;
  target.activeSubtasks = [];
  target.editableExistingAttachments = [];
  target.selectedAttachments = [];
  target.attachmentUploadError = '';
}

/**
 * Applies hydrated task values to the editable add-task form fields.
 *
 * @param target Host object containing the form fields.
 * @param formState Hydrated form state derived from an existing task.
 * @returns void
 */
export function applyHydratedAddTaskFormValues(
  target: AddTaskFormValueTarget,
  formState: HydratedAddTaskFormState
): void {
  target.taskTitle = formState.taskTitle;
  target.taskDescription = formState.taskDescription;
  target.taskDueDate = formState.taskDueDate;
  target.activePriority = formState.activePriority;
  target.activeAssignees = formState.activeAssignees;
  target.activeCategory = formState.activeCategory;
  target.activeSubtasks = formState.activeSubtasks;
  target.editableExistingAttachments = formState.editableExistingAttachments;
  target.selectedAttachments = [];
  target.attachmentUploadError = '';
}
