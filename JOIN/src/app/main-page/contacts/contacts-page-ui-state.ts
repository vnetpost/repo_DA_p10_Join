/**
 * Manages responsive detail-panel and toast state for the contacts page.
 */
export class ContactsPageUiState {
  private readonly mobileMaxWidth: number;
  private toastTimerId: number | null = null;

  isMobile = false;
  isDetailOpen = false;
  toastVisible = false;

  constructor(mobileMaxWidth: number) {
    this.mobileMaxWidth = mobileMaxWidth;
  }

  /**
   * Updates the responsive breakpoint state based on the current viewport width.
   *
   * @param viewportWidth Current window width in pixels.
   * @returns void
   */
  updateViewport(viewportWidth: number): void {
    this.isMobile = viewportWidth <= this.mobileMaxWidth;
  }

  /**
   * Opens the contact detail panel.
   *
   * @returns void
   */
  openDetail(): void {
    this.isDetailOpen = true;
  }

  /**
   * Closes the contact detail panel.
   *
   * @returns void
   */
  closeDetail(): void {
    this.isDetailOpen = false;
  }

  /**
   * Resets the detail panel after a contact was deleted.
   *
   * @returns void
   */
  resetAfterDelete(): void {
    this.isDetailOpen = false;
  }

  /**
   * Shows the temporary creation toast.
   *
   * @returns void
   */
  showToast(): void {
    this.toastVisible = true;
    this.clearToastTimer();
    this.toastTimerId = window.setTimeout(() => {
      this.toastVisible = false;
      this.toastTimerId = null;
    }, 2000);
  }

  /**
   * Clears pending timers owned by the state helper.
   *
   * @returns void
   */
  destroy(): void {
    this.clearToastTimer();
  }

  /**
   * Clears the pending toast timer.
   *
   * @returns void
   */
  private clearToastTimer(): void {
    if (this.toastTimerId === null) return;
    window.clearTimeout(this.toastTimerId);
    this.toastTimerId = null;
  }
}
