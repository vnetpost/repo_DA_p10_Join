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
import { TaskAttachmentProcessingService } from '../../../shared/services/task-attachment-processing.service';
import { TaskAttachmentViewerService } from '../../../shared/services/task-attachment-viewer.service';
import {
  MAX_TASK_ATTACHMENT_BYTES,
  TASK_ATTACHMENT_LIMIT_MESSAGE,
} from '../../../shared/utilities/task-attachment.constants';
import {
  formatAttachmentSize,
  getTaskAttachmentSizeLabel,
  getTaskAttachmentTypeLabel,
} from '../../../shared/utilities/task-attachment.utils';
import type Viewer from 'viewerjs';

/**
 * Handles attachment selection, preview generation and removal inside the task form.
 */
@Component({
  selector: 'app-attachment-upload',
  imports: [],
  templateUrl: './attachment-upload.html',
  styleUrl: './attachment-upload.scss',
})
export class AttachmentUpload implements OnChanges, OnDestroy {
  @Input() errorMessage = '';
  @Input() selectedFiles: File[] = [];
  @Input() existingAttachments: TaskAttachment[] = [];
  @Output() errorMessageChange = new EventEmitter<string>();
  @Output() selectedFilesChange = new EventEmitter<File[]>();
  @Output() existingAttachmentsChange = new EventEmitter<TaskAttachment[]>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('viewerGallery') private viewerGallery?: ElementRef<HTMLElement>;

  readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  readonly maxTaskAttachmentBytes = MAX_TASK_ATTACHMENT_BYTES;
  currentAttachmentBytes = 0;
  isDragOver = false;
  showTypeError = false;
  private readonly taskAttachmentProcessingService = inject(TaskAttachmentProcessingService);
  private attachmentViewerService = inject(TaskAttachmentViewerService);
  private previewUrlsByFileKey = new Map<string, string>();
  private attachmentViewer: Viewer | null = null;
  private attachmentUsageRequestId = 0;

  /**
   * Human-readable usage label for the current task image payload.
   *
   * @returns Current used megabytes relative to the 1 MB limit.
   */
  get attachmentUsageLabel(): string {
    const usedMegabytes = this.formatMegabytes(this.currentAttachmentBytes);
    const maxMegabytes = this.formatMegabytes(this.maxTaskAttachmentBytes);
    return `${usedMegabytes} / ${maxMegabytes} MB used`;
  }

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
    void this.refreshAttachmentUsage();
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
  async onFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    await this.addSelectedFiles(files);
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
  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isDragOver = false;
    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    await this.addSelectedFiles(droppedFiles);
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
    this.updateErrorMessage('');
    this.clearPreviewUrls();
    this.selectedFilesChange.emit([]);
    void this.refreshAttachmentUsage();
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
    this.updateErrorMessage('');
    this.existingAttachmentsChange.emit([]);
    void this.refreshAttachmentUsage();
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
    this.updateErrorMessage('');
    this.existingAttachmentsChange.emit(updatedAttachments);
    void this.refreshAttachmentUsage();
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
    this.updateErrorMessage('');
    this.selectedFilesChange.emit(updatedFiles);
    void this.refreshAttachmentUsage();
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
   * Resolves a short type label for one persisted attachment.
   *
   * @param attachment Persisted attachment payload.
   * @returns Attachment type label.
   */
  getExistingAttachmentTypeLabel(attachment: TaskAttachment): string {
    return getTaskAttachmentTypeLabel(attachment);
  }

  /**
   * Resolves a short size label for one persisted attachment.
   *
   * @param attachment Persisted attachment payload.
   * @returns Human-readable attachment size label.
   */
  getExistingAttachmentSizeLabel(attachment: TaskAttachment): string {
    return getTaskAttachmentSizeLabel(attachment);
  }

  /**
   * Resolves a short type label for one newly selected file.
   *
   * @param file Browser file from the current selection.
   * @returns File type label.
   */
  getSelectedFileTypeLabel(file: File): string {
    if (file.type === 'image/jpeg') return 'JPEG';
    if (file.type === 'image/png') return 'PNG';
    const mimeSubtype = file.type.split('/')[1]?.trim();
    if (mimeSubtype) return mimeSubtype.toUpperCase();
    return file.type.toUpperCase();
  }

