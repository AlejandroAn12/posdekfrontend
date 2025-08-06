import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'index/dashboard',
        pathMatch: 'full',
    },
    {
        path: 'auth',
        canActivate: [publicGuard()],
        loadChildren: () => import('./auth/features/auth.routes')
    },
    {
        path: 'privacy-policy',
        canActivate: [publicGuard()],
        loadComponent: () => import('./shared/features/components/privacy-policy/privacy-policy.component')
    },
    {
        path: 'terms',
        canActivate: [publicGuard()],
        loadComponent: () => import('./shared/features/components/terms/terms.component')
    },
    {
        path: 'index',
        canMatch: [privateGuard()],
        loadChildren: () => import('./indexPages/indexPages.routes')
    },
    {
        path:'server-error',
        loadComponent: () => import('./shared/features/server-error-page/server-error-page.component')
    },
    {
        path: '**',
        loadComponent: () => import('./shared/features/not-found-page/not-found-page.component')
    },


];
