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
        path: 'clients',
        loadChildren: () => import('./features/clientPages/clients.routes')
      },
      {
        path: 'suppliers',
        loadChildren: () => import('./features/supplierPages/suppliers.routes')
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employeePages/employees.routes')
      },
      {
        path: 'products',
        loadChildren: () => import('./features/productsPages/products.routes')
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/categoriesPages/categories.routes')
      },
      {
        path: 'enterprise',
        loadChildren: () => import('./features/enterprisePages/enterprise.routes')
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/ordersPages/orders.routes')
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