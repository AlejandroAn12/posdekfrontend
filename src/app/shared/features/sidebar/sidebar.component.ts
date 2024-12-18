import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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

  sidebarOptions: SidebarOption[] = [
    {
      title: 'Dashboard',
      iconClass: 'fa-solid fa-store',
      route: '/index/dashboard',
    },
    {
      title: 'Usuarios',
      iconClass: 'fa-solid fa-user',
      children: [
        { title: 'Administradores', iconClass: 'fa-solid fa-user-tie', route: '/user/admins' },
        { title: 'Clientes', iconClass: 'fa-solid fa-users', route: '/user/client' },
      ],
    },
    {
      title: 'Productos',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Ver productos', iconClass: 'fa-solid fa-box', route: '/products/all' },
        { title: 'Categorías', iconClass: 'fa-solid fa-tags', route: '/products/categories' },
      ],
    },
    {
      title: 'Administración',
      iconClass: 'fa-solid fa-gear',
      children: [
        { title: 'Empresa', iconClass: 'fa-solid fa-store', route: 'enterprise' },
        { title: 'Notificaciones', iconClass: 'fa-regular fa-bell', route: 'notifications' },

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
        { title: 'Categorías', iconClass: 'fa-solid fa-tags', route: '/products/categories' },
        { title: 'Productos', iconClass: 'fa-solid fa-box', route: '/products/all' }
      ],
    },
  ];

  // Estado para controlar el despliegue del submenú
  activeIndex: number | null = null;

  toggleSubmenu(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  logout() { }

  goWhatsApp() { }

}
