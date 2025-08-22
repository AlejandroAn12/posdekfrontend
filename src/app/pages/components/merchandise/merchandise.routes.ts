import { Routes } from '@angular/router';

export default [
    {
        path: 'entry',
        loadComponent: () =>
            import('./features/entry-form/entry-form.component'),
    }

] as Routes;