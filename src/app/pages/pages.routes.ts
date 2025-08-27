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
          import('./components/dashboard/dashboard.component')
      },
      {
        path: 'invoices',
        loadChildren: () => import('./components/invoices/invoices.routes')
      },
      {
        path: 'credentials',
        loadChildren: () =>
          import('./components/credentials/credentials.routes')
      },
      {
        path: 'clients',
        loadChildren: () => import('./components/clients/clients.routes')
      },
      {
        path: 'suppliers',
        loadChildren: () => import('./components/suppliers/suppliers.routes')
      },
      {
        path: 'employees',
        loadChildren: () => import('./components/employees/employees.routes')
      },
      {
        path: 'products',
        loadChildren: () => import('./components/products/products.routes')
      },
      {
        path: 'categories',
        loadChildren: () => import('./components/categories/categories.routes')
      },
      {
        path: 'store',
        loadChildren: () => import('./components/store/enterprise.routes')
      },
      {
        path: 'orders',
        loadChildren: () => import('./components/orders/orders.routes')
      },
      {
        path: 'merchandise',
        loadChildren: () => import('./components/merchandise/merchandise.routes')
      },
      {
        path: 'inventory',
        loadChildren: () => import('./components/inventory/inventory.routes')
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/notifications/notifications.component')
      },
      {
        path:'change-password',
        loadComponent: () => import('../auth/features/change-password/change-password.component')
      },
      {
        path: '',
        redirectTo: 'dashboard', // Redirigir a 'user' por defecto
        pathMatch: 'full',
      },
    ],
  },
] as Routes;