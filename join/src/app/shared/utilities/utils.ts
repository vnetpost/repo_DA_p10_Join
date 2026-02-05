import { Contact } from '../interfaces/contact';

export function capitalizeFullname(fullName?: string): string {
  if (!fullName) return '';
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export const userColors = [
  '#ff4646',
  '#ff745e',
  '#ffa35e',
  '#ff7a00',
  '#ffbb2b',
  '#ffc701',
  '#ffe62b',
  '#c3ff2b',
  '#1fd7c1',
  '#00bee8',
  '#0038ff',
  '#fc71ff',
  '#ff5eb3',
  '#6e52ff',
  '#9327ff',
];

export function setUserColor() {
  return userColors[Math.floor(Math.random() * userColors.length)];
}

export function getTwoInitials(fullName?: string): string {
  if (!fullName) return '';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}
