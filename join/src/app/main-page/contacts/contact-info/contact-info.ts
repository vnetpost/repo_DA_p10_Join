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
export class ContactInfo implements OnChanges {
  @Input() activeContact: Contact | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();
  @Output() deleteContact = new EventEmitter<void>();

  fabMenuOpen = false;
  profileAnimating = false;

  readonly getTwoInitials = getTwoInitials;

  handleBack(event: Event): void {
    event.preventDefault();
    this.back.emit();
  }

  toggleFabMenu(): void {
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  closeFabMenu(): void {
    this.fabMenuOpen = false;
  }

  handleFabEdit(): void {
    this.editContact.emit();
    this.closeFabMenu();
  }

  handleFabDelete(): void {
    this.deleteContact.emit();
    this.closeFabMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.fabMenuOpen) return;
    this.closeFabMenu();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeContact'] || !this.activeContact) return;
    this.profileAnimating = false;
    setTimeout(() => {
      this.profileAnimating = true;
    }, 0);
  }
}
