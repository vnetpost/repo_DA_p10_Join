/**
 * Encapsulates transient UI state for the add-task form.
 */
export class AddTaskUiState {
  toastVisible = false;
  showCloseConfirm = false;
  hasUserEdited = false;
  private toastTimer?: number;

  constructor(
    private readonly emitDirtyChange: (isDirty: boolean) => void,
    private readonly closeOverlay: () => void,
    private readonly navigateToBoard: () => void | Promise<boolean>,
    private readonly toastDurationMs = 2000
  ) {}

  /**
   * Clears running timers when the host component is destroyed.
   *
   * @returns void
   */
  destroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  /**
   * Marks the form as edited and emits the dirty state once.
   *
   * @returns void
   */
  markAsEdited(): void {
    if (this.hasUserEdited) return;
    this.hasUserEdited = true;
    this.emitDirtyChange(true);
  }

  /**
   * Resets the dirty flag and emits a clean state.
   *
   * @returns void
   */
  resetDirtyState(): void {
    this.hasUserEdited = false;
    this.emitDirtyChange(false);
  }

  /**
   * Opens the close-confirm dialog.
   *
   * @returns void
   */
  requestCloseConfirm(): void {
    this.showCloseConfirm = true;
  }

  /**
   * Hides the close-confirm dialog.
   *
   * @returns void
   */
  clearCloseConfirm(): void {
    this.showCloseConfirm = false;
  }

  /**
   * Shows the success toast and performs the matching follow-up action.
   *
   * @param isOverlay Whether the add-task form is rendered inside an overlay.
   * @returns void
   */
  showSuccessToast(isOverlay: boolean): void {
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.toastTimer = window.setTimeout(() => {
      this.toastVisible = false;
      if (isOverlay) {
        this.closeOverlay();
        return;
      }

      this.navigateToBoard();
    }, this.toastDurationMs);
  }
}
