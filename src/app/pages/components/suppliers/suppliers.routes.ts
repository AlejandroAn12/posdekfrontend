import { Routes } from '@angular/router';

export default [
    {
        path: 'view',
        loadComponent: () =>
            import('./features/view-suppliers/view-suppliers.component'),
    },
    {
        path: 'form',
        loadComponent: () => import('./features/form-suppliers/form-suppliers.component'),
    }
] as Routes;