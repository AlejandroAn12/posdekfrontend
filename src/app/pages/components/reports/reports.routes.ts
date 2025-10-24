import { Routes } from '@angular/router';

export default [
    {
        path: 'sales',
        loadComponent: () =>
            import('./features/sales-reports/sales-reports.component'),
    },
    {
        path: 'sales-by-employee',
        loadComponent: () =>
            import('./features/sales-by-employees/sales-by-employees.component'),
    },
    {
        path: 'kpi',
        loadComponent: () => 
            import('./features/kpi/kpi.component')
    }
] as Routes;