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
    const viewerService = this;

    return new Viewer(galleryElement, {
      button: true,
      container: this.resolveContainer(galleryElement, preferredContainer),
      fullscreen: true,
      keyboard: true,
      loop: true,
      movable: true,
      navbar: true,
      title: [
        1,
        function (this: Viewer & { images?: HTMLImageElement[]; index?: number }) {
          return viewerService.buildViewerTitle(this);
        },
      ],
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

  /**
   * Builds the title shown by Viewer.js from image metadata stored on the gallery node.
   *
   * @param viewer Current Viewer.js instance.
   * @returns Compact metadata string for the viewer header.
   */
  private buildViewerTitle(viewer: Viewer & { images?: HTMLImageElement[]; index?: number }): string {
    const sourceImage = viewer.images?.[viewer.index ?? 0];
    const fileName = sourceImage?.dataset['fileName']?.trim() || sourceImage?.alt?.trim() || 'Attachment';
    const fileType = sourceImage?.dataset['fileType']?.trim();
    const fileSize = sourceImage?.dataset['fileSize']?.trim();
    const metadataParts = [fileType, fileSize].filter(Boolean);
    if (!metadataParts.length) return fileName;
    return `${fileName} • ${metadataParts.join(' • ')}`;
  }
}
