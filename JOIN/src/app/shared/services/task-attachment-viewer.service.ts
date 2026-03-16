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
    let viewerInstance!: Viewer;
    const container = this.resolveContainer(galleryElement, preferredContainer);
    const title = this.buildTitleConfig();
    const toolbar = this.buildToolbarConfig(() => this.downloadCurrentImage(viewerInstance));
    viewerInstance = new Viewer(galleryElement, this.buildViewerOptions(container, title, toolbar) as any);
    return viewerInstance;
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
   * Builds the shared Viewer.js option object.
   *
   * @param container Host element for the modal viewer.
   * @param title Viewer title configuration.
   * @param toolbar Viewer toolbar configuration.
   * @returns Shared viewer options.
   */
  private buildViewerOptions(
    container: HTMLElement,
    title: any,
    toolbar: any
  ) {
    const baseOptions = this.getBaseViewerOptions(container);
    return { ...baseOptions, title, toolbar };
  }

  /**
   * Builds the title renderer for Viewer.js.
   *
   * @returns Viewer.js title configuration tuple.
   */
  private buildTitleConfig() {
    const viewerService = this;
    return [
      1,
      function (this: Viewer & { images?: HTMLImageElement[]; index?: number }) {
        return viewerService.buildViewerTitle(this);
      },
    ];
  }

  /**
   * Builds the toolbar configuration, including the custom download button.
   *
   * @param onDownload Callback for downloading the active image.
   * @returns Viewer.js toolbar configuration.
   */
  private buildToolbarConfig(onDownload: () => void) {
    const navigationButtons = this.getNavigationToolbarButtons();
    const transformButtons = this.getTransformToolbarButtons();
    return { ...navigationButtons, download: this.buildDownloadToolbarButton(onDownload), ...transformButtons };
  }

  /**
   * Builds the base viewer options shared by all attachment galleries.
   *
   * @param container Host element for the modal viewer.
   * @returns Shared base viewer options.
   */
  private getBaseViewerOptions(container: HTMLElement) {
    const interactiveOptions = this.getInteractiveViewerOptions();
    return { button: true, container, navbar: true, ...interactiveOptions };
  }

  /**
   * Returns shared interactive viewer defaults.
   *
   * @returns Viewer interaction options.
   */
  private getInteractiveViewerOptions() {
    return {
      fullscreen: true,
      keyboard: true,
      loop: true,
      movable: true,
      tooltip: true,
      transition: true,
      zIndex: 4000,
      zoomable: true,
    };
  }

  /**
   * Returns the navigation toolbar buttons.
   *
   * @returns Viewer navigation toolbar buttons.
   */
  private getNavigationToolbarButtons() {
    return { 'zoom-in': true, 'zoom-out': true, 'one-to-one': true, reset: true, prev: true, play: true, next: true };
  }

  /**
   * Returns the transform toolbar buttons.
   *
   * @returns Viewer transform toolbar buttons.
   */
  private getTransformToolbarButtons() {
    return { 'rotate-left': true, 'rotate-right': true, 'flip-horizontal': true, 'flip-vertical': true };
  }

  /**
   * Builds the custom download toolbar button.
   *
   * @param onDownload Callback for downloading the active image.
   * @returns Viewer download toolbar entry.
   */
  private buildDownloadToolbarButton(onDownload: () => void) {
    return { show: true, size: 'small', click: onDownload };
  }

  /**
   * Builds the title shown by Viewer.js from image metadata stored on the gallery node.
   *
   * @param viewer Current Viewer.js instance.
   * @returns Compact metadata string for the viewer header.
   */
  private buildViewerTitle(viewer: Viewer & { images?: HTMLImageElement[]; index?: number }): string {
    const sourceImage = this.getCurrentSourceImage(viewer);
    const fileName = this.getSourceImageName(sourceImage);
    const metadataParts = this.getSourceImageMetadata(sourceImage);
    if (!metadataParts.length) return fileName;
    return `${fileName} • ${metadataParts.join(' • ')}`;
  }

  /**
   * Downloads the attachment currently shown inside Viewer.js.
   *
   * @param viewer Current Viewer.js instance.
   * @returns void
   */
  private downloadCurrentImage(viewer: Viewer & { images?: HTMLImageElement[]; index?: number }): void {
    const sourceImage = this.getCurrentSourceImage(viewer);
    const downloadUrl = sourceImage?.currentSrc || sourceImage?.src;
    if (!downloadUrl) return;
    this.triggerDownload(downloadUrl, this.getSourceImageName(sourceImage, 'attachment'), sourceImage);
  }

  /**
   * Resolves the original gallery image for the active viewer index.
   *
   * @param viewer Current Viewer.js instance.
   * @returns Active source image or `undefined`.
   */
  private getCurrentSourceImage(
    viewer: Viewer & { images?: HTMLImageElement[]; index?: number }
  ): HTMLImageElement | undefined {
    return viewer.images?.[viewer.index ?? 0];
  }

  /**
   * Resolves the best available display name for a gallery image.
   *
   * @param sourceImage Original gallery image element.
   * @param fallbackName Name used when metadata is missing.
   * @returns Human-readable image name.
   */
  private getSourceImageName(sourceImage?: HTMLImageElement, fallbackName = 'Attachment'): string {
    return sourceImage?.dataset['fileName']?.trim() || sourceImage?.alt?.trim() || fallbackName;
  }

  /**
   * Reads compact metadata strings from a gallery image.
   *
   * @param sourceImage Original gallery image element.
   * @returns Existing metadata parts in display order.
   */
  private getSourceImageMetadata(sourceImage?: HTMLImageElement): string[] {
    const fileType = sourceImage?.dataset['fileType']?.trim();
    const fileSize = sourceImage?.dataset['fileSize']?.trim();
    return [fileType, fileSize].filter(Boolean) as string[];
  }

  /**
   * Triggers a browser download for the active viewer image.
   *
   * @param downloadUrl Resolved image URL.
   * @param fileName Download file name.
   * @param sourceImage Original gallery image element.
   * @returns void
   */
  private triggerDownload(
    downloadUrl: string,
    fileName: string,
    sourceImage?: HTMLImageElement
  ): void {
    const documentRef = sourceImage?.ownerDocument || document;
    const link = documentRef.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }
}
