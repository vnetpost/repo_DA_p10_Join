/**
 * Encapsulates transient UI state and native dialog interactions for the contact dialog.
 */
export class ContactDialogUiState {
  showCloseConfirm = false;

  /**
   * Opens the native dialog and applies the opened styling.
   *
   * @param dialogElement Native dialog element.
   * @returns void
   */
  openDialog(dialogElement: HTMLDialogElement): void {
    this.showCloseConfirm = false;
    dialogElement.showModal();
    dialogElement.classList.add('opened');
  }

  /**
   * Closes the native dialog after optional cleanup.
   *
   * @param dialogElement Native dialog element.
   * @param beforeClose Callback executed before closing the dialog.
   * @returns void
   */
  closeDialog(dialogElement: HTMLDialogElement, beforeClose: () => void): void {
    this.showCloseConfirm = false;
    beforeClose();
    dialogElement.classList.remove('opened');
    dialogElement.close();
  }

  /**
   * Opens a close confirmation if unsaved changes exist, otherwise closes directly.
   *
   * @param shouldConfirmClose Returns whether confirmation is needed.
   * @param onClose Callback that closes the dialog.
   * @returns void
   */
  requestCloseDialog(shouldConfirmClose: () => boolean, onClose: () => void): void {
    if (shouldConfirmClose()) {
      this.showCloseConfirm = true;
      return;
    }

    onClose();
  }

  /**
   * Confirms closing and executes the close callback.
   *
   * @param onClose Callback that closes the dialog.
   * @returns void
   */
  confirmCloseDialog(onClose: () => void): void {
    onClose();
  }

  /**
   * Hides the close confirmation and keeps the dialog open.
   *
   * @returns void
   */
  cancelCloseDialog(): void {
    this.showCloseConfirm = false;
  }

  /**
   * Closes the dialog when the backdrop itself is clicked.
   *
   * @param event Mouse event triggered on the dialog.
   * @param dialogElement Native dialog element.
   * @param onRequestClose Callback that starts the close flow.
   * @returns void
   */
  handleBackdropClick(
    event: MouseEvent,
    dialogElement: HTMLDialogElement,
    onRequestClose: () => void
  ): void {
    if (event.target === dialogElement) onRequestClose();
  }

  /**
   * Prevents the browser default Escape handling and coordinates close behavior.
   *
   * @param event Cancel event emitted by the dialog.
   * @param onRequestClose Callback that starts the close flow.
   * @returns void
   */
  handleEscape(event: Event, onRequestClose: () => void): void {
    event.preventDefault();
    if (this.showCloseConfirm) {
      this.cancelCloseDialog();
      return;
    }

    onRequestClose();
  }
}
