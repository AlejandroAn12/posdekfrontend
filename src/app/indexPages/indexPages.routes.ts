import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./indexPages.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/user/features/users.routes')
      },
      {
        path: '',
        redirectTo: 'dashboard', // Redirigir a 'user' por defecto
        pathMatch: 'full',
      },
    ],
  },
] as Routes;