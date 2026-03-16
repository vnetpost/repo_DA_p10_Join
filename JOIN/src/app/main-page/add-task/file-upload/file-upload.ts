import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { TaskAttachment } from '../../../shared/interfaces/task';
import { TaskAttachmentViewerService } from '../../../shared/services/task-attachment-viewer.service';
import type Viewer from 'viewerjs';

/**
 * Handles attachment selection, preview generation and removal inside the task form.
 */
@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload implements OnChanges, OnDestroy {
  @Input() selectedFiles: File[] = [];
  @Input() existingAttachments: TaskAttachment[] = [];
  @Output() selectedFilesChange = new EventEmitter<File[]>();
  @Output() existingAttachmentsChange = new EventEmitter<TaskAttachment[]>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('viewerGallery') private viewerGallery?: ElementRef<HTMLElement>;

  readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  isDragOver = false;
  showTypeError = false;
  private attachmentViewerService = inject(TaskAttachmentViewerService);
  private previewUrlsByFileKey = new Map<string, string>();
  private attachmentViewer: Viewer | null = null;

  /**
   * Keeps preview object URLs in sync when the parent updates selected files.
   *
   * @param changes Angular change map for current inputs.
   * @returns void
   */
  ngOnChanges(changes: SimpleChanges): void {
    const selectedFilesChange = changes['selectedFiles'];
    const existingAttachmentsChange = changes['existingAttachments'];
    if (!selectedFilesChange && !existingAttachmentsChange) return;

    this.destroyAttachmentViewer();
    this.syncPreviewUrlsWithSelectedFiles();
    if (this.selectedFiles.length > 0) return;

    this.showTypeError = false;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  /**
   * Releases all generated preview URLs on component teardown.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    this.destroyAttachmentViewer();
    this.clearPreviewUrls();
  }

  /**
   * Opens the hidden native file input.
   *
   * @returns void
   */
  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  /**
   * Adds files chosen through the native file picker.
   *
   * @param event Native change event from the hidden file input.
   * @returns void
   */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    this.addSelectedFiles(files);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  /**
   * Marks the dropzone as active while files are dragged over it.
   *
   * @param event Native drag-over event.
   * @returns void
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  /**
   * Removes the drag-over highlight once the pointer leaves the dropzone.
   *
   * @param event Native drag-leave event.
   * @returns void
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  /**
   * Adds files dropped onto the dropzone.
   *
   * @param event Native drop event.
   * @returns void
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    this.addSelectedFiles(droppedFiles);
  }

  /**
   * Clears all newly selected files without touching existing attachments.
   *
   * @param event Optional trigger event used to stop propagation.
   * @returns void
   */
  clearSelectedFiles(event?: Event): void {
    event?.stopPropagation();
    this.selectedFiles = [];
    this.showTypeError = false;
    this.clearPreviewUrls();
    this.selectedFilesChange.emit([]);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  /**
   * Removes all existing and newly selected attachments.
   *
   * @param event Optional trigger event used to stop propagation.
   * @returns void
   */
  deleteAllAttachments(event?: Event): void {
    event?.stopPropagation();
    this.clearSelectedFiles();
    this.existingAttachments = [];
    this.existingAttachmentsChange.emit([]);
  }

  /**
   * Removes one existing attachment from the editable list.
   *
   * @param index Attachment index to remove.
   * @param event Triggering click event.
   * @returns void
   */
  removeExistingAttachment(index: number, event: Event): void {
    event.stopPropagation();
    const updatedAttachments = this.existingAttachments.filter((_, attachmentIndex) => {
      return attachmentIndex !== index;
    });
    this.existingAttachments = updatedAttachments;
    this.existingAttachmentsChange.emit(updatedAttachments);
  }

  /**
   * Removes one newly selected file from the pending upload list.
   *
   * @param index Selected file index to remove.
   * @param event Triggering click event.
   * @returns void
   */
  removeSelectedFile(index: number, event: Event): void {
    event.stopPropagation();
    const fileToRemove = this.selectedFiles[index];
    if (fileToRemove) this.revokePreviewUrl(fileToRemove);
    const updatedFiles = this.selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    this.selectedFiles = updatedFiles;
    this.selectedFilesChange.emit(updatedFiles);
    if (!updatedFiles.length) this.showTypeError = false;
  }

  /**
   * Opens one existing attachment inside the shared image viewer.
   *
   * @param index Index of the existing attachment in the current list.
   * @returns void
   */
  openExistingAttachment(index: number): void {
    this.initializeAttachmentViewer();
    this.attachmentViewer?.view(index);
  }

  /**
   * Opens one newly selected file inside the shared image viewer.
   *
   * @param index Index of the selected file in the pending upload list.
   * @returns void
   */
  openSelectedAttachment(index: number): void {
    this.initializeAttachmentViewer();
    this.attachmentViewer?.view(this.existingAttachments.length + index);
  }

  /**
   * Resolves a stable attachment name for display.
   * Supports both current and legacy task attachment shapes.
   *
   * @param attachment Persisted attachment payload.
   * @param index Fallback index when no filename exists.
   * @returns Safe attachment name for the UI.
   */
  getAttachmentName(attachment: TaskAttachment, index: number): string {
    const fileName = attachment.fileName?.trim();
    if (fileName) return fileName;
    const withLegacyName = attachment as TaskAttachment & { name?: string };
    const legacyName = withLegacyName.name?.trim();
    if (legacyName) return legacyName;
    return `attachment-${index + 1}`;
  }

  /**
   * Builds a preview source for already persisted attachments.
   *
   * @param attachment Persisted attachment payload.
   * @returns Previewable image source string.
   */
  getExistingAttachmentPreview(attachment: TaskAttachment): string {
    const withLegacyUrl = attachment as TaskAttachment & { url?: string };
    if (withLegacyUrl.url) return withLegacyUrl.url;

    const base64 = attachment.base64?.trim();
    if (!base64) return '';
    if (base64.startsWith('data:')) return base64;
    const mimeType = attachment.fileType || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Builds and caches object URLs for selected image files.
   *
   * @param file Newly selected browser file.
   * @returns Object URL used in the thumbnail preview.
   */
  getSelectedFilePreview(file: File): string {
    const fileKey = this.getFileKey(file);
    const cachedUrl = this.previewUrlsByFileKey.get(fileKey);
    if (cachedUrl) return cachedUrl;

    const generatedUrl = URL.createObjectURL(file);
    this.previewUrlsByFileKey.set(fileKey, generatedUrl);
    return generatedUrl;
  }

  /**
   * Returns a stable track-by key for selected file thumbnails.
   *
   * @param _index Unused Angular index parameter.
   * @param file Selected browser file.
   * @returns Stable file identity string.
   */
  trackSelectedFile(_index: number, file: File): string {
    return this.getFileKey(file);
  }

  /**
   * Validates and merges new files into the current selection.
   *
   * @param files Raw files from picker or dropzone.
   * @returns void
   */
  private addSelectedFiles(files: File[]): void {
    if (!files.length) return;

    const validFiles = files.filter((file) => this.allowedMimeTypes.includes(file.type));
    const invalidFilesCount = files.length - validFiles.length;
    this.showTypeError = invalidFilesCount > 0;
    if (!validFiles.length) return;

    const mergedFiles = [...this.selectedFiles];
    validFiles.forEach((newFile) => {
      const hasDuplicate = mergedFiles.some((existingFile) => {
        return (
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size &&
          existingFile.lastModified === newFile.lastModified
        );
      });
      if (!hasDuplicate) mergedFiles.push(newFile);
    });

    this.selectedFiles = mergedFiles;
    this.syncPreviewUrlsWithSelectedFiles();
    this.selectedFilesChange.emit(mergedFiles);
  }

  /**
   * Builds a unique key for one browser file.
   *
   * @param file Browser file reference.
   * @returns Unique key derived from file metadata.
   */
  private getFileKey(file: File): string {
    return `${file.name}|${file.size}|${file.lastModified}`;
  }

  /**
   * Revokes the generated preview URL of one file.
   *
   * @param file Browser file whose preview should be released.
   * @returns void
   */
  private revokePreviewUrl(file: File): void {
    const fileKey = this.getFileKey(file);
    const previewUrl = this.previewUrlsByFileKey.get(fileKey);
    if (!previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    this.previewUrlsByFileKey.delete(fileKey);
  }

  /**
   * Removes cached preview URLs for files that are no longer selected.
   *
   * @returns void
   */
  private syncPreviewUrlsWithSelectedFiles(): void {
    const activeKeys = new Set(this.selectedFiles.map((file) => this.getFileKey(file)));
    for (const [previewKey, previewUrl] of this.previewUrlsByFileKey.entries()) {
      if (activeKeys.has(previewKey)) continue;
      URL.revokeObjectURL(previewUrl);
      this.previewUrlsByFileKey.delete(previewKey);
    }
  }

  /**
   * Releases all cached preview URLs.
   *
   * @returns void
   */
  private clearPreviewUrls(): void {
    for (const previewUrl of this.previewUrlsByFileKey.values()) {
      URL.revokeObjectURL(previewUrl);
    }
    this.previewUrlsByFileKey.clear();
  }

  /**
   * Creates or recreates the Viewer.js instance for the current attachment gallery.
   *
   * @returns void
   */
  private initializeAttachmentViewer(): void {
    const galleryElement = this.viewerGallery?.nativeElement;
    if (!galleryElement) return;

    this.destroyAttachmentViewer();
    this.attachmentViewer = this.attachmentViewerService.createViewer(galleryElement);
  }

  /**
   * Destroys the current Viewer.js instance when thumbnails change or the component closes.
   *
   * @returns void
   */
  private destroyAttachmentViewer(): void {
    this.attachmentViewer = this.attachmentViewerService.destroyViewer(this.attachmentViewer);
  }
}
