import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // User is logged in
  if (authService.isAuthenticated()) {
    return true;
  }

  // User is not logged in
  return router.createUrlTree(['/login']);
};
