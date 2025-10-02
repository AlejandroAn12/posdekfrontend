import { Component, HostListener, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


import { SIDEBAR_OPTIONS, SidebarOption } from './interfaces/sidebar-options';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Estado reactivo
  isDarkMode = false;
  isSidebarCollapsed = false;
  activeIndex: number | null = null;
  isMobileView = false;

  // Menú
  sidebarOptions: SidebarOption[] = SIDEBAR_OPTIONS;

  // Inyecciones
  private authState = inject(AuthStateService);
  private themeService = inject(ThemeService);
  private sidebarStateService = inject(SidebarStateService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Estado del tema
    this.themeService.isDarkMode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isDark => (this.isDarkMode = isDark));

    this.checkScreenSize();

    if (this.isMobileView) {
      this.setSidebarCollapsed(true);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  // --- Métodos privados ---
  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024; // breakpoint lg
  }

  private setSidebarCollapsed(value: boolean): void {
    this.isSidebarCollapsed = value;
    this.sidebarStateService.setCollapsedState(value);

    if (value) this.activeIndex = null; // cerrar submenús
  }

  // --- Métodos públicos (para template) ---
  toggleSidebar(): void {
    this.setSidebarCollapsed(!this.isSidebarCollapsed);
  }

  toggleSubmenu(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  logout(): void {
    this.authState.logOut();
  }

  navigateAndCollapse(route: string): void {
    this.router.navigate([route]);
    if (this.isMobileView) {
      this.setSidebarCollapsed(true);
    }
  }
}
