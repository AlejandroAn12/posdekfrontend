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
        path: 'products',
        loadComponent: () => import('./features/productsPages/products.routes')
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component')
      },
      {
        path: '',
        redirectTo: 'dashboard', // Redirigir a 'user' por defecto
        pathMatch: 'full',
      },
    ],
  },
] as Routes;