import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./features/view-employees/view-employees.component'),
    },
    {
        path: 'form',
        loadComponent: () =>
            import('./features/form-employee/form-employee.component'),
    }
] as Routes;