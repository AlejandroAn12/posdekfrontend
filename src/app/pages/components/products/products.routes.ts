import { Routes } from '@angular/router';

export default [
    {
        path: 'view',
        loadComponent: () =>
            import('./features/view-products/view-products.component'),
    },
    {
        path:'list',
        loadComponent: () => 
            import('./features/products-list/products-list.component')
    },
    {
        path: 'form',
        loadComponent: () => import('./features/form-product/form-product.component'),
    },
    {
        path: 'movements',
        loadComponent: () => import('./features/movements-products/movements-products.component')
    }
] as Routes;