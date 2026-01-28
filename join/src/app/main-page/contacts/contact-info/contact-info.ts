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
  @Output() back = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();
  @Output() deleteContact = new EventEmitter<void>();

  fabMenuOpen = false;
  profileAnimating = false;

  readonly getTwoInitials = getTwoInitials;

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
   * Emits delete action and closes the action menu.
   */
  handleFabDelete(): void {
    this.deleteContact.emit();
    this.closeFabMenu();
  }

  @HostListener('document:keydown.escape')
  /**
   * Closes the action menu when Escape is pressed.
   */
  onEscape(): void {
    if (!this.fabMenuOpen) return;
    this.closeFabMenu();
  }

  /**
   * Triggers the profile animation when the active contact changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeContact'] || !this.activeContact) return;
    this.profileAnimating = false;
    setTimeout(() => {
      this.profileAnimating = true;
    }, 0);
  }
}
