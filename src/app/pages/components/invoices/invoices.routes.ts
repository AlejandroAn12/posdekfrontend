import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./features/view-invoices/view-invoices.component'),
    },
    {
        path: 'purchase-invoice',
        loadComponent: () => import('./features/purchase-invoice/purchase-invoice.component')
    },
    {
        path: 'sales',
        loadComponent: () => import('./features/invoices-pos/invoices-pos.component')
    }
] as Routes;