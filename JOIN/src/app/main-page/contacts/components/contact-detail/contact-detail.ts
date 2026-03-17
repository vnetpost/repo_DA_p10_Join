import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Contact } from '../../../../shared/interfaces/contact';
import { ContactDetailProfile } from './contact-detail-profile/contact-detail-profile';

@Component({
  selector: 'app-contact-detail',
  imports: [ContactDetailProfile],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
/**
 * Shows details for the active contact and provides action shortcuts.
 */
export class ContactDetail implements OnChanges {
  @Input() activeContact: Contact | null = null;
  @Input() canDelete: boolean = true;
  @Output() back = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();
  // @Output() deleteContact = new EventEmitter<void>();
  @Output() requestDelete = new EventEmitter<void>();

  readonly downLgBreakpoint = 768;
  isDownLg = this.isDownLgViewport();
  fabMenuOpen: boolean = false;
  profileAnimating: boolean = false;
  showDeleteConfirm: boolean = false;

  /**
   * Indicates whether the contact has a usable phone number.
   *
   * @param phone The phone value to inspect.
   * @returns `true` when the phone field contains non-whitespace content.
   */
  hasPhoneNumber(phone: Contact['phone'] | null | undefined): boolean {
    return String(phone ?? '').trim().length > 0;
  }

  /**
   * Emits a back event and prevents the default link action.
   */
  handleBack(event: Event): void {
    event.preventDefault();
    this.back.emit();
  }

  /**
   * Toggles the floating action menu visibility.
   */
  toggleFabMenu(): void {
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  /**
   * Closes the floating action menu.
   */
  closeFabMenu(): void {
    this.fabMenuOpen = false;
  }

  /**
   * Emits edit action and closes the action menu.
   */
  handleFabEdit(): void {
    this.editContact.emit();
    this.closeFabMenu();
  }

  /**
   * Opens a small confirmation toast before deleting.
   */
  handleFabDelete(): void {
    // this.requestDeleteConfirmation();
    this.requestDelete.emit();
  }

  /**
   * Shows the delete confirmation toast.
   */
  // requestDeleteConfirmation(): void {
  //   if (!this.canDelete) return;
  //   this.showDeleteConfirm = true;
  //   this.closeFabMenu();
  // }

  /**
   * Cancels the delete confirmation.
   */
  // cancelDelete(): void {
  //   this.showDeleteConfirm = false;
  // }

  /**
   * Confirms deletion and emits the delete action.
   */
  // confirmDelete(): void {
  //   if (!this.canDelete) return;
  //   this.deleteConfirmVisible = false;
  //   this.deleteContact.emit();
  // }

  // @HostListener('document:keydown.escape')
  // /**
  //  * Closes the action menu when Escape is pressed.
  //  */
  // onEscape(): void {
  //   if (this.deleteConfirmVisible) {
  //     this.cancelDeleteConfirmation();
  //     return;
  //   }
  //   if (!this.fabMenuOpen) return;
  //   this.closeFabMenu();
  // }

  @HostListener('window:resize')
  onResize(): void {
    this.isDownLg = this.isDownLgViewport();
    if (!this.isDownLg) this.closeFabMenu();
  }

  /**
   * Triggers the profile animation when the active contact changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeContact'] || !this.activeContact) return;
    this.showDeleteConfirm = false;
    this.profileAnimating = false;
    setTimeout(() => {
      this.profileAnimating = true;
    }, 0);
  }

  /**
   * Checks whether the viewport is currently at or below the mobile breakpoint.
   *
   * @returns `true` when the viewport width is within the small-screen range.
   */
  private isDownLgViewport(): boolean {
    return window.innerWidth <= this.downLgBreakpoint;
  }
}
