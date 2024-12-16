import { Routes } from '@angular/router';

export default [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
  },
  // {
  //   path: 'sign-up',
  //   loadComponent: () => import('./sign-up/sign-up.component'),
  // },
] as Routes;