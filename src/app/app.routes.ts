import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/features/auth.routes')
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes')
    },
    {
        path: '**',
        loadComponent: () => import('./shared/features/not-found-page/not-found-page.component')
    },

];
