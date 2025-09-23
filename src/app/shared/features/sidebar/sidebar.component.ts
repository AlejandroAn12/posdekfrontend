import { Component, OnInit, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';


interface SidebarOption {
  title: string;
  iconClass: string;
  route?: string;
  children?: SidebarOption[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Servicios
  private authState = inject(AuthStateService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private sidebarStateService = inject(SidebarStateService);

  // Estados del componente
  isDarkMode = false;
  isSidebarCollapsed = false;
  activeIndex: number | null = null;
  isMobileView = false;

  // Menu del sidebar
  sidebarOptions: SidebarOption[] = [
    {
      title: 'Dashboard',
      iconClass: 'fa-solid fa-chart-pie',
      route: '/admin/dashboard',
    },
    {
      title: 'Administración',
      iconClass: 'fa-solid fa-user-gear',
      children: [
        { title: 'Gestionar credenciales', iconClass: 'fa-solid fa-user-tie', route: '/admin/credentials' },
        { title: 'Gestionar colaboradores', iconClass: 'fa-solid fa-users', route: '/admin/employees' },
      ],
    },
    {
      title: 'Proveedores',
      iconClass: 'fa-solid fa-truck',
      children: [
        { title: 'Nuevo proveedor', iconClass: 'fa-solid fa-plus-circle', route: '/admin/suppliers/form' },
        { title: 'Lista de proveedores', iconClass: 'fa-solid fa-list', route: '/admin/suppliers/view' },
      ],
    },
    {
      title: 'Categorías',
      iconClass: 'fa-solid fa-tags',
      children: [
        { title: 'Lista de categorías', iconClass: 'fa-solid fa-list', route: '/admin/categories/view' },
      ],
    },
    {
      title: 'Productos',
      iconClass: 'fa-solid fa-box',
      children: [
        { title: 'Nuevo producto', iconClass: 'fa-solid fa-plus-circle', route: '/admin/products/form' },
        { title: 'Lista de productos', iconClass: 'fa-solid fa-list', route: '/admin/products/view' },
        { title: 'Movimiento de productos', iconClass: 'fa-solid fa-arrows-rotate', route: '/admin/products/movements' },
      ],
    },
    {
      title: 'Inventario',
      iconClass: 'fa-solid fa-boxes-stacked',
      children: [
        { title: 'Realizar inventario', iconClass: 'fa-solid fa-clipboard-list', route: '/admin/inventory/inventory' },
        { title: 'Ajuste de stock', iconClass: 'fa-solid fa-sliders', route: '/admin/inventory/adjustment' },
        { title: 'Historial de inventario', iconClass: 'fa-solid fa-history', route: '/admin/inventory/history-inventories' },
      ],
    },
    {
      title: 'Compras',
      iconClass: 'fa-solid fa-cart-shopping',
      children: [
        { title: 'Registrar compra', iconClass: 'fa-solid fa-cart-plus', route: '/admin/invoices/purchase-invoice' },
      ]
    },
    {
      title: 'Facturas',
      iconClass: 'fa-solid fa-file-invoice',
      children: [
        { title: 'Ver facturas', iconClass: 'fa-solid fa-list', route: '/admin/invoices' },
        { title: 'Comprobantes de venta', iconClass: 'fa-solid fa-receipt', route: '/admin/invoices/sales' },
      ]
    },
    {
      title: 'Ingreso mercadería',
      iconClass: 'fa-solid fa-dolly',
      route: '/admin/merchandise/entry',
    },
    {
      title: 'Configuraciones',
      iconClass: 'fa-solid fa-gears',
      children: [
        { title: 'Información de tienda', iconClass: 'fa-solid fa-store', route: '/admin/store' },
        { title: 'Configuración general', iconClass: 'fa-solid fa-sliders', route: '/admin/store/settings' },
        { title: 'Cambiar contraseña', iconClass: 'fa-solid fa-lock', route: '/admin/change-password' },
      ]
    }
  ];

  ngOnInit(): void {
    this.checkDarkMode();
    this.checkScreenSize();

    // Colapsar sidebar automáticamente en móviles
    if (this.isMobileView) {
      this.isSidebarCollapsed = true;
      this.sidebarStateService.setCollapsedState(true);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  // Verificar modo oscuro
  private checkDarkMode(): void {
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  // Verificar tamaño de pantalla
  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint
  }

  // Verificar si es móvil
  isMobile(): boolean {
    return this.isMobileView;
  }

  // Alternar sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    // Notificar al servicio el cambio de estado
    this.sidebarStateService.setCollapsedState(this.isSidebarCollapsed);

    // Cerrar submenús al colapsar
    if (this.isSidebarCollapsed) {
      this.activeIndex = null;
    }
  }

  // Alternar submenú
  toggleSubmenu(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  // Cerrar sesión
  logout(): void {
    this.authState.logOut();
  }

  // Navegar y colapsar sidebar en móviles
  navigateAndCollapse(route: string): void {
    this.router.navigate([route]);
    if (this.isMobileView) {
      this.isSidebarCollapsed = true;
      this.sidebarStateService.setCollapsedState(true);
    }
  }
}