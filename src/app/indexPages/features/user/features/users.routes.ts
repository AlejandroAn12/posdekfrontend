import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./view-users/view-users.component'),
  },
  {
    path: 'form',
    loadComponent: 
    () => import('./form-user/form-user.component')
  }
//   {
//     path: 'create',
//     loadComponent: () =>
//       import('./view-users/view-users.component'),
//   },
] as Routes;