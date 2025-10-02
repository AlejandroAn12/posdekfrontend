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
  isDarkMode: boolean = false;
  isMobileView = false;
  today: Date = new Date();

  // Suscripción
  private sidebarSubscription: Subscription | null = null;

  // Intervalo para actualizar la hora
  private timeInterval: any;

  constructor() {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });

    this.checkScreenSize();
    this.startTimeUpdate();

    this.sidebarSubscription = this.sidebarStateService.isCollapsed$.subscribe(
      isCollapsed => this.isSidebarCollapsed = isCollapsed
    );

    if (this.isMobileView) this.isSidebarVisible = false;
  }

  // Actualizar la hora cada minuto
  private startTimeUpdate(): void {
    const update = () => {
      this.today = new Date();
      const msToNextMinute = 60000 - (this.today.getSeconds() * 1000 + this.today.getMilliseconds());
      this.timeInterval = setTimeout(update, msToNextMinute);
    };
    update();
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
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  // Verificar el tamaño de la pantalla
  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint
  }

  // Verificar si es móvil
  isMobile(): boolean {
    return this.isMobileView;
  }

}