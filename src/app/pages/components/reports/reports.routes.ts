import { Routes } from '@angular/router';

export default [
    {
        path: 'sales',
        loadComponent: () =>
            import('./features/sales-reports/sales-reports.component'),
    },
] as Routes;