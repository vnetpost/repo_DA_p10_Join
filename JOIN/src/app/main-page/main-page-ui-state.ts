/**
 * Encapsulates transient UI state for the main auth page.
 */
export class MainPageUiState {
  isMobile = false;
  toastVisible = false;
  showMobileGreeting = false;
  introActive = true;
  logoMoving = false;

  private introMoveTimer?: number;
  private introHideTimer?: number;
  private toastTimer?: number;
  private mobileGreetingTimer?: number;

  /**
   * Updates the mobile state based on viewport width.
   *
   * @param viewportWidth Current viewport width in pixels.
   * @returns void
   */
  updateScreen(viewportWidth: number): void {
    this.isMobile = viewportWidth < 1120;
  }

  /**
   * Applies the initial intro state depending on the navigation flag.
   *
   * @param skipIntro Whether the intro animation should be skipped.
   * @returns void
   */
  applyIntroState(skipIntro: boolean): void {
    if (skipIntro) {
      this.introActive = false;
      this.logoMoving = true;
      return;
    }

    this.startIntro();
  }

  /**
   * Shows the intro animation sequence.
   *
   * @returns void
   */
  startIntro(): void {
    this.introMoveTimer = window.setTimeout(() => {
      this.logoMoving = true;
    }, 300);

    this.introHideTimer = window.setTimeout(() => {
      this.introActive = false;
    }, 1400);
  }

  /**
   * Shows a success toast for a fixed duration.
   *
   * @returns void
   */
  showToast(): void {
    this.toastVisible = true;

    this.toastTimer = window.setTimeout(() => {
      this.toastVisible = false;
    }, 2500);
  }

  /**
   * Coordinates post-login navigation, including the mobile greeting overlay.
   *
   * @param onNavigate Callback that performs the actual navigation.
   * @returns void
   */
  handlePostLoginNavigation(onNavigate: () => void): void {
    if (!this.isMobile) {
      onNavigate();
      return;
    }

    this.showMobileGreeting = true;
    this.mobileGreetingTimer = window.setTimeout(() => {
      this.showMobileGreeting = false;
      onNavigate();
    }, 2000);
  }

  /**
   * Clears running timers on component teardown.
   *
   * @returns void
   */
  destroy(): void {
    if (this.introMoveTimer) clearTimeout(this.introMoveTimer);
    if (this.introHideTimer) clearTimeout(this.introHideTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.mobileGreetingTimer) clearTimeout(this.mobileGreetingTimer);
  }
}
