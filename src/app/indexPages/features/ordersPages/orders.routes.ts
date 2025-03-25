import { Routes } from '@angular/router';

export default [
    {
        path: 'view',
        loadComponent: () =>
            import('./features/view-orders/view-orders.component'),
    },
    {
        path: 'history',
        loadComponent: () =>
            import('./features/orders-history/orders-history.component'),
    },
] as Routes;