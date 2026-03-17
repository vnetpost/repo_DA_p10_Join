import { Component, Input } from '@angular/core';
import { Contact } from '../../../../../../shared/interfaces/contact';
import {
  getContactDisplayAvatarSrcById,
  getContactDisplayColorById,
  getContactDisplayInitialsById,
  getContactDisplayNameById,
} from '../../../../../../shared/utilities/contact-presenter.utils';

/**
 * Renders the assignee list inside the task dialog.
 */
@Component({
  selector: 'app-board-task-dialog-assignees',
  imports: [],
  templateUrl: './board-task-dialog-assignees.html',
  styleUrl: './board-task-dialog-assignees.scss',
})
export class BoardTaskDialogAssignees {
  @Input() assignees: string[] = [];
  @Input() contacts: Contact[] = [];

  readonly getAssigneeInitials = (id: string): string =>
    getContactDisplayInitialsById(this.contacts, id);
  readonly getAssigneeName = (id: string): string =>
    getContactDisplayNameById(this.contacts, id);
  readonly getUserColor = (id: string): string =>
    getContactDisplayColorById(this.contacts, id);
  readonly getAssigneeAvatarSrc = (id: string): string | null =>
    getContactDisplayAvatarSrcById(this.contacts, id);
}
