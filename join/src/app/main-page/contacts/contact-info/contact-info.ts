import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-contact-info',
  imports: [],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
/**
 * Shows details for the active contact and provides action shortcuts.
 */
export class ContactInfo implements OnChanges {
  @Input() activeContact: Contact | null = null;
  @Input() canDelete: boolean = true;
  @Output() back = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();
  // @Output() deleteContact = new EventEmitter<void>();
  @Output() requestDelete = new EventEmitter<void>();

  fabMenuOpen: boolean = false;
  profileAnimating: boolean = false;
  showDeleteConfirm: boolean = false;

  readonly getTwoInitials = getTwoInitials;

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
  //   this.showDeleteConfirm = false;
  //   this.deleteContact.emit();
  // }

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
}
