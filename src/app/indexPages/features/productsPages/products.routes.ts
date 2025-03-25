import { Routes } from '@angular/router';

export default [
    {
        path: 'view',
        loadComponent: () =>
            import('./features/view-products/view-products.component'),
    },
    {
        path: 'form',
        loadComponent: () => import('./features/form-product/form-product.component'),
    }
] as Routes;