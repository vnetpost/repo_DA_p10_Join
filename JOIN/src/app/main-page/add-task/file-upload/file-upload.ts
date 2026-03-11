import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TaskAttachment } from '../../../shared/interfaces/task';

@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload implements OnChanges {
  @Input() selectedFiles: File[] = [];
  @Input() existingAttachments: TaskAttachment[] = [];
  @Output() selectedFilesChange = new EventEmitter<File[]>();
  @Output() existingAttachmentsChange = new EventEmitter<TaskAttachment[]>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  isDragOver = false;
  showTypeError = false;

  ngOnChanges(changes: SimpleChanges): void {
    const selectedFilesChange = changes['selectedFiles'];
    if (!selectedFilesChange) return;
    if (this.selectedFiles.length > 0) return;

    this.showTypeError = false;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
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
    this.selectedFilesChange.emit([]);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
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
    this.selectedFilesChange.emit(mergedFiles);
  }
}
