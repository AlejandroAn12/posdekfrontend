import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/features/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { HeaderComponent } from "../shared/features/header/header.component";

@Component({
  selector: 'app-indexPages',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
  templateUrl: './indexPages.component.html',
})

export default class IndexPagesComponent {
  isSidebarVisible = true;
  isSidebarCollapsed = false;



  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
