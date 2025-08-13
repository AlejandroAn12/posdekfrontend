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



  //  toggleSidebar() {
  //     this.isSidebarCollapsed = !this.isSidebarCollapsed;
  //     this.collapsedChange.emit(this.isSidebarCollapsed);
  //   }


  sidebarOptions: SidebarOption[] = [
    {
      title: 'Dashboard',
      iconClass: 'fa-brands fa-usps',
      route: '/index/dashboard',
    },

    {
      title: 'Administración',
      iconClass: 'fa-solid fa-user-gear',
      children: [
        { title: 'Gestionar usuarios', iconClass: 'fa-solid fa-user-tie', route: '/index/credentials' },
        { title: 'Gestionar colaboradores', iconClass: 'fa-solid fa-users', route: '/index/employees' },
      ],
    },

    {
      title: 'Proveedores',
      iconClass: 'fa-solid fa-truck-moving',
      children: [
        { title: 'Nuevo proveedor', iconClass: 'fa-solid fa-truck', route: '/index/suppliers/form' },
        { title: 'Lista de proveedores', iconClass: 'fa-solid fa-truck-fast', route: '/index/suppliers/view' },
      ],
    },

    {
      title: 'Categorias',
      iconClass: 'fa-solid fa-tags',
      children: [
        // { title: 'Nueva categoria', iconClass: 'fa-solid fa-tag', route: '/index/categories/form' },
        { title: 'Lista de categorias', iconClass: 'fa-solid fa-tags', route: '/index/categories/view' },
      ],
    },

    {
      title: 'Productos',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Nuevo producto', iconClass: 'fa-solid fa-box', route: '/index/products/form' },
        { title: 'Lista de productos', iconClass: 'fa-solid fa-boxes', route: '/index/products/view' },
        { title: 'Movimiento de productos', iconClass: 'fa-solid fa-folder', route: '/index/products/movements' },
      ],
    },
    {
      title: 'Inventario',
      iconClass: 'fa-solid fa-boxes-stacked',
      children: [
        { title: 'Realizar inventario', iconClass: 'fa-solid fa-clipboard', route: '/index/merchandise/inventory' },
        { title: 'Ajuste de stock', iconClass: 'fa-solid fa-boxes-stacked', route: '/index/merchandise/adjustment' },
        { title: 'Historial de inventario', iconClass: 'fa-solid fa-clock-rotate-left', route: '/index/merchandise/history-inventories' },
        { title: 'Ajustes de stock', iconClass: 'fa-solid fa-clock-rotate-left', route: '/index/merchandise/history-inventories' },

      ],
    },
    {
      title: 'Compras',
      iconClass: 'fa-solid fa-cart-shopping',
      children: [
        { title: 'Generar orden', iconClass: 'fa-solid fa-cart-shopping', route: '/index/orders/generate' },
        { title: 'Ordenes pendientes', iconClass: 'fa-solid fa-clock', route: '/index/orders/pending' },
        { title: 'Historial de ordenes', iconClass: 'fa-solid fa-clock-rotate-left', route: '/index/orders/history' }

      ]
    },

    {
      title: 'Facturas',
      iconClass: 'fa-solid fa-file-invoice',
      children: [
        { title: 'Ver facturas', iconClass: 'fa-solid fa-file-invoice', route: '/index/invoices' },
        { title: 'Ver notas de venta', iconClass: 'fa-solid fa-file-invoice', route: '/index/invoices' },
        { title: 'Registro de compra', iconClass: 'fa-solid fa-cart-plus', route: '/index/invoices/purchase-invoice' },
        
      ]
    },
    {
      title: 'Ingresar mercadería',
      iconClass: 'fa-solid fa-dolly',
      route: '/index/merchandise/entry',
    },

    {
      title: 'Configuraciones',
      iconClass: 'fa-solid fa-gears',
      children: [
        { title: 'Información de tienda', iconClass: 'fa-solid fa-store', route: '/index/enterprise' },
        { title: 'Configuración general', iconClass: 'fa-solid fa-circle-info', route: '/index/enterprise/settings' },
        { title: 'Cambiar contraseña', iconClass: 'fa-solid fa-lock', route: '/index/change-password' },
        // { title: 'Configuración de inventario', iconClass: 'fa-solid fa-boxes-stacked', route: '/index/inventory/settings' },
      ]
    }
    // {
    //   title: 'Reportes',
    //   iconClass: 'fa-solid fa-folder',
    //   children: [
    //     { title: 'Reporte de compras', iconClass: 'fa-solid fa-cart-shopping', route: '/index/orders/history' }
    //   ],
    // }
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
