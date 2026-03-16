/**
 * Encapsulates transient UI state and native dialog interactions for the task dialog.
 */
export class TaskDialogUiState {
  showDeleteConfirm = false;

  /**
   * Opens the native dialog and triggers follow-up initialization.
   *
   * @param dialogElement Native dialog element.
   * @param afterOpen Callback executed after the dialog has been opened.
   * @returns void
   */
  openDialog(dialogElement: HTMLDialogElement, afterOpen: () => void): void {
    dialogElement.showModal();
    dialogElement.classList.add('opened');
    queueMicrotask(afterOpen);
  }

  /**
   * Closes the native dialog after optional cleanup.
   *
   * @param dialogElement Native dialog element.
   * @param beforeClose Callback executed before closing the dialog.
   * @returns void
   */
  closeDialog(dialogElement: HTMLDialogElement, beforeClose: () => void): void {
    beforeClose();
    dialogElement.classList.remove('opened');
    dialogElement.close();
  }

  /**
   * Shows the delete confirmation.
   *
   * @returns void
   */
  requestDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  /**
   * Hides the delete confirmation.
   *
   * @returns void
   */
  clearDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  /**
   * Confirms deletion and closes the dialog.
   *
   * @param onDelete Callback that performs the actual delete action.
   * @param onClose Callback that closes the dialog.
   * @returns void
   */
  confirmDelete(onDelete: () => void, onClose: () => void): void {
    onDelete();
    this.clearDeleteConfirm();
    onClose();
  }

  /**
   * Closes the dialog when the backdrop itself is clicked.
   *
   * @param event Mouse event triggered on the dialog.
   * @param dialogElement Native dialog element.
   * @param onClose Callback that closes the dialog.
   * @returns void
   */
  handleBackdropClick(
    event: MouseEvent,
    dialogElement: HTMLDialogElement,
    onClose: () => void
  ): void {
    if (event.target === dialogElement) onClose();
  }

  /**
   * Prevents the browser default Escape handling and closes the dialog manually.
   *
   * @param event Cancel event emitted by the dialog.
   * @param onClose Callback that closes the dialog.
   * @returns void
   */
  handleEscape(event: Event, onClose: () => void): void {
    event.preventDefault();
    onClose();
  }
}
