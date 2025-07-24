import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
      route: '/index/dashboard',
    },

    {
      title: 'Administración',
      iconClass: 'fa-solid fa-user-gear',
      children: [
        { title: 'Gestionar usuarios', iconClass: 'fa-solid fa-user-tie', route: '/index/users' },
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
        { title: 'Movimiento de productos', iconClass: 'fa-solid fa-folder', route: '/index/merchandise/movements-products' },
      ],
    },
    {
      title: 'Inventario',
      iconClass: 'fa-solid fa-boxes-stacked',
      children: [
        { title: 'Realizar inventario', iconClass: 'fa-solid fa-clipboard', route: '/index/merchandise/inventory' },
        { title: 'Ajuste de inventario', iconClass: 'fa-solid fa-boxes-stacked', route: '/index/merchandise/adjustment' },
        { title: 'Historial de inventario', iconClass: 'fa-solid fa-clock-rotate-left', route: '/index/merchandise/history-inventories' },
      ],
    },
    {
      title: 'Compras',
      iconClass: 'fa-solid fa-cart-shopping',
      children: [
        { title: 'Ingresar orden', iconClass: 'fa-solid fa-cart-plus', route: '/index/orders/generate' },
        { title: 'Generar orden', iconClass: 'fa-solid fa-cart-shopping', route: '/index/orders/generate' },
        { title: 'Ordenes pendientes', iconClass: 'fa-solid fa-clock', route: '/index/orders/pending' },
        { title: 'Historial de ordenes', iconClass: 'fa-solid fa-clock-rotate-left', route: '/index/orders/history' }

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
        { title: 'Configuración de tienda', iconClass: 'fa-solid fa-store', route: '/index/enterprise' },
        { title: 'Configuración de impuestos', iconClass: 'fa-solid fa-circle-info', route: '/index/enterprise/settings' },
        { title: 'Cambiar contraseña', iconClass: 'fa-solid fa-lock', route: '/index/modules/settings' },
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
