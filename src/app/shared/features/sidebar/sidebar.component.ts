import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

interface SidebarOption {
  title: string;
  iconClass: string;
  route?: string; // Ruta principal
  children?: SidebarOption[]; // Subopciones (opcional)
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {

  authState = inject(AuthStateService);

  sidebarOptions: SidebarOption[] = [
    {
      title: 'Dashboard',
      iconClass: 'fa-solid fa-store',
      route: '/index/dashboard',
    },
    {
      title: 'Productos',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Ver productos', iconClass: 'fa-solid fa-box', route: '/index/products/view' },
        { title: 'Categorías', iconClass: 'fa-solid fa-tags', route: '/index/categories/view' },
      ],
    },
    {
      title: 'Administración',
      iconClass: 'fa-solid fa-gear',
      children: [
        { title: 'Empresa', iconClass: 'fa-solid fa-store', route: 'enterprise' },
        { title: 'Credenciales de acceso', iconClass: 'fa-solid fa-user-tie', route: '/index/users/credentials' },
        { title: 'Clientes', iconClass: 'fa-solid fa-users', route: '/user/client' },
        { title: 'Empleados', iconClass: 'fa-solid fa-users', route: '/user/client' },

        
      ],
    },
    {
      title: 'Órdenes',
      iconClass: 'fa-solid fa-receipt',
      route: 'notifications',
    },
    {
      title: 'Reportes',
      iconClass: 'fa-solid fa-folder',
      children: [
        { title: 'Inventario', iconClass: 'fa-solid fa-warehouse', route: '/products/inventory' },
        { title: 'Historial movimientos', iconClass: 'fa-solid fa-tags', route: '/products/categories' },
        { title: 'Productos', iconClass: 'fa-solid fa-box', route: '/products/all' }
      ],
    },
    {
      title: 'Centro de notificaciones',
      iconClass: 'fa-regular fa-bell',
      route: 'notifications',
    },
    // {
    //   title: 'Usuarios',
    //   iconClass: 'fa-solid fa-user',
    //   children: [
        
    //   ],
    // },
  ];

  // Estado para controlar el despliegue del submenú
  activeIndex: number | null = null;
  
  toggleSubmenu(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
  
  logout() {
    this.authState.logOut();
   }
   
   whatsApp() { }
   
  }
  