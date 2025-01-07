import { Routes } from '@angular/router';

export default [
    {
        path: 'view',
        loadComponent: () =>
            import('./features/view-categories/view-categories.component'),
    },
] as Routes;