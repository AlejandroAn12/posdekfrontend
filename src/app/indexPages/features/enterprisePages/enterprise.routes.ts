import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./features/enterprise-information/enterprise-information.component'),
    },
] as Routes;