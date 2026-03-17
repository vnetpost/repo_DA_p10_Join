import { AddTaskUiState } from './add-task-ui-state';

/**
 * Coordinates close confirmation for overlay and routed add-task flows.
 */
export class AddTaskCloseFlow {
  private pendingNavigationResolver: ((shouldLeave: boolean) => void) | null = null;

  constructor(private readonly uiState: AddTaskUiState) {}

  /**
   * Resolves any pending routed-navigation prompt during teardown.
   *
   * @returns void
   */
  destroy(): void {
    this.resolvePendingNavigation(false);
  }

  /**
   * Requests the shared close confirmation dialog.
   *
   * @returns void
   */
  requestCloseConfirm(): void {
    this.uiState.requestCloseConfirm();
  }

  /**
   * Confirms the close action or pending navigation.
   *
   * @returns void
   */
  confirmClose(): void {
    if (this.pendingNavigationResolver) {
      this.resolvePendingNavigation(true);
      return;
    }

    this.uiState.clearCloseConfirm();
  }

  /**
   * Cancels the close action or pending navigation.
   *
   * @returns void
   */
  cancelClose(): void {
    if (this.pendingNavigationResolver) {
      this.resolvePendingNavigation(false);
      return;
    }

    this.uiState.clearCloseConfirm();
  }

  /**
   * Requests confirmation before leaving the routed add-task page.
   *
   * @returns Immediate permission or a promise resolved by the confirm buttons.
   */
  confirmNavigationAway(): boolean | Promise<boolean> {
    if (!this.uiState.shouldConfirmClose()) return true;
    this.uiState.requestCloseConfirm();
    return new Promise<boolean>((resolve) => {
      this.pendingNavigationResolver = resolve;
    });
  }

  /**
   * Resolves the pending navigation promise and hides the confirmation dialog.
   *
   * @param shouldLeave Whether the blocked navigation should continue.
   * @returns void
   */
  private resolvePendingNavigation(shouldLeave: boolean): void {
    const pendingResolver = this.pendingNavigationResolver;
    this.pendingNavigationResolver = null;
    this.uiState.clearCloseConfirm();
    pendingResolver?.(shouldLeave);
  }
}
