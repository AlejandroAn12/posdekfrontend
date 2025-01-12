import { Routes } from '@angular/router';

export default [
    {
        path: 'view',
        loadComponent: () =>
            import('./features/view-suppliers/view-suppliers.component'),
    },
] as Routes;