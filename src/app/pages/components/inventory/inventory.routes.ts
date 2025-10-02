import { Routes } from '@angular/router';

export default [
    {
        path: 'entry',
        loadComponent: () =>
            import('./pages/inventory-entry/inventory-entry.component'),
    },
    {
        path: 'adjustment',
        loadComponent: () => import('./pages/adjustment/adjustment.component'),
    },
    {
        path: 'generate',
        loadComponent: () => import('./pages/inventory/inventory.component'),
    },
    {
        path: 'history-inventories',
        loadComponent: () =>
            import('./pages/history-inventory/history-inventory.component'),
    },
    {
        path: 'entry-inventory/:id',
        loadComponent: () =>
            import('./pages/inventory-entry/inventory-entry.component'),
    },
    {
        path: 'movements-products',
        loadComponent: () =>
            import('./pages/movements-products/movements-products.component'),
    }

] as Routes;