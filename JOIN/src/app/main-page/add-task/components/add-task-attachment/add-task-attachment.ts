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
import { TaskAttachment } from '../../../../shared/interfaces/task';
import { TaskAttachmentProcessingService } from '../../../../shared/services/task-attachment-processing.service';
import { TaskAttachmentViewerService } from '../../../../shared/services/task-attachment-viewer.service';
import {
  MAX_TASK_ATTACHMENT_BYTES,
  TASK_ATTACHMENT_LIMIT_MESSAGE,
} from '../../../../shared/utilities/task-attachment.constants';
import {
  getTaskAttachmentFileName,
  getTaskAttachmentPreviewSrc,
  getTaskAttachmentSizeLabel,
  getTaskAttachmentTypeLabel,
} from '../../../../shared/utilities/task-attachment.utils';
import { AttachmentUploadPreviewStore } from './state/attachment-upload-preview-store';
import {
  getSelectedAttachmentSizeLabel,
  getSelectedAttachmentTypeLabel,
} from './utils/attachment-upload.utils';
import {
  filterAttachmentFiles,
  mergeAttachmentFiles,
} from './utils/attachment-upload-selection.utils';
import { AttachmentUploadViewer } from './services/attachment-upload-viewer';
import { AttachmentUploadUsage } from './state/attachment-upload-usage';

/**
 * Handles attachment selection, preview generation and removal inside the task form.
 */
@Component({
  selector: 'app-add-task-attachment',
  imports: [],
  templateUrl: './add-task-attachment.html',
  styleUrl: './add-task-attachment.scss',
})
export class AddTaskAttachment implements OnChanges, OnDestroy {
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
  readonly getAttachmentName = getTaskAttachmentFileName;
  readonly getExistingAttachmentPreview = getTaskAttachmentPreviewSrc;
  readonly getExistingAttachmentTypeLabel = getTaskAttachmentTypeLabel;
  readonly getExistingAttachmentSizeLabel = getTaskAttachmentSizeLabel;
  readonly getSelectedFilePreview = (file: File) => this.previewStore.getPreviewUrl(file);
  readonly trackSelectedFile = (_index: number, file: File) => this.previewStore.getFileKey(file);
  readonly getSelectedFileTypeLabel = getSelectedAttachmentTypeLabel;
  readonly getSelectedFileSizeLabel = getSelectedAttachmentSizeLabel;
  isDragOver = false;
  showTypeError = false;
  private readonly taskAttachmentProcessingService = inject(TaskAttachmentProcessingService);
  private readonly attachmentViewerService = inject(TaskAttachmentViewerService);
  private readonly previewStore = new AttachmentUploadPreviewStore();
  private readonly attachmentUsage = new AttachmentUploadUsage(
    this.taskAttachmentProcessingService,
    this.maxTaskAttachmentBytes,
  );
  private readonly attachmentViewer = new AttachmentUploadViewer(this.attachmentViewerService);

  /**
   * Human-readable usage label for the current task image payload.
   *
   * @returns Current used megabytes relative to the 1 MB limit.
   */
  get attachmentUsageLabel(): string {
    return this.attachmentUsage.usageLabel;
  }

  /**
   * Indicates whether the upload field currently has previewable attachments.
   *
   * @returns `true` when either existing or newly selected attachments are present.
   */
  get hasPreviewAttachments(): boolean {
    return this.existingAttachments.length > 0 || this.selectedFiles.length > 0;
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

    this.attachmentViewer.destroy();
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
    this.attachmentViewer.destroy();
    this.previewStore.clear();
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
    this.previewStore.clear();
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
    if (fileToRemove) this.previewStore.revokePreviewUrl(fileToRemove);
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
    this.attachmentViewer.open(this.viewerGallery?.nativeElement, index);
  }

  /**
   * Opens one newly selected file inside the shared image viewer.
   *
   * @param index Index of the selected file in the pending upload list.
   * @returns void
   */
  openSelectedAttachment(index: number): void {
    this.attachmentViewer.open(this.viewerGallery?.nativeElement, this.existingAttachments.length + index);
  }

  /**
   * Validates and merges new files into the current selection.
   *
   * @param files Raw files from picker or dropzone.
   * @returns void
   */
  private async addSelectedFiles(files: File[]): Promise<void> {
    if (!files.length) return;
    const validFiles = this.getValidFiles(files);
    if (!validFiles.length) return;
    const mergedFiles = this.getMergedFiles(validFiles);
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
    return this.attachmentUsage.exceedsLimit(this.existingAttachments, selectedFiles);
  }

  /**
   * Filters raw files down to supported image types and updates the type error state.
   *
   * @param files Raw files from picker or dropzone.
   * @returns Supported files only.
   */
  private getValidFiles(files: File[]): File[] {
    const filterResult = filterAttachmentFiles(files, this.allowedMimeTypes);
    this.showTypeError = filterResult.hasTypeError;
    return filterResult.validFiles;
  }

  /**
   * Merges newly selected files into the current selection without duplicates.
   *
   * @param validFiles Supported files from the current interaction.
   * @returns Updated unique file list.
   */
  private getMergedFiles(validFiles: File[]): File[] {
    return mergeAttachmentFiles(this.selectedFiles, validFiles, (file) =>
      this.previewStore.getFileKey(file)
    );
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
   * Recalculates the persisted payload currently occupied by this task's images.
   *
   * @returns Promise that resolves after the latest usage estimate has been applied.
   */
  private async refreshAttachmentUsage(): Promise<void> {
    await this.attachmentUsage.refresh(this.existingAttachments, this.selectedFiles);
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

  /**
   * Synchronizes cached preview URLs with the current file selection.
   *
   * @returns void
   */
  private syncPreviewUrlsWithSelectedFiles(): void {
    this.previewStore.syncWithSelectedFiles(this.selectedFiles);
  }
}
