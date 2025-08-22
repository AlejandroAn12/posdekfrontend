import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ThemeService } from '../../../core/services/theme.service';

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

  isDarkMode = false;
  isSidebarCollapsed = false;

  constructor(private themeService: ThemeService) {
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
    this.isDarkMode = !this.isDarkMode;
  }

  sidebarOptions: SidebarOption[] = [
    {
      title: 'Dashboard',
      iconClass: 'fa-brands fa-usps',
      route: '/admin/dashboard',
    },

    {
      title: 'Administración',
      iconClass: 'fa-solid fa-user-gear',
      children: [
        { title: 'Gestionar usuarios', iconClass: 'fa-solid fa-user-tie', route: '/admin/credentials' },
        { title: 'Gestionar colaboradores', iconClass: 'fa-solid fa-users', route: '/admin/employees' },
      ],
    },

    {
      title: 'Proveedores',
      iconClass: 'fa-solid fa-truck-moving',
      children: [
        { title: 'Nuevo proveedor', iconClass: 'fa-solid fa-truck', route: '/admin/suppliers/form' },
        { title: 'Lista de proveedores', iconClass: 'fa-solid fa-truck-fast', route: '/admin/suppliers/view' },
      ],
    },

    {
      title: 'Categorias',
      iconClass: 'fa-solid fa-tags',
      children: [
        // { title: 'Nueva categoria', iconClass: 'fa-solid fa-tag', route: '/admin/categories/form' },
        { title: 'Lista de categorias', iconClass: 'fa-solid fa-tags', route: '/admin/categories/view' },
      ],
    },

    {
      title: 'Productos',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Nuevo producto', iconClass: 'fa-solid fa-box', route: '/admin/products/form' },
        { title: 'Lista de productos', iconClass: 'fa-solid fa-boxes', route: '/admin/products/view' },
        { title: 'Movimiento de productos', iconClass: 'fa-solid fa-folder', route: '/admin/products/movements' },
      ],
    },
    {
      title: 'Inventario',
      iconClass: 'fa-solid fa-boxes-stacked',
      children: [
        { title: 'Realizar inventario', iconClass: 'fa-solid fa-clipboard', route: '/admin/inventory/inventory' },
        { title: 'Ajuste de stock', iconClass: 'fa-solid fa-boxes-stacked', route: '/admin/inventory/adjustment' },
        { title: 'Historial de inventario', iconClass: 'fa-solid fa-clock-rotate-left', route: '/admin/inventory/history-inventories' },
        { title: 'Ajustes de stock', iconClass: 'fa-solid fa-clock-rotate-left', route: '/admin/inventory/history-inventories' },

      ],
    },
    {
      title: 'Compras',
      iconClass: 'fa-solid fa-cart-shopping',
      children: [
        { title: 'Generar orden', iconClass: 'fa-solid fa-cart-shopping', route: '/admin/orders/generate' },
        { title: 'Ordenes pendientes', iconClass: 'fa-solid fa-clock', route: '/admin/orders/pending' },
        { title: 'Historial de ordenes', iconClass: 'fa-solid fa-clock-rotate-left', route: '/admin/orders/history' }

      ]
    },

    {
      title: 'Facturas',
      iconClass: 'fa-solid fa-file-invoice',
      children: [
        { title: 'Ver facturas', iconClass: 'fa-solid fa-file-invoice', route: '/admin/invoices' },
        { title: 'Ver notas de venta', iconClass: 'fa-solid fa-file-invoice', route: '/admin/invoices' },
        { title: 'Registro de compra', iconClass: 'fa-solid fa-cart-plus', route: '/admin/invoices/purchase-invoice' },
        
      ]
    },
    {
      title: 'Ingresar mercadería',
      iconClass: 'fa-solid fa-dolly',
      route: '/admin/merchandise/entry',
    },

    {
      title: 'Configuraciones',
      iconClass: 'fa-solid fa-gears',
      children: [
        { title: 'Información de tienda', iconClass: 'fa-solid fa-store', route: '/admin/enterprise' },
        { title: 'Configuración general', iconClass: 'fa-solid fa-circle-info', route: '/admin/enterprise/settings' },
        { title: 'Cambiar contraseña', iconClass: 'fa-solid fa-lock', route: '/admin/change-password' },
      ]
    }
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
