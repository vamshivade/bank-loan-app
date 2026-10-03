import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { ROLE_CONSTANTS, ROLE_ROUTES } from '../constants/role.constants';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string | undefined;
  const currentRole = authService.getCurrentUserRole();

  console.log('Required Role:', requiredRole);
  console.log('Current Role:', currentRole);

  // No role configured
  if (!requiredRole) {
    return router.createUrlTree(['/']);
  }

  // Correct role
  if (currentRole === requiredRole) {
    return true;
  }

  // Wrong role → send user to their own area
  if (currentRole === ROLE_CONSTANTS.CUSTOMER) {
    return router.createUrlTree([ROLE_ROUTES[ROLE_CONSTANTS.CUSTOMER]]);
  }

  if (currentRole === ROLE_CONSTANTS.BANK_EMPLOYEE) {
    return router.createUrlTree([ROLE_ROUTES[ROLE_CONSTANTS.BANK_EMPLOYEE]]);
  }

  // No valid role
  return router.createUrlTree(['/login']);
};
