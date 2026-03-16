import { Injectable } from '@angular/core';
import Viewer from 'viewerjs/dist/viewer.esm.js';

/**
 * Creates and destroys Viewer.js instances with shared project defaults.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskAttachmentViewerService {
  /**
   * Builds a Viewer.js instance for the provided gallery element.
   *
   * @param galleryElement Hidden gallery element containing the preview images.
   * @param preferredContainer Optional dialog container that should host the viewer.
   * @returns Configured Viewer.js instance.
   */
  createViewer(galleryElement: HTMLElement, preferredContainer?: HTMLElement | null): Viewer {
    return new Viewer(galleryElement, {
      button: true,
      container: this.resolveContainer(galleryElement, preferredContainer),
      fullscreen: true,
      keyboard: true,
      loop: true,
      movable: true,
      navbar: true,
      title: true,
      toolbar: true,
      tooltip: true,
      transition: true,
      zIndex: 4000,
      zoomable: true,
    });
  }

  /**
   * Destroys the current viewer instance and returns a cleared state value.
   *
   * @param viewer Existing Viewer.js instance.
   * @returns Always `null` so components can reset their local viewer reference.
   */
  destroyViewer(viewer: Viewer | null): null {
    viewer?.destroy();
    return null;
  }

  /**
   * Resolves the element that should contain the viewer overlay.
   *
   * @param galleryElement Hidden gallery element.
   * @param preferredContainer Optional explicit host element.
   * @returns Dialog element when available, otherwise the document body.
   */
  private resolveContainer(
    galleryElement: HTMLElement,
    preferredContainer?: HTMLElement | null
  ): HTMLElement {
    if (preferredContainer instanceof HTMLElement) return preferredContainer;
    const dialogContainer = galleryElement.closest('dialog');
    if (dialogContainer instanceof HTMLElement) return dialogContainer;
    return galleryElement.ownerDocument.body;
  }
}
