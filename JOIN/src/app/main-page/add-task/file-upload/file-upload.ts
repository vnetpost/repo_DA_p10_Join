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
} from '@angular/core';
import { TaskAttachment } from '../../../shared/interfaces/task';

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

  readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  isDragOver = false;
  showTypeError = false;
  private previewUrlsByFileKey = new Map<string, string>();

  ngOnChanges(changes: SimpleChanges): void {
    const selectedFilesChange = changes['selectedFiles'];
    if (!selectedFilesChange) return;
    this.syncPreviewUrlsWithSelectedFiles();
    if (this.selectedFiles.length > 0) return;

    this.showTypeError = false;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    this.clearPreviewUrls();
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    this.addSelectedFiles(files);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    this.addSelectedFiles(droppedFiles);
  }

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
   */
  deleteAllAttachments(event?: Event): void {
    event?.stopPropagation();
    this.clearSelectedFiles();
    this.existingAttachments = [];
    this.existingAttachmentsChange.emit([]);
  }

  /**
   * Removes one existing attachment from the editable list.
   * @param index Attachment index to remove.
   * @param event Triggering click event.
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
   * @param index Selected file index to remove.
   * @param event Triggering click event.
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
   * Resolves a stable attachment name for display.
   * Supports both current and legacy task attachment shapes.
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
   */
  getSelectedFilePreview(file: File): string {
    const fileKey = this.getFileKey(file);
    const cachedUrl = this.previewUrlsByFileKey.get(fileKey);
    if (cachedUrl) return cachedUrl;

    const generatedUrl = URL.createObjectURL(file);
    this.previewUrlsByFileKey.set(fileKey, generatedUrl);
    return generatedUrl;
  }

  trackSelectedFile(_index: number, file: File): string {
    return this.getFileKey(file);
  }

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

  private getFileKey(file: File): string {
    return `${file.name}|${file.size}|${file.lastModified}`;
  }

  private revokePreviewUrl(file: File): void {
    const fileKey = this.getFileKey(file);
    const previewUrl = this.previewUrlsByFileKey.get(fileKey);
    if (!previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    this.previewUrlsByFileKey.delete(fileKey);
  }

  private syncPreviewUrlsWithSelectedFiles(): void {
    const activeKeys = new Set(this.selectedFiles.map((file) => this.getFileKey(file)));
    for (const [previewKey, previewUrl] of this.previewUrlsByFileKey.entries()) {
      if (activeKeys.has(previewKey)) continue;
      URL.revokeObjectURL(previewUrl);
      this.previewUrlsByFileKey.delete(previewKey);
    }
  }

  private clearPreviewUrls(): void {
    for (const previewUrl of this.previewUrlsByFileKey.values()) {
      URL.revokeObjectURL(previewUrl);
    }
    this.previewUrlsByFileKey.clear();
  }
}
