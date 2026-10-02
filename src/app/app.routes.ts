import { Routes } from '@angular/router';

export const routes: Routes = [
  // ====================
  // PUBLIC
  // ====================
  {
    path: '',
    loadComponent: () =>
      import('../app/layouts/public-layout/public-layout').then((c) => c.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('../app/features/landing/landing').then((c) => c.Landing),
      },
    ],
  },
  // ====================
  //   AUTH
  // ====================
  {
    path: '',
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

  // MAIN
  {
    path: 'pages',
    loadComponent: () => import('../app/layouts/main-layout/main-layout').then((c) => c.MainLayout),
    children: [
      // ====================
      // CUSTOMER
      // ====================
      {
        path: 'customer',
        children: [
          {
            // pages/customer/dashboard
            path: 'dashboard',
            loadComponent: () =>
              import('../app/features/customer/dashboard/dashboard').then((c) => c.Dashboard),
          },
          {
            // pages/customer/apply-loan
            path: 'apply-loan',
            loadComponent: () =>
              import('../app/features/customer/apply-loan/apply-loan').then((c) => c.ApplyLoan),
          },
        ],
      },
      // ====================
      //   EMPLOYEE
      // ====================
      {
        path: 'employee',
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('../app/features/employee/dashboard/dashboard').then((c) => c.Dashboard),
          },
          {
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

  // ====================
  //   FALL BACK
  // ====================
  {
    path: '**',
    redirectTo: '',
  },
];
