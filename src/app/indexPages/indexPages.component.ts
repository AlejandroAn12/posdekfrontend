import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/features/sidebar/sidebar.component';

@Component({
  selector: 'app-indexPages',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './indexPages.component.html',
})
export default class NavbarComponent {

}
