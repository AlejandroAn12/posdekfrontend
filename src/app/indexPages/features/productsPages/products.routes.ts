import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./features/view-products/view-products.component'),
    },
] as Routes;