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
      route: '/dashboard',
    },
    {
      title: 'Usuarios',
      iconClass: 'fa-solid fa-user',
      children: [
        { title: 'Administradores', iconClass: 'fa-solid fa-user-tie', route: '/user/admins' },
        { title: 'Clientes', iconClass: 'fa-solid fa-users', route: '/user/clients' },
      ],
    },
    {
      title: 'Productos',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Inventario', iconClass: 'fa-solid fa-warehouse', route: '/products/inventory' },
        { title: 'Categorías', iconClass: 'fa-solid fa-tags', route: '/products/categories' },
      ],
    },
    {
      title: 'Administración',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Notificaciones', iconClass: 'fa-regular fa-bell', route: '/products/inventory' },
      ],
    },
    {
      title: 'Órdenes',
      iconClass: 'fa-solid fa-receipt',
      route: '/orders',
    },
  ];

  // Estado para controlar el despliegue del submenú
  activeIndex: number | null = null;

  toggleSubmenu(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

}
