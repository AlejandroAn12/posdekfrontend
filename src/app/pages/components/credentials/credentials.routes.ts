import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./features/view-credentials/view-users.component'),
  },
  {
    path: 'form',
    loadComponent: 
    () => import('./features/form-credentials/form-user.component')
  }
//   {
//     path: 'create',
//     loadComponent: () =>
//       import('./view-users/view-users.component'),
//   },
] as Routes;