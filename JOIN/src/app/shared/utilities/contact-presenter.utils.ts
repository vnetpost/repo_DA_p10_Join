import { Contact } from '../interfaces/contact';
import { getContactAvatarSrc, getTwoInitials } from './utils';

/**
 * Finds one contact by ID inside a contact list.
 *
 * @param contacts Full list of available contacts.
 * @param id Contact identifier to resolve.
 * @returns Matching contact or `null` when none exists.
 */
export function findContactById(contacts: Contact[], id: string): Contact | null {
  return contacts.find((contact) => contact.id === id) ?? null;
}

/**
 * Resolves the display name of a contact.
 *
 * @param contact Contact to display.
 * @returns Contact name or a safe fallback.
 */
export function getContactDisplayName(contact?: Contact | null): string {
  return contact?.name || 'Unknown';
}

/**
 * Resolves the display initials of a contact.
 *
 * @param contact Contact to display.
 * @returns Initials derived from the contact name.
 */
export function getContactDisplayInitials(contact?: Contact | null): string {
  return getTwoInitials(getContactDisplayName(contact));
}

/**
 * Resolves the display color of a contact.
 *
 * @param contact Contact to display.
 * @param fallbackColor Optional fallback color.
 * @returns Contact color or the fallback.
 */
export function getContactDisplayColor(contact?: Contact | null, fallbackColor = '#9327ff'): string {
  return contact?.userColor || fallbackColor;
}

/**
 * Resolves the avatar source of a contact.
 *
 * @param contact Contact to display.
 * @returns Avatar data URL or `null`.
 */
export function getContactDisplayAvatarSrc(contact?: Contact | null): string | null {
  return getContactAvatarSrc(contact);
}

/**
 * Resolves the display name of a contact by ID.
 *
 * @param contacts Full list of available contacts.
 * @param id Contact identifier to resolve.
 * @returns Contact name or a safe fallback.
 */
export function getContactDisplayNameById(contacts: Contact[], id: string): string {
  return getContactDisplayName(findContactById(contacts, id));
}

/**
 * Resolves the display initials of a contact by ID.
 *
 * @param contacts Full list of available contacts.
 * @param id Contact identifier to resolve.
 * @returns Contact initials.
 */
export function getContactDisplayInitialsById(contacts: Contact[], id: string): string {
  return getContactDisplayInitials(findContactById(contacts, id));
}

/**
 * Resolves the display color of a contact by ID.
 *
 * @param contacts Full list of available contacts.
 * @param id Contact identifier to resolve.
 * @param fallbackColor Optional fallback color.
 * @returns Contact color or the fallback.
 */
export function getContactDisplayColorById(
  contacts: Contact[],
  id: string,
  fallbackColor = '#9327ff'
): string {
  return getContactDisplayColor(findContactById(contacts, id), fallbackColor);
}

/**
 * Resolves the avatar source of a contact by ID.
 *
 * @param contacts Full list of available contacts.
 * @param id Contact identifier to resolve.
 * @returns Avatar data URL or `null`.
 */
export function getContactDisplayAvatarSrcById(contacts: Contact[], id: string): string | null {
  return getContactDisplayAvatarSrc(findContactById(contacts, id));
}
