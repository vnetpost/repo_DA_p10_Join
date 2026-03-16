import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Prevents navigation to authenticated routes when no user session exists.
 *
 * @returns A boolean or redirect tree wrapped in an observable.
 */
export function authGuard(): ReturnType<CanActivateFn> {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/']))),
  );
}
