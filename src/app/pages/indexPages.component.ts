import { Component, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarComponent } from '../shared/features/sidebar/sidebar.component';
import { ThemeService } from '../core/services/theme.service';
import { SidebarStateService } from '../core/services/sidebar-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-indexPages',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-in-out', 
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', 
          style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './indexPages.component.html',
  styleUrls: []
})
export default class IndexPagesComponent implements OnInit {
   // Servicios
  private themeService = inject(ThemeService);
  private sidebarStateService = inject(SidebarStateService);

  // Estados del componente
  isSidebarVisible = true;
  isSidebarCollapsed = false;
  isDarkMode = false;
  isMobileView = false;
  today: Date = new Date();

  // Suscripción
  private sidebarSubscription: Subscription | null = null;

  // Intervalo para actualizar la hora
  private timeInterval: any;

  ngOnInit(): void {
    this.checkDarkMode();
    this.checkScreenSize();
    this.startTimeUpdate();
    
    // Suscribirse a los cambios del estado del sidebar
    this.sidebarSubscription = this.sidebarStateService.isCollapsed$.subscribe(
      isCollapsed => {
        this.isSidebarCollapsed = isCollapsed;
      }
    );
    
    // En móviles, empezar con el sidebar oculto
    if (this.isMobileView) {
      this.isSidebarVisible = false;
    }
  }

  ngOnDestroy(): void {
    // Limpiar intervalo al destruir el componente
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    
    // Cancelar suscripción
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  // Verificar el modo oscuro actual
  private checkDarkMode(): void {
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  // Verificar el tamaño de la pantalla
  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint
  }

  // Verificar si es móvil
  isMobile(): boolean {
    return this.isMobileView;
  }

  // Actualizar la hora cada minuto
  private startTimeUpdate(): void {
    this.timeInterval = setInterval(() => {
      this.today = new Date();
    }, 60000); // Actualizar cada minuto
  }

  // Alternar tema claro/oscuro
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
    this.isDarkMode = !this.isDarkMode;
    
    // Mostrar feedback visual del cambio
    this.showThemeChangeFeedback();
  }

  // Mostrar feedback del cambio de tema
  private showThemeChangeFeedback(): void {
    const theme = this.isDarkMode ? 'oscuro' : 'claro';
    console.log(`Modo ${theme} activado`);
    
    // Podrías agregar aquí una notificación toast si lo deseas
  }
}