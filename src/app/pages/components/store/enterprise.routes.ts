import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./features/enterprise-information/enterprise-information.component'),
    },
    {
        path: 'settings',
        loadComponent: () =>
            import('./features/initial-settings/initial-settings.component'),
    },
] as Routes;