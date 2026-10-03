import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLE_CONSTANTS, ROLE_ROUTES } from '../constants/role.constants';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // User is not logged in → allow public/auth pages
  if (!authService.isAuthenticated()) {
    return true;
  }

  // User is already logged in → redirect to their dashboard
  const role = authService.getCurrentUserRole();

  if (role === ROLE_CONSTANTS.CUSTOMER) {
    return router.createUrlTree([ROLE_ROUTES[ROLE_CONSTANTS.CUSTOMER]]);
  }

  if (role === ROLE_CONSTANTS.BANK_EMPLOYEE) {
    return router.createUrlTree([ROLE_ROUTES[ROLE_CONSTANTS.BANK_EMPLOYEE]]);
  }

  // Authenticated but invalid/missing role
  authService.logout();

  return router.createUrlTree(['/login']);
};