  /**
   * Resolves a short size label for one newly selected file.
   *
   * @param file Browser file from the current selection.
   * @returns Human-readable file size label.
   */
  getSelectedFileSizeLabel(file: File): string {
    return formatAttachmentSize(file.size);
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
  private async addSelectedFiles(files: File[]): Promise<void> {
    if (!files.length) return;
    const validFiles = this.extractValidFiles(files);
    if (!validFiles.length) return;
    const mergedFiles = this.mergeSelectedFiles(validFiles);
    if (await this.hasExceededAttachmentLimit(mergedFiles)) return this.handleAttachmentLimitExceeded();
    this.applySelectedFiles(mergedFiles);
  }

  /**
   * Checks whether the currently selected files would exceed the task upload limit.
   *
   * @param selectedFiles Candidate file selection after merging new files.
   * @returns `true` when the persisted payload would exceed the allowed limit.
   */
  private async hasExceededAttachmentLimit(selectedFiles: File[]): Promise<boolean> {
    const totalAttachmentBytes =
      await this.taskAttachmentProcessingService.estimatePersistedAttachmentBytes(
        this.existingAttachments,
        selectedFiles
      );

    return totalAttachmentBytes > this.maxTaskAttachmentBytes;
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
   * Filters raw files down to supported image types and updates the type error state.
   *
   * @param files Raw files from picker or dropzone.
   * @returns Supported files only.
   */
  private extractValidFiles(files: File[]): File[] {
    const validFiles = files.filter((file) => this.allowedMimeTypes.includes(file.type));
    this.showTypeError = validFiles.length !== files.length;
    return validFiles;
  }

  /**
   * Merges newly selected files into the current selection without duplicates.
   *
   * @param validFiles Supported files from the current interaction.
   * @returns Updated unique file list.
   */
  private mergeSelectedFiles(validFiles: File[]): File[] {
    const mergedFiles = [...this.selectedFiles];
    validFiles.forEach((newFile) => this.appendUniqueFile(mergedFiles, newFile));
    return mergedFiles;
  }

  /**
   * Appends a file only when no matching file is already selected.
   *
   * @param files Current merged file list.
   * @param candidateFile Candidate file to append.
   * @returns void
   */
  private appendUniqueFile(files: File[], candidateFile: File): void {
    if (this.hasMatchingFile(files, candidateFile)) return;
    files.push(candidateFile);
  }

  /**
   * Checks whether one file already exists in the current selection.
   *
   * @param files Current merged file list.
   * @param candidateFile Candidate file to compare.
   * @returns `true` when the file already exists.
   */
  private hasMatchingFile(files: File[], candidateFile: File): boolean {
    return files.some((existingFile) => this.getFileKey(existingFile) === this.getFileKey(candidateFile));
  }

  /**
   * Applies the accepted file list to the component state.
   *
   * @param selectedFiles Updated file list.
   * @returns void
   */
  private applySelectedFiles(selectedFiles: File[]): void {
    this.updateErrorMessage('');
    this.selectedFiles = selectedFiles;
    this.syncPreviewUrlsWithSelectedFiles();
    this.selectedFilesChange.emit(selectedFiles);
    void this.refreshAttachmentUsage();
  }

  /**
   * Applies the upload-limit error without changing the current selection.
   *
   * @returns void
   */
  private handleAttachmentLimitExceeded(): void {
    this.updateErrorMessage(TASK_ATTACHMENT_LIMIT_MESSAGE);
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

  /**
   * Recalculates the persisted payload currently occupied by this task's images.
   *
   * @returns Promise that resolves after the latest usage estimate has been applied.
   */
  private async refreshAttachmentUsage(): Promise<void> {
    const requestId = ++this.attachmentUsageRequestId;
    const estimatedBytes = await this.taskAttachmentProcessingService.estimatePersistedAttachmentBytes(
      this.existingAttachments,
      this.selectedFiles
    );

    if (requestId !== this.attachmentUsageRequestId) return;
    this.currentAttachmentBytes = estimatedBytes;
  }

  /**
   * Formats one byte count as a megabyte string for the upload limit display.
   *
   * @param bytes Persisted base64 payload size.
   * @returns Formatted megabyte string with two decimals.
   */
  private formatMegabytes(bytes: number): string {
    return (bytes / this.maxTaskAttachmentBytes).toFixed(2);
  }

  /**
   * Updates the externally controlled upload error state.
   *
   * @param message Current upload validation message.
   * @returns void
   */
  private updateErrorMessage(message: string): void {
    this.errorMessage = message;
    this.errorMessageChange.emit(message);
  }
}
