import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/features/navbar/navbar.component";

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent {

}
