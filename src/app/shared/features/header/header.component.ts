import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() isUpdate?: boolean;

  isSidebarVisible = true;
  isSidebarCollapsed = false;



  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
