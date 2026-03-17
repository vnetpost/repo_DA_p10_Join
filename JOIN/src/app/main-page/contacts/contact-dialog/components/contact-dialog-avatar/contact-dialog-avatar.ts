import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { ContactAvatar } from '../../../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../../../shared/utilities/utils';
import { ContactAvatarProcessingService } from '../../services/contact-avatar-processing.service';

export type ContactDialogAvatarChange = {
  avatar: ContactAvatar;
  previewSrc: string;
};

/**
 * Renders the contact avatar area and handles avatar image selection.
 */
@Component({
  selector: 'app-contact-dialog-avatar',
  imports: [],
  templateUrl: './contact-dialog-avatar.html',
  styleUrl: './contact-dialog-avatar.scss',
})
export class ContactDialogAvatar {
  @Input() dialogMode: 'add' | 'edit' = 'add';
  @Input() canUploadAvatar = false;
  @Input() userColor: string | null = null;
  @Input() avatarPreviewSrc: string | null = null;
  @Input() contactName = '';
  @Output() avatarUpdated = new EventEmitter<ContactDialogAvatarChange>();

  @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;

  readonly getTwoInitials = getTwoInitials;
  private readonly contactAvatarProcessingService = inject(ContactAvatarProcessingService);

  /**
   * Opens the hidden avatar file picker when avatar editing is allowed.
   *
   * @param event Optional click event used to stop propagation.
   * @returns void
   */
  openAvatarPicker(event?: Event): void {
    event?.stopPropagation();
    if (!this.canUploadAvatar || this.dialogMode !== 'edit') return;
    this.avatarInput?.nativeElement.click();
  }

  /**
   * Processes the selected avatar image and emits the updated avatar payload.
   *
   * @param event Native input change event.
   * @returns Promise<void>
   */
  async onAvatarSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    if (!this.contactAvatarProcessingService.isAllowedMimeType(file.type)) return this.clearFileInput();

    const processedAvatar = await this.contactAvatarProcessingService.processAvatar(file);
    if (!processedAvatar) return this.clearFileInput();

    this.avatarUpdated.emit(processedAvatar);
    this.clearFileInput();
  }

  /**
   * Clears the native file input so the same image can be chosen again if needed.
   *
   * @returns void
   */
  private clearFileInput(): void {
    if (this.avatarInput) this.avatarInput.nativeElement.value = '';
  }
}
