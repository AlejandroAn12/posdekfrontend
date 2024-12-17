import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./view-users/view-users.component'),
  },
//   {
//     path: 'create',
//     loadComponent: () =>
//       import('./view-users/view-users.component'),
//   },
] as Routes;