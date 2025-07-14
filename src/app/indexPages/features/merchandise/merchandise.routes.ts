import { Routes } from '@angular/router';

export default [
    {
        path: 'entry',
        loadComponent: () =>
            import('./features/entry-form/entry-form.component'),
    },
    {
        path: 'adjustment',
        loadComponent: () => import('./features/adjustment/adjustment.component'),
    },
    {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory.component'),
    },
    {
        path: 'history-inventories',
        loadComponent: () =>
            import('./features/history-inventory/history-inventory.component'),
    },
    {
        path: 'entry-inventory/:id',
        loadComponent: () =>
            import('./features/inventory-entry/inventory-entry.component'),
    },
    {
        path: 'movements-products',
        loadComponent: () =>
            import('./features/movements-products/movements-products.component'),
    }

] as Routes;