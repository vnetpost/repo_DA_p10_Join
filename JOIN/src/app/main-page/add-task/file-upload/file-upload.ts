import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  imports: [],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload implements OnChanges {
  @Input() selectedFile: File | null = null;
  @Output() selectedFileChange = new EventEmitter<File | null>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  isDragOver = false;
  showTypeError = false;

  ngOnChanges(changes: SimpleChanges): void {
    const selectedFileChange = changes['selectedFile'];
    if (!selectedFileChange) return;
    if (selectedFileChange.currentValue !== null) return;

    this.showTypeError = false;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    this.setSelectedFile(file);
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
    const droppedFile = event.dataTransfer?.files?.[0] ?? null;
    this.setSelectedFile(droppedFile);
  }

  clearSelectedFile(event?: Event): void {
    event?.stopPropagation();
    this.selectedFile = null;
    this.showTypeError = false;
    this.selectedFileChange.emit(null);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  private setSelectedFile(file: File | null): void {
    if (!file) {
      this.clearSelectedFile();
      return;
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      this.selectedFile = null;
      this.showTypeError = true;
      this.selectedFileChange.emit(null);
      if (this.fileInput) this.fileInput.nativeElement.value = '';
      return;
    }

    this.selectedFile = file;
    this.showTypeError = false;
    this.selectedFileChange.emit(file);
  }
}
