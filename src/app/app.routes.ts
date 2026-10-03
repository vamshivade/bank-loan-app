import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROLE_CONSTANTS } from './core/constants/role.constants';
import { publicGuard } from './core/guards/public-guard';

export const routes: Routes = [
  // =========================================================
  // PUBLIC
  // =========================================================
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('../app/layouts/public-layout/public-layout').then((c) => c.PublicLayout),

    children: [
      {
        path: '',
        loadComponent: () => import('../app/features/landing/landing').then((c) => c.Landing),
      },
    ],
  },

  // =========================================================
  // AUTH
  // =========================================================
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () => import('../app/layouts/auth-layout/auth-layout').then((c) => c.AuthLayout),

    children: [
      {
        path: 'login',
        loadComponent: () => import('../app/features/auth/login/login').then((c) => c.Login),
      },

      {
        path: 'register',
        loadComponent: () =>
          import('../app/features/auth/register/register').then((c) => c.Register),
      },
    ],
  },

  // =========================================================
  // PROTECTED MAIN AREA
  // =========================================================
  {
    path: 'pages',

    // User must be logged in
    canActivate: [authGuard],

    loadComponent: () => import('../app/layouts/main-layout/main-layout').then((c) => c.MainLayout),

    children: [
      // =====================================================
      // CUSTOMER
      // =====================================================
      {
        path: 'customer',

        // User must have Customer role
        canActivate: [roleGuard],

        data: {
          role: ROLE_CONSTANTS.CUSTOMER,
        },

        children: [
          {
            // /pages/customer
            path: '',

            loadComponent: () =>
              import('../app/features/customer/dashboard/dashboard').then((c) => c.Dashboard),
          },

          {
            // /pages/customer/apply-loan
            path: 'apply-loan',

            loadComponent: () =>
              import('../app/features/customer/apply-loan/apply-loan').then((c) => c.ApplyLoan),
          },
        ],
      },

      // =====================================================
      // BANK EMPLOYEE
      // =====================================================
      {
        path: 'employee',

        // User must have BankEmployee role
        canActivate: [roleGuard],

        data: {
          role: ROLE_CONSTANTS.BANK_EMPLOYEE,
        },

        children: [
          {
            // /pages/employee
            path: '',

            loadComponent: () =>
              import('../app/features/employee/dashboard/dashboard').then((c) => c.Dashboard),
          },

          {
            // /pages/employee/applications
            path: 'applications',

            loadComponent: () =>
              import('../app/features/employee/applications/applications').then(
                (c) => c.Applications,
              ),
          },
        ],
      },
    ],
  },

  // =========================================================
  // FALLBACK
  // =========================================================
  {
    path: '**',
    redirectTo: '',
  },
];
