import { Routes } from '@angular/router';

export default [
    {
        path: 'form',
        loadComponent: () => import('./features/form-caja/form-caja.component'),
    }
] as Routes;