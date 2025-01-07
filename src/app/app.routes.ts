import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './shared/guards/auth.guard';

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
        path: 'index',
        canActivate: [privateGuard()],
        loadChildren: () => import('./indexPages/indexPages.routes')
    },
    {
        path: '**',
        loadComponent: () => import('./shared/features/not-found-page/not-found-page.component')
    },


];
