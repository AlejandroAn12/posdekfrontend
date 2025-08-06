import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error-page',
  imports: [],
  templateUrl: './server-error-page.component.html',
  styleUrl: './server-error-page.component.css'
})
export default class ServerErrorPageComponent {

  private router = inject(Router);

  retry(){
    window.location.reload();
  }
}
