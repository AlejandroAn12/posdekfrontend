import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/features/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indexPages',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './indexPages.component.html',
})
export default class IndexPagesComponent {
 isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

}
