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
      iconClass: 'fa-brands fa-usps',
      route: '/index/dashboard',
    },
    {
      title: 'Administración',
      iconClass: 'fa-solid fa-gear',
      children: [
        { title: 'Colaboradores', iconClass: 'fa-solid fa-users', route: '/index/employees/view' },
        { title: 'Credenciales de acceso', iconClass: 'fa-solid fa-user-tie', route: '/index/users/credentials' },
        
        
        
      ],
    },
    {
      title: 'Gestionar negocio',
      iconClass: 'fa-solid fa-store',
      children: [
        { title: 'Información del negocio', iconClass: 'fa-solid fa-store', route: '/index/enterprise' },
        { title: 'Configuración', iconClass: 'fa-solid fa-gear', route: '/index/enterprise/settings' },
        
        
        
      ],
    },
    {
      title: 'Gestionar inventario',
      iconClass: 'fa-solid fa-boxes-stacked',
      children: [
        { title: 'Proveedores', iconClass: 'fa-solid fa-truck', route: '/index/suppliers/view' },
        { title: 'Productos', iconClass: 'fa-solid fa-box', route: '/index/products/view' },
        { title: 'Categorias', iconClass: 'fa-solid fa-tags', route: '/index/categories/view' },
        { title: 'Compras', iconClass: 'fa-solid fa-cart-shopping', route: '/index/orders/view' },
        
        
        
      ],
    },
    {
      title: 'Reportes',
      iconClass: 'fa-solid fa-folder',
      children: [
        { title: 'Reporte de compras', iconClass: 'fa-solid fa-cart-shopping', route: '/index/orders/history' }
      ],
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
  