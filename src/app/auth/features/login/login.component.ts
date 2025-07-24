import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth.service.ts.service';
import { FormBuilder, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ILogin } from '../../interfaces/login.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FooterComponent } from "../../../shared/features/footer/footer.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, FooterComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {

  loginForm: FormGroup;

  isDarkMode: boolean = false;

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  _router = inject(Router);

  constructor() {
    this.isDarkMode = document.documentElement.classList.contains('dark');

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const loginData: ILogin = this.loginForm.value;
      this.authService.login(loginData).subscribe({
        next: () => this._router.navigateByUrl('index/dashboard'),
        error: (err) => {
          if (err.error.statusCode === 403 && err.error.errorCode === 'LOGIN_INACTIVE_USER') {
            Swal.fire({
              icon: 'error',
              title: 'Usuario inactivo',
              text: `${err.error.message}`,
              confirmButtonText: 'Entendido'
            });
          }

          if (err.error.statusCode === 400 && err.error.errorCode === 'USER_INVALID') {
            Swal.fire({
              icon: 'error',
              title: 'Acceso inválido',
              text: `${err.error.message}`,
              confirmButtonText: 'Entendido'
            });
          }

          if (err.error.statusCode === 401 && err.error.errorCode === 'CREDENTIALS_INCORRECT') {
            Swal.fire({
              icon: 'error',
              title: 'Error de autenticación',
              text: `${err.error.message}`,
              confirmButtonText: 'Entendido'
            });
          }

          if (err.status === 0) {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              text: 'No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet.',
              confirmButtonText: 'Entendido'
            });
          }

          if (err.status === 500) {
            Swal.fire({
              icon: 'error',
              title: 'Error del servidor',
              text: 'El servidor no está disponible en este momento. Por favor, inténtalo más tarde.',
              confirmButtonText: 'Entendido'
            });
          }
        },
      });
    }
    return;
  }

}
